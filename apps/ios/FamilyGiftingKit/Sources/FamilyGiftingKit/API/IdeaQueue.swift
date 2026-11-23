import Foundation

public struct PendingIdea: Codable, Identifiable, Sendable, Equatable {
    public let id: UUID
    public let account: String
    public let name: String
    public let url: String?
    public let notes: String?
    public let price: Decimal?
    public let personIds: [Int]
    public var attempted: Bool = false
    public var rejection: Int?
    public init(id: UUID = UUID(), account: String, name: String, url: String? = nil, notes: String? = nil, price: Decimal? = nil, personIds: [Int] = []) {
        self.id = id; self.account = account; self.name = name; self.url = url
        self.notes = notes; self.price = price; self.personIds = personIds
    }
}

/// Atomic journal; an ambiguous in-flight write is never blindly repeated after termination.
public actor IdeaQueue {
    private let file: URL
    private var flushing = false
    public init(file: URL) { self.file = file }
    public func items(account: String) throws -> [PendingIdea] { try read().filter { $0.account == account } }
    private func read() throws -> [PendingIdea] {
        guard FileManager.default.fileExists(atPath: file.path) else { return [] }
        return try JSONDecoder().decode([PendingIdea].self, from: Data(contentsOf: file))
    }
    private func write(_ items: [PendingIdea]) throws {
        try FileManager.default.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true)
        try JSONEncoder().encode(items).write(to: file, options: .atomic)
    }
    public func enqueue(_ idea: PendingIdea) throws {
        guard !idea.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { throw APIError.invalidPayload }
        var all = try read()
        if !all.contains(where: { $0.id == idea.id }) { all.append(idea); try write(all) }
    }
    public func flush(account: String, find: @Sendable (UUID) async throws -> Bool,
                      send: @Sendable (PendingIdea) async throws -> Void) async throws {
        guard !flushing else { return }; flushing = true
        defer { flushing = false }
        for idea in try items(account: account) {
            // A successful read is also the reachability probe, before any create request.
            if try await find(idea.id) { try remove(idea.id); continue }
            guard !idea.attempted, idea.rejection == nil else { continue }
            try mark(idea.id, attempted: true)
            do { try await send(idea); try remove(idea.id) }
            catch {
                // These URL errors mean no request reached the server; safe to retry later.
                if let error = error as? URLError, [.notConnectedToInternet, .cannotFindHost, .cannotConnectToHost, .dnsLookupFailed].contains(error.code) {
                    try mark(idea.id, attempted: false)
                } else if let error = error as? APIError, case .server(let code, _) = error, (400..<500).contains(code) {
                    try mark(idea.id, attempted: false)
                    if ![401, 403, 408, 429].contains(code) {
                        var all = try read()
                        if let index = all.firstIndex(where: { $0.id == idea.id }) { all[index].rejection = code }
                        try write(all)
                        continue
                    }
                }
                throw error
            }
        }
    }
    private func remove(_ id: UUID) throws { try write(read().filter { $0.id != id }) }
    private func mark(_ id: UUID, attempted: Bool) throws {
        var all = try read()
        if let index = all.firstIndex(where: { $0.id == id }) { all[index].attempted = attempted }
        try write(all)
    }
}

public struct CaptureSession: Sendable {
    let revision: Int
}

extension APIClient {
    public func captureSession() throws -> CaptureSession {
        guard try hasSession() else { throw APIError.missingSession }
        return CaptureSession(revision: sessionRevision)
    }
    private func checkCaptureSession(_ session: CaptureSession) throws {
        guard session.revision == sessionRevision else { throw APIError.sessionChanged }
    }
    public func containsCapture(_ id: UUID, session: CaptureSession) async throws -> Bool {
        var cursor: Int?
        repeat {
            try checkCaptureSession(session)
            let page = try await gifts(cursor: cursor, limit: 100)
            if page.items.contains(where: { $0.source == "ios:capture:" + id.uuidString }) { return true }
            cursor = page.nextCursor
        } while cursor != nil
        return false
    }
    public func sendCapture(_ idea: PendingIdea, session: CaptureSession) async throws {
        try checkCaptureSession(session)
        struct Capture: Encodable {
            let name: String; let url: String?; let notes: String?; let price: Decimal?
            let personIds: [Int]; let source: String
        }
        let body = Capture(name: idea.name, url: idea.url, notes: idea.notes, price: idea.price,
                           personIds: idea.personIds, source: "ios:capture:" + idea.id.uuidString)
        let _: Gift = try await request("/api/v1/gifts", method: "POST", body: WireFormat.encoder().encode(body))
    }
}
