# PWA Setup Guide

## Overview

The Family Gifting Dashboard is configured as a Progressive Web App (PWA) with full support for iOS "Add to Home Screen" functionality.

## Files Created

### Configuration

- **`/public/manifest.json`** - PWA manifest with app metadata and icon references
- **`/public/sw.js`** - Service worker for offline caching (network-first strategy)
- **`/components/pwa-register.tsx`** - Client component for service worker registration

### Icons

All icons feature a blue gradient background with a white gift box icon:

- **`/public/icons/icon-180.png`** - 180x180px Apple Touch Icon
- **`/public/icons/icon-192.png`** - 192x192px Android icon
- **`/public/icons/icon-512.png`** - 512x512px Android splash screen
- **`/public/apple-touch-icon.png`** - Copy of 180px icon for iOS compatibility

### Metadata

Updated **`/app/layout.tsx`** with:
- PWA manifest reference
- Apple-specific meta tags (`appleWebApp` configuration)
- Icon references for all platforms
- Viewport configuration with iOS safe area support

## Features

### iOS Support

- **Add to Home Screen**: Full support for iOS Safari
- **Standalone Mode**: Opens without Safari UI
- **Status Bar Styling**: Matches app theme
- **Safe Areas**: Viewport configured with `viewportFit: 'cover'`
- **Touch Icon**: Dedicated 180x180 Apple touch icon

### Android Support

- **Manifest**: Standard PWA manifest.json
- **Icons**: 192x192 and 512x512 icons with maskable support
- **Theme Color**: Blue (#3b82f6) status bar

### Offline Support

- **Service Worker**: Network-first caching strategy
- **Static Cache**: Dashboard and critical assets cached on install
- **Fallback**: Serves cached content when offline
- **Auto-Update**: Checks for service worker updates

## Testing

### On iOS (iPhone/iPad)

1. **Build and serve the app** (production mode required):
   ```bash
   pnpm build
   pnpm start
   # Or deploy to your homelab
   ```

2. **Open in Safari**:
   - Navigate to the dashboard
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Verify the app icon and name appear correctly
   - Tap "Add"

3. **Launch from Home Screen**:
   - Tap the app icon
   - App should open in standalone mode (no Safari UI)
   - Status bar should match theme color
   - Check that viewport and safe areas work correctly

4. **Test Offline**:
   - Enable Airplane mode
   - Open the app from home screen
   - Verify cached pages load

### On Android

1. **Build and serve the app**:
   ```bash
   pnpm build
   pnpm start
   ```

2. **Open in Chrome**:
   - Navigate to the dashboard
   - Tap the menu (three dots)
   - Select "Add to Home Screen" or "Install app"
   - Verify icon and name

3. **Launch from Home Screen**:
   - Tap the app icon
   - Verify standalone mode
   - Check theme color in status bar

### In Desktop Chrome

1. **Open Chrome DevTools**:
   - Navigate to Application tab
   - Check "Manifest" section
   - Verify all icon sizes are listed
   - Check service worker registration

2. **PWA Installability**:
   - Look for install prompt in address bar
   - Click to install
   - Verify app opens in standalone window

3. **Lighthouse Audit**:
   ```bash
   # In DevTools > Lighthouse
   # Select "Progressive Web App"
   # Run audit
   # Should score 100 for PWA criteria
   ```

## Configuration

### Manifest Settings

Edit `/public/manifest.json` to customize:

```json
{
  "name": "Family Gifting Dashboard",        // Full app name
  "short_name": "Gifting",                    // Home screen name
  "description": "Plan and coordinate family gifts together",
  "start_url": "/dashboard",                  // Initial route
  "display": "standalone",                    // No browser UI
  "theme_color": "#3b82f6",                   // Status bar color
  "background_color": "#ffffff",              // Splash screen background
  "orientation": "portrait-primary"           // Preferred orientation
}
```

### Apple Meta Tags

Edit `/app/layout.tsx` metadata:

```typescript
appleWebApp: {
  capable: true,                 // Enable standalone mode
  statusBarStyle: 'default',     // Status bar appearance
  title: 'Gifting',              // App title
}
```

### Viewport Configuration

```typescript
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,          // Prevent zoom (app-like behavior)
  themeColor: '#3b82f6',        // Status bar color
  viewportFit: 'cover',         // Use full screen including safe areas
}
```

### Service Worker Caching

Edit `/public/sw.js` to customize:

```javascript
const CACHE_NAME = 'family-gifting-v1';
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/manifest.json',
  // Add more routes to cache
];
```

## Regenerating Icons

To regenerate icons with updated design:

```bash
# Edit the icon generator script
code scripts/generate-icons.js

# Run the generator
node scripts/generate-icons.js

# Convert SVG to PNG (requires ImageMagick)
cd public/icons
magick icon-180.svg icon-180.png
magick icon-192.svg icon-192.png
magick icon-512.svg icon-512.png
```

Or install canvas for direct PNG generation:

```bash
pnpm add -D canvas
node scripts/generate-icons.js
```

## Troubleshooting

### "Add to Home Screen" not showing on iOS

- **Check HTTPS**: PWA requires HTTPS (except localhost)
- **Verify manifest**: Check `/manifest.json` loads without errors
- **Clear Safari cache**: Settings > Safari > Clear History and Website Data
- **Check console**: Look for manifest or icon errors

### Service Worker not registering

- **Production only**: Service worker only registers in production (`NODE_ENV=production`)
- **HTTPS required**: Service workers require HTTPS (except localhost)
- **Check scope**: Verify service worker scope matches app routes
- **Console errors**: Check browser console for registration errors

### Icons not displaying correctly

- **File paths**: Verify all icon paths in manifest.json are correct
- **Image format**: Ensure icons are PNG format
- **Size**: Verify icon dimensions match manifest sizes
- **CORS**: Check icons are served from same origin

### Offline mode not working

- **Wait for cache**: First visit must complete before offline works
- **Check cache list**: Verify routes in `STATIC_CACHE` array
- **Network tab**: Use DevTools Network tab to verify cache hits
- **Service worker active**: Check Application > Service Workers in DevTools

## Best Practices

1. **Always test on real devices**: Emulators don't fully support PWA features
2. **Use HTTPS in production**: Required for service workers and PWA features
3. **Keep cache size small**: Only cache critical assets
4. **Version your cache**: Update `CACHE_NAME` when deploying changes
5. **Test offline thoroughly**: Verify all critical flows work offline
6. **Monitor service worker updates**: Implement update notifications if needed

## Deployment Checklist

- [ ] Build app in production mode (`pnpm build`)
- [ ] Deploy to HTTPS endpoint
- [ ] Test on iOS Safari (iPhone)
- [ ] Test on Android Chrome
- [ ] Verify "Add to Home Screen" works
- [ ] Test standalone mode (no browser UI)
- [ ] Verify theme colors match
- [ ] Test offline mode
- [ ] Run Lighthouse PWA audit (score 100)
- [ ] Check service worker registration in production

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Google: Install Criteria](https://web.dev/install-criteria/)

## Next Steps

For V2, consider adding:

- **Push Notifications**: Real-time gift updates
- **Background Sync**: Sync changes when back online
- **App Shortcuts**: Quick actions from home screen icon
- **Share Target**: Share gifts to the app from other apps
- **Better Offline UX**: Offline indicator, queue pending actions

---

**Status**: FE-008 Complete
**Last Updated**: 2025-11-27
