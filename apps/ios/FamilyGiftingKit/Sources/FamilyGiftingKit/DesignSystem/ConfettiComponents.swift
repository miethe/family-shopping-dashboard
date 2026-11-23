#if canImport(SwiftUI)
import SwiftUI

extension EnvironmentValues {
    @Entry public var confettiTheme: ConfettiTheme = .everyday
}

extension View {
    /// Confetti uses light paper in both themes so content keeps its intended contrast.
    public func confettiTheme(_ theme: ConfettiTheme) -> some View {
        environment(\.confettiTheme, theme)
            .tint(theme.accent)
            .preferredColorScheme(.light)
    }
}

public struct ConfettiCard<Content: View>: View {
    private let fill: Color
    private let padding: CGFloat
    private let content: Content

    public init(
        fill: Color = ConfettiColor.white,
        padding: CGFloat = ConfettiSpacing.regular,
        @ViewBuilder content: () -> Content
    ) {
        self.fill = fill
        self.padding = padding
        self.content = content()
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: ConfettiRadius.large)
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .foregroundStyle(ConfettiColor.ink)
            .background(fill, in: shape)
            .overlay { shape.strokeBorder(ConfettiColor.line) }
    }
}

public struct ConfettiButtonStyle: ButtonStyle {
    public enum Kind: Sendable {
        case primary
        case secondary
        case tertiary
    }

    @Environment(\.confettiTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    private let kind: Kind
    private let expands: Bool

    public init(_ kind: Kind = .primary, expands: Bool = false) {
        self.kind = kind
        self.expands = expands
    }

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(ConfettiFont.label)
            .multilineTextAlignment(.center)
            .padding(.horizontal, ConfettiSpacing.regular)
            .padding(.vertical, ConfettiSpacing.small)
            .frame(
                minWidth: ConfettiSpacing.touchTarget,
                maxWidth: expands ? .infinity : nil,
                minHeight: ConfettiSpacing.touchTarget
            )
            .foregroundStyle(ink)
            .background(fill, in: RoundedRectangle(cornerRadius: ConfettiRadius.medium))
            .contentShape(Rectangle())
            .opacity(isEnabled ? (configuration.isPressed ? 0.76 : 1) : 0.48)
    }

    private var fill: Color {
        switch kind {
        case .primary: theme.accent
        case .secondary: ConfettiColor.subtle
        case .tertiary: .clear
        }
    }

    private var ink: Color {
        switch kind {
        case .primary: ConfettiColor.white
        case .secondary: ConfettiColor.ink
        case .tertiary: theme.accent
        }
    }
}

public enum ConfettiStatusTone: Sendable {
    case idea
    case selected
    case purchased
    case received

    fileprivate var fill: Color {
        switch self {
        case .idea: ConfettiColor.lavender
        case .selected: ConfettiColor.selected
        case .purchased: ConfettiColor.purchased
        case .received: ConfettiColor.received
        }
    }

    fileprivate var ink: Color {
        switch self {
        case .idea: ConfettiColor.purple
        case .selected: ConfettiColor.ochre
        case .purchased: ConfettiColor.purchasedInk
        case .received: ConfettiColor.green
        }
    }
}

public struct ConfettiStatusPill: View {
    private let title: String
    private let tone: ConfettiStatusTone

    public init(title: String, tone: ConfettiStatusTone) {
        self.title = title
        self.tone = tone
    }

    public var body: some View {
        Text(title)
            .font(ConfettiFont.caption)
            .foregroundStyle(tone.ink)
            .padding(.horizontal, ConfettiSpacing.small)
            .padding(.vertical, ConfettiSpacing.tiny)
            .background(tone.fill, in: Capsule())
    }
}

/// Decorates a nearby name. A button containing only the avatar needs its own accessibility label.
public struct ConfettiAvatar: View {
    private let name: String
    private let photoURL: URL?
    private let sticker: String?
    private let size: CGFloat
    private let fill: Color?

    public init(
        name: String,
        photoURL: URL? = nil,
        sticker: String? = nil,
        size: CGFloat = 56,
        fill: Color? = nil
    ) {
        self.name = name
        self.photoURL = photoURL
        self.sticker = sticker
        self.size = size
        self.fill = fill
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: size * 0.36)
        SwiftUI.Group {
            if let photoURL {
                AsyncImage(url: photoURL) { phase in
                    if let image = phase.image {
                        image.resizable().scaledToFill()
                    } else {
                        fallback
                    }
                }
            } else {
                fallback
            }
        }
        .frame(width: size, height: size)
        .background(fill ?? paletteFill)
        .clipShape(shape)
        .accessibilityHidden(true)
    }

    private var fallback: some View {
        let initial = name.first(where: \.isLetter).map { String($0).uppercased() } ?? "?"
        let glyph = sticker.flatMap { $0.isEmpty ? nil : $0 } ?? initial
        return Text(glyph)
            .font(.system(size: size * 0.53))
            .foregroundStyle(ConfettiColor.ink)
            .lineLimit(1)
            .minimumScaleFactor(0.5)
    }

    private var paletteFill: Color {
        let palette = [ConfettiColor.pink, ConfettiColor.mint, ConfettiColor.butter, ConfettiColor.blue]
        let slot = Int(name.unicodeScalars.first?.value ?? 0) % palette.count
        return palette[slot]
    }
}

public struct ConfettiSectionHeader: View {
    private let title: String
    private let subtitle: String?

    public init(_ title: String, subtitle: String? = nil) {
        self.title = title
        self.subtitle = subtitle
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: ConfettiSpacing.tiny) {
            Text(title)
                .font(ConfettiFont.heading)
                .foregroundStyle(ConfettiColor.ink)
                .accessibilityAddTraits(.isHeader)
            if let subtitle {
                Text(subtitle)
                    .font(ConfettiFont.detail)
                    .foregroundStyle(ConfettiColor.muted)
            }
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

public struct ConfettiCountdownDoor: View {
    @Environment(\.confettiTheme) private var theme
    private let days: Int
    private let unit: String

    public init(days: Int, unit: String = "days to go") {
        self.days = days
        self.unit = unit
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: ConfettiRadius.door)
        VStack(spacing: 0) {
            Text(days, format: .number)
                .font(ConfettiFont.countdown)
                .monospacedDigit()
            Text(unit)
                .font(ConfettiFont.countdownLabel)
                .multilineTextAlignment(.center)
        }
        .foregroundStyle(theme.countdownInk)
        .padding(.horizontal, ConfettiSpacing.medium)
        .padding(.vertical, ConfettiSpacing.small)
        .frame(minWidth: 77, minHeight: 82)
        .background {
            let shadow = ConfettiShadow.christmasDoor
            shape.fill(theme.countdownFill)
                .shadow(
                    color: theme == .christmas ? shadow.color : .clear,
                    radius: shadow.radius, x: shadow.x, y: shadow.y
                )
        }
        .overlay {
            shape.strokeBorder(theme.countdownStroke, style: StrokeStyle(lineWidth: 2, dash: [5, 4]))
        }
        .overlay(alignment: .trailing) {
            Circle()
                .fill(theme.countdownInk)
                .frame(width: 4, height: 4)
                .padding(.trailing, 5)
                .accessibilityHidden(true)
        }
        .accessibilityElement(children: .combine)
    }
}

public struct ConfettiEmptyState: View {
    @Environment(\.confettiTheme) private var theme
    private let title: String
    private let message: String
    private let systemImage: String

    public init(title: String, message: String, systemImage: String) {
        self.title = title
        self.message = message
        self.systemImage = systemImage
    }

    public var body: some View {
        ConfettiCard(padding: ConfettiSpacing.large) {
            VStack(spacing: ConfettiSpacing.medium) {
                Image(systemName: systemImage)
                    .font(.title2)
                    .foregroundStyle(theme.accent)
                    .padding(ConfettiSpacing.medium)
                    .background(theme.accentSoft, in: RoundedRectangle(cornerRadius: ConfettiRadius.medium))
                    .accessibilityHidden(true)
                Text(title)
                    .font(ConfettiFont.heading)
                    .accessibilityAddTraits(.isHeader)
                Text(message)
                    .font(ConfettiFont.detail)
                    .foregroundStyle(ConfettiColor.muted)
            }
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .fixedSize(horizontal: false, vertical: true)
        }
    }
}
#endif
