import Foundation

public struct HealthResponse: Codable, Sendable {
    public let status: String
    public let db: String?
}

public struct Page<Item: Codable & Sendable>: Codable, Sendable {
    public let items: [Item]
    public let hasMore: Bool
    public let nextCursor: Int?
}

public struct User: Codable, Identifiable, Sendable {
    public let id: Int
    public let email: String
    public let createdAt: Date
    public let updatedAt: Date
}

struct LoginResponse: Decodable, Sendable {
    let id: Int
    let email: String
    let createdAt: Date
    let updatedAt: Date
    let token: TokenResponse?
    let refreshToken: String?
    let refreshExpiresIn: Int?

    var user: User {
        User(id: id, email: email, createdAt: createdAt, updatedAt: updatedAt)
    }
}

struct TokenResponse: Decodable, Sendable {
    let accessToken: String
    let tokenType: String
    let expiresIn: Int
    let refreshToken: String?
    let refreshExpiresIn: Int?
}

struct Credentials: Encodable, Sendable {
    let email: String
    let password: String
    let client: String?
}

public struct Dashboard: Codable, Sendable {
    public let primaryOccasion: DashboardOccasion?
    public let peopleNeedingGifts: [DashboardPerson]
    public let totalIdeas: Int
    public let totalPurchased: Int
    public let myAssignments: Int
}

public struct DashboardOccasion: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let date: CalendarDate
    public let daysUntil: Int
    public let totalItems: Int
    public let purchasedItems: Int
}

public struct DashboardPerson: Codable, Identifiable, Sendable {
    public let id: Int
    public let displayName: String
    public let pendingGifts: Int
    public let photoUrl: String?
    public let nextOccasion: CalendarDate?
    public let giftCounts: [String: Int]
}

public struct Person: Codable, Identifiable, Sendable {
    public let id: Int
    public let displayName: String
    public let relationship: String?
    public let birthdate: CalendarDate?
    public let anniversary: CalendarDate?
    public let notes: String?
    public let interests: [String]?
    public let sizeProfile: [SizeEntry]?
    public let sizes: [String: JSONValue]?
    public let advancedInterests: [String: JSONValue]?
    public let constraints: String?
    public let photoUrl: String?
    public let groups: [GroupSummary]
    public let occasionIds: [Int]
    public let createdAt: Date
    public let updatedAt: Date
}

public struct SizeEntry: Codable, Sendable {
    public let type: String
    public let value: String
    public let fit: String?
    public let brand: String?
    public let notes: String?
}

public struct GroupSummary: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let color: String?
}

public struct Group: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let description: String?
    public let color: String?
    public let memberCount: Int
    public let createdAt: Date
    public let updatedAt: Date
}

public enum GiftStatus: String, Codable, CaseIterable, Sendable {
    case idea, selected, purchased, received
}

public enum GiftPriority: String, Codable, CaseIterable, Sendable {
    case low, medium, high
}

public struct Gift: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let url: String?
    @OptionalMoney public var price: Decimal?
    public let imageUrl: String?
    public let source: String?
    public let description: String?
    public let notes: String?
    public let priority: GiftPriority
    public let status: GiftStatus
    public let quantity: Int
    @OptionalMoney public var salePrice: Decimal?
    public let purchaseDate: CalendarDate?
    public let additionalUrls: [LabeledLink]
    public let extraData: [String: JSONValue]
    public let fromSanta: Bool
    public let stores: [StoreSummary]
    public let personIds: [Int]
    public let giftPeople: [GiftPersonLink]
    public let listItems: [GiftListItem]
    public let createdAt: Date
    public let updatedAt: Date
}

public struct LabeledLink: Codable, Sendable {
    public let label: String
    public let url: String
}

public struct StoreSummary: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let url: String?
}

public struct GiftPersonLink: Codable, Sendable {
    public let personId: Int
    public let role: String
}

public struct GiftListItem: Codable, Identifiable, Sendable {
    public let id: Int
    public let listId: Int
    public let listName: String
    public let status: String
}

public struct GiftCreate: Encodable, Sendable {
    public let name: String
    public let url: String?
    public let notes: String?
    public let price: Decimal?
    public let personIds: [Int]

    public init(name: String, url: String? = nil, notes: String? = nil, price: Decimal? = nil, personIds: [Int] = []) {
        self.name = name
        self.url = url
        self.notes = notes
        self.price = price
        self.personIds = personIds
    }
}

public struct IdeaInbox: Codable, Sendable {
    public let ideas: [Idea]
    public let total: Int
}

public struct Idea: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let imageUrl: String?
    @OptionalMoney public var price: Decimal?
    public let createdAt: Date
    public let addedBy: UserSummary
}

public struct UserSummary: Codable, Identifiable, Sendable {
    public let id: Int
    public let email: String
}

public enum OccasionType: String, Codable, CaseIterable, Sendable {
    case holiday, recurring, other
}

public struct Occasion: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let type: OccasionType
    public let date: CalendarDate
    public let description: String?
    public let recurrenceRule: [String: JSONValue]?
    public let isActive: Bool
    public let nextOccurrence: CalendarDate?
    public let subtype: String?
    public let holidayId: Int?
    public let personIds: [Int]
    public let createdAt: Date
    public let updatedAt: Date
}

public struct Holiday: Codable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let key: String
    public let month: Int
    public let day: Int
    public let isMajor: Bool
    public let themeKey: String?
    public let themeWindowDays: Int
    public let nextDate: CalendarDate
    public let daysUntil: Int
}

public struct ActiveTheme: Codable, Sendable {
    public let themeKey: String?
}

public struct BudgetMeter: Codable, Sendable {
    @OptionalMoney public var budgetTotal: Decimal?
    @Money public var purchasedAmount: Decimal
    @Money public var plannedAmount: Decimal
    @OptionalMoney public var remainingAmount: Decimal?
    public let purchasedPercent: Double
    public let plannedPercent: Double
    public let remainingPercent: Double
    public let isOverBudget: Bool
    public let hasBudget: Bool
}

public struct PersonBudget: Codable, Sendable {
    public let personId: Int
    public let occasionId: Int?
    public let giftsAssignedCount: Int
    @Money public var giftsAssignedTotal: Decimal
    public let giftsAssignedPurchasedCount: Int
    @Money public var giftsAssignedPurchasedTotal: Decimal
    public let giftsPurchasedCount: Int
    @Money public var giftsPurchasedTotal: Decimal
    public let giftsToPurchaseCount: Int
    @Money public var giftsToPurchaseTotal: Decimal
}

public struct ActivityFeed: Codable, Sendable {
    public let events: [ActivityEvent]
    public let total: Int
}

public struct ActivityEvent: Codable, Identifiable, Sendable {
    public let id: Int
    public let action: String
    public let actor: UserSummary
    public let entityType: String
    public let entityId: Int
    public let entityName: String
    public let extraData: [String: JSONValue]?
    public let createdAt: Date

    /// The server derives this display text in Python instead of serializing it.
    public var message: String {
        let actorName = actor.email.split(separator: "@").first.map(String.init)?.capitalized ?? actor.email
        switch action {
        case "gift_added": return "\(actorName) added \(entityName)"
        case "gift_purchased": return "\(actorName) marked \(entityName) as purchased"
        case "gift_received": return "\(actorName) marked \(entityName) as received"
        case "status_changed":
            let oldStatus = extraData?["old_status"]?.stringValue ?? "unknown"
            let newStatus = extraData?["new_status"]?.stringValue ?? "unknown"
            return "\(actorName) changed \(entityName) from \(oldStatus) to \(newStatus)"
        case "list_created": return "\(actorName) created list \(entityName)"
        case "person_added": return "\(actorName) added \(entityName) to gift recipients"
        case "occasion_created": return "\(actorName) created occasion \(entityName)"
        case "assignment_changed":
            let assignee = extraData?["assignee_name"]?.stringValue ?? "someone"
            return "\(actorName) assigned \(entityName) to \(assignee)"
        default: return "\(actorName) updated \(entityName)"
        }
    }
}
