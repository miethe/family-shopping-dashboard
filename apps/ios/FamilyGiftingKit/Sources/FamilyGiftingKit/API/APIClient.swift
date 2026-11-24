import Foundation

public enum GiftSort: String, CaseIterable, Sendable {
    case recent
    case priceAscending = "price_asc"
    case priceDescending = "price_desc"
}

public actor APIClient {
    public private(set) var address: ServerAddress?
    private let transport: any HTTPTransport
    private let tokenStore: any TokenStore
    var sessionRevision = 0
    private var tokenRevoked = false
    private let nativeSessionsFor: ServerAddress?
    private var rotation: Task<SessionCredential, Error>?

    private var nativeSessionsEnabled: Bool {
        nativeSessionsFor != nil && nativeSessionsFor == address
    }

    public init(
        address: ServerAddress? = nil,
        transport: any HTTPTransport = URLSessionTransport(),
        tokenStore: any TokenStore = KeychainTokenStore(),
        nativeSessionsFor: ServerAddress? = nil
    ) {
        self.address = address
        self.transport = transport
        self.tokenStore = tokenStore
        self.nativeSessionsFor = nativeSessionsFor
    }

    public func setServerAddress(_ newAddress: ServerAddress) throws {
        guard address != newAddress else { return }
        try logout()
        address = newAddress
    }

    public func validateServerAddress(_ candidate: ServerAddress) async throws -> HealthResponse {
        let health: HealthResponse = try await request("/health", at: candidate, authenticated: false)
        guard health.status == "healthy", health.db == nil || health.db == "connected" else {
            throw APIError.unhealthyServer
        }
        return health
    }

    public func health() async throws -> HealthResponse {
        guard let address else { throw APIError.invalidServerAddress }
        return try await validateServerAddress(address)
    }

    /// Retained after local expiry so the app can identify its offline journal.
    public func savedCredential() throws -> SessionCredential? {
        guard !tokenRevoked, let address, let credential = try tokenStore.read(),
              !credential.accessToken.isEmpty else { return nil }
        guard credential.origin == nil || credential.origin == address.url else {
            try logout()
            return nil
        }
        return credential
    }

    public func sessionToken() throws -> SessionCredential? {
        guard let credential = try savedCredential(), credential.expiresAt > .now else { return nil }
        return credential
    }

    public func hasSession() throws -> Bool {
        try sessionToken() != nil
    }

    public func logout() throws {
        // Invalidate in-flight work even if the Keychain operation fails.
        sessionRevision += 1
        tokenRevoked = true
        rotation?.cancel()
        rotation = nil
        try tokenStore.clear()
    }

    public func signOut() async throws {
        let refresh = nativeSessionsEnabled ? try savedCredential()?.refreshToken : nil
        let origin = address
        try logout()
        if let refresh, let origin {
            let body = try WireFormat.encoder().encode(RefreshRequest(refreshToken: refresh))
            _ = try await send("/api/v1/auth/session/revoke", at: origin, method: "POST",
                               body: body, authenticated: false)
        }
    }

    public func revokeAllNativeSessions() async throws {
        guard nativeSessionsEnabled, try savedCredential()?.refreshToken != nil else {
            throw APIError.missingSession
        }
        let revision = sessionRevision
        _ = try await send("/api/v1/auth/sessions/revoke-all", method: "POST")
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        try logout()
    }

    public func login(email: String, password: String, diagnostic: Bool = false) async throws -> User {
        try await authenticate(credentials(email: email, password: password), diagnostic: diagnostic)
    }

    public func appleChallenge() async throws -> String {
        let revision = sessionRevision
        let response: AppleChallengeResponse = try await request(
            "/api/v1/auth/apple/challenge", method: "POST", authenticated: false
        )
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        guard !response.nonce.isEmpty else { throw APIError.invalidPayload }
        return response.nonce
    }

    public func loginWithApple(identityToken: String, nonce: String) async throws -> User {
        let body = try WireFormat.encoder().encode(AppleSignInRequest(identityToken: identityToken, nonce: nonce))
        return try await exchangeLogin(at: "/api/v1/auth/apple", body: body)
    }

    public func register(email: String, password: String) async throws -> User {
        let credentials = credentials(email: email, password: password)
        let revision = sessionRevision
        let response: LoginResponse = try await request(
            "/api/v1/auth/register", method: "POST", body: WireFormat.encoder().encode(credentials),
            authenticated: false
        )
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        if let token = response.token {
            try establishSession(token, response: response)
            return response.user
        }
        // A legacy registration response only includes the user. Register exactly once.
        return try await authenticate(credentials)
    }

    private func credentials(email: String, password: String) -> Credentials {
        Credentials(email: email, password: password, client: nativeSessionsEnabled ? "ios" : nil)
    }

    private func authenticate(_ credentials: Credentials, diagnostic: Bool = false) async throws -> User {
        try await exchangeLogin(at: "/api/v1/auth/login", body: WireFormat.encoder().encode(credentials), diagnostic: diagnostic)
    }

    private func exchangeLogin(at path: String, body: Data, diagnostic: Bool = false) async throws -> User {
        let revision = sessionRevision
        let response: LoginResponse = try await request(
            path, method: "POST", body: body, authenticated: false, diagnostic: diagnostic
        )
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        guard let token = response.token else { throw APIError.invalidPayload }
        try establishSession(token, response: response)
        return response.user
    }

    private func establishSession(_ token: TokenResponse, response: LoginResponse) throws {
        _ = try saveToken(token, userID: response.id,
                          refresh: nativeSessionsEnabled ? response.refreshToken : nil,
                          lifetime: response.refreshExpiresIn)
        sessionRevision += 1
        rotation?.cancel()
        rotation = nil
    }

    /// Used before authenticated work and on foreground. Legacy expiry never deletes the saved identity.
    public func usableSession() async throws -> SessionCredential? {
        guard let credential = try savedCredential() else { return nil }
        if credential.expiresAt > .now { return credential }
        guard nativeSessionsEnabled, credential.refreshToken != nil else { throw APIError.expiredSession }
        return try await rotate(credential)
    }

    public func refreshSession() async throws -> SessionCredential {
        if nativeSessionsEnabled, let credential = try savedCredential(), credential.refreshToken != nil {
            return try await rotate(credential)
        }
        let previous = try savedCredential()
        let revision = sessionRevision
        let token: TokenResponse = try await request("/api/v1/auth/refresh", method: "POST")
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        return try saveToken(token, userID: previous?.userID)
    }

    private func rotate(_ credential: SessionCredential) async throws -> SessionCredential {
        if let rotation { return try await rotation.value }
        guard let refresh = credential.refreshToken, credential.refreshExpiresAt.map({ $0 > .now }) == true else {
            throw APIError.expiredSession
        }
        let revision = sessionRevision
        let task = Task { try await rotate(refresh, credential: credential, revision: revision) }
        rotation = task
        defer { if revision == sessionRevision { rotation = nil } }
        return try await task.value
    }

    private func rotate(_ refresh: String, credential: SessionCredential, revision: Int) async throws -> SessionCredential {
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        let start = credential.refreshStartedAt ?? .now
        var pending = credential
        pending.refreshStartedAt = start
        try tokenStore.write(pending)
        let body = try WireFormat.encoder().encode(RefreshRequest(refreshToken: refresh))
        let token: TokenResponse
        do {
            token = try await sendRotation(body, startedAt: start)
        } catch let error as URLError {
            guard revision == sessionRevision else { throw APIError.sessionChanged }
            if requestWasNeverSent(error) && credential.refreshStartedAt == nil {
                try tokenStore.write(credential)
            }
            guard error.code == .timedOut || error.code == .networkConnectionLost,
                  Date.now.timeIntervalSince(start) < 25 else { throw error }
            let recovered = try await sendRotation(body, startedAt: start)
            return try finishRotation(recovered, credential: credential, revision: revision, start: start)
        }
        return try finishRotation(token, credential: credential, revision: revision, start: start)
    }

    private func sendRotation(_ body: Data, startedAt: Date) async throws -> TokenResponse {
        guard Date.now.timeIntervalSince(startedAt) < 25 else { throw APIError.expiredSession }
        do {
            return try await request("/api/v1/auth/session/refresh", method: "POST", body: body, authenticated: false)
        } catch let error as APIError where error.isUnauthorized {
            // The stored account still identifies the offline journal. A fresh login is required.
            if let saved = try savedCredential() {
                let expired = SessionCredential(accessToken: saved.accessToken, expiresAt: .distantPast,
                                                origin: saved.origin, userID: saved.userID)
                try tokenStore.write(expired)
            }
            throw APIError.expiredSession
        }
    }

    private func finishRotation(_ token: TokenResponse, credential: SessionCredential,
                                revision: Int, start: Date) throws -> SessionCredential {
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        guard let refresh = token.refreshToken, !refresh.isEmpty, let lifetime = token.refreshExpiresIn, lifetime > 0 else {
            throw APIError.invalidPayload
        }
        return try saveToken(token, userID: credential.userID, refresh: refresh, lifetime: lifetime, startingAt: start)
    }

    private func saveToken(_ token: TokenResponse, userID: Int?, refresh: String? = nil,
                           lifetime: Int? = nil, startingAt: Date = .now) throws -> SessionCredential {
        guard token.tokenType.lowercased() == "bearer", !token.accessToken.isEmpty, token.expiresIn > 0,
              refresh == nil || (refresh?.isEmpty == false && lifetime.map { $0 > 0 } == true) else {
            throw APIError.invalidPayload
        }
        let credential = SessionCredential(
            accessToken: token.accessToken,
            expiresAt: startingAt.addingTimeInterval(TimeInterval(token.expiresIn)),
            origin: address?.url, userID: userID, refreshToken: refresh,
            refreshExpiresAt: refresh == nil ? nil : lifetime.map { startingAt.addingTimeInterval(TimeInterval($0)) }
        )
        try tokenStore.write(credential)
        tokenRevoked = false
        return credential
    }

    public func me() async throws -> User {
        try await request("/api/v1/auth/me")
    }

    public func dashboard() async throws -> Dashboard {
        try await request("/api/v1/dashboard")
    }

    public func persons(cursor: Int? = nil, limit: Int = 50, groupId: Int? = nil) async throws -> Page<Person> {
        var query = pageQuery(cursor: cursor, limit: limit)
        if let groupId { query.append(URLQueryItem(name: "group_id", value: String(groupId))) }
        return try await request("/api/v1/persons", query: query)
    }

    public func person(id: Int) async throws -> Person {
        try await request("/api/v1/persons/\(id)")
    }

    public func groups(cursor: Int? = nil, limit: Int = 50) async throws -> Page<Group> {
        try await request("/api/v1/groups", query: pageQuery(cursor: cursor, limit: limit))
    }

    public func group(id: Int) async throws -> Group {
        try await request("/api/v1/groups/\(id)")
    }

    public func gifts(
        cursor: Int? = nil, limit: Int = 50, search: String? = nil, personIds: [Int] = [],
        statuses: [GiftStatus] = [], occasionIds: [Int] = [], listIds: [Int] = [], sort: GiftSort = .recent
    ) async throws -> Page<Gift> {
        var query = pageQuery(cursor: cursor, limit: limit)
        query.append(URLQueryItem(name: "sort", value: sort.rawValue))
        if let search { query.append(URLQueryItem(name: "search", value: search)) }
        query += personIds.map { URLQueryItem(name: "person_ids", value: String($0)) }
        query += statuses.map { URLQueryItem(name: "statuses", value: $0.rawValue) }
        query += occasionIds.map { URLQueryItem(name: "occasion_ids", value: String($0)) }
        query += listIds.map { URLQueryItem(name: "list_ids", value: String($0)) }
        return try await request("/api/v1/gifts", query: query)
    }

    public func gift(id: Int) async throws -> Gift {
        try await request("/api/v1/gifts/\(id)")
    }

    public func createGift(_ input: GiftCreate) async throws -> Gift {
        try await request("/api/v1/gifts", method: "POST", body: WireFormat.encoder().encode(input))
    }

    public func ideas(limit: Int = 10) async throws -> IdeaInbox {
        try await request("/api/v1/ideas/inbox", query: [URLQueryItem(name: "limit", value: String(limit))])
    }

    public func occasions(cursor: Int? = nil, limit: Int = 50) async throws -> Page<Occasion> {
        try await request("/api/v1/occasions", query: pageQuery(cursor: cursor, limit: limit))
    }

    public func occasion(id: Int) async throws -> Occasion {
        try await request("/api/v1/occasions/\(id)")
    }

    public func holidays() async throws -> [Holiday] {
        try await request("/api/v1/holidays")
    }

    public func activeTheme() async throws -> ActiveTheme {
        try await request("/api/v1/holidays/active-theme")
    }

    public func budget(occasionId: Int) async throws -> BudgetMeter {
        try await request("/api/v1/budgets/occasions/\(occasionId)/meter")
    }

    public func personBudget(personId: Int, occasionId: Int? = nil) async throws -> PersonBudget {
        let query = occasionId.map { [URLQueryItem(name: "occasion_id", value: String($0))] } ?? []
        return try await request("/api/v1/persons/\(personId)/budgets", query: query)
    }

    public func activity(limit: Int = 10) async throws -> ActivityFeed {
        try await request("/api/v1/activity", query: [URLQueryItem(name: "limit", value: String(limit))])
    }

    /// Read-only diagnostics preserve coding paths without exposing response contents.
    public func smokeRead<T: Decodable & Sendable>(_ path: String, as type: T.Type) async throws -> T {
        try await request(path, authenticated: path != "/health", diagnostic: true)
    }

    private func pageQuery(cursor: Int?, limit: Int) -> [URLQueryItem] {
        var query = [URLQueryItem(name: "limit", value: String(limit))]
        if let cursor { query.append(URLQueryItem(name: "cursor", value: String(cursor))) }
        return query
    }

    func request<T: Decodable>(
        _ path: String, at candidate: ServerAddress? = nil, method: String = "GET",
        query: [URLQueryItem] = [], body: Data? = nil, authenticated: Bool = true, contentType: String = "application/json", diagnostic: Bool = false
    ) async throws -> T {
        let response = try await send(path, at: candidate, method: method, query: query, body: body,
                                      authenticated: authenticated, contentType: contentType)
        do {
            return try WireFormat.decoder().decode(T.self, from: response.body)
        } catch let error as DecodingError {
            if diagnostic { throw error }
            throw APIError.invalidPayload
        }
    }

    private func send(
        _ path: String, at candidate: ServerAddress? = nil, method: String = "GET",
        query: [URLQueryItem] = [], body: Data? = nil, authenticated: Bool = true,
        contentType: String = "application/json"
    ) async throws -> HTTPResponse {
        guard let destination = candidate ?? address else { throw APIError.invalidServerAddress }
        let revision = sessionRevision
        let token = authenticated ? try await usableSession() : nil
        if authenticated && token == nil { throw APIError.missingSession }
        if candidate == nil, revision != sessionRevision { throw APIError.sessionChanged }
        var request = URLRequest(url: try destination.endpoint(path, query: query))
        request.httpMethod = method
        request.httpBody = body
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if body != nil { request.setValue(contentType, forHTTPHeaderField: "Content-Type") }
        if let token { request.setValue("Bearer \(token.accessToken)", forHTTPHeaderField: "Authorization") }
        let response = try await transport.send(request)
        if candidate == nil, revision != sessionRevision { throw APIError.sessionChanged }
        guard (200..<300).contains(response.statusCode) else {
            if let token, response.statusCode == 401 {
                guard try savedCredential()?.accessToken == token.accessToken else { throw APIError.sessionChanged }
                try? logout()
            }
            throw APIError.response(response)
        }
        return response
    }
}

private struct AppleChallengeResponse: Decodable {
    let nonce: String
}

private struct AppleSignInRequest: Encodable {
    let identityToken: String
    let nonce: String
}

private struct RefreshRequest: Encodable {
    let refreshToken: String
}

func requestWasNeverSent(_ error: URLError) -> Bool {
    [.notConnectedToInternet, .cannotFindHost, .cannotConnectToHost, .dnsLookupFailed].contains(error.code)
}
