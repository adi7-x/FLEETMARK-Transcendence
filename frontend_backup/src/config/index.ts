export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'fleetmark_access',
  REFRESH_TOKEN: 'fleetmark_refresh',
  USER:          'fleetmark_user',
  THEME:         'fleetmark_theme',
  LANG:          'fleetmark_lang',
} as const

export const SERVICE_WINDOWS = {
  peak:         { start: 20, end: 24 },
  consolidated: { start: 1,  end: 6  },
} as const
