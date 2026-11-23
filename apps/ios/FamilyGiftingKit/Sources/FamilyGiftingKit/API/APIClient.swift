import Foundation

public enum GiftSort: String, CaseIterable, Sendable {
    case recent
    case priceAscending = "price_asc"
    case priceDescending = "price_desc"
}

public actor APIClient {
    public private(set) var address: ServerAddress
    private let transport: any HTTPTransport
    private let tokenStore: any TokenStore
    var sessionRevision = 0
    private var tokenRevoked = false

    public init(
        address: ServerAddress = .default,
        transport: any HTTPTransport = URLSessionTransport(),
        tokenStore: any TokenStore = KeychainTokenStore()
    ) {
        self.address = address
        self.transport = transport
        self.tokenStore = tokenStore
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
        try await validateServerAddress(address)
    }

    public func sessionToken() throws -> SessionCredential? {
        guard !tokenRevoked, let credential = try tokenStore.read() else { return nil }
        guard credential.expiresAt > .now, !credential.accessToken.isEmpty,
              credential.origin == nil || credential.origin == address.url else {
            try logout()
            return nil
        }
        return credential
    }

    public func hasSession() throws -> Bool {
        try sessionToken() != nil
    }

    public func logout() throws {
        // Invalidate in-flight work even if the Keychain operation fails.
        sessionRevision += 1
        tokenRevoked = true
        try tokenStore.clear()
    }

    public func login(email: String, password: String, diagnostic: Bool = false) async throws -> User {
        try await authenticate(Credentials(email: email, password: password), diagnostic: diagnostic)
    }

    public func register(email: String, password: String) async throws -> User {
        let credentials = Credentials(email: email, password: password)
        let revision = sessionRevision
        let _: User = try await request(
            "/api/v1/auth/register", method: "POST", body: WireFormat.encoder().encode(credentials),
            authenticated: false
        )
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        return try await authenticate(credentials)
    }

    private func authenticate(_ credentials: Credentials, diagnostic: Bool = false) async throws -> User {
        let revision = sessionRevision
        let response: LoginResponse = try await request(
            "/api/v1/auth/login", method: "POST", body: WireFormat.encoder().encode(credentials),
            authenticated: false, diagnostic: diagnostic
        )
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        try saveToken(response.token)
        return response.user
    }

    public func refreshSession() async throws -> SessionCredential {
        let revision = sessionRevision
        let token: TokenResponse = try await request("/api/v1/auth/refresh", method: "POST")
        guard revision == sessionRevision else { throw APIError.sessionChanged }
        return try saveToken(token)
    }

    @discardableResult
    private func saveToken(_ token: TokenResponse) throws -> SessionCredential {
        guard token.tokenType.lowercased() == "bearer", !token.accessToken.isEmpty, token.expiresIn > 0 else {
            throw APIError.invalidPayload
        }
        let credential = SessionCredential(
            accessToken: token.accessToken,
            expiresAt: Date.now.addingTimeInterval(TimeInterval(token.expiresIn)),
            origin: address.url
        )
        try tokenStore.write(credential)
        tokenRevoked = false
        sessionRevision += 1
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
        var request = URLRequest(url: try (candidate ?? address).endpoint(path, query: query))
        request.httpMethod = method
        request.httpBody = body
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if body != nil {
            request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        }
        if authenticated {
            guard let token = try sessionToken() else { throw APIError.missingSession }
            request.setValue("Bearer \(token.accessToken)", forHTTPHeaderField: "Authorization")
        }
        let revision = sessionRevision
        let response = try await transport.send(request)
        if candidate == nil, revision != sessionRevision {
            throw APIError.sessionChanged
        }
        guard (200..<300).contains(response.statusCode) else {
            if authenticated, response.statusCode == 401 {
                try? logout()
            }
            throw APIError.response(response)
        }
        do {
            return try WireFormat.decoder().decode(T.self, from: response.body)
        } catch let error as DecodingError {
            if diagnostic { throw error }
            throw APIError.invalidPayload
        }
    }
}
