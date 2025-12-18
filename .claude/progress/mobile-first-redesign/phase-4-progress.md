---
# === PROGRESS TRACKING: PHASE 4 ===
# PWA Enhancement & Offline Support - Task orchestration for AI agents

type: progress
prd: "mobile-first-redesign"
phase: 4
title: "PWA Enhancement & Offline Support"
status: "planning"
started: null
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 6
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["frontend-developer", "nextjs-architecture-expert"]
contributors: []

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "MOB-401"
    description: "Fix PWA manifest for iOS - update manifest.json with Apple-specific fields"
    status: "pending"
    assigned_to: ["nextjs-architecture-expert"]
    dependencies: ["MOB-107"]
    estimated_effort: "1.5h"
    priority: "high"

  - id: "MOB-402"
    description: "Service worker offline caching - implement service worker for GET endpoint caching"
    status: "pending"
    assigned_to: ["frontend-developer", "nextjs-architecture-expert"]
    dependencies: ["MOB-401"]
    estimated_effort: "2.5h"
    priority: "high"

  - id: "MOB-403"
    description: "Offline indicator & read-only mode - add offline badge, disable mutations offline"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-402"]
    estimated_effort: "1.5h"
    priority: "high"

  - id: "MOB-404"
    description: "Web Push API integration - integrate Web Push for push notifications (iOS 16.4+)"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-403"]
    estimated_effort: "2h"
    priority: "high"

  - id: "MOB-405"
    description: "Install prompt & home screen support - implement install prompt for iOS/Android"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-404"]
    estimated_effort: "1.5h"
    priority: "high"

  - id: "MOB-406"
    description: "Network transition handling - detect online/offline transitions, sync queued mutations"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-403"]
    estimated_effort: "1.5h"
    priority: "high"

# Parallelization Strategy
parallelization:
  batch_1: ["MOB-401"]
  batch_2: ["MOB-402"]
  batch_3: ["MOB-403"]
  batch_4: ["MOB-404", "MOB-406"]
  batch_5: ["MOB-405"]
  critical_path: ["MOB-401", "MOB-402", "MOB-403", "MOB-404", "MOB-405"]
  estimated_total_time: "5-7 days"

# Critical Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Manifest passes web.dev validation"
    status: "pending"
  - id: "SC-2"
    description: "App installable on iOS home screen"
    status: "pending"
  - id: "SC-3"
    description: "Service worker installed and caching correctly"
    status: "pending"
  - id: "SC-4"
    description: "Offline mode: lists/gifts load from cache, no errors"
    status: "pending"
  - id: "SC-5"
    description: "Offline badge visible and clear"
    status: "pending"
  - id: "SC-6"
    description: "Mutations disabled offline with error message"
    status: "pending"
  - id: "SC-7"
    description: "Web Push API integrated, permissions requested"
    status: "pending"
  - id: "SC-8"
    description: "Install prompt shows on appropriate devices"
    status: "pending"
  - id: "SC-9"
    description: "Standalone app mode works (full-screen, status bar styled)"
    status: "pending"
  - id: "SC-10"
    description: "Offline-to-online transition smooth, mutations synced"
    status: "pending"

# Files Modified
files_modified:
  - "apps/web/public/manifest.json"
  - "apps/web/public/service-worker.ts"
  - "apps/web/app/layout.tsx"
  - "apps/web/hooks/useOffline.ts"
  - "apps/web/components/shared/offline-indicator.tsx"
  - "apps/web/hooks/usePushNotifications.ts"
---

# Mobile-First Redesign - Phase 4: PWA Enhancement & Offline Support

**Phase**: 4 of 5
**Status**: 🔵 Planning (0% complete)
**Duration**: Target 5-7 working days (can run parallel with Phases 2-3 after Phase 1)
**Owner**: frontend-developer, nextjs-architecture-expert
**Contributors**: ui-engineer-enhanced

---

## Orchestration Quick Reference

> For orchestration agents: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (First after Phase 1 complete):
- MOB-401 → `nextjs-architecture-expert` (1.5h)

**Batch 2** (Depends on MOB-401):
- MOB-402 → `frontend-developer` + `nextjs-architecture-expert` (2.5h) - **Blocked by**: MOB-401

**Batch 3** (Depends on MOB-402):
- MOB-403 → `ui-engineer-enhanced` (1.5h) - **Blocked by**: MOB-402

**Batch 4** (Can run parallel after MOB-403):
- MOB-404 → `frontend-developer` (2h) - **Blocked by**: MOB-403
- MOB-406 → `frontend-developer` (1.5h) - **Blocked by**: MOB-403

**Batch 5** (Depends on MOB-404):
- MOB-405 → `frontend-developer` (1.5h) - **Blocked by**: MOB-404

**Critical Path**: MOB-401 → MOB-402 → MOB-403 → MOB-404 → MOB-405 (10.5 hours sequential)

### Task Delegation Commands

```
# Batch 1 - Launch after Phase 1 complete (MOB-107 done)
Task("nextjs-architecture-expert", "MOB-401: Fix PWA manifest.json for iOS. Add Apple-specific fields (apple-mobile-web-app-capable, status-bar-style, icons 180x180 & 512x512). Pass web.dev validation.")

# Batch 2 - After MOB-401 complete
Task("frontend-developer nextjs-architecture-expert", "MOB-402: Implement service worker for offline caching. Cache GET endpoints (lists, gifts, persons, occasions). Use network-first for dynamic, cache-first for static. Version management.")

# Batch 3 - After MOB-402 complete
Task("ui-engineer-enhanced", "MOB-403: Add offline indicator/badge (always visible when offline). Disable mutations offline with message 'You're offline. Changes will sync when online.' Test offline mode.")

# Batch 4a - After MOB-403 complete (can start MOB-404 & MOB-406 in parallel)
Task("frontend-developer", "MOB-404: Integrate Web Push API for push notifications (iOS 16.4+, Android). Request permission on 2nd/3rd visit. Display in-app notifications. Test on real device.")

# Batch 4b - After MOB-403 complete (parallel with MOB-404)
Task("frontend-developer", "MOB-406: Detect online/offline transitions. Handle reconnection gracefully. Sync queued mutations when online. Smooth transition, no stale data. Test offline-to-online flow.")

# Batch 5 - After MOB-404 complete
Task("frontend-developer", "MOB-405: Implement install prompt. iOS <16.4: 'Add to Home Screen' flow. iOS ≥16.4: Web Install API. Android: banner. Standalone mode launches full-screen, status bar styled correctly.")
```

---

## Overview

**Phase 4 Mission**: Enable the app to work offline, be installable like a native app, and support push notifications.

**Why This Phase**: Users on poor connectivity or family members checking the app while away from WiFi need offline access. PWA installation on home screen improves accessibility. Push notifications keep users informed of budget updates.

**Scope**:
- **IN SCOPE**: PWA manifest for iOS, service worker caching strategy, offline mode indicator, mutation blocking offline, Web Push API integration, install prompts, network transition handling
- **OUT OF SCOPE**: Advanced offline write support (Phase v1.1), bidirectional sync, complex conflict resolution

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Manifest passes web.dev validation | ⏳ Pending |
| SC-2 | App installable on iOS home screen | ⏳ Pending |
| SC-3 | Service worker installed and caching correctly | ⏳ Pending |
| SC-4 | Offline mode: lists/gifts load from cache, no errors | ⏳ Pending |
| SC-5 | Offline badge visible and clear | ⏳ Pending |
| SC-6 | Mutations disabled offline with error message | ⏳ Pending |
| SC-7 | Web Push API integrated, permissions requested | ⏳ Pending |
| SC-8 | Install prompt shows on appropriate devices | ⏳ Pending |
| SC-9 | Standalone app mode works (full-screen, status bar styled) | ⏳ Pending |
| SC-10 | Offline-to-online transition smooth, mutations synced | ⏳ Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| MOB-401 | Fix PWA manifest for iOS | ⏳ | nextjs-architecture-expert | MOB-107 | 1.5h | Apple-specific fields, validation |
| MOB-402 | Service worker offline caching | ⏳ | frontend-developer, nextjs-architecture-expert | MOB-401 | 2.5h | GET endpoint caching, strategy |
| MOB-403 | Offline indicator & read-only mode | ⏳ | ui-engineer-enhanced | MOB-402 | 1.5h | Badge, disable mutations, user message |
| MOB-404 | Web Push API integration | ⏳ | frontend-developer | MOB-403 | 2h | Push notifications, permission flow |
| MOB-405 | Install prompt & home screen | ⏳ | frontend-developer | MOB-404 | 1.5h | iOS/Android install, standalone mode |
| MOB-406 | Network transition handling | ⏳ | frontend-developer | MOB-403 | 1.5h | Online/offline detection, mutation sync |

**Status Legend**: `⏳` Pending | `🔄` In Progress | `✓` Complete | `🚫` Blocked | `⚠️` At Risk

---

## Architecture Context

### Current State

**PWA Setup**:
- `manifest.json` exists but may not have iOS-specific fields
- Service worker not yet implemented (or very basic)
- No offline caching strategy
- No install prompt implemented

**API & Caching**:
- React Query manages state and caching
- Network requests are standard fetch/axios
- No offline-aware mutation handling
- No service worker integration with React Query

**Push Notifications**:
- No Web Push API integration yet
- No push notification backend/infrastructure yet
- iOS 16.4+ supports Web Push API (older requires workaround)

### Reference Patterns

**PWA Manifest Pattern** (Apple-specific):
```json
{
  "name": "Family Gifting Dashboard",
  "short_name": "Family Gifts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "scope": "/",
  "icons": [
    { "src": "/icon-180.png", "sizes": "180x180", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
  ],
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "black-translucent"
}
```

**Service Worker Caching Pattern**:
```javascript
// Cache GET requests (read-only)
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.open('v1').then((cache) => {
        return fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        }).catch(() => cache.match(event.request));
      })
    );
  }
});
```

**Offline Detection Pattern**:
```javascript
const useOffline = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return offline;
};
```

---

## Implementation Details

### Technical Approach

**Step 1: Fix PWA Manifest (MOB-401)**

Update `manifest.json` with iOS support:

1. Add Apple-specific fields:
   ```json
   {
     "apple-mobile-web-app-capable": "yes",
     "apple-mobile-web-app-status-bar-style": "black-translucent",
     "apple-mobile-web-app-title": "Family Gifts"
   }
   ```

2. Ensure correct icons:
   - 180x180px for iOS home screen (required)
   - 512x512px for Web App Manifest (required)
   - Both must be PNG, include in manifest

3. Verify via web.dev:
   - Run web.dev PWA audit
   - All checks should pass
   - Install prompt should show

4. Meta tags in HTML:
   ```html
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   ```

**Step 2: Service Worker Offline Caching (MOB-402)**

Implement service worker for offline access:

1. Create service worker file:
   - `public/service-worker.js` or `app/service-worker.ts`
   - Export for Next.js PWA plugin if available

2. Caching strategy:
   - Network-first for dynamic API calls (lists, gifts, etc.)
   - Cache-first for static assets (CSS, JS, images)
   - Cache GET endpoints for offline access
   - Block POST/PUT/DELETE offline (will implement in MOB-403)

3. Cache versioning:
   - Use versioned cache name: `v1`, `v2`, etc.
   - Invalidate old caches on update
   - Prevent serving stale data indefinitely

4. Endpoints to cache:
   - `GET /api/lists` - lists
   - `GET /api/gifts` - gifts
   - `GET /api/persons` - persons
   - `GET /api/occasions` - occasions
   - Static assets (CSS, JS, images)

5. Service worker registration:
   - Register in layout/page initialization
   - Handle updates/reloads
   - Display notification when new version available

**Step 3: Offline Indicator & Read-Only Mode (MOB-403)**

Add offline UI and mutation blocking:

1. Create offline indicator component:
   ```jsx
   // components/shared/offline-indicator.tsx
   export const OfflineIndicator = () => {
     const isOffline = useOffline();

     if (!isOffline) return null;

     return (
       <div className="bg-yellow-500 text-white px-4 py-2 text-center">
         You are offline. Changes will sync when online.
       </div>
     );
   };
   ```

2. Display offline badge:
   - Top of page (in header or below)
   - Always visible when offline
   - Clear message: "Offline" or "No Internet"
   - Optional info icon explaining implications

3. Block mutations offline:
   - Check `navigator.onLine` before POST/PUT/DELETE
   - Show error message: "You're offline. Changes will sync when online."
   - Don't submit form
   - Queue mutation locally (optional for v1)

4. Integration points:
   - Wrap mutation hooks with offline check
   - Update form validation
   - Disable submit button when offline

**Step 4: Web Push API Integration (MOB-404)**

Add push notification support:

1. Request permission:
   - Ask for notification permission on 2nd/3rd visit
   - Use `Notification.requestPermission()`
   - Graceful: handle rejection, don't force

2. Subscribe to push:
   - Get service worker registration
   - Call `serviceWorkerRegistration.pushManager.subscribe()`
   - Send subscription endpoint to backend (future)
   - Store in localStorage for reference

3. Handle push messages:
   ```javascript
   self.addEventListener('push', (event) => {
     const data = event.data.json();
     self.registration.showNotification(data.title, {
       body: data.body,
       icon: '/icon-192.png'
     });
   });
   ```

4. Click handler:
   ```javascript
   self.addEventListener('notificationclick', (event) => {
     event.notification.close();
     event.waitUntil(clients.matchAll().then((clients) => {
       // Focus existing window or open new one
     }));
   });
   ```

5. iOS 16.4+ support:
   - iOS 16.4+ supports Web Push API
   - Older iOS: no native push, can use in-app notifications only
   - Check iOS version or feature-detect

**Step 5: Install Prompt & Home Screen (MOB-405)**

Implement install-to-home-screen flow:

1. iOS <16.4 (manual flow):
   - Show prompt: "Add to Home Screen"
   - Instructions: tap share → add to home screen
   - Or use library like `pwa-installer`

2. iOS ≥16.4 (Web Install API):
   - Use `beforeinstallprompt` event
   - Show "Install" button
   - User taps, browser shows install dialog
   - Automatic

3. Android:
   - Also uses `beforeinstallprompt` event
   - Browser shows install banner
   - User accepts/rejects

4. Standalone app mode:
   - Meta tag: `<meta name="apple-mobile-web-app-capable" content="yes">`
   - Sets display mode to `standalone`
   - App launches full-screen (no address bar)
   - Status bar color matches app theme

5. Implementation:
   ```javascript
   let installPrompt;

   window.addEventListener('beforeinstallprompt', (e) => {
     installPrompt = e;
     // Show install button
   });

   installButton.addEventListener('click', () => {
     installPrompt.prompt();
     installPrompt.userChoice.then((choiceResult) => {
       if (choiceResult.outcome === 'accepted') {
         // App installed
       }
     });
   });
   ```

**Step 6: Network Transition Handling (MOB-406)**

Gracefully handle online/offline transitions:

1. Detect transitions:
   - Listen to `online` and `offline` events
   - Update UI state immediately

2. Offline → Online recovery:
   - Refetch any data that might have changed
   - Sync queued mutations (if storing offline)
   - Show success message

3. Queue mutations (optional v1):
   - Store pending mutations in localStorage
   - Retry when online
   - Or just block mutations offline (simpler for v1)

4. Error handling:
   - If mutation fails offline, show clear message
   - Don't retry endlessly
   - Let user know data will sync when online

### Known Gotchas

**Gotcha 1: Service Worker Cache Can Serve Stale Data**
- Cache doesn't expire automatically
- Old cached responses can be served indefinitely
- **Solution**: Implement cache versioning, manual cache clear, or time-based expiry

**Gotcha 2: Manifest Icons Must Be Exact Size**
- 180x180 and 512x512 are specific requirements
- Icons at wrong sizes won't work on iOS
- **Solution**: Generate icons precisely, test on actual device

**Gotcha 3: iOS <16.4 Doesn't Support Web Push API**
- Older iOS versions can't receive push notifications
- Must handle gracefully or use workaround
- **Solution**: Feature-detect, show in-app notifications for unsupported devices

**Gotcha 4: Service Worker Doesn't Install if HTTPS Not Available**
- Service workers require HTTPS (or localhost for dev)
- HTTP sites can't install service workers
- **Solution**: Ensure HTTPS in production, use localhost for local dev

**Gotcha 5: Offline Mutations Lost if Not Queued**
- If user makes changes offline and app crashes, changes are lost
- Need to persist mutations to survive app close
- **Solution**: Store in localStorage, or block mutations offline (simpler for v1)

**Gotcha 6: Push Notification Permission Hard to Recover**
- Once user rejects notification permission, can't ask again without user going to Settings
- **Solution**: Don't ask immediately, wait for 2nd-3rd visit, provide info before asking

### Development Setup

**Tools Needed**:
- Service worker development (Firefox/Chrome DevTools show service workers)
- Web Push testing (can use test servers)
- Real iOS device with iOS 16.4+ for push testing
- Lighthouse PWA audit

**Local Testing**:
```bash
# Run locally with HTTPS (for service worker testing)
npm run dev -- --ssl

# Or use ngrok for HTTPS tunnel
```

---

## Blockers

### Active Blockers

| ID | Title | Severity | Blocking | Resolution |
|----|-------|----------|----------|-----------|
| BLOCKER-401-001 | Phase 1 (MOB-107) must complete before Phase 4 begins | high | All MOB-4xx tasks | Ensure Phase 1 quality gates passed |

### Resolved Blockers

N/A (Phase 4 hasn't started)

---

## Dependencies

### External Dependencies

- **Service Worker API**: Built-in Web API
- **Web Push API**: Built-in Web API (iOS 16.4+, all modern Android)
- **Web App Manifest**: Built-in support
- **Notification API**: Built-in Web API
- **HTTPS**: Required for service workers and push notifications

### Internal Integration Points

- **React Query**: Mutation handling for offline blocking
- **API endpoints**: GET endpoints to cache
- **Layout component**: Place offline indicator
- **Service worker registration**: In app initialization

### Inter-Phase Dependencies

**Phase 4 depends on**:
- Phase 1 (MOB-107) complete

**Phases 3 and 5 can run in parallel with Phase 4** (independent):
- Phase 3 (Gestures) independent
- Phase 5 (Advanced UX) can enhance with animations

---

## Testing Strategy

### Unit Tests

- Offline detection logic (navigator.onLine)
- Cache key generation for service worker
- Manifest JSON validation
- Mutation blocking logic

### Integration Tests

- Service worker installation and activation
- Cache storage and retrieval
- Offline mutation blocking
- Push notification subscription and handling
- Online/offline transition detection

### E2E Tests (Playwright)

```gherkin
Scenario: PWA installation on iOS
  When I open app on iOS 16.4+
  And I see install prompt
  And I tap "Install"
  Then app opens in standalone mode
  And address bar is hidden
  And status bar color matches app

Scenario: Offline access to cached data
  When I go offline (toggle airplane mode or DevTools)
  And I open app
  Then lists and gifts load from cache
  And no errors shown
  And offline badge appears

Scenario: Mutation blocked offline
  When I go offline
  And I try to create a gift
  Then form shows error: "You're offline..."
  And mutation not submitted

Scenario: Push notification permission
  When I visit app on 3rd session
  And notification permission requested
  And I grant permission
  Then push notifications enabled
  And app ready to receive notifications

Scenario: Online/offline transition
  When I go offline
  And offline badge appears
  And I go back online
  Then badge disappears
  And cached data refreshes
  And any queued mutations sync
```

### Device Testing Matrix

| Device | OS | Manifest | Service Worker | Offline | Push | Install |
|--------|----|----|---|---|---|---|
| iPhone SE | iOS 17 | Test | Test | Test | Not available | Manual |
| iPhone 14 | iOS 17 | Test | Test | Test | Test (16.4+) | Auto |
| iPad | iPadOS 17 | Test | Test | Test | Test (16.4+) | Auto |
| Android | Android 12+ | Test | Test | Test | Test | Auto |

**Required Testing**:
- [ ] Manifest passes web.dev validation
- [ ] App installable on home screen (iOS and Android)
- [ ] Service worker installs and activates
- [ ] Lists/gifts load from cache offline
- [ ] Offline badge visible and clear
- [ ] Mutations blocked offline with error message
- [ ] Push notifications received (iOS 16.4+)
- [ ] App launches full-screen in standalone mode
- [ ] Online/offline transitions smooth

### Performance Testing

- **Service worker**: Install <500ms, cache operations <100ms
- **Manifest validation**: Use web.dev PWA audit
- **Cache size**: Monitor storage usage

---

## Next Session Agenda

### Immediate Actions (When Phase 4 Begins)

1. [ ] **MOB-401**: Fix manifest.json for iOS, verify validation
2. [ ] **MOB-402**: Implement service worker with offline caching strategy
3. [ ] **MOB-403**: Add offline indicator and block mutations
4. [ ] **MOB-404**: Integrate Web Push API for notifications
5. [ ] **MOB-405**: Implement install prompt and standalone mode
6. [ ] **MOB-406**: Handle online/offline transitions smoothly

### Parallelization Opportunity

After MOB-403 completes, MOB-404 and MOB-406 can run in parallel.

### Context for Continuing Agent

Phase 4 enables offline functionality and app installation. The primary challenges are:

1. **Service worker caching**: Must cache right endpoints, handle versions, avoid stale data
2. **Manifest validation**: Apple-specific fields required for iOS
3. **Push notifications**: iOS 16.4+ support, permission handling
4. **Offline mutations**: Must gracefully block or queue (v1 blocks, v1.1 queues)
5. **Installation flow**: Different flows for iOS, Android, different iOS versions

The phase is complete when all 10 success criteria are met and Phase 4 quality gates pass.

---

## Session Notes

### (To be updated as work progresses)

#### Next Session Entry Template

```
### [DATE]

**Completed**:
- MOB-XXX: Task description with outcome

**In Progress**:
- MOB-XXX: Current status and next step

**Blockers**:
- BLOCKER-XXX: Description and resolution path

**Next Session**:
- Action item with context
```

---

## Additional Resources

- **Phase 1-3 Progress**: `.claude/progress/mobile-first-redesign/phase-[1-3]-progress.md`
- **Phase 5 Progress**: `.claude/progress/mobile-first-redesign/phase-5-progress.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/mobile-first-redesign-v1.md`
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **Context**: `.claude/worknotes/mobile-first-redesign/context.md`
- **Web Patterns**: `apps/web/CLAUDE.md`
