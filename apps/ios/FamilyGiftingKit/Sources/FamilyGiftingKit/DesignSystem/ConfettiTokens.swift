// Generated from Tokens/confetti.tokens.json by Scripts/generate-tokens.py.
#if canImport(SwiftUI)
import SwiftUI

public enum ConfettiColor {
    private static func color(_ red: Double, _ green: Double, _ blue: Double, _ alpha: Double) -> Color {
        Color(.sRGB, red: red / 255, green: green / 255, blue: blue / 255, opacity: alpha / 255)
    }

    public static var paper: Color { color(250, 247, 240, 255) }
    public static var ink: Color { color(35, 36, 66, 255) }
    public static var muted: Color { color(104, 103, 120, 255) }
    public static var white: Color { color(255, 255, 255, 255) }
    public static var whiteHalf: Color { color(255, 255, 255, 128) }
    public static var clear: Color { color(0, 0, 0, 0) }
    public static var line: Color { color(230, 227, 219, 255) }
    public static var subtle: Color { color(236, 233, 223, 255) }
    public static var cobalt: Color { color(53, 77, 232, 255) }
    public static var blue: Color { color(226, 231, 255, 255) }
    public static var pink: Color { color(255, 209, 223, 255) }
    public static var butter: Color { color(255, 223, 112, 255) }
    public static var mint: Color { color(199, 233, 217, 255) }
    public static var green: Color { color(35, 100, 72, 255) }
    public static var lavender: Color { color(233, 231, 252, 255) }
    public static var purple: Color { color(77, 67, 139, 255) }
    public static var selected: Color { color(255, 240, 180, 255) }
    public static var ochre: Color { color(112, 80, 0, 255) }
    public static var purchased: Color { color(220, 228, 255, 255) }
    public static var purchasedInk: Color { color(41, 67, 167, 255) }
    public static var received: Color { color(206, 238, 221, 255) }
    public static var cranberry: Color { color(190, 36, 73, 255) }
    public static var christmasPaper: Color { color(255, 246, 237, 255) }
    public static var christmasAccentSoft: Color { color(255, 224, 230, 255) }
    public static var christmasDoor: Color { color(255, 245, 223, 255) }
    public static var christmasDoorInk: Color { color(174, 36, 68, 255) }
    public static var christmasDoorStroke: Color { color(220, 128, 146, 255) }
    public static var christmasDoorShadow: Color { color(133, 23, 53, 255) }
}

public enum ConfettiTheme: String, Sendable {
    case everyday
    case christmas

    public var paper: Color {
        switch self {
        case .everyday: ConfettiColor.paper
        case .christmas: ConfettiColor.christmasPaper
        }
    }

    public var accent: Color {
        switch self {
        case .everyday: ConfettiColor.cobalt
        case .christmas: ConfettiColor.cranberry
        }
    }

    public var accentSoft: Color {
        switch self {
        case .everyday: ConfettiColor.blue
        case .christmas: ConfettiColor.christmasAccentSoft
        }
    }

    public var birthdayFill: Color {
        switch self {
        case .everyday: ConfettiColor.butter
        case .christmas: ConfettiColor.mint
        }
    }

    public var brandBackground: Color {
        switch self {
        case .everyday: ConfettiColor.pink
        case .christmas: ConfettiColor.mint
        }
    }

    public var countdownFill: Color {
        switch self {
        case .everyday: ConfettiColor.clear
        case .christmas: ConfettiColor.christmasDoor
        }
    }

    public var countdownInk: Color {
        switch self {
        case .everyday: ConfettiColor.white
        case .christmas: ConfettiColor.christmasDoorInk
        }
    }

    public var countdownStroke: Color {
        switch self {
        case .everyday: ConfettiColor.whiteHalf
        case .christmas: ConfettiColor.christmasDoorStroke
        }
    }
}

public enum ConfettiFont {
    public static var display: Font {
        .custom("Montserrat-Bold", size: 29, relativeTo: .largeTitle)
    }
    public static var heading: Font {
        .custom("Montserrat-Bold", size: 18, relativeTo: .title2)
    }
    public static var subheading: Font {
        .custom("Montserrat-Bold", size: 16, relativeTo: .headline)
    }
    public static var body: Font {
        .custom("OpenSans", size: 16, relativeTo: .body)
    }
    public static var detail: Font {
        .custom("OpenSans", size: 14, relativeTo: .subheadline)
    }
    public static var caption: Font {
        .custom("OpenSans", size: 13, relativeTo: .caption)
    }
    public static var label: Font {
        .custom("Montserrat-Bold", size: 13, relativeTo: .subheadline)
    }
    public static var countdown: Font {
        .custom("Montserrat-Bold", size: 40, relativeTo: .largeTitle)
    }
    public static var countdownLabel: Font {
        .custom("OpenSans", size: 12, relativeTo: .caption)
    }
}

public enum ConfettiSpacing {
    public static let tiny: CGFloat = 4
    public static let small: CGFloat = 8
    public static let medium: CGFloat = 12
    public static let regular: CGFloat = 16
    public static let roomy: CGFloat = 20
    public static let large: CGFloat = 24
    public static let section: CGFloat = 32
    public static let wide: CGFloat = 40
    public static let spacious: CGFloat = 48
    public static let touchTarget: CGFloat = 44
}

public enum ConfettiRadius {
    public static let small: CGFloat = 8
    public static let medium: CGFloat = 15
    public static let large: CGFloat = 20
    public static let xLarge: CGFloat = 26
    public static let xxLarge: CGFloat = 30
    public static let xxxLarge: CGFloat = 36
    public static let door: CGFloat = 17
}

public struct ConfettiShadow: Sendable {
    public let color: Color
    public let radius: CGFloat
    public let x: CGFloat
    public let y: CGFloat

    public static var low: Self {
        Self(
            color: ConfettiColor.ink.opacity(0.04),
            radius: 0, x: 0, y: 2
        )
    }

    public static var medium: Self {
        Self(
            color: ConfettiColor.ink.opacity(0.1),
            radius: 24, x: 0, y: 8
        )
    }

    public static var high: Self {
        Self(
            color: ConfettiColor.ink.opacity(0.19),
            radius: 80, x: 0, y: 25
        )
    }

    public static var christmasDoor: Self {
        Self(
            color: ConfettiColor.christmasDoorShadow.opacity(1),
            radius: 0, x: 4, y: 5
        )
    }
}
#endif
