import { useColorMode } from '@vueuse/core'

/** Light/dark/auto theme, persisted per browser; toggles the `.dark` class on <html>. */
export function useTheme() {
  return useColorMode({ selector: 'html', attribute: 'class', storageKey: 'iasca-theme' })
}
