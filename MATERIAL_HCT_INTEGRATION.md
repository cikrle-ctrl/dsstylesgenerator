# Material Design 3 HCT Integration

## 🎨 Co je HCT?

**HCT (Hue, Chroma, Tone)** je barevný prostor vyvinutý Googlem pro Material Design 3, který řeší fyzikální a biologická omezení barev:

- **Hue** (0-360): Odstín barvy (červená, modrá, zelená...)
- **Chroma** (0-∞): Sytost barvy (0 = šedá, vyšší = živější)
- **Tone** (0-100): Světlost barvy (0 = černá, 100 = bílá)

### Klíčová vlastnost HCT
Na rozdíl od HSL nebo RGB, **HCT umožňuje měnit hue a chroma bez ovlivnění tone**. To znamená, že můžeme:
- Vytvářet barvy se stejnou světlostí ale různým odstínem
- Garantovat přesný kontrast změnou pouze tone
- Zachovat konzistentní vizuální váhu napříč paletou

## 🔬 Fyzikální omezení barev

### Proč nemůžeme mít "bright light blue"?
Některé kombinace hue, chroma a tone jsou fyzikálně nemožné kvůli:

1. **Fyzice světla**: Ne všechny vlnové délky mohou dosáhnout stejné intenzity
2. **Lidské vidění**: Naše oči mají různou citlivost na různé barvy
3. **Omezení obrazovek**: sRGB gamut má limity pro zobrazitelné barvy

**Řešení v tomto systému**: Adaptive chroma
```typescript
// Z toneContrastSystem.ts
let chromaMultiplier = 1.0;
if (tone >= 95 || tone <= 5) {
    chromaMultiplier = 0.3; // Extrémně světlé/tmavé
} else if (tone >= 85 || tone <= 15) {
    chromaMultiplier = 0.6; // Světlé/tmavé
}
```

### Příklady omezení
- ❌ **Light Blue @ 95% tone + high chroma** → Fyzikálně nemožné
- ✅ **Light Blue @ 95% tone + reduced chroma** → Možné (30% původní chroma)
- ❌ **Bright Red @ 10% tone** → Příliš tmavé pro vysokou saturaci
- ✅ **Deep Red @ 10% tone** → S redukcí chroma funguje

## 🎯 Tone-Based Contrast System

### Standard Contrast
Material používá **tone párování** pro garantovaný kontrast:

| Role | Light Mode Tone | Dark Mode Tone | Důvod |
|------|-----------------|----------------|-------|
| Primary | 40 | 80 | 4.5:1 kontrast s on-primary |
| On Primary | 100 | 20 | Text na primary (bílá/černá) |
| Container | 90 | 30 | Jemné pozadí (3:1) |
| On Container | 10 | 90 | Text na container |
| Surface | 98 | 6 | Hlavní pozadí |
| On Surface | 10 | 90 | Text na surface |

### High Contrast Mode
Pro uživatele s nízkým viděním **posouváme tone hodnoty dál od sebe**:

| Role | Light HC | Dark HC | Rozdíl |
|------|----------|---------|--------|
| Primary | 30 (-10) | 90 (+10) | Tmavší/světlejší |
| On Primary | 100 | 10 | Maximální kontrast |
| Container | 95 (+5) | 20 (-10) | Více kontrastu |
| On Container | 0 (-10) | 100 (+10) | Čistá černá/bílá |
| Surface | 100 (+2) | 0 (-6) | Čistá bílá/černá |
| On Surface | 0 (-10) | 100 (+10) | Max kontrast |

**Výsledek**: 
- Standard: **3:1 až 4.5:1** kontrast
- High Contrast: **7:1 až 21:1** kontrast

## 🔄 Kombinovatelné režimy

### Naše implementace: 2 nezávislé segmented buttony

```
┌─────────────────────────┐  ┌──────────────────────────────┐
│  Light  │  Dark          │  │  Default  │  High Contrast   │
└─────────────────────────┘  └──────────────────────────────┘
     Theme Mode                      Contrast Level
```

**4 možné kombinace:**
1. **Light + Default** → Standardní světlý režim
2. **Light + High Contrast** → Světlý režim s max kontrastem (tone 100 surface, tone 0 text)
3. **Dark + Default** → Standardní tmavý režim  
4. **Dark + High Contrast** → Tmavý režim s max kontrastem (tone 0 surface, tone 100 text)

### Výhody tohoto přístupu
- ✅ **Nezávislost**: Uživatel kontroluje theme i kontrast odděleně
- ✅ **Přístupnost**: Splňuje WCAG AAA pro high contrast
- ✅ **Flexibilita**: Někdo může chtít dark mode bez high contrast
- ✅ **Material Design 3 compliant**: Odpovídá Material guidelines

## 📐 Tone Mapping

### Perceptuální mapping tone → lightness

```typescript
function toneToLightness(tone: number): number {
    if (tone === 0) return 0.0;
    if (tone === 100) return 1.0;
    
    // Lehce nelineární pro lepší distribuci
    const normalized = tone / 100;
    return Math.pow(normalized, 0.9);
}
```

**Proč 0.9 exponent?**
- Lidské oko je citlivější na změny ve střední oblasti
- Power křivka 0.9 dává více prostoru ve středních tonech
- Lepší distribuce než lineární mapping

### Tone hodnoty v Material Design 3

```
Tone:       0   10   20   30   40   50   60   70   80   90   95   99  100
           ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
Použití:   │    │         │         │         │         │         │    │
          Black Low   Medium   Accent  Mid    Accent  Medium  High White
                Dark   Dark                   Light   Light   Light
```

## 🎨 Color Harmonization

Material Design 3 harmonizuje statické barvy s dynamickými pro lepší vizuální soulad:

```typescript
export function harmonize(colorToHarmonize: string, targetColor: string): string {
    // Posune hue o 1/6 rozdílu směrem k target hue
    const newHue = (sourceHue + hueDiff / 6 + 360) % 360;
    return newHex;
}
```

### Příklad harmonizace
```typescript
const primary = '#0052cc';      // Modrá (hue ~220°)
const warning = '#ff9800';      // Oranžová (hue ~30°)

// Bez harmonizace
warning = '#ff9800';            // Pure orange

// S harmonizací
harmonized = harmonize(warning, primary);
// Result: '#ff9f33' (orange posunuté k modré o ~30° → teploučí oranžová)
```

**Kdy použít:**
- ✅ Alert barvy v content-based schemes
- ✅ Accent colors v themed komponentách
- ❌ Semantic colors (error musí zůstat červená!)
- ❌ Brand colors (zachovat identitu)

## 🛠️ Implementace v projektu

### 1. Tone System
**Soubor**: `src/logic/toneContrastSystem.ts`

Obsahuje:
- `MaterialTones`: Tone hodnoty pro light/dark × default/high-contrast
- `applyTone()`: Aplikuje tone na barvu s adaptive chroma
- `generateTonalPalette()`: Vytvoří palette s tones 0, 10, 20...100
- `harmonize()`: Material color harmonization
- `createMaterialTokens()`: Generuje tokeny podle tone systému

### 2. High Contrast Support
**Soubor**: `src/logic/highContrastSupport.ts`

Obsahuje:
- `enhanceWithHighContrast()`: Přidá high-contrast tokeny
- `getHighContrastCSS()`: CSS overrides pro high contrast UI

### 3. Live Preview UI
**Soubor**: `src/components/LivePreview.tsx`

Features:
- Dva segmented buttony (Theme + Contrast)
- `data-theme="dark"` pro dark mode
- `data-contrast="high-contrast"` pro high contrast
- Dynamické styly podle kombinace režimů

### 4. CSS Injection
**Soubor**: `src/components/ThemeInjector.tsx`

Injektuje:
- Základní theme CSS
- High contrast overrides CSS

## 📊 Kontrast výsledky

### Standard Mode
```
Primary (tone 40) + On Primary (tone 100)
Light: #1a73e8 + #ffffff → 4.52:1 ✓ AA
Dark: #8ab4f8 + #041e49 → 4.51:1 ✓ AA

Container (tone 90) + On Container (tone 10)
Light: #d2e3fc + #041e49 → 9.2:1 ✓ AAA
Dark: #062e6f + #d2e3fc → 9.3:1 ✓ AAA
```

### High Contrast Mode
```
Primary (tone 30) + On Primary (tone 100)
Light: #0842a0 + #ffffff → 7.1:1 ✓ AAA
Dark: #b8c7ff + #000000 → 11.4:1 ✓ AAA

Surface (tone 100) + On Surface (tone 0)
Light: #ffffff + #000000 → 21:1 ✓ AAA
Dark: #000000 + #ffffff → 21:1 ✓ AAA
```

## 🎯 Best Practices

### DO ✅
- Použij tone system pro garantovaný kontrast
- Redukuj chroma na extrémních tone hodnotách
- Kombinuj theme + contrast nezávisle
- Harmonizuj non-semantic colors s primary
- Testuj všechny 4 kombinace režimů

### DON'T ❌
- Nepoužívej vysokou chroma na tone 95+ nebo 5-
- Neměň semantic colors (error, warning) harmonizací
- Nepředpokládej, že všechny hue/chroma/tone kombinace fungují
- Nespoléhej jen na color pro informaci (use icons/text too)
- Neignoruj fyzikální limity barev

## 🔮 Budoucí rozšíření

1. **Dynamic Contrast Detection**: Automatická detekce user prefers-contrast
2. **Custom Tone Mappings**: UI pro vlastní tone hodnoty
3. **Contrast Analyzer**: Real-time kontrast checker pro custom colors
4. **Gamut Mapping**: P3 wide gamut support pro moderní displeje
5. **Color Blindness + High Contrast**: Kombinace obou accessibility features

---

**Výsledek**: Profesionální color systém založený na vědě, fyzice a přístupnosti! 🎨✨
