import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("FastAPI wire contracts")
struct FixtureContractTests {
    @Test func sampleDecodesDashboardPeopleAndGroups() async throws {
        let client = fixture()
        let dashboard = try await client.dashboard()
        let occasion = try #require(dashboard.primaryOccasion)
        #expect(occasion.name == "Juno’s Birthday")
        #expect(occasion.date.rawValue == "2026-12-09")
        #expect(occasion.daysUntil == 16)
        #expect(dashboard.peopleNeedingGifts.first?.giftCounts["needed"] == 1)
        #expect(dashboard.totalIdeas == 3)

        let page = try await client.persons(limit: 2)
        #expect(page.items.map(\.displayName) == ["Sam Hartwell", "Riley Hartwell"])
        #expect(page.hasMore)
        let cursor = try #require(page.nextCursor)
        let next = try await client.persons(cursor: cursor)
        #expect(next.items.first?.displayName == "Juno Hartwell")
        #expect(next.items.last?.displayName == "Pop Dee")
        #expect(next.nextCursor == nil)

        let person = try await client.person(id: 3)
        #expect(person.birthdate?.rawValue == "2014-12-09")
        #expect(person.sizeProfile?.first?.value == "US 5")
        #expect(person.sizes?["shoe"] == .string("US 5"))
        #expect(person.advancedInterests?["hobbies_and_media"] != nil)
        #expect(person.occasionIds == [1, 2])
        #expect(person.groups.first?.name == "At Home")

        let groups = try await client.groups()
        #expect(groups.items.map(\.memberCount) == [5, 2])
        let group = try await client.group(id: 2)
        #expect(group.name == "Grandparents")
        #expect(try await client.persons(groupId: group.id).items.map(\.displayName) == ["Nana Jo", "Pop Dee"])
    }

    @Test func sampleDecodesGiftsAndInbox() async throws {
        let client = fixture()
        let gifts = try await client.gifts(personIds: [3], statuses: [.purchased], occasionIds: [1])
        #expect(gifts.items.map(\.id) == [7])
        let gift = try await client.gift(id: 7)
        #expect(gift.price == 32)
        #expect(gift.salePrice == 28)
        #expect(gift.purchaseDate?.rawValue == "2026-11-20")
        #expect(gift.giftPeople.first?.personId == 3)
        #expect(gift.listItems.first?.listName == "Juno’s Birthday")

        let inbox = try await client.ideas(limit: 2)
        #expect(inbox.total == 2)
        #expect(inbox.ideas.first?.name == "Pocket constellation guide")
        #expect(inbox.ideas.first?.price == Decimal(string: "12.50"))
        #expect(inbox.ideas.first?.addedBy.email == "sam@hartwell.example")
    }

    @Test func sampleDecodesOccasionsHolidaysBudgetsAndActivity() async throws {
        let client = fixture()
        let occasions = try await client.occasions()
        #expect(occasions.items.count == 3)
        let event = try await client.occasion(id: 1)
        #expect(event.type == .recurring)
        #expect(event.nextOccurrence == event.date)
        #expect(event.recurrenceRule?["frequency"] == .string("yearly"))

        let holidays = try await client.holidays()
        #expect(holidays.first?.nextDate.rawValue == "2026-12-25")
        #expect(try await client.activeTheme().themeKey == nil)

        let budget = try await client.budget(occasionId: event.id)
        #expect(budget.budgetTotal == 140)
        #expect(budget.purchasedAmount == 28)
        #expect(budget.plannedAmount == Decimal(string: "12.50"))
        #expect(budget.remainingAmount == Decimal(string: "99.50"))
        #expect(budget.hasBudget)

        let personBudget = try await client.personBudget(personId: 3, occasionId: 1)
        #expect(personBudget.giftsAssignedCount == 2)
        #expect(personBudget.giftsAssignedTotal == Decimal(string: "40.50"))

        let activity = try await client.activity(limit: 2)
        #expect(activity.events.count == 2)
        #expect(activity.total == 3)
        #expect(activity.events.first?.message == "Riley marked Watercolor field kit as purchased")
        #expect(activity.events.last?.message == "Sam changed Build-your-own marble run from idea to selected")
    }

    @Test func emptyAndChristmasUseDistinctContent() async throws {
        let empty = fixture(.empty)
        #expect(try await empty.dashboard().primaryOccasion == nil)
        #expect(try await empty.persons().items.isEmpty)
        #expect(try await empty.groups().items.isEmpty)
        #expect(try await empty.gifts().items.isEmpty)
        #expect(try await empty.occasions().items.isEmpty)
        #expect(try await empty.holidays().isEmpty)
        #expect(try await empty.ideas().total == 0)
        #expect(try await empty.activity().events.isEmpty)
        #expect(try await empty.activeTheme().themeKey == nil)

        let christmas = fixture(.christmas)
        #expect(try await christmas.dashboard().primaryOccasion?.name == "Christmas")
        #expect(try await christmas.activeTheme().themeKey == "christmas")
        #expect(try await christmas.budget(occasionId: 2).budgetTotal == 500)
    }

    @Test func fixtureSignInAndGiftCreationWorkThroughTypedClient() async throws {
        let store = MemoryTokenStore()
        let client = APIClient(address: .fixture, transport: FixtureTransport(scenario: .empty), tokenStore: store)
        let user = try await client.login(email: "sam@hartwell.example", password: "fixture-password")
        #expect(user.email == "sam@hartwell.example")
        #expect(try await client.me().id == user.id)
        let gift = try await client.createGift(GiftCreate(name: "Sketching pencils", notes: "For drawing.", price: 8.25))
        #expect(gift.status == .idea)
        #expect(gift.price == Decimal(string: "8.25"))
        #expect(try await client.gifts().items.map(\.name) == ["Sketching pencils"])
        #expect(try await client.gift(id: gift.id).notes == "For drawing.")
        #expect(try await client.refreshSession().accessToken == FixtureTransport.token)
        try await client.logout()
        await #expect(throws: APIError.missingSession) { try await client.me() }
    }

    @Test func dateOnlyValuesAreValidatedAndDisplayOnTheSameDay() throws {
        #expect(CalendarDate("2025-02-29") == nil)
        #expect(CalendarDate("2026-12-31T00:00:00Z") == nil)
        let date = try #require(CalendarDate("2028-02-29"))
        var localCalendar = Calendar(identifier: .gregorian)
        localCalendar.timeZone = .current
        #expect(localCalendar.component(.day, from: date.date) == 29)
        #expect(CalendarDate("2028-01-31").map { $0 < date } == true)
        #expect(try JSONDecoder().decode(CalendarDate.self, from: JSONEncoder().encode(date)) == date)
    }

    @Test func moneyAcceptsNumberOrDecimalStringButRejectsMalformedAmounts() throws {
        let decoder = WireFormat.decoder()
        let quoted = try decoder.decode(Money.self, from: Data(#""18.99""#.utf8))
        let unquoted = try decoder.decode(Money.self, from: Data("18.99".utf8))
        #expect(quoted.wrappedValue == unquoted.wrappedValue)
        #expect(quoted.wrappedValue == Decimal(string: "18.99"))
        #expect(throws: DecodingError.self) {
            try decoder.decode(Money.self, from: Data(#""18.99 dollars""#.utf8))
        }
    }

    private func fixture(_ scenario: FixtureScenario = .sample) -> APIClient {
        APIClient(address: .fixture, transport: FixtureTransport(scenario: scenario), tokenStore: MemoryTokenStore(token: FixtureTransport.token))
    }
}

#if os(macOS)
@Test("Committed Confetti tokens match the generator")
func generatedTokensAreCurrent() throws {
    let iosDirectory = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent().deletingLastPathComponent()
        .deletingLastPathComponent().deletingLastPathComponent()
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
    process.arguments = ["python3", iosDirectory.appendingPathComponent("Scripts/generate-tokens.py").path, "--check"]
    let diagnostics = Pipe()
    process.standardOutput = diagnostics
    process.standardError = diagnostics
    try process.run()
    let output = diagnostics.fileHandleForReading.readDataToEndOfFile()
    process.waitUntilExit()
    #expect(process.terminationStatus == 0, "\(String(decoding: output, as: UTF8.self))")
}
#endif
