// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "FamilyGiftingKit",
    platforms: [.iOS(.v26), .macOS(.v14)],
    products: [
        .library(name: "FamilyGiftingKit", targets: ["FamilyGiftingKit"])
    ],
    targets: [
        .target(name: "FamilyGiftingKit", resources: [.process("Fixtures/Data")]),
        .testTarget(name: "FamilyGiftingKitTests", dependencies: ["FamilyGiftingKit"])
    ],
    swiftLanguageModes: [.v6]
)
