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
}
