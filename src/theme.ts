// ---------------------------------------------------------------------------
// SIAGA's brand, written once as a Hyper Elements theme and handed to all
// four roots (Email, Page, Document, Canvas). One theme, one palette —
// the alert level is the brand: the level colour IS the information, so
// the same red / orange / amber / green runs through every output and a
// reader recognises the danger at a glance, in any format.
// ---------------------------------------------------------------------------

import { defineTheme } from "@hyper-elements/react";

/** Monospace stack for figures (water levels, times, reading IDs). */
export const MONO_FONT = "'DejaVu Sans Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Font stack for the PDF and the share card, loaded from assets/fonts. */
export const PRINT_FONT = "'DejaVu Sans', sans-serif";

/** Semantic colours shared by all four outputs. */
export const C = {
  ink: "#0F172A",
  page: "#F1F5F9",
  card: "#FFFFFF",
  muted: "#475569",
  faint: "#94A3B8",
  border: "#E2E8F0",
  zebra: "#F8FAFC",
  track: "#E2E8F0",
  white: "#FFFFFF",
} as const;

export const siagaTheme = defineTheme({
  colors: {
    background: C.page,
    foreground: C.ink,
    primary: C.ink,
    primaryForeground: "#FFFFFF",
    muted: C.muted,
    border: C.border,
  },
  fonts: {
    body: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
    heading: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  fontSizes: { body: 15 },
  lineHeights: { body: 1.6 },
  elements: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 30, lineHeight: 1.15, mobile: { fontSize: 25 } },
          2: { fontSize: 20, lineHeight: 1.25, mobile: { fontSize: 18 } },
          // Section kickers: small, tracked-out, uppercase, muted.
          3: {
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "{colors.muted}",
          },
        },
      },
    },
    Button: {
      borderRadius: 8,
      hover: { backgroundColor: "#1E293B" },
    },
  },
  styles: {
    // The white card every content section lives in.
    card: {
      backgroundColor: "#FFFFFF",
      padding: 28,
      gap: 20,
      borderRadius: 12,
      border: "1px solid #E2E8F0",
    },
  },
});

/** Font files for the Document (PDF) and Canvas (share card) roots.
 *  The CLI's `render` loads them from the paths the template names; the
 *  Email and Page roots use the system stack from the theme instead.
 *  DejaVu ships only Regular (400) and Bold (700), but the theme's headings
 *  and badges use weight 800 — so each Bold file is registered for the
 *  whole 700–900 range, and 800 draws as Bold instead of warning about a
 *  missing file. */
export const PRINT_FONTS = [
  {
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans-Bold.ttf",
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    // The renderers register a file per weight: the range string above did
    // not satisfy them, so Bold is registered again at 800 explicitly.
    family: "DejaVu Sans",
    src: "../assets/fonts/DejaVuSans-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono-Bold.ttf",
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    // Same as above: Bold registered again at 800 explicitly.
    family: "DejaVu Sans Mono",
    src: "../assets/fonts/DejaVuSansMono-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
];
