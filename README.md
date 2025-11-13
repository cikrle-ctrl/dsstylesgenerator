# 🎨 DS Styles Generator

**Professional design token generator** with Light/Dark modes, high contrast
support, and Figma Variables export.

Built on scientific principles: **OKLCH color space**, **power 0.9 easing
curve**, and **parabolic adaptive chroma** for perceptually uniform color
scales.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server (localhost:5173)
npm run dev

# Production build
npm run build
```

## ✨ Key Features

### 🎨 Color Scale Generation
- **21 steps** (0-1000, increments of 50) for each color
- **Power 0.9 easing** for perceptually uniform distribution
- **Parabolic adaptive chroma** respecting sRGB physical limits
- **OKLCH color space** (perceptually uniform, unlike HSL/RGB)

### 🌓 Modes and Contrast
- **Light / Dark modes** - complete support for both themes
- **Default / High / Extra-High Contrast** - accessibility requirements
- **6 combinations** - independent theme and contrast switching
- **WCAG 2.1** - automatic AA (4.5:1) or AAA (7:1+) contrast compliance

### 🎯 Intelligent Token Mapping
- **Dynamic FindOptimalShade** - finds step with required contrast
- **Static mapping** for surface/text/disabled tokens (per algorithm)
- **GetOnColor** - automatic text selection on colored backgrounds
- **FindBestContrast** - outline tokens with precise target contrast

### 📊 Figma Variables Export
- **W3C Design Tokens** format with aliases
- **Scales + Semantic tokens** structure
- **Light/Dark modes** included
- **Surface tokens** for backgrounds

### 🧰 Advanced Tools

#### Advanced Controls
- ☑️ **Pure Neutrals** - pure gray without color tint
- 🎚️ **Saturation** - global multiplier 0.5× - 1.5×
- 🌡️ **Temperature** - hue shift -15° to +15°
- 🎨 **Harmony** - analogous, complementary, triadic schemes

#### Neutral Tint Source
- Source selection for neutral scale tinting:
  - **Primary** - uses primary color (default)
  - **Secondary** - uses secondary color
  - **Custom** - custom color for tinting
  - **Pure** - no tinting (chroma = 0)

#### Pro Mode
- 🎯 **Custom Tone Mapping** - manual override steps for semantic tokens
- 🔍 **sRGB Gamut Warnings** - P3-wide color indicators
- 🎨 **Stay True to Input** - preserves input color in scale

### 👁️ Visual Tools
- **Colorblind Simulation** - Deuteranopia, Protanopia, Tritanopia, Grayscale
- **Color Harmony Visualizer** - live preview of harmonic schemes
- **Live Preview** - real-time preview of all tokens on UI components
- **Scale Preview** - display of all 21 steps for each scale
- **Contrast Audit** - live WCAG contrast calculation with PASS/FAIL badges

### 📚 In-App Documentation
- **Docs Page** - complete interactive documentation
- **Generation Logic** - explanation of generation algorithm
- **Contrast Modes** - how Default/High/Extra-High works
- **Token Naming** - token naming conventions
- **Live Contrast Audit** - runtime contrast calculations

## 🔬 Technical Details

### Color Scales

#### Power 0.9 Easing
```typescript
// Algorithm: L = 1.0 - (step/1000)^0.9
// Larger steps at extremes, smaller in middle where eye is more sensitive
0 → L=1.0     (white)
500 → L=0.55  (mid-tone)
1000 → L=0.05 (near black)
```

#### Parabolic Adaptive Chroma
```typescript
// sRGB gamut physical limits require chroma reduction at lightness extremes
L > 0.92:              0.25× (steps 0, 50, 100) - pastels
0.85 < L ≤ 0.92:       0.5×  (150, 200) - light containers
0.70 < L ≤ 0.85:       0.85× (250, 300) - transition
0.55 ≤ L ≤ 0.70:       1.15× (350-500) - MID-TONE BOOST for dark mode!
0.38 < L < 0.55:       1.0×  (550, 600) - full chroma
0.28 < L ≤ 0.38:       0.75× (650, 700) - decrease
0.20 < L ≤ 0.28:       0.55× (750, 800) - dark containers
L ≤ 0.20:              0.3×  (850-1000) - dark backgrounds
```

### Token Mapping

#### Static Mappings (Step 4 + 6D from algorithm)
```typescript
// Surface tokens (Step 4)
Light Mode                  Dark Mode
--background:      50       1000
--surface:          0        950
--surface-variant: 100      900
--surface-hover:    50      900
--surface-pressed: 100      850

// Text tokens (Step 6D)
--on-surface-heading:  950   50
--on-surface-variant:  800  100
--on-surface-subtle:   500  500

// Disabled tokens
--disabled-surface:  100  850
--on-disabled:       400  600
```

#### Dynamic Mappings
```typescript
// Accent colors - FindOptimalStepByContrast
Default:     targetContrast = 4.5:1 (WCAG AA)
High:        targetContrast = 7.0:1 (WCAG AAA)
Extra-High:  targetContrast = 9.0:1

// Containers - adaptive based on base step
Light: 100-300 (light), Dark: 700-900 (dark)

// On-colors - GetOnColor with minimum contrast enforcement
Ensures text readability on colored backgrounds
```

### Outline Tokens
```typescript
// FindBestContrast with precise target contrasts
--outline-subtle:  ~2:1  (subtle border)
--outline:         ~3:1  (standard)
--outline-hover:   ~3:1  (interaction)
--outline-strong:  ~4.5:1 (strong)
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Primitive UI components (Button, ColorPicker, etc.)
│   ├── Demo*.tsx       # Preview components for Live Preview
│   ├── AdvancedControls.tsx
│   ├── ColorblindSimulator.tsx
│   ├── ColorHarmonyVisualizer.tsx
│   ├── ExportPanel.tsx
│   ├── HeaderToolbar.tsx
│   ├── LivePreview.tsx
│   ├── NeutralTintControls.tsx
│   ├── PalettePreview.tsx
│   ├── ProModeControls.tsx
│   ├── ScalePreview.tsx
│   ├── ThemeInjector.tsx
│   └── TonalPalettePreview.tsx
│
├── logic/              # Business logic
│   ├── colorModule.ts           # Scale generation, harmony, adaptive chroma
│   ├── colorblindSimulator.ts   # Color matrix transformations
│   ├── contrastChecker.ts       # WCAG contrast calculation
│   ├── cssGenerator.ts          # Export to CSS/Tailwind/SCSS/JSON/Figma/CSV
│   ├── gamutChecker.ts          # sRGB/P3 gamut validation
│   ├── highContrastSupport.ts   # High contrast mode
│   ├── surfaceAndRadius.ts      # Radius & shadow strategy
│   ├── toneContrastSystem.ts    # Material Design 3 HCT system
│   ├── tokenMapper.ts           # Semantic token mapping
│   └── typographyModule.ts      # Typography tokens (Material/Apple)
│
├── pages/              # Application pages
│   └── Docs.tsx       # Documentation with live audit
│
├── store/              # State management
│   └── themeStore.ts  # Zustand store (colors, settings, modes)
│
└── App.tsx            # Main component and routing
```

## 🎯 Usage

### 1. Basic Setup
```tsx
// 1. Set primary and secondary colors in the left panel
// 2. Other colors (error, warning, success, info) are auto-generated
// 3. Neutral scale is created with tinted neutrals (slight tint from primary)
```

### 2. Advanced Controls (optional)
```tsx
// Click "Advanced Controls" for extended options:
- Pure Neutrals: ☑️ Disables neutral scale tinting
- Saturation: 🎚️ Global saturation multiplier
- Temperature: 🌡️ Hue shift (warmer/cooler)
- Harmony: 🎨 Auto-generate secondary (analogous/complementary/triadic)
```

### 3. Live Preview
```tsx
// Top panel - independent switching:
Theme:    [Light] [Dark]
Contrast: [Default] [High Contrast]

// Possible combinations:
✅ Light + Default
✅ Light + High Contrast
✅ Dark + Default  
✅ Dark + High Contrast
```

### 4. Export
```tsx
// Export tokens to your preferred format:
[CSS Variables] [Tailwind v3] [Tailwind v4]
[SCSS] [JSON] [Figma W3C] [CSV Audit]

// Figma export - W3C Design Tokens spec:
- Checkbox options: scales / aliases / surface
- Light/Dark selector
- Aliases in format {scale.primary.500}

// CSV Audit:
- All tokens with contrast vs background
- AA/AAA/FAIL labels
```

## 🧪 Vizualizace

### Color Harmony
- **Analogous**: Primary + adjacent color (+30° hue)
- **Complementary**: Primary + opposite color (+180° hue)
- **Triadic**: 3 evenly distributed colors (+120° intervals)

### Colorblind Simulation
- **None** - original colors
- **Deuteranopia** - green blindness (most common)
- **Protanopia** - red blindness
- **Tritanopia** - blue blindness (rare)
- **Grayscale** - complete color blindness

### Tonal Palette (Material Design 3)
- Display of 0-100 tones for Primary/Secondary/Error
- HCT tone-based contrast system
- Used in Material Design 3

## 📚 Related Documents

| Document | Purpose |
|----------|------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute quick start |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Implementation details of all features |
| [COLOR_THEORY.md](./COLOR_THEORY.md) | Color theory and OKLCH |
| [MATERIAL_HCT_INTEGRATION.md](./MATERIAL_HCT_INTEGRATION.md) | Material Design 3 HCT system |
| [FEATURE_SHOWCASE.md](./FEATURE_SHOWCASE.md) | Feature overview with examples |
| [TECHNICAL_REFERENCE.md](./TECHNICAL_REFERENCE.md) | API reference and architecture |

## 🔧 Tech Stack

- **React 19.2** + **TypeScript 5.8**
- **Vite 7.2** - build tool
- **Zustand** - state management
- **Culori** - OKLCH color space manipulation
- **React Router** - routing (Home / Docs)
- **Lucide React** - ikony

## 🎓 Principles

### 1. Perceptual Uniformity
OKLCH ensures that a change in lightness by 0.1 looks visually the same across the entire spectrum (unlike HSL where it doesn't).

### 2. Physical Color Limits
sRGB gamut has constraints - some L/C/H combinations are not displayable. Parabolic chroma respects this.

### 3. Accessibility First
All tokens meet WCAG 2.1 contrast requirements. High contrast mode guarantees AAA (7:1+).

### 4. Systematic Approach
Tokens are not random - they derive from algorithms and rules. Consistent across modes.

## 📄 License

MIT

---

**Built on science, physics, and accessibility.** 🚀✨
