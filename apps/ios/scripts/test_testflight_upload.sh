#!/bin/bash
set -euo pipefail
base=${TMPDIR:?Set TMPDIR to the designated scratch directory}
[[ -d $base ]] || { echo 'Scratch directory is unavailable.' >&2; exit 1; }
work=$(mktemp -d "$base/fg-upload-test.XXXXXX")
trap 'rm -rf -- "$work"' EXIT
mkdir -p "$work/bin" "$work/output"
export TEST_WORK="$work"
cat > "$work/bin/xcodegen" <<'SH'
#!/bin/bash
exit 0
SH
cat > "$work/bin/xcodebuild" <<'SH'
#!/bin/bash
set -euo pipefail
printf '%s\n' "$*" >> "$TEST_WORK/calls"
if [[ " $* " == *' archive '* ]]; then
  while (($#)); do
    if [[ $1 == -archivePath ]]; then archive=$2; shift; fi
    shift
  done
  python3 - "$archive" <<'PY'
import os, pathlib, plistlib, sys
app = pathlib.Path(sys.argv[1]) / 'Products/Applications/FamilyGifting.app'
for name in ('', 'PlugIns/CountdownWidget.appex', 'PlugIns/ShareIdea.appex'):
    path = app / name
    path.mkdir(parents=True, exist_ok=True)
    with (path / 'Info.plist').open('wb') as f:
        plistlib.dump({'CFBundleShortVersionString': '2.3.4', 'CFBundleVersion': '17' if not (os.environ.get('MISMATCH') and 'ShareIdea' in name) else '18'}, f)
PY
fi
SH
chmod +x "$work/bin/"*
export PATH="$work/bin:$PATH"
touch "$work/key"
export ASC_KEY_PATH="$work/key" ASC_KEY_ID=private_key_id ASC_ISSUER_ID=private_issuer ASC_TEAM_ID=private_team
script=$(cd "$(dirname "$0")" && pwd)/testflight_upload.sh
if "$script" --key-id forbidden --version 2.3.4 --build 17 --output-dir "$work/output" --dry-run > /dev/null 2>&1; then exit 1; fi
args=(--version 2.3.4 --build 17 --output-dir "$work/output")
"$script" "${args[@]}" > "$work/result"
[[ $(wc -l < "$work/calls" | tr -d ' ') == 2 ]]
[[ $(grep -c -- '-allowProvisioningUpdates' "$work/calls") == 2 ]]
[[ $(grep -c -- '-authenticationKeyPath' "$work/calls") == 2 ]]
python3 - "$work/output" <<'PY'
import json, pathlib, plistlib, sys
p = pathlib.Path(sys.argv[1])
with (p / 'ExportOptions.plist').open('rb') as f: options = plistlib.load(f)
assert options['method'] == 'app-store-connect' and options['destination'] == 'upload'
assert options['testFlightInternalTestingOnly'] is True and options['manageAppVersionAndBuildNumber'] is False
with (p / 'receipt.json').open() as f: receipt = json.load(f)
assert receipt['upload'] == 'submitted' and len(receipt['bundles']) == 3
assert all(x == {'version': '2.3.4', 'build': '17'} for x in receipt['bundles'].values())
PY
if grep -E 'private_key_id|private_issuer|private_team|/key' "$work/result"; then exit 1; fi
: > "$work/calls"
"$script" "${args[@]}" --skip-upload > /dev/null
[[ $(wc -l < "$work/calls" | tr -d ' ') == 1 ]]
[[ ! -e "$work/output/ExportOptions.plist" ]]
MISMATCH=1 "$script" "${args[@]}" --skip-upload > /dev/null 2>&1 && { echo 'Mismatch accepted' >&2; exit 1; }
[[ ! -e "$work/output/receipt.json" ]]
: > "$work/calls"
"$script" "${args[@]}" --dry-run > "$work/dry"
[[ ! -s "$work/calls" ]]
if grep -E 'private_key_id|private_issuer|private_team|/key' "$work/dry"; then exit 1; fi
echo 'TestFlight upload tests passed.'
