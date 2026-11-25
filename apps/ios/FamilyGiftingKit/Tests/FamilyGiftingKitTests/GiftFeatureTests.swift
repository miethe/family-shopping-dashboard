import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("Native gift mutations")
struct GiftFeatureTests {
    @Test func statusUpdatePatchesTheCatalogWithoutSendingUnchangedFields() async throws {
        let transport = GiftMutationTransport(result: GiftFeaturePayload.gift)
        let client = client(using: transport)
        let result = try await client.updateGift(id: 8, GiftUpdate(status: .purchased))
        let request = try #require(await transport.request)
        let data = try #require(request.httpBody)

        #expect(result.id == 8)
        #expect(result.status == .purchased)
        #expect(request.httpMethod == "PATCH")
        #expect(request.url?.path == "/api/v1/gifts/8")
        #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer fixture-token")
        #expect(try JSONDecoder().decode([String: String].self, from: data) == ["status": "purchased"])
    }

    @Test func emptyNotesAndURLAreSentExplicitlyWhenCleared() throws {
        let data = try WireFormat.encoder().encode(GiftUpdate(url: "", notes: ""))
        #expect(try JSONDecoder().decode([String: String].self, from: data) == ["url": "", "notes": ""])
    }

    @Test func convertingAnInboxIdeaTargetsItsListItem() async throws {
        let transport = GiftMutationTransport(result: #"{"id":81,"gift_id":8,"status":"selected"}"#)
        let client = client(using: transport)
        let conversion = try await client.selectIdea(id: 81)
        let request = try #require(await transport.request)
        let data = try #require(request.httpBody)

        #expect(conversion.id == 81)
        #expect(conversion.giftId == 8)
        #expect(conversion.status == .selected)
        #expect(request.httpMethod == "PUT")
        #expect(request.url?.path == "/api/v1/list-items/81/status")
        #expect(try JSONDecoder().decode([String: String].self, from: data) == ["status": "selected"])
    }

    @Test func planningStatusIncludesProgressFromBothTheCatalogAndLists() throws {
        let catalogPurchase = try gift()
        #expect(catalogPurchase.status == .purchased)
        #expect(catalogPurchase.planningStatus == .purchased)

        let convertedIdea = try gift(catalogStatus: "idea")
        #expect(convertedIdea.status == .idea)
        #expect(convertedIdea.planningStatus == .selected)

        let received = try gift(listStatus: "received")
        #expect(received.planningStatus == .received)
    }

    @Test func removingAConvertedIdeaKeepsOtherListEntries() throws {
        let inbox = try WireFormat.decoder().decode(IdeaInbox.self, from: Data(GiftFeaturePayload.inbox.utf8))
        let updated = inbox.removingIdea(id: 81).removingIdea(id: 81)
        #expect(updated.ideas.map(\.id) == [42])
        #expect(updated.total == 1)
    }

    private func gift(catalogStatus: String = "purchased", listStatus: String = "selected") throws -> Gift {
        let json = GiftFeaturePayload.gift
            .replacingOccurrences(of: #""status":"purchased""#, with: "\"status\":\"\(catalogStatus)\"")
            .replacingOccurrences(of: #""status":"selected""#, with: "\"status\":\"\(listStatus)\"")
        return try WireFormat.decoder().decode(Gift.self, from: Data(json.utf8))
    }

    private func client(using transport: GiftMutationTransport) -> APIClient {
        APIClient(address: .fixture, transport: transport, tokenStore: MemoryTokenStore(token: "fixture-token"))
    }
}

private actor GiftMutationTransport: HTTPTransport {
    private let result: Data
    private(set) var request: URLRequest?

    init(result: String) { self.result = Data(result.utf8) }

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        self.request = request
        return HTTPResponse(statusCode: 200, body: result)
    }
}

private enum GiftFeaturePayload {
    static let gift = """
    {"id":8,"name":"Pocket constellation guide","url":null,"price":12.5,"image_url":null,"source":null,
     "priority":"medium","status":"purchased","quantity":1,"additional_urls":[],"extra_data":{},"from_santa":false,
     "stores":[],"person_ids":[3],"gift_people":[{"person_id":3,"role":"recipient"}],
     "list_items":[{"id":81,"list_id":1,"list_name":"Juno’s Birthday","status":"selected"}],
     "created_at":"2026-11-18T17:00:00Z","updated_at":"2026-11-18T17:00:00Z"}
    """

    static let inbox = """
    {"ideas":[
      {"id":81,"name":"Pocket constellation guide","created_at":"2026-11-18T17:00:00Z","added_by":{"id":1,"email":"sam@hartwell.example"}},
      {"id":42,"name":"Hand-stamped recipe cards","created_at":"2026-11-18T17:00:00Z","added_by":{"id":1,"email":"sam@hartwell.example"}}
    ],"total":2}
    """
}
