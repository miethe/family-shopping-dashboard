import SwiftUI
import FamilyGiftingKit

@main
struct FamilyGiftingApp: App {
    @State private var model = AppModel()
    @Environment(\.scenePhase) private var scenePhase
    var body: some Scene {
        WindowGroup {
            RootView(model: model)
                .confettiTheme(model.christmas ? .christmas : .everyday)
                .task { await model.start() }
                .onOpenURL { url in
                    if url.scheme == "familygifting", url.host == "countdown" { model.selection = 3 }
                }
                .onChange(of: scenePhase) { _, phase in
                    if phase == .active && !model.starting {
                        Task { await model.resume() }
                    }
                }
        }
    }
}

struct RootView: View {
    @Bindable var model: AppModel
    var body: some View {
        SwiftUI.Group {
            if model.starting { ProgressView("Gathering the good stuff…") }
            else if !model.signedIn { WelcomeView(model: model) }
            else {
                #if DEBUG
                if model.fixture, let index = ProcessInfo.processInfo.arguments.firstIndex(of: "--screen"), ProcessInfo.processInfo.arguments.indices.contains(index + 1) {
                    let screen = ProcessInfo.processInfo.arguments[index + 1]
                    if let tab = ["home", "people", "gifts", "events", "more"].firstIndex(of: screen) {
                        AppShell(model: model).task { model.selection = tab }
                    } else {
                    FixtureScreen(model: model, screen: screen)
                        .task {
                            if ProcessInfo.processInfo.arguments[index + 1] == "offline" {
                                _ = await model.saveIdea(name: "Watercolour set", url: "", notes: "For a rainy afternoon", personIds: [])
                                model.showIdeas = false
                            }
                        }
                    }
                } else { AppShell(model: model) }
                #else
                AppShell(model: model)
                #endif
            }
        }
        .sheet(item: $model.native) { NativeDestinationView(model: model, destination: $0) }
        .sheet(isPresented: $model.settings) { ServerSettings(model: model) }
        .sheet(isPresented: $model.showIdeas) { NavigationStack { NativeIdeasView(model: model) } }
        .sheet(isPresented: $model.addIdea, onDismiss: { if model.captureSaved { model.captureSaved = false; model.showIdeas = true } }) { AddIdeaView(model: model) }
        .sheet(item: $model.web, onDismiss: { Task { await model.resume() } }) { destination in
            NavigationStack {
                if let credential = model.credential, let origin = URL(string: model.address) {
                    SessionWebView(origin: origin, path: destination.path, token: credential.accessToken,
                                   expiresAt: credential.expiresAt, onSessionExpired: {
                        Task { await model.signOut(); model.error = "Your session has ended. Please sign in again." }
                    }, isPreview: model.fixture)
                    .navigationTitle(destination.title)
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { model.web = nil } } }
                }
            }
        }
    }
}

struct AppShell: View {
    @Bindable var model: AppModel
    var body: some View {
        TabView(selection: $model.selection) {
            tab("Home", systemImage: "house", index: 0) { HomeView(model: model) }
            tab("People", systemImage: "person.2", index: 1) { NativePeopleView(model: model) }
            tab("Gifts", systemImage: "gift", index: 2) { NativeGiftsView(model: model) }
            tab("Events", systemImage: "calendar", index: 3) { NativeEventsView(model: model) }
            tab("More", systemImage: "ellipsis", index: 4) { MoreView(model: model) }
        }
    }

    private func tab<Content: View>(_ title: String, systemImage: String, index: Int, @ViewBuilder content: () -> Content) -> some View {
        NavigationStack {
            content()
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        TogetherBow(size: 30).accessibilityLabel("Family Gifting")
                    }
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { model.addIdea = true } label: { Label("Add idea", systemImage: "plus") }
                            .frame(minWidth: 44, minHeight: 44)
                    }
                }
                .navigationBarTitleDisplayMode(.inline)
        }
        .tabItem { Label(title, systemImage: systemImage) }.tag(index)
    }
}

struct ErrorNotice: View {
    let message: String
    var body: some View {
        Label(message, systemImage: "exclamationmark.circle")
            .font(ConfettiFont.detail).foregroundStyle(ConfettiColor.cranberry)
            .padding(12).frame(maxWidth: .infinity, alignment: .leading)
            .background(ConfettiColor.pink.opacity(0.35), in: RoundedRectangle(cornerRadius: 15))
            .accessibilityAddTraits(.isStaticText)
    }
}
