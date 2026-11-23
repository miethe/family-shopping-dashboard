import Foundation

public enum FixtureScenario: String, CaseIterable, Sendable {
    case sample, empty, christmas
}

/// In-memory HTTP transport for previews, UI tests, and the app's demo launch modes.
public actor FixtureTransport: HTTPTransport {
    public static let token = "fixture-token"

    public let scenario: FixtureScenario
    private var fixtures: Object?
    private var addedGifts: [Object] = []
    private var changed: [String: [Object]] = [:]
    private var occurrenceRecords: [Object] = []
    private var createdChristmas = false
    private let offlineWrites: Bool

    public init(scenario: FixtureScenario, offlineWrites: Bool = false) {
        self.offlineWrites = offlineWrites
        self.scenario = scenario
    }

    public func send(_ request: URLRequest) async throws -> HTTPResponse {
        try Task.checkCancellation()
        guard let url = request.url else { throw APIError.invalidServerAddress }
        let path = url.path
        let method = request.httpMethod ?? "GET"
        if offlineWrites && method == "POST" && path == "/api/v1/gifts" { throw URLError(.notConnectedToInternet) }

        if path == "/health", method == "GET" {
            return try json(["status": "healthy", "db": "connected"])
        }

        let fixtures = try loadFixtures()
        guard let user = fixtures["user"] as? Object else { throw APIError.invalidPayload }
        let token: Object = ["access_token": Self.token, "token_type": "bearer", "expires_in": 86_400]
        if path == "/api/v1/auth/register", method == "POST" {
            return try json(user, status: 201)
        }
        if path == "/api/v1/auth/login", method == "POST" {
            return try json(user.merging(["token": token], uniquingKeysWith: { _, new in new }))
        }

        guard request.value(forHTTPHeaderField: "Authorization") == "Bearer \(Self.token)" else {
            return try error(401, code: "UNAUTHORIZED", message: "Sign in to continue.")
        }

        let query = FixtureQuery(url)
        if let response = try mutation(request, fixtures: fixtures) { return response }
        if path == "/api/v1/gifting/occurrences" && method == "GET" { return try json(occurrenceRecords) }
        if path.hasPrefix("/api/v1/gifting/occurrences/"), method == "GET", let id = Int(path.split(separator: "/").last ?? ""), let row = occurrenceRecords.first(where: { $0["id"] as? Int == id }) { return try json(row) }
        switch (method, path) {
        case ("GET", "/api/v1/auth/me"):
            return try json(user)
        case ("POST", "/api/v1/auth/refresh"):
            return try json(token)
        case ("GET", "/api/v1/dashboard"):
            let key = scenario == .christmas ? "christmas_dashboard" : "sample_dashboard"
            return try json(scenario == .empty ? emptyDashboard : fixtures[key] ?? emptyDashboard)
        case ("GET", "/api/v1/persons"):
            let people = records("persons", in: fixtures).filter { person in
                guard let groupId = query.integers("group_id").first else { return true }
                return (person["groups"] as? [Object])?.contains { $0["id"] as? Int == groupId } == true
            }
            return try paginated(people, query: query)
        case ("GET", "/api/v1/groups"):
            return try paginated(records("groups", in: fixtures), query: query)
        case ("GET", "/api/v1/gifts"):
            return try paginated(filteredGifts(in: fixtures, query: query), query: query)
        case ("POST", "/api/v1/gifts"):
            return try createGift(from: request.httpBody, fixtures: fixtures)
        case ("GET", "/api/v1/ideas/inbox"):
            let ideas = Array(records("ideas", in: fixtures).prefix(query.limit(default: 10, maximum: 50)))
            return try json(["ideas": ideas, "total": ideas.count])
        case ("GET", "/api/v1/occasions"):
            return try paginated(records("occasions", in: fixtures), query: query)
        case ("GET", "/api/v1/holidays"):
            return try json(records("holidays", in: fixtures))
        case ("GET", "/api/v1/holidays/active-theme"):
            let key: Any = (scenario == .christmas || createdChristmas) ? "christmas" as Any : NSNull()
            return try json(["theme_key": key])
        case ("GET", "/api/v1/activity"):
            let events = records("activity", in: fixtures)
            return try json(["events": Array(events.prefix(query.limit(default: 10, maximum: 50))), "total": events.count])
        default:
            if method == "GET" {
                return try detail(path: path, fixtures: fixtures, query: query)
            }
            return try notFound()
        }
    }

    private typealias Object = [String: Any]

    private func loadFixtures() throws -> Object {
        if let fixtures { return fixtures }
        guard let url = Bundle.module.url(forResource: "hartwell", withExtension: "json"),
              let data = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? Object
        else { throw APIError.invalidPayload }
        fixtures = data
        return data
    }

    private var emptyDashboard: Object {
        ["primary_occasion": NSNull(), "people_needing_gifts": [], "total_ideas": 0, "total_purchased": 0, "my_assignments": 0]
    }

    private var emptyBudget: Object {
        [
            "budget_total": NSNull(), "purchased_amount": "0", "planned_amount": "0", "remaining_amount": NSNull(),
            "purchased_percent": 0, "planned_percent": 0, "remaining_percent": 100, "is_over_budget": false, "has_budget": false
        ]
    }

    private func records(_ key: String, in fixtures: Object) -> [Object] {
        let base = changed[key] ?? (scenario == .empty ? [] : fixtures[key] as? [Object] ?? [])
        return key == "gifts" ? addedGifts + base : base
    }

    private func filteredGifts(in fixtures: Object, query: FixtureQuery) -> [Object] {
        let personIds = Set(query.integers("person_ids"))
        let occasionIds = Set(query.integers("occasion_ids"))
        let listIds = Set(query.integers("list_ids"))
        let statuses = Set(query.values("statuses"))
        let search = query.values("search").first
        let gifts = records("gifts", in: fixtures).filter { gift in
            let matchesName = search.map { (gift["name"] as? String)?.localizedCaseInsensitiveContains($0) == true } ?? true
            let matchesPerson = personIds.isEmpty || !personIds.isDisjoint(with: gift["person_ids"] as? [Int] ?? [])
            let matchesStatus = statuses.isEmpty || statuses.contains(gift["status"] as? String ?? "")
            let giftListIds = (gift["list_items"] as? [Object] ?? []).compactMap { $0["list_id"] as? Int }
            return matchesName && matchesPerson && matchesStatus &&
                (occasionIds.isEmpty || !occasionIds.isDisjoint(with: giftListIds)) &&
                (listIds.isEmpty || !listIds.isDisjoint(with: giftListIds))
        }
        switch query.values("sort").first {
        case "price_asc": return gifts.sorted { price($0) < price($1) }
        case "price_desc": return gifts.sorted { price($0) > price($1) }
        default: return gifts
        }
    }

    private func price(_ gift: Object) -> Decimal {
        decimal(gift["price"])
    }

    private func decimal(_ value: Any?) -> Decimal {
        let string = value as? String ?? (value as? NSNumber)?.stringValue
        return string.flatMap { Decimal(string: $0, locale: Locale(identifier: "en_US_POSIX")) } ?? 0
    }

    private func paginated(_ records: [Object], query: FixtureQuery) throws -> HTTPResponse {
        let cursorIndex = query.integers("cursor").first.flatMap { cursor in
            records.firstIndex { $0["id"] as? Int == cursor }
        }
        let remaining = cursorIndex.map { records.suffix(from: $0 + 1) } ?? records[...]
        let page = Array(remaining.prefix(query.limit(default: 50, maximum: 100)))
        let hasMore = page.count < remaining.count
        let cursor = hasMore ? page.last?["id"] as? Int : nil
        return try json(["items": page, "has_more": hasMore, "next_cursor": cursor as Any? ?? NSNull()])
    }

    private func detail(path: String, fixtures: Object, query: FixtureQuery) throws -> HTTPResponse {
        let route = path.split(separator: "/").dropFirst(2)
        let segments = Array(route)
        if segments.count == 2, let id = Int(segments[1]),
           ["persons", "groups", "gifts", "occasions"].contains(segments[0]) {
            let record = records(String(segments[0]), in: fixtures).first { $0["id"] as? Int == id }
            if let record { return try json(record) }
        }
        if segments.count == 4, segments[0] == "budgets", segments[1] == "occasions", segments[3] == "meter",
           let id = Int(segments[2]), records("occasions", in: fixtures).contains(where: { $0["id"] as? Int == id }) {
            let budget = (fixtures["budgets"] as? [String: Object])?[String(id)] ?? emptyBudget
            return try json(budget)
        }
        if segments.count == 3, segments[0] == "persons", segments[2] == "budgets",
           let id = Int(segments[1]), records("persons", in: fixtures).contains(where: { $0["id"] as? Int == id }) {
            return try personBudget(id: id, occasionId: query.integers("occasion_id").first, fixtures: fixtures)
        }
        return try notFound()
    }

    private func personBudget(id: Int, occasionId: Int?, fixtures: Object) throws -> HTTPResponse {
        let gifts = records("gifts", in: fixtures).filter { gift in
            let listIds = (gift["list_items"] as? [Object] ?? []).compactMap { $0["list_id"] as? Int }
            return (gift["person_ids"] as? [Int])?.contains(id) == true &&
                (occasionId.map { listIds.contains($0) } ?? true)
        }
        let purchased = gifts.filter { ["purchased", "received"].contains($0["status"] as? String ?? "") }
        let planned = gifts.filter { ["idea", "selected"].contains($0["status"] as? String ?? "") }
        return try json([
            "person_id": id, "occasion_id": occasionId as Any? ?? NSNull(),
            "gifts_assigned_count": gifts.count, "gifts_assigned_total": total(gifts),
            "gifts_assigned_purchased_count": purchased.count, "gifts_assigned_purchased_total": total(purchased),
            "gifts_purchased_count": 0, "gifts_purchased_total": "0",
            "gifts_to_purchase_count": planned.count, "gifts_to_purchase_total": total(planned)
        ])
    }

    private func total(_ gifts: [Object]) -> String {
        gifts.reduce(Decimal.zero) { result, gift in
            let price = (gift["sale_price"] is String || gift["sale_price"] is NSNumber) ? decimal(gift["sale_price"]) : price(gift)
            return result + price
        }.description
    }

    private func createGift(from data: Data?, fixtures: Object) throws -> HTTPResponse {
        guard let data, let body = try JSONSerialization.jsonObject(with: data) as? Object,
              let name = body["name"] as? String, !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return try error(422, code: "VALIDATION_ERROR", message: "Enter a gift name.")
        }
        let id = (records("gifts", in: fixtures).compactMap { $0["id"] as? Int }.max() ?? 0) + 1
        let timestamp = ISO8601DateFormatter().string(from: .now)
        let personIds = body["person_ids"] as? [Int] ?? []
        let gift: Object = [
            "id": id, "name": name, "url": body["url"] ?? NSNull(), "notes": body["notes"] ?? NSNull(),
            "price": body["price"] ?? NSNull(), "image_url": NSNull(), "source": body["source"] ?? NSNull(), "description": NSNull(),
            "priority": "medium", "status": "idea", "quantity": 1, "sale_price": NSNull(), "purchase_date": NSNull(),
            "additional_urls": [], "extra_data": [:], "from_santa": false, "stores": [], "person_ids": personIds,
            "gift_people": personIds.map { ["person_id": $0, "role": "recipient"] },
            "list_items": [], "created_at": timestamp, "updated_at": timestamp
        ]
        addedGifts.insert(gift, at: 0)
        return try json(gift, status: 201)
    }

    private func mutation(_ request: URLRequest, fixtures: Object) throws -> HTTPResponse? {
        let path = request.url!.path
        let method = request.httpMethod ?? "GET"
        guard method != "GET" else { return nil }
        if path == "/api/v1/upload/image", method == "POST" { return try json(["image_url": "/fixtures/avatar.jpg"]) }
        let body = (try? JSONSerialization.jsonObject(with: request.httpBody ?? Data()) as? Object) ?? [:]
        let parts = path.split(separator: "/").map(String.init)
        let now = ISO8601DateFormatter().string(from: .now)
        if path == "/api/v1/gifting/occurrences", method == "POST" {
            let occasionID = body["occasion_id"] as? Int ?? 0
            let occasion = records("occasions", in: fixtures).first { $0["id"] as? Int == occasionID }
            let row: Object = ["id": occurrenceRecords.count + 1, "occasion_id": occasionID, "name": occasion?["name"] ?? "Family day", "date": body["date"] ?? "2026-12-25", "closed": false, "budget_total": body["budget_total"] ?? NSNull(), "spent": 0, "planned": 0, "purchased_count": 0, "unknown_prices": 0, "phases": ["considering": 0, "bought": 0, "in_hand": 0, "given": 0], "envelopes": []]
            occurrenceRecords.append(row); return try json(row, status: 201)
        }
        if path.hasPrefix("/api/v1/gifting/occurrences/"), method == "PATCH", let id = Int(parts.last ?? ""), let index = occurrenceRecords.firstIndex(where: { $0["id"] as? Int == id }) {
            occurrenceRecords[index].merge(body, uniquingKeysWith: { _, new in new }); return try json(occurrenceRecords[index])
        }
        if path == "/api/v1/holidays", method == "POST" {
            var rows = records("holidays", in: fixtures)
            var row = body
            row["id"] = (rows.compactMap { $0["id"] as? Int }.max() ?? 0) + 1
            row["theme_key"] = NSNull(); row["theme_window_days"] = 45
            row["next_date"] = "2026-12-25"; row["days_until"] = 32
            rows.append(row); changed["holidays"] = rows
            return try json(row, status: 201)
        }
        if parts.count == 3, method == "POST", ["persons", "occasions"].contains(parts[2]) {
            let key = parts[2]
            var rows = records(key, in: fixtures)
            var row: Object = ["id": (rows.compactMap { $0["id"] as? Int }.max() ?? 0) + 1, "created_at": now, "updated_at": now]
            if key == "persons" { row.merge(["groups": [], "occasion_ids": []], uniquingKeysWith: { _, n in n }) }
            else { row.merge(["is_active": true, "person_ids": []], uniquingKeysWith: { _, n in n }) }
            row.merge(body, uniquingKeysWith: { _, n in n })
            if let ids = body["group_ids"] as? [Int] { row["groups"] = records("groups", in: fixtures).filter { ids.contains($0["id"] as? Int ?? -1) } }
            if key == "occasions", let holiday = body["holiday_id"] as? Int, records("holidays", in: fixtures).contains(where: { $0["id"] as? Int == holiday && $0["theme_key"] as? String == "christmas" && ($0["days_until"] as? Int ?? 999) <= ($0["theme_window_days"] as? Int ?? 0) }) { createdChristmas = true }
            rows.insert(row, at: 0); changed[key] = rows; return try json(row, status: 201)
        }
        if parts.count == 4, ["persons", "gifts", "occasions"].contains(parts[2]), let id = Int(parts[3]) {
            guard method == (parts[2] == "gifts" ? "PATCH" : "PUT") else {
                return try error(405, code: "METHOD_NOT_ALLOWED", message: "This fixture does not support that method.")
            }
            let key = parts[2]; var rows = records(key, in: fixtures)
            guard let index = rows.firstIndex(where: { $0["id"] as? Int == id }) else { return try notFound() }
            rows[index].merge(body, uniquingKeysWith: { _, n in n }); rows[index]["updated_at"] = now
            if let ids = body["group_ids"] as? [Int] { rows[index]["groups"] = records("groups", in: fixtures).filter { ids.contains($0["id"] as? Int ?? -1) } }
            if key == "gifts" { addedGifts = [] }
            changed[key] = rows; return try json(rows[index])
        }
        if parts.count == 5, parts[2] == "list-items", method == "PUT", let id = Int(parts[3]) {
            var gifts = records("gifts", in: fixtures)
            for index in gifts.indices {
                var links = gifts[index]["list_items"] as? [Object] ?? []
                if let link = links.firstIndex(where: { $0["id"] as? Int == id }) {
                    links[link]["status"] = body["status"] ?? "selected"; gifts[index]["list_items"] = links
                    addedGifts = []; changed["gifts"] = gifts
                    changed["ideas"] = records("ideas", in: fixtures).filter { $0["id"] as? Int != id }
                    return try json(["id": id, "gift_id": gifts[index]["id"]!, "status": body["status"] ?? "selected"])
                }
            }
            return try notFound()
        }
        return nil
    }

    private func notFound() throws -> HTTPResponse {
        try error(404, code: "NOT_FOUND", message: "No fixture matches this request.")
    }

    private func error(_ status: Int, code: String, message: String) throws -> HTTPResponse {
        try json(["error": ["code": code, "message": message]], status: status)
    }

    private func json(_ value: Any, status: Int = 200) throws -> HTTPResponse {
        HTTPResponse(statusCode: status, body: try JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]))
    }
}

private struct FixtureQuery {
    private let items: [URLQueryItem]

    init(_ url: URL) {
        items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
    }

    func values(_ name: String) -> [String] {
        items.filter { $0.name == name }.compactMap(\.value)
    }

    func integers(_ name: String) -> [Int] {
        values(name).compactMap { Int($0) }
    }

    func limit(default defaultValue: Int, maximum: Int) -> Int {
        min(max(integers("limit").first ?? defaultValue, 1), maximum)
    }
}
