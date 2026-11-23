import Foundation
import Observation
import Network
import CryptoKit
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
    var currentUser: User?
    var pendingIdeas: [PendingIdea] = []
    var showIdeas = false
    private var monitor: NWPathMonitor?
    private var queue: IdeaQueue?
    private var offlineUserID: Int?
    private var accountCacheKey: String? {
        credential.map { "ideaAccount:" + address + ":" + SHA256.hash(data: Data($0.accessToken.utf8)).map { String(format: "%02x", $0) }.joined() }
    }
    var canCaptureOffline: Bool { account != nil && !signedIn }
    private var account: String? { (currentUser?.id ?? offlineUserID).map { address + "#" + String($0) } }
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
    var native: WebDestination?
    var addIdea = false
    var captureSaved = false
    var settings = false
    var selection = 0
    private var reloading = false
    private var sessionChanging = false
    private var personCursor: Int?
    private var giftCursor: Int?
    private var occasionCursor: Int?

    init(arguments: [String] = ProcessInfo.processInfo.arguments, fixtureClient: APIClient? = nil) {
        #if DEBUG
        let isUnitTest = ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] != nil
        let args = isUnitTest && !arguments.contains("--fixture") ? arguments + ["--fixture", "sample"] : arguments
        #else
        let args = arguments
        #endif
        #if DEBUG
        let scenarioIndex = args.firstIndex(of: "--fixture")
        #else
        let scenarioIndex: Int? = nil
        #endif
        let scenario = scenarioIndex.flatMap { args.indices.contains($0 + 1) ? args[$0 + 1] : nil }
        let isFixture = scenarioIndex != nil
        let storedAddress = isFixture ? ServerAddress.fixture.url.absoluteString : (UserDefaults.standard.string(forKey: "serverAddress") ?? "")
        fixture = isFixture
        address = storedAddress
        configured = isFixture || (!storedAddress.isEmpty && UserDefaults.standard.bool(forKey: "serverValidated"))
        if isFixture {
            client = fixtureClient ?? APIClient(address: .fixture, transport: FixtureTransport(scenario: FixtureScenario(rawValue: scenario ?? "sample") ?? .sample, offlineWrites: args.contains("--offline")), tokenStore: MemoryTokenStore(token: scenario == "signin" ? nil : "fixture-token"))
        } else {
            client = APIClient(address: try? ServerAddress(storedAddress))
        }
    }

    func start() async {
        defer { starting = false }
        if configured {
            do {
                credential = try await client.savedCredential()
                offlineUserID = credential?.userID
                if offlineUserID == nil, !fixture, let key = accountCacheKey {
                    offlineUserID = UserDefaults.standard.object(forKey: key) as? Int
                }
                credential = try await client.usableSession()
                signedIn = credential != nil
                if signedIn { await reload() }
            } catch { handle(error) }
        }
        if !fixture {
            let monitor = NWPathMonitor()
            monitor.pathUpdateHandler = { [weak self] path in
                if path.status == .satisfied { Task { @MainActor [weak self] in await self?.resume() } }
            }
            monitor.start(queue: DispatchQueue(label: "idea-reachability"))
            self.monitor = monitor
        }
    }

    func resume() async {
        guard !starting, !sessionChanging, signedIn || canCaptureOffline else { return }
        if !signedIn {
            do {
                credential = try await client.usableSession()
                signedIn = credential != nil
            } catch { handle(error) }
        }
        if signedIn { await reload() }
    }

    func handle(_ problem: Error) {
        // Requests invalidated by sign-out/server changes are no longer user-visible work.
        if let apiError = problem as? APIError, apiError == .sessionChanged { return }
        if let apiError = problem as? APIError, apiError == .expiredSession {
            let retainedUser = currentUser?.id ?? offlineUserID
            clearData()
            offlineUserID = retainedUser
            signedIn = false
            web = nil; native = nil; showIdeas = false
            error = apiError.localizedDescription
        } else if let apiError = problem as? APIError, apiError.isUnauthorized {
            signedIn = false
            credential = nil
            web = nil; native = nil; showIdeas = false
            addIdea = false
            clearData()
            error = "Your session has ended. Sign in to keep planning together."
        } else { error = problem.localizedDescription }
    }

    func authenticate(email: String, password: String, register: Bool) async {
        sessionChanging = true
        defer { sessionChanging = false }
        busy = true; error = nil
        defer { busy = false }
        do {
            if register { _ = try await client.register(email: email, password: password) }
            else { _ = try await client.login(email: email, password: password) }
            clearData()
            credential = try await client.sessionToken()
            offlineUserID = credential?.userID
            signedIn = true
            await reload()
            sessionChanging = false
            await flushIdeas()
        } catch { self.error = error.localizedDescription }
    }

    func configure(_ input: String) async {
        sessionChanging = true
        defer { sessionChanging = false }
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
        sessionChanging = true
        defer { sessionChanging = false }
        do { try await client.signOut() } catch { self.error = error.localizedDescription }
        signedIn = false; credential = nil; web = nil; native = nil; showIdeas = false; addIdea = false
        clearData()
    }

    private func clearData() {
        offlineUserID = nil; currentUser = nil; pendingIdeas = []; dashboard = nil; people = []; gifts = []; occasions = []; holidays = []
        inbox = nil; budget = nil; activity = nil; christmas = false; loaded = false
        personCursor = nil; giftCursor = nil; occasionCursor = nil
    }

    func reload() async {
        guard signedIn, !reloading else { return }
        reloading = true
        busy = true; error = nil
        defer { busy = false; reloading = false }
        do {
            credential = try await client.usableSession()
            currentUser = try await client.me()
            offlineUserID = currentUser?.id
            if !fixture, let key = accountCacheKey { UserDefaults.standard.set(offlineUserID, forKey: key) }
            await flushIdeas()
            // A small family dataset: serial fetches keep server and memory load bounded.
            dashboard = try await client.dashboard()
            let theme = try await secondary { try await client.activeTheme() }
            christmas = theme?.themeKey == "christmas"
            let personPage = try await client.persons()
            people = personPage.items; personCursor = personPage.nextCursor
            let giftPage = try await client.gifts()
            gifts = giftPage.items; giftCursor = giftPage.nextCursor
            let occasionPage = try await client.occasions()
            occasions = occasionPage.items; occasionCursor = occasionPage.nextCursor
            inbox = try await secondary { try await client.ideas() }
            holidays = try await secondary { try await client.holidays() } ?? []
            activity = try await secondary { try await client.activity() }
            if let id = dashboard?.primaryOccasion?.id {
                budget = try await secondary { try await client.budget(occasionId: id) }
            }
            else { budget = nil }
            loaded = true
        } catch { handle(error) }
    }

    private func secondary<T>(_ fetch: () async throws -> T) async throws -> T? {
        do { return try await fetch() }
        catch let error as APIError where error.isUnauthorized || error == .sessionChanged || error == .expiredSession {
            throw error
        } catch is CancellationError {
            throw CancellationError()
        } catch { return nil }
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

    func open(_ path: String, title: String) {
        if path == "/ideas" { showIdeas = true }
        else if path.hasPrefix("/people/") || path.hasPrefix("/gifts/") || path.hasPrefix("/occasions/") {
            native = WebDestination(path: path, title: title)
        } else { web = WebDestination(path: path, title: title) }
    }
    private func ideaJournal() -> IdeaQueue {
        if let queue { return queue }
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let journal = IdeaQueue(file: base.appendingPathComponent(fixture ? "fixture-ideas-\(UUID()).json" : "pending-ideas.json"))
        queue = journal
        return journal
    }

    func flushIdeas(retrying retryID: UUID? = nil) async {
        guard signedIn, !sessionChanging, let account else { return }
        if retryID != nil { error = nil }
        let journal = ideaJournal()
        let client = client
        do {
            let session = try await client.captureSession()
            let items = try await journal.items(account: account)
            guard self.account == account, signedIn, !sessionChanging else { return }
            pendingIdeas = items
            try await journal.flush(account: account, retrying: retryID,
                                    find: { try await client.containsCapture($0, session: session) },
                                    send: { try await client.sendCapture($0, session: session) })
        } catch {
            if retryID != nil, self.account == account { handle(error) }
        }
        let remaining = try? await journal.items(account: account)
        if self.account == account, signedIn, !sessionChanging { pendingIdeas = remaining ?? pendingIdeas }
    }

    func discardIdea(_ id: UUID) async {
        guard let account, !sessionChanging else { return }
        let journal = ideaJournal()
        do {
            try await journal.discard(id, account: account)
            let remaining = try await journal.items(account: account)
            if self.account == account { pendingIdeas = remaining }
        } catch { if self.account == account { handle(error) } }
    }
    func saveIdea(name: String, url: String, notes: String, personIds: [Int], price: Decimal? = nil) async -> Bool {
        busy = true; error = nil
        defer { busy = false }
        guard !sessionChanging, let account else { error = "Sign in once while connected before saving offline."; return false }
        do {
            let queue = ideaJournal()
            try await queue.enqueue(PendingIdea(account: account, name: name.trimmingCharacters(in: .whitespacesAndNewlines), url: url.isEmpty ? nil : url, notes: notes.isEmpty ? nil : notes, price: price, personIds: personIds))
            let items = try await queue.items(account: account)
            guard self.account == account, !sessionChanging else { return true }
            if signedIn { pendingIdeas = items }
            await flushIdeas()
            await reload()
            if signedIn, self.account == account, !sessionChanging { selection = 2; captureSaved = true }
            return true
        } catch { self.error = "Could not save on this device. " + error.localizedDescription; return false }
    }
}

struct WebDestination: Identifiable {
    var id: String { path }
    let path: String
    let title: String
}

func money(_ value: Decimal) -> String { value.formatted(.currency(code: "USD")) }
