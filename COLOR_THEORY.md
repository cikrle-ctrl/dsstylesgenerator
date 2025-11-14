# 🎨 Color Theory Foundations

## Understanding Color Spaces

### What is a Color Space?

A color space is a mathematical model that represents colors as tuples of numbers. Different color spaces serve different purposes:

- **RGB** - Additive light mixing (monitors, TVs)
- **CMYK** - Subtractive pigment mixing (printing)
- **HSL/HSV** - Intuitive hue-based selection
- **LAB** - Perceptually uniform (CIE standard)
- **OKLCH** - Modern perceptually uniform (our choice)

---

## Why OKLCH?

### The Problem with HSL

HSL (Hue, Saturation, Lightness) seems intuitive but has critical flaws:

```
Yellow at 50% lightness → Very bright
Blue at 50% lightness   → Much darker
```

**Why?** HSL's "lightness" doesn't match human perception. Our eyes are more sensitive to yellow/green than blue/red.

### The OKLCH Solution

**OKLCH** (Oklab Lightness-Chroma-Hue) is based on human vision research:

| Component | Range | Description |
|-----------|-------|-------------|
| **L** (Lightness) | 0.0 - 1.0 | Perceived brightness (0 = black, 1 = white) |
| **C** (Chroma) | 0.0 - 0.4+ | Colorfulness (0 = gray, higher = vivid) |
| **H** (Hue) | 0° - 360° | Color angle (red≈30°, yellow≈110°, blue≈260°) |

**Key Advantage**: Equal changes in L produce equal perceptual changes regardless of hue.

```
OKLCH(0.5, 0.2, 30°)  → Perceived as same brightness as
OKLCH(0.5, 0.2, 260°) → ...despite being different hues
```

---

## Perceptual Uniformity

### Weber-Fechner Law

Human perception follows logarithmic scaling:
- We notice small changes in dim light
- We need larger changes to notice differences in bright light

### Our Implementation

```typescript
// Perceptual lightness steps (not linear!)
const lightnessSteps = {
    '0': 1.0,      // White
    '50': 0.98,    // Small step (very bright)
    '100': 0.95,   
    '200': 0.88,
    '300': 0.77,
    '400': 0.65,
    '500': 0.53,   // Mid-tone
    '600': 0.41,
    '700': 0.31,
    '800': 0.23,
    '900': 0.15,
    '1000': 0.05   // Near black
};
```

**Notice**: Steps are closer together at extremes (0.98→0.95) and farther apart in mid-range (0.65→0.53).

---

## Color Harmony

### Color Wheel Relationships

Colors relate to each other based on their hue angles. Professional color harmonies create cohesive, visually pleasing palettes:

#### 1. None (Manual)
Full manual control over color selection.

```
Primary: User-defined
Secondary: User-defined (no automatic generation)
```

**Use**: When you have specific brand colors or need complete control.

#### 2. Analogous Colors (+30°)
Colors next to each other on the wheel.

```
Primary: 220° (Blue)
↓ +30°
Analogous: 250° (Blue-Purple)
```

**Use**: Calm, harmonious palettes. Good for subtle differentiation and cohesive designs.

**Example**: Blue primary → Blue-violet secondary  
**Best for**: Conservative brands, professional interfaces, serene applications

#### 3. Complementary Colors (+180°)
Opposite colors on the wheel (maximum contrast).

```
Primary: 220° (Blue)
↓ +180°
Complementary: 40° (Orange)
```

**Use**: High contrast, vibrant palettes. Creates visual tension and energy.

**Example**: Blue primary → Orange secondary  
**Best for**: Bold brands, call-to-action elements, high-impact designs

#### 4. Triadic Colors (+120°)
Three evenly spaced colors forming an equilateral triangle.

```
Primary: 220° (Blue)
↓ +120°
Secondary: 340° (Red-Purple)
↓ +120°
Tertiary: 100° (Yellow-Green)
```

**Use**: Balanced, vibrant palettes with equal visual weight.

**Example**: Blue primary → Red-purple secondary  
**Best for**: Versatile systems, multi-category apps, balanced brand identities

#### 5. Split-Complementary Colors (+150°/+210°)
Two colors adjacent to the complement (softer than pure complementary).

```
Primary: 220° (Blue)
↓ +150°
Split-Comp A: 10° (Yellow-Orange)
↓ +210° from primary
Split-Comp B: 70° (Red-Orange)
```

**Use**: Strong visual interest without the intensity of complementary.

**Example**: Blue primary → Yellow-orange/Red-orange variants  
**Best for**: Dynamic designs that need contrast but more harmony than complementary

#### 6. Tetradic (Rectangle) Colors
Four colors forming two complementary pairs (60°, 180°, 240°).

```
Primary: 220° (Blue)
↓ +60°
Color A: 280° (Purple)
↓ +180° from primary
Color B: 40° (Orange)
↓ +240° from primary
Color C: 100° (Yellow-Green)
```

**Use**: Richest harmony with maximum color variety.

**Example**: Blue primary → Green-yellow secondary (complex four-color system)  
**Best for**: Complex systems needing diverse color categories, rich visual experiences

### Choosing the Right Harmony

| Harmony | Contrast Level | Cohesion | Best Use Case |
|---------|---------------|----------|---------------|
| **Analogous** | Low | Very High | Professional, calm brands |
| **Complementary** | Very High | Low | Bold, energetic designs |
| **Triadic** | High | Medium | Balanced, versatile systems |
| **Split-Complementary** | High | Medium-High | Dynamic with harmony |
| **Tetradic** | Very High | Low-Medium | Complex, rich palettes |

---

## Chroma and Gamut Limitations

### Physical Color Limits

Not all color combinations are physically possible:

```
❌ High chroma + extreme lightness
   Example: Bright vivid blue at 95% lightness

✅ Reduced chroma + extreme lightness
   Example: Pale soft blue at 95% lightness
```

### The sRGB Gamut

Monitors use the sRGB color space, which can't display all theoretical colors:

- **In-gamut**: Colors that can be displayed
- **Out-of-gamut**: Impossible colors (get clamped/clipped)

### Adaptive Chroma Strategy

Our system automatically reduces chroma when approaching gamut limits:

```typescript
function getChromaMultiplier(lightness: number): number {
    if (lightness > 0.90) return 0.3;  // Very light
    if (lightness > 0.80) return 0.6;  // Light
    if (lightness < 0.20) return 0.35; // Very dark
    if (lightness < 0.30) return 0.65; // Dark
    if (lightness >= 0.65 && lightness <= 0.77) {
        return 1.1;  // Mid-tone boost for dark mode
    }
    return 1.0;  // Normal
}
```

**Why the mid-tone boost?**
In dark mode, we use lighter colors (300-400 range). Boosting chroma here improves visibility against dark backgrounds.

---

## Contrast and Accessibility

### WCAG Contrast Ratios

WCAG (Web Content Accessibility Guidelines) defines minimum contrast:

| Level | Ratio | Use Case |
|-------|-------|----------|
| **FAIL** | < 3:1 | Not accessible |
| **AA** (Large text) | ≥ 3:1 | Large text (18pt+ or 14pt+ bold) |
| **AA** (Normal text) | ≥ 4.5:1 | Normal text |
| **AAA** (Enhanced) | ≥ 7:1 | Maximum accessibility |

### Calculating Contrast

```typescript
function getContrast(color1: string, color2: string): number {
    const L1 = getRelativeLuminance(color1);
    const L2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    
    return (lighter + 0.05) / (darker + 0.05);
}
```

### Relative Luminance

Not the same as lightness! Accounts for eye sensitivity:

```typescript
function getRelativeLuminance(rgb: RGB): number {
    // Convert to linear RGB
    const [r, g, b] = rgb.map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    // Weight by human eye sensitivity
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

**Notice**: Green (0.7152) has highest weight - our eyes are most sensitive to green light.

---

## Material Design 3 HCT Principles

### Tone-Based System

Material Design 3 uses "tones" (0-100) similar to our lightness (0-1):

```
Light Mode:
  Primary: tone 40 (0.40 lightness)
  On Primary: tone 100 (1.0 lightness)
  → Guaranteed 4.5:1 contrast

Dark Mode:
  Primary: tone 80 (0.80 lightness)
  On Primary: tone 20 (0.20 lightness)
  → Guaranteed 4.5:1 contrast
```

### Dynamic Color

Material's key insight: **Separate hue/chroma from tone**

```typescript
// Change theme from light to dark
// → Only tone changes, hue/chroma stay constant
const lightPrimary = oklch(0.40, 0.2, 220); // Dark blue
const darkPrimary = oklch(0.80, 0.2, 220);  // Light blue (same hue!)
```

This creates cohesive themes where colors feel related across modes.

---

## Advanced Topics

### Chromatic Adaptation

How we perceive colors changes based on lighting:

- **D65 illuminant**: Standard daylight (6500K)
- **A illuminant**: Incandescent light (2856K)

Our system uses D65 (standard for displays).

### Gamut Mapping

When a color is out-of-gamut, we "clamp" it:

```typescript
import { clampChroma } from 'culori';

const color = { mode: 'oklch', l: 0.5, c: 0.5, h: 220 };
const clamped = clampChroma(color, 'oklch');
// Reduces c until color fits in sRGB
```

### Perceptual Distance

Measuring how "different" two colors appear:

```typescript
function deltaE(color1: OKLCH, color2: OKLCH): number {
    // Simplified ΔE (actual formula is more complex)
    const dL = color1.l - color2.l;
    const dC = color1.c - color2.c;
    const dH = Math.abs(color1.h - color2.h);
    
    return Math.sqrt(dL * dL + dC * dC + dH * dH);
}
```

ΔE < 1 → Not noticeable  
ΔE 1-3 → Barely noticeable  
ΔE 3-6 → Noticeable  
ΔE > 6 → Very different  

---

## Color Blindness

### Types and Prevalence

| Type | Affected Cones | Prevalence (Male/Female) |
|------|----------------|--------------------------|
| **Protanopia** | Red (L) missing | 1% / 0.01% |
| **Deuteranopia** | Green (M) missing | 1% / 0.01% |
| **Tritanopia** | Blue (S) missing | 0.001% / 0.001% |
| **Achromatopsia** | All cones | Very rare |

### Simulation

We use color matrix transformations (Brettel algorithm):

```typescript
// Example: Deuteranopia matrix
const matrix = [
    [0.625, 0.375, 0.0],
    [0.7,   0.3,   0.0],
    [0.0,   0.3,   0.7]
];

// Apply to RGB values
const filtered = multiplyMatrix(matrix, [r, g, b]);
```

### Design Guidelines

- Don't rely on color alone (use icons, labels)
- Ensure sufficient contrast
- Test with simulation tools
- Prefer distinct hues (blue vs orange, not red vs green)

---

## Practical Application

### Our Color Generation Pipeline

```
1. User picks base color (hex)
   ↓
2. Convert to OKLCH
   oklch(baseColor)
   ↓
3. Generate 21 lightness steps
   For each step in [0, 50, 100...1000]:
   ↓
4. Apply adaptive chroma
   chroma = baseChroma × getChromaMultiplier(lightness)
   ↓
5. Clamp to sRGB gamut
   clampChroma({ l, c, h })
   ↓
6. Convert back to hex
   formatHex(...)
   ↓
7. Map to semantic tokens
   primary, primary-container, on-primary...
```

### Token Mapping Strategy

```typescript
// Light mode example
const tokens = {
    primary: scale['500'],           // Mid-tone accent
    primaryContainer: scale['200'],  // Light background
    onPrimary: scale['1000'],        // Dark text
    onPrimaryContainer: scale['700'] // Dark text on light bg
};

// Contrast check
const ratio = getContrast(
    tokens.primary,
    tokens.onPrimary
);
// → Must be ≥ 4.5:1 for AA compliance
```

---

## Further Reading

### Essential Resources

- [Oklab Color Space](https://bottosson.github.io/posts/oklab/) - Original Oklab paper
- [OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) - Why OKLCH matters
- [Material Design Color](https://m3.material.io/styles/color/overview) - MD3 color system
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Color Appearance Models](https://www.imaging.org/site/IST/Resources/Tutorials/Color_Appearance_Models.aspx)

### Tools

- [OKLCH Color Picker](https://oklch.com/)
- [Colorblind Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Culori Library](https://culorijs.org/) - Our color manipulation library

---

## Summary

✅ **OKLCH** provides perceptual uniformity  
✅ **Adaptive chroma** respects physical limits  
✅ **Perceptual spacing** matches human vision  
✅ **Tone-based contrast** guarantees accessibility  
✅ **Color harmony** creates cohesive palettes  
✅ **Gamut mapping** ensures displayable colors  

**The result**: A scientifically grounded, accessible, and beautiful color system! 🎨✨
