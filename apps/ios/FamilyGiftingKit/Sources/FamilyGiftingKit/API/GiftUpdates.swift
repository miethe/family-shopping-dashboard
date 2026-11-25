import Foundation

public struct GiftUpdate: Encodable, Sendable {
    public let name: String?
    public let url: String?
    public let notes: String?
    public let price: Decimal?
    public let status: GiftStatus?

    public init(name: String? = nil, url: String? = nil, notes: String? = nil, price: Decimal? = nil, status: GiftStatus? = nil) {
        self.name = name
        self.url = url
        self.notes = notes
        self.price = price
        self.status = status
    }
}

public struct IdeaConversion: Decodable, Sendable {
    public let id: Int
    public let giftId: Int
    public let status: GiftStatus
}

public extension APIClient {
    func updateGift(id: Int, _ input: GiftUpdate) async throws -> Gift {
        try await request("/api/v1/gifts/\(id)", method: "PATCH", body: WireFormat.encoder().encode(input))
    }

    /// Inbox identities refer to list items, each of which has its own lifecycle.
    func selectIdea(id: Int) async throws -> IdeaConversion {
        let input = GiftUpdate(status: .selected)
        return try await request("/api/v1/list-items/\(id)/status", method: "PUT", body: WireFormat.encoder().encode(input))
    }
}

public extension Gift {
    /// A list can move an idea forward independently of its catalog entry.
    var planningStatus: GiftStatus {
        GiftStatus.allCases.last { stage in
            stage == status || listItems.contains { $0.status == stage.rawValue }
        } ?? status
    }
}

public extension IdeaInbox {
    func removingIdea(id: Int) -> IdeaInbox {
        guard ideas.contains(where: { $0.id == id }) else { return self }
        return IdeaInbox(ideas: ideas.filter { $0.id != id }, total: max(0, total - 1))
    }
}
