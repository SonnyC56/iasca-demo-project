/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string
  readonly VITE_CONVEX_SITE_URL?: string
  /** Set to "off" to bypass the dev proxy and connect straight to VITE_CONVEX_URL. */
  readonly VITE_CONVEX_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
