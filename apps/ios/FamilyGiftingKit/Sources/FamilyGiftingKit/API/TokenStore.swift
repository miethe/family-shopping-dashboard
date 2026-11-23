import Foundation
import Security

public struct SessionCredential: Codable, Equatable, Sendable {
    public let accessToken: String
    public let expiresAt: Date
    let origin: URL?
    public let userID: Int?
    let refreshToken: String?
    let refreshExpiresAt: Date?
    var refreshStartedAt: Date?

    public init(accessToken: String, expiresAt: Date) {
        self.init(accessToken: accessToken, expiresAt: expiresAt, origin: nil)
    }

    init(accessToken: String, expiresAt: Date, origin: URL?, userID: Int? = nil,
         refreshToken: String? = nil, refreshExpiresAt: Date? = nil) {
        self.accessToken = accessToken
        self.expiresAt = expiresAt
        self.origin = origin
        self.userID = userID
        self.refreshToken = refreshToken
        self.refreshExpiresAt = refreshExpiresAt
    }
}

public protocol TokenStore: Sendable {
    func read() throws -> SessionCredential?
    func write(_ credential: SessionCredential) throws
    func clear() throws
}

public final class MemoryTokenStore: TokenStore, @unchecked Sendable {
    private let lock = NSLock()
    private var credential: SessionCredential?

    public init(token: String? = nil) {
        credential = token.map { SessionCredential(accessToken: $0, expiresAt: .distantFuture) }
    }

    public func read() -> SessionCredential? {
        lock.withLock { credential }
    }

    public func write(_ credential: SessionCredential) {
        lock.withLock { self.credential = credential }
    }

    public func clear() {
        lock.withLock { credential = nil }
    }
}

public struct KeychainTokenStore: TokenStore {
    private let service: String
    private let account = "session"

    public init(service: String = "com.familygiftingdashboard.ios") {
        self.service = service
    }

    public func read() throws -> SessionCredential? {
        var query = baseQuery
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = result as? Data else {
            throw KeychainError(status: status)
        }
        return try JSONDecoder().decode(SessionCredential.self, from: data)
    }

    public func write(_ credential: SessionCredential) throws {
        let data = try JSONEncoder().encode(credential)
        let query = baseQuery
        let updates = [kSecValueData as String: data]
        let updateStatus = SecItemUpdate(query as CFDictionary, updates as CFDictionary)
        if updateStatus == errSecSuccess { return }
        guard updateStatus == errSecItemNotFound else {
            throw KeychainError(status: updateStatus)
        }
        var item = query
        item[kSecValueData as String] = data
        item[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let addStatus = SecItemAdd(item as CFDictionary, nil)
        guard addStatus == errSecSuccess else { throw KeychainError(status: addStatus) }
    }

    public func clear() throws {
        let status = SecItemDelete(baseQuery as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError(status: status)
        }
    }

    private var baseQuery: [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
    }
}

public struct KeychainError: LocalizedError, Sendable {
    public let status: OSStatus

    public var errorDescription: String? {
        "The app could not access the saved session in Keychain."
    }
}
