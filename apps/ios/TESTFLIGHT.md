# Device and TestFlight handoff

1. Read `.leg-artifacts/i1/LEG-REPORT.md` for actual verification limits. Run the package and simulator tests below and inspect fixture screens before signing.
2. Copy `Config/Local.xcconfig.example` to `Config/Local.xcconfig`. Fill `DEVELOPMENT_TEAM` with the paid Apple team locally. Keep all signing settings there. Run `xcodegen generate` in `apps/ios`, then open `FamilyGifting.xcodeproj`. Automatic signing is configured in Local.xcconfig; select the paid team in Xcode and register `dev.familygifting.app` if required.
3. On the two phones, enable Developer Mode for direct Xcode testing if used. Install and test local-network permission, `/health`, registration/login, 24-hour expiry, all web fallback destinations, idea capture, foreground refresh, and large text/VoiceOver on the family LAN. This leg never contacted that network. HTTPS requires a device-trusted certificate.
4. In App Store Connect create the iOS app for this bundle ID. Set privacy disclosures for the actual server/account/gifting data, age rating, export-compliance answers, support/privacy policy URLs, and beta information. The project declares ITSAppUsesNonExemptEncryption = NO for the current system-provided encryption; verify this remains accurate for the actual app and answer any App Store Connect questions.
5. Set a unique build number in `project.yml`; regenerate. Select **Any iOS Device (arm64)** → Product → Archive (Release). Validate and Distribute through Organizer to App Store Connect. This is the first upload; none was authorized or performed here.
6. After processing, use internal testers only: the LAN-only server is unreachable by Apple’s external beta review. Add the two adults as App Store Connect internal testers with an eligible role, create an internal TestFlight group and assign the build. Install TestFlight and accept invitations. Phones must reach the private server; TestFlight does not expose the LAN publicly. Builds expire after 90 days; upload a new build before expiry.

## Offline checks

```sh
cd apps/ios
python3 Scripts/generate-tokens.py --check
cd FamilyGiftingKit
swift test -j 2
cd ..
xcodegen generate
cd ../..
xcodebuild -project apps/ios/FamilyGifting.xcodeproj -scheme FamilyGifting \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath apps/ios/.build/DerivedData build
```

SwiftPM may need `--disable-sandbox` where nested sandboxing is unsupported; that does not relax the outer workspace sandbox. Never work around a sandbox refusal of xcodebuild/simctl. Use only one xcodebuild, do not boot additional simulators or shut down another task's simulator. Fixture launch arguments: `--fixture sample`, `--fixture empty`, `--fixture christmas`, `--fixture signin`. Fixtures never use the network; web fallback screens show a connection placeholder in fixture mode.

`Scripts/refresh-openapi.py` exports the FastAPI app without lifespan startup or DB/LAN calls, using an environment with the server dependencies installed. Handwritten DTOs reference this snapshot; additions require schema fixture tests. The export script removes documentation examples before saving so arbitrary server sample names/links do not enter the public iOS fixture corpus.
