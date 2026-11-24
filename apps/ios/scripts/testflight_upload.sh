#!/bin/bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: testflight_upload.sh --version VERSION --build BUILD --output-dir DIR [--dry-run] [--skip-upload]
       [--key-path PATH] [--key-id ID] [--issuer-id ID] [--team-id ID]
Credentials may instead be supplied through ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID and ASC_TEAM_ID.
The output directory is dedicated to this run: its archive, export and receipt are replaced.
USAGE
}
version='' build='' output='' key_path=${ASC_KEY_PATH:-} key_id=${ASC_KEY_ID:-} issuer_id=${ASC_ISSUER_ID:-} team_id=${ASC_TEAM_ID:-}
dry_run=0 skip_upload=0
while (($#)); do
  case "$1" in
    --version|--build|--output-dir|--key-path|--key-id|--issuer-id|--team-id)
      (($# >= 2)) || { usage >&2; exit 2; }
      case "$1" in
        --version) version=$2;; --build) build=$2;; --output-dir) output=$2;;
        --key-path) key_path=$2;; --key-id) key_id=$2;; --issuer-id) issuer_id=$2;; --team-id) team_id=$2;;
      esac
      shift 2;;
    --dry-run) dry_run=1; shift;; --skip-upload) skip_upload=1; shift;;
    -h|--help) usage; exit 0;; *) usage >&2; exit 2;;
  esac
done
[[ -n $version && -n $build && -n $output && $output = /* && $output != / ]] || { usage >&2; exit 2; }
if (( ! dry_run )); then
  [[ -n $key_path && -f $key_path && -n $key_id && -n $issuer_id && -n $team_id ]] || { echo 'All four ASC credentials and an existing key file are required.' >&2; exit 2; }
fi
script_dir=$(cd "$(dirname "$0")" && pwd)
ios_dir=$(cd "$script_dir/.." && pwd)
archive="$output/FamilyGifting.xcarchive"
export_dir="$output/export"
receipt="$output/receipt.json"
options="$output/ExportOptions.plist"
if (( dry_run )); then
  printf 'Would generate project, archive FamilyGifting Release (%s / %s), verify app and extensions, and %s. Authentication arguments: <redacted>.\n' "$version" "$build" "$([[ $skip_upload = 1 ]] && printf 'skip export' || printf 'export for upload')"
  exit 0
fi
mkdir -p "$output"
rm -rf -- "$archive" "$export_dir"
rm -f -- "$receipt" "$options"
# Do not echo xcodebuild output: its command invocation can contain authentication values.
run_quietly() {
  local label=$1; shift
  if ! "$@" > /dev/null 2>&1; then
    printf '%s failed (output suppressed to protect credentials).\n' "$label" >&2
    exit 1
  fi
}
(cd "$ios_dir" && xcodegen generate)
auth=(-authenticationKeyPath "$key_path" -authenticationKeyID "$key_id" -authenticationKeyIssuerID "$issuer_id" -allowProvisioningUpdates)
run_quietly archive xcodebuild -project "$ios_dir/FamilyGifting.xcodeproj" -scheme FamilyGifting -configuration Release -destination 'generic/platform=iOS' -archivePath "$archive" "MARKETING_VERSION=$version" "CURRENT_PROJECT_VERSION=$build" "DEVELOPMENT_TEAM=$team_id" "${auth[@]}" archive
app="$archive/Products/Applications/FamilyGifting.app"
python3 - "$app" "$version" "$build" "$receipt" <<'PY'
import json, pathlib, plistlib, sys
app, version, build, receipt = sys.argv[1:]
app = pathlib.Path(app)
paths = [app / 'Info.plist', app / 'PlugIns/CountdownWidget.appex/Info.plist', app / 'PlugIns/ShareIdea.appex/Info.plist']
actual = {}
for path in paths:
    try:
        with path.open('rb') as f:
            info = plistlib.load(f)
        v, b = info['CFBundleShortVersionString'], info['CFBundleVersion']
    except (OSError, ValueError, KeyError) as exc:
        sys.exit(f'Invalid archived bundle {path.name}: {exc}')
    if (v, b) != (version, build):
        sys.exit(f'Archived bundle {path.parent.name} version/build {v}/{b} does not match {version}/{build}')
    actual[path.parent.name] = {'version': v, 'build': b}
with open(receipt, 'w', encoding='utf-8') as f:
    json.dump({'bundles': actual, 'upload': 'not_attempted'}, f, indent=2)
    f.write('\n')
PY
if (( skip_upload )); then
  echo 'Archive verified; upload skipped.'
  exit 0
fi
python3 - "$options" "$team_id" <<'PY'
import plistlib, sys
with open(sys.argv[1], 'wb') as f:
    plistlib.dump({'method': 'app-store-connect', 'destination': 'upload', 'teamID': sys.argv[2], 'testFlightInternalTestingOnly': True, 'manageAppVersionAndBuildNumber': False}, f)
PY
run_quietly export xcodebuild -exportArchive -archivePath "$archive" -exportPath "$export_dir" -exportOptionsPlist "$options" "${auth[@]}"
python3 - "$receipt" <<'PY'
import json, sys
path = sys.argv[1]
with open(path, encoding='utf-8') as f:
    receipt = json.load(f)
receipt['upload'] = 'submitted'
with open(path, 'w', encoding='utf-8') as f:
    json.dump(receipt, f, indent=2)
    f.write('\n')
PY
echo 'Archive verified and upload submitted.'
