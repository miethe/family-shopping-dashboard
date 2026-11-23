import SwiftUI
import FamilyGiftingKit

struct NativeGiftsView: View {
    let model: AppModel
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var search = ""
    @State private var filter: GiftFilter = .all
    @State private var showAdd = false
    @State private var changingStatus = false
    @State private var selectedGift: Int?

    private var matches: [Gift] {
        let query = search.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return model.gifts }
        return model.gifts.filter { gift in
            gift.name.localizedStandardContains(query) ||
            gift.recipients(from: model.people).contains { $0.localizedStandardContains(query) }
        }
    }

    var body: some View {
        let matchingGifts = matches
        let visibleGifts = matchingGifts.filter(filter.includes)
        List {
            VStack(alignment: .leading, spacing: 12) {
                header
                searchField
                filterPills(matchingGifts)
                Button("Ideas inbox", systemImage: "tray") { model.showIdeas = true }
                    .buttonStyle(ConfettiButtonStyle(.tertiary))
            }
            .giftListRow()

            if let error = model.error { ErrorNotice(message: error).giftListRow() }
            if !model.loaded && model.busy {
                ProgressView("Loading gifts…").giftListRow()
            } else if visibleGifts.isEmpty && (model.loaded || !model.gifts.isEmpty) {
                ConfettiEmptyState(
                    title: model.gifts.isEmpty ? "Save your first gift" : "No matching gifts",
                    message: model.gifts.isEmpty ? "Save something they mentioned or a link you want to keep." : "Try another search or status filter.",
                    systemImage: "gift"
                ).giftListRow()
            }

            ForEach(visibleGifts) { gift in
                Button { selectedGift = gift.id } label: {
                    GiftCatalogRow(gift: gift, recipients: gift.recipients(from: model.people), imageURL: giftImageURL(gift.imageUrl, model: model))
                }
                .buttonStyle(.plain)
                .giftListRow()
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    if let next = gift.planningStatus.followingStage {
                        Button { Task { await advance(gift, to: next) } } label: {
                            Label(next.actionTitle, systemImage: next.stageSymbol)
                        }
                        .tint(theme.accent)
                        .disabled(changingStatus)
                    }
                }
            }
            if model.hasMore {
                Button("Load more gifts") { Task { await model.loadMore() } }
                    .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
                    .disabled(model.busy)
                    .giftListRow()
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(theme.paper)
        .scrollDismissesKeyboard(.interactively)
        .navigationDestination(item: $selectedGift) { id in
            if let gift = model.gifts.first(where: { $0.id == id }) { NativeGiftDetailView(model: model, gift: gift) }
        }
        .refreshable { await model.reload() }
        .sheet(isPresented: $showAdd) { GiftEditor(model: model, gift: nil) }
    }

    private var header: some View {
        let title = VStack(alignment: .leading, spacing: 4) {
            Text("Good things, saved.")
                .font(ConfettiFont.display)
                .foregroundStyle(ConfettiColor.ink)
                .accessibilityAddTraits(.isHeader)
            Text("Every idea. Every hiding place.")
                .font(ConfettiFont.detail)
                .foregroundStyle(ConfettiColor.muted)
        }
        let add = Button("Add", systemImage: "plus") { showAdd = true }
            .buttonStyle(ConfettiButtonStyle())
            .accessibilityLabel("Add gift")
        return ViewThatFits(in: .horizontal) {
            if !dynamicTypeSize.isAccessibilitySize {
                HStack(spacing: 12) {
                    title
                    Spacer(minLength: 0)
                    add
                }
            }
            VStack(alignment: .leading, spacing: 8) {
                title
                add
            }
        }
        .padding(.top, 8)
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(ConfettiColor.muted)
                .accessibilityHidden(true)
            TextField("Search gifts or people", text: $search)
                .font(ConfettiFont.body)
                .foregroundStyle(ConfettiColor.ink)
                .submitLabel(.search)
                .frame(minHeight: 44)
                .accessibilityLabel("Search gifts or people")
            if !search.isEmpty {
                Button { search = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .frame(minWidth: 44, minHeight: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .foregroundStyle(ConfettiColor.muted)
                .accessibilityLabel("Clear search")
            }
        }
        .padding(.horizontal, 14)
        .background(ConfettiColor.white, in: RoundedRectangle(cornerRadius: ConfettiRadius.medium))
        .overlay {
            RoundedRectangle(cornerRadius: ConfettiRadius.medium).strokeBorder(ConfettiColor.line)
                .allowsHitTesting(false)
        }
    }

    private func filterPills(_ gifts: [Gift]) -> some View {
        let pills = ForEach(GiftFilter.allCases) { option in
            filterPill(option, count: gifts.count(where: option.includes))
        }
        return SwiftUI.Group {
            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 6) { pills }
            } else {
                ScrollView(.horizontal) {
                    HStack(spacing: 6) { pills }
                }.scrollIndicators(.hidden)
            }
        }.accessibilityElement(children: .contain)
            .accessibilityLabel("Filter gifts by status")
    }

    private func filterPill(_ option: GiftFilter, count: Int) -> some View {
        Button { filter = option } label: {
            Text("\(option.title) · \(count)")
                .font(ConfettiFont.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .frame(minWidth: 44, minHeight: 44)
                .foregroundStyle(option == filter ? ConfettiColor.white : ConfettiColor.ink)
                .background(option == filter ? ConfettiColor.ink : ConfettiColor.subtle, in: Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(option.title)
        .accessibilityValue("\(count) gifts")
        .accessibilityAddTraits(option == filter ? .isSelected : [])
    }

    private func advance(_ gift: Gift, to status: GiftStatus) async {
        guard !changingStatus else { return }
        changingStatus = true
        defer { changingStatus = false }
        _ = await model.changeGiftStatus(gift, to: status)
    }
}

struct NativeGiftDetailView: View {
    let model: AppModel
    @State private var gift: Gift
    @State private var editor: GiftEditMode?
    @State private var changingStatus = false
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    init(model: AppModel, gift: Gift) {
        self.model = model
        _gift = State(initialValue: gift)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GiftArtwork(url: giftImageURL(gift.imageUrl, model: model), status: gift.planningStatus, hero: true)
                giftTitle
                priceAndStatus
                progressRail
                if let error = model.error { ErrorNotice(message: error) }
                locationCard
                purchaseDetails
                if let next = gift.planningStatus.followingStage {
                    Button {
                        Task { await advance(to: next) }
                    } label: {
                        Label(changingStatus ? "Updating…" : next.actionTitle, systemImage: next.stageSymbol)
                    }
                    .buttonStyle(ConfettiButtonStyle(.primary, expands: true))
                    .disabled(changingStatus)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .frame(maxWidth: 680)
            .frame(maxWidth: .infinity)
        }
        .background(theme.paper)
        .navigationTitle("Gift details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { editor = .details } label: {
                    Text("Edit").frame(minWidth: 44, minHeight: 44)
                }.accessibilityLabel("Edit gift")
            }
        }
        .sheet(item: $editor) { mode in
            GiftEditor(model: model, gift: gift, notesOnly: mode == .notes) { gift = $0 }
        }
    }

    private var giftTitle: some View {
        let recipients = gift.recipients(from: model.people)
        let lists = gift.listItems.map(\.listName).uniqued()
        let subtitle = ([recipients.isEmpty ? nil : "For \(recipients.joined(separator: ", "))"] + lists.map(Optional.some))
            .compactMap { $0 }
            .joined(separator: " · ")
        return VStack(alignment: .leading, spacing: 5) {
            Text(gift.name)
                .font(ConfettiFont.display)
                .foregroundStyle(ConfettiColor.ink)
                .accessibilityAddTraits(.isHeader)
            if !subtitle.isEmpty {
                Text(subtitle).font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted)
            }
        }
    }

    private var priceAndStatus: some View {
        let price = SwiftUI.Group {
            if let amount = gift.salePrice ?? gift.price {
                Text(money(amount)).font(ConfettiFont.display).foregroundStyle(ConfettiColor.ink)
            }
        }
        let status = ConfettiStatusPill(title: gift.planningStatus.title, tone: gift.planningStatus.tone)
        return ViewThatFits(in: .horizontal) {
            HStack {
                price
                Spacer(minLength: 12)
                status
            }
            VStack(alignment: .leading, spacing: 8) {
                price
                status
            }
        }
    }

    private var progressRail: some View {
        let current = gift.planningStatus
        let stages = ForEach(Array(GiftStatus.allCases.enumerated()), id: \.element) { index, stage in
            let isReached = index <= current.stageIndex
            let badge = ZStack {
                Circle().fill(isReached ? theme.accent : ConfettiColor.subtle)
                if isReached {
                    Image(systemName: "checkmark").font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(ConfettiColor.white)
                } else {
                    Text("\(index + 1)").font(.system(size: 12, weight: .semibold)).foregroundStyle(ConfettiColor.ink)
                }
            }
            .frame(width: 28, height: 28)
            let label = Text(stage.title)
                .font(stage == current ? ConfettiFont.label : ConfettiFont.caption)
                .foregroundStyle(stage == current ? theme.accent : ConfettiColor.ink)
            if dynamicTypeSize.isAccessibilitySize {
                HStack(spacing: 12) { badge; label }
            } else {
                VStack(spacing: 6) { badge; label }
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
            }
        }
        return SwiftUI.Group {
            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 8) { stages }
            } else {
                HStack(alignment: .top, spacing: 6) { stages }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Gift status progress")
        .accessibilityValue("\(current.title), step \(current.stageIndex + 1) of \(GiftStatus.allCases.count)")
    }

    private var locationCard: some View {
        ConfettiCard(fill: ConfettiColor.selected) {
            VStack(alignment: .leading, spacing: 4) {
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 8) {
                        locationTitle
                        Spacer(minLength: 0)
                        editNotesButton
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        locationTitle
                        editNotesButton
                    }
                }
                Text(gift.notes?.trimmed.nonempty ?? "Add a delivery update or hiding place.")
                    .font(ConfettiFont.detail)
                    .foregroundStyle(ConfettiColor.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private var locationTitle: some View {
        Label("Where is it?", systemImage: "location.circle")
            .font(ConfettiFont.heading)
            .accessibilityAddTraits(.isHeader)
    }

    private var editNotesButton: some View {
        Button { editor = .notes } label: {
            Text("Edit").font(ConfettiFont.label).padding(.horizontal, 6)
                .frame(minWidth: 44, minHeight: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Edit location notes")
    }

    private var purchaseDetails: some View {
        let buyers = gift.giftPeople.filter { $0.role == "purchaser" }.map(\.personId)
        let names = model.people.filter { buyers.contains($0.id) }.map(\.displayName)
        let purchase = gift.purchaseDate.map { $0.date.formatted(date: .abbreviated, time: .omitted) }
        return VStack(alignment: .leading, spacing: 4) {
            if gift.planningStatus.stageIndex >= GiftStatus.purchased.stageIndex {
                if !names.isEmpty {
                    Text("Purchased by \(names.joined(separator: ", "))").font(ConfettiFont.detail)
                }
                if let purchase { Text("Purchased on \(purchase)").font(ConfettiFont.detail) }
            }
            if let link = gift.url.flatMap(storeURL) {
                Link(destination: link) {
                    Label("Store link", systemImage: "arrow.up.right")
                        .font(ConfettiFont.label)
                        .frame(minHeight: 44)
                }
                .foregroundStyle(theme.accent)
            }
        }.foregroundStyle(ConfettiColor.muted)
    }

    private func advance(to status: GiftStatus) async {
        guard !changingStatus else { return }
        changingStatus = true
        defer { changingStatus = false }
        if let updatedGift = await model.changeGiftStatus(gift, to: status) { gift = updatedGift }
    }
}

struct NativeIdeasView: View {
    let model: AppModel
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.confettiTheme) private var theme
    @State private var working = false
    @State private var showAdd = false
    @State private var discard: PendingIdea?

    private var savedIdeas: [Gift] {
        model.gifts.filter { $0.status == .idea && $0.listItems.isEmpty }
    }

    var body: some View {
        List {
            VStack(alignment: .leading, spacing: 10) {
                ConfettiSectionHeader("Ideas inbox", subtitle: "Save something now and decide later who it’s for.")
                Button("Add idea", systemImage: "plus") { showAdd = true }
                    .buttonStyle(ConfettiButtonStyle())
            }
            .giftListRow()
            if let error = model.error { ErrorNotice(message: error).giftListRow() }
            if !model.pendingIdeas.isEmpty {
                Text("Pending ideas").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader).giftListRow()
                ForEach(model.pendingIdeas) { item in
                    ideaCard(name: item.name, imageURL: nil, summary: item.rejection != nil ? "Server rejected this idea" : (item.attempted ? "Previous save could not be confirmed" : "Waiting to sync")) {
                        if item.attempted {
                            Button("Try again") { Task { await model.flushIdeas(retrying: item.id); if model.error == nil { await model.reload() } } }
                                .buttonStyle(ConfettiButtonStyle(.secondary))
                        }
                        Button("Discard", role: .destructive) { discard = item }
                            .buttonStyle(ConfettiButtonStyle(.tertiary))
                    }
                    .giftListRow()
                }
            }
            if let inbox = model.inbox, !inbox.ideas.isEmpty {
                Text("On shared lists").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader).giftListRow()
                ForEach(inbox.ideas) { idea in
                    ideaCard(name: idea.name, imageURL: idea.imageUrl, summary: idea.price.map(money)) {
                        planButton(for: idea.name) { await convert(idea) }
                    }
                    .giftListRow()
                }
            }
            if !savedIdeas.isEmpty {
                Text("Saved ideas").font(ConfettiFont.heading).accessibilityAddTraits(.isHeader).giftListRow()
                ForEach(savedIdeas) { gift in
                    ideaCard(name: gift.name, imageURL: gift.imageUrl, summary: gift.price.map(money)) {
                        planButton(for: gift.name) { await plan(gift) }
                    }
                    .giftListRow()
                }
            }
            if model.loaded && model.pendingIdeas.isEmpty && (model.inbox?.ideas.isEmpty ?? true) && savedIdeas.isEmpty {
                ConfettiEmptyState(title: "A place for little ideas", message: "Save a link or write down something they’d love.", systemImage: "lightbulb")
                    .giftListRow()
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(theme.paper)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button { model.showIdeas = false } label: {
                    Text("Done").frame(minWidth: 44, minHeight: 44)
                }.accessibilityLabel("Close ideas inbox")
            }
        }
        .refreshable { await model.reload() }
        .sheet(isPresented: $showAdd) { AddIdeaView(model: model) }
        .alert("Discard saved idea?", isPresented: Binding(
            get: { discard != nil },
            set: { if !$0 { discard = nil } }
        ), presenting: discard) { item in
            Button("Discard", role: .destructive) { Task { await model.discardIdea(item.id) } }
            Button("Cancel", role: .cancel) {}
        } message: { _ in
            Text("This removes the pending copy from this device.")
        }
    }

    private func ideaCard(name: String, imageURL: String?, summary: String?) -> some View {
        ideaCard(name: name, imageURL: imageURL, summary: summary) { EmptyView() }
    }

    private func ideaCard<Action: View>(name: String, imageURL: String?, summary: String?, @ViewBuilder action: () -> Action) -> some View {
        ConfettiCard {
            VStack(alignment: .leading, spacing: 8) {
                if typeSize.isAccessibilitySize {
                    GiftArtwork(url: giftImageURL(imageURL, model: model), status: .idea)
                    ideaText(name, summary: summary)
                } else {
                    HStack(alignment: .top, spacing: 12) {
                        GiftArtwork(url: giftImageURL(imageURL, model: model), status: .idea)
                        ideaText(name, summary: summary)
                    }
                }
                action()
            }
        }
    }

    private func ideaText(_ name: String, summary: String?) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(name).font(ConfettiFont.subheading).fixedSize(horizontal: false, vertical: true)
            if let summary { Text(summary).font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted) }
        }.frame(maxWidth: .infinity, alignment: .leading).accessibilityElement(children: .combine)
    }

    private func planButton(for name: String, action: @escaping () async -> Void) -> some View {
        Button { Task { await action() } } label: {
            Text("Plan to buy").fixedSize(horizontal: false, vertical: true)
        }
        .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
        .accessibilityLabel("Plan to buy \(name)")
        .disabled(working)
    }

    private func convert(_ idea: Idea) async {
        guard !working else { return }
        working = true
        model.error = nil
        defer { working = false }
        do {
            _ = try await model.client.selectIdea(id: idea.id)
            model.inbox = model.inbox?.removingIdea(id: idea.id)
            await model.reload()
        } catch { model.handle(error) }
    }

    private func plan(_ gift: Gift) async {
        guard !working else { return }
        working = true
        defer { working = false }
        _ = await model.changeGiftStatus(gift, to: .selected)
    }
}

private struct GiftCatalogRow: View {
    let gift: Gift
    let recipients: [String]
    let imageURL: URL?

    var body: some View {
        let status = gift.planningStatus
        let summary = ([recipients.isEmpty ? nil : recipients.joined(separator: ", "), (gift.salePrice ?? gift.price).map(money)])
            .compactMap { $0 }
            .joined(separator: " · ")
        ConfettiCard(padding: 12) {
            HStack(alignment: .top, spacing: 12) {
                GiftArtwork(url: imageURL, status: status)
                VStack(alignment: .leading, spacing: 5) {
                    Text(gift.name).font(ConfettiFont.subheading)
                    ViewThatFits(in: .horizontal) {
                        HStack(spacing: 8) {
                            if !summary.isEmpty { metadata(summary).fixedSize(horizontal: true, vertical: false) }
                            Spacer(minLength: 0)
                            statusPill(status).fixedSize()
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            if !summary.isEmpty { metadata(summary) }
                            statusPill(status)
                        }
                    }
                    if let notes = gift.notes?.trimmed.nonempty {
                        Divider()
                        Label(notes, systemImage: "location.circle")
                            .font(ConfettiFont.caption)
                            .foregroundStyle(ConfettiColor.muted)
                            .lineLimit(1)
                            .accessibilityLabel("Location notes, \(notes)")
                    }
                }.frame(maxWidth: .infinity, alignment: .leading)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(ConfettiColor.muted)
                    .accessibilityHidden(true)
            }
            .frame(minHeight: 44)
            .contentShape(Rectangle())
        }.accessibilityElement(children: .combine)
    }

    private func metadata(_ summary: String) -> some View {
        Text(summary).font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted)
    }

    private func statusPill(_ status: GiftStatus) -> some View {
        ConfettiStatusPill(title: status.title, tone: status.tone)
    }
}

private struct GiftArtwork: View {
    let url: URL?
    let status: GiftStatus
    var hero = false
    @Environment(\.confettiTheme) private var theme

    private var isWrapped: Bool { status == .purchased || status == .received }
    private var fallback: some View {
        ZStack {
            hero || isWrapped ? theme.accentSoft : ConfettiColor.selected
            if isWrapped && !hero {
                Rectangle().fill(theme.accent).frame(width: 14)
            }
            Image(systemName: isWrapped ? "gift.fill" : "gift")
                .font(.system(size: hero ? 66 : 24, weight: .medium))
                .foregroundStyle(isWrapped && !hero ? ConfettiColor.white : theme.accent)
        }
    }

    var body: some View {
        let image = SwiftUI.Group {
            if let url {
                AsyncImage(url: url) { phase in
                    if let image = phase.image { image.resizable().scaledToFill() }
                    else { fallback }
                }
            } else {
                fallback
            }
        }
        SwiftUI.Group {
            if hero {
                Color.clear.frame(height: 160)
                    .frame(maxWidth: .infinity)
                    .overlay { image }
            } else {
                Color.clear.frame(width: 62, height: 66)
                    .overlay { image }
            }
        }
        .clipped()
        .clipShape(RoundedRectangle(cornerRadius: hero ? ConfettiRadius.xLarge : ConfettiRadius.medium))
        .accessibilityHidden(true)
    }
}

private struct GiftEditor: View {
    let model: AppModel
    let gift: Gift?
    let notesOnly: Bool
    let onSaved: (Gift) -> Void

    @Environment(\.dismiss) private var dismiss
    @Environment(\.confettiTheme) private var theme
    @State private var name: String
    @State private var url: String
    @State private var notes: String
    @State private var priceText: String
    @State private var recipients: Set<Int> = []
    @State private var saving = false
    @State private var saveError: String?

    init(model: AppModel, gift: Gift?, notesOnly: Bool = false, onSaved: @escaping (Gift) -> Void = { _ in }) {
        self.model = model
        self.gift = gift
        self.notesOnly = notesOnly
        self.onSaved = onSaved
        _name = State(initialValue: gift?.name ?? "")
        _url = State(initialValue: gift?.url ?? "")
        _notes = State(initialValue: gift?.notes ?? "")
        _priceText = State(initialValue: gift?.price?.formatted(.number.grouping(.never)) ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                if !notesOnly {
                    Section("Details") {
                        TextField("Gift name", text: $name)
                            .frame(minHeight: 44)
                        TextField("Store link (optional)", text: $url)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.URL)
                            .frame(minHeight: 44)
                        TextField("Price (optional)", text: $priceText)
                            .keyboardType(.decimalPad)
                            .frame(minHeight: 44)
                        if !validLink { Text("Enter an http:// or https:// store link.").font(ConfettiFont.caption) }
                        if let priceMessage { Text(priceMessage).font(ConfettiFont.caption) }
                    }
                    if gift == nil && !model.people.isEmpty {
                        Section("Recipients") {
                            ForEach(model.people) { person in
                                Toggle(person.displayName, isOn: Binding(
                                    get: { recipients.contains(person.id) },
                                    set: { included in
                                        if included { recipients.insert(person.id) }
                                        else { recipients.remove(person.id) }
                                    }
                                )).frame(minHeight: 44)
                            }
                        }
                    }
                }
                Section("Where is it?") {
                    TextField("Delivery or hiding-place notes", text: $notes, axis: .vertical)
                        .lineLimit(3...8)
                        .frame(minHeight: 44, alignment: .topLeading)
                }
                if let saveError { ErrorNotice(message: saveError) }
                Section {
                    Button(saving ? "Saving…" : "Save") { Task { await save() } }
                        .buttonStyle(ConfettiButtonStyle(.primary, expands: true))
                        .disabled(saving || !validDetails)
                        .listRowBackground(Color.clear)
                }
            }
            .scrollContentBackground(.hidden)
            .background(theme.paper)
            .navigationTitle(notesOnly ? "Location notes" : gift == nil ? "Add gift" : "Edit gift")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button { dismiss() } label: { Text("Cancel").frame(minWidth: 44, minHeight: 44) }
                        .disabled(saving)
                }
            }
            .interactiveDismissDisabled(saving)
        }
    }

    private var validLink: Bool { url == gift?.url || url.trimmed.isEmpty || storeURL(url.trimmed) != nil }

    private var price: Decimal? {
        let point = Locale.current.decimalSeparator ?? "."
        let value = priceText.trimmed.replacingOccurrences(of: point, with: ".")
        guard value.wholeMatch(of: /(?:[0-9]+(?:\.[0-9]{0,2})?|\.[0-9]{1,2})/) != nil else { return nil }
        return Decimal(string: value, locale: Locale(identifier: "en_US_POSIX"))
    }

    private var priceMessage: String? {
        if priceText.trimmed.isEmpty && gift?.price != nil { return "Enter a replacement price to change the existing amount." }
        if !priceText.trimmed.isEmpty && price == nil { return "Enter a nonnegative amount with up to two decimal places." }
        return nil
    }

    private var validDetails: Bool {
        notesOnly || ((1...255).contains(name.trimmed.count) && validLink && priceMessage == nil)
    }

    private func save() async {
        guard !saving && validDetails else { return }
        saving = true
        saveError = nil
        defer { saving = false }
        do {
            let savedGift: Gift
            if let gift {
                let updatedNotes = notes.trimmed == (gift.notes ?? "") ? nil : notes.trimmed
                let input = GiftUpdate(
                    name: notesOnly || name == gift.name ? nil : name.trimmed,
                    url: notesOnly || url == (gift.url ?? "") ? nil : url.trimmed,
                    notes: updatedNotes,
                    price: notesOnly || price == gift.price ? nil : price
                )
                savedGift = try await model.client.updateGift(id: gift.id, input)
                model.recordGift(savedGift)
            } else {
                savedGift = try await model.client.createGift(GiftCreate(
                    name: name.trimmed, url: url.trimmed.nonempty, notes: notes.trimmed.nonempty,
                    price: price, personIds: recipients.sorted()
                ))
                model.recordGift(savedGift, created: true)
            }
            onSaved(savedGift)
            dismiss()
            await model.reload()
        } catch {
            if (error as? APIError)?.isUnauthorized == true { model.handle(error) }
            else { saveError = error.localizedDescription }
        }
    }
}

private enum GiftEditMode: String, Identifiable {
    case details, notes
    var id: Self { self }
}

private enum GiftFilter: String, CaseIterable, Identifiable {
    case all, ideas, toBuy, purchased, received
    var id: Self { self }

    var title: String {
        switch self {
        case .all: "All"
        case .ideas: "Ideas"
        case .toBuy: "To buy"
        case .purchased: "Purchased"
        case .received: "Received"
        }
    }

    func includes(_ gift: Gift) -> Bool {
        switch self {
        case .all: true
        case .ideas: gift.planningStatus == .idea
        case .toBuy: gift.planningStatus == .selected
        case .purchased: gift.planningStatus == .purchased
        case .received: gift.planningStatus == .received
        }
    }
}

private extension GiftStatus {
    var stageIndex: Int { GiftStatus.allCases.firstIndex(of: self) ?? 0 }

    var followingStage: GiftStatus? {
        switch self {
        case .idea: .selected
        case .selected: .purchased
        case .purchased: .received
        case .received: nil
        }
    }

    var title: String { rawValue.capitalized }

    var actionTitle: String {
        switch self {
        case .idea: "Save as idea"
        case .selected: "Plan to buy"
        case .purchased: "Mark as purchased"
        case .received: "Mark as received"
        }
    }

    var stageSymbol: String {
        switch self {
        case .idea: "lightbulb"
        case .selected: "checkmark"
        case .purchased: "cart"
        case .received: "checkmark"
        }
    }

    var tone: ConfettiStatusTone {
        switch self {
        case .idea: .idea
        case .selected: .selected
        case .purchased: .purchased
        case .received: .received
        }
    }
}

private extension View {
    func giftListRow() -> some View {
        listRowInsets(EdgeInsets(top: 5, leading: 20, bottom: 5, trailing: 20))
            .listRowSeparator(.hidden)
            .listRowBackground(Color.clear)
    }
}

private extension AppModel {
    func recordGift(_ gift: Gift, created: Bool = false) {
        if let index = gifts.firstIndex(where: { $0.id == gift.id }) { gifts[index] = gift }
        else if created { gifts.insert(gift, at: 0) }
    }

    func changeGiftStatus(_ gift: Gift, to status: GiftStatus) async -> Gift? {
        error = nil
        do {
            let updated = try await client.updateGift(id: gift.id, GiftUpdate(status: status))
            recordGift(updated)
            await reload()
            return updated
        } catch {
            handle(error)
            return nil
        }
    }
}

private extension Gift {
    func recipients(from people: [Person]) -> [String] {
        let ids = giftPeople.isEmpty ? personIds : giftPeople.filter { $0.role == "recipient" }.map(\.personId)
        return people.filter { ids.contains($0.id) }.map(\.displayName)
    }
}

private extension Array where Element == String {
    func uniqued() -> [String] {
        var seen = Set<String>()
        return filter { seen.insert($0).inserted }
    }
}

private extension String {
    var trimmed: String { trimmingCharacters(in: .whitespacesAndNewlines) }
    var nonempty: String? { isEmpty ? nil : self }
}

private func storeURL(_ value: String) -> URL? {
    guard let url = URL(string: value),
          let scheme = url.scheme?.lowercased(), ["http", "https"].contains(scheme),
          let host = url.host(), !host.isEmpty, url.user() == nil, url.password() == nil else { return nil }
    return url
}

@MainActor
private func giftImageURL(_ value: String?, model: AppModel) -> URL? {
    guard !model.fixture, let value,
          let origin = URL(string: model.address),
          let resolved = URL(string: value, relativeTo: origin)?.absoluteURL,
          let url = storeURL(resolved.absoluteString) else { return nil }
    if url.scheme?.lowercased() == "https" { return url }
    let sameOrigin = url.host()?.lowercased() == origin.host()?.lowercased() && url.port == origin.port
    return sameOrigin && origin.scheme?.lowercased() == "http" ? url : nil
}
