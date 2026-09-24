import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveConvexUrl } from '../client'

describe('resolveConvexUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the page origin in dev so the Vite proxy handles Convex traffic', () => {
    vi.stubEnv('DEV', true)
    expect(resolveConvexUrl()).toBe(window.location.origin)
  })

  it('uses VITE_CONVEX_URL when the proxy is turned off', () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_CONVEX_PROXY', 'off')
    vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
    expect(resolveConvexUrl()).toBe('https://example.convex.cloud')
  })

  it('uses VITE_CONVEX_URL in production builds', () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_CONVEX_URL', 'https://prod.convex.cloud')
    expect(resolveConvexUrl()).toBe('https://prod.convex.cloud')
  })
})
