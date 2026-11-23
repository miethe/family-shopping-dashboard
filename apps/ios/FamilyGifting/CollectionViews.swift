import SwiftUI
import FamilyGiftingKit

struct PeopleView: View {
    @Bindable var model: AppModel
    @State private var search = ""
    @Environment(\.confettiTheme) private var theme
    private var people: [Person] { model.people.filter { search.isEmpty || $0.displayName.localizedCaseInsensitiveContains(search) } }
    var body: some View {
        List {
            Section {
                Text("Your people").font(ConfettiFont.display)
                Text("The little things that make them, them.").font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted)
                Button("Add a person", systemImage: "person.badge.plus") { model.open("/people/new", title: "Add a person") }.frame(minHeight: 44)
            }.listRowBackground(Color.clear)
            if let error = model.error { ErrorNotice(message: error) }
            if model.loaded && model.people.isEmpty {
                ConfettiEmptyState(title: "Start with someone you love", message: "One name is all it takes. Add the details as you go.", systemImage: "person.2")
            }
            ForEach(people, id: \.id) { person in
                Button { model.open("/people/\(person.id)/profile", title: person.displayName) } label: {
                    HStack(spacing: 14) {
                        ConfettiAvatar(name: person.displayName, size: 50)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(person.displayName).font(ConfettiFont.subheading)
                            if let relationship = person.relationship { Text(relationship).font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted) }
                        }
                        Spacer()
                        Image(systemName: "chevron.right").foregroundStyle(ConfettiColor.muted).accessibilityHidden(true)
                    }.padding(.vertical, 6)
                }.buttonStyle(.plain)
            }
            if model.hasMore { Button("Load more people") { Task { await model.loadMore() } }.disabled(model.busy) }
        }.scrollContentBackground(.hidden).background(theme.paper)
            .searchable(text: $search, prompt: "Find someone in this list")
            .refreshable { await model.reload() }
    }
}

struct GiftsView: View {
    @Bindable var model: AppModel
    @State private var search = ""
    @Environment(\.confettiTheme) private var theme
    private var gifts: [Gift] { model.gifts.filter { search.isEmpty || $0.name.localizedCaseInsensitiveContains(search) } }
    var body: some View {
        List {
            Section {
                Text("Little things, big smiles.").font(ConfettiFont.display)
                Button("Ideas inbox", systemImage: "tray") { model.open("/ideas", title: "Ideas inbox") }.frame(minHeight: 44)
            }.listRowBackground(Color.clear)
            if let error = model.error { ErrorNotice(message: error) }
            if model.loaded && model.gifts.isEmpty {
                ConfettiEmptyState(title: "A good idea can start anywhere", message: "Tap + to save a link or something they mentioned.", systemImage: "gift")
            }
            ForEach(gifts, id: \.id) { gift in
                Button { model.open("/gifts/\(gift.id)", title: gift.name) } label: {
                    HStack(spacing: 14) {
                        Image(systemName: "gift").font(.title2).frame(width: 48, height: 48)
                            .background(ConfettiColor.butter, in: RoundedRectangle(cornerRadius: 15)).accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 6) {
                            Text(gift.name).font(ConfettiFont.subheading)
                            ConfettiStatusPill(title: gift.status.rawValue.capitalized, tone: statusTone(gift.status.rawValue))
                        }
                        Spacer(minLength: 0)
                        if let price = gift.price { Text(money(price)).font(ConfettiFont.detail) }
                    }.padding(.vertical, 6)
                }.buttonStyle(.plain)
            }
            if model.hasMore { Button("Load more gifts") { Task { await model.loadMore() } }.disabled(model.busy) }
        }.scrollContentBackground(.hidden).background(theme.paper)
            .searchable(text: $search, prompt: "Find a gift in this list")
            .refreshable { await model.reload() }
    }
    private func statusTone(_ value: String) -> ConfettiStatusTone {
        switch value { case "purchased": .purchased; case "received": .received; case "selected", "partial": .selected; default: .idea }
    }
}

struct EventsView: View {
    @Bindable var model: AppModel
    @Environment(\.confettiTheme) private var theme
    var body: some View {
        List {
            Section {
                Text("Good days ahead.").font(ConfettiFont.display)
                Button("Calendar & holidays", systemImage: "calendar") { model.open("/events", title: "Calendar & holidays") }.frame(minHeight: 44)
                Button("Plan an event", systemImage: "calendar.badge.plus") { model.open("/occasions/new", title: "New event") }.frame(minHeight: 44)
            }.listRowBackground(Color.clear)
            if let error = model.error { ErrorNotice(message: error) }
            if model.loaded && model.occasions.isEmpty {
                ConfettiEmptyState(title: "Make a day of it", message: "Bring birthdays, holidays, and just-because moments together.", systemImage: "calendar")
            }
            ForEach(model.occasions.sorted { ($0.nextOccurrence ?? $0.date).rawValue < ($1.nextOccurrence ?? $1.date).rawValue }, id: \.id) { event in
                Button { model.open("/occasions/\(event.id)", title: event.name) } label: {
                    HStack(spacing: 16) {
                        VStack {
                            Text((event.nextOccurrence ?? event.date).date.formatted(.dateTime.month(.abbreviated))).font(ConfettiFont.caption)
                            Text((event.nextOccurrence ?? event.date).date.formatted(.dateTime.day())).font(ConfettiFont.heading)
                        }.padding(10).background(ConfettiColor.butter, in: RoundedRectangle(cornerRadius: 15)).accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(event.name).font(ConfettiFont.subheading)
                            Text((event.nextOccurrence ?? event.date).date.formatted(date: .abbreviated, time: .omitted)).font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted)
                        }
                        Spacer()
                        Image(systemName: "chevron.right").accessibilityHidden(true)
                    }.padding(.vertical, 6)
                }.buttonStyle(.plain)
            }
            if model.hasMore { Button("Load more events") { Task { await model.loadMore() } }.disabled(model.busy) }
        }.scrollContentBackground(.hidden).background(theme.paper).refreshable { await model.reload() }
    }
}

struct MoreView: View {
    @Bindable var model: AppModel
    @Environment(\.confettiTheme) private var theme
    var body: some View {
        List {
            Section {
                Text("A little more together.").font(ConfettiFont.display)
            }.listRowBackground(Color.clear)
            Section("Your plans") {
                destination("Ideas inbox", icon: "tray", path: "/ideas")
                destination("Lists", icon: "checklist", path: "/lists")
                destination("Budgets", icon: "chart.bar", path: "/budgets")
                destination("Assignments", icon: "person.crop.circle.badge.checkmark", path: "/assignments")
                destination("Event planner", icon: "calendar", path: "/occasions")
            }
            Section("Your family") {
                Button("Server settings", systemImage: "network") { model.settings = true }.frame(minHeight: 44)
                Button("Sign out", systemImage: "rectangle.portrait.and.arrow.right", role: .destructive) { Task { await model.signOut() } }.frame(minHeight: 44)
            }
            Section {
                Text("Family Gifting · 0.1\nMade for thoughtful moments, together.").font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted)
            }
        }.scrollContentBackground(.hidden).background(theme.paper)
    }
    private func destination(_ name: String, icon: String, path: String) -> some View {
        Button { model.open(path, title: name) } label: { Label(name, systemImage: icon).frame(minHeight: 44) }
    }
}
