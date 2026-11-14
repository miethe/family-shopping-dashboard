import { QueryClient } from '@tanstack/react-query'

/**
 * Create optimized QueryClient with entity-specific cache tuning
 *
 * Performance Strategy:
 * - Lists/Occasions: 10min stale (change infrequently, real-time sync)
 * - Gifts: 5min stale (moderate updates, search-heavy)
 * - Persons: 10min stale (rarely change, profile-heavy)
 * - ListItems: 3min stale (frequent updates, drag-drop heavy)
 * - Comments: 2min stale (high-velocity updates)
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default: 5 minutes stale time
        staleTime: 1000 * 60 * 5,
        // Default: 30 minutes garbage collection time
        gcTime: 1000 * 60 * 30,
        // Retry failed requests once
        retry: 1,
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: true,
        // Always refetch on reconnect
        refetchOnReconnect: 'always',
        // Refetch interval disabled (use WebSocket instead)
        refetchInterval: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        // No mutation retry delay (fail fast)
        retryDelay: 0,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
