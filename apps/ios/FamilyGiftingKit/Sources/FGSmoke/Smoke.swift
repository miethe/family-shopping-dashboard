import Foundation
import FamilyGiftingKit

@main struct Smoke {
    static func main() async {
        let args = CommandLine.arguments
        guard let flag = args.firstIndex(of: "--server"), args.indices.contains(flag + 1),
              let address = try? ServerAddress(args[flag + 1]),
              let email = ProcessInfo.processInfo.environment["FG_EMAIL"],
              let password = ProcessInfo.processInfo.environment["FG_PASSWORD"], !email.isEmpty, !password.isEmpty else {
            print("Usage: FG_EMAIL=<email> FG_PASSWORD=<password> swift run fg-smoke --server <url>")
            exit(2)
        }
        let client = APIClient(address: address, tokenStore: MemoryTokenStore())
        do { _ = try await client.login(email: email, password: password, diagnostic: true); print("/api/v1/auth/login OK") }
        catch { print("/api/v1/auth/login \(result(error))"); exit(1) }
        let runner = Runner(client: client)
        let _: HealthResponse? = await runner.read("/health")
        let _: User? = await runner.read("/api/v1/auth/me")
        let _: Dashboard? = await runner.read("/api/v1/dashboard")
        let people: Page<Person>? = await runner.read("/api/v1/persons")
        let groups: Page<FamilyGiftingKit.Group>? = await runner.read("/api/v1/groups")
        let gifts: Page<Gift>? = await runner.read("/api/v1/gifts")
        let events: Page<Occasion>? = await runner.read("/api/v1/occasions")
        let _: IdeaInbox? = await runner.read("/api/v1/ideas/inbox")
        let _: [Holiday]? = await runner.read("/api/v1/holidays")
        let _: ActiveTheme? = await runner.read("/api/v1/holidays/active-theme")
        let _: ActivityFeed? = await runner.read("/api/v1/activity")
        let plans: [EventPlan]? = await runner.read("/api/v1/gifting/occurrences")
        if let id = plans?.first?.id { let _: EventPlan? = await runner.read("/api/v1/gifting/occurrences/\(id)") }
        if let id = people?.items.first?.id {
            let _: Person? = await runner.read("/api/v1/persons/\(id)")
            let _: PersonBudget? = await runner.read("/api/v1/persons/\(id)/budgets")
        } else { print("/api/v1/persons/{id} SKIP empty collection") }
        if let id = groups?.items.first?.id { let _: FamilyGiftingKit.Group? = await runner.read("/api/v1/groups/\(id)") }
        if let id = gifts?.items.first?.id { let _: Gift? = await runner.read("/api/v1/gifts/\(id)") }
        if let id = events?.items.first?.id {
            let _: Occasion? = await runner.read("/api/v1/occasions/\(id)")
            let _: BudgetMeter? = await runner.read("/api/v1/budgets/occasions/\(id)/meter")
        }
        exit(await runner.failed ? 1 : 0)
    }
    static func result(_ error: Error) -> String {
        if case APIError.server(let code, _) = error { return "HTTP \(code)" }
        if let decoding = error as? DecodingError {
            let path: [any CodingKey]
            switch decoding {
            case .keyNotFound(let key, let context): path = context.codingPath + [key]
            case .typeMismatch(_, let context), .valueNotFound(_, let context), .dataCorrupted(let context): path = context.codingPath
            @unknown default: path = []
            }
            return "DECODE-FAIL " + (path.isEmpty ? "$" : path.map(\.stringValue).joined(separator: "."))
        }
        return "UNREACHABLE"
    }
}
actor Runner {
    let client: APIClient
    var failed = false
    init(client: APIClient) { self.client = client }
    func read<T: Decodable & Sendable>(_ path: String) async -> T? {
        do { let value = try await client.smokeRead(path, as: T.self); print("\(path) OK"); return value }
        catch { failed = true; print("\(path) \(Smoke.result(error))"); return nil }
    }
}
