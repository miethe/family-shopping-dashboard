import Foundation
import FamilyGiftingKit
import GiftingExtensions
import Testing

@Suite("Widget cache and share handoff")
struct ExtensionStoreTests {
    @Test func countdownUsesLocalCalendarDaysAndExpires() throws {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = try #require(TimeZone(identifier: "America/New_York"))
        let morning = try #require(calendar.date(from: DateComponents(year: 2027, month: 3, day: 13, hour: 12)))
        let holiday = CountdownSnapshot(title: "Kite Day", day: "2027-03-14", cachedAt: morning)
        #expect(holiday.daysRemaining(on: morning, calendar: calendar) == 1)
        let nextDay = try #require(calendar.date(byAdding: .day, value: 1, to: morning))
        #expect(holiday.daysRemaining(on: nextDay, calendar: calendar) == 0)
        #expect(holiday.daysRemaining(on: nextDay.addingTimeInterval(86_400), calendar: calendar) == nil)
        let future = CountdownSnapshot(title: "Kite Day", day: "2027-04-01", cachedAt: morning)
        #expect(future.daysRemaining(on: future.expiresAt, calendar: calendar) == nil)
        let accessDeadline = morning.addingTimeInterval(3_600)
        let bounded = CountdownSnapshot(title: "Kite Day", day: "2027-03-14", cachedAt: morning, accessValidUntil: accessDeadline)
        #expect(bounded.expiresAt == accessDeadline)
        #expect(bounded.daysRemaining(on: accessDeadline, calendar: calendar) == nil)
    }

    @Test func bindingClearsCountdownAndInvalidatesAnOpenShareSheet() throws {
        let root = location()
        defer { try? FileManager.default.removeItem(at: root) }
        let store = ExtensionStore(directory: root)
        let draft = try SharedIdeaDraft(name: "Kite", url: "https://example.invalid/kite", notes: nil)
        #expect(try store.binding() == nil)
        #expect(try store.bind(account: "https://first.example.invalid#1"))
        let initial = try #require(try store.binding())
        let countdown = CountdownSnapshot(title: "Kite Day", day: "2026-12-01")
        #expect(try store.publish(countdown, for: "https://first.example.invalid#1"))
        #expect(try store.countdown() == countdown)
        let fields = try #require(JSONSerialization.jsonObject(with: Data(contentsOf: root.appendingPathComponent("active.json"))) as? [String: Any])
        #expect(Set(fields.keys) == ["binding", "countdown"])
        let bindingFields = try #require(fields["binding"] as? [String: Any])
        #expect(Set(bindingFields.keys) == ["account", "revision"])

        #expect(try store.bind(account: "https://second.example.invalid#1"))
        #expect(try store.countdown() == nil)
        #expect(try store.publish(countdown, for: "https://first.example.invalid#1") == false)
        #expect(throws: ExtensionStoreError.accountChanged) { try store.save(draft, using: initial) }
        #expect(try store.bind(account: nil))
        #expect(try store.binding() == nil)
        #expect(try store.bind(account: "https://first.example.invalid#1"))
        #expect(throws: ExtensionStoreError.accountChanged) { try store.save(draft, using: initial) }
    }

    @Test func durableShareImportIsAccountScopedAndIdempotentOnInterruption() async throws {
        let root = location()
        defer { try? FileManager.default.removeItem(at: root) }
        let store = ExtensionStore(directory: root.appendingPathComponent("shared"))
        let owner = "https://first.example.invalid#1"
        let draft = try SharedIdeaDraft(name: "  Kite ", url: "https://example.invalid/kite", notes: " A windy afternoon ")
        try store.bind(account: owner)
        try store.save(draft, using: try #require(try store.binding()))
        let journalFile = root.appendingPathComponent("private.json")
        let queue = IdeaQueue(file: journalFile)
        let other = "https://first.example.invalid#2"
        try store.bind(account: other)
        try await queue.importSharedIdeas(from: store, account: other)
        #expect(try await queue.items(account: other).isEmpty)
        try store.bind(account: owner)
        var receipt: SharedIdea?
        #expect(throws: ExtensionStoreError.storage) {
            try store.importIdeas(for: owner) {
                receipt = $0
                throw ExtensionStoreError.storage
            }
        }
        let saved = try #require(receipt)
        // Simulate the app terminating after its private journal write and before outbox removal.
        try await queue.enqueue(PendingIdea(id: saved.id, account: owner, name: saved.name, url: saved.url, notes: saved.notes))
        let reopened = IdeaQueue(file: journalFile)
        try await reopened.importSharedIdeas(from: store, account: owner)
        try await reopened.importSharedIdeas(from: store, account: owner)
        let items = try await reopened.items(account: owner)
        #expect(items.map(\.id) == [saved.id])
        #expect(items.first?.name == "Kite")
        #expect(items.first?.notes == "A windy afternoon")
        try store.importIdeas(for: owner) { _ in Issue.record("Outbox still contained the imported item") }
    }

    @Test func shareRejectsInvalidInputWithoutFetchingAnything() throws {
        #expect(throws: ExtensionStoreError.invalidName) { try SharedIdeaDraft(name: " ", url: nil, notes: nil) }
        #expect(throws: ExtensionStoreError.invalidURL) { try SharedIdeaDraft(name: "Kite", url: "file:///tmp/item", notes: nil) }
        #expect(throws: ExtensionStoreError.invalidURL) {
            try SharedIdeaDraft(name: "Kite", url: "https://user:secret@example.invalid", notes: nil)
        }
        #expect(try SharedIdeaDraft(name: "Kite", url: " ", notes: nil).url == nil)
    }

    private func location() -> URL {
        URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .appendingPathComponent("../../.build/extension-tests/\(UUID())").standardizedFileURL
    }
}
