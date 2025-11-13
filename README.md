# DS Styles Generator

A visual theme builder that generates complete design tokens and color scales (0→1000), supports Light/Dark modes, three contrast levels, and multi-format export. Built with React + TypeScript + Vite and grounded in OKLCH/HCT color principles.

## What it does

- 0–1000 color scale in 50-step increments (perceptual spacing)
- Semantic tokens for Primary, Secondary, Error, Warning, Success, Info + Neutral
- Light/Dark themes and contrast levels: default / high-contrast / extra-high
- Adaptive chroma (boosts mid-tones, reduces at extremes)
- Tokens for surface/outline/focus/disabled + hover/pressed variants
- Color harmonies (analogous, complementary, triadic)
- Colorblind simulation (4 types)
- Export: CSS, SCSS, Tailwind, JSON, Figma (JSON)

## How it works (short)

- Scale generation: `src/logic/colorModule.ts`
  - OKLCH perceptual lightness curve, adaptive chroma by lightness
  - Neutral: tinted gray from primary or pure gray (optional)
- Token mapping: `src/logic/tokenMapper.ts`
  - Produces semantic tokens for both themes and all contrast tiers
  - On-colors selected via `findBestContrast` (WCAG 2.1)
  - Contrast modes stay colorful (more colorful containers and surface-variant)
- State: `src/store/themeStore.ts` (Zustand)
  - Stores inputs (colors, surface strategies), scales, generated tokens, and UI modes

## Contrast modes

- Default: text 4.5:1, UI 3:1, subtle surface states
- High-contrast: text 7:1, stronger surfaces, colorful containers (not grayscale)
- Extra-high: text 7:1+, maximum readability and state prominence

## Tokens (selection)

- Colors: `--color-primary`, `--color-secondary`, `--color-error`, ...
- On-colors: `--color-on-primary`, `--color-on-primary-container`, ...
- Surface: `--color-surface`, `--color-surface-variant`, `--color-surface-hover/pressed`
- Outline: `--color-outline-subtle/default/strong/hover/pressed`
- Disabled: `--color-disabled`, `--color-on-disabled`
- Focus ring: `--color-focus`

## UI and components

- Custom components: Select, Slider, Checkbox, ColorInput, ColorPicker, Tabs, etc.
- Live Preview: buttons, cards, text field, tabs, alerts, badges, progress…
- Colorblind Simulation: side-by-side comparison of original vs filtered colors

## Usage

Run the dev server and open in your browser. Exports are available in the Export panel within the UI.

## Responsive behavior

- Cards and layout adapt paddings; rows collapse to columns under 768 px
- Selects and inputs use 100% width in their containers
- Fixed-width components (e.g., text field) clamp with `min(100%, …px)`

## Project structure (short)

- `src/components` – UI and demo components (LivePreview, Palette/Scale Preview, …)
- `src/logic` – scale generation, tokens, contrast, HCT/OKLCH
- `src/store` – Zustand store for inputs, scales, tokens and UI modes

## Scripts

Dev: `npm run dev`  •  Build: `npm run build`  •  Lint: `npm run lint`

## Further documentation

- Material HCT integration: `MATERIAL_HCT_INTEGRATION.md`
- Improvements breakdown: `IMPROVEMENTS.md`

---

Tips: If you want to tweak contrast strictness or saturation in contrast modes, check `tokenMapper.ts` and `colorModule.ts` (see inline comments for relevant branches).
