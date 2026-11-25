import Foundation

/// The web avatar's self-contained SVG, drawn with native text rather than executing SVG.
public struct StickerImage: Equatable, Sendable {
    public enum Icon: String, CaseIterable, Sendable {
        case fox = "🦊", dinosaur = "🦕", chick = "🐥", sun = "🌞", tulip = "🌷", discoBall = "🪩"
    }

    public enum Tint: String, CaseIterable, Sendable {
        case yellow = "#ffdf70", pink = "#ffd1df", mint = "#c7e9d9", lavender = "#e2e7ff"
    }

    public let icon: Icon?
    public let initial: String?
    public let tint: Tint
    public let dataURI: String

    public init(icon: Icon, tint: Tint) {
        self.init(icon: icon, initial: nil, tint: tint)
    }

    private init(icon: Icon?, initial: String?, tint: Tint, original: String? = nil) {
        self.icon = icon
        self.initial = initial
        self.tint = tint
        let svg = Self.svgOpening(tint) + (icon?.rawValue ?? initial ?? "") + Self.svgClosing
        dataURI = original ?? Self.prefix + (svg.addingPercentEncoding(withAllowedCharacters: Self.componentCharacters) ?? "")
    }

    private static let prefix = "data:image/svg+xml,"
    private static let componentCharacters = CharacterSet(charactersIn:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()")
    private static let svgClosing = "</text></svg>"

    private static func svgOpening(_ tint: Tint) -> String {
        #"<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="28" fill="\#(tint.rawValue)"/><text x="48" y="66" text-anchor="middle" font-size="54">"#
    }

    public func recolored(_ tint: Tint) -> Self {
        Self(icon: icon, initial: initial, tint: tint)
    }

    public init?(dataURI: String?) {
        guard let dataURI, dataURI.utf8.count <= 500, dataURI.hasPrefix(Self.prefix),
              let svg = dataURI.dropFirst(Self.prefix.count).removingPercentEncoding,
              svg.hasSuffix(Self.svgClosing) else { return nil }
        for tint in Tint.allCases {
            let opening = Self.svgOpening(tint)
            guard svg.hasPrefix(opening), svg.count > opening.count + Self.svgClosing.count else { continue }
            let glyph = String(svg.dropFirst(opening.count).dropLast(Self.svgClosing.count))
            if let icon = Icon(rawValue: glyph) {
                self.init(icon: icon, initial: nil, tint: tint, original: dataURI)
                return
            }
            // PersonCreator uses /^\p{L}$/u for colored initials.
            if glyph.unicodeScalars.count == 1, glyph.range(of: #"^\p{L}$"#, options: .regularExpression) != nil {
                self.init(icon: nil, initial: glyph, tint: tint, original: dataURI)
                return
            }
        }
        return nil
    }
}
