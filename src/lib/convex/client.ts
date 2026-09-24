import { ConvexClient } from 'convex/browser'

/**
 * Dev: talk to Convex through the Vite server (same origin), so phones on the LAN and
 * HTTPS dev both work without exposing the backend ports. Set VITE_CONVEX_PROXY=off to
 * connect straight to VITE_CONVEX_URL instead.
 * Production: VITE_CONVEX_URL (injected by `npx convex deploy` at build time).
 */
export function resolveConvexUrl(): string {
  if (import.meta.env.DEV && import.meta.env.VITE_CONVEX_PROXY !== 'off') {
    return window.location.origin
  }
  const url = import.meta.env.VITE_CONVEX_URL
  if (!url) throw new Error('VITE_CONVEX_URL is not set')
  return url
}

export function createConvexClient(url = resolveConvexUrl()): ConvexClient {
  // The deployment URL check only accepts *.convex.cloud; dev/self-hosted URLs are not.
  return new ConvexClient(url, { skipConvexDeploymentUrlCheck: true })
}
