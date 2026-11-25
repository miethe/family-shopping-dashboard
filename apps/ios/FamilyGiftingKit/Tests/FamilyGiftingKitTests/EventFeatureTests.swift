import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("Event timeline and planning")
struct EventFeatureTests {
    @Test func calendarUsesDatedPlansWithoutDuplicatingTheirOccasions() throws {
        let decoder = WireFormat.decoder()
        let birthday = try decoder.decode(Occasion.self, from: Data(Self.birthday.utf8))
        let holiday = try decoder.decode(Occasion.self, from: Data(Self.christmas.utf8))
        let plan = try decoder.decode(EventPlan.self, from: Data(Self.christmasPlan.utf8))
        let datedBirthday = try #require(CalendarDate("2026-11-25"))

        let entries = EventCalendarEntry.timeline(plans: [plan], occasions: [holiday, birthday])

        #expect(entries.map(\.id) == [.occasion(7, datedBirthday), .plan(31)])
        #expect(entries.map(\.date.rawValue) == ["2026-11-25", "2026-12-25"])
        #expect(entries.map(\.season) == ["Autumn", "Winter"])
        #expect(entries.map(\.year) == [2026, 2026])
        #expect(entries.first?.isClosed == false)
        #expect(entries.last?.plan?.giftCount == 3)
        #expect(entries.last?.plan?.envelopes.first?.gifts.first?.price == Decimal(string: "19.25"))
    }

    @Test func holidaysSortByNextDateAcrossYearsAndPreserveMajorStatus() throws {
        let decoder = WireFormat.decoder()
        let holidayData = """
        [
          {"id":3,"name":"New Year’s Day","key":"new-year","month":1,"day":1,"is_major":true,
           "theme_key":null,"theme_window_days":30,"next_date":"2027-01-01","days_until":39},
          {"id":4,"name":"Hanukkah","key":"hanukkah","month":12,"day":4,"is_major":false,
           "theme_key":null,"theme_window_days":30,"next_date":"2026-12-04","days_until":11},
          {"id":2,"name":"Christmas","key":"christmas","month":12,"day":25,"is_major":true,
           "theme_key":"christmas","theme_window_days":45,"next_date":"2026-12-25","days_until":32}
        ]
        """
        let catalog = try decoder.decode([Holiday].self, from: Data(holidayData.utf8))
        #expect(Holiday.upcoming(catalog).map(\.name) == ["Hanukkah", "Christmas", "New Year’s Day"])
        #expect(Holiday.upcoming(catalog).map(\.isMajor) == [false, true, true])
        #expect(Holiday.upcoming(catalog, matching: "  CHRIST ").map(\.id) == [2])
    }

    @Test func holidayLinkAndPlanWritesUseTheAuthenticatedServerContract() async throws {
        let transport = EventRecordingTransport([
            (201, Self.christmas), (201, Self.christmasPlan),
            (200, Self.christmasPlan.replacingOccurrences(of: #""closed":false"#, with: #""closed":true"#)),
            (200, #"{"theme_key":"christmas"}"#)
        ])
        let client = APIClient(address: .fixture, transport: transport, tokenStore: MemoryTokenStore(token: "fixture-token"))
        let date = try #require(CalendarDate("2026-12-25"))

        let occasion = try await client.createEventOccasion(EventOccasionCreate(
            name: "Christmas", type: .holiday, date: date, holidayId: 2
        ))
        let plan = try await client.createEventPlan(occasionId: occasion.id, date: date, budgetTotal: 500)
        #expect(plan.occasionId == occasion.id)
        #expect(try await client.setEventPlanClosed(id: plan.id, closed: true).closed)
        #expect(try await client.activeTheme().themeKey == "christmas")

        let requests = await transport.requests
        #expect(requests.map(\.httpMethod) == ["POST", "POST", "PATCH", "GET"])
        #expect(requests.compactMap { $0.url?.path } == [
            "/api/v1/occasions", "/api/v1/gifting/occurrences", "/api/v1/gifting/occurrences/31",
            "/api/v1/holidays/active-theme"
        ])
        #expect(requests.allSatisfy { $0.value(forHTTPHeaderField: "Authorization") == "Bearer fixture-token" })
        let occasionBody = try #require(requests[0].httpBody)
        let encodedOccasion = try JSONDecoder().decode([String: JSONValue].self, from: occasionBody)
        #expect(encodedOccasion == ["name": .string("Christmas"), "date": .string("2026-12-25"),
                                    "type": .string("holiday"), "holiday_id": .number(2)])
        let planBody = try #require(requests[1].httpBody)
        let encodedPlan = try JSONDecoder().decode([String: JSONValue].self, from: planBody)
        #expect(encodedPlan == ["occasion_id": .number(12), "date": .string("2026-12-25"), "budget_total": .number(500)])
    }

    @Test func birthdayUsesGregorianDateOnlyValuesInTheRecurrenceRule() throws {
        let birthDate = try #require(CalendarDate("2028-02-29"))
        let date = try #require(CalendarDate(localDate: birthDate.date))
        let request = EventOccasionCreate(name: "Juno Hartwell’s birthday", type: .recurring, date: date, birthday: true)

        let body = try WireFormat.encoder().encode(request)
        let encoded = try JSONDecoder().decode([String: JSONValue].self, from: body)
        #expect(encoded["date"] == .string("2028-02-29"))
        #expect(encoded["subtype"] == .string("birthday"))
        #expect(encoded["recurrence_rule"] == .object(["month": .number(2), "day": .number(29)]))
    }

    private static let christmas = """
    {"id":12,"name":"Christmas","type":"holiday","date":"2026-12-25","description":null,
     "recurrence_rule":null,"is_active":true,"next_occurrence":null,"subtype":null,"holiday_id":2,
     "person_ids":[],"created_at":"2026-11-23T15:00:00Z","updated_at":"2026-11-23T15:00:00Z"}
    """

    private static let birthday = """
    {"id":7,"name":"Juno Hartwell’s birthday","type":"recurring","date":"2025-11-25","description":null,
     "recurrence_rule":{"month":11,"day":25},"is_active":true,"next_occurrence":"2026-11-25",
     "subtype":"birthday","holiday_id":null,"person_ids":[8],
     "created_at":"2025-11-25T15:00:00Z","updated_at":"2026-11-23T15:00:00Z"}
    """

    private static let christmasPlan = """
    {"id":31,"occasion_id":12,"name":"Christmas","date":"2026-12-25","closed":false,"budget_total":"500.00",
     "allocated":"65.00","remaining_money":"480.75","spent":"19.25","planned":"19.25","purchased_count":1,
     "unknown_prices":2,"phases":{"considering":2,"bought":1,"in_hand":0,"given":0},
     "envelopes":[{"id":14,"person_id":8,"person_name":"Juno Hartwell","money_allowance":"65.00",
     "count_allowance":3,"gifts":[{"id":16,"placement_id":19,"name":"Drawing pencil set","price":"19.25",
     "phase":"bought","quantity":1}]}]}
    """
}

private actor EventRecordingTransport: HTTPTransport {
    private var responses: [HTTPResponse]
    private(set) var requests: [URLRequest] = []

    init(_ responses: [(Int, String)]) {
        self.responses = responses.map { HTTPResponse(statusCode: $0.0, body: Data($0.1.utf8)) }
    }

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        requests.append(request)
        guard !responses.isEmpty else { throw APIError.invalidResponse }
        return responses.removeFirst()
    }
}
