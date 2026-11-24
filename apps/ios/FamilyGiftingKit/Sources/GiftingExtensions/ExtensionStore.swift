import Foundation
import Darwin

public struct CountdownSnapshot: Codable, Equatable, Sendable {
    public let title: String
    public let day: String
    public let cachedAt: Date
    public let accessValidUntil: Date?

    public init(title: String, day: String, cachedAt: Date = .now, accessValidUntil: Date? = nil) {
        self.title = title
        self.day = day
        self.cachedAt = cachedAt
        self.accessValidUntil = accessValidUntil
    }

    public var expiresAt: Date {
        min(cachedAt.addingTimeInterval(7 * 86_400), accessValidUntil ?? .distantFuture)
    }

    public func daysRemaining(on now: Date, calendar: Calendar = .countdown) -> Int? {
        let parts = day.split(separator: "-")
        guard now < expiresAt, parts.count == 3,
              let year = Int(parts[0]), let month = Int(parts[1]), let day = Int(parts[2]),
              let end = calendar.date(from: DateComponents(year: year, month: month, day: day)),
              let days = calendar.dateComponents([.day], from: calendar.startOfDay(for: now), to: end).day,
              days >= 0 else { return nil }
        return days
    }

    public var dateLabel: String? {
        let parts = day.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3,
              let date = Calendar.countdown.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2])) else { return nil }
        return date.formatted(.dateTime.month(.wide).day())
    }
}

public extension Calendar {
    static var countdown: Self {
        var calendar = Self(identifier: .gregorian)
        calendar.timeZone = .current
        return calendar
    }
}

public struct SharedIdeaDraft: Equatable, Sendable {
    public let name: String
    public let url: String?
    public let notes: String?

    public init(name: String, url: String?, notes: String?) throws {
        let title = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !title.isEmpty, title.unicodeScalars.count <= 255 else { throw ExtensionStoreError.invalidName }
        let link = url?.trimmingCharacters(in: .whitespacesAndNewlines)
        if let link, !link.isEmpty, Self.webURL(link) == nil { throw ExtensionStoreError.invalidURL }
        self.name = title
        self.url = link.flatMap { $0.isEmpty ? nil : $0 }
        let detail = notes?.trimmingCharacters(in: .whitespacesAndNewlines)
        if let detail, detail.unicodeScalars.count > 4_096 { throw ExtensionStoreError.invalidNotes }
        self.notes = detail.flatMap { $0.isEmpty ? nil : $0 }
    }

    public static func webURL(_ text: String) -> URL? {
        guard text.utf8.count <= 2_048, let components = URLComponents(string: text),
              let scheme = components.scheme?.lowercased(), ["http", "https"].contains(scheme),
              let host = components.host, !host.isEmpty, components.user == nil, components.password == nil else { return nil }
        return components.url
    }
}

public struct SharedIdea: Codable, Equatable, Sendable, Identifiable {
    public let id: UUID
    public let account: String
    public let name: String
    public let url: String?
    public let notes: String?
}

public struct ShareBinding: Codable, Equatable, Sendable {
    fileprivate let account: String
    fileprivate let revision: UUID
}

public enum ExtensionStoreError: LocalizedError {
    case accountChanged, invalidName, invalidURL, invalidNotes, storage

    public var errorDescription: String? {
        switch self {
        case .accountChanged: "Open Family Gifting and try sharing again."
        case .invalidName: "Enter an idea name of up to 255 characters."
        case .invalidURL: "Use a full HTTP or HTTPS link."
        case .invalidNotes: "Use up to 4,096 characters for notes."
        case .storage: "Couldn’t access shared storage. Open Family Gifting and try again."
        }
    }
}

/// Coordinates atomic state and outbox changes across the app and extension processes.
public struct ExtensionStore: Sendable {
    public static let groupID = "group.dev.familygifting.app"
    public static let widgetKind = "FamilyGiftingCountdown"
    private let directory: URL

    public init(directory: URL) { self.directory = directory }

    public static func shared() -> Self? {
        #if DEBUG && FG_UNSIGNED_EXTENSION_FIXTURES && targetEnvironment(simulator)
        // The unsigned review build uses only this simulator's synthetic fixture data.
        let home = URL(fileURLWithPath: NSHomeDirectory())
        let path = home.pathComponents
        if let devices = path.lastIndex(of: "Devices"), path.count > devices + 2,
           path[devices + 2] == "data" {
            return Self(directory: URL(fileURLWithPath: "/tmp", isDirectory: true)
                .appendingPathComponent("family-gifting-extension-fixtures-" + path[devices + 1], isDirectory: true))
        }
        #endif
        return FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupID)
            .map { Self(directory: $0.appendingPathComponent("FamilyGiftingExtensions", isDirectory: true)) }
    }

    private struct State: Codable, Equatable {
        let binding: ShareBinding
        var countdown: CountdownSnapshot?
    }

    private var stateFile: URL { directory.appendingPathComponent("active.json") }
    private var outbox: URL { directory.appendingPathComponent("outbox", isDirectory: true) }

    /// Rebinding removes the old countdown and invalidates a share sheet already on screen.
    @discardableResult
    public func bind(account: String?) throws -> Bool {
        try locked {
            if account == nil {
                let existed = FileManager.default.fileExists(atPath: stateFile.path)
                try remove(stateFile)
                return existed
            }
            if (try? active())?.binding.account == account { return false }
            if let account {
                let next = State(binding: ShareBinding(account: account, revision: UUID()), countdown: nil)
                try write(next, to: stateFile)
            }
            return true
        }
    }

    @discardableResult
    public func publish(_ snapshot: CountdownSnapshot?, for account: String) throws -> Bool {
        try locked {
            guard var state = try active(), state.binding.account == account else { return false }
            if state.countdown == snapshot { return false }
            if let prior = state.countdown, let snapshot, prior.day == snapshot.day, prior.title == snapshot.title,
               prior.accessValidUntil == snapshot.accessValidUntil, (0..<43_200).contains(snapshot.cachedAt.timeIntervalSince(prior.cachedAt)) { return false }
            state.countdown = snapshot
            try write(state, to: stateFile)
            return true
        }
    }

    public func countdown() throws -> CountdownSnapshot? {
        try locked { try active()?.countdown }
    }

    public func binding() throws -> ShareBinding? {
        try locked { try active()?.binding }
    }

    public func save(_ draft: SharedIdeaDraft, using binding: ShareBinding) throws {
        try locked {
            guard try active()?.binding == binding else { throw ExtensionStoreError.accountChanged }
            try FileManager.default.createDirectory(at: outbox, withIntermediateDirectories: true)
            let idea = SharedIdea(id: UUID(), account: binding.account, name: draft.name, url: draft.url, notes: draft.notes)
            try write(idea, to: receipt(idea.id))
        }
    }

    /// The app supplies a durable, idempotent journal write before an outbox item is removed.
    public func importIdeas(for account: String, enqueue: (SharedIdea) throws -> Void) throws {
        try locked {
            guard try active()?.binding.account == account,
                  FileManager.default.fileExists(atPath: outbox.path) else { return }
            for file in try FileManager.default.contentsOfDirectory(at: outbox, includingPropertiesForKeys: nil)
                where file.pathExtension == "json" && UUID(uuidString: file.deletingPathExtension().lastPathComponent) != nil {
                let idea = try JSONDecoder().decode(SharedIdea.self, from: Data(contentsOf: file))
                guard idea.account == account, file.lastPathComponent == receipt(idea.id).lastPathComponent else { continue }
                try enqueue(idea)
                try remove(file)
            }
        }
    }

    private func active() throws -> State? {
        guard FileManager.default.fileExists(atPath: stateFile.path) else { return nil }
        return try JSONDecoder().decode(State.self, from: Data(contentsOf: stateFile))
    }

    private func receipt(_ id: UUID) -> URL { outbox.appendingPathComponent(id.uuidString + ".json") }

    private func write(_ value: some Encodable, to file: URL) throws {
        try JSONEncoder().encode(value).write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    private func remove(_ file: URL) throws {
        if FileManager.default.fileExists(atPath: file.path) { try FileManager.default.removeItem(at: file) }
    }

    private func locked<T>(_ work: () throws -> T) throws -> T {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let fd = open(directory.appendingPathComponent("storage.lock").path, O_CREAT | O_RDWR | O_CLOEXEC, 0o600)
        guard fd >= 0 else { throw ExtensionStoreError.storage }
        defer { close(fd) }
        guard flock(fd, LOCK_EX) == 0 else { throw ExtensionStoreError.storage }
        defer { flock(fd, LOCK_UN) }
        return try work()
    }
}
