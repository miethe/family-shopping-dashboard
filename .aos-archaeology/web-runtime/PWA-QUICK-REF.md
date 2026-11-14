# PWA Quick Reference

## Quick Test Checklist

### Local Development
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Open in browser
open http://localhost:3000
```

### iOS Safari Testing
1. Open http://localhost:3000 (or production URL)
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. Launch from home screen icon

### Android Chrome Testing
1. Open in Chrome
2. Look for install banner (or Menu → "Add to Home Screen")
3. Install app
4. Launch from home screen

### Desktop Chrome DevTools
```
1. Open DevTools (F12)
2. Application tab
3. Check:
   - Manifest ✓
   - Service Workers ✓
   - Icons ✓
4. Lighthouse → PWA audit
```

## File Locations

```
apps/web/public/
├── manifest.json              # PWA config
├── sw.js                      # Service worker
├── apple-touch-icon.png       # iOS 180x180
└── icons/
    ├── icon-180.png          # iOS 180x180
    ├── icon-192.png          # Android 192x192
    └── icon-512.png          # Android 512x512
```

## Key URLs

- **Manifest**: http://localhost:3000/manifest.json
- **Service Worker**: http://localhost:3000/sw.js
- **Icons**: http://localhost:3000/icons/icon-*.png

## Expected Behavior

### iOS
- "Add to Home Screen" option in Safari share menu
- App opens in standalone mode (no Safari UI)
- Theme color in status bar
- Icon on home screen

### Android
- Install prompt appears
- App opens in standalone window
- Theme color in status bar
- Icon on home screen

### Offline
- Dashboard cached after first visit
- Works without network connection
- Network-first, cache fallback

## Configuration Quick Edit

### Change Theme Color
Edit `manifest.json` and `app/layout.tsx`:
```json
"theme_color": "#3b82f6"  // Change to your color
```

### Change App Name
Edit `manifest.json`:
```json
"name": "Your App Name",
"short_name": "YourApp"
```

### Change Start URL
Edit `manifest.json`:
```json
"start_url": "/your-route"
```

## Regenerate Icons

```bash
# Edit icon design in scripts/generate-icons.js
code scripts/generate-icons.js

# Run generator
node scripts/generate-icons.js

# Convert SVG to PNG (with ImageMagick)
cd public/icons
magick icon-180.svg icon-180.png
magick icon-192.svg icon-192.png
magick icon-512.svg icon-512.png
```

## Troubleshooting

### "Add to Home Screen" not showing
- ✓ Must be HTTPS (or localhost)
- ✓ Check manifest.json loads
- ✓ Clear Safari cache
- ✓ Check browser console for errors

### Service Worker not registering
- ✓ Must be production build
- ✓ Must be HTTPS (or localhost)
- ✓ Check Application tab in DevTools
- ✓ Verify sw.js loads without errors

### Icons not showing
- ✓ Check icon paths in manifest.json
- ✓ Verify icons are PNG format
- ✓ Check file sizes match manifest
- ✓ Clear browser cache

## Production Deployment

```bash
# 1. Build
pnpm build

# 2. Deploy to HTTPS endpoint (K8s homelab)
kubectl apply -f ../../k8s/web-deployment.yaml

# 3. Test on devices
# - iOS Safari: https://your-domain.com
# - Android Chrome: https://your-domain.com

# 4. Verify in production
# - Check manifest loads
# - Test "Add to Home Screen"
# - Test offline mode
# - Run Lighthouse audit
```

## Metrics

**Bundle Size Impact**: ~2 KB (service worker + manifest)
**Icon Size**: ~7 KB total (180+192+512 PNG)
**First Load JS**: No change (PWA files served statically)

## Status

- [x] Manifest created
- [x] Icons generated (180, 192, 512)
- [x] Service worker implemented
- [x] Apple meta tags added
- [x] Build successful
- [ ] **TODO**: Test on iOS device
- [ ] **TODO**: Test on Android device
- [ ] **TODO**: Verify in production (HTTPS)

---

**See full documentation**: [PWA.md](./PWA.md)
