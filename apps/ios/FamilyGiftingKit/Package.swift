// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "FamilyGiftingKit",
    platforms: [.iOS(.v26), .macOS(.v14)],
    products: [
        .library(name: "FamilyGiftingKit", targets: ["FamilyGiftingKit"]),
        .executable(name: "fg-smoke", targets: ["FGSmoke"])
    ],
    targets: [
        .target(name: "FamilyGiftingKit", resources: [.process("Fixtures/Data")]),
        .executableTarget(name: "FGSmoke", dependencies: ["FamilyGiftingKit"]),
        .testTarget(name: "FamilyGiftingKitTests", dependencies: ["FamilyGiftingKit"])
    ],
    swiftLanguageModes: [.v6]
)
