import XCTest
import UIKit
import FamilyGiftingKit
import GiftingExtensions
@testable import FamilyGifting

@MainActor
final class AppModelTests: XCTestCase {
    func testSampleLoadsAndSignOutClearsData() async {
        let model = AppModel(arguments: ["app", "--fixture", "sample"])
        await model.start()
        XCTAssertTrue(model.signedIn)
        XCTAssertTrue(model.loaded)
        XCTAssertNotNil(model.dashboard)
        await model.signOut()
        XCTAssertFalse(model.signedIn)
        XCTAssertNil(model.dashboard)
        XCTAssertTrue(model.people.isEmpty)
    }

    func testEmptyAndChristmasFixtures() async {
        let empty = AppModel(arguments: ["app", "--fixture", "empty"])
        await empty.start()
        XCTAssertTrue(empty.loaded)
        XCTAssertTrue(empty.people.isEmpty)
        let christmas = AppModel(arguments: ["app", "--fixture", "christmas"])
        await christmas.start()
        XCTAssertTrue(christmas.christmas)
    }

    func testBundledFontsAreRegistered() {
        XCTAssertNotNil(UIFont(name: "Montserrat-Bold", size: 16))
        XCTAssertNotNil(UIFont(name: "OpenSans", size: 16))
    }

    func testSignInFixtureStartsSignedOut() async {
        let model = AppModel(arguments: ["app", "--fixture", "signin"])
        await model.start()
        XCTAssertTrue(model.configured)
        XCTAssertFalse(model.signedIn)
    }
    func testOfflineCaptureStaysVisible() async {
        let model = AppModel(arguments: ["app", "--fixture", "sample", "--offline"])
        await model.start()
        let saved = await model.saveIdea(name: "Hartwell art set", url: "", notes: "", personIds: [])
        XCTAssertTrue(saved)
        XCTAssertEqual(model.pendingIdeas.count, 1)
        XCTAssertFalse(model.pendingIdeas[0].attempted)
        await model.flushIdeas()
        XCTAssertEqual(model.pendingIdeas.count, 1)
    }

    func testOnlineCaptureAppearsInCatalogInbox() async {
        let model = AppModel(arguments: ["app", "--fixture", "sample"])
        await model.start()
        let saved = await model.saveIdea(name: "Hartwell kite", url: "", notes: "", personIds: [])
        XCTAssertTrue(saved)
        XCTAssertTrue(model.pendingIdeas.isEmpty)
        XCTAssertTrue(model.gifts.contains { $0.name == "Hartwell kite" })
    }

    func testNativeHomeDestinations() {
        let model = AppModel(arguments: ["app", "--fixture", "sample"])
        model.open("/people/3/profile", title: "Juno")
        XCTAssertEqual(model.native?.path, "/people/3/profile")
        XCTAssertNil(model.web)
        model.open("/ideas", title: "Ideas")
        XCTAssertTrue(model.showIdeas)
        model.open("/budgets", title: "Budget")
        XCTAssertEqual(model.web?.path, "/budgets")
    }

    func testSignOutHidesPendingAndNativeSheets() async {
        let model = AppModel(arguments: ["app", "--fixture", "sample", "--offline"])
        await model.start()
        _ = await model.saveIdea(name: "Hartwell book", url: "", notes: "", personIds: [])
        model.open("/people/new", title: "Add")
        await model.signOut()
        XCTAssertTrue(model.pendingIdeas.isEmpty)
        XCTAssertNil(model.native)
        XCTAssertFalse(model.showIdeas)
    }

    func testExtensionCaptureImportsIntoOfflineQueueAndSignOutClearsCountdown() async throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let store = ExtensionStore(directory: root.appendingPathComponent("shared"))
        let transport = ExtensionTestTransport()
        let client = try await extensionFixture(transport: transport)
        let model = AppModel(arguments: ["app", "--fixture", "sample", "--offline"], fixtureClient: client,
                             extensionStore: store, journalFile: root.appendingPathComponent("journal.json"))
        await model.start()
        let binding = try XCTUnwrap(store.binding())
        XCTAssertNotNil(try store.countdown())
        try store.save(SharedIdeaDraft(name: "Hartwell paper kite", url: "https://example.invalid/kite", notes: nil),
                       using: binding)
        await transport.setOffline(true)
        await model.resume()
        XCTAssertEqual(model.pendingIdeas.map(\.name), ["Hartwell paper kite"])
        await transport.setOffline(false)
        await model.signOut()
        XCTAssertNil(try store.binding())
        XCTAssertNil(try store.countdown())
        XCTAssertTrue(model.pendingIdeas.isEmpty)
        await model.authenticate(email: "sam@hartwell.example", password: "fixture-password", register: false)
        XCTAssertEqual(model.pendingIdeas.map(\.name), ["Hartwell paper kite"])
    }

    func testChangingServerInvalidatesExtensionBindingAndCountdown() async throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let store = ExtensionStore(directory: root)
        let client = try await extensionFixture(transport: FixtureTransport(scenario: .sample))
        let model = AppModel(arguments: ["app", "--fixture", "sample"], fixtureClient: client,
                             extensionStore: store, journalFile: root.appendingPathComponent("journal.json"))
        await model.start()
        XCTAssertNotNil(try store.countdown())
        await model.configure("https://other.example.invalid")
        XCTAssertNil(try store.countdown())
        XCTAssertNil(try store.binding())
    }

    func testExpiredLoginClearsCountdownAndKeepsOfflineShareBinding() async throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let store = ExtensionStore(directory: root.appendingPathComponent("shared"))
        let tokens = MemoryTokenStore(token: FixtureTransport.token)
        let client = try await extensionFixture(transport: FixtureTransport(scenario: .sample), tokens: tokens)
        let model = AppModel(arguments: ["app", "--fixture", "sample"], fixtureClient: client,
                             extensionStore: store, journalFile: root.appendingPathComponent("journal.json"))
        await model.start()
        let binding = try XCTUnwrap(store.binding())
        XCTAssertNotNil(try store.countdown())
        tokens.write(SessionCredential(accessToken: FixtureTransport.token, expiresAt: .distantPast))
        await model.resume()
        XCTAssertFalse(model.signedIn)
        XCTAssertTrue(model.canCaptureOffline)
        XCTAssertNil(try store.countdown())
        XCTAssertEqual(try store.binding(), binding)
        try store.save(SharedIdeaDraft(name: "Kite", url: nil, notes: nil), using: binding)
    }

    private func extensionFixture(transport: any HTTPTransport,
                                  tokens: MemoryTokenStore = MemoryTokenStore(token: FixtureTransport.token)) async throws -> APIClient {
        let client = APIClient(address: .fixture, transport: transport, tokenStore: tokens)
        let nextWeek = try XCTUnwrap(Calendar.current.date(byAdding: .day, value: 7, to: .now))
        let date = try XCTUnwrap(CalendarDate(localDate: nextWeek))
        _ = try await client.createEventOccasion(EventOccasionCreate(name: "Kite Day", type: .other, date: date))
        return client
    }

    func testOptionalFeedFailuresLeaveEverydayLoopLoaded() async {
        let client = APIClient(address: .fixture, transport: BrokenFeeds(), tokenStore: MemoryTokenStore(token: FixtureTransport.token))
        let model = AppModel(arguments: ["app", "--fixture", "sample"], fixtureClient: client)
        await model.start()
        XCTAssertTrue(model.loaded)
        XCTAssertNotNil(model.dashboard)
        XCTAssertFalse(model.people.isEmpty)
        XCTAssertFalse(model.gifts.isEmpty)
        XCTAssertFalse(model.occasions.isEmpty)
        XCTAssertNil(model.inbox)
        XCTAssertTrue(model.holidays.isEmpty)
        XCTAssertNil(model.activity)
        XCTAssertNil(model.budget)
        XCTAssertNil(model.error)
    }

    func testExpiredSessionCanCaptureAndSameAccountRecoversItsJournal() async throws {
        let store = MemoryTokenStore()
        let client = APIClient(address: .fixture, transport: FixtureTransport(scenario: .sample, offlineWrites: true), tokenStore: store)
        _ = try await client.login(email: "sam@hartwell.example", password: "fixture-password")
        let before = try XCTUnwrap(store.read())
        var encoded = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(before)) as? [String: Any])
        encoded["expiresAt"] = Date.distantPast.timeIntervalSinceReferenceDate
        store.write(try JSONDecoder().decode(SessionCredential.self, from: JSONSerialization.data(withJSONObject: encoded)))

        let model = AppModel(arguments: ["app", "--fixture", "sample"], fixtureClient: client)
        await model.start()
        XCTAssertFalse(model.signedIn)
        XCTAssertTrue(model.canCaptureOffline)
        let saved = await model.saveIdea(name: "Hartwell travel game", url: "", notes: "", personIds: [])
        XCTAssertTrue(saved)
        await model.authenticate(email: "sam@hartwell.example", password: "fixture-password", register: false)
        XCTAssertEqual(model.pendingIdeas.map(\.name), ["Hartwell travel game"])
        await model.signOut()
        XCTAssertFalse(model.canCaptureOffline)
        XCTAssertTrue(model.pendingIdeas.isEmpty)
        await model.authenticate(email: "sam@hartwell.example", password: "fixture-password", register: false)
        XCTAssertEqual(model.pendingIdeas.map(\.name), ["Hartwell travel game"])
        if let id = model.pendingIdeas.first?.id {
            await model.discardIdea(id)
        }
        XCTAssertTrue(model.pendingIdeas.isEmpty)
    }

}


private actor BrokenFeeds: HTTPTransport {
    private let fixture = FixtureTransport(scenario: .sample)

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        if let path = request.url?.path,
           ["/api/v1/ideas/inbox", "/api/v1/holidays", "/api/v1/activity",
            "/api/v1/budgets/occasions/1/meter"].contains(path) {
            return HTTPResponse(statusCode: 200, body: Data("null".utf8))
        }
        return try await fixture.send(request)
    }
}

private actor ExtensionTestTransport: HTTPTransport {
    private var offline = false
    private let fixture = FixtureTransport(scenario: .sample, offlineWrites: true)

    func setOffline(_ value: Bool) { offline = value }

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        if offline { throw URLError(.notConnectedToInternet) }
        return try await fixture.send(request)
    }
}
