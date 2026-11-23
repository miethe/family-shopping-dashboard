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
                .onChange(of: scenePhase) { _, phase in
                    if phase == .active && !model.starting && model.signedIn {
                        Task { await model.reload() }
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
            else if !model.configured { ServerSettings(model: model, firstLaunch: true) }
            else if !model.signedIn { SignInView(model: model) }
            else { AppShell(model: model) }
        }
        .sheet(isPresented: $model.settings) { ServerSettings(model: model, firstLaunch: false) }
        .sheet(isPresented: $model.addIdea) { AddIdeaView(model: model) }
        .sheet(item: $model.web, onDismiss: { Task { await model.reload() } }) { destination in
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
            tab("People", systemImage: "person.2", index: 1) { PeopleView(model: model) }
            tab("Gifts", systemImage: "gift", index: 2) { GiftsView(model: model) }
            tab("Events", systemImage: "calendar", index: 3) { EventsView(model: model) }
            tab("More", systemImage: "ellipsis", index: 4) { MoreView(model: model) }
        }
    }

    private func tab<Content: View>(_ title: String, systemImage: String, index: Int, @ViewBuilder content: () -> Content) -> some View {
        NavigationStack {
            content()
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        HStack(spacing: 6) {
                            TogetherBow(size: 30)
                            Text("Family Gifting").font(ConfettiFont.subheading)
                        }.accessibilityElement(children: .combine)
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
