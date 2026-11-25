import SwiftUI
import FamilyGiftingKit

struct HomeView: View {
    @Bindable var model: AppModel
    @Environment(\.confettiTheme) private var theme
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Hello").font(ConfettiFont.display)
                    if let holiday = model.dashboard?.primaryOccasion {
                        Text("Up next: \(holiday.name) · \(holiday.daysUntil) days")
                            .font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted)
                    } else { Text("Good things start with a little thought.").font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted) }
                }
                if let error = model.error {
                    ErrorNotice(message: error)
                    Button("Try again") { Task { await model.reload() } }.buttonStyle(ConfettiButtonStyle(.secondary))
                }
                if !model.loaded && model.busy { ProgressView("Gathering your plans…").frame(maxWidth: .infinity) }
                if model.christmas { festoon }
                if let occasion = model.dashboard?.primaryOccasion {
                    VStack(alignment: .leading, spacing: 12) {
                        ViewThatFits(in: .horizontal) {
                            HStack(alignment: .center, spacing: 16) {
                                heroTitle(occasion.name, date: occasion.date.date)
                                Spacer(minLength: 0)
                                ConfettiCountdownDoor(days: occasion.daysUntil, unit: "sleeps to go")
                            }
                            VStack(alignment: .leading, spacing: 16) {
                                heroTitle(occasion.name, date: occasion.date.date)
                                ConfettiCountdownDoor(days: occasion.daysUntil, unit: "sleeps to go")
                            }
                        }
                        Divider().overlay(.white.opacity(0.3))
                        ViewThatFits(in: .horizontal) {
                            HStack {
                                Text("\(occasion.purchasedItems) of \(occasion.totalItems) gifts bought").font(ConfettiFont.detail)
                                Spacer()
                                planButton(occasion.id)
                            }
                            VStack(alignment: .leading) {
                                Text("\(occasion.purchasedItems) of \(occasion.totalItems) gifts bought").font(ConfettiFont.detail)
                                planButton(occasion.id)
                            }
                        }
                    }.padding(16).foregroundStyle(.white)
                        .background(theme.accent, in: RoundedRectangle(cornerRadius: 26))
                } else if !model.busy {
                    ConfettiCard(fill: ConfettiColor.blue) {
                        VStack(alignment: .leading, spacing: 12) {
                            ConfettiEmptyState(title: "Something to look forward to", message: "Add a birthday, holiday, or just-because day. We’ll keep the countdown.", systemImage: "calendar.badge.plus")
                            Button("Plan an event") { model.open("/occasions/new", title: "New event") }
                                .buttonStyle(ConfettiButtonStyle(.primary))
                        }
                    }
                }
                if let birthday = nextBirthday, !isHeroBirthday(birthday.person) {
                    Button { model.open("/people/\(birthday.person.id)/profile", title: birthday.person.displayName) } label: {
                        HStack {
                            Image(systemName: "birthday.cake").accessibilityHidden(true)
                            Text("\(birthday.person.displayName)’s birthday").font(ConfettiFont.detail)
                            Spacer()
                            Text("\(birthday.days) days →").font(ConfettiFont.label)
                        }.padding(14).foregroundStyle(ConfettiColor.ink).background(theme.birthdayFill, in: RoundedRectangle(cornerRadius: 15))
                    }.buttonStyle(.plain)
                }
                sectionTitle("Ideas inbox", action: "See all") { model.showIdeas = true }
                if let inbox = model.inbox, !inbox.ideas.isEmpty {
                    VStack(spacing: 10) {
                        ForEach(Array(inbox.ideas.prefix(2)), id: \.id) { idea in
                            Button { model.showIdeas = true } label: {
                                ConfettiCard(padding: 6) {
                                    HStack(spacing: 12) {
                                        Image(systemName: "lightbulb").font(.title2).frame(width: 46, height: 46)
                                            .background(ConfettiColor.butter, in: RoundedRectangle(cornerRadius: 15)).accessibilityHidden(true)
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(idea.name).font(ConfettiFont.detail)

                                        }
                                        Spacer(minLength: 0)
                                        if let price = idea.price { Text(money(price)).font(ConfettiFont.label) }
                                    }
                                }
                            }.buttonStyle(.plain)
                        }
                    }
                } else if model.loaded {
                    ConfettiCard {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Catch the next “they’d love this.”").font(ConfettiFont.subheading)
                            Text("Save a link or a little note now. Pick the person later.").font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted)
                            Button("Save an idea") { model.addIdea = true }.buttonStyle(ConfettiButtonStyle(.secondary))
                        }
                    }
                }
                if let budget = model.budget {
                    ConfettiCard(fill: ConfettiColor.mint, padding: 12) {
                        VStack(alignment: .leading, spacing: 8) {
                            if let total = budget.budgetTotal {
                                ViewThatFits(in: .horizontal) {
                                    HStack {
                                        Text("Gift budget").font(ConfettiFont.label)
                                        Spacer()
                                        Text("\(money(budget.purchasedAmount)) / \(money(total))").font(ConfettiFont.detail)
                                    }
                                    VStack(alignment: .leading) {
                                        Text("Gift budget").font(ConfettiFont.label)
                                        Text("\(money(budget.purchasedAmount)) / \(money(total))").font(ConfettiFont.detail)
                                    }
                                }
                                ProgressView(value: min(max(budget.purchasedPercent, 0), 100), total: 100)
                                    .tint(theme.accent).accessibilityLabel("Budget spent")
                                if budget.isOverBudget { Text("A little over budget — time to check the plan.").font(ConfettiFont.caption) }
                            } else {
                                Button("Set a little room for giving →") { model.open("/budgets", title: "Budgets") }
                                    .font(ConfettiFont.detail).frame(minHeight: 44)
                            }
                        }
                    }
                }
                sectionTitle("Your people", action: "See all") { model.selection = 1 }
                if !model.people.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(alignment: .top, spacing: 12) {
                            ForEach(Array(model.people.prefix(8)), id: \.id) { person in
                                Button { model.open("/people/\(person.id)/profile", title: person.displayName) } label: {
                                    VStack(spacing: 8) {
                                        PersonAvatar(model: model, person: person, size: 54)
                                        Text(person.displayName).font(ConfettiFont.caption).lineLimit(2)
                                    }.frame(width: 68)
                                }.buttonStyle(.plain).accessibilityLabel("Open \(person.displayName)’s profile")
                            }
                        }.padding(.vertical, 4)
                    }
                } else if model.loaded {
                    ConfettiCard {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Start with someone you love.").font(ConfettiFont.subheading)
                            Button("Add your first person") { model.open("/people/new", title: "Add a person") }.buttonStyle(ConfettiButtonStyle(.secondary))
                        }
                    }
                }
                if let event = model.activity?.events.first {
                    Label(event.message, systemImage: "checkmark.circle")
                        .font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted)
                        .padding(12).frame(maxWidth: .infinity, alignment: .leading)
                        .background(.white.opacity(0.7), in: RoundedRectangle(cornerRadius: 15))
                }
            }.padding(20).frame(maxWidth: 700).frame(maxWidth: .infinity)
        }.background(theme.paper).foregroundStyle(ConfettiColor.ink)
            .refreshable { await model.reload() }
    }

    private func heroTitle(_ name: String, date: Date) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(model.christmas ? "Let the merry begin" : "The big one is coming").font(ConfettiFont.caption).textCase(.uppercase)
            Text(name).font(ConfettiFont.heading)
            Text(date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())).font(ConfettiFont.detail)
        }
    }
    private func planButton(_ id: Int) -> some View {
        Button("Open plan →") { model.open("/occasions/\(id)", title: "Event plan") }
            .font(ConfettiFont.label).foregroundStyle(ConfettiColor.ink).padding(.horizontal, 12).frame(minHeight: 44)
            .background(.white, in: RoundedRectangle(cornerRadius: 12))
    }
    private func sectionTitle(_ title: String, action: String, perform: @escaping () -> Void) -> some View {
        HStack {
            ConfettiSectionHeader(title)
            Spacer()
            Button(action + " →", action: perform).font(ConfettiFont.caption).frame(minHeight: 44)
        }
    }
    private var festoon: some View {
        HStack(spacing: 0) {
            ForEach(0..<18) { index in
                Rectangle().fill([ConfettiColor.cranberry, ConfettiColor.butter, ConfettiColor.green][index % 3])
            }
        }.frame(height: 7).clipShape(Capsule()).accessibilityHidden(true)
    }
    private func isHeroBirthday(_ person: Person) -> Bool {
        guard let title = model.dashboard?.primaryOccasion?.name,
              let first = person.displayName.split(separator: " ").first else { return false }
        return title.localizedCaseInsensitiveContains("birthday") && title.localizedCaseInsensitiveContains(String(first))
    }
    private var nextBirthday: (person: Person, days: Int)? {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        return model.people.compactMap { person -> (Person, Int)? in
            guard let date = person.birthdate?.date else { return nil }
            let parts = calendar.dateComponents([.month, .day], from: date)
            guard let next = calendar.nextDate(after: today.addingTimeInterval(-1), matching: parts, matchingPolicy: .nextTime),
                  let days = calendar.dateComponents([.day], from: today, to: next).day else { return nil }
            return (person, days)
        }.min { $0.1 < $1.1 }
    }
}
