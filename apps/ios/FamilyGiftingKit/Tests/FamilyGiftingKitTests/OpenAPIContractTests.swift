#if os(macOS)
import CoreFoundation
import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("Vendored OpenAPI")
struct OpenAPIContractTests {
    @Test func nativeRequestsUseDocumentedOperationsAndBodies() async throws {
        let transport = try ContractTransport()
        let client = APIClient(address: .fixture, transport: transport, tokenStore: MemoryTokenStore())
        let date = try #require(CalendarDate("2026-12-09"))
        _ = try await client.health()
        _ = try await client.register(email: "sam@hartwell.example", password: "fixture-password")
        _ = try await client.loginWithApple(identityToken: "fixture-apple-token", nonce: "fixture-nonce")
        _ = try await client.refreshSession()
        _ = try await client.me()
        _ = try await client.dashboard()
        _ = try await client.persons()
        _ = try await client.person(id: 3)
        _ = try await client.groups()
        _ = try await client.group(id: 1)
        _ = try await client.gifts()
        _ = try await client.gift(id: 7)
        _ = try await client.ideas()
        _ = try await client.occasions()
        _ = try await client.occasion(id: 1)
        _ = try await client.holidays()
        _ = try await client.activeTheme()
        _ = try await client.budget(occasionId: 1)
        _ = try await client.personBudget(personId: 3)
        _ = try await client.activity()

        let sticker = StickerImage(icon: .dinosaur, tint: .mint)
        let person = try await client.createPerson(PersonCreate(displayName: "Ellis Hartwell", photoUrl: sticker.dataURI))
        #expect(person.photoUrl == sticker.dataURI)
        let newSticker = StickerImage(icon: .fox, tint: .pink)
        _ = try await client.updatePerson(id: person.id, .photo(newSticker.dataURI))
        #expect(try await client.person(id: person.id).photoUrl == newSticker.dataURI)
        _ = try await client.updatePerson(id: person.id, .birthday(nil))
        _ = try await client.updatePerson(id: person.id, .basics(displayName: "Ellis Hartwell", relationship: nil, groupIds: [1]))
        _ = try await client.updatePerson(id: person.id, .sizes([]))
        _ = try await client.updatePerson(id: person.id, .interests(["Kites"]))
        _ = try await client.updatePerson(id: person.id, .notes(nil))
        _ = try await client.uploadPersonPhoto(jpeg: Data([0xff, 0xd8, 0xff, 0xd9]))
        let gift = try await client.createGift(GiftCreate(name: "Paper kite", price: 12.50))
        _ = try await client.updateGift(id: gift.id, GiftUpdate(name: "Blue paper kite", status: .selected))
        let inbox = try await client.ideas()
        _ = try await client.selectIdea(id: try #require(inbox.ideas.first?.id))
        let holiday = try await client.createHoliday(HolidayCreate(name: "Kite Day", key: "kite-day", month: 12, day: 9, isMajor: false))
        let occasion = try await client.createEventOccasion(EventOccasionCreate(name: "Kite Day", type: .holiday, date: date, holidayId: holiday.id))
        let plan = try await client.createEventPlan(occasionId: occasion.id, date: date, budgetTotal: 25)
        _ = try await client.eventPlans()
        _ = try await client.eventPlan(id: plan.id)
        _ = try await client.setEventPlanClosed(id: plan.id, closed: true)
        let session = try await client.captureSession()
        let idea = PendingIdea(account: "fixture#1", name: "Paint set")
        try await client.sendCapture(idea, session: session)
        #expect(try await client.containsCapture(idea.id, session: session))
    }

    @Test func fixtureRejectsUndocumentedPatchEvenForExistingRecords() async throws {
        let contract = try OpenAPI()
        let fixture = FixtureTransport(scenario: .sample)
        for path in ["/api/v1/persons/3", "/api/v1/occasions/1"] {
            #expect(contract.operation("PATCH", path: path) == nil)
            let url = try ServerAddress.fixture.endpoint(path, query: [])
            var request = URLRequest(url: url)
            request.httpMethod = "PATCH"
            request.setValue("Bearer \(FixtureTransport.token)", forHTTPHeaderField: "Authorization")
            request.httpBody = Data(#"{"name":"Unexpected change"}"#.utf8)
            #expect(try await fixture.send(request).statusCode == 405)
        }
    }

    @Test func requestSchemaChecksRequiredFieldsLengthsAndClosedObjects() throws {
        let contract = try OpenAPI()
        let person = try #require(contract.schemas["PersonUpdate"] as? JSON)
        let gift = try #require(contract.schemas["GiftCreate"] as? JSON)
        let size = try #require(contract.schemas["SizeEntry"] as? JSON)
        #expect(!contract.valid(["photo_url": String(repeating: "x", count: 501)], against: person))
        #expect(!contract.valid(["name": String(repeating: "x", count: 256)], against: gift))
        #expect(!contract.valid([String: Any](), against: gift))
        #expect(!contract.valid(["type": "shoe", "value": "5", "unknown": true], against: size))
    }

    @Test func generatedPersonResponsesDecodeNullsAndLegacyShapes() throws {
        let contract = try OpenAPI()
        let schema = try #require(contract.schemas["PersonResponse"] as? JSON)
        let properties = try #require(schema["properties"] as? [String: JSON])
        let nullable = properties.compactMap { key, field -> String? in
            let variants = field["anyOf"] as? [JSON] ?? []
            return variants.contains(where: { $0["type"] as? String == "null" }) ? key : nil
        }
        var person = Dictionary<String, Any>(uniqueKeysWithValues: nullable.map { ($0, NSNull() as Any) })
        person.merge([
            "id": 1, "display_name": "Ellis Hartwell", "groups": [], "occasion_ids": [],
            "created_at": "2026-11-20T12:00:00.123456Z", "updated_at": "2026-11-20T12:00:01+00:00"
        ], uniquingKeysWith: { _, fixture in fixture })
        #expect(contract.valid(person, against: schema))
        let decoder = WireFormat.decoder()
        let empty = try decoder.decode(Person.self, from: JSONSerialization.data(withJSONObject: person))
        #expect(empty.photoUrl == nil)
        #expect(empty.sizeProfile == nil)

        person["advanced_interests"] = [String: Any]()
        person["sizes"] = ["shoe": "5"]
        #expect(contract.valid(person, against: schema))
        let legacy = try decoder.decode(Person.self, from: JSONSerialization.data(withJSONObject: person))
        #expect(legacy.advancedInterests?.isEmpty == true)
        #expect(legacy.sizes?["shoe"] == .string("5"))
        #expect(legacy.updatedAt > legacy.createdAt)
    }
}

private typealias JSON = [String: Any]

private actor ContractTransport: HTTPTransport {
    private let contract: OpenAPI
    private let fixture = FixtureTransport(scenario: .sample)

    init() throws { contract = try OpenAPI() }

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        let method = try #require(request.httpMethod)
        let path = try #require(request.url?.path)
        let operation = try #require(contract.operation(method, path: path), "Missing OpenAPI operation: \(method) \(path)")
        if let body = operation["requestBody"] as? JSON {
            let data = try #require(request.httpBody)
            let content = try #require(body["content"] as? [String: JSON])
            let type = try #require(request.value(forHTTPHeaderField: "Content-Type")?.components(separatedBy: ";").first)
            let format = try #require(content[type])
            if type == "application/json" {
                let schema = try #require(format["schema"] as? JSON)
                let payload = try JSONSerialization.jsonObject(with: data)
                #expect(contract.valid(payload, against: schema), "Request body violates schema: \(method) \(path)")
            }
        } else {
            #expect(request.httpBody == nil)
        }
        var fixtureRequest = request
        if path == "/api/v1/auth/apple" {
            // Apple exchanges use the same response fixture as password login.
            fixtureRequest.url = try ServerAddress.fixture.endpoint("/api/v1/auth/login", query: [])
        }
        return try await fixture.send(fixtureRequest)
    }
}

private struct OpenAPI {
    let paths: [String: JSON]
    let schemas: JSON

    init() throws {
        let ios = (0..<4).reduce(URL(fileURLWithPath: #filePath)) { url, _ in url.deletingLastPathComponent() }
        let schema = try JSONSerialization.jsonObject(with: Data(contentsOf: ios.appendingPathComponent("openapi.json")))
        let document = try #require(schema as? JSON)
        paths = try #require(document["paths"] as? [String: JSON])
        let components = try #require(document["components"] as? JSON)
        schemas = try #require(components["schemas"] as? JSON)
    }

    func operation(_ method: String, path: String) -> JSON? {
        let key = method.lowercased()
        if let exact = paths[path] { return exact[key] as? JSON }
        let segments = path.split(separator: "/")
        let template = paths.keys.first { template in
            let parts = template.split(separator: "/")
            return parts.count == segments.count && zip(parts, segments).allSatisfy { part, segment in
                part == segment || (part.hasPrefix("{") && part.hasSuffix("}") && !segment.isEmpty)
            }
        }
        return template.flatMap { paths[$0]?[key] as? JSON }
    }

    // The subset used by the checked-in wire payloads.
    func valid(_ value: Any, against schema: JSON) -> Bool {
        if let ref = schema["$ref"] as? String {
            guard let name = ref.split(separator: "/").last, let target = schemas[String(name)] as? JSON else { return false }
            return valid(value, against: target)
        }
        if let variants = schema["anyOf"] as? [JSON], !variants.contains(where: { valid(value, against: $0) }) { return false }
        if let options = schema["enum"] as? [String], !options.contains(value as? String ?? "") { return false }
        switch schema["type"] as? String {
        case "object":
            guard let object = value as? JSON else { return false }
            let required = schema["required"] as? [String] ?? []
            guard required.allSatisfy({ object[$0] != nil }) else { return false }
            let properties = schema["properties"] as? [String: JSON] ?? [:]
            return object.allSatisfy { key, field in
                if let property = properties[key] { return valid(field, against: property) }
                if let extra = schema["additionalProperties"] as? JSON { return valid(field, against: extra) }
                return schema["additionalProperties"] as? Bool != false
            }
        case "array":
            guard let array = value as? [Any] else { return false }
            return array.allSatisfy { valid($0, against: schema["items"] as? JSON ?? [:]) }
        case "string":
            guard let string = value as? String else { return false }
            let length = string.unicodeScalars.count
            if let pattern = schema["pattern"] as? String, string.range(of: pattern, options: .regularExpression) == nil { return false }
            return length >= (schema["minLength"] as? Int ?? 0) && length <= (schema["maxLength"] as? Int ?? .max)
        case "boolean":
            return (value as? NSNumber).map { CFGetTypeID($0) == CFBooleanGetTypeID() } == true
        case "integer", "number":
            guard let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID() else { return false }
            let numeric = number.doubleValue
            return (schema["type"] as? String != "integer" || numeric.rounded() == numeric) &&
                numeric >= (schema["minimum"] as? Double ?? -.infinity) &&
                numeric <= (schema["maximum"] as? Double ?? .infinity)
        case "null": return value is NSNull
        default: return true
        }
    }
}
#endif
