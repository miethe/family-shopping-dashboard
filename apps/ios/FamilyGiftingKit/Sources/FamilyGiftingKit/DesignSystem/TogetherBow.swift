#if canImport(SwiftUI)
import SwiftUI

/// The 96-unit Together Bow geometry from apps/web/components/ui/BrandMark.tsx.
public struct TogetherBow: View {
    @Environment(\.confettiTheme) private var theme
    private let size: CGFloat
    private let icon: Bool

    public init(size: CGFloat = 35, icon: Bool = false) {
        self.size = size
        self.icon = icon
    }

    public var body: some View {
        let accent = theme.accent
        let background = theme.brandBackground

        Canvas { context, bounds in
            let scale = bounds.width / 96
            if icon {
                let backgroundPath = Path(
                    roundedRect: CGRect(origin: .zero, size: bounds),
                    cornerRadius: 23 * scale
                )
                context.fill(backgroundPath, with: .color(background))
            }

            let markScale = icon ? scale * 0.7916667 : scale
            let inset = icon ? 10 * scale : 0
            let transform = CGAffineTransform(a: markScale, b: 0, c: 0, d: markScale, tx: inset, ty: inset)
            context.fill(Self.bow.applying(transform), with: .color(accent))
            context.fill(Self.ribbon.applying(transform), with: .color(ConfettiColor.butter))
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }

    private static var bow: Path {
        var mark = Path()
        mark.addEllipse(in: CGRect(x: 20, y: 10, width: 18, height: 18))
        mark.addEllipse(in: CGRect(x: 58, y: 10, width: 18, height: 18))

        mark.move(to: CGPoint(x: 12, y: 46))
        mark.addCurve(to: CGPoint(x: 48, y: 41), control1: CGPoint(x: 12, y: 25), control2: CGPoint(x: 34, y: 23))
        mark.addCurve(to: CGPoint(x: 84, y: 46), control1: CGPoint(x: 62, y: 23), control2: CGPoint(x: 84, y: 25))
        mark.addLine(to: CGPoint(x: 84, y: 53))
        mark.addLine(to: CGPoint(x: 12, y: 53))
        mark.closeSubpath()

        mark.move(to: CGPoint(x: 17, y: 60))
        mark.addLine(to: CGPoint(x: 79, y: 60))
        mark.addLine(to: CGPoint(x: 79, y: 78))
        mark.addRelativeArc(center: CGPoint(x: 72, y: 78), radius: 7, startAngle: .zero, delta: .degrees(90))
        mark.addLine(to: CGPoint(x: 24, y: 85))
        mark.addRelativeArc(center: CGPoint(x: 24, y: 78), radius: 7, startAngle: .degrees(90), delta: .degrees(90))
        mark.closeSubpath()
        return mark
    }

    private static var ribbon: Path {
        Path(CGRect(x: 42, y: 60, width: 12, height: 25))
    }
}
#endif
