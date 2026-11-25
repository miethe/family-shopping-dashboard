import Foundation

public struct EventOccasionCreate: Encodable, Sendable {
    public let name: String
    public let type: OccasionType
    public let date: CalendarDate
    public let holidayId: Int?
    public let subtype: String?
    public let recurrenceRule: [String: JSONValue]?

    public init(name: String, type: OccasionType, date: CalendarDate, holidayId: Int? = nil, birthday: Bool = false) {
        self.name = name
        self.type = type
        self.date = date
        self.holidayId = holidayId
        self.subtype = birthday ? "birthday" : nil
        let parts = CalendarDate.eventCalendar.dateComponents([.month, .day], from: date.date)
        if birthday, let month = parts.month, let day = parts.day {
            recurrenceRule = ["month": .number(Decimal(month)), "day": .number(Decimal(day))]
        } else {
            recurrenceRule = nil
        }
    }
}

public struct HolidayCreate: Encodable, Sendable {
    public let name: String
    public let key: String
    public let month: Int
    public let day: Int
    public let isMajor: Bool

    public init(name: String, key: String, month: Int, day: Int, isMajor: Bool) {
        self.name = name
        self.key = key
        self.month = month
        self.day = day
        self.isMajor = isMajor
    }
}

public struct EventPlan: Decodable, Identifiable, Sendable {
    public let id: Int
    public let occasionId: Int
    public let name: String
    public let date: CalendarDate
    public let closed: Bool
    @OptionalMoney public var budgetTotal: Decimal?
    @Money public var spent: Decimal
    @Money public var planned: Decimal
    public let purchasedCount: Int
    public let unknownPrices: Int
    public let phases: [String: Int]
    public let envelopes: [EventEnvelope]

    public var giftCount: Int { phases.values.reduce(0, +) }
}

public struct EventEnvelope: Decodable, Identifiable, Sendable {
    public let id: Int
    public let personId: Int
    public let personName: String
    @OptionalMoney public var moneyAllowance: Decimal?
    public let countAllowance: Int?
    public let gifts: [EventPlanGift]
}

public struct EventPlanGift: Decodable, Sendable {
    public let id: Int
    public let name: String
    public let placementId: Int?
    @OptionalMoney public var price: Decimal?
    public let quantity: Int
    public let phase: String
}

extension APIClient {
    public func createEventOccasion(_ input: EventOccasionCreate) async throws -> Occasion {
        try await request("/api/v1/occasions", method: "POST", body: WireFormat.encoder().encode(input))
    }

    public func createHoliday(_ input: HolidayCreate) async throws -> Holiday {
        try await request("/api/v1/holidays", method: "POST", body: WireFormat.encoder().encode(input))
    }

    public func eventPlans() async throws -> [EventPlan] {
        try await request("/api/v1/gifting/occurrences")
    }

    public func eventPlan(id: Int) async throws -> EventPlan {
        try await request("/api/v1/gifting/occurrences/\(id)")
    }

    public func createEventPlan(occasionId: Int, date: CalendarDate, budgetTotal: Decimal?) async throws -> EventPlan {
        let input = EventPlanCreate(occasionId: occasionId, date: date, budgetTotal: budgetTotal)
        return try await request("/api/v1/gifting/occurrences", method: "POST", body: WireFormat.encoder().encode(input))
    }

    public func setEventPlanClosed(id: Int, closed: Bool) async throws -> EventPlan {
        try await request("/api/v1/gifting/occurrences/\(id)", method: "PATCH",
                          body: WireFormat.encoder().encode(EventPlanClose(closed: closed)))
    }
}

private struct EventPlanCreate: Encodable {
    let occasionId: Int
    let date: CalendarDate
    let budgetTotal: Decimal?
}

private struct EventPlanClose: Encodable {
    let closed: Bool
}

extension CalendarDate {
    public init?(localDate: Date) {
        let parts = Self.eventCalendar.dateComponents([.year, .month, .day], from: localDate)
        guard let year = parts.year, let month = parts.month, let day = parts.day else { return nil }
        self.init(String(format: "%04d-%02d-%02d", year, month, day))
    }

    fileprivate static var eventCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .current
        return calendar
    }
}

public struct EventCalendarEntry: Identifiable, Sendable {
    public enum ID: Hashable, Sendable {
        case plan(Int)
        case occasion(Int, CalendarDate)
    }

    public let id: ID
    public let name: String
    public let date: CalendarDate
    public let isClosed: Bool
    public let plan: EventPlan?

    public var year: Int { CalendarDate.eventCalendar.component(.year, from: date.date) }

    public var season: String {
        switch CalendarDate.eventCalendar.component(.month, from: date.date) {
        case 3...5: "Spring"
        case 6...8: "Summer"
        case 9...11: "Autumn"
        default: "Winter"
        }
    }

    public static func timeline(plans: [EventPlan], occasions: [Occasion]) -> [Self] {
        var plannedDates = Set<ID>()
        let entries = plans.map { plan in
            plannedDates.insert(.occasion(plan.occasionId, plan.date))
            return Self(id: .plan(plan.id), name: plan.name, date: plan.date, isClosed: plan.closed, plan: plan)
        }
        let remaining = occasions.compactMap { occasion -> Self? in
            let date = occasion.isActive ? occasion.nextOccurrence ?? occasion.date : occasion.date
            let id = ID.occasion(occasion.id, date)
            guard !plannedDates.contains(id) else { return nil }
            return Self(id: id, name: occasion.name, date: date, isClosed: !occasion.isActive, plan: nil)
        }
        return (entries + remaining).sorted {
            if $0.date != $1.date { return $0.date < $1.date }
            return $0.name.localizedStandardCompare($1.name) == .orderedAscending
        }
    }
}

extension Holiday {
    public static func upcoming(_ holidays: [Self], matching search: String = "") -> [Self] {
        let query = search.trimmingCharacters(in: .whitespacesAndNewlines)
        return holidays.filter { query.isEmpty || $0.name.localizedCaseInsensitiveContains(query) }
            .sorted {
                if $0.nextDate != $1.nextDate { return $0.nextDate < $1.nextDate }
                return ($0.name, $0.id) < ($1.name, $1.id)
            }
    }
}
