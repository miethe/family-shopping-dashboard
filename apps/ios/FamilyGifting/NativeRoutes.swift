import SwiftUI
import FamilyGiftingKit

struct NativeDestinationView: View {
    let model: AppModel
    let destination: WebDestination
    var body: some View {
        NavigationStack {
            destinationContent
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { model.native = nil } } }
        }
    }
    @ViewBuilder private var destinationContent: some View {
        let segments = destination.path.split(separator: "/")
        if destination.path == "/people/new" { PersonCreatorView(model: model) }
        else if destination.path == "/occasions/new" { NativeEventCreator(model: model) { _ in model.native = nil } }
        else if segments.first == "people", let value = segments.dropFirst().first, let id = Int(value), let person = model.people.first(where: { $0.id == id }) {
            PersonProfileView(model: model, person: person)
        } else if segments.first == "gifts", let value = segments.last, let id = Int(value), let gift = model.gifts.first(where: { $0.id == id }) {
            NativeGiftDetailView(model: model, gift: gift)
        } else if segments.first == "occasions", let value = segments.last, let id = Int(value), let occasion = model.occasions.first(where: { $0.id == id }) {
            NativeEventPlanView(model: model, route: .occasion(id, occasion.nextOccurrence ?? occasion.date), onUpdate: { _ in })
        } else { ContentUnavailableView("Refresh to see this item", systemImage: "arrow.clockwise") }
    }
}

#if DEBUG
/// Deterministic entry points to real views for local simulator review only.
struct FixtureScreen: View {
    let model: AppModel
    let screen: String
    var body: some View {
        NavigationStack {
            content
                .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Save idea", systemImage: "plus") { model.addIdea = true }.frame(minWidth: 44, minHeight: 44) } }
        }
    }
    @ViewBuilder private var content: some View {
        switch screen {
        case "people": NativePeopleView(model: model)
        case "profile": if let person = model.people.first(where: { $0.id == 3 }) ?? model.people.first { PersonProfileView(model: model, person: person) }
        case "gifts": NativeGiftsView(model: model)
        case "gift-detail": if let gift = model.gifts.first { NativeGiftDetailView(model: model, gift: gift) }
        case "ideas", "offline": NativeIdeasView(model: model)
        case "capture": AddIdeaView(model: model)
        case "events": NativeEventsView(model: model)
        case "holiday": NativeEventCreator(model: model) { _ in }
        case "more": MoreView(model: model)
        case let value where value.hasPrefix("creator-"): PersonCreatorView(model: model, initialStep: Int(value.replacingOccurrences(of: "creator-", with: "")) ?? 1)
        default: HomeView(model: model)
        }
    }
}
#endif
