// Brand color contrast, checked before export. On RMWS the dark theme's brand
// red measured 1.80–2.16:1 as text and was only found by the contrast audit
// after the build. The scaffolder (pws-scaffolder/lib/color.js) derives a
// readable --color-primary-ink and --color-on-primary; this shows what it
// will do and which pairs need fixing in the brand kit. Keep the two in step.

import type { BrandColors, BrandThemeColors } from '../types/registry'

const NEAR_BLACK = '#111827'

function parseHex(hex?: string): number[] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex ?? '').trim())
  if (!m) return null
  const h = m[1]!.length === 3 ? m[1]!.split('').map(c => c + c).join('') : m[1]!
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
}

const toHex = (rgb: number[]) => '#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')

function luminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a?: string, b?: string): number | null {
  const x = parseHex(a)
  const y = parseHex(b)
  if (!x || !y) return null
  const [l1, l2] = [luminance(x), luminance(y)]
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

export function onColor(hex?: string): string {
  if (!parseHex(hex)) return '#ffffff'
  return (contrast('#ffffff', hex) ?? 0) >= (contrast(NEAR_BLACK, hex) ?? 0) ? '#ffffff' : NEAR_BLACK
}

/** The color, or the smallest step toward black/white that reads at `min` on every ground. */
export function inkFor(color: string | undefined, grounds: (string | undefined)[], min = 4.5): string | undefined {
  const c = parseHex(color)
  const gs = grounds.filter((g): g is string => !!parseHex(g))
  if (!c || !gs.length) return color
  const passes = (hex: string) => gs.every(g => (contrast(hex, g) ?? 0) >= min)
  if (passes(toHex(c))) return toHex(c)
  const target = luminance(parseHex(gs[0])!) > 0.18 ? [0, 0, 0] : [255, 255, 255]
  for (let t = 0.02; t <= 1; t += 0.02) {
    const mixed = toHex(c.map((v, i) => v + (target[i]! - v) * t))
    if (passes(mixed)) return mixed
  }
  return toHex(target)
}

export interface ContrastCheck {
  theme: 'Light' | 'Dark'
  label: string
  ratio: number
  need: number
  fg: string
  bg: string
}

/** The theme as the scaffolder sees it: the 28-key set, or the legacy flat fields. */
function themeOf(colors: BrandColors, dark: boolean): BrandThemeColors {
  const full = dark ? colors.dark : colors.light
  if (full?.primary) return full
  return dark
    ? { primary: colors.primaryDark, bgPrimary: colors.backgroundDark ?? colors.neutralDark, bgSecondary: colors.surfaceDark, textPrimary: colors.textDark, textSecondary: colors.textSecondaryDark }
    : { primary: colors.primary, bgPrimary: colors.background ?? colors.neutral, bgSecondary: colors.surface, textPrimary: colors.text, textSecondary: colors.textSecondary }
}

export interface ThemeContrast {
  theme: 'Light' | 'Dark'
  primaryInk?: string
  inkAdjusted: boolean
  onPrimary: string
  failures: ContrastCheck[]
}

export function checkBrandContrast(colors: BrandColors | undefined, darkMode: boolean): ThemeContrast[] {
  if (!colors) return []
  const themes: ['Light' | 'Dark', boolean][] = [['Light', false], ...(darkMode ? [['Dark', true] as ['Dark', boolean]] : [])]
  return themes.map(([name, dark]) => {
    const t = themeOf(colors, dark)
    const bg = t.bgPrimary
    const surface = t.bgSecondary
    const onPrimary = onColor(t.primary)
    const primaryInk = inkFor(t.primary, [bg, surface])
    const pairs: [string, string | undefined, string | undefined, number][] = [
      ['Body text on background', t.textPrimary, bg, 4.5],
      ['Body text on surface', t.textPrimary, surface, 4.5],
      ['Secondary text on background', t.textSecondary, bg, 4.5],
      ['Secondary text on surface', t.textSecondary, surface, 4.5],
      ['Button text on primary', onPrimary, t.primary, 4.5],
    ]
    const failures: ContrastCheck[] = []
    for (const [label, fg, ground, need] of pairs) {
      const ratio = contrast(fg, ground)
      if (ratio !== null && ratio < need) failures.push({ theme: name, label, ratio, need, fg: fg!, bg: ground! })
    }
    return {
      theme: name,
      primaryInk,
      inkAdjusted: !!primaryInk && !!t.primary && primaryInk.toLowerCase() !== t.primary.toLowerCase(),
      onPrimary,
      failures,
    }
  })
}
