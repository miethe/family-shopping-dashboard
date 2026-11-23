import SwiftUI
import FamilyGiftingKit

struct MoreView: View {
    @Bindable var model: AppModel
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var size
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("A little more").font(ConfettiFont.display)
                Text("Everything in your family space.").font(ConfettiFont.detail)
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: size.isAccessibilitySize ? 1 : 2), spacing: 12) {
                    tile("Ideas", icon: "lightbulb") { model.showIdeas = true }
                    tile("Budget", icon: "creditcard") { model.open("/budgets", title: "Budget") }
                    tile("Lists", icon: "checklist") { model.open("/lists", title: "Lists") }
                    tile("Assignments", icon: "person.2") { model.open("/assignments", title: "Assignments") }
                    tile("Occasions", icon: "calendar") { model.selection = 3 }
                    tile("Admin", icon: "gearshape") { model.open("/admin", title: "Admin") }
                    tile("Settings", icon: "network") { model.settings = true }
                }
                ConfettiCard {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Seasonal themes").font(ConfettiFont.subheading)
                        Text(model.christmas ? "Christmas is ready to party." : "A little celebration when your events are near.").font(ConfettiFont.detail)
                    }
                }
                Text(model.address).font(ConfettiFont.caption).textSelection(.enabled)
                Button("Sign out", systemImage: "rectangle.portrait.and.arrow.right", role: .destructive) { Task { await model.signOut() } }.frame(minHeight: 44)
            }.padding(20)
        }.background(theme.paper)
    }
    private func tile(_ title: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: icon).font(ConfettiFont.detail).frame(maxWidth: .infinity, minHeight: 56, alignment: .leading).padding(12)
                .background(.white, in: RoundedRectangle(cornerRadius: 18))
        }.buttonStyle(.plain).accessibilityLabel(title)
    }
}
