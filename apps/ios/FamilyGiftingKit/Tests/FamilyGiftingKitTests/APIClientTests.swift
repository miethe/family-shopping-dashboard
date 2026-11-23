import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("Server address and session")
struct APIClientTests {
    @Test(arguments: [
        "", "127.0.0.1:3047", "file:///tmp/server", "https:///missing", "https://example.test/path",
        "http://sam@example.test", "https://example.test?foo=bar", "https://example.test#fragment",
        "http://example.test:0", "http://example.test:65536", "http://example.test/a/..",
        "http://exa mple.test", "http://example.test%2Fother.test", "http://example.test\\@other.test"
    ])
    func rejectsInvalidServerAddress(input: String) {
        #expect(throws: APIError.invalidServerAddress) { try ServerAddress(input) }
    }

    @Test func normalizesServerOrigin() throws {
        #expect(ServerAddress.default.url.absoluteString == "http://10.42.10.76:3047")
        #expect(try ServerAddress(" HTTPS://Example.TEST:443/ \n").url.absoluteString == "https://example.test")
        #expect(try ServerAddress("http://[::1]:3047/").url.absoluteString == "http://[::1]:3047")
    }

    @Test func healthCheckTargetsCandidateWithoutSendingToken() async throws {
        let address = try ServerAddress("https://new.hartwell.example:8443")
        let transport = RecordingTransport([response(200, #"{"status":"healthy","db":"connected"}"#)])
        let client = APIClient(transport: transport, tokenStore: MemoryTokenStore(token: "test-token"))
        let health = try await client.validateServerAddress(address)
        let request = try #require(await transport.requests.first)
        #expect(health.db == "connected")
        #expect(request.url?.absoluteString == "https://new.hartwell.example:8443/health")
        #expect(request.value(forHTTPHeaderField: "Authorization") == nil)
        #expect(await client.address == .default)
    }

    @Test func disconnectedHealthCheckFails() async {
        let transport = RecordingTransport([response(200, #"{"status":"healthy","db":"disconnected"}"#)])
        let client = APIClient(transport: transport, tokenStore: MemoryTokenStore())
        await #expect(throws: APIError.unhealthyServer) { try await client.health() }
    }

    @Test func registerSignsInAndRestoresAnOriginBoundSession() async throws {
        let address = try ServerAddress("https://test.hartwell.example")
        let store = MemoryTokenStore()
        let transport = RecordingTransport([
            response(201, TestPayload.user), response(200, TestPayload.login), response(200, TestPayload.user)
        ])
        let client = APIClient(address: address, transport: transport, tokenStore: store)
        let user = try await client.register(email: "sam@hartwell.example", password: "fixture-password")
        let session = try #require(await client.sessionToken())
        #expect(user.id == 1)
        #expect(session.accessToken == "test-token")
        #expect(session.expiresAt > .now)
        let restored = APIClient(address: address, transport: transport, tokenStore: store)
        #expect(try await restored.me().email == "sam@hartwell.example")

        let requests = await transport.requests
        #expect(requests.map { $0.url?.path } == ["/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/me"])
        #expect(requests.map { $0.httpMethod } == ["POST", "POST", "GET"])
        #expect(requests[0].value(forHTTPHeaderField: "Authorization") == nil)
        #expect(requests[1].value(forHTTPHeaderField: "Authorization") == nil)
        #expect(requests[1].value(forHTTPHeaderField: "Content-Type") == "application/json")
        #expect(requests[2].value(forHTTPHeaderField: "Authorization") == "Bearer test-token")
        let body = try #require(requests[1].httpBody)
        let credentials = try JSONDecoder().decode([String: String].self, from: body)
        #expect(credentials == ["email": "sam@hartwell.example", "password": "fixture-password"])

        let newAddress = try ServerAddress("https://other.hartwell.example")
        try await restored.setServerAddress(newAddress)
        #expect(store.read() == nil)
        #expect(try await restored.hasSession() == false)
        await #expect(throws: APIError.missingSession) { try await restored.me() }
        #expect(await transport.requests.count == 3)
    }

    @Test func rejectsAnExpiredOrWrongOriginTokenBeforeMakingARequest() async throws {
        let store = MemoryTokenStore()
        let transport = RecordingTransport([])
        let client = APIClient(transport: transport, tokenStore: store)
        store.write(SessionCredential(accessToken: "expired-credential", expiresAt: .distantPast))
        await #expect(throws: APIError.missingSession) { try await client.me() }
        #expect(store.read() == nil)

        let otherStore = MemoryTokenStore()
        otherStore.write(SessionCredential(accessToken: "other-origin", expiresAt: .distantFuture,
                                           origin: URL(string: "https://other.hartwell.example")))
        let otherClient = APIClient(transport: transport, tokenStore: otherStore)
        await #expect(throws: APIError.missingSession) { try await otherClient.me() }
        #expect(otherStore.read() == nil)
        #expect(await transport.requests.isEmpty)
    }

    @Test func unauthorizedResponseClearsSessionAndReturnsErrorEnvelope() async throws {
        let store = MemoryTokenStore(token: "test-token")
        let transport = RecordingTransport([
            response(401, #"{"error":{"code":"TOKEN_EXPIRED","message":"Session expired","trace_id":"fixture-trace"}}"#)
        ])
        let client = APIClient(transport: transport, tokenStore: store)
        do {
            _ = try await client.dashboard()
            Issue.record("Expected the request to fail with a 401 response.")
        } catch let error as APIError {
            #expect(error.isUnauthorized)
            #expect(error.errorDescription == "Session expired")
            #expect(error == .server(statusCode: 401, detail: APIErrorDetail(
                code: "TOKEN_EXPIRED", message: "Session expired", traceId: "fixture-trace")))
        }
        #expect(store.read() == nil)
        #expect(try await client.sessionToken() == nil)
        await #expect(throws: APIError.missingSession) { try await client.dashboard() }
        #expect(await transport.requests.count == 1)
    }

    @Test func unauthenticatedLoginFailureKeepsExistingSession() async throws {
        let store = MemoryTokenStore(token: "test-token")
        let transport = RecordingTransport([response(401, #"{"detail":"Invalid credentials"}"#)])
        let client = APIClient(transport: transport, tokenStore: store)
        let expected = APIError.server(statusCode: 401, detail: APIErrorDetail(
            code: "HTTP_401", message: "Invalid credentials", traceId: nil))
        await #expect(throws: expected) { try await client.login(email: "sam@hartwell.example", password: "wrong") }
        #expect(try await client.sessionToken()?.accessToken == "test-token")
    }

    @Test func giftFiltersUseRepeatedQueryKeys() async throws {
        let transport = RecordingTransport([response(200, #"{"items":[],"has_more":false}"#)])
        let client = APIClient(transport: transport, tokenStore: MemoryTokenStore(token: "test-token"))
        let page = try await client.gifts(cursor: 8, limit: 2, search: "arts & crafts", personIds: [3, 4],
                                          statuses: [.selected, .purchased], occasionIds: [2])
        #expect(page.items.isEmpty)
        #expect(page.nextCursor == nil)
        let request = try #require(await transport.requests.first)
        let url = try #require(request.url)
        let query = try #require(URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems)
        #expect(query.filter { $0.name == "person_ids" }.compactMap(\.value) == ["3", "4"])
        #expect(query.filter { $0.name == "statuses" }.compactMap(\.value) == ["selected", "purchased"])
        #expect(query.contains(URLQueryItem(name: "search", value: "arts & crafts")))
        #expect(query.contains(URLQueryItem(name: "cursor", value: "8")))
        #expect(query.contains(URLQueryItem(name: "occasion_ids", value: "2")))
    }

    @Test func malformedSuccessPayloadHasTypedError() async {
        let client = APIClient(
            transport: RecordingTransport([response(200, #"{"unrelated": true}"#)]),
            tokenStore: MemoryTokenStore(token: "test-token")
        )
        await #expect(throws: APIError.invalidPayload) { try await client.dashboard() }
    }
}

private func response(_ status: Int, _ json: String) -> HTTPResponse {
    HTTPResponse(statusCode: status, body: Data(json.utf8))
}

private actor RecordingTransport: HTTPTransport {
    private var responses: [HTTPResponse]
    private(set) var requests: [URLRequest] = []

    init(_ responses: [HTTPResponse]) {
        self.responses = responses
    }

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        requests.append(request)
        guard !responses.isEmpty else { throw APIError.invalidResponse }
        return responses.removeFirst()
    }
}

private enum TestPayload {
    static let user = """
    {"id":1,"email":"sam@hartwell.example","created_at":"2026-11-20T12:00:00Z","updated_at":"2026-11-20T12:00:00.765432Z"}
    """
    static let login = """
    {"id":1,"email":"sam@hartwell.example","created_at":"2026-11-20T12:00:00Z","updated_at":"2026-11-20T12:00:00.765432Z",
    "token":{"access_token":"test-token","token_type":"bearer","expires_in":86400}}
    """
}
