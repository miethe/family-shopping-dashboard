#if targetEnvironment(simulator)
import CoreText
#endif
import FamilyGiftingKit
import ImageIO
import PhotosUI
import SwiftUI
import UniformTypeIdentifiers

struct NativePeopleView: View {
    let model: AppModel
    @Environment(\.confettiTheme) private var theme
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var search = ""
    @State private var groupID: Int?
    @State private var groups: [FamilyGiftingKit.Group] = []
    @State private var groupsError: String?
    @State private var addingPerson = false
    @State private var pendingProfile: Person?
    @State private var route: PersonRoute?

    private var matches: [Person] {
        let query = search.trimmed
        return model.people.filter { person in
            let matchesGroup = groupID.map { id in person.groups.contains { $0.id == id } } ?? true
            return matchesGroup && (query.isEmpty || person.displayName.localizedStandardContains(query)
                || person.relationship?.localizedStandardContains(query) == true)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 12) {
                        heading
                        Spacer(minLength: 0)
                        addButton
                    }
                    VStack(alignment: .leading, spacing: 10) { heading; addButton }
                }
                if let error = model.error { ErrorNotice(message: error) }
                if let groupsError { ErrorNotice(message: groupsError) }
                if model.loaded && model.people.isEmpty && !model.hasMore {
                    ConfettiEmptyState(title: "Start with someone you love",
                                       message: "One name is all it takes. Add the details as you go.", systemImage: "person.2")
                } else {
                    searchField
                    groupFilters
                    results
                }
            }
            .padding(20)
            .frame(maxWidth: 860)
            .frame(maxWidth: .infinity)
        }
        .background(theme.paper)
        .foregroundStyle(ConfettiColor.ink)
        .scrollDismissesKeyboard(.interactively)
        .task { await refreshGroups() }
        .refreshable {
            await model.reload()
            await refreshGroups()
        }
        .fullScreenCover(isPresented: $addingPerson, onDismiss: {
            if let pendingProfile {
                route = PersonRoute(person: pendingProfile)
                self.pendingProfile = nil
            }
            Task { await refreshGroups() }
        }) {
            PersonCreatorView(model: model) { pendingProfile = $0 }
        }
        .navigationDestination(item: $route) { destination in
            PersonProfileView(model: model, person: destination.person)
        }
    }

    private var heading: some View {
        Text("Your people").font(ConfettiFont.display).accessibilityAddTraits(.isHeader)
    }

    private var addButton: some View {
        Button("Add", systemImage: "plus") { addingPerson = true }
            .buttonStyle(ConfettiButtonStyle())
            .accessibilityLabel("Add a person")
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass").foregroundStyle(ConfettiColor.muted).accessibilityHidden(true)
            TextField("Find someone", text: $search)
                .font(ConfettiFont.body)
                .submitLabel(.search)
            if !search.isEmpty {
                Button("Clear search", systemImage: "xmark.circle.fill") { search = "" }
                    .labelStyle(.iconOnly)
                    .foregroundStyle(ConfettiColor.muted)
                    .frame(minWidth: 44, minHeight: 44)
            }
        }
        .padding(.leading, 14)
        .padding(.trailing, search.isEmpty ? 14 : 0)
        .frame(minHeight: 48)
        .background(.white, in: RoundedRectangle(cornerRadius: 15))
        .overlay { RoundedRectangle(cornerRadius: 15).strokeBorder(ConfettiColor.line) }
    }

    private var groupFilters: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                filterButton("Everyone", id: nil, count: model.hasMore ? nil : model.people.count)
                ForEach(groups) { group in
                    filterButton(group.name, id: group.id, count: group.memberCount)
                }
            }
        }
        .scrollIndicators(.hidden)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Filter by group")
    }

    private func filterButton(_ title: String, id: Int?, count: Int?) -> some View {
        let selected = groupID == id
        return Button {
            groupID = id
        } label: {
            Text(count.map { "\(title) · \($0)" } ?? title)
                .font(ConfettiFont.caption)
                .padding(.horizontal, 12)
                .frame(minHeight: 44)
                .foregroundStyle(selected ? ConfettiColor.white : ConfettiColor.ink)
                .background(selected ? ConfettiColor.ink : ConfettiColor.subtle, in: RoundedRectangle(cornerRadius: 13))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    @ViewBuilder private var results: some View {
        if matches.isEmpty && (model.loaded || !model.people.isEmpty) {
            ConfettiEmptyState(title: "No matching people", message: model.hasMore
                               ? "Load more people to keep looking."
                               : "Try another name or group.", systemImage: "person.crop.circle.badge.questionmark")
        } else if matches.isEmpty && model.busy {
            ProgressView("Loading people…").frame(maxWidth: .infinity, minHeight: 100)
        } else {
            let columns = typeSize.isAccessibilitySize ? 1 : 2
            Grid(horizontalSpacing: 10, verticalSpacing: 10) {
                ForEach(Array(stride(from: 0, to: matches.count, by: columns)), id: \.self) { start in
                    GridRow {
                        ForEach(matches.dropFirst(start).prefix(columns)) { person in
                            Button { route = PersonRoute(person: person) } label: {
                                PersonCard(model: model, person: person)
                            }
                            .buttonStyle(.plain)
                            .accessibilityElement(children: .combine)
                        }
                    }
                }
            }
        }
        if model.hasMore {
            Button("Load more people") { Task { await model.loadMore() } }
                .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
                .disabled(model.busy)
        }
    }

    private func refreshGroups() async {
        do {
            groups = try await allPersonGroups(client: model.client)
            if let groupID, !groups.contains(where: { $0.id == groupID }) { self.groupID = nil }
            groupsError = nil
        } catch {
            groupsError = personError(error, model: model)
        }
    }
}

private struct PersonRoute: Hashable {
    let person: Person

    static func == (lhs: Self, rhs: Self) -> Bool { lhs.person.id == rhs.person.id }
    func hash(into hasher: inout Hasher) { hasher.combine(person.id) }
}

private struct PersonCard: View {
    let model: AppModel
    let person: Person
    @Environment(\.confettiTheme) private var theme

    var body: some View {
        ConfettiCard(padding: 12) {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .top, spacing: 9) {
                    PersonAvatar(model: model, person: person, size: 40)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(person.displayName).font(ConfettiFont.subheading)
                        if let relationship = person.relationship {
                            Text(relationship).font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted)
                        }
                        if let birthday = person.birthdate {
                            Text(birthday.date.formatted(.dateTime.month(.abbreviated).day()))
                                .font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Divider()
                Label("View", systemImage: "arrow.right")
                    .labelStyle(.trailingIcon)
                    .font(ConfettiFont.label)
                    .foregroundStyle(theme.accent)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .accessibilityHidden(true)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .contentShape(Rectangle())
        }
    }
}

private struct TrailingIconLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 5) { configuration.title; configuration.icon }
    }
}

private extension LabelStyle where Self == TrailingIconLabelStyle {
    static var trailingIcon: Self { Self() }
}

private extension StickerImage.Tint {
    var fill: Color {
        let rgb = UInt32(rawValue.dropFirst(), radix: 16) ?? 0
        return Color(red: Double((rgb >> 16) & 255) / 255,
                     green: Double((rgb >> 8) & 255) / 255,
                     blue: Double(rgb & 255) / 255)
    }
}

struct PersonAvatar: View {
    let model: AppModel
    let person: Person
    let size: CGFloat

    var body: some View {
        StickerAvatar(name: person.displayName, sticker: StickerImage(dataURI: person.photoUrl),
                      photoURL: personPhotoURL(person.photoUrl, model: model), size: size)
    }
}

private struct StickerAvatar: View {
    let name: String
    let sticker: StickerImage?
    var photoURL: URL? = nil
    let size: CGFloat

    var body: some View {
        if let sticker {
            stickerGlyph(sticker.icon)
                .frame(width: size, height: size)
                .background(sticker.tint.fill, in: RoundedRectangle(cornerRadius: size * 28 / 96))
                .accessibilityLabel("\(name) avatar")
                .accessibilityAddTraits(.isImage)
        } else {
            ConfettiAvatar(name: name, photoURL: photoURL, size: size)
        }
    }

    @ViewBuilder
    private func stickerGlyph(_ icon: StickerImage.Icon) -> some View {
        #if targetEnvironment(simulator)
        if !Self.simulatorHasEmojiFont {
            Image(systemName: simulatorSymbol(for: icon))
                .font(.system(size: size * 0.50, weight: .medium))
                .foregroundStyle(ConfettiColor.ink)
        } else {
            Text(icon.rawValue).font(.system(size: size * 0.56))
        }
        #else
        Text(icon.rawValue).font(.system(size: size * 0.56))
        #endif
    }

    #if targetEnvironment(simulator)
    // Some simulator runtimes omit Apple Color Emoji. Keep the sticker recognizable in previews.
    private static let simulatorHasEmojiFont: Bool = {
        let font = CTFontCreateWithName("AppleColorEmoji" as CFString, 16, nil)
        guard let url = CTFontCopyAttribute(font, kCTFontURLAttribute) as? URL,
              url.lastPathComponent.contains("Emoji") else { return false }
        return FileManager.default.isReadableFile(atPath: url.path)
    }()

    private func simulatorSymbol(for icon: StickerImage.Icon) -> String {
        switch icon {
        case .fox: "pawprint.fill"
        case .dinosaur: "lizard.fill"
        case .chick: "bird.fill"
        case .sun: "sun.max.fill"
        case .tulip: "leaf.fill"
        case .discoBall: "sparkles"
        }
    }
    #endif

}

private struct PersonStickerPicker: View {
    let name: String
    @Binding var sticker: StickerImage?
    @Environment(\.confettiTheme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Sticker").font(ConfettiFont.label)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 48), spacing: 6)], alignment: .leading, spacing: 8) {
                ForEach(StickerImage.Icon.allCases, id: \.self) { icon in
                    Button {
                        sticker = StickerImage(icon: icon, tint: sticker?.tint ?? .yellow)
                    } label: {
                        StickerAvatar(name: name, sticker: StickerImage(icon: icon, tint: sticker?.tint ?? .yellow), size: 44)
                            .padding(2)
                            .overlay {
                                if sticker?.icon == icon { RoundedRectangle(cornerRadius: 17).strokeBorder(theme.accent, lineWidth: 2) }
                            }
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(icon == .discoBall ? "Disco ball" : String(describing: icon).capitalized)
                    .accessibilityAddTraits(sticker?.icon == icon ? .isSelected : [])
                }
            }
            Text("Color").font(ConfettiFont.label)
            HStack(spacing: 6) {
                ForEach(StickerImage.Tint.allCases, id: \.self) { color in
                    Button {
                        sticker = StickerImage(icon: sticker?.icon ?? .fox, tint: color)
                    } label: {
                        Circle().fill(color.fill)
                            .overlay {
                                if color == sticker?.tint {
                                    Image(systemName: "checkmark").font(.caption.weight(.semibold)).foregroundStyle(ConfettiColor.ink)
                                }
                            }
                            .frame(width: 30, height: 30)
                            .frame(width: 44, height: 44)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(String(describing: color).capitalized)
                    .accessibilityAddTraits(sticker?.tint == color ? .isSelected : [])
                }
            }
        }
    }
}

struct PersonCreatorView: View {
    let model: AppModel
    let onCreated: ((Person) -> Void)?
    @Environment(\.dismiss) private var dismiss
    @Environment(\.confettiTheme) private var theme
    @State private var draft = PersonDraft()
    @State private var step = PersonCreatorStep.basics
    @State private var groups: [FamilyGiftingKit.Group] = []
    @State private var groupError: String?
    @State private var photo = PersonPhotoDraft()
    @State private var selection: PhotosPickerItem?
    @State private var loadingPhoto = false
    @State private var saving = false
    @State private var error: String?
    @State private var success = 0
    @State private var failure = 0
    @State private var created: Person?
    @State private var showingProfile = false

    init(model: AppModel, onCreated: ((Person) -> Void)? = nil) {
        self.model = model
        self.onCreated = onCreated
    }

    #if DEBUG
    init(model: AppModel, initialStep: Int) {
        self.init(model: model)
        guard model.fixture, let previewStep = PersonCreatorStep(rawValue: initialStep), previewStep != .basics else { return }
        var preview = PersonDraft()
        preview.name = "Juno Hartwell"
        preview.relationship = "Child"
        preview.groupIDs = [1]
        preview.sticker = StickerImage(icon: .fox, tint: .pink)
        preview.birthday = CalendarDate("2014-12-09")?.date ?? .now
        preview.includesBirthday = true
        _draft = State(initialValue: preview)
        _step = State(initialValue: previewStep)
        _created = State(initialValue: previewStep == .complete ? model.people.first { $0.id == 3 } : nil)
    }
    #endif

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                header
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        if let error { ErrorNotice(message: error) }
                        stepContent.disabled(saving)
                    }
                    .padding(24)
                    .frame(maxWidth: 530)
                    .frame(maxWidth: .infinity)
                }
                .scrollDismissesKeyboard(.interactively)
                .safeAreaInset(edge: .bottom, spacing: 0) { footer }
            }
            .foregroundStyle(ConfettiColor.ink)
            .background(theme.paper)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: $showingProfile) {
                if let created { PersonProfileView(model: model, person: created) }
            }
        }
        .interactiveDismissDisabled(saving)
        .task { await loadGroups() }
        .task(id: selection) { await readPhoto(selection) }
        .sensoryFeedback(.success, trigger: success)
        .sensoryFeedback(.error, trigger: failure)
    }

    private var header: some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                if step != .complete {
                    Button(step == .basics ? "People" : "Back", systemImage: "arrow.left", action: goBack)
                        .labelStyle(.iconOnly).font(.system(size: 20))
                        .frame(width: 44, height: 44).disabled(saving)
                }
                Spacer(minLength: 0)
                Text(step == .complete ? "All done" : "Step \(step.rawValue) of 5")
                    .font(ConfettiFont.label).multilineTextAlignment(.center)
                    .accessibilityAddTraits(.isHeader)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
                Button("Close", systemImage: "xmark") { dismiss() }
                    .labelStyle(.iconOnly).font(.system(size: 20))
                    .frame(width: 44, height: 44).disabled(saving)
            }.buttonStyle(.plain)
            HStack(spacing: 6) {
                ForEach(PersonCreatorStep.allCases) { segment in
                    Capsule().fill(segment.rawValue <= step.rawValue ? theme.accent : ConfettiColor.line).frame(height: 5)
                }
            }
            .accessibilityHidden(true)
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: 530)
    }

    @ViewBuilder private var stepContent: some View {
        switch step {
        case .basics:
            stepHeading("Who’s joining the gift list?")
            PersonBasicsFields(draft: $draft, groups: groups, groupError: groupError)
        case .picture:
            stepHeading("Choose a picture for \(draft.firstName)", subtitle: "Add a photo or give their profile a sticker.")
            PersonPhotoFields(name: draft.name, sticker: $draft.sticker, photo: $photo, selection: $selection,
                              loading: loadingPhoto, existingURL: nil)
        case .birthday:
            stepHeading("When’s \(draft.firstName)’s birthday?", subtitle: "We’ll keep the next celebration in sight.")
            ConfettiAvatar(name: "Birthday", sticker: "birthday.cake.fill", size: 96, fill: theme.birthdayFill)
                .rotationEffect(.degrees(-5))
                .frame(maxWidth: .infinity)
            PersonBirthdayFields(included: $draft.includesBirthday, date: $draft.birthday)
        case .extras:
            stepHeading("A few little gift clues?", subtitle: "Add anything you know now. You can fill in the rest on their profile.")
            ConfettiCard { PersonInterestsField(interests: $draft.interests) }
            ConfettiCard { PersonSizesFields(sizes: $draft.sizes) }
            ConfettiCard { PersonNotesField(notes: $draft.notes) }
        case .complete:
            completion
        }
    }

    private func stepHeading(_ title: String, subtitle: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            Text(title).font(ConfettiFont.display).accessibilityAddTraits(.isHeader)
            if let subtitle { Text(subtitle).font(ConfettiFont.detail).foregroundStyle(ConfettiColor.muted) }
        }
        .fixedSize(horizontal: false, vertical: true)
    }

    private var completion: some View {
        VStack(alignment: .leading, spacing: 22) {
            stepHeading("\(draft.firstName)’s in!")
            ZStack(alignment: .bottomTrailing) {
                SwiftUI.Group {
                    if let jpeg = photo.jpeg, let image = UIImage(data: jpeg) {
                        Image(uiImage: image).resizable().scaledToFill()
                    } else {
                        StickerAvatar(name: draft.name, sticker: draft.sticker, size: 138)
                    }
                }
                .frame(width: 138, height: 138)
                .clipShape(.circle)
                .shadow(color: ConfettiColor.pink, radius: 0, x: 8, y: 8)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(.white, theme.accent)
                    .offset(x: 12, y: 6)
                    .accessibilityHidden(true)
            }
            .frame(maxWidth: .infinity)
            ConfettiCard {
                VStack(spacing: 8) {
                    Text(created?.displayName ?? draft.name).font(ConfettiFont.heading)
                    if let relationship = draft.relationship.nonEmpty { Text(relationship).font(ConfettiFont.detail) }
                    if let birthday = created?.birthdate {
                        Text(birthday.date.formatted(date: .long, time: .omitted)).font(ConfettiFont.detail)
                        BirthdayBadge(date: birthday.date)
                    }
                }
                .frame(maxWidth: .infinity)
                .multilineTextAlignment(.center)
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 4) {
            if step == .complete {
                Button("Go to \(draft.firstName)’s profile", systemImage: "arrow.right", action: openProfile)
                    .labelStyle(.trailingIcon)
                    .buttonStyle(ConfettiButtonStyle(expands: true))
                    .disabled(created == nil)
                Button("Add another person", action: reset)
                    .buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
            } else {
                Button(action: continueCreator) {
                    if saving { ProgressView().tint(.white).accessibilityLabel("Creating profile") }
                    else { Label(step == .extras ? "Create profile" : "Continue", systemImage: "arrow.right").labelStyle(.trailingIcon) }
                }
                .buttonStyle(ConfettiButtonStyle(expands: true))
                .disabled(saving || loadingPhoto)
                if step == .basics {
                    Button("Cancel") { dismiss() }.buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
                } else {
                    Button("Skip, create now") { Task { await create(skipping: true) } }
                        .buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
                        .disabled(saving || loadingPhoto)
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 6)
        .frame(maxWidth: 530)
        .frame(maxWidth: .infinity)
        .background(theme.paper)
    }

    private func loadGroups() async {
        do { groups = try await allPersonGroups(client: model.client); groupError = nil }
        catch { groupError = personError(error, model: model) }
    }

    private func readPhoto(_ item: PhotosPickerItem?) async {
        guard let item else { loadingPhoto = false; return }
        loadingPhoto = true
        error = nil
        defer { if selection == item { loadingPhoto = false } }
        do {
            let jpeg = try await loadPersonJPEG(item)
            guard !Task.isCancelled, selection == item else { return }
            photo = PersonPhotoDraft(jpeg: jpeg)
        } catch {
            guard !Task.isCancelled, selection == item else { return }
            showError(error.localizedDescription)
        }
    }

    private func continueCreator() {
        if step == .basics, let issue = draft.basicsError { showError(issue); return }
        if step == .extras {
            Task { await create(skipping: false) }
        } else if let next = step.next {
            error = nil
            step = next
        }
    }

    private func goBack() {
        guard let previous = step.previous else { dismiss(); return }
        error = nil
        step = previous
    }

    private func create(skipping: Bool) async {
        guard !saving, !loadingPhoto, created == nil else { return }
        if let issue = draft.basicsError { showError(issue); return }
        let retainPicture = step.retainsPicture(skipping: skipping)
        if !skipping, let issue = draft.extrasError { showError(issue); return }
        saving = true
        error = nil
        defer { saving = false }
        do {
            let photoURL = retainPicture ? try await photo.upload(client: model.client) : nil
            if retainPicture { photo.uploadedURL = photoURL }
            let request = try step.creationInput(PersonCreate(
                displayName: draft.name, relationship: draft.relationship,
                groupIds: draft.groupIDs.sorted(), birthdate: draft.birthdate,
                photoUrl: photoURL ?? draft.sticker?.dataURI, interests: draft.interestValues,
                sizeProfile: draft.sizes.compactMap(\.entry), notes: draft.notes.nonEmpty
            ), skipping: skipping)
            let person = try await model.client.createPerson(request)
            if !retainPicture { photo = PersonPhotoDraft(); draft.sticker = nil }
            created = person
            step = .complete
            success += 1
            Task { await model.reload() }
        } catch {
            if let message = personError(error, model: model) { showError(message) }
        }
    }

    private func openProfile() {
        guard let created else { return }
        if let onCreated { onCreated(created); dismiss() }
        else { showingProfile = true }
    }

    private func reset() {
        draft = PersonDraft()
        photo = PersonPhotoDraft()
        selection = nil
        created = nil
        error = nil
        step = .basics
    }

    private func showError(_ message: String) { error = message; failure += 1 }
}

private struct PersonDraft {
    var name = ""
    var relationship = ""
    var groupIDs: Set<Int> = []
    var sticker: StickerImage?
    var includesBirthday = false
    var birthday = Date.now
    var interests = ""
    var sizes: [PersonSizeDraft] = []
    var notes = ""

    var firstName: String {
        name.split(whereSeparator: \.isWhitespace).first.map(String.init) ?? "your person"
    }

    var birthdate: CalendarDate? {
        guard includesBirthday else { return nil }
        let parts = Calendar(identifier: .gregorian).dateComponents([.year, .month, .day], from: birthday)
        guard let year = parts.year, let month = parts.month, let day = parts.day else { return nil }
        return CalendarDate(String(format: "%04d-%02d-%02d", year, month, day))
    }

    var interestValues: [String] {
        interests.components(separatedBy: .newlines).compactMap(\.nonEmpty)
    }

    var basicsError: String? {
        do {
            try PersonCreatorStep.validateBasics(name: name, relationship: relationship)
            return nil
        } catch { return error.localizedDescription }
    }

    var extrasError: String? { interestsError ?? sizesError ?? notesError }

    var interestsError: String? {
        interestValues.contains(where: { $0.unicodeScalars.count > 120 }) ? "Keep each interest to 120 characters or fewer." : nil
    }

    var sizesError: String? {
        sizes.contains(where: { !$0.isValid }) ? "Give each size a type and a value of up to 60 characters each." : nil
    }

    var notesError: String? {
        notes.trimmed.unicodeScalars.count > 2_000 ? "Keep gift notes to 2,000 characters or fewer." : nil
    }
}

private extension String {
    var trimmed: String { trimmingCharacters(in: .whitespacesAndNewlines) }
    var nonEmpty: String? { trimmed.isEmpty ? nil : trimmed }
}

struct PersonProfileView: View {
    let model: AppModel
    @Environment(\.confettiTheme) private var theme
    @State private var person: Person
    @State private var editor: PersonProfileField?
    @State private var gifts: [Gift] = []
    @State private var giftCursor: Int?
    @State private var loadingGifts = false
    @State private var loadedGifts = false
    @State private var profileError: String?
    @State private var giftsError: String?

    init(model: AppModel, person: Person) {
        self.model = model
        _person = State(initialValue: person)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                hero
                if let profileError { ErrorNotice(message: profileError) }
                details
                giftIdeas
            }
            .padding(20)
            .frame(maxWidth: 690)
            .frame(maxWidth: .infinity)
        }
        .background(theme.paper)
        .foregroundStyle(ConfettiColor.ink)
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") { editor = .basics }.frame(minWidth: 44, minHeight: 44)
            }
        }
        .sheet(item: $editor) { field in
            PersonProfileEditor(model: model, person: person, field: field) { updated in
                person = updated
                Task { await model.reload() }
            }
        }
        .task { await refresh() }
        .refreshable { await refresh() }
    }

    private var hero: some View {
        ConfettiCard(fill: theme.birthdayFill, padding: 18) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 15) { PersonAvatar(model: model, person: person, size: 76); heroText }
                VStack(alignment: .leading, spacing: 12) { PersonAvatar(model: model, person: person, size: 76); heroText }
            }
        }
    }

    private var heroText: some View {
        let groupLabels = person.groups.map(\.name) + [person.relationship].compactMap { $0 }
        return VStack(alignment: .leading, spacing: 7) {
            if !groupLabels.isEmpty {
                Text(groupLabels.joined(separator: " · ")).font(ConfettiFont.label)
            }
            Text(person.displayName).font(ConfettiFont.display).accessibilityAddTraits(.isHeader)
            if let birthday = person.birthdate {
                Text("Birthday \(birthday.date.formatted(.dateTime.month(.abbreviated).day()))")
                    .font(ConfettiFont.detail)
                BirthdayBadge(date: birthday.date)
            }
        }
        .fixedSize(horizontal: false, vertical: true)
    }

    private var details: some View {
        let fields = PersonProfileField.detailFields
        let completed = fields.filter { $0.value(for: person) != nil }.count
        return ConfettiCard {
            VStack(alignment: .leading, spacing: 8) {
                ViewThatFits(in: .horizontal) {
                    HStack(alignment: .firstTextBaseline) {
                        ConfettiSectionHeader("A little more about them")
                        Spacer(minLength: 6)
                        Text("\(completed) of \(fields.count) details").font(ConfettiFont.caption).foregroundStyle(theme.accent)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        ConfettiSectionHeader("A little more about them")
                        Text("\(completed) of \(fields.count) details").font(ConfettiFont.caption).foregroundStyle(theme.accent)
                    }
                }
                ForEach(fields) { field in
                    if field != fields.first { Divider() }
                    detailRow(field)
                }
            }
        }
    }

    private func detailRow(_ field: PersonProfileField) -> some View {
        let value = field.value(for: person)
        return Button {
            editor = field
        } label: {
            HStack(spacing: 10) {
                Image(systemName: field.icon)
                    .foregroundStyle(theme.accent)
                    .frame(width: 34, height: 34)
                    .background(theme.accentSoft, in: RoundedRectangle(cornerRadius: 10))
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 4) {
                    Text(value == nil ? field.prompt : field.title).font(ConfettiFont.subheading)
                    if let value { Text(value).font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted).lineLimit(2) }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                Image(systemName: value == nil ? "plus" : "pencil")
                    .foregroundStyle(theme.accent)
                    .accessibilityHidden(true)
            }
            .padding(.vertical, 5)
            .frame(minHeight: 44)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
    }

    private var giftIdeas: some View {
        VStack(alignment: .leading, spacing: 10) {
            ConfettiSectionHeader("Gifts for \(person.displayName.split(whereSeparator: \.isWhitespace).first.map(String.init) ?? person.displayName)")
            if let giftsError {
                ErrorNotice(message: giftsError)
                Button("Try again") { Task { await loadGiftIdeas(cursor: nil) } }.buttonStyle(ConfettiButtonStyle(.secondary))
            } else if loadingGifts && gifts.isEmpty {
                ProgressView("Loading gifts…").frame(maxWidth: .infinity, minHeight: 60)
            } else if loadedGifts && gifts.isEmpty {
                ConfettiEmptyState(title: "No gifts yet", message: "Gift ideas linked to this person will appear here.", systemImage: "gift")
            }
            ForEach(gifts) { gift in
                NavigationLink {
                    NativeGiftDetailView(model: model, gift: gift)
                } label: {
                    ConfettiCard {
                        HStack(spacing: 12) {
                            Image(systemName: "gift.fill").foregroundStyle(theme.accent)
                                .frame(width: 46, height: 46)
                                .background(theme.accentSoft, in: RoundedRectangle(cornerRadius: 13))
                                .accessibilityHidden(true)
                            VStack(alignment: .leading, spacing: 5) {
                                Text(gift.name).font(ConfettiFont.subheading)
                                if let price = gift.salePrice ?? gift.price {
                                    Text(money(price)).font(ConfettiFont.caption).foregroundStyle(ConfettiColor.muted)
                                }
                                ConfettiStatusPill(title: gift.status.rawValue.capitalized, tone: giftTone(gift.status))
                            }
                            Spacer(minLength: 0)
                            Image(systemName: "chevron.right").font(.caption).accessibilityHidden(true)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
            if let giftCursor {
                Button("Load more gifts") { Task { await loadGiftIdeas(cursor: giftCursor) } }
                    .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
                    .disabled(loadingGifts)
            }
        }
    }

    private func giftTone(_ status: GiftStatus) -> ConfettiStatusTone {
        switch status {
        case .idea: .idea
        case .selected: .selected
        case .purchased: .purchased
        case .received: .received
        }
    }

    private func refresh() async {
        do {
            let fresh = try await model.client.person(id: person.id)
            if fresh.updatedAt >= person.updatedAt { person = fresh }
            profileError = nil
        } catch { profileError = personError(error, model: model) }
        await loadGiftIdeas(cursor: nil)
    }

    private func loadGiftIdeas(cursor: Int?) async {
        guard !loadingGifts else { return }
        loadingGifts = true
        defer { loadingGifts = false }
        do {
            let page = try await model.client.gifts(cursor: cursor, limit: 12, personIds: [person.id])
            if cursor == nil { gifts = page.items }
            else { gifts += page.items }
            giftCursor = page.nextCursor
            loadedGifts = true
            giftsError = nil
        } catch { giftsError = personError(error, model: model) }
    }
}

private enum PersonProfileField: String, Identifiable {
    case basics, photo, birthday, interests, sizes, notes
    var id: Self { self }

    static let detailFields: [Self] = [.photo, .birthday, .sizes, .interests, .notes]

    var title: String {
        switch self {
        case .basics: "Edit profile"
        case .photo: "Picture"
        case .birthday: "Birthday"
        case .interests: "Interests"
        case .sizes: "Sizes"
        case .notes: "Gift notes"
        }
    }

    var icon: String {
        switch self {
        case .basics: "person"
        case .photo: "camera"
        case .birthday: "birthday.cake"
        case .interests: "heart"
        case .sizes: "shoe"
        case .notes: "note.text"
        }
    }

    var prompt: String {
        switch self {
        case .basics: title
        case .photo: "Add a favorite photo"
        case .birthday: "Add their birthday"
        case .interests: "What are they into?"
        case .sizes: "What size are they?"
        case .notes: "Write a gift note"
        }
    }

    func value(for person: Person) -> String? {
        switch self {
        case .basics: person.displayName
        case .photo: person.photoUrl?.nonEmpty.map { StickerImage(dataURI: $0) == nil ? "Photo added" : "Sticker" }
        case .birthday: person.birthdate?.date.formatted(date: .long, time: .omitted)
        case .interests: person.interests?.joined(separator: ", ").nonEmpty
        case .sizes: person.sizeProfile?.map { "\($0.type.capitalized) \($0.value)" }.joined(separator: " · ").nonEmpty
        case .notes: person.notes?.nonEmpty
        }
    }
}

private struct PersonProfileEditor: View {
    let model: AppModel
    let person: Person
    let field: PersonProfileField
    let onSave: (Person) -> Void
    @Environment(\.dismiss) private var dismiss
    @Environment(\.confettiTheme) private var theme
    @State private var draft: PersonDraft
    @State private var groups: [FamilyGiftingKit.Group] = []
    @State private var groupError: String?
    @State private var photo = PersonPhotoDraft()
    @State private var selection: PhotosPickerItem?
    @State private var loading = false
    @State private var saving = false
    @State private var error: String?
    @State private var failure = 0
    @State private var photoToReplace: String?

    init(model: AppModel, person: Person, field: PersonProfileField, onSave: @escaping (Person) -> Void) {
        self.model = model
        self.person = person
        self.field = field
        self.onSave = onSave
        var initial = PersonDraft()
        initial.name = person.displayName
        initial.relationship = person.relationship ?? ""
        initial.groupIDs = Set(person.groups.map(\.id))
        initial.sticker = StickerImage(dataURI: person.photoUrl)
        initial.includesBirthday = person.birthdate != nil
        initial.birthday = person.birthdate?.date ?? .now
        initial.interests = person.interests?.joined(separator: "\n") ?? ""
        initial.sizes = person.sizeProfile?.map { PersonSizeDraft(existing: $0) } ?? []
        initial.notes = person.notes ?? ""
        _draft = State(initialValue: initial)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if let error { ErrorNotice(message: error) }
                    switch field {
                    case .basics:
                        PersonBasicsFields(draft: $draft, groups: groups, groupError: groupError)
                    case .photo:
                        PersonPhotoFields(name: person.displayName, sticker: $draft.sticker, photo: $photo,
                                          selection: $selection, loading: loading,
                                          existingURL: personPhotoURL(person.photoUrl, model: model), hasExistingPhoto: person.photoUrl?.nonEmpty != nil && StickerImage(dataURI: person.photoUrl) == nil)
                    case .birthday:
                        PersonBirthdayFields(included: $draft.includesBirthday, date: $draft.birthday)
                    case .interests:
                        PersonInterestsField(interests: $draft.interests)
                    case .sizes:
                        PersonSizesFields(sizes: $draft.sizes)
                    case .notes:
                        PersonNotesField(notes: $draft.notes)
                    }
                }
                .disabled(saving)
                .padding(20)
                .frame(maxWidth: 530)
                .frame(maxWidth: .infinity)
            }
            .foregroundStyle(ConfettiColor.ink)
            .background(theme.paper)
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle(field.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.disabled(saving)
                }
                ToolbarItem(placement: .confirmationAction) {
                    if saving { ProgressView().accessibilityLabel("Saving changes") }
                    else { Button("Save") { Task { await save() } }.disabled(loading) }
                }
            }
        }
        .alert("Replace this photo?", isPresented: Binding(
            get: { photoToReplace != nil },
            set: { if !$0 { photoToReplace = nil } }
        ), presenting: photoToReplace) { confirmed in
            Button("Replace photo", role: .destructive) { Task { await save(confirmedPhoto: confirmed) } }
            Button("Cancel", role: .cancel) {}
        } message: { _ in
            Text("The new picture will replace the current photo for everyone.")
        }
        .interactiveDismissDisabled(saving)
        .task {
            guard field == .basics else { return }
            do { groups = try await allPersonGroups(client: model.client) }
            catch { groupError = personError(error, model: model) }
        }
        .task(id: selection) { await readPhoto(selection) }
        .sensoryFeedback(.error, trigger: failure)
    }

    private func readPhoto(_ item: PhotosPickerItem?) async {
        guard let item else { loading = false; return }
        loading = true
        error = nil
        defer { if selection == item { loading = false } }
        do {
            let jpeg = try await loadPersonJPEG(item)
            guard !Task.isCancelled, selection == item else { return }
            photo = PersonPhotoDraft(jpeg: jpeg)
        } catch {
            guard !Task.isCancelled, selection == item else { return }
            self.error = error.localizedDescription
            failure += 1
        }
    }

    private func save(confirmedPhoto: String? = nil) async {
        guard !saving, !loading else { return }
        let validationMessage = switch field {
        case .basics: draft.basicsError
        case .interests: draft.interestsError
        case .sizes: draft.sizesError
        case .notes: draft.notesError
        case .photo, .birthday: nil as String?
        }
        if let issue = validationMessage {
            error = issue
            failure += 1
            return
        }
        saving = true
        error = nil
        defer { saving = false }
        do {
            let patch: PersonUpdate?
            switch field {
            case .basics:
                let groupIDs = draft.groupIDs == Set(person.groups.map(\.id)) ? nil : draft.groupIDs.sorted()
                patch = .basics(displayName: draft.name.trimmed, relationship: draft.relationship.nonEmpty, groupIds: groupIDs)
            case .photo:
                let sticker = draft.sticker?.dataURI
                let changesPhoto = photo.jpeg != nil || (sticker != nil && sticker != person.photoUrl)
                guard changesPhoto else { dismiss(); return }
                let latest = try await model.client.person(id: person.id).photoUrl?.nonEmpty
                if let latest, StickerImage(dataURI: latest) == nil, latest != confirmedPhoto {
                    photoToReplace = latest
                    return
                }
                if let url = try await photo.upload(client: model.client) {
                    photo.uploadedURL = url
                    patch = .photo(url)
                } else {
                    patch = sticker.map { .photo($0) }
                }
            case .birthday: patch = .birthday(draft.birthdate)
            case .interests: patch = .interests(draft.interestValues)
            case .sizes: patch = .sizes(draft.sizes.compactMap(\.entry))
            case .notes: patch = .notes(draft.notes.nonEmpty)
            }
            let updated = if let patch { try await model.client.updatePerson(id: person.id, patch) } else { person }
            onSave(updated)
            dismiss()
        } catch {
            if let message = personError(error, model: model) {
                self.error = message
                failure += 1
            }
        }
    }
}

private struct PersonBasicsFields: View {
    @Binding var draft: PersonDraft
    let groups: [FamilyGiftingKit.Group]
    let groupError: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            PersonTextField(title: "Their name", prompt: "Name", text: $draft.name)
                .textContentType(.name)
            PersonTextField(title: "Relationship (optional)", prompt: "Child, parent, friend…", text: $draft.relationship)
            if !groups.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Groups (optional)").font(ConfettiFont.label)
                    ForEach(groups) { group in
                        Toggle(group.name, isOn: Binding(get: { draft.groupIDs.contains(group.id) }, set: { selected in
                            if selected { draft.groupIDs.insert(group.id) }
                            else { draft.groupIDs.remove(group.id) }
                        }))
                        .toggleStyle(.button)
                        .buttonStyle(ConfettiButtonStyle(.secondary))
                        .accessibilityAddTraits(draft.groupIDs.contains(group.id) ? .isSelected : [])
                    }
                }
            }
            if let groupError { ErrorNotice(message: groupError) }
        }
    }
}

private struct PersonTextField: View {
    let title: String
    let prompt: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title).font(ConfettiFont.label).accessibilityHidden(true)
            TextField(title, text: $text, prompt: Text(prompt))
                .font(ConfettiFont.body)
                .padding(.horizontal, 13)
                .frame(minHeight: 48)
                .background(.white, in: RoundedRectangle(cornerRadius: 14))
                .overlay { RoundedRectangle(cornerRadius: 14).strokeBorder(ConfettiColor.line) }
        }
    }
}

private struct PersonBirthdayFields: View {
    @Binding var included: Bool
    @Binding var date: Date

    var body: some View {
        ConfettiCard {
            VStack(alignment: .leading, spacing: 12) {
                Toggle("Add a birthday", isOn: $included).frame(minHeight: 44)
                if included {
                    DatePicker("Birthday", selection: $date, in: ...Date.now, displayedComponents: .date)
                        .datePickerStyle(.compact)
                        .frame(minHeight: 44)
                    BirthdayBadge(date: date)
                }
            }
            .font(ConfettiFont.body)
        }
    }
}

private struct BirthdayBadge: View {
    let date: Date

    var body: some View {
        if let daysToBirthday {
            Label(daysToBirthday == 0 ? "Birthday today" : "Birthday in \(daysToBirthday) \(daysToBirthday == 1 ? "day" : "days")",
                  systemImage: "birthday.cake")
                .font(ConfettiFont.label)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(.white, in: RoundedRectangle(cornerRadius: 10))
        }
    }

    private var daysToBirthday: Int? {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        let birthday = calendar.dateComponents([.month, .day], from: date)
        guard let next = calendar.nextDate(after: today.addingTimeInterval(-1), matching: birthday,
                                           matchingPolicy: .nextTime) else { return nil }
        return calendar.dateComponents([.day], from: today, to: next).day
    }
}

private struct PersonInterestsField: View {
    @Binding var interests: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("Interests", systemImage: "heart").font(ConfettiFont.subheading)
            PersonTextArea(label: "Interests", prompt: "One interest per line", text: $interests)
        }
    }
}

private struct PersonNotesField: View {
    @Binding var notes: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("Gift notes", systemImage: "note.text").font(ConfettiFont.subheading)
            PersonTextArea(label: "Gift notes", prompt: "Anything worth remembering?", text: $notes)
        }
    }
}

private struct PersonTextArea: View {
    let label: String
    let prompt: String
    @Binding var text: String

    var body: some View {
        TextField(label, text: $text, prompt: Text(prompt), axis: .vertical)
            .font(ConfettiFont.body)
            .lineLimit(2...5)
            .padding(12)
            .background(.white, in: RoundedRectangle(cornerRadius: 14))
            .overlay { RoundedRectangle(cornerRadius: 14).strokeBorder(ConfettiColor.line) }
    }
}

private struct PersonSizeDraft: Identifiable {
    let id = UUID()
    var type: String
    var value: String
    private let original: SizeEntry?

    init(existing: SizeEntry? = nil) {
        original = existing
        type = existing?.type ?? ""
        value = existing?.value ?? ""
    }

    var isValid: Bool {
        if type.nonEmpty == nil && value.nonEmpty == nil { return true }
        guard let type = type.nonEmpty, let value = value.nonEmpty else { return false }
        return type.unicodeScalars.count <= 60 && value.unicodeScalars.count <= 60
    }

    var entry: SizeEntry? {
        guard let type = type.nonEmpty, let value = value.nonEmpty else { return nil }
        return SizeEntry(type: type, value: value, copyingDetailsFrom: original)
    }
}

private struct PersonSizesFields: View {
    @Binding var sizes: [PersonSizeDraft]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Sizes", systemImage: "shoe").font(ConfettiFont.subheading)
            ForEach($sizes) { $size in
                VStack(alignment: .leading, spacing: 8) {
                    PersonTextField(title: "Type", prompt: "Shirt, shoes…", text: $size.type)
                    PersonTextField(title: "Size", prompt: "M, US 5…", text: $size.value)
                    Button("Remove size", systemImage: "minus.circle") {
                        sizes.removeAll { $0.id == size.id }
                    }
                    .buttonStyle(ConfettiButtonStyle(.tertiary))
                }
            }
            Button("Add a size", systemImage: "plus") { sizes.append(PersonSizeDraft()) }
                .buttonStyle(ConfettiButtonStyle(.secondary))
        }
    }
}

private struct PersonPhotoDraft {
    var jpeg: Data?
    var uploadedURL: String?
    var prefersSticker = false

    func upload(client: APIClient) async throws -> String? {
        if let uploadedURL { return uploadedURL }
        guard let jpeg else { return nil }
        return try await client.uploadPersonPhoto(jpeg: jpeg).imageUrl
    }
}

private struct PersonPhotoFields: View {
    let name: String
    @Binding var sticker: StickerImage?
    @Binding var photo: PersonPhotoDraft
    @Binding var selection: PhotosPickerItem?
    let loading: Bool
    let existingURL: URL?
    var hasExistingPhoto = false

    var body: some View {
        let photoAction = photo.jpeg == nil && (!hasExistingPhoto || photo.prefersSticker) ? "Choose a photo" : "Choose another photo"
        VStack(alignment: .leading, spacing: 13) {
            preview
                .frame(maxWidth: .infinity)
            if loading { ProgressView("Preparing photo…") }
            PhotosPicker(selection: $selection, matching: .images) {
                Label(photoAction, systemImage: "photo")
            }
            .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
            if photo.jpeg != nil || hasExistingPhoto && !photo.prefersSticker {
                Button("Use a sticker instead") {
                    photo = PersonPhotoDraft(prefersSticker: hasExistingPhoto)
                    if sticker == nil { sticker = StickerImage(icon: .fox, tint: .yellow) }
                    selection = nil
                }
                .buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
            }
            if photo.jpeg == nil && (!hasExistingPhoto || photo.prefersSticker) {
                PersonStickerPicker(name: name, sticker: $sticker)
            }
        }
    }

    @ViewBuilder private var preview: some View {
        if let jpeg = photo.jpeg, let image = UIImage(data: jpeg) {
            Image(uiImage: image).resizable().scaledToFill()
                .frame(width: 104, height: 104)
                .clipShape(RoundedRectangle(cornerRadius: 30))
                .accessibilityHidden(true)
        } else {
            StickerAvatar(name: name, sticker: photo.prefersSticker || !hasExistingPhoto ? sticker : nil,
                          photoURL: photo.prefersSticker ? nil : existingURL, size: 104)
        }
    }
}

private func loadPersonJPEG(_ item: PhotosPickerItem) async throws -> Data {
    guard let data = try await item.loadTransferable(type: Data.self) else { throw PersonPhotoError.unreadable }
    return try await Task.detached(priority: .userInitiated) { try preparePersonJPEG(data) }.value
}

private func preparePersonJPEG(_ data: Data) throws -> Data {
    let options = [kCGImageSourceCreateThumbnailFromImageAlways: true, kCGImageSourceCreateThumbnailWithTransform: true,
                   kCGImageSourceThumbnailMaxPixelSize: 1200] as CFDictionary
    guard let source = CGImageSourceCreateWithData(data as CFData, nil),
          let image = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else { throw PersonPhotoError.unreadable }
    let result = NSMutableData()
    guard let destination = CGImageDestinationCreateWithData(result, UTType.jpeg.identifier as CFString, 1, nil) else {
        throw PersonPhotoError.unreadable
    }
    CGImageDestinationAddImage(destination, image, [kCGImageDestinationLossyCompressionQuality: 0.82] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else { throw PersonPhotoError.unreadable }
    return result as Data
}

private enum PersonPhotoError: LocalizedError {
    case unreadable
    var errorDescription: String? { "This photo couldn’t be opened. Choose another image." }
}

@MainActor
private func personPhotoURL(_ value: String?, model: AppModel) -> URL? {
    guard !model.fixture, let value = value?.nonEmpty, let origin = URL(string: model.address),
          let url = URL(string: value, relativeTo: origin)?.absoluteURL,
          let scheme = url.scheme?.lowercased(), ["https", "http"].contains(scheme),
          url.host != nil, url.user == nil, url.password == nil else { return nil }
    return url
}

private func allPersonGroups(client: APIClient) async throws -> [FamilyGiftingKit.Group] {
    var groups: [FamilyGiftingKit.Group] = []
    var cursor: Int?
    repeat {
        let page = try await client.groups(cursor: cursor, limit: 100)
        groups += page.items
        guard page.nextCursor != cursor else { break }
        cursor = page.nextCursor
    } while cursor != nil
    return groups
}

@MainActor
private func personError(_ error: Error, model: AppModel) -> String? {
    if Task.isCancelled || error is CancellationError { return nil }
    if let apiError = error as? APIError {
        if apiError == .sessionChanged { return nil }
        if apiError.isUnauthorized { model.handle(error); return nil }
    }
    return error.localizedDescription
}
