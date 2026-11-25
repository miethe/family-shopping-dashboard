import GiftingExtensions
import SwiftUI
import UIKit
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        preferredContentSize = CGSize(width: 420, height: 450)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        guard children.isEmpty else { return }
        let host = UIHostingController(rootView: ShareIdeaForm(
            store: ExtensionStore.shared(),
            draft: { [weak self] in await self?.sharedContent() ?? ShareContent() },
            finish: { [weak self] in self?.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil) },
            cancel: { [weak self] in
                self?.extensionContext?.cancelRequest(withError: CocoaError(.userCancelled))
            }
        ))
        addChild(host)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(host.view)
        NSLayoutConstraint.activate([
            host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            host.view.topAnchor.constraint(equalTo: view.topAnchor),
            host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        host.didMove(toParent: self)
    }

    private func sharedContent() async -> ShareContent {
        let items = extensionContext?.inputItems.compactMap { $0 as? NSExtensionItem } ?? []
        var content = ShareContent()
        for item in items {
            content.name = item.attributedTitle?.string ?? content.name
            for provider in item.attachments ?? [] {
                if content.url.isEmpty, let value = await provider.sharedURL(),
                   let url = SharedIdeaDraft.webURL(value) {
                    content.url = url.absoluteString
                }
                if content.text.isEmpty, let text = await provider.sharedText() {
                    content.text = String(String.UnicodeScalarView(text.unicodeScalars.prefix(4_096)))
                }
            }
            if content.text.isEmpty { content.text = item.attributedContentText?.string ?? "" }
        }
        let text = content.text.trimmingCharacters(in: .whitespacesAndNewlines)
        if content.url.isEmpty, let url = SharedIdeaDraft.webURL(text) { content.url = url.absoluteString }
        if content.name.isEmpty {
            if text.isEmpty || text == content.url {
                if let url = URL(string: content.url) {
                    let tail = url.lastPathComponent.replacingOccurrences(of: "-", with: " ")
                    content.name = tail.isEmpty || tail == "/" ? url.host ?? "" : tail
                }
            } else {
                content.name = String(text.split(whereSeparator: \.isNewline).first ?? "")
                    .trimmingCharacters(in: .whitespaces)
            }
        }
        content.name = String(String.UnicodeScalarView(content.name.unicodeScalars.prefix(255)))
        if text == content.url || text == content.name { content.text = "" }
        return content
    }
}

private extension NSItemProvider {
    @MainActor
    func sharedURL() async -> String? {
        if canLoadObject(ofClass: NSURL.self) {
            let url: String? = await withCheckedContinuation { continuation in
                _ = loadObject(ofClass: NSURL.self) { item, _ in
                    continuation.resume(returning: (item as? NSURL)?.absoluteString)
                }
            }
            if let url { return url }
        }
        return await sharedString(type: .url)
    }

    @MainActor
    func sharedText() async -> String? {
        if canLoadObject(ofClass: NSString.self) {
            let text: String? = await withCheckedContinuation { continuation in
                _ = loadObject(ofClass: NSString.self) { item, _ in
                    continuation.resume(returning: (item as? NSString).map { $0 as String })
                }
            }
            if let text { return text }
        }
        return await sharedString(type: .plainText)
    }

    @MainActor
    func sharedString(type: UTType) async -> String? {
        guard hasItemConformingToTypeIdentifier(type.identifier) else { return nil }
        return await withCheckedContinuation { continuation in
            loadItem(forTypeIdentifier: type.identifier, options: nil) { item, _ in
                if let url = item as? URL {
                    continuation.resume(returning: url.absoluteString)
                } else if let data = item as? Data {
                    continuation.resume(returning: String(data: data.prefix(16_384), encoding: .utf8))
                } else {
                    continuation.resume(returning: item as? String)
                }
            }
        }
    }
}

private struct ShareContent {
    var name = ""
    var url = ""
    var text = ""
}

private struct ShareIdeaForm: View {
    let store: ExtensionStore?
    let draft: @MainActor () async -> ShareContent
    let finish: @MainActor () -> Void
    let cancel: @MainActor () -> Void

    @State private var content = ShareContent()
    @State private var binding: ShareBinding?
    @State private var ready = false
    @State private var error: String?
    @State private var saved = false

    var body: some View {
        NavigationStack {
            Form {
                if saved {
                    Label("Saved on this device", systemImage: "checkmark.circle.fill")
                        .font(.headline)
                    Text("Family Gifting will sync this idea when you open the app and connect to your server.")
                } else if !ready {
                    ProgressView("Preparing idea…")
                } else if binding == nil {
                    Text(error ?? "Sign in to Family Gifting once, then share this idea again.")
                } else {
                    Section {
                        TextField("Idea name", text: $content.name)
                        TextField("Link (optional)", text: $content.url)
                            .keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        TextField("Notes (optional)", text: $content.text, axis: .vertical).lineLimit(2...4)
                    } footer: {
                        Text("The idea will be saved on this device first.")
                    }
                    if let error { Text(error).foregroundStyle(.red) }
                }
            }
            .navigationTitle("Save a gift idea")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if saved {
                    ToolbarItem(placement: .confirmationAction) { Button("Done", action: finish) }
                } else {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel", action: cancel) }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Save", action: save)
                            .disabled(binding == nil || !ready || content.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
        }
        .task {
            guard !ready else { return }
            do {
                guard let store else { throw ExtensionStoreError.storage }
                binding = try store.binding()
            } catch { self.error = error.localizedDescription }
            if binding != nil { content = await draft() }
            ready = true
        }
    }

    private func save() {
        guard let store, let binding else { return }
        do {
            let draft = try SharedIdeaDraft(name: content.name, url: content.url, notes: content.text)
            try store.save(draft, using: binding)
            saved = true
        } catch { self.error = error.localizedDescription }
    }
}
