/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NO_AUTH?: string
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
