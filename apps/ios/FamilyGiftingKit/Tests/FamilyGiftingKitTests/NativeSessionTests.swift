import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("Opt-in native sessions")
struct NativeSessionTests {
    @Test func draftRegistrationOptsInAndUsesIssuedPair() async throws {
        let store = MemoryTokenStore()
        let transport = NativeTransport([.reply(201, nativeLogin)])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store, nativeSessionsFor: .fixture)
        #expect(try await client.register(email: "ellis@hartwell.example", password: "fixture-password").id == 9)
        let requests = await transport.requests
        #expect(requests.count == 1)
        let registration = try #require(requests.first)
        #expect(registration.url?.path == "/api/v1/auth/register")
        #expect(try body(registration)["client"] == "ios")
        #expect(store.read()?.refreshToken == "fixture-refresh")
        #expect(store.read()?.userID == 9)
    }

    @Test func optInFallsBackWhenServerIssuesOnlyLegacyTokens() async throws {
        let transport = NativeTransport([.reply(201, user), .reply(200, legacyLogin)])
        let store = MemoryTokenStore()
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store, nativeSessionsFor: .fixture)
        _ = try await client.register(email: "ellis@hartwell.example", password: "fixture-password")
        #expect(store.read()?.refreshToken == nil)
        try await client.signOut()
        #expect(await transport.requests.compactMap { $0.url?.path } == ["/api/v1/auth/register", "/api/v1/auth/login"])
    }

    @Test func defaultClientNeverNegotiatesOrUsesDraftEndpoints() async throws {
        let store = MemoryTokenStore()
        let transport = NativeTransport([.reply(200, nativeLogin)])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store)
        _ = try await client.login(email: "ellis@hartwell.example", password: "fixture-password")
        #expect(store.read()?.refreshToken == nil)
        try await client.signOut()
        let requests = await transport.requests
        #expect(requests.count == 1)
        #expect(try body(try #require(requests.first))["client"] == nil)
    }

    @Test func refreshIsSharedAndLostResponseRetriesTheSameSecret() async throws {
        let store = expiredStore()
        let transport = NativeTransport([.lost, .reply(200, rotated), .reply(204, "")])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store, nativeSessionsFor: .fixture)
        async let first = client.usableSession()
        async let second = client.usableSession()
        let (a, b) = try await (first, second)
        #expect(a == b)
        #expect(a?.accessToken == "fixture-successor-access")
        #expect(store.read()?.refreshToken == "fixture-successor-refresh")
        #expect(store.read()?.userID == 9)
        try await client.signOut()
        let requests = await transport.requests
        #expect(requests.compactMap { $0.url?.path } == [
            "/api/v1/auth/session/refresh", "/api/v1/auth/session/refresh", "/api/v1/auth/session/revoke"
        ])
        #expect(requests.allSatisfy { $0.httpMethod == "POST" && $0.value(forHTTPHeaderField: "Authorization") == nil })
        #expect(try requests.map { try body($0)["refresh_token"] } == ["fixture-refresh", "fixture-refresh", "fixture-successor-refresh"])
        #expect(store.read() == nil)
    }

    @Test func offlineExpiryPreservesIdentityAndRecoversWhenReachable() async throws {
        let store = expiredStore()
        let transport = NativeTransport([.offline, .reply(200, rotated)])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store, nativeSessionsFor: .fixture)
        await #expect(throws: URLError(.notConnectedToInternet)) { try await client.usableSession() }
        #expect(store.read()?.refreshStartedAt == nil)
        #expect(try await client.savedCredential()?.userID == 9)
        #expect(try await client.usableSession()?.refreshToken == "fixture-successor-refresh")
    }

    @Test func rejectedRotationRequiresSignInAndPreventsFurtherRefreshReplay() async throws {
        let store = expiredStore()
        let transport = NativeTransport([.reply(401, #"{"detail":"Invalid session"}"#)])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store, nativeSessionsFor: .fixture)
        await #expect(throws: APIError.expiredSession) { try await client.usableSession() }
        await #expect(throws: APIError.expiredSession) { try await client.usableSession() }
        #expect(try await client.savedCredential()?.userID == 9)
        #expect(await transport.requests.count == 1)
    }

    @Test func revokeAllUsesBearerThenClearsLocalCredential() async throws {
        let store = MemoryTokenStore()
        let transport = NativeTransport([.reply(200, nativeLogin), .reply(204, "")])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: store, nativeSessionsFor: .fixture)
        _ = try await client.login(email: "ellis@hartwell.example", password: "fixture-password")
        try await client.revokeAllNativeSessions()
        let request = try #require(await transport.requests.last)
        #expect(request.url?.path == "/api/v1/auth/sessions/revoke-all")
        #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer fixture-access")
        #expect(request.httpBody == nil)
        #expect(store.read() == nil)
    }

    private func expiredStore() -> MemoryTokenStore {
        let store = MemoryTokenStore()
        store.write(SessionCredential(accessToken: "fixture-access", expiresAt: .distantPast,
                                      origin: ServerAddress.fixture.url, userID: 9, refreshToken: "fixture-refresh",
                                      refreshExpiresAt: .distantFuture))
        return store
    }

    private func body(_ request: URLRequest) throws -> [String: String] {
        try JSONDecoder().decode([String: String].self, from: try #require(request.httpBody))
    }
}

private actor NativeTransport: HTTPTransport {
    enum Outcome: Sendable {
        case reply(Int, String), offline, lost
    }

    private var outcomes: [Outcome]
    private(set) var requests: [URLRequest] = []

    init(_ outcomes: [Outcome]) { self.outcomes = outcomes }

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        requests.append(request)
        guard !outcomes.isEmpty else { throw APIError.invalidResponse }
        let next = outcomes.removeFirst()
        switch next {
        case let .reply(status, json): return HTTPResponse(statusCode: status, body: Data(json.utf8))
        case .offline: throw URLError(.notConnectedToInternet)
        case .lost:
            await Task.yield()
            throw URLError(.networkConnectionLost)
        }
    }
}

private let user = #"{"id":9,"email":"ellis@hartwell.example","created_at":"2026-11-20T12:00:00Z","updated_at":"2026-11-20T12:00:00Z"}"#
private let legacyLogin = String(user.dropLast()) + #","token":{"access_token":"fixture-access","token_type":"bearer","expires_in":86400}}"#
private let nativeLogin = String(legacyLogin.dropLast()) + #","refresh_token":"fixture-refresh","refresh_expires_in":2592000}"#
private let rotated = #"{"access_token":"fixture-successor-access","token_type":"bearer","expires_in":86400,"refresh_token":"fixture-successor-refresh","refresh_expires_in":2592000}"#
