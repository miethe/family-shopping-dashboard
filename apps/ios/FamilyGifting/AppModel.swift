import Foundation
import Observation
import FamilyGiftingKit

@MainActor @Observable
final class AppModel {
    let client: APIClient
    let fixture: Bool
    var address: String
    var configured: Bool
    var signedIn = false
    var starting = true
    var busy = false
    var error: String?
    var credential: SessionCredential?
    var dashboard: Dashboard?
    var people: [Person] = []
    var gifts: [Gift] = []
    var occasions: [Occasion] = []
    var holidays: [Holiday] = []
    var inbox: IdeaInbox?
    var budget: BudgetMeter?
    var activity: ActivityFeed?
    var christmas = false
    var loaded = false
    var web: WebDestination?
    var addIdea = false
    var settings = false
    var selection = 0
    private var reloading = false
    private var personCursor: Int?
    private var giftCursor: Int?
    private var occasionCursor: Int?

    init(arguments: [String] = ProcessInfo.processInfo.arguments) {
        let args = arguments
        #if DEBUG
        let scenarioIndex = args.firstIndex(of: "--fixture")
        #else
        let scenarioIndex: Int? = nil
        #endif
        let scenario = scenarioIndex.flatMap { args.indices.contains($0 + 1) ? args[$0 + 1] : nil }
        let isFixture = scenarioIndex != nil
        let storedAddress = isFixture ? ServerAddress.default.url.absoluteString : (UserDefaults.standard.string(forKey: "serverAddress") ?? ServerAddress.default.url.absoluteString)
        fixture = isFixture
        address = storedAddress
        configured = isFixture || UserDefaults.standard.bool(forKey: "serverValidated")
        if isFixture {
            client = APIClient(transport: FixtureTransport(scenario: FixtureScenario(rawValue: scenario ?? "sample") ?? .sample), tokenStore: MemoryTokenStore(token: scenario == "signin" ? nil : "fixture-token"))
        } else {
            client = APIClient(address: (try? ServerAddress(storedAddress)) ?? .default)
        }
    }

    func start() async {
        defer { starting = false }
        do {
            signedIn = try await client.hasSession()
            credential = try await client.sessionToken()
            if signedIn && configured { await reload() }
        } catch { handle(error) }
    }

    func handle(_ problem: Error) {
        // Requests invalidated by sign-out/server changes are no longer user-visible work.
        if let apiError = problem as? APIError, apiError == .sessionChanged { return }
        if let apiError = problem as? APIError, apiError.isUnauthorized {
            signedIn = false
            credential = nil
            web = nil
            addIdea = false
            clearData()
            error = "Your session has ended. Sign in to keep planning together."
        } else { error = problem.localizedDescription }
    }

    func authenticate(email: String, password: String, register: Bool) async {
        busy = true; error = nil
        defer { busy = false }
        do {
            if register { _ = try await client.register(email: email, password: password) }
            else { _ = try await client.login(email: email, password: password) }
            credential = try await client.sessionToken()
            signedIn = true
            await reload()
        } catch { self.error = error.localizedDescription }
    }

    func configure(_ input: String) async {
        busy = true; error = nil
        defer { busy = false }
        do {
            let next = try ServerAddress(input)
            _ = try await client.validateServerAddress(next)
            try await client.setServerAddress(next)
            try await client.logout()
            address = next.url.absoluteString
            if !fixture {
                UserDefaults.standard.set(address, forKey: "serverAddress")
                UserDefaults.standard.set(true, forKey: "serverValidated")
            }
            configured = true; signedIn = false; credential = nil; settings = false
            clearData()
        } catch { handle(error) }
    }

    func signOut() async {
        do { try await client.logout() } catch { self.error = error.localizedDescription }
        signedIn = false; credential = nil; web = nil; addIdea = false
        clearData()
    }

    private func clearData() {
        dashboard = nil; people = []; gifts = []; occasions = []; holidays = []
        inbox = nil; budget = nil; activity = nil; christmas = false; loaded = false
        personCursor = nil; giftCursor = nil; occasionCursor = nil
    }

    func reload() async {
        guard signedIn, !reloading else { return }
        reloading = true
        busy = true; error = nil
        defer { busy = false; reloading = false }
        do {
            // A small family dataset: serial fetches keep server and memory load bounded.
            dashboard = try await client.dashboard()
            christmas = try await client.activeTheme().themeKey == "christmas"
            let personPage = try await client.persons()
            people = personPage.items; personCursor = personPage.nextCursor
            let giftPage = try await client.gifts()
            gifts = giftPage.items; giftCursor = giftPage.nextCursor
            let occasionPage = try await client.occasions()
            occasions = occasionPage.items; occasionCursor = occasionPage.nextCursor
            inbox = try await client.ideas()
            holidays = try await client.holidays()
            activity = try await client.activity()
            if let id = dashboard?.primaryOccasion?.id { budget = try await client.budget(occasionId: id) }
            else { budget = nil }
            loaded = true
        } catch { handle(error) }
    }

    var hasMore: Bool {
        switch selection { case 1: personCursor != nil; case 2: giftCursor != nil; case 3: occasionCursor != nil; default: false }
    }
    func loadMore() async {
        busy = true
        defer { busy = false }
        do {
            switch selection {
            case 1:
                guard let cursor = personCursor else { return }
                let page = try await client.persons(cursor: cursor)
                people += page.items; personCursor = page.nextCursor
            case 2:
                guard let cursor = giftCursor else { return }
                let page = try await client.gifts(cursor: cursor)
                gifts += page.items; giftCursor = page.nextCursor
            case 3:
                guard let cursor = occasionCursor else { return }
                let page = try await client.occasions(cursor: cursor)
                occasions += page.items; occasionCursor = page.nextCursor
            default: break
            }
        } catch { handle(error) }
    }

    func open(_ path: String, title: String) { web = WebDestination(path: path, title: title) }
    func saveIdea(name: String, url: String, notes: String, personIds: [Int]) async -> Bool {
        busy = true; error = nil
        defer { busy = false }
        do {
            _ = try await client.createGift(GiftCreate(name: name.trimmingCharacters(in: .whitespacesAndNewlines), url: url.isEmpty ? nil : url, notes: notes.isEmpty ? nil : notes, personIds: personIds))
            await reload()
            selection = 2
            return true
        } catch { handle(error); return false }
    }
}

struct WebDestination: Identifiable {
    var id: String { path }
    let path: String
    let title: String
}

func money(_ value: Decimal) -> String { value.formatted(.currency(code: "USD")) }
