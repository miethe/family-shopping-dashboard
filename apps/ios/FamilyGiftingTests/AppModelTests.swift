import XCTest
import UIKit
import FamilyGiftingKit
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
