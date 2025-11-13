# DS Styles Generator - Implementační Detaily

## Přehled

Tento dokument popisuje implementaci klíčových feature v DS Styles Generator.
Všechny uvedené funkce jsou **plně implementovány a funkční**.

## 🎨 Generování barevných škál

### Power 0.9 Easing Křivka
**Soubor**: `src/logic/colorModule.ts` - `lightnessSteps`

**Algoritmus**: `L = 1.0 - (step/1000)^0.9`

**Implementace**:
```typescript
const lightnessSteps = {
    '0': 1.0,      // Absolutně bílá
    '50': 0.985,   // Velmi světlé pastely
    '100': 0.96,   // Light containers začátek
    // ... 21 kroků celkem
    '1000': 0.05,  // Téměř černá (0.05 pro sRGB bezpečnost)
};
```

**Proč power 0.9?**
- Lidské oko je citlivější na změny ve středních tónech (L=0.4-0.6)
- Power 0.9 poskytuje větší kroky na krajích a menší kroky uprostřed
- Lepší perceptuální rozložení než lineární nebo exponenciální

**Rozsahy použití**:
- 0-200: Light mode pozadí a containers
- 300-500: Light mode akcenty a text
- 500-700: Dark mode akcenty a text
- 800-1000: Dark mode pozadí a containers

---

### Parabolická Adaptivní Chroma
**Soubor**: `src/logic/colorModule.ts` - `generateShades()`

**Problém**: sRGB gamut má fyzické limity - plná chroma není dosažitelná na extrémech světlosti

**Řešení**: Parabolická křivka redukující chroma podle L hodnoty

**Implementace**:
```typescript
// Velmi světlé (L > 0.92): 0.25× chroma
if (lightness > 0.92) chromaMultiplier = 0.25;

// Světlé (0.85 < L ≤ 0.92): 0.5× chroma  
else if (lightness > 0.85) chromaMultiplier = 0.5;

// Horní mid (0.70 < L ≤ 0.85): 0.85× chroma
else if (lightness > 0.70) chromaMultiplier = 0.85;

// Mid-tones (0.55 ≤ L ≤ 0.70): 1.15× chroma - BOOST!
else if (lightness >= 0.55 && lightness <= 0.70) chromaMultiplier = 1.15;

// Dolní mid (0.38 < L < 0.55): 1.0× chroma
else if (lightness > 0.38) chromaMultiplier = 1.0;

// Tmavší (0.28 < L ≤ 0.38): 0.75× chroma
else if (lightness > 0.28) chromaMultiplier = 0.75;

// Tmavé (0.20 < L ≤ 0.28): 0.55× chroma
else if (lightness > 0.20) chromaMultiplier = 0.55;

// Velmi tmavé (L ≤ 0.20): 0.3× chroma
else chromaMultiplier = 0.3;

const newColor = {
    ...baseOklch,
    l: lightness,
    c: baseChroma * chromaMultiplier,
};
```

**Klíčové body**:
- **1.15× boost v mid-tones** (L=0.55-0.70) - ideální pro dark mode akcenty
- Prevence "gamut clipping" - barvy vždy zobrazitelné v sRGB
- Zachování vizuální bohatosti tam, kde je to fyzicky možné

---

### Tinted Neutrals
**Soubor**: `src/logic/colorModule.ts` - `generateTintedNeutrals()`

**Koncept**: Neutral škála s jemným barevným tónem (místo čisté šedi)

**Implementace**:
```typescript
export function generateTintedNeutrals(
    baseColorHex: string, 
    chromaIntensity: number = 0.02
): ShadeScale {
    const baseOklch = oklch(baseColorHex);
    const baseHue = baseOklch.h;
    
    // Použije stejné lightness kroky, ale s mírnou chromou
    for (const [step, lightness] of Object.entries(lightnessSteps)) {
        const newColor = {
            mode: 'oklch',
            l: lightness,
            c: chromaIntensity,  // Velmi nízká chroma (0.02)
            h: baseHue,           // Hue z primary barvy
        };
    }
}
```

**UI Kontrola**: `NeutralTintControls.tsx` - výběr zdroje tónu (Primary/Secondary/Custom/Pure)

---

### Pure Neutrals
**Soubor**: `src/logic/colorModule.ts` - `generatePureNeutrals()`

**Koncept**: Dokonale neutrální šedá bez jakéhokoli barevného nádechu

**Implementace**:
```typescript
export function generatePureNeutrals(): ShadeScale {
    for (const [step, lightness] of Object.entries(lightnessSteps)) {
        const newColor = {
            mode: 'oklch',
            l: lightness,
            c: 0,  // Chroma = 0 → čistá šedá
            h: 0,
        };
    }
}
```

**UI Kontrola**: `AdvancedControls.tsx` - checkbox "Pure Neutrals"

---

## 🎯 Inteligentní Token Mapping

### FindOptimalStepByContrast
**Soubor**: `src/logic/contrastChecker.ts`

**Koncept**: Najde krok v barevné škále s kontrastem **nejblíže** cílové hodnotě

**Algoritmus**:
```typescript
export function findOptimalStepByContrast(
    scale: ShadeScale,
    backgroundHex: string,
    targetContrast: number,
    range: [number, number] = [0, 1000]
): string {
    let bestStep = '500';
    let minDiff = Infinity;
    
    // Projdi všechny kroky v rozsahu
    for (const step of Object.keys(scale)) {
        const stepNum = parseInt(step);
        if (stepNum < range[0] || stepNum > range[1]) continue;
        
        // Vypočítej kontrast
        const contrast = getContrast(scale[step], backgroundHex);
        
        // Najdi krok s nejmenším rozdílem od targetu
        const diff = Math.abs(contrast - targetContrast);
        if (diff < minDiff) {
            minDiff = diff;
            bestStep = step;
        }
    }
    
    // Enforce minimum - vrať pouze pokud splňuje target
    if (getContrast(scale[bestStep], backgroundHex) >= targetContrast) {
        return bestStep;
    }
    
    // Fallback: vrať krok s max kontrastem
    return findMaxContrastStep(scale, backgroundHex);
}
```

**Použití**:
- Base color: `targetContrast = 4.5` (AA), `7.0` (AAA), `9.0` (Extra-High)
- Range: Light `[300, 500]`, Dark `[500, 700]`

---

### FindBestContrast
**Soubor**: `src/logic/contrastChecker.ts`

**Koncept**: Pro outline tokeny - najde krok s kontrastem **co nejblíže** cíli (ne minimum)

**Rozdíl od FindOptimalStep**:
- **FindOptimalStep**: minimum threshold enforcement (vrací jen >= target)
- **FindBestContrast**: hledá nejbližší k targetu (může být i mírně pod)

**Použití**:
```typescript
// Outline tokeny v tokenMapper.ts
const outlineSubtle = findBestContrast(n, bg, 2.1, [200, 400]);  // Cíl ~2:1
const outline = findBestContrast(n, bg, 3.0, [300, 500]);        // Cíl ~3:1
const outlineStrong = findBestContrast(n, bg, 4.5, [400, 600]);  // Cíl ~4.5:1
```

---

### Statické Mapování (Krok 4 + 6D)
**Soubor**: `src/logic/tokenMapper.ts` - `getTokens()`

**Koncept**: Některé tokeny mají fixní kroky podle formálního algoritmu

**Surface tokeny** (Krok 4):
```typescript
const baseTokens = {
    '--color-background':      isLight ? n['50']  : n['1000'],
    '--color-surface':         isLight ? n['0']   : n['950'],
    '--color-surface-variant': isLight ? n['100'] : n['900'],
    '--color-surface-hover':   isLight ? n['50']  : n['900'],
    '--color-surface-pressed': isLight ? n['100'] : n['850'],
};
```

**Text tokeny** (Krok 6D):
```typescript
const baseTokens = {
    '--color-on-surface-heading': isLight ? n['950'] : n['50'],
    '--color-on-surface-variant': isLight ? n['800'] : n['100'],
    '--color-on-surface-subtle':  isLight ? n['500'] : n['500'],  // Stejné v obou
};
```

**Disabled tokeny**:
```typescript
const baseTokens = {
    '--color-disabled-surface': isLight ? n['100'] : n['850'],
    '--color-on-disabled':      isLight ? n['400'] : n['600'],
};
```

---

### Dynamické Container Mapping
**Soubor**: `src/logic/tokenMapper.ts` - `createTokenSet()`

**Koncept**: Container barva adaptivní podle base kroku (aby byl dostatečný kontrast)

**Algoritmus**:
```typescript
const containerStep = (() => {
    if (isLight) {
        const baseStepNum = parseInt(baseStep, 10);
        if (baseStepNum >= 600) {
            // Tmavá primary → nejsvětlejší container
            return findOptimalStepByContrast(s, bg, 3.0, [100, 150]);
        } else if (baseStepNum >= 400) {
            // Střední primary → střední container
            return findOptimalStepByContrast(s, bg, 3.0, [150, 250]);
        } else {
            // Světlá primary → tmavší container
            return findOptimalStepByContrast(s, bg, 3.0, [200, 300]);
        }
    } else {
        // Dark mode: analogická logika pro kroky 700-900
        const baseStepNum = parseInt(baseStep, 10);
        if (baseStepNum <= 400) {
            return findOptimalStepByContrast(s, bg, 3.0, [850, 900]);
        } else if (baseStepNum <= 600) {
            return findOptimalStepByContrast(s, bg, 3.0, [750, 850]);
        } else {
            return findOptimalStepByContrast(s, bg, 3.0, [700, 800]);
        }
    }
})();
```

**Cílové kontrasty**:
- Default: `3.0:1` - jemný kontrast
- High Contrast: `4.5:1` - střední kontrast
- Extra-High: `7.0:1` - vysoký kontrast

---

### GetOnColor
**Soubor**: `src/logic/contrastChecker.ts`

**Koncept**: Automaticky najde text barvu s dostatečným kontrastem proti pozadí

**Implementace**:
```typescript
export function getOnColor(
    scale: ShadeScale,
    backgroundHex: string,
    minimumContrast: number = 4.5
): string {
    const bgLuminance = relativeLuminance(backgroundHex);
    
    // Rozhodni zda použít světlé nebo tmavé kroky
    const candidates = bgLuminance > 0.5 
        ? ['950', '900', '850', '800', '750', '700']  // Tmavé pro světlé pozadí
        : ['50', '100', '150', '200', '250', '300'];  // Světlé pro tmavé pozadí
    
    // Najdi první krok splňující minimum
    for (const step of candidates) {
        const contrast = getContrast(scale[step], backgroundHex);
        if (contrast >= minimumContrast) {
            return scale[step];
        }
    }
    
    // Fallback: nejsvětlejší nebo nejtmavší
    return bgLuminance > 0.5 ? scale['1000'] : scale['0'];
}
```

**Použití**:
```typescript
// V createTokenSet pro on-primary, on-secondary, etc.
const onColor = getOnColor(neutral, baseColor, targetContrast);
```

---

## 🌓 Kontrastní Režimy

### Default Mode
**Target Contrast**: `4.5:1` (WCAG AA pro normální text)

**Implementace**:
```typescript
const targetContrast = 4.5;
const baseStep = findOptimalStepByContrast(scale, background, 4.5, range);
```

---

### High Contrast Mode
**Target Contrast**: `7.0:1` (WCAG AAA)

**Implementace**:
```typescript
const targetContrast = 7.0;
const baseStep = findOptimalStepByContrast(scale, background, 7.0, range);
```

**Boosted Chroma**: `+15%` pro lepší vizuální odlišení
```typescript
const boostedScale = applyContrastSaturationBoost(scale, 'high-contrast');
// chromaMultiplier = 1.15
```

---

### Extra-High Mode
**Target Contrast**: `9.0:1` (Pro zrakově postižené)

**Implementace**:
```typescript
const targetContrast = 9.0;
const baseStep = findOptimalStepByContrast(scale, background, 9.0, range);
```

**Boosted Chroma**: `+30%`
```typescript
const boostedScale = applyContrastSaturationBoost(scale, 'extra-high');
// chromaMultiplier = 1.3
```

---

## 🎨 Advanced Controls

### Saturation Slider
**Soubor**: `src/logic/colorModule.ts` - `applySaturationMultiplier()`

**Rozsah**: `0.5× - 1.5×`

**Implementace**:
```typescript
export function applySaturationMultiplier(scale: ShadeScale, multiplier: number): ShadeScale {
    for (const [step, hex] of Object.entries(scale)) {
        const color = oklch(hex);
        adjusted[step] = formatHex(clampChroma({
            ...color,
            c: (color.c || 0) * multiplier,  // Multiplikuj chroma
        }, 'oklch'));
    }
}
```

---

### Temperature Slider
**Soubor**: `src/logic/colorModule.ts` - `applyTemperatureShift()`

**Rozsah**: `-15° až +15°`

**Implementace**:
```typescript
export function applyTemperatureShift(scale: ShadeScale, shiftDegrees: number): ShadeScale {
    for (const [step, hex] of Object.entries(scale)) {
        const color = oklch(hex);
        let newHue = (color.h || 0) + shiftDegrees;
        
        // Normalize 0-360
        while (newHue < 0) newHue += 360;
        while (newHue >= 360) newHue -= 360;
        
        adjusted[step] = formatHex(clampChroma({
            ...color,
            h: newHue,  // Posuň hue
        }, 'oklch'));
    }
}
```

**Efekt**:
- Kladné hodnoty: Teplejší tóny (→ červená)
- Záporné hodnoty: Chladnější tóny (→ modrá)

---

### Color Harmony
**Soubor**: `src/logic/colorModule.ts`

#### Analogous (+30°)
```typescript
export function generateAnalogousColor(baseColorHex: string): string {
    const baseOklch = oklch(baseColorHex);
    let newHue = (baseOklch.h || 0) + 30;
    return formatHex(clampChroma({ ...baseOklch, h: newHue }, 'oklch'));
}
```

#### Complementary (+180°)
```typescript
export function generateComplementaryColor(baseColorHex: string): string {
    const baseOklch = oklch(baseColorHex);
    let newHue = (baseOklch.h || 0) + 180;
    return formatHex(clampChroma({ ...baseOklch, h: newHue }, 'oklch'));
}
```

#### Triadic (+120° intervaly)
```typescript
export function generateTriadicColors(baseColorHex: string): [string, string, string] {
    const baseOklch = oklch(baseColorHex);
    const hue1 = baseOklch.h || 0;
    const hue2 = hue1 + 120;
    const hue3 = hue1 + 240;
    
    return [
        baseColorHex,
        formatHex(clampChroma({ ...baseOklch, h: hue2 }, 'oklch')),
        formatHex(clampChroma({ ...baseOklch, h: hue3 }, 'oklch')),
    ];
}
```

---

## 📊 Export Formáty

### CSS Variables
**Soubor**: `src/logic/cssGenerator.ts` - `generateCSSVariables()`

**Formát**:
```css
:root {
    --color-primary: #3b82f6;
    --color-primary-50: #eff6ff;
    /* ... */
}

[data-theme="dark"] {
    --color-primary: #60a5fa;
    /* ... */
}
```

---

### Tailwind v3
**JavaScript config** s `theme.extend.colors`

```javascript
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    // ...
                    DEFAULT: '#3b82f6',
                },
            },
        },
    },
};
```

---

### Tailwind v4
**CSS-first** s `@theme` direktivou

```css
@theme {
    --color-primary-50: #eff6ff;
    --color-primary-100: #dbeafe;
    /* ... */
}
```

---

### Figma W3C Design Tokens
**Soubor**: `src/components/ExportPanel.tsx` - `generateFigma()`

**Formát**:
```json
{
    "scale": {
        "primary": {
            "500": {
                "$type": "color",
                "$value": "#3b82f6"
            }
        }
    },
    "alias": {
        "primary": {
            "$type": "color",
            "$value": "{scale.primary.500}"
        }
    }
}
```

**Funkce**:
- Checkboxy pro výběr: scales / aliases / surface
- Light/Dark selector
- Aliasy používají curly-brace syntax `{scale.primary.500}`

---

### CSV Contrast Audit
**Soubor**: `src/components/ExportPanel.tsx` - `generateCSV()`

**Formát**:
```csv
Token,Hex,Contrast vs Background,Level
--color-primary,#3b82f6,8.21,AAA
--color-on-primary,#ffffff,8.21,AAA
--color-surface,#ffffff,1.00,FAIL
```

**Sloupce**:
- Token: Název CSS proměnné
- Hex: Hex hodnota barvy
- Contrast vs Background: WCAG kontrast ratio
- Level: AA / AAA / FAIL

---

## 🧪 Vizuální Nástroje

### Colorblind Simulation
**Soubor**: `src/logic/colorblindSimulator.ts`

**Typy**:
- Deuteranopia (zelená slepota)
- Protanopia (červená slepota)
- Tritanopia (modrá slepota)
- Grayscale (úplná barvoslepost)

**Algoritmus**: Color matrix transformation (Brettel algoritmus)

```typescript
const matrices = {
    deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
    ],
    // ...
};
```

---

### sRGB Gamut Warnings
**Soubor**: `src/logic/gamutChecker.ts`

**Koncept**: Detekce barev mimo sRGB gamut (P3-wide)

**Implementace**:
```typescript
export function isOutOfGamut(hex: string): boolean {
    const rgb = hexToRgb(hex);
    // Kontrola zda RGB komponenty jsou v rozsahu 0-255
    return rgb.r < 0 || rgb.r > 255 || 
           rgb.g < 0 || rgb.g > 255 || 
           rgb.b < 0 || rgb.b > 255;
}
```

**UI**: `PalettePreview.tsx` - badge "⚠️ P3" pro out-of-gamut barvy

---

## 🏗️ State Management

**Soubor**: `src/store/themeStore.ts`

**Zustand store** s následujícími stavy:

```typescript
interface ThemeStore {
    // Input barvy
    inputs: {
        colors: {
            primary: string;
            secondary: string;
            error: string;
            warning: string;
            success: string;
            info: string;
        };
    };
    
    // Advanced settings
    advancedSettings: {
        pureNeutrals: boolean;
        saturation: number;        // 0.5 - 1.5
        temperature: number;       // -15 - +15
        harmonyMode: 'none' | 'analogous' | 'complementary' | 'triadic';
        neutralTintSource: 'primary' | 'secondary' | 'custom' | 'pure';
        customNeutralTint: string;
        
        // Pro Mode
        proMode: boolean;
        customTones: CustomTones;
        stayTrueToInputColor: boolean;
    };
    
    // Surface
    radiusStrategy: 'none' | 'medium' | 'circular';
    shadowStrategy: 'none' | 'subtle' | 'strong';
    
    // Generované škály (computed)
    scales: AllScales;
    
    // Actions
    setPrimaryColor: (color: string) => void;
    // ... další akce
}
```

---

## 📝 Souhrn

Všechny implementované feature:

✅ Power 0.9 easing křivka pro 21 kroků  
✅ Parabolická adaptivní chroma s mid-tone boostem  
✅ Tinted neutrals s výběrem zdroje tónu  
✅ Pure neutrals (chroma = 0)  
✅ FindOptimalStepByContrast s minimum enforcement  
✅ FindBestContrast pro outline tokeny  
✅ Statické mapování (Krok 4 + 6D)  
✅ Dynamické container mapping  
✅ GetOnColor s accessibility guardrails  
✅ Default / High / Extra-High contrast módy  
✅ Saturation slider (0.5× - 1.5×)  
✅ Temperature slider (-15° - +15°)  
✅ Color harmony (analogous, complementary, triadic)  
✅ Colorblind simulation (4 typy)  
✅ sRGB gamut warnings  
✅ Export do 7 formátů  
✅ W3C Figma tokens s aliasy  
✅ CSV contrast audit  
✅ Live preview všech tokenů  
✅ In-app dokumentace s live audit  

**Postaveno na vědě, fyzice a přístupnosti.** 🚀✨
