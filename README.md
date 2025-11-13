# 🎨 DS Styles Generator

A visual theme builder that generates complete design tokens and color scales (0→1000), supports Light/Dark modes, contrast levels, and multi-format export. Built with React + TypeScript + Vite and grounded in OKLCH/HCT color principles.

## ✅ All Features Implemented

### 📋 Feature Overview

| # | Feature | Component | Description |
|---|---------|-----------|-------------|
| 1 | Adaptive Chroma | `colorModule.ts` + `toneContrastSystem.ts` | Automatic saturation reduction at extreme tone values |
| 2 | Perceptual Spacing | `colorModule.ts` | Non-linear lightness steps with easing |
| 3 | Pure Neutrals | `AdvancedControls.tsx` | Toggle for pure gray neutrals (chroma = 0) |
| 4 | Intelligent Color Selection | `tokenMapper.ts` + `contrastChecker.ts` | Dynamic contrast-based shade selection (4.5:1 / 7:1 / 9:1) |
| 5 | **Pro Mode - Tone Mapping** | `ProModeControls.tsx` + `tokenMapper.ts` | Manual tone override with accessibility guardrails |
| 6 | **sRGB Gamut Warnings** | `gamutChecker.ts` + `PalettePreview.tsx` | Visual indicators for out-of-gamut colors (P3) |
| 7 | **Enhanced Neutral Tinting** | `colorModule.ts` + `themeStore.ts` | Multiple tint sources (Primary/Secondary/Custom/Pure) |
| 8 | Saturation/Temperature | `AdvancedControls.tsx` | Sliders for global saturation and temperature |
| 9 | A11y Badges | `PalettePreview.tsx` | AAA/AA/FAIL indicators with colors |
| 10 | Export Formats | `ExportPanel.tsx` | CSS, Tailwind, SCSS, JSON, Figma tokens |
| 11 | Colorblind Simulation | `ColorblindSimulator.tsx` | Deuteranopia, Protanopia, Tritanopia, Grayscale |
| 12 | Color Harmony | `ColorHarmonyVisualizer.tsx` | Analogous, Complementary, Triadic |
| 13 | Live Preview | `LivePreview.tsx` | Combinable Theme (Light/Dark) + Contrast modes |
| 14 | Material Design 3 HCT | `toneContrastSystem.ts` | Tone-based contrast system |
| 15 | UI Components | Multiple | Complete UI for all capabilities |
| 16 | Figma Plugin | `figma-plugin/` | Custom plugin for Variables import with mode support |
| 17 | EyeDropper Tool | `ColorPicker.tsx` | Browser-native color picker from screen |

---

## 🎯 Key Components

### LivePreview
**Features:**
- 🔄 Two independent segmented controls: Theme (Light/Dark) + Contrast (Default/High)
- 📦 Single preview box with 4 possible combinations
- ✨ Automatic theme switching
- 🎨 Real-time token application

**Combinations:**
1. Light + Default → Standard light mode
2. Light + High Contrast → Light with max contrast (up to 21:1)
3. Dark + Default → Standard dark mode
4. Dark + High Contrast → Dark with max contrast (up to 21:1)

### AdvancedControls
**Features:**
- ☑️ Pure Neutrals Toggle: Switch to grayscale neutrals
- 🎚️ Saturation Slider: 0.5x - 1.5x global multiplier
- 🌡️ Temperature Slider: -15° to +15° hue shift
- 🎨 Harmony Dropdown: None, Analogous, Complementary, Triadic
- 📖 Inline guidance for each control

### ColorHarmonyVisualizer
**Features:**
- 🎨 Analogous: Primary + Adjacent color (+30° hue)
- 🎯 Complementary: Primary + Opposite color (+180° hue)
- 🔺 Triadic: Three evenly spaced colors (+120° intervals)
- 🖼️ Visual swatches with hex values
- 💡 Explanation for each harmony type

### ColorblindSimulator
**Features:**
- 👁️ 5 modes: None, Deuteranopia, Protanopia, Tritanopia, Grayscale
- 🎨 Before/After preview for all semantic colors
- 📊 Grid layout for side-by-side comparison
- 🧬 Color matrix transformations (Brettel algorithm)

### ExportPanel
**Supported formats:**
1. CSS Variables → `.css` with `:root` and `[data-theme="dark"]`
2. Tailwind Config → **v3** (`.js` module.exports) or **v4** (`.css` @theme directive) with version toggle
3. SCSS Variables → `.scss` with `$color-primary` syntax
4. JSON → `.json` with complete tokens and scales
5. Figma Tokens → `.json` compatible with Figma Tokens plugin

**Tailwind Version Selector:**
- **v3**: JavaScript config file (`tailwind.config.js`) with `theme.extend.colors` object
- **v4**: CSS-first approach with `@theme` directive and CSS custom properties

### 🔌 Figma Plugin
**Custom plugin for direct Figma integration:**
- 📥 Import colors as **Figma Variables** (not just styles)
- 🌓 Full support for **Light/Dark/High Contrast** modes
- 🔄 Palette swapping capability
- 📦 Import both color scales and semantic tokens

👉 See [`figma-plugin/README.md`](./figma-plugin/README.md) for installation and usage

---

## 🎯 Pro Mode Features

### 1. Advanced Tone Mapping

**Professional-grade control** over semantic color tone selection:

- **Manual Override**: Set custom tone values (0-1000) for any semantic color
- **Per-Mode Configuration**: Different tones for light and dark modes
- **Accessibility Guardrails**: On-colors auto-calculate to maintain WCAG compliance
- **Smart Fallback**: Automatic intelligent selection when tones aren't specified

```typescript
// Example: Force primary to be lighter in light mode
Primary Light: 300  // Instead of auto-selected ~550
Primary Dark: 400   // Instead of auto-selected ~350
→ System ensures on-primary maintains 4.5:1 contrast
```

**Use cases:**
- Brand guidelines requiring specific tone values
- Fine-tuning for specific UI contexts
- Matching existing design systems
- Creating unique visual hierarchies

### 2. sRGB Gamut Warnings

**Visual indicators** for colors outside standard sRGB gamut:

- **⚠️ P3 Badge**: Shows when color exceeds sRGB limits
- **Cross-Device Consistency**: Ensures colors look consistent on all displays
- **Severity Levels**: High/Medium/Low chroma excess indicators
- **Real-time Feedback**: See warnings as you adjust colors

**Why it matters:**
- P3-wide colors look vibrant on modern displays (iPhone, MacBook Pro)
- But appear "clamped" or different on older sRGB-only monitors
- Critical for brands needing consistent appearance everywhere

### 3. Enhanced Neutral Tinting

**Multiple sources** for neutral color tinting:

- **Primary** (default): Neutrals tinted with primary color
- **Secondary**: Use secondary color for neutral tint
- **Custom**: Pick any color for neutral tinting
- **Pure**: Completely desaturated grayscale (chroma = 0)

**Benefits:**
- Create warmer/cooler neutral palettes
- Match specific brand aesthetics
- Separate UI tone from accent colors
- Greater design flexibility

---

## 🔬 Material Design 3 HCT System

### Intelligent Contrast-Based Color Selection

**How it works:**
Instead of fixed tone values, the system **dynamically finds the optimal shade** by measuring actual WCAG contrast against the background:

```typescript
// OLD (Fixed tones)
Light Default:  primary-500 (always)
Light High:     primary-550 (always)

// NEW (Intelligent contrast-based)
Default mode:     Find shade closest to 4.5:1 contrast ratio
High contrast:    Find shade closest to 7.0:1 contrast ratio  
Extra-high:       Find shade closest to 9.0:1 contrast ratio
```

**Algorithm:**
1. Determine background color (neutral-0 for light, neutral-1000 for dark)
2. Scan all shades in scale (0, 50, 100, ..., 1000)
3. Measure WCAG contrast ratio for each shade
4. Select shade with contrast **closest to target**
5. Prefer mid-tones (200-800) for optimal saturation

**Benefits:**
- ✅ **WCAG compliant** - Automatically hits 4.5:1 (AA), 7.0:1 (AAA), 9.0:1 (Extra)
- ✅ **Works for any color** - No manual tone guessing
- ✅ **Perceptually balanced** - Uses HCT color theory
- ✅ **Container colors intelligent** - Auto-selects 3:1 contrast
- ✅ **Mode aware** - Adapts for light/dark backgrounds

### Tone-Based Contrast

**Standard Contrast:**
```typescript
Light Mode:
  Primary: tone 40  → On Primary: tone 100  = 4.5:1 (AA)
  Container: tone 90 → On Container: tone 10 = 9.2:1 (AAA)

Dark Mode:
  Primary: tone 80  → On Primary: tone 20  = 4.5:1 (AA)
  Container: tone 30 → On Container: tone 90 = 9.3:1 (AAA)
```

**High Contrast:**
```typescript
Light Mode:
  Primary: tone 30  → On Primary: tone 100  = 7.1:1 (AAA)
  Surface: tone 100 → On Surface: tone 0   = 21:1 (AAA)

Dark Mode:
  Primary: tone 90  → On Primary: tone 10  = 11.4:1 (AAA)
  Surface: tone 0   → On Surface: tone 100 = 21:1 (AAA)
```

### Adaptive Chroma
Automatic saturation reduction at physically limited tone values:

```typescript
if (tone >= 95 || tone <= 5)   → chroma × 0.3  // Extreme
if (tone >= 85 || tone <= 15)  → chroma × 0.6  // Very light/dark
if (tone >= 75 || tone <= 25)  → chroma × 0.8  // Slightly light/dark
else                            → chroma × 1.0  // Full saturation
```

**Why?** Physical color limits — some hue + chroma + tone combinations are impossible (e.g., "bright light blue @ 95% tone").

---

## 🎨 Color Harmony

### Implemented Modes

**1. Analogous (+30° hue)**
```
Primary: #0052cc (blue, 220°)
↓
Secondary: #5200cc (purple, 250°)
```
Use: Harmonious, calm palettes

**2. Complementary (+180° hue)**
```
Primary: #0052cc (blue, 220°)
↓
Secondary: #cc7a00 (orange, 40°)
```
Use: High contrast, vibrant palettes

**3. Triadic (+120° intervals)**
```
Primary: #0052cc (blue, 220°)
↓
Colors: #0052cc, #cc0052, #52cc00
        (blue, red, green - 120° apart)
```
Use: Balanced, vibrant palettes

---

## 📊 Project Structure

```
src/
├── components/
│   ├── AdvancedControls.tsx         ← Pure neutrals, saturation, temp, harmony
│   ├── ColorblindSimulator.tsx      ← Colorblind simulation preview
│   ├── ColorHarmonyVisualizer.tsx   ← Harmony schemes visualizer
│   ├── ExportPanel.tsx              ← Multi-format export
│   ├── LivePreview.tsx              ← Theme + Contrast segmented buttons
│   ├── PalettePreview.tsx           ← AAA/AA/FAIL badges
│   └── ...
├── logic/
│   ├── colorModule.ts               ← Core color generation + harmony
│   ├── colorblindSimulator.ts       ← Color matrix transformations
│   ├── toneContrastSystem.ts        ← Material Design 3 HCT system
│   ├── tokenMapper.ts               ← Semantic token mapping
│   └── ...
└── store/
    └── themeStore.ts                ← Zustand state management
```

---

## 🚀 Usage

### 1. Basic Setup
```tsx
// Left panel: Color inputs
- Primary color picker
- Secondary color picker
- Auto-generated semantics (Error, Warning, Success, Info)
- Surface controls (Radius, Shadow)
```

### 2. Advanced Controls
```tsx
// Click "Advanced Controls" to expand
- Pure Neutrals: ☑️ Remove color tint
- Saturation: 🎚️ 0.5x - 1.5x
- Temperature: 🌡️ -15° - +15°
- Harmony: 🎨 Dropdown (None/Analogous/Complementary/Triadic)
```

### 3. Live Preview
```tsx
// Top panel: Combine modes
Theme:    [Light] [Dark]
Contrast: [Default] [High Contrast]

// 4 combinations:
✅ Light + Default
✅ Light + High Contrast
✅ Dark + Default
✅ Dark + High Contrast
```

### 4. Visualizations
```tsx
// Scroll down for:
- 🎨 Color Harmony Generator (3 harmony types)
- 👁️ Colorblind Simulation (5 vision types)
- 📊 Material Design 3 Tonal Palettes (Primary, Secondary, Error)
- 🎯 Complete Token Preview (100+ tokens with contrast badges)
- 📏 Scale Preview (0-1000 in 50-step increments)
```

### 5. Export
```tsx
// Bottom: Export Panel
[CSS Variables] [Tailwind Config] [SCSS Variables]
[JSON] [Figma Tokens]

// One click = file download
```

---

## 🎯 Key Principles

### 1. Physical Color Limits
```typescript
// Some colors are physically impossible
❌ "Bright light blue" @ tone 95 + high chroma
✅ "Pale light blue" @ tone 95 + reduced chroma (0.3x)

// System handles this automatically with adaptive chroma
```

### 2. Tone-Based Guaranteed Contrast
```typescript
// Instead of guessing colors, use tone system
Primary (tone 40) + On Primary (tone 100) = guaranteed 4.5:1 contrast

// High contrast pushes tones further
Primary (tone 30) + On Primary (tone 100) = guaranteed 7.1:1 contrast
```

### 3. Independent Modes
```typescript
// Theme and Contrast are independent
data-theme="light" | "dark"           // Color scheme
data-contrast="default" | "high"       // Contrast level

// Users can combine as needed
```

### 4. Accessibility First
```typescript
// All tokens have AAA/AA/FAIL badges
// High contrast mode guarantees 7:1+ contrast
// Colorblind simulation for testing
```

---

## 📜 Scripts

**Development:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

**Lint:**
```bash
npm run lint
```

---

## 📚 Documentation

### Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** | Overview and features | Everyone |
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute getting started guide | New users |
| **[FEATURE_SHOWCASE.md](./FEATURE_SHOWCASE.md)** | Complete feature list with visuals | Users, stakeholders |
| **[MATERIAL_HCT_INTEGRATION.md](./MATERIAL_HCT_INTEGRATION.md)** | Material Design 3 HCT system | Designers, developers |
| **[COLOR_THEORY.md](./COLOR_THEORY.md)** | Color science foundations | Designers, color nerds |
| **[TECHNICAL_REFERENCE.md](./TECHNICAL_REFERENCE.md)** | API reference and architecture | Developers |
| **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** | Implementation details | Developers |

### In-App Documentation

Visit the **Docs** page in the app for interactive documentation with:
- How the app works
- Color theory & OKLCH
- Adaptive chroma explanation
- Contrast modes
- Design tokens
- Export formats
- File structure

---

## 🎉 Outcome

Professional design system generator with:
- ✅ Material Design 3 HCT tone system
- ✅ Combinable Light/Dark + Default/High Contrast modes
- ✅ Adaptive chroma honoring physical color limits
- ✅ Perceptual lightness spacing
- ✅ Color harmony generation (analogous, complementary, triadic)
- ✅ Pure neutrals option
- ✅ Saturation & temperature controls
- ✅ Colorblind simulation (4 types)
- ✅ Multi-format export (CSS, Tailwind, SCSS, JSON, Figma)
- ✅ Real-time WCAG contrast validation (AAA/AA/FAIL)
- ✅ 0-1000 color scale (21 steps, step 50)
- ✅ 100+ semantic tokens
- ✅ Live preview of all components

Built on science, physics, and accessibility! 🚀✨
