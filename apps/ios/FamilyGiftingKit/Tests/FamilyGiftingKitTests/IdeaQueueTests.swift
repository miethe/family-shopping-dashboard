import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite struct IdeaQueueTests {
    func location() -> URL { URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("../../.build/queue-tests/\(UUID()).json").standardizedFileURL }
    @Test func enqueueOfflineAndRelaunch() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file)
        let idea = PendingIdea(account: "fixture#1", name: "Hartwell picnic")
        try await queue.enqueue(idea)
        let restored = IdeaQueue(file: file)
        #expect(try await restored.items(account: "fixture#1") == [idea])
        #expect(try await restored.items(account: "fixture#2").isEmpty)
    }
    @Test func flushOnceAndDuplicateProtection() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file); let receipt = QueueReceipt()
        let idea = PendingIdea(account: "a", name: "Art set")
        try await queue.enqueue(idea); try await queue.enqueue(idea)
        #expect(try await queue.items(account: "a").count == 1)
        try await queue.flush(account: "a", find: { _ in false }, send: { _ in await receipt.sent() })
        try await queue.flush(account: "a", find: { _ in false }, send: { _ in await receipt.sent() })
        #expect(await receipt.count == 1)
        #expect(try await queue.items(account: "a").isEmpty)
    }
    @Test func serverErrorKeepsItem() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file)
        try await queue.enqueue(PendingIdea(account: "a", name: "Book"))
        do { try await queue.flush(account: "a", find: { _ in false }, send: { _ in throw APIError.server(statusCode: 500, detail: nil) }) } catch {}
        #expect(try await queue.items(account: "a").count == 1)
    }
    @Test func lostResponseReconcilesWithoutResending() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file); let receipt = QueueReceipt()
        try await queue.enqueue(PendingIdea(account: "a", name: "Book"))
        do { try await queue.flush(account: "a", find: { _ in false }, send: { _ in await receipt.sent(); throw URLError(.timedOut) }) } catch {}
        let restored = IdeaQueue(file: file)
        try await restored.flush(account: "a", find: { _ in true }, send: { _ in await receipt.sent() })
        #expect(await receipt.count == 1)
        #expect(try await restored.items(account: "a").isEmpty)
    }
    @Test func ambiguousRequestNeverBlindlyRetries() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file); let receipt = QueueReceipt()
        try await queue.enqueue(PendingIdea(account: "a", name: "Book"))
        do { try await queue.flush(account: "a", find: { _ in false }, send: { _ in await receipt.sent(); throw URLError(.timedOut) }) } catch {}
        try await queue.flush(account: "a", find: { _ in false }, send: { _ in await receipt.sent() })
        #expect(await receipt.count == 1)
        #expect(try await queue.items(account: "a").first?.attempted == true)
    }
    @Test func timedOutWithoutCreationCanBeRetriedAfterFreshLookup() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file)
        let idea = PendingIdea(account: "fixture#1", name: "Paper kite")
        let receipt = QueueReceipt()
        try await queue.enqueue(idea)
        await #expect(throws: URLError(.timedOut)) {
            try await queue.flush(account: idea.account, find: { _ in false }, send: { _ in throw URLError(.timedOut) })
        }
        let restored = IdeaQueue(file: file)
        await #expect(throws: URLError(.notConnectedToInternet)) {
            try await restored.flush(account: idea.account, retrying: idea.id,
                                     find: { _ in throw URLError(.notConnectedToInternet) },
                                     send: { _ in await receipt.sent() })
        }
        #expect(await receipt.count == 0)
        #expect(try await restored.items(account: idea.account).first?.attempted == true)
        try await restored.flush(account: idea.account, retrying: idea.id, find: { _ in false },
                                 send: { _ in await receipt.sent() })
        #expect(await receipt.count == 1)
        #expect(try await restored.items(account: idea.account).isEmpty)
    }

    @Test func anOfflineManualRetryKeepsTheOriginalAttemptAmbiguous() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file)
        let idea = PendingIdea(account: "fixture#1", name: "Paper kite")
        let receipt = QueueReceipt()
        try await queue.enqueue(idea)
        await #expect(throws: URLError(.timedOut)) {
            try await queue.flush(account: idea.account, find: { _ in false }, send: { _ in throw URLError(.timedOut) })
        }
        await #expect(throws: URLError(.cannotConnectToHost)) {
            try await queue.flush(account: idea.account, retrying: idea.id, find: { _ in false },
                                  send: { _ in throw URLError(.cannotConnectToHost) })
        }
        try await queue.flush(account: idea.account, find: { _ in false }, send: { _ in await receipt.sent() })
        #expect(await receipt.count == 0)
        #expect(try await queue.items(account: idea.account).first?.attempted == true)
    }

    @Test func retryReconcilesExistingReceiptAndDiscardIsAccountScoped() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file)
        let idea = PendingIdea(account: "fixture#1", name: "Paper lantern")
        let other = PendingIdea(account: "fixture#2", name: "Card game")
        try await queue.enqueue(idea)
        try await queue.enqueue(other)
        try await queue.discard(idea.id, account: other.account)
        #expect(try await queue.items(account: idea.account) == [idea])
        await #expect(throws: URLError(.timedOut)) {
            try await queue.flush(account: idea.account, find: { _ in false }, send: { _ in throw URLError(.timedOut) })
        }
        let receipt = QueueReceipt()
        try await queue.flush(account: idea.account, retrying: idea.id, find: { _ in true },
                              send: { _ in await receipt.sent() })
        #expect(await receipt.count == 0)
        #expect(try await queue.items(account: idea.account).isEmpty)
        try await queue.discard(other.id, account: other.account)
        #expect(try await queue.items(account: other.account).isEmpty)
    }

    @Test func supportedSourceMarkerAndSessionIsolation() async throws {
        let client = APIClient(address: .fixture, transport: FixtureTransport(scenario: .sample), tokenStore: MemoryTokenStore(token: FixtureTransport.token))
        let session = try await client.captureSession()
        let idea = PendingIdea(account: "a", name: "Hartwell sketchbook")
        try await client.sendCapture(idea, session: session)
        #expect(try await client.containsCapture(idea.id, session: session))
        try await client.logout()
        _ = try await client.login(email: "sam@hartwell.example", password: "fixture-only-password")
        await #expect(throws: APIError.sessionChanged) { try await client.sendCapture(idea, session: session) }
    }
    @Test func rejectedItemDoesNotBlockLaterCapture() async throws {
        let file = location(); defer { try? FileManager.default.removeItem(at: file) }
        let queue = IdeaQueue(file: file); let receipt = QueueReceipt()
        try await queue.enqueue(PendingIdea(account: "a", name: "Rejected"))
        try await queue.enqueue(PendingIdea(account: "a", name: "Book"))
        try await queue.flush(account: "a", find: { _ in false }, send: { idea in
            if idea.name == "Rejected" { throw APIError.server(statusCode: 422, detail: nil) }
            await receipt.sent()
        })
        #expect(await receipt.count == 1)
        #expect(try await queue.items(account: "a").first?.rejection == 422)
    }

}
private actor QueueReceipt { var count = 0; func sent() { count += 1 } }
