import { createContext, useContext, useEffect, useState } from 'react'
import type { Lang } from '../types/api'
import { STORAGE_KEYS } from '../config'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme:       Theme
  lang:        Lang
  isDark:      boolean
  toggleTheme: () => void
  setLang:     (lang: Lang) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [lang,  setLangS] = useState<Lang>('en')

  useEffect(() => {
    const t = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null
    const l = localStorage.getItem(STORAGE_KEYS.LANG)  as Lang  | null
    if (t) apply(t)
    if (l) applyLang(l)
  }, [])

  function apply(t: Theme) {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEYS.THEME, t)
  }

  function applyLang(l: Lang) {
    setLangS(l)
    document.documentElement.setAttribute('data-lang', l)
    document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem(STORAGE_KEYS.LANG, l)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      lang,
      isDark:      theme === 'dark',
      toggleTheme: () => apply(theme === 'dark' ? 'light' : 'dark'),
      setLang:     applyLang,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
