# 🛠️ Technical Reference

> Developer documentation for DS Styles Generator - API reference, architecture, and implementation details.

---

## 📦 Project Structure

```
dsstylesgenerator/
├── src/
│   ├── components/          # React UI components
│   │   ├── AdvancedControls.tsx
│   │   ├── ColorblindSimulator.tsx
│   │   ├── ColorHarmonyVisualizer.tsx
│   │   ├── DemoButton.tsx
│   │   ├── DemoCard.tsx
│   │   ├── DemoChip.tsx
│   │   ├── DemoTextField.tsx
│   │   ├── ExportPanel.tsx
│   │   ├── HeaderToolbar.tsx
│   │   ├── LivePreview.tsx
│   │   ├── PalettePreview.tsx
│   │   ├── ScalePreview.tsx
│   │   └── ThemeInjector.tsx
│   │
│   ├── logic/               # Core business logic
│   │   ├── colorModule.ts           # Color scale generation
│   │   ├── colorblindSimulator.ts   # Color blindness simulation
│   │   ├── contrastChecker.ts       # WCAG contrast validation
│   │   ├── cssGenerator.ts          # CSS export generation
│   │   ├── surfaceAndRadius.ts      # Surface token generation
│   │   ├── surfaceModule.ts         # Surface utilities
│   │   ├── tokenMapper.ts           # Semantic token mapping
│   │   ├── toneContrastSystem.ts    # Material Design 3 HCT
│   │   └── typographyModule.ts      # Typography utilities
│   │
│   ├── pages/               # Route pages
│   │   └── Docs.tsx                 # Documentation page
│   │
│   ├── store/               # State management
│   │   └── themeStore.ts            # Zustand store
│   │
│   ├── App.tsx              # Main app component
│   ├── App.css              # Global styles
│   ├── main.tsx             # Entry point
│   └── index.css            # Base CSS
│
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── README.md
│   ├── QUICK_START.md
│   ├── MATERIAL_HCT_INTEGRATION.md
│   ├── IMPROVEMENTS.md
│   ├── FEATURE_SHOWCASE.md
│   ├── COLOR_THEORY.md
│   └── TECHNICAL_REFERENCE.md (this file)
│
└── config files
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── eslint.config.js
```

---

## 🎯 Core Modules

### 1. colorModule.ts

**Purpose**: Generate color scales in OKLCH space with adaptive chroma.

#### Key Functions

##### `generateShades(baseColorHex: string): ShadeScale`

Generates a 0-1000 scale (21 steps) from a base color.

```typescript
import { generateShades } from './logic/colorModule';

const primaryScale = generateShades('#0052cc');
// Returns:
// {
//   '0': '#ffffff',
//   '50': '#f0f5ff',
//   '100': '#d9e7ff',
//   ...
//   '1000': '#000816'
// }
```

**Algorithm**:
1. Parse hex to OKLCH
2. For each step, apply target lightness
3. Apply adaptive chroma multiplier
4. Clamp to sRGB gamut
5. Convert to hex

**Adaptive Chroma Rules**:
```typescript
if (lightness > 0.90) chromaMultiplier = 0.3;
else if (lightness > 0.80) chromaMultiplier = 0.6;
else if (lightness >= 0.65 && lightness <= 0.77) chromaMultiplier = 1.1;
else if (lightness < 0.20) chromaMultiplier = 0.35;
else if (lightness < 0.30) chromaMultiplier = 0.65;
else chromaMultiplier = 1.0;
```

##### `generateTintedNeutrals(baseColorHex: string): ShadeScale`

Generates tinted gray scale with minimal chroma (0.02).

```typescript
const neutrals = generateTintedNeutrals('#0052cc');
// Gray scale with subtle blue tint
```

##### `generatePureNeutrals(): ShadeScale`

Generates pure grayscale (chroma = 0).

```typescript
const pureGrays = generatePureNeutrals();
// Pure gray from white to black
```

##### `findClosestStepInScale(colorHex: string, scale: ShadeScale, minStep = 300, maxStep = 600): string`

Finds the closest scale step to a target color (for "stay true to input").

```typescript
const closestStep = findClosestStepInScale('#0052cc', primaryScale);
// Returns: '500' (if #0052cc is closest to step 500)
```

##### Color Harmony Functions

```typescript
// Analogous (+30°)
generateAnalogousColor(baseHex: string): string

// Complementary (+180°)
generateComplementaryColor(baseHex: string): string

// Triadic (+120°, +240°)
generateTriadicColors(baseHex: string): [string, string, string]
```

##### Adjustment Functions

```typescript
// Global saturation multiplier (0.5-1.5)
applySaturationMultiplier(scale: ShadeScale, multiplier: number): ShadeScale

// Temperature shift (-15° to +15°)
applyTemperatureShift(scale: ShadeScale, degrees: number): ShadeScale
```

---

### 2. tokenMapper.ts

**Purpose**: Map color scales to semantic design tokens.

#### Key Functions

##### `generateMappedTokens(scales, mode, contrast, options): TokenSet`

Generates complete token set for a theme mode.

**Parameters**:
```typescript
type AllScales = {
    primary: ShadeScale;
    secondary: ShadeScale;
    neutral: ShadeScale;
    error: ShadeScale;
    warning: ShadeScale;
    success: ShadeScale;
    info: ShadeScale;
};

type Options = {
    stayTrueToInputColor?: boolean;
    inputColors?: InputColors;
};

mode: 'light' | 'dark'
contrast: 'default' | 'high-contrast' | 'extra-high'
```

**Returns**:
```typescript
type TokenSet = {
    light: Record<string, string>;
    dark: Record<string, string>;
};
```

**Example**:
```typescript
const tokens = generateMappedTokens(
    scales,
    'light',
    'default',
    { stayTrueToInputColor: false }
);

// tokens.light = {
//   '--color-primary': '#0052cc',
//   '--color-primary-container': '#d9e7ff',
//   '--color-on-primary': '#000816',
//   ...
// }
```

#### Token Naming Convention

```
--color-{role}-{variant}

Roles: primary, secondary, error, warning, success, info, neutral
Variants:
  - (none) = base accent color
  - container = background container
  - on-{role} = text on role color
  - on-{role}-container = text on container
  - hover = hover state
  - pressed = pressed state
```

#### Intelligent Step Selection

```typescript
// Light mode
baseStep = stayTrue ? findClosestStep(input) : '500'
containerStep = contrast === 'extra-high' ? '250' : 
                contrast === 'high' ? '300' : '200'

// Dark mode
baseStep = stayTrue ? findClosestStep(input) :
           contrast === 'extra-high' ? '250' :
           contrast === 'high' ? '300' : '350'
containerStep = contrast === 'extra-high' ? '700' :
                contrast === 'high' ? '750' : '800'
```

---

### 3. contrastChecker.ts

**Purpose**: WCAG contrast validation.

#### Key Functions

##### `getContrast(color1: string, color2: string): number`

Calculates contrast ratio between two colors.

```typescript
const ratio = getContrast('#0052cc', '#ffffff');
// Returns: 7.24 (AAA compliant)
```

**Formula**:
```
ratio = (L1 + 0.05) / (L2 + 0.05)
where L = relative luminance (0-1)
```

##### `getContrastLevel(ratio: number): 'AAA' | 'AA' | 'FAIL'`

Categorizes contrast ratio.

```typescript
const level = getContrastLevel(7.24);
// Returns: 'AAA'

// Thresholds:
// AAA: ≥ 7.0
// AA: ≥ 4.5
// FAIL: < 4.5
```

##### `findBestContrast(baseColor: string, candidates: string[], minRatio: number): string`

Finds the candidate with best contrast to base.

```typescript
const best = findBestContrast(
    '#0052cc',
    ['#ffffff', '#f0f5ff', '#d9e7ff'],
    4.5
);
// Returns: '#ffffff' (highest contrast)
```

---

### 4. toneContrastSystem.ts

**Purpose**: Material Design 3 HCT tone system implementation.

#### Key Constants

##### `MaterialTones`

Tone values for MD3 roles:

```typescript
MaterialTones.light.default = {
    primary: 40,
    onPrimary: 100,
    primaryContainer: 90,
    onPrimaryContainer: 10,
    ...
};

MaterialTones.dark.default = {
    primary: 80,
    onPrimary: 20,
    primaryContainer: 30,
    onPrimaryContainer: 90,
    ...
};
```

#### Key Functions

##### `applyTone(baseColor: Oklch, tone: number): string`

Applies a Material tone to a color.

```typescript
const baseColor = oklch('#0052cc');
const tone40 = applyTone(baseColor, 40); // Light mode primary
const tone80 = applyTone(baseColor, 80); // Dark mode primary
```

**Algorithm**:
```typescript
1. Convert tone (0-100) to lightness (0-1)
   lightness = Math.pow(tone / 100, 0.9)

2. Apply adaptive chroma based on tone

3. Create new OKLCH color with target lightness

4. Clamp to sRGB and convert to hex
```

##### `generateTonalPalette(baseColor: string, tones: number[]): Record<number, string>`

Generates palette with specific tones.

```typescript
const palette = generateTonalPalette('#0052cc', [0, 10, 20, 40, 60, 80, 90, 100]);
// {
//   0: '#000000',
//   10: '#001f52',
//   20: '#003781',
//   40: '#0052cc',
//   ...
// }
```

---

### 5. colorblindSimulator.ts

**Purpose**: Simulate color blindness types.

#### Key Functions

##### `simulateColorblindness(color: string, type: ColorblindType): string`

Simulates how a color appears with color blindness.

```typescript
type ColorblindType = 'deuteranopia' | 'protanopia' | 'tritanopia' | 'grayscale';

const filtered = simulateColorblindness('#ff0000', 'deuteranopia');
// Red appears brownish-yellow to deuteranopes
```

**Implementation**: Uses color matrix transformations (Brettel algorithm).

```typescript
// Example: Deuteranopia matrix
const matrix = [
    [0.625, 0.375, 0.0],
    [0.7,   0.3,   0.0],
    [0.0,   0.3,   0.7]
];
```

---

### 6. cssGenerator.ts

**Purpose**: Generate CSS output for exports.

#### Key Functions

##### `generateCSSVariables(tokens: TokenSet): string`

Generates CSS custom properties.

```typescript
const css = generateCSSVariables(tokens);
// Output:
// :root {
//   --color-primary: #0052cc;
//   --color-primary-container: #d9e7ff;
//   ...
// }
// 
// [data-theme="dark"] {
//   --color-primary: #8ab4f8;
//   ...
// }
```

##### `generateTailwindConfigV3(scales: AllScales): string`

Generates Tailwind v3 JavaScript config.

```typescript
const config = generateTailwindConfigV3(scales);
// Output:
// module.exports = {
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           0: '#ffffff',
//           50: '#f0f5ff',
//           ...
//         }
//       }
//     }
//   }
// }
```

##### `generateTailwindConfigV4(scales: AllScales, tokens: TokenSet): string`

Generates Tailwind v4 CSS @theme.

```typescript
const css = generateTailwindConfigV4(scales, tokens);
// Output:
// @theme {
//   --color-primary-0: #ffffff;
//   --color-primary-50: #f0f5ff;
//   ...
// }
```

---

## 🏪 State Management

### themeStore.ts (Zustand)

**Purpose**: Global state for theme configuration.

#### Store Structure

```typescript
type ThemeStore = {
    // Input colors
    primaryColor: string;
    secondaryColor: string;
    errorColor: string;
    warningColor: string;
    successColor: string;
    infoColor: string;
    
    // Generated scales
    scales: {
        primary: ShadeScale;
        secondary: ShadeScale;
        neutral: ShadeScale;
        error: ShadeScale;
        warning: ShadeScale;
        success: ShadeScale;
        info: ShadeScale;
    };
    
    // Generated tokens
    tokens: {
        light: Record<string, string>;
        dark: Record<string, string>;
        surface: Record<string, string>;
    };
    
    // Options
    pureNeutrals: boolean;
    saturation: number;           // 0.5 - 1.5
    temperature: number;          // -15 to +15
    harmonyMode: 'none' | 'analogous' | 'complementary' | 'triadic';
    stayTrueToInputColor: boolean;
    
    // Surface options
    radius: number;
    shadowLevel: 'none' | 'sm' | 'md' | 'lg';
    
    // Actions
    setPrimaryColor: (color: string) => void;
    setSecondaryColor: (color: string) => void;
    setSaturation: (value: number) => void;
    setTemperature: (value: number) => void;
    setHarmonyMode: (mode: HarmonyMode) => void;
    regenerateScales: () => void;
    regenerateTokens: () => void;
};
```

#### Usage Example

```typescript
import { useThemeStore } from './store/themeStore';

function MyComponent() {
    const { primaryColor, setPrimaryColor, scales } = useThemeStore();
    
    return (
        <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
        />
    );
}
```

---

## 🎨 React Components

### Component Hierarchy

```
App
├── HeaderToolbar
│   └── Theme/Contrast toggles
├── Sidebar (Control Panel)
│   ├── Color pickers
│   ├── AdvancedControls
│   └── Surface controls
└── Main Content
    ├── LivePreview
    ├── ColorHarmonyVisualizer
    ├── ColorblindSimulator
    ├── PalettePreview
    ├── ScalePreview
    └── ExportPanel
```

### Key Components

#### PalettePreview.tsx

Displays semantic tokens with WCAG badges.

**Props**: None (uses store)

**Features**:
- Grouped token display (Primary, Secondary, Error...)
- Real-time contrast calculation
- Color-coded badges (AAA/AA/FAIL)
- Click to copy hex value

#### ScalePreview.tsx

Displays full 0-1000 color scales.

**Props**: None (uses store)

**Features**:
- 21 steps per color
- Click to copy hex value
- Visual color swatches
- Responsive grid layout

#### ExportPanel.tsx

Multi-format export functionality.

**Props**: None (uses store)

**Features**:
- 5 export formats
- Tailwind v3/v4 toggle
- One-click download
- Copy to clipboard

**State**:
```typescript
const [tailwindVersion, setTailwindVersion] = useState<'v3' | 'v4'>('v4');
```

#### ColorblindSimulator.tsx

Simulates color blindness.

**Props**: None (uses store)

**Features**:
- 4 simulation types + normal
- Before/after comparison
- All semantic colors tested

#### ThemeInjector.tsx

Injects CSS variables into `<head>`.

**Props**: None (uses store)

**Algorithm**:
```typescript
1. Generate CSS from current tokens
2. Create/update <style> tag
3. Apply to document
4. React to store changes
```

---

## 🔧 Build & Development

### Scripts

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Dependencies

#### Core
- **react**: ^19.2.0 - UI framework
- **react-dom**: ^19.2.0 - DOM rendering
- **zustand**: ^5.0.8 - State management
- **culori**: ^4.0.2 - Color manipulation
- **lucide-react**: ^0.469.0 - Icons

#### Dev Dependencies
- **vite**: ^7.2.2 - Build tool
- **typescript**: ~5.7.2 - Type checking
- **@vitejs/plugin-react**: ^4.3.4 - React plugin
- **eslint**: ^9.18.0 - Linting

### Build Configuration

**vite.config.ts**:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          colors: ['culori']
        }
      }
    }
  }
});
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Color Generation**:
- [ ] All 7 color categories generate correctly
- [ ] Scales have 21 steps (0-1000)
- [ ] Adaptive chroma reduces at extremes
- [ ] Pure neutrals toggle works
- [ ] Harmony modes generate correct hues

**Contrast Validation**:
- [ ] All tokens meet minimum contrast (3:1 UI, 4.5:1 text)
- [ ] High contrast mode achieves 7:1+
- [ ] Badges display correct levels (AAA/AA/FAIL)

**Theme Modes**:
- [ ] Light/Dark toggle works
- [ ] Default/High Contrast toggle works
- [ ] All 4 combinations render correctly
- [ ] CSS variables update in real-time

**Exports**:
- [ ] CSS export includes all tokens
- [ ] Tailwind v3 generates valid JavaScript
- [ ] Tailwind v4 generates valid CSS @theme
- [ ] SCSS variables use correct syntax
- [ ] JSON includes scales and tokens
- [ ] Figma format matches plugin spec

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Colorblind simulation accurate
- [ ] Screen reader labels present

---

## 📊 Performance

### Bundle Analysis

```
dist/assets/
├── index-[hash].js    352 KB (107 KB gzipped)
│   ├── react          ~45 KB
│   ├── culori         ~30 KB
│   ├── zustand        ~5 KB
│   └── app code       ~272 KB
│
└── index-[hash].css   24 KB (4.4 KB gzipped)
```

### Optimization Strategies

1. **Code splitting**: Vendor chunks separated
2. **Tree shaking**: Unused Culori functions removed
3. **CSS minification**: PostCSS optimization
4. **Gzip compression**: 70%+ size reduction

### Runtime Performance

- **Initial render**: < 100ms
- **Color regeneration**: < 50ms
- **Token mapping**: < 20ms
- **Export generation**: < 100ms

---

## 🔐 API Reference Summary

### colorModule.ts
```typescript
generateShades(baseColorHex: string): ShadeScale
generateTintedNeutrals(baseColorHex: string): ShadeScale
generatePureNeutrals(): ShadeScale
findClosestStepInScale(colorHex, scale, min, max): string
generateAnalogousColor(baseHex: string): string
generateComplementaryColor(baseHex: string): string
generateTriadicColors(baseHex: string): [string, string, string]
applySaturationMultiplier(scale, multiplier): ShadeScale
applyTemperatureShift(scale, degrees): ShadeScale
```

### tokenMapper.ts
```typescript
generateMappedTokens(scales, mode, contrast, options): TokenSet
createTokenSet(scales, name, mode, contrast, stayTrue, input): CssTokenMap
```

### contrastChecker.ts
```typescript
getContrast(color1: string, color2: string): number
getContrastLevel(ratio: number): 'AAA' | 'AA' | 'FAIL'
findBestContrast(base, candidates, minRatio): string
```

### toneContrastSystem.ts
```typescript
applyTone(baseColor: Oklch, tone: number): string
generateTonalPalette(base, tones): Record<number, string>
harmonize(colorToHarmonize, targetColor): string
```

### colorblindSimulator.ts
```typescript
simulateColorblindness(color, type): string
```

### cssGenerator.ts
```typescript
generateCSSVariables(tokens): string
generateTailwindConfigV3(scales): string
generateTailwindConfigV4(scales, tokens): string
generateSCSSVariables(tokens): string
generateJSON(scales, tokens): string
generateFigmaTokens(tokens): string
```

---

## 🤝 Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: 4 spaces indentation
- **Naming**: camelCase for functions, PascalCase for components
- **Comments**: JSDoc for public functions

### File Organization

```
New feature checklist:
1. Logic in src/logic/
2. Component in src/components/
3. Update store if needed
4. Add to App.tsx
5. Document in TECHNICAL_REFERENCE.md
6. Update FEATURE_SHOWCASE.md
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Culori API](https://culorijs.org/api/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Complete technical reference for DS Styles Generator! 🚀**

For questions or contributions, visit the [GitHub repository](https://github.com/cikrle-ctrl/dsstylesgenerator).
