import SwiftUI
import AuthenticationServices
import CryptoKit
import FamilyGiftingKit

struct WelcomeView: View {
    @Bindable var model: AppModel
    @State private var showEmail = false

    private var isSigningIn: Bool { model.busy || model.authorizingWithApple }

    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 28) {
                        HStack(spacing: 10) {
                            TogetherBow(size: 38, icon: true)
                            Text("Confetti").font(ConfettiFont.heading)
                        }

                        VStack(spacing: 12) {
                            Text("Good gifts.\nGreat people.")
                                .font(.custom("Montserrat-Bold", size: 40, relativeTo: .largeTitle))
                                .accessibilityAddTraits(.isHeader)
                                .onLongPressGesture { showServerSettings() }
                                .accessibilityAction(named: Text("Server settings")) { showServerSettings() }
                            Text("A little thoughtfulness, all in one place.")
                                .font(ConfettiFont.body).foregroundStyle(ConfettiColor.muted)
                        }

                        gift

                        VStack(spacing: 6) {
                            if let error = model.error { ErrorNotice(message: error) }
                            appleButton
                            if model.busy { ProgressView("Signing in…").font(ConfettiFont.caption) }
                            Button("Already have an account?") {
                                model.error = nil
                                showEmail = true
                            }.buttonStyle(ConfettiButtonStyle(.tertiary))
                            if model.canCaptureOffline {
                                Button("Save an idea offline") { model.addIdea = true }
                                    .buttonStyle(ConfettiButtonStyle(.secondary))
                                Button("Sign out of this device", role: .destructive) { Task { await model.signOut() } }
                                    .buttonStyle(ConfettiButtonStyle(.tertiary))
                            }
                        }.disabled(isSigningIn)
                    }
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 32)
                    .frame(maxWidth: 420)
                    .frame(maxWidth: .infinity, minHeight: geometry.size.height)
                }
            }
            .foregroundStyle(ConfettiColor.ink)
            .background(ConfettiColor.paper.ignoresSafeArea())
            .toolbarVisibility(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: $showEmail) { SignInView(model: model) }
            .onChange(of: showEmail) { _, isShowing in
                if !isShowing { model.error = nil }
            }
        }
    }

    private var gift: some View {
        ZStack {
            Ellipse().fill(ConfettiColor.pink.opacity(0.55))
                .frame(width: 112, height: 13).offset(y: 47)
            HStack(spacing: -5) {
                Ellipse().fill(ConfettiColor.pink).frame(width: 37, height: 23).rotationEffect(.degrees(34))
                Ellipse().fill(ConfettiColor.pink).frame(width: 37, height: 23).rotationEffect(.degrees(-34))
            }.offset(y: -17)
            RoundedRectangle(cornerRadius: 9).fill(ConfettiColor.cobalt)
                .frame(width: 80, height: 51).offset(y: 21)
            RoundedRectangle(cornerRadius: 6).fill(ConfettiColor.cobalt)
                .frame(width: 92, height: 19).offset(y: -3)
            Rectangle().fill(ConfettiColor.butter)
                .frame(width: 16, height: 59).offset(y: 17)
            Image(systemName: "sparkle").font(.system(size: 22, weight: .semibold))
                .foregroundStyle(ConfettiColor.butter).offset(x: 68, y: -30)
            RoundedRectangle(cornerRadius: 2).fill(ConfettiColor.pink)
                .frame(width: 10, height: 10).rotationEffect(.degrees(35)).offset(x: -65, y: -18)
            Circle().fill(ConfettiColor.mint).frame(width: 9, height: 9).offset(x: 70, y: 25)
        }
        .frame(width: 160, height: 112)
        .accessibilityHidden(true)
    }

    private var appleButton: some View {
        AppleAuthorizationButton(model: model)
        .frame(height: 52)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .disabled(model.address.isEmpty)
    }

    private func showServerSettings() {
        guard !isSigningIn else { return }
        model.error = nil
        model.serverOverrideUnlocked = true
        model.settings = true
    }
}

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
                if model.canCaptureOffline {
                    Button("Save an idea offline") { model.addIdea = true }
                        .buttonStyle(ConfettiButtonStyle(.secondary, expands: true))
                    Button("Sign out of this device", role: .destructive) { Task { await model.signOut() } }
                        .buttonStyle(ConfettiButtonStyle(.tertiary, expands: true))
                }
            }.padding(24).frame(maxWidth: 560)
                .frame(maxWidth: .infinity)
        }.background(theme.paper).foregroundStyle(ConfettiColor.ink)
            .toolbarVisibility(.visible, for: .navigationBar)
    }
}

struct ServerSettings: View {
    @Bindable var model: AppModel
    @State private var address = ""
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TogetherBow(size: 60, icon: true).frame(maxWidth: .infinity)
                    Text("Family server").font(ConfettiFont.heading)
                    Text("Connect to the same home network as your family’s server. An HTTPS private address works here too.")
                    if model.canEditServerAddress {
                        TextField("Server address", text: $address).keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                            .accessibilityLabel("Family server address")
                    } else {
                        Text(model.address).textSelection(.enabled).accessibilityLabel("Family server address")
                    }
                } footer: {
                    Text("Changing the server signs you out. Your gifts stay on the server.")
                }
                if let error = model.error { Section { ErrorNotice(message: error) } }
                if model.canEditServerAddress { Section {
                    Button(model.busy ? "Checking connection…" : "Check connection & continue") {
                        Task { await model.configure(address) }
                    }.disabled(model.busy || address.isEmpty).frame(minHeight: 44)
                } }
            }
            .navigationTitle("Settings")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } }
            .onAppear { address = model.address }
            .onDisappear { model.serverOverrideUnlocked = false }
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

// Fetch a fresh server challenge before presenting Apple's authorization sheet.
private struct AppleAuthorizationButton: UIViewRepresentable {
    let model: AppModel

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    func makeUIView(context: Context) -> ASAuthorizationAppleIDButton {
        let button = ASAuthorizationAppleIDButton(type: .signIn, style: .black)
        button.addTarget(context.coordinator, action: #selector(Coordinator.signIn), for: .touchUpInside)
        return button
    }

    func updateUIView(_ button: ASAuthorizationAppleIDButton, context: Context) {
        button.isEnabled = !model.busy && !model.authorizingWithApple && !model.address.isEmpty
    }

    @MainActor final class Coordinator: NSObject, ASAuthorizationControllerDelegate,
                                           ASAuthorizationControllerPresentationContextProviding {
        let model: AppModel
        private var nonce: String?
        private var controller: ASAuthorizationController?

        init(model: AppModel) { self.model = model }

        @objc func signIn() {
            Task {
                guard let nonce = await model.beginAppleSignIn() else { return }
                self.nonce = nonce
                let request = ASAuthorizationAppleIDProvider().createRequest()
                request.nonce = SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
                request.state = nonce
                request.requestedScopes = [.email]
                let controller = ASAuthorizationController(authorizationRequests: [request])
                self.controller = controller
                controller.delegate = self
                controller.presentationContextProvider = self
                controller.performRequests()
            }
        }

        func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
            UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
                .flatMap(\.windows).first(where: \.isKeyWindow) ?? ASPresentationAnchor()
        }

        func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
            guard let nonce else { return }
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  credential.state == nonce, let data = credential.identityToken,
                  let token = String(data: data, encoding: .utf8) else {
                finish(.failure(APIError.invalidPayload)); return
            }
            finish(.success(token))
        }

        func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
            finish(.failure(error))
        }

        private func finish(_ result: Result<String, Error>) {
            guard let nonce else { return }
            self.nonce = nil
            self.controller = nil
            Task { await model.completeAppleSignIn(nonce: nonce, result: result) }
        }
    }
}
