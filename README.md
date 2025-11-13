# 🎨 DS Styles Generator

**Profesionální generátor design tokenů** s podporou Light/Dark módů, high contrast režimů a exportu do 6 formátů.

Postavený na vědeckých principech **OKLCH color space**, **power 0.9 easing křivce** a **parabolické adaptivní chromě** pro perceptuálně rovnoměrné barevné škály.

## 🚀 Rychlý start

```bash
# Instalace
npm install

# Výv ojový server (localhost:5173)
npm run dev

# Production build
npm run build
```

## ✨ Klíčové funkce

### 🎨 Generování barevných škál
- **21 kroků** (0-1000, po 50) pro každou barvu
- **Power 0.9 easing** pro perceptuálně rovnoměrné rozložení
- **Parabolická adaptivní chroma** respektující fyzické limity sRGB
- **OKLCH color space** (perceptuálně jednotný, na rozdíl od HSL/RGB)

### 🌓 Režimy a kontrast
- **Light / Dark módy** - kompletní podpora obou témat
- **Default / High Contrast** - pro různé požadavky na přístupnost
- **4 kombinace** - nezávislé přepínání tématu a kontrastu
- **WCAG 2.1** - automatické splnění AA (4.5:1) nebo AAA (7:1) kontrastů

### 🎯 Inteligentní mapování tokenů
- **Dynamické FindOptimalShade** - najde krok s požadovaným kontrastem
- **Statické mapování** pro surface/text/disabled tokeny (dle algoritmu)
- **GetOnColor** - automatický výběr textu na barevném pozadí
- **FindBestContrast** - outline tokeny s přesným cílovým kontrastem (~2:1, 3:1, 4.5:1)

### 📊 Export do 6 formátů
1. **CSS Variables** - `:root` a `[data-theme="dark"]`
2. **Tailwind v3** - JavaScript config s `theme.extend.colors`
3. **Tailwind v4** - CSS `@theme` direktiva
4. **SCSS** - proměnné s `$color-` prefix
5. **JSON** - kompletní tokeny a škály
6. **Figma W3C** - Design Tokens spec s aliasy ({scale.primary.500})
7. **CSV Audit** - WCAG kontrasty s AA/AAA/FAIL označením

### 🧰 Pokročilé nástroje

#### Advanced Controls
- ☑️ **Pure Neutrals** - čistá šedá bez barevného tónu
- 🎚️ **Saturation** - globální multiplikátor 0.5× - 1.5×
- 🌡️ **Temperature** - posun hue -15° až +15°
- 🎨 **Harmony** - analogické, komplementární, triadické schéma

#### Neutral Tint Source
- Výběr zdroje pro tónování neutral škály:
  - **Primary** - používá primary barvu (default)
  - **Secondary** - používá secondary barvu
  - **Custom** - vlastní barva pro tónování
  - **Pure** - žádné tónování (chroma = 0)

#### Pro Mode
- 🎯 **Custom Tone Mapping** - manuální override kroků pro semantic tokeny
- 🔍 **sRGB Gamut Warnings** - indikátory P3-wide barev
- 🎨 **Stay True to Input** - zachová vstupní barvu ve škále

### 👁️ Vizuální nástroje
- **Colorblind Simulation** - Deuteranopia, Protanopia, Tritanopia, Grayscale
- **Color Harmony Visualizer** - živý náhled harmonických schémat
- **Live Preview** - real-time preview všech tokenů na UI komponentech
- **Scale Preview** - zobrazení všech 21 kroků každé škály
- **Contrast Audit** - live výpočet WCAG kontrastů s PASS/FAIL badgesy

### 📚 Dokumentace v aplikaci
- **Docs Page** - kompletní interaktivní dokumentace
- **Generation Logic** - vysvětlení algoritmu generování
- **Contrast Modes** - jak funguje Default/High/Extra-High
- **Token Naming** - konvence pojmenování tokenů
- **Live Contrast Audit** - runtime kalkulace kontrastů

## 🔬 Technické detaily

### Barevné škály

#### Power 0.9 Easing
```typescript
// Algoritmus: L = 1.0 - (step/1000)^0.9
// Větší kroky na krajích, menší uprostřed kde je oko citlivější
0 → L=1.0     (bílá)
500 → L=0.55  (střední tón)
1000 → L=0.05 (téměř černá)
```

#### Parabolická adaptivní chroma
```typescript
// Fyzické limity sRGB gamutu vyžadují redukci chromy na extrémech světlosti
L > 0.92:              0.25× (kroky 0, 50, 100) - pastely
0.85 < L ≤ 0.92:       0.5×  (150, 200) - light containers
0.70 < L ≤ 0.85:       0.85× (250, 300) - přechod
0.55 ≤ L ≤ 0.70:       1.15× (350-500) - MID-TONE BOOST pro dark mode!
0.38 < L < 0.55:       1.0×  (550, 600) - plná chroma
0.28 < L ≤ 0.38:       0.75× (650, 700) - pokles
0.20 < L ≤ 0.28:       0.55× (750, 800) - dark containers
L ≤ 0.20:              0.3×  (850-1000) - dark backgrounds
```

### Mapování tokenů

#### Statická mapování (Krok 4 + 6D z algoritmu)
```typescript
// Surface tokeny (Krok 4)
Light Mode                  Dark Mode
--background:      50       1000
--surface:          0        950
--surface-variant: 100      900
--surface-hover:    50      900
--surface-pressed: 100      850

// Text tokeny (Krok 6D)
--on-surface-heading:  950   50
--on-surface-variant:  800  100
--on-surface-subtle:   500  500

// Disabled tokeny
--disabled-surface:  100  850
--on-disabled:       400  600
```

#### Dynamická mapování
```typescript
// Accent colors - FindOptimalStepByContrast
Default:     targetContrast = 4.5:1 (WCAG AA)
High:        targetContrast = 7.0:1 (WCAG AAA)
Extra-High:  targetContrast = 9.0:1

// Containers - adaptivní podle base kroku
Light: 100-300 (světlé), Dark: 700-900 (tmavé)

// On-colors - GetOnColor s minimum contrast enforcement
Zajišťuje čitelnost textu na barevných pozadích
```

### Outline tokeny
```typescript
// FindBestContrast s přesnými cílovými kontrasty
--outline-subtle:  ~2:1  (jemné ohraničení)
--outline:         ~3:1  (standardní)
--outline-hover:   ~3:1  (interakce)
--outline-strong:  ~4.5:1 (výrazné)
```

## 📁 Struktura projektu

```
src/
├── components/          # React komponenty
│   ├── ui/             # Primitivní UI komponenty (Button, ColorPicker, etc.)
│   ├── Demo*.tsx       # Preview komponenty pro Live Preview
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
├── logic/              # Business logika
│   ├── colorModule.ts           # Generování škál, harmony, adaptive chroma
│   ├── colorblindSimulator.ts   # Color matrix transformace
│   ├── contrastChecker.ts       # WCAG contrast kalkulace
│   ├── cssGenerator.ts          # Export do CSS/Tailwind/SCSS/JSON/Figma/CSV
│   ├── gamutChecker.ts          # sRGB/P3 gamut validace
│   ├── highContrastSupport.ts   # High contrast režim
│   ├── surfaceAndRadius.ts      # Radius & shadow strategie
│   ├── toneContrastSystem.ts    # Material Design 3 HCT system
│   ├── tokenMapper.ts           # Semantic token mapping
│   └── typographyModule.ts      # Typography tokens (Material/Apple)
│
├── pages/              # Stránky aplikace
│   └── Docs.tsx       # Dokumentace s live audit
│
├── store/              # State management
│   └── themeStore.ts  # Zustand store (barvy, nastavení, režimy)
│
└── App.tsx            # Hlavní komponenta a routing
```

## 🎯 Použití

### 1. Základní setup
```tsx
// 1. Nastav primary a secondary barvy v levém panelu
// 2. Ostatní barvy (error, warning, success, info) se vygenerují automaticky
// 3. Neutral škála se vytvoří s tinted neutrals (mírný tón z primary)
```

### 2. Advanced Controls (volitelné)
```tsx
// Klikni na "Advanced Controls" pro rozšířené možnosti:
- Pure Neutrals: ☑️ Vypne tónování neutral škály
- Saturation: 🎚️ Globální multiplikátor sytosti
- Temperature: 🌡️ Posun hue (teplejší/chladnější)
- Harmony: 🎨 Auto-generování secondary (analogous/complementary/triadic)
```

### 3. Live Preview
```tsx
// Horní panel - nezávislé přepínání:
Theme:    [Light] [Dark]
Contrast: [Default] [High Contrast]

// Možné kombinace:
✅ Light + Default
✅ Light + High Contrast
✅ Dark + Default  
✅ Dark + High Contrast
```

### 4. Export
```tsx
// Exportuj tokeny do preferovaného formátu:
[CSS Variables] [Tailwind v3] [Tailwind v4]
[SCSS] [JSON] [Figma W3C] [CSV Audit]

// Figma export - W3C Design Tokens spec:
- Checkbox volby: scales / aliases / surface
- Light/Dark selector
- Aliases ve formátu {scale.primary.500}

// CSV Audit:
- Všechny tokeny s kontrastem vs background
- AA/AAA/FAIL označení
```

## 🧪 Vizualizace

### Color Harmony
- **Analogous**: Primary + sousední barva (+30° hue)
- **Complementary**: Primary + opačná barva (+180° hue)
- **Triadic**: 3 rovnoměrně rozmístěné barvy (+120° intervaly)

### Colorblind Simulation
- **None** - původní barvy
- **Deuteranopia** - zelená slepota (nejčastější)
- **Protanopia** - červená slepota
- **Tritanopia** - modrá slepota (vzácná)
- **Grayscale** - celková barvoslepost

### Tonal Palette (Material Design 3)
- Zobrazení 0-100 tónů pro Primary/Secondary/Error
- HCT tone-based kontrast systém
- Používá se v Material Design 3

## 📚 Související dokumenty

| Dokument | Účel |
|----------|------|
| [QUICK_START.md](./QUICK_START.md) | 5-minutový rychlý start |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Implementační detaily všech feature |
| [COLOR_THEORY.md](./COLOR_THEORY.md) | Teorie barev a OKLCH |
| [MATERIAL_HCT_INTEGRATION.md](./MATERIAL_HCT_INTEGRATION.md) | Material Design 3 HCT systém |
| [FEATURE_SHOWCASE.md](./FEATURE_SHOWCASE.md) | Přehled funkcí s příklady |
| [TECHNICAL_REFERENCE.md](./TECHNICAL_REFERENCE.md) | API reference a architektura |

## 🔧 Tech Stack

- **React 19.2** + **TypeScript 5.8**
- **Vite 7.2** - build tool
- **Zustand** - state management
- **Culori** - OKLCH color space manipulace
- **React Router** - routing (Home / Docs)
- **Lucide React** - ikony

## 🎓 Principy

### 1. Perceptuální rovnoměrnost
OKLCH zajišťuje, že změna lightness o 0.1 vypadá vizuálně stejně v celém spektru (na rozdíl od HSL kde ne).

### 2. Fyzické limity barev
sRGB gamut má omezení - některé kombinace L/C/H nejsou zobrazitelné. Parabolická chroma to respektuje.

### 3. Accessibility First
Všechny tokeny splňují WCAG 2.1 kontrasty. High contrast mód garantuje AAA (7:1+).

### 4. Systémový přístup
Tokeny nejsou náhodné - vycházejí z algoritmu a pravidel. Konzistentní napříč módy.

## 📄 Licence

MIT

---

**Postaveno na vědě, fyzice a přístupnosti.** 🚀✨
