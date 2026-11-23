import SwiftUI
import FamilyGiftingKit

struct SignInView: View {
    @Bindable var model: AppModel
    @State private var email = ""
    @State private var password = ""
    @State private var confirm = ""
    @State private var register = false
    @Environment(\.confettiTheme) private var theme
    private var valid: Bool {
        email.contains("@") && email.contains(".") && !password.isEmpty &&
        (!register || (password.count >= 8 && password.count <= 128 && password == confirm))
    }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    TogetherBow(size: 76, icon: true).padding(.top, 24)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Gather & give").font(ConfettiFont.label).textCase(.uppercase)
                        Text(register ? "Make room for\nthe good stuff." : "Good gifts.\nGreat people.").font(ConfettiFont.display)
                        Text(register ? "Create your account to start planning together." : "A little thoughtfulness, all in one place.")
                            .font(ConfettiFont.body).foregroundStyle(ConfettiColor.muted)
                    }
                    ConfettiCard {
                        VStack(alignment: .leading, spacing: 16) {
                            Text(register ? "Create account" : "Welcome back").font(ConfettiFont.heading)
                            TextField("Email", text: $email).textContentType(.username).keyboardType(.emailAddress)
                                .textInputAutocapitalization(.never).autocorrectionDisabled()
                                .accessibilityLabel("Email").frame(minHeight: 44)
                            Divider()
                            SecureField("Password", text: $password).textContentType(register ? .newPassword : .password)
                                .accessibilityLabel("Password").frame(minHeight: 44)
                            if register {
                                Text("Use 8–128 characters.").font(ConfettiFont.caption)
                                Divider()
                                SecureField("Confirm password", text: $confirm).textContentType(.newPassword).frame(minHeight: 44)
                                if !confirm.isEmpty && password != confirm { Text("Passwords don’t match yet.").font(ConfettiFont.caption) }
                            }
                            if let error = model.error { ErrorNotice(message: error) }
                            Button {
                                Task { await model.authenticate(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password, register: register) }
                            } label: {
                                HStack { Text(model.busy ? "One moment…" : register ? "Create account" : "Sign in"); if model.busy { ProgressView().tint(.white) } }
                            }.buttonStyle(ConfettiButtonStyle(.primary, expands: true)).disabled(!valid || model.busy)
                        }
                    }
                    Button(register ? "Already part of the family? Sign in" : "New here? Create an account") {
                        register.toggle(); model.error = nil
                    }.buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
                    Button("Change family server") { model.settings = true }
                        .buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
                }.padding(24).frame(maxWidth: 560)
                    .frame(maxWidth: .infinity)
            }.background(theme.paper).foregroundStyle(ConfettiColor.ink)
        }
    }
}

struct ServerSettings: View {
    @Bindable var model: AppModel
    let firstLaunch: Bool
    @State private var address = ""
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TogetherBow(size: 60, icon: true).frame(maxWidth: .infinity)
                    Text(firstLaunch ? "Your family, connected." : "Family server").font(ConfettiFont.heading)
                    Text("Connect to the same home network as your family’s server. An HTTPS private address works here too.")
                    TextField("Server address", text: $address).keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .accessibilityLabel("Family server address")
                } footer: {
                    Text("Changing the server signs you out. Your gifts stay on the server.")
                }
                if let error = model.error { Section { ErrorNotice(message: error) } }
                Section {
                    Button(model.busy ? "Checking connection…" : "Check connection & continue") {
                        Task { await model.configure(address) }
                    }.disabled(model.busy || address.isEmpty).frame(minHeight: 44)
                }
            }
            .navigationTitle(firstLaunch ? "Welcome" : "Settings")
            .toolbar { if !firstLaunch { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } } }
            .onAppear { address = model.address }
        }
    }
}

struct AddIdeaView: View {
    @Bindable var model: AppModel
    @State private var name = ""
    @State private var url = ""
    @State private var notes = ""
    @State private var selectedPerson: Int?
    @State private var saved = false
    @State private var price = ""
    @Environment(\.dismiss) private var dismiss
    private var validURL: Bool {
        url.isEmpty || (URL(string: url)?.host != nil && ["http", "https"].contains(URL(string: url)?.scheme?.lowercased() ?? ""))
    }
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Spotted something they’d love?").font(ConfettiFont.heading)
                    TextField("What’s the idea?", text: $name).accessibilityLabel("Idea name")
                    TextField("Link (optional)", text: $url).keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                    if !validURL { Text("Use a full http:// or https:// link.").foregroundStyle(.red) }
                }
                Section("For someone?") {
                    TextField("Price (optional)", text: $price).keyboardType(.decimalPad).accessibilityLabel("Idea price")
                    Picker("Person", selection: $selectedPerson) {
                        Text("Decide later").tag(nil as Int?)
                        ForEach(model.people, id: \.id) { Text($0.displayName).tag(Optional($0.id)) }
                    }
                    TextField("A little note (optional)", text: $notes, axis: .vertical).lineLimit(3...6)
                }
                if let error = model.error { Section { ErrorNotice(message: error) } }
                Section {
                    Text("Saved on this device first, then synced when your family server is reachable.").font(ConfettiFont.caption)
                    Button(model.busy ? "Saving…" : "Save idea") {
                        Task {
                            if await model.saveIdea(name: name, url: url, notes: notes, personIds: selectedPerson.map { [$0] } ?? [], price: Decimal(string: price)) {
                                saved = true; dismiss()
                            }
                        }
                    }.disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || name.count > 255 || !validURL || (!price.isEmpty && price.range(of: #"^[0-9]{1,8}(\.[0-9]{1,2})?$"#, options: .regularExpression) == nil) || model.busy)
                        .frame(minHeight: 44)
                }
            }.navigationTitle("Save idea")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } }
                .sensoryFeedback(.success, trigger: saved)
                .onAppear { model.error = nil }
        }
    }
}
