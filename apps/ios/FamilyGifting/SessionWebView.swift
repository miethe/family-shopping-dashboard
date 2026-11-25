import SwiftUI
import UIKit
import WebKit

struct SessionWebView: View {
    private let session: WebSession
    private let onSessionExpired: @MainActor () -> Void
    private let isPreview: Bool

    init(
        origin: URL,
        path: String,
        token: String,
        expiresAt: Date,
        onSessionExpired: @escaping @MainActor () -> Void,
        isPreview: Bool = false
    ) {
        session = WebSession(origin: origin, path: path, token: token, expiresAt: expiresAt)
        self.onSessionExpired = onSessionExpired
        self.isPreview = isPreview
    }

    var body: some View {
        if isPreview {
            ContentUnavailableView("Available when connected", systemImage: "wifi.slash")
        } else {
            SessionPage(session: session, onSessionExpired: onSessionExpired)
                .id(session)
        }
    }
}

private struct WebSession: Hashable {
    let origin: URL
    let path: String
    let token: String
    let expiresAt: Date

    var destination: URL? {
        guard path.hasPrefix("/"),
              let destination = URL(string: path, relativeTo: origin)?.absoluteURL,
              contains(destination)
        else { return nil }
        return destination
    }

    func contains(_ url: URL?) -> Bool {
        guard let url,
              let scheme = origin.scheme?.lowercased(),
              scheme == "https" || scheme == "http",
              scheme == url.scheme?.lowercased(),
              let host = origin.host?.lowercased(), !host.isEmpty,
              host == url.host?.lowercased(),
              origin.user == nil, origin.password == nil,
              url.user == nil, url.password == nil
        else { return false }
        let defaultPort = scheme == "https" ? 443 : 80
        return (origin.port ?? defaultPort) == (url.port ?? defaultPort)
    }

    func isAPI(_ url: URL) -> Bool {
        contains(url) && (url.path == "/api" || url.path.hasPrefix("/api/"))
    }
}

private enum PagePhase: Equatable {
    case loading
    case loaded
    case failed(String)
    case expired
}

private struct SessionPage: View {
    let session: WebSession
    let onSessionExpired: @MainActor () -> Void

    @State private var phase = PagePhase.loading
    @State private var attempt = 0

    var body: some View {
        ZStack {
            if phase != .expired {
                WebPage(session: session, phase: $phase, onSessionExpired: onSessionExpired)
                    .id(attempt)
                    .opacity(phase == .loaded ? 1 : 0)
                    .allowsHitTesting(phase == .loaded)
                    .accessibilityHidden(phase != .loaded)
            }

            switch phase {
            case .loading:
                ProgressView("Loading page…")
            case .loaded:
                EmptyView()
            case .failed(let detail):
                ContentUnavailableView {
                    Label("Couldn’t open this page", systemImage: "exclamationmark.circle")
                } description: {
                    Text(detail)
                } actions: {
                    Button("Retry") {
                        phase = .loading
                        attempt += 1
                    }
                    .buttonStyle(.bordered)
                }
            case .expired:
                ContentUnavailableView("Sign in to continue", systemImage: "lock")
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct WebPage: UIViewRepresentable {
    let session: WebSession
    @Binding var phase: PagePhase
    let onSessionExpired: @MainActor () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(session: session, phase: $phase, onSessionExpired: onSessionExpired)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        return context.coordinator.makeWebView(configuration: configuration)
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.onSessionExpired = onSessionExpired
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        coordinator.tearDown(webView)
    }

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        private static let bridge = "familyGiftingSession"
        private static let loadError = "Check your connection and try again."
        private static let registrationError = "Registration is unavailable in the app."

        private let session: WebSession
        private let phase: Binding<PagePhase>
        private weak var activeWebView: WKWebView?
        private var initialLoad: Task<Void, Never>?
        var onSessionExpired: @MainActor () -> Void

        init(session: WebSession, phase: Binding<PagePhase>, onSessionExpired: @escaping @MainActor () -> Void) {
            self.session = session
            self.phase = phase
            self.onSessionExpired = onSessionExpired
        }

        func makeWebView(configuration: WKWebViewConfiguration) -> WKWebView {
            let content = configuration.userContentController
            let script = sessionScript()
            if let script {
                content.add(self, name: Self.bridge)
                content.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
            }

            let webView = WKWebView(frame: .zero, configuration: configuration)
            activeWebView = webView
            webView.navigationDelegate = self
            webView.uiDelegate = self

            initialLoad = Task { [weak self, weak webView] in
                guard let self, let webView, !Task.isCancelled else { return }
                guard !session.token.isEmpty, session.expiresAt > Date() else {
                    expireSession()
                    return
                }
                guard script != nil, let destination = session.destination else {
                    phase.wrappedValue = .failed(Self.loadError)
                    return
                }
                webView.load(URLRequest(url: destination))
            }
            return webView
        }

        func tearDown(_ webView: WKWebView) {
            initialLoad?.cancel()
            activeWebView = nil
            webView.navigationDelegate = nil
            webView.uiDelegate = nil
            webView.stopLoading()
            webView.configuration.userContentController.removeScriptMessageHandler(forName: Self.bridge)
            webView.configuration.userContentController.removeAllUserScripts()
        }

        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction) async -> WKNavigationActionPolicy {
            guard webView === activeWebView, phase.wrappedValue != .expired,
                  let url = action.request.url
            else { return .cancel }
            let targetsPage = action.targetFrame?.isMainFrame != false
            guard session.contains(url) else {
                if targetsPage {
                    openExternalLink(url, action: action)
                    if phase.wrappedValue == .loading { phase.wrappedValue = .failed(Self.loadError) }
                }
                return .cancel
            }
            return blocksAuthPage(url, targetsPage: targetsPage) ? .cancel : .allow
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigation: WKNavigationResponse) async -> WKNavigationResponsePolicy {
            guard webView === activeWebView, phase.wrappedValue != .expired else { return .cancel }
            guard let url = navigation.response.url, session.contains(url) else {
                if navigation.isForMainFrame { phase.wrappedValue = .failed(Self.loadError) }
                return .cancel
            }
            guard !blocksAuthPage(url, targetsPage: navigation.isForMainFrame) else { return .cancel }
            if navigation.isForMainFrame,
               let response = navigation.response as? HTTPURLResponse,
               response.statusCode >= 400 {
                if response.statusCode == 401 && session.isAPI(url) {
                    expireSession()
                } else {
                    phase.wrappedValue = .failed(Self.loadError)
                }
                return .cancel
            }
            return .allow
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for action: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard webView === activeWebView, phase.wrappedValue != .expired, action.targetFrame == nil,
                  action.sourceFrame.isMainFrame, session.contains(action.sourceFrame.request.url),
                  let url = action.request.url
            else { return nil }

            if session.contains(url) {
                if !blocksAuthPage(url, targetsPage: true) { webView.load(action.request) }
            } else {
                openExternalLink(url, action: action)
            }
            return nil
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            if webView === activeWebView, phase.wrappedValue != .expired { phase.wrappedValue = .loading }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            if webView === activeWebView, phase.wrappedValue == .loading { phase.wrappedValue = .loaded }
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            if webView === activeWebView { showLoadFailure(error) }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            if webView === activeWebView { showLoadFailure(error) }
        }

        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            if webView === activeWebView, phase.wrappedValue != .expired { phase.wrappedValue = .failed(Self.loadError) }
        }

        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let activeWebView, message.webView === activeWebView,
                  message.name == Self.bridge, message.frameInfo.isMainFrame,
                  session.contains(message.frameInfo.request.url),
                  let payload = message.body as? [String: String], let event = payload["event"]
            else { return }

            switch event {
            case "unauthorized":
                guard let location = payload["url"], let url = URL(string: location), session.isAPI(url) else { return }
                expireSession()
            case "login":
                expireSession()
            case "register":
                if phase.wrappedValue != .expired { phase.wrappedValue = .failed(Self.registrationError) }
            default:
                break
            }
        }

        private func openExternalLink(_ url: URL, action: WKNavigationAction) {
            guard action.sourceFrame.isMainFrame, session.contains(action.sourceFrame.request.url),
                  action.navigationType == .linkActivated || action.targetFrame == nil,
                  action.request.httpMethod == "GET",
                  let scheme = url.scheme?.lowercased(), scheme == "https" || scheme == "http",
                  url.host != nil, url.user == nil, url.password == nil
            else { return }
            UIApplication.shared.open(url)
        }

        private func blocksAuthPage(_ url: URL, targetsPage: Bool) -> Bool {
            switch url.path.split(separator: "/").first {
            case "login":
                if targetsPage { expireSession() }
                return true
            case "register":
                if targetsPage { phase.wrappedValue = .failed(Self.registrationError) }
                return true
            default:
                return false
            }
        }

        private func expireSession() {
            guard phase.wrappedValue != .expired, activeWebView != nil else { return }
            phase.wrappedValue = .expired
            onSessionExpired()
        }

        private func showLoadFailure(_ error: Error) {
            let underlying = error as NSError
            guard phase.wrappedValue == .loading,
                  !(underlying.domain == NSURLErrorDomain && underlying.code == NSURLErrorCancelled)
            else { return }
            phase.wrappedValue = .failed(Self.loadError)
        }

        private func sessionScript() -> String? {
            let milliseconds = session.expiresAt.timeIntervalSince1970 * 1_000
            guard let expiry = Int64(exactly: milliseconds.rounded(.down)),
                  let json = try? JSONEncoder().encode([
                      "origin": session.origin.absoluteString,
                      "token": session.token,
                      "expiry": String(expiry),
                  ])
            else { return nil }

            return """
            (() => {
                const session = \(String(decoding: json, as: UTF8.self));
                const origin = new URL(session.origin).origin;
                if (window !== window.top || location.origin !== origin) return;

                const notify = (event, url = "") => {
                    window.webkit?.messageHandlers?.\(Self.bridge)?.postMessage({ event, url });
                };
                const clearToken = () => {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("auth_token_expiry");
                };
                const authRoute = value => {
                    try {
                        const url = new URL(value, document.baseURI);
                        if (url.origin !== origin) return null;
                        const route = decodeURI(url.pathname).split("/").filter(Boolean)[0];
                        return route === "login" || route === "register" ? route : null;
                    } catch {
                        return null;
                    }
                };
                const blockAuthRoute = value => {
                    const route = authRoute(value);
                    if (!route) return false;
                    if (route === "login") clearToken();
                    notify(route);
                    return true;
                };
                if (blockAuthRoute(location.href)) return;
                if (Date.now() >= Number(session.expiry)) {
                    clearToken();
                    notify("login");
                    return;
                }
                localStorage.setItem("auth_token", session.token);
                localStorage.setItem("auth_token_expiry", session.expiry);

                // Next.js routes can change without a WebKit navigation delegate callback.
                for (const method of ["pushState", "replaceState"]) {
                    const updateHistory = history[method];
                    history[method] = function(state, title, url) {
                        if (url != null && blockAuthRoute(url)) return;
                        return Reflect.apply(updateHistory, this, arguments);
                    };
                }
                window.addEventListener("popstate", () => blockAuthRoute(location.href));

                const apiURL = value => {
                    try {
                        const url = new URL(value, document.baseURI);
                        if (url.origin !== origin || url.username || url.password) return null;
                        return url.pathname === "/api" || url.pathname.startsWith("/api/") ? url : null;
                    } catch {
                        return null;
                    }
                };
                const reportUnauthorized = (status, url) => {
                    if (status !== 401 || !url) return;
                    const endpoint = apiURL(url);
                    if (!endpoint) return;
                    clearToken();
                    notify("unauthorized", endpoint.origin + endpoint.pathname);
                };

                // Require both the original request and its final response to stay within the API.
                const fetch = window.fetch;
                window.fetch = function(input) {
                    const requestedAPI = apiURL(input instanceof Request ? input.url : input);
                    return Reflect.apply(fetch, this, arguments).then(response => {
                        if (requestedAPI) reportUnauthorized(response.status, response.url);
                        return response;
                    });
                };

                const requestScopes = new WeakMap();
                const open = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url) {
                    const result = Reflect.apply(open, this, arguments);
                    if (!requestScopes.has(this)) {
                        this.addEventListener("loadend", function() {
                            if (requestScopes.get(this)) reportUnauthorized(this.status, this.responseURL);
                        });
                    }
                    requestScopes.set(this, apiURL(url));
                    return result;
                };
            })();
            """
        }
    }
}
