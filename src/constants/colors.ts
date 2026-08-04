export const THEME_COLORS = {
  primary: '#485aff',
  primaryForeground: '#ffffff',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  amberStar: '#f59e0b',
  emeraldSuccess: '#10b981',
  dangerRed: '#ef4444',
  infoBlue: '#3b82f6',
  surfaceBrandSubtle: '#f7f9ff',
  surfaceIndigoSubtle: '#eef2ff',
  surfaceMuted: '#f1f5f9',
} as const;

export const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: THEME_COLORS.amberStar },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: THEME_COLORS.infoBlue },
  in_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: THEME_COLORS.primary },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: THEME_COLORS.emeraldSuccess },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', icon: THEME_COLORS.dangerRed },
};
