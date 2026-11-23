import Foundation

/// The web creator's self-contained SVG, stored verbatim in photo_url.
public struct StickerImage: Equatable, Sendable {
    public enum Icon: String, CaseIterable, Sendable {
        case fox = "🦊", dinosaur = "🦕", chick = "🐥", sun = "🌞", tulip = "🌷", discoBall = "🪩"
    }

    public enum Tint: String, CaseIterable, Sendable {
        case yellow = "#ffdf70", pink = "#ffd1df", mint = "#c7e9d9", lavender = "#e2e7ff"
    }

    public var icon: Icon
    public var tint: Tint

    public init(icon: Icon, tint: Tint) {
        self.icon = icon
        self.tint = tint
    }

    private static let prefix = "data:image/svg+xml,"
    private static let componentCharacters = CharacterSet(charactersIn:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()")

    private var svg: String {
        #"<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="28" fill="\#(tint.rawValue)"/><text x="48" y="66" text-anchor="middle" font-size="54">\#(icon.rawValue)</text></svg>"#
    }

    public var dataURI: String {
        Self.prefix + (svg.addingPercentEncoding(withAllowedCharacters: Self.componentCharacters) ?? "")
    }

    public init?(dataURI: String?) {
        guard let dataURI, dataURI.hasPrefix(Self.prefix),
              let svg = dataURI.dropFirst(Self.prefix.count).removingPercentEncoding else { return nil }
        for icon in Icon.allCases {
            for tint in Tint.allCases {
                let candidate = Self(icon: icon, tint: tint)
                if svg == candidate.svg { self = candidate; return }
            }
        }
        return nil
    }
}
