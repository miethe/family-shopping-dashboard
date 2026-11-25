import SwiftUI
import FamilyGiftingKit

struct NativeEventsView: View {
    let model: AppModel
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var textSize
    @State private var mode = EventCalendarMode.upcoming
    @State private var includeClosed = true
    @State private var firstYear = Calendar(identifier: .gregorian).component(.year, from: .now)
    @State private var selectedDate = Date.now
    @State private var plans: [EventPlan] = []
    @State private var planRevision = 0
    @State private var loading = false
    @State private var loadError: String?
    @State private var showingCreator = false
    @State private var createdPlan: Int?
    @State private var openPlan: Int?

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 16) {
                ViewThatFits(in: .horizontal) {
                    HStack(alignment: .top, spacing: 12) { introduction; Spacer(minLength: 0); addButton }
                    VStack(alignment: .leading, spacing: 12) { introduction; addButton }
                }
                EventSwitches(selection: $mode)

                if mode != .month { yearFilters }
                if let error = loadError ?? model.error {
                    ErrorNotice(message: error)
                    Button("Try again") { Task { await refresh() } }
                        .buttonStyle(ConfettiButtonStyle(.secondary))
                }
                if loading && plans.isEmpty && model.occasions.isEmpty {
                    ProgressView("Loading events…")
                } else {
                    switch mode {
                    case .upcoming: upcoming
                    case .season: seasons
                    case .month: month
                    }
                }
                if model.hasMore {
                    Button("Load more events") { Task { await model.loadMore() } }
                        .buttonStyle(ConfettiButtonStyle(.secondary))
                        .disabled(model.busy)
                }
            }
            .padding(20)
            .frame(maxWidth: 700)
            .frame(maxWidth: .infinity)
        }
        .foregroundStyle(ConfettiColor.ink)
        .background(theme.paper)
        .task { await loadPlans() }
        .refreshable { await refresh() }
        .navigationDestination(for: EventCalendarEntry.ID.self) { route in
            NativeEventPlanView(model: model, route: route, onUpdate: store)
        }
        .navigationDestination(item: $openPlan) { id in
            NativeEventPlanView(model: model, route: .plan(id), onUpdate: store)
        }
        .sheet(isPresented: $showingCreator, onDismiss: showCreatedPlan) {
            NativeEventCreator(model: model) { event in
                store(event)
                createdPlan = event.id
                showingCreator = false
            }
        }
    }

    private var introduction: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text("Good days ahead.")
                .font(ConfettiFont.display)
                .accessibilityAddTraits(.isHeader)
            Text("Your family calendar, all in one place.")
                .font(ConfettiFont.detail)
                .foregroundStyle(ConfettiColor.muted)
        }
        .fixedSize(horizontal: false, vertical: true)
    }

    private var addButton: some View {
        Button("Add event", systemImage: "plus") { showingCreator = true }
            .buttonStyle(ConfettiButtonStyle(.primary))
    }

    private var entries: [EventCalendarEntry] {
        EventCalendarEntry.timeline(plans: plans, occasions: model.occasions)
    }

    private var yearEntries: [EventCalendarEntry] {
        entries.filter { (firstYear...(firstYear + 1)).contains($0.year) && (includeClosed || !$0.isClosed) }
    }

    private var yearFilters: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) { years; closedToggle }
            VStack(alignment: .leading, spacing: 8) { years; closedToggle }
        }
    }

    private var years: some View {
        let currentYear = Calendar(identifier: .gregorian).component(.year, from: .now)
        let recordedYears = entries.map(\.year)
        let startYears = Set(Array((currentYear - 5)...(currentYear + 5)) + recordedYears + recordedYears.map { $0 - 1 })
            .filter { $0 > 0 }
            .sorted(by: >)
        return Menu {
            Picker("Starting year", selection: $firstYear) {
                ForEach(startYears, id: \.self) { year in
                    Text(verbatim: "\(year)–\(year + 1)").tag(year)
                }
            }
        } label: {
            Label("\(firstYear.formatted(.number.grouping(.never)))–\((firstYear + 1).formatted(.number.grouping(.never)))",
                  systemImage: "calendar")
                .font(ConfettiFont.label)
                .frame(minWidth: 44, minHeight: 44)
        }
        .tint(theme.accent)
        .accessibilityLabel("Calendar years")
        .accessibilityValue(Text(verbatim: "\(firstYear) through \(firstYear + 1)"))
    }

    private var closedToggle: some View {
        Toggle("Include closed", isOn: $includeClosed)
            .toggleStyle(.button)
            .buttonStyle(ConfettiButtonStyle(includeClosed ? .secondary : .tertiary))
            .tint(theme.accent)
    }

    private var upcoming: some View {
        let today = CalendarDate(localDate: .now)
        let future = yearEntries.filter { row in
            !row.isClosed && today.map { row.date >= $0 } == true
        }
        let closed = yearEntries.filter(\.isClosed).reversed()
        return VStack(alignment: .leading, spacing: 10) {
            sectionHeading("Next celebrations")
            if future.isEmpty {
                empty("No upcoming events", "Add a birthday, holiday, or day of your own.")
            }
            ForEach(future) { entry in row(entry, countdown: true) }
            if !closed.isEmpty {
                sectionHeading("Closed events").padding(.top, 8)
                ForEach(Array(closed)) { entry in
                    DisclosureGroup {
                        row(entry)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(entry.name).font(ConfettiFont.label)
                            Text(entry.date.date.formatted(.dateTime.month(.abbreviated).day().year()))
                                .font(ConfettiFont.caption)
                                .foregroundStyle(ConfettiColor.muted)
                        }
                        .frame(minHeight: 44)
                    }
                    .padding(.horizontal, 12)
                    .background(ConfettiColor.subtle, in: RoundedRectangle(cornerRadius: 14))
                    .tint(ConfettiColor.ink)
                }
            }
        }
    }

    private var seasons: some View {
        let rows = yearEntries
        return VStack(alignment: .leading, spacing: 10) {
            sectionHeading("Season by season")
            if rows.isEmpty { empty("No events in these years", "Choose another range or add an event.") }
            ForEach(Array(rows.enumerated()), id: \.element.id) { index, entry in
                if index == 0 || rows[index - 1].season != entry.season || rows[index - 1].year != entry.year {
                    Text("\(entry.season) \(entry.year.formatted(.number.grouping(.never)))")
                        .font(ConfettiFont.label)
                        .foregroundStyle(theme.accent)
                        .accessibilityAddTraits(.isHeader)
                        .padding(.top, 8)
                }
                row(entry)
            }
        }
    }

    private var month: some View {
        let selectedDay = CalendarDate(localDate: selectedDate)
        let chosen = entries.filter { $0.date == selectedDay && (includeClosed || !$0.isClosed) }
        return VStack(alignment: .leading, spacing: 10) {
            ConfettiCard {
                if textSize.isAccessibilitySize {
                    DatePicker("Choose a date", selection: $selectedDate, displayedComponents: .date)
                        .datePickerStyle(.compact)
                        .frame(minHeight: 44)
                } else {
                    DatePicker("Choose a date", selection: $selectedDate, displayedComponents: .date)
                        .datePickerStyle(.graphical)
                }
            }
            .tint(theme.accent)
            closedToggle
            sectionHeading(selectedDate.formatted(.dateTime.weekday(.wide).month(.abbreviated).day()))
            if chosen.isEmpty { empty("No events on this date", "Choose a different date to see its events.") }
            ForEach(chosen) { entry in row(entry) }
        }
    }

    private func sectionHeading(_ title: String) -> some View {
        Text(title).font(ConfettiFont.heading).accessibilityAddTraits(.isHeader)
    }

    private func empty(_ title: String, _ message: String) -> some View {
        ConfettiCard {
            ConfettiEmptyState(title: title, message: message, systemImage: "calendar")
        }
    }

    private func row(_ entry: EventCalendarEntry, countdown: Bool = false) -> some View {
        NavigationLink(value: entry.id) {
            EventAgendaRow(entry: entry, showsCountdown: countdown)
        }
        .buttonStyle(.plain)
    }

    private func refresh() async {
        await model.reload()
        await loadPlans()
    }

    private func loadPlans() async {
        guard !loading else { return }
        loading = true
        loadError = nil
        let revision = planRevision
        defer { loading = false }
        do {
            let fetched = try await model.client.eventPlans()
            if revision == planRevision { plans = fetched }
        } catch {
            loadError = eventError(error, model: model)
        }
    }

    private func store(_ event: EventPlan) {
        planRevision += 1
        plans.removeAll { $0.id == event.id }
        plans.append(event)
    }

    private func showCreatedPlan() {
        openPlan = createdPlan
        createdPlan = nil
    }
}

private enum EventCalendarMode: String, CaseIterable, Hashable {
    case month = "Month"
    case upcoming = "Upcoming"
    case season = "Season"
}

private enum EventKind: String, CaseIterable, Hashable {
    case holiday = "Holiday"
    case birthday = "Birthday"
    case custom = "Custom"
}

private struct EventSwitches<Option: RawRepresentable & CaseIterable & Hashable>: View where Option.RawValue == String {
    @Binding var selection: Option
    @Environment(\.dynamicTypeSize) private var textSize

    var body: some View {
        if textSize.isAccessibilitySize {
            VStack(alignment: .leading, spacing: 6) { options }
        } else {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 6) { options }
                VStack(alignment: .leading, spacing: 6) { options }
            }
        }
    }

    private var options: some View {
        ForEach(Array(Option.allCases), id: \.self) { option in
            Button(option.rawValue) { selection = option }
                .buttonStyle(ConfettiButtonStyle(selection == option ? .primary : .secondary))
                .accessibilityAddTraits(selection == option ? .isSelected : [])
        }
    }
}

private struct EventAgendaRow: View {
    let entry: EventCalendarEntry
    let showsCountdown: Bool
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var textSize

    var body: some View {
        ConfettiCard {
            if textSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 8) {
                    details
                    countdown
                }
            } else {
                HStack(spacing: 12) {
                    dateTile
                    details
                    Spacer(minLength: 0)
                    countdown
                }
            }
        }
        .accessibilityElement(children: .combine)
    }

    private var dateTile: some View {
        VStack(spacing: 0) {
            Text(entry.date.date.formatted(.dateTime.month(.abbreviated))).font(ConfettiFont.caption).textCase(.uppercase)
            Text(entry.date.date.formatted(.dateTime.day())).font(ConfettiFont.heading)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .frame(minWidth: 48)
        .background(theme.birthdayFill, in: RoundedRectangle(cornerRadius: 12))
        .accessibilityHidden(true)
    }

    private var details: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.name).font(ConfettiFont.subheading)
            Text(entry.date.date.formatted(.dateTime.month(.abbreviated).day().year()))
                .font(ConfettiFont.caption)
                .foregroundStyle(ConfettiColor.muted)
            if let plan = entry.plan {
                Text("\(plan.purchasedCount) of \(plan.giftCount) gifts bought")
                    .font(ConfettiFont.caption)
                    .foregroundStyle(ConfettiColor.muted)
                if let budget = plan.budgetTotal {
                    Text("Budget \(money(budget))")
                        .font(ConfettiFont.caption)
                        .foregroundStyle(ConfettiColor.muted)
                }
            }
            if entry.isClosed { ConfettiStatusPill(title: "Closed", tone: .idea) }
        }
        .fixedSize(horizontal: false, vertical: true)
    }

    @ViewBuilder private var countdown: some View {
        if showsCountdown,
           let days = Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: .now), to: entry.date.date).day {
            Text(days == 0 ? "Today" : "\(days)d")
                .font(ConfettiFont.label)
                .foregroundStyle(theme.accent)
                .accessibilityLabel(days == 0 ? "Today" : "\(days) days away")
        }
    }
}

struct NativeEventCreator: View {
    let model: AppModel
    let onCreated: (EventPlan) -> Void
    @Environment(\.dismiss) private var dismiss
    @Environment(\.confettiTheme) private var theme
    @State private var kind = EventKind.holiday
    @State private var search = ""
    @State private var path: [HolidayRoute] = []
    @State private var saving = false

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text(kind == .holiday ? "Pick a holiday" : "Plan an event")
                        .font(ConfettiFont.display)
                        .accessibilityAddTraits(.isHeader)
                    if kind == .holiday {
                        Text("Start a little family tradition.")
                            .font(ConfettiFont.detail)
                            .foregroundStyle(ConfettiColor.muted)
                    }
                    EventSwitches(selection: $kind)
                    switch kind {
                    case .holiday:
                        holidayList
                    case .birthday, .custom:
                        EventDraftFields(model: model, kind: kind, saving: $saving, onCreated: onCreated)
                            .id(kind)
                    }
                }
                .padding(20)
                .frame(maxWidth: 640)
                .frame(maxWidth: .infinity)
            }
            .scrollDismissesKeyboard(.interactively)
            .background(theme.paper)
            .foregroundStyle(ConfettiColor.ink)
            .navigationTitle("New event")
            .navigationBarTitleDisplayMode(.inline)
            .disabled(saving)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.frame(minHeight: 44).disabled(saving)
                }
            }
            .navigationDestination(for: HolidayRoute.self) { route in
                switch route {
                case .pick(let id):
                    if let holiday = model.holidays.first(where: { $0.id == id }) {
                        ScrollView {
                            EventDraftFields(model: model, kind: .holiday, holiday: holiday, saving: $saving, onCreated: onCreated)
                                .padding(20)
                                .frame(maxWidth: 640)
                                .frame(maxWidth: .infinity)
                        }
                        .scrollDismissesKeyboard(.interactively)
                        .foregroundStyle(ConfettiColor.ink)
                        .background(theme.paper)
                        .navigationTitle(holiday.name)
                    }
                case .create:
                    CreateHolidayView(model: model, saving: $saving) { holiday in
                        model.holidays.removeAll { $0.id == holiday.id }
                        model.holidays.append(holiday)
                        path = [.pick(holiday.id)]
                    }
                }
            }
        }
        .interactiveDismissDisabled(saving)
        .tint(theme.accent)
    }

    private var holidayList: some View {
        let holidays = Holiday.upcoming(model.holidays, matching: search)
        return VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass").accessibilityHidden(true)
                TextField("Find a holiday", text: $search)
                    .textInputAutocapitalization(.never)
                    .frame(minHeight: 44)
            }
            .font(ConfettiFont.body)
            .padding(.horizontal, 12)
            .background(.white, in: RoundedRectangle(cornerRadius: 13))
            .overlay { RoundedRectangle(cornerRadius: 13).strokeBorder(ConfettiColor.line) }

            Text("Coming up next").font(ConfettiFont.subheading).accessibilityAddTraits(.isHeader)
            if let error = model.error {
                ErrorNotice(message: error)
                Button("Try again") { Task { await model.reload() } }
                    .buttonStyle(ConfettiButtonStyle(.secondary))
            }
            if model.busy && model.holidays.isEmpty {
                ProgressView("Loading holidays…")
            } else if holidays.isEmpty {
                Text(search.isEmpty ? "No holidays in the catalog yet." : "No holidays match your search.")
                    .font(ConfettiFont.detail)
                    .foregroundStyle(ConfettiColor.muted)
            }
            ForEach(holidays) { holiday in
                NavigationLink(value: HolidayRoute.pick(holiday.id)) {
                    HolidayPickerRow(holiday: holiday)
                }
                .buttonStyle(.plain)
                Divider()
            }
            Button("Add a holiday of your own", systemImage: "plus") { path.append(.create) }
                .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
        }
    }

    private enum HolidayRoute: Hashable {
        case pick(Int)
        case create
    }
}

private struct HolidayPickerRow: View {
    let holiday: Holiday
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var textSize

    var body: some View {
        HStack(spacing: 12) {
            if !textSize.isAccessibilitySize {
                Image(systemName: holiday.key == "christmas" ? "tree" : "calendar")
                    .frame(width: 36, height: 36)
                    .foregroundStyle(ConfettiColor.ink)
                    .background(theme.birthdayFill, in: RoundedRectangle(cornerRadius: 12))
                    .accessibilityHidden(true)
            }
            VStack(alignment: .leading, spacing: 4) {
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 6) { name; major }
                    VStack(alignment: .leading, spacing: 4) { name; major }
                }
                Text(holiday.nextDate.date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day().year()))
                    .font(ConfettiFont.caption)
                    .foregroundStyle(ConfettiColor.muted)
                if holiday.daysUntil >= 0 {
                    Text(holiday.daysUntil == 0 ? "Today" : "In \(holiday.daysUntil) days")
                        .font(ConfettiFont.caption)
                        .foregroundStyle(ConfettiColor.muted)
                }
            }
            .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
            Image(systemName: "plus").foregroundStyle(theme.accent).accessibilityHidden(true)
        }
        .frame(minHeight: 48)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }

    private var name: some View { Text(holiday.name).font(ConfettiFont.subheading) }

    @ViewBuilder private var major: some View {
        if holiday.isMajor {
            Text("★ Major")
                .font(ConfettiFont.caption)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(theme.birthdayFill, in: RoundedRectangle(cornerRadius: 6))
                .accessibilityLabel("Major holiday")
        }
    }
}

private struct EventDraftFields: View {
    let model: AppModel
    let kind: EventKind
    let holiday: Holiday?
    let onCreated: (EventPlan) -> Void
    @State private var name: String
    @State private var date: Date
    @State private var budget = ""
    @Binding var saving: Bool
    @State private var error: String?
    @State private var partialOccasion: Occasion?

    init(model: AppModel, kind: EventKind, holiday: Holiday? = nil, saving: Binding<Bool>,
         onCreated: @escaping (EventPlan) -> Void) {
        self.model = model
        self.kind = kind
        self.holiday = holiday
        self.onCreated = onCreated
        _saving = saving
        _name = State(initialValue: holiday?.name ?? "")
        _date = State(initialValue: holiday?.nextDate.date ?? .now)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let holiday { HolidayPickerRow(holiday: holiday).accessibilityHidden(true) }
            ConfettiCard {
                VStack(alignment: .leading, spacing: 14) {
                    TextField("Event name", text: $name)
                        .textContentType(.none)
                        .font(ConfettiFont.body)
                        .frame(minHeight: 44)
                    Divider()
                    EventDateField(title: "Event date", date: $date)
                    Divider()
                    TextField("Budget (optional)", text: $budget)
                        .keyboardType(.decimalPad)
                        .font(ConfettiFont.body)
                        .frame(minHeight: 44)
                }
            }
            if let error { ErrorNotice(message: error) }
            if saving { ProgressView("Saving your event…") }
            Button("Create event") { Task { await save() } }
                .buttonStyle(ConfettiButtonStyle(.primary, expands: true))
                .disabled(saving || cleanName.isEmpty || cleanName.count > 255)
        }
        .disabled(saving)
        .navigationBarBackButtonHidden(saving)
    }

    private var cleanName: String { name.trimmingCharacters(in: .whitespacesAndNewlines) }

    private func save() async {
        guard !saving, let calendarDate = CalendarDate(localDate: date) else { return }
        saving = true
        error = nil
        defer { saving = false }
        do {
            let budgetTotal = try parseEventBudget(budget)
            let type: OccasionType = switch kind {
            case .holiday: .holiday
            case .birthday: .recurring
            case .custom: .other
            }
            let input = EventOccasionCreate(name: cleanName, type: type, date: calendarDate,
                                            holidayId: holiday?.id, birthday: kind == .birthday)
            let occasion = try await resolveOccasion(for: input)
            partialOccasion = occasion
            let event = try await resolvePlan(client: model.client, occasionId: occasion.id,
                                              date: calendarDate, budget: budgetTotal)
            await model.reload()
            if holiday?.themeKey != nil {
                do { model.christmas = try await model.client.activeTheme().themeKey == "christmas" }
                catch { model.handle(error) }
            }
            if model.signedIn { onCreated(event) }
        } catch {
            self.error = eventError(error, model: model)
        }
    }

    private func resolveOccasion(for input: EventOccasionCreate) async throws -> Occasion {
        func matches(_ occasion: Occasion) -> Bool {
            occasion.isActive && occasion.type == input.type && occasion.date == input.date &&
                occasion.holidayId == input.holidayId && occasion.subtype == input.subtype &&
                (occasion.holidayId != nil || occasion.name == input.name)
        }
        if let partialOccasion, matches(partialOccasion) { return partialOccasion }
        if let local = model.occasions.first(where: matches) { return local }
        var cursor: Int?
        repeat {
            let page = try await model.client.occasions(cursor: cursor, limit: 100)
            if let existing = page.items.first(where: matches) { return existing }
            cursor = page.nextCursor
        } while cursor != nil
        return try await model.client.createEventOccasion(input)
    }
}

private struct CreateHolidayView: View {
    let model: AppModel
    @Binding var saving: Bool
    let onCreated: (Holiday) -> Void
    @Environment(\.confettiTheme) private var theme
    @State private var name = ""
    @State private var date = Date.now
    @State private var major = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                ConfettiCard {
                    VStack(alignment: .leading, spacing: 14) {
                        TextField("Holiday name", text: $name)
                            .font(ConfettiFont.body)
                            .frame(minHeight: 44)
                        Divider()
                        EventDateField(title: "Holiday date", date: $date)
                        Divider()
                        Toggle("Major holiday", isOn: $major).frame(minHeight: 44)
                    }
                }
                if let error { ErrorNotice(message: error) }
                if saving { ProgressView("Saving the holiday…") }
                Button("Save holiday") { Task { await save() } }
                    .buttonStyle(ConfettiButtonStyle(.primary, expands: true))
                    .disabled(saving || cleanName.isEmpty || cleanName.count > 255)
            }
            .padding(20)
            .frame(maxWidth: 640)
            .frame(maxWidth: .infinity)
        }
        .disabled(saving)
        .navigationBarBackButtonHidden(saving)
        .navigationTitle("New holiday")
        .foregroundStyle(ConfettiColor.ink)
        .background(theme.paper)
    }

    private var cleanName: String { name.trimmingCharacters(in: .whitespacesAndNewlines) }

    private func save() async {
        guard !saving else { return }
        let dateParts = Calendar(identifier: .gregorian).dateComponents([.month, .day], from: date)
        guard let month = dateParts.month, let day = dateParts.day else { return }
        let latin = cleanName.applyingTransform(.toLatin, reverse: false) ?? cleanName
        let normalized = latin.folding(options: .diacriticInsensitive, locale: Locale(identifier: "en_US_POSIX")).lowercased()
        let words = normalized.split { !$0.isASCII || !($0.isLetter || $0.isNumber) }
        let key = String(words.joined(separator: "-").prefix(100)).trimmingCharacters(in: CharacterSet(charactersIn: "-"))
        guard !key.isEmpty else {
            error = "Enter a holiday name that contains letters or numbers."
            return
        }
        saving = true
        error = nil
        defer { saving = false }
        do {
            let holiday = try await model.client.createHoliday(HolidayCreate(name: cleanName, key: key, month: month, day: day, isMajor: major))
            onCreated(holiday)
        } catch {
            self.error = eventError(error, model: model)
        }
    }
}

private struct EventDateField: View {
    let title: String
    @Binding var date: Date

    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack { Text(title); Spacer(); picker }
            VStack(alignment: .leading, spacing: 6) { Text(title); picker }
        }
        .font(ConfettiFont.body)
        .accessibilityElement(children: .contain)
    }

    private var picker: some View {
        DatePicker(title, selection: $date, displayedComponents: .date)
            .datePickerStyle(.compact)
            .labelsHidden()
            .frame(minWidth: 44, minHeight: 44)
            .accessibilityLabel(title)
    }
}

struct NativeEventPlanView: View {
    let model: AppModel
    let route: EventCalendarEntry.ID
    var onUpdate: (EventPlan) -> Void = { _ in }
    @Environment(\.confettiTheme) private var theme
    @State private var plan: EventPlan?
    @State private var occasion: Occasion?
    @State private var legacyBudget: BudgetMeter?
    @State private var error: String?
    @State private var busy = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                if let error {
                    ErrorNotice(message: error)
                    Button("Try again") { Task { await load() } }
                        .buttonStyle(ConfettiButtonStyle(.secondary))
                }
                if let plan {
                    planContent(plan)
                } else if let occasion, case .occasion(_, let date) = route {
                    legacyContent(occasion, date: date)
                } else if error == nil {
                    ProgressView("Loading the event plan…")
                }
            }
            .padding(20)
            .frame(maxWidth: 700)
            .frame(maxWidth: .infinity)
        }
        .foregroundStyle(ConfettiColor.ink)
        .background(theme.paper)
        .navigationTitle("Event plan")
        .navigationBarTitleDisplayMode(.inline)
        .task(id: route) { await load() }
        .refreshable { await load() }
    }

    @ViewBuilder private func planContent(_ event: EventPlan) -> some View {
        heading(event.name, date: event.date, closed: event.closed)
        ConfettiCard(fill: ConfettiColor.lavender) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Budget").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader)
                if let limit = event.budgetTotal {
                    Text("\(money(event.spent)) spent of \(money(limit))").font(ConfettiFont.body)
                } else {
                    Text("\(money(event.spent)) spent").font(ConfettiFont.body)
                    Text("No budget set").font(ConfettiFont.detail)
                }
                Text("\(money(event.planned)) planned").font(ConfettiFont.detail)
                if event.unknownPrices > 0 {
                    Text("Prices missing for \(event.unknownPrices) gifts").font(ConfettiFont.detail)
                }
            }
        }
        Text("Recipients & gifts").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader)
        if event.envelopes.isEmpty {
            ConfettiCard {
                ConfettiEmptyState(title: "No recipients yet", message: "Recipients and their gifts will appear here.", systemImage: "gift")
            }
        }
        ForEach(event.envelopes) { envelope in recipient(envelope) }
        Button(event.closed ? "Reopen event" : "Close event") { Task { await toggleClosed(event) } }
            .buttonStyle(ConfettiButtonStyle(.secondary))
            .disabled(busy)
    }

    @ViewBuilder private func legacyContent(_ event: Occasion, date: CalendarDate) -> some View {
        heading(event.name, date: date, closed: !event.isActive)
        if let description = event.description, !description.isEmpty {
            Text(description).font(ConfettiFont.body)
        }
        if let budget = legacyBudget, let limit = budget.budgetTotal {
            ConfettiCard(fill: ConfettiColor.lavender) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Budget").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader)
                    Text("\(money(budget.purchasedAmount)) spent of \(money(limit))").font(ConfettiFont.body)
                }
            }
        }
        let people = model.people.filter { event.personIds.contains($0.id) }
        if !people.isEmpty {
            Text("Recipients").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader)
            ForEach(people) { person in
                Text(person.displayName).font(ConfettiFont.body)
            }
        }
        if event.isActive {
            Button("Start a plan") { Task { await createPlan(for: event.id, date: date) } }
                .buttonStyle(ConfettiButtonStyle(.primary))
                .disabled(busy)
        }
    }

    private func heading(_ title: String, date: CalendarDate, closed: Bool) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(ConfettiFont.display).accessibilityAddTraits(.isHeader)
            Text(date.date.formatted(.dateTime.weekday(.wide).month(.wide).day().year()))
                .font(ConfettiFont.body).foregroundStyle(ConfettiColor.muted)
            if closed { ConfettiStatusPill(title: "Closed", tone: .idea) }
        }
    }

    private func recipient(_ envelope: EventEnvelope) -> some View {
        ConfettiCard {
            VStack(alignment: .leading, spacing: 8) {
                Text(envelope.personName).font(ConfettiFont.subheading).accessibilityAddTraits(.isHeader)
                if let allowance = envelope.moneyAllowance {
                    Text("Allowance \(money(allowance))").font(ConfettiFont.detail)
                }
                if let limit = envelope.countAllowance {
                    Text("Gift limit \(limit)").font(ConfettiFont.detail)
                }
                if envelope.gifts.isEmpty {
                    Text("No gifts planned").font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted)
                }
                ForEach(Array(envelope.gifts.enumerated()), id: \.offset) { _, gift in
                    Divider()
                    Text(gift.quantity > 1 ? "\(gift.name) × \(gift.quantity)" : gift.name).font(ConfettiFont.body)
                    ConfettiStatusPill(title: phaseTitle(gift.phase), tone: phaseTone(gift.phase))
                    if let price = gift.price { Text(money(price)).font(ConfettiFont.detail) }
                }
            }
        }
    }

    private func phaseTitle(_ phase: String) -> String {
        switch phase {
        case "bought": "Bought"
        case "in_hand": "In hand"
        case "given": "Given"
        case "considering": "Considering"
        default: phase.replacingOccurrences(of: "_", with: " ").capitalized
        }
    }

    private func phaseTone(_ phase: String) -> ConfettiStatusTone {
        switch phase {
        case "bought": .purchased
        case "in_hand", "given": .received
        default: .idea
        }
    }

    private func load() async {
        guard !busy else { return }
        busy = true
        error = nil
        defer { busy = false }
        do {
            switch route {
            case .plan(let id):
                let event = try await model.client.eventPlan(id: id)
                plan = event
                onUpdate(event)
            case .occasion(let id, let date):
                occasion = try await model.client.occasion(id: id)
                let plans = try await model.client.eventPlans()
                if let event = plans.first(where: { $0.occasionId == id && $0.date == date }) {
                    plan = event
                    onUpdate(event)
                } else {
                    legacyBudget = try await model.client.budget(occasionId: id)
                }
            }
        } catch { self.error = eventError(error, model: model) }
    }

    private func createPlan(for id: Int, date: CalendarDate) async {
        guard !busy else { return }
        busy = true
        error = nil
        defer { busy = false }
        do {
            let event = try await resolvePlan(client: model.client, occasionId: id, date: date,
                                              budget: legacyBudget?.budgetTotal)
            plan = event
            onUpdate(event)
        } catch { self.error = eventError(error, model: model) }
    }

    private func toggleClosed(_ event: EventPlan) async {
        guard !busy else { return }
        busy = true
        error = nil
        defer { busy = false }
        do {
            let updated = try await model.client.setEventPlanClosed(id: event.id, closed: !event.closed)
            plan = updated
            onUpdate(updated)
        } catch { self.error = eventError(error, model: model) }
    }
}

private func resolvePlan(client: APIClient, occasionId: Int, date: CalendarDate, budget: Decimal?) async throws -> EventPlan {
    do {
        return try await client.createEventPlan(occasionId: occasionId, date: date, budgetTotal: budget)
    } catch let conflict as APIError {
        guard case .server(statusCode: 409, detail: _) = conflict,
              let existing = try await client.eventPlans().first(where: { $0.occasionId == occasionId && $0.date == date })
        else { throw conflict }
        return existing
    }
}

@MainActor private func eventError(_ error: Error, model: AppModel) -> String? {
    if error is CancellationError { return nil }
    if let apiError = error as? APIError {
        if apiError == .sessionChanged { return nil }
        if apiError.isUnauthorized {
            model.handle(error)
            return nil
        }
    }
    return error.localizedDescription
}

private func parseEventBudget(_ text: String) throws -> Decimal? {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }
    let separator = Locale.current.decimalSeparator ?? "."
    let parts = trimmed.components(separatedBy: separator)
    guard parts.count <= 2, parts.last?.count ?? 0 <= (parts.count == 2 ? 2 : 8),
          parts.allSatisfy({ $0.allSatisfy(\.isNumber) }),
          let value = Decimal(string: trimmed, locale: .current),
          value >= 0, value < 100_000_000 else {
        throw EventBudgetError.invalidAmount
    }
    return value
}

private enum EventBudgetError: LocalizedError {
    case invalidAmount

    var errorDescription: String? { "Enter a budget below 100 million with up to two decimal places." }
}
