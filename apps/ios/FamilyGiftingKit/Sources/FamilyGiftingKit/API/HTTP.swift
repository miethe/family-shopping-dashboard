import Foundation

public struct ServerAddress: Equatable, Hashable, Sendable {
    public static let fixture = try! ServerAddress("https://hartwell.example.invalid")

    public let url: URL

    public init(_ value: String) throws {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.contains(where: { $0.isWhitespace || $0.isNewline || $0 == "\\" }),
              var parts = URLComponents(string: trimmed),
              let scheme = parts.scheme?.lowercased(), ["http", "https"].contains(scheme),
              let host = parts.host?.lowercased(), !host.isEmpty,
              !host.contains(where: { $0.isWhitespace || $0.isNewline || "/?#@%\\".contains($0) }),
              parts.user == nil, parts.password == nil, parts.query == nil, parts.fragment == nil,
              parts.percentEncodedPath.isEmpty || parts.percentEncodedPath == "/",
              parts.port.map({ (1...65535).contains($0) }) ?? true
        else { throw APIError.invalidServerAddress }

        parts.scheme = scheme
        parts.host = host
        parts.path = ""
        if (scheme == "http" && parts.port == 80) || (scheme == "https" && parts.port == 443) {
            parts.port = nil
        }
        guard let url = parts.url else { throw APIError.invalidServerAddress }
        self.url = url
    }

    func endpoint(_ path: String, query: [URLQueryItem]) throws -> URL {
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        components?.path = path
        components?.queryItems = query.isEmpty ? nil : query
        guard let destination = components?.url else { throw APIError.invalidServerAddress }
        return destination
    }
}

public struct HTTPResponse: Sendable {
    public let statusCode: Int
    public let body: Data

    public init(statusCode: Int, body: Data) {
        self.statusCode = statusCode
        self.body = body
    }
}

public protocol HTTPTransport: Sendable {
    func send(_ request: URLRequest) async throws -> HTTPResponse
}

public struct URLSessionTransport: HTTPTransport {
    private let session: URLSession

    public init() {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.httpShouldSetCookies = false
        configuration.urlCache = nil
        configuration.timeoutIntervalForRequest = 15
        configuration.timeoutIntervalForResource = 30
        session = URLSession(configuration: configuration, delegate: NoRedirects(), delegateQueue: nil)
    }

    public func send(_ request: URLRequest) async throws -> HTTPResponse {
        let (body, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        return HTTPResponse(statusCode: http.statusCode, body: body)
    }
}

private final class NoRedirects: NSObject, URLSessionTaskDelegate {
    func urlSession(
        _ session: URLSession,
        task: URLSessionTask,
        willPerformHTTPRedirection response: HTTPURLResponse,
        newRequest request: URLRequest,
        completionHandler: @escaping @Sendable (URLRequest?) -> Void
    ) {
        completionHandler(nil)
    }
}

public struct APIErrorDetail: Decodable, Equatable, Sendable {
    public let code: String
    public let message: String
    public let traceId: String?
}

public enum APIError: LocalizedError, Equatable, Sendable {
    case invalidServerAddress
    case unhealthyServer
    case missingSession
    case expiredSession
    case sessionChanged
    case invalidResponse
    case invalidPayload
    case server(statusCode: Int, detail: APIErrorDetail?)

    public var isUnauthorized: Bool {
        switch self {
        case .missingSession, .server(statusCode: 401, detail: _): true
        default: false
        }
    }

    public var errorDescription: String? {
        switch self {
        case .invalidServerAddress: "Enter an HTTP or HTTPS address, with an optional port."
        case .unhealthyServer: "The server health check failed."
        case .missingSession: "Sign in to continue."
        case .expiredSession: "Sign in again to sync. You can still save ideas offline."
        case .sessionChanged: "The session changed before the request finished. Try again."
        case .invalidResponse: "The server did not return an HTTP response."
        case .invalidPayload: "The server returned data the app cannot read."
        case let .server(statusCode, detail):
            detail?.message ?? HTTPURLResponse.localizedString(forStatusCode: statusCode).capitalized
        }
    }

    static func response(_ response: HTTPResponse) -> APIError {
        let decoder = WireFormat.decoder()
        let detail = (try? decoder.decode(ErrorEnvelope.self, from: response.body))?.error
        let fallback = (try? decoder.decode(HTTPError.self, from: response.body)).map {
            APIErrorDetail(code: "HTTP_\(response.statusCode)", message: $0.detail, traceId: nil)
        }
        return .server(statusCode: response.statusCode, detail: detail ?? fallback)
    }
}

private struct ErrorEnvelope: Decodable {
    let error: APIErrorDetail
}

private struct HTTPError: Decodable {
    let detail: String
}
