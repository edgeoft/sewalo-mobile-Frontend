/**
 * Layout and Spacing Tokens for Sewalo Mobile.
 *
 * Centralizing spacing, image sizing presets, and responsive thresholds ensures
 * consistent visual rhythm across all screens and device form factors.
 */

export const BREAKPOINTS = {
  compact: 360, // Small phones (e.g. iPhone SE, compact Androids)
  regular: 414, // Standard smartphones
  large: 768, // Tablets and foldables
} as const;

export const SPACING = {
  // Screen horizontal container padding
  pagePadding: 16,
  pagePaddingTablet: 24,

  // Screen top and bottom safe defaults
  screenTopPadding: 20,
  screenBottomPadding: 24,

  // Section level vertical spacing
  sectionGap: 20,
  sectionHeaderBottom: 20,
  sectionItemGap: 16,

  // Intra-card and list item gaps
  cardGap: 12,
  inlineGapSm: 6,
  inlineGapMd: 10,
  inlineGapLg: 16,
} as const;

export const IMAGE_PRESETS = {
  logo: {
    header: { width: 112, height: 44 },
    onboarding: { width: 120, height: 32 },
    appIcon: { width: 64, height: 64, borderRadius: 16 },
  },
  avatar: {
    xs: { width: 24, height: 24, borderRadius: 12 },
    sm: { width: 32, height: 32, borderRadius: 16 },
    md: { width: 48, height: 48, borderRadius: 24 },
    lg: { width: 56, height: 56, borderRadius: 28 },
    xl: { width: 64, height: 64, borderRadius: 32 },
    hero: { width: 80, height: 80, borderRadius: 16 },
  },
  category: {
    icon: { width: 16, height: 16 },
    card: { width: 32, height: 32 },
  },
  portfolio: {
    thumbnail: { height: 110 },
    previewHero: { height: 208 },
  },
} as const;
