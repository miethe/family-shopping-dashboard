#!/usr/bin/env python3
"""Render the native Confetti tokens, or verify the committed Swift is current."""

import argparse
import json
import re
from pathlib import Path


IOS = Path(__file__).resolve().parents[1]
SOURCE = IOS / "Tokens/confetti.tokens.json"
OUTPUT = IOS / "FamilyGiftingKit/Sources/FamilyGiftingKit/DesignSystem/ConfettiTokens.swift"


def render_color(value):
    if not re.fullmatch(r"#[\da-fA-F]{6}([\da-fA-F]{2})?", value, flags=re.ASCII):
        raise ValueError(f"Expected an RGB or RGBA hex color, got {value!r}")
    components = [int(value[index:index + 2], 16) for index in range(1, len(value), 2)]
    if len(components) == 3:
        components.append(255)
    return f"color({', '.join(map(str, components))})"


def render(tokens):
    lines = [
        "// Generated from Tokens/confetti.tokens.json by Scripts/generate-tokens.py.",
        "#if canImport(SwiftUI)",
        "import SwiftUI",
        "",
        "public enum ConfettiColor {",
        "    private static func color(_ red: Double, _ green: Double, _ blue: Double, _ alpha: Double) -> Color {",
        "        Color(.sRGB, red: red / 255, green: green / 255, blue: blue / 255, opacity: alpha / 255)",
        "    }",
        "",
    ]
    for name, value in tokens["colors"].items():
        lines.append(f"    public static var {name}: Color {{ {render_color(value)} }}")
    lines.extend(["}", "", "public enum ConfettiTheme: String, Sendable {"])

    themes = tokens["themes"]
    for theme in themes:
        lines.append(f"    case {theme}")
    properties = next(iter(themes.values())).keys()
    if any(colors.keys() != properties for colors in themes.values()):
        raise ValueError("All themes must define the same properties")
    for property_name in properties:
        lines.extend(["", f"    public var {property_name}: Color {{", "        switch self {"])
        for theme, palette in themes.items():
            color = palette[property_name]
            if color not in tokens["colors"]:
                raise ValueError(f"Unknown {theme}.{property_name} color: {color}")
            lines.append(f"        case .{theme}: ConfettiColor.{color}")
        lines.extend(["        }", "    }"])
    lines.extend(["}", "", "public enum ConfettiFont {"])
    for name, style in tokens["type"].items():
        family = json.dumps(tokens["fontFamilies"][style["family"]])
        lines.extend([
            f"    public static var {name}: Font {{",
            f"        .custom({family}, size: {style['size']}, relativeTo: .{style['relativeTo']})",
            "    }",
        ])
    lines.append("}")

    for name, group in [("ConfettiSpacing", "spacing"), ("ConfettiRadius", "radii")]:
        lines.extend(["", f"public enum {name} {{"])
        for token, value in tokens[group].items():
            lines.append(f"    public static let {token}: CGFloat = {value}")
        lines.append("}")

    lines.extend([
        "",
        "public struct ConfettiShadow: Sendable {",
        "    public let color: Color",
        "    public let radius: CGFloat",
        "    public let x: CGFloat",
        "    public let y: CGFloat",
    ])
    for name, shadow in tokens["shadows"].items():
        if shadow["color"] not in tokens["colors"]:
            raise ValueError(f"Unknown {name} shadow color: {shadow['color']}")
        lines.extend([
            "",
            f"    public static var {name}: Self {{",
            "        Self(",
            f"            color: ConfettiColor.{shadow['color']}.opacity({shadow['opacity']}),",
            f"            radius: {shadow['radius']}, x: {shadow['x']}, y: {shadow['y']}",
            "        )",
            "    }",
        ])
    lines.extend(["}", "#endif", ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when generated Swift needs updating")
    args = parser.parse_args()
    generated = render(json.loads(SOURCE.read_text(encoding="utf-8")))
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != generated:
            parser.exit(1, f"Run {Path(__file__).name} to update {OUTPUT.name}.\n")
    else:
        OUTPUT.write_text(generated, encoding="utf-8")


if __name__ == "__main__":
    main()
