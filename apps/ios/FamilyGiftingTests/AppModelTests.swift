import XCTest
import UIKit
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

}
