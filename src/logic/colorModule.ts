// src/logic/colorModule.ts
import { type Oklch, formatHex, oklch, clampChroma } from 'culori'; // <-- TOTO JE TA OPRAVA

// Naše definice kroků světlosti (0-1000, po 50)
// S perceptuálním easingem (power 0.9) pro lepší vizuální odstupňování
// Algoritmus: L = 1.0 - (step/1000)^0.9
const lightnessSteps = {
    '0': 1.0,      // Absolutně bílá (L=1)
    '50': 0.985,   // Velmi světlé pastely
    '100': 0.96,   // Light containers začátek
    '150': 0.93,
    '200': 0.89,   // Light containers konec
    '250': 0.845,
    '300': 0.79,   // Light base začátek
    '350': 0.73,
    '400': 0.67,
    '450': 0.61,
    '500': 0.55,   // Střední tón (Light base konec, Dark base začátek)
    '550': 0.49,
    '600': 0.43,
    '650': 0.38,   // Dark base konec
    '700': 0.33,   // Dark containers začátek
    '750': 0.28,
    '800': 0.24,
    '850': 0.20,   // Dark containers konec
    '900': 0.16,
    '950': 0.11,   // Velmi tmavé surface
    '1000': 0.05,  // Absolutně černá (L=0.05 pro sRGB bezpečnost)
};

type ShadeScale = Record<keyof typeof lightnessSteps, string>;

// Export ShadeScale type pro použití v jiných modulech
export type { ShadeScale };

/**
 * Najde nejbližší krok ve škále k zadané barvě (omezeno na rozsah 300-600)
 * Používá se pro "stay true to input color" - najde krok v existující škále, který je nejblíž input barvě
 */
export function findClosestStepInScale(colorHex: string, scale: Record<string, string>, minStep = 300, maxStep = 600): keyof typeof lightnessSteps {
    const color = oklch(colorHex);
    if (!color) return '500'; // Fallback
    
    const targetLightness = color.l;
    let closestStep = '500';
    let minDiff = Infinity;
    
    for (const step of Object.keys(lightnessSteps)) {
        const stepNum = parseInt(step, 10);
        if (stepNum < minStep || stepNum > maxStep) continue;
        
        const stepColor = oklch(scale[step as keyof ShadeScale]);
        if (!stepColor) continue;
        
        const diff = Math.abs(stepColor.l - targetLightness);
        if (diff < minDiff) {
            minDiff = diff;
            closestStep = step;
        }
    }
    
    return closestStep as keyof typeof lightnessSteps;
}

/**
 * Generuje barevnou škálu (primary, secondary)
 * S adaptivní chromou pro přirozenější vzhled
 */
export function generateShades(baseColorHex: string): ShadeScale {
    const baseOklch = oklch(baseColorHex); // <-- OPRAVA
    if (!baseOklch) return {} as ShadeScale;

    const baseChroma = baseOklch.c || 0.1;
    const scale: Partial<ShadeScale> = {};
    
    for (const [step, lightness] of Object.entries(lightnessSteps)) {
        // Adaptivní chroma: parabolická křivka pro fyzické limity sRGB gamutu
        // Zabezpečuje, že světlé a tmavé tóny nejsou "ořezány" (gamut clipping)
        let chromaMultiplier = 1.0;
        
        // Velmi světlé (L > 0.92): exponenciální pokles pro pastely
        if (lightness > 0.92) {
            chromaMultiplier = 0.25; // Kroky 0, 50, 100
        } 
        // Světlé (0.85 < L ≤ 0.92): Light mode containers
        else if (lightness > 0.85) {
            chromaMultiplier = 0.5; // Kroky 150, 200
        } 
        // Horní mid-tones (0.70 < L ≤ 0.85): Light akcenty přechod
        else if (lightness > 0.70) {
            chromaMultiplier = 0.85; // Kroky 250, 300
        }
        // Mid-tones (0.55 ≤ L ≤ 0.70): Maximum chroma boost pro viditelnost
        else if (lightness >= 0.55 && lightness <= 0.70) {
            chromaMultiplier = 1.15; // Kroky 350, 400, 450, 500 — ideální pro dark mode akcenty
        }
        // Dolní mid-tones (0.38 < L < 0.55): Plná chroma
        else if (lightness > 0.38) {
            chromaMultiplier = 1.0; // Kroky 550, 600
        }
        // Tmavší tóny (0.28 < L ≤ 0.38): Postupný pokles
        else if (lightness > 0.28) {
            chromaMultiplier = 0.75; // Kroky 650, 700
        }
        // Tmavé (0.20 < L ≤ 0.28): Dark containers začátek
        else if (lightness > 0.20) {
            chromaMultiplier = 0.55; // Kroky 750, 800
        }
        // Velmi tmavé (L ≤ 0.20): Dark mode pozadí a surfaces
        else {
            chromaMultiplier = 0.3; // Kroky 850, 900, 950, 1000
        }
        
        const newColor = {
            ...baseOklch,
            l: lightness,
            c: baseChroma * chromaMultiplier,
        };
        scale[step as keyof ShadeScale] = formatHex(clampChroma(newColor, 'oklch'));
    }
    return scale as ShadeScale;
}

/**
 * Generuje TÓNOVANOU neutrální škálu
 */
export function generateTintedNeutrals(baseColorHex: string, chromaIntensity: number = 0.02): ShadeScale {
    const baseOklch = oklch(baseColorHex); // <-- OPRAVA
    if (!baseOklch) return {} as ShadeScale;

    const baseHue = baseOklch.h;

    const scale: Partial<ShadeScale> = {};
    for (const [step, lightness] of Object.entries(lightnessSteps)) {
        const newColor = {
            mode: 'oklch' as const,
            l: lightness,
            c: chromaIntensity,
            h: baseHue,
        };
        scale[step as keyof ShadeScale] = formatHex(clampChroma(newColor, 'oklch')); // <-- OPRAVA
    }
    return scale as ShadeScale;
}

/**
 * Generuje ČISTOU šedou škálu (bez tónu)
 */
export function generatePureNeutrals(): ShadeScale {
    const scale: Partial<ShadeScale> = {};
    for (const [step, lightness] of Object.entries(lightnessSteps)) {
        const newColor = {
            mode: 'oklch' as const,
            l: lightness,
            c: 0, // Žádná chroma = čistá šedá
            h: 0,
        };
        scale[step as keyof ShadeScale] = formatHex(clampChroma(newColor, 'oklch'));
    }
    return scale as ShadeScale;
}

/**
 * Nová funkce: Automaticky navrhne sémantické barvy
 */
export function autoGenerateSemantics(baseColor: Oklch): Record<string, string> {
    const baseChroma = baseColor.c > 0.05 ? baseColor.c : 0.1;

    const createSemanticColor = (hue: number, chroma: number, lightness: number = 0.5) => {
        return formatHex(clampChroma({ mode: 'oklch', l: lightness, c: chroma, h: hue }, 'oklch')); // <-- OPRAVA
    };

    return {
        error: createSemanticColor(25, baseChroma * 0.9),
        warning: createSemanticColor(85, baseChroma),
        success: createSemanticColor(145, baseChroma * 0.8),
        info: createSemanticColor(260, baseChroma),
    };
}

/**
 * Aplikuje saturation multiplier na škálu barev
 */
export function applySaturationMultiplier(scale: ShadeScale, multiplier: number): ShadeScale {
    const adjusted: Partial<ShadeScale> = {};
    for (const [step, hex] of Object.entries(scale)) {
        const color = oklch(hex);
        if (color) {
            adjusted[step as keyof ShadeScale] = formatHex(clampChroma({
                ...color,
                c: (color.c || 0) * multiplier,
            }, 'oklch'));
        }
    }
    return adjusted as ShadeScale;
}

/**
 * Posouvá hue (teplotu) škály o určitý počet stupňů
 */
export function applyTemperatureShift(scale: ShadeScale, shiftDegrees: number): ShadeScale {
    const adjusted: Partial<ShadeScale> = {};
    for (const [step, hex] of Object.entries(scale)) {
        const color = oklch(hex);
        if (color) {
            let newHue = (color.h || 0) + shiftDegrees;
            // Normalize hue to 0-360
            while (newHue < 0) newHue += 360;
            while (newHue >= 360) newHue -= 360;
            
            adjusted[step as keyof ShadeScale] = formatHex(clampChroma({
                ...color,
                h: newHue,
            }, 'oklch'));
        }
    }
    return adjusted as ShadeScale;
}

/**
 * Harmonické schéma: Analogous (sousední barvy, +30°)
 */
export function generateAnalogousColor(baseColorHex: string): string {
    const baseOklch = oklch(baseColorHex);
    if (!baseOklch) return baseColorHex;
    
    let newHue = (baseOklch.h || 0) + 30;
    while (newHue >= 360) newHue -= 360;
    
    return formatHex(clampChroma({
        ...baseOklch,
        h: newHue,
    }, 'oklch'));
}

/**
 * Harmonické schéma: Complementary (doplňková barva, +180°)
 */
export function generateComplementaryColor(baseColorHex: string): string {
    const baseOklch = oklch(baseColorHex);
    if (!baseOklch) return baseColorHex;
    
    let newHue = (baseOklch.h || 0) + 180;
    while (newHue >= 360) newHue -= 360;
    
    return formatHex(clampChroma({
        ...baseOklch,
        h: newHue,
    }, 'oklch'));
}

/**
 * Harmonické schéma: Triadic (trojúhelníková, 120° intervaly)
 * Vrátí 3 barvy
 */
export function generateTriadicColors(baseColorHex: string): [string, string, string] {
    const baseOklch = oklch(baseColorHex);
    if (!baseOklch) return [baseColorHex, baseColorHex, baseColorHex];
    
    const hue1 = baseOklch.h || 0;
    let hue2 = hue1 + 120;
    let hue3 = hue1 + 240;
    
    while (hue2 >= 360) hue2 -= 360;
    while (hue3 >= 360) hue3 -= 360;
    
    return [
        baseColorHex,
        formatHex(clampChroma({ ...baseOklch, h: hue2 }, 'oklch')),
        formatHex(clampChroma({ ...baseOklch, h: hue3 }, 'oklch')),
    ];
}

/**
 * Harmonické schéma: Split-Complementary (rozštěpená doplňková, 180° ± 30°)
 * Base + dva sousedé complementu
 */
export function generateSplitComplementaryColors(baseColorHex: string): [string, string, string] {
    const baseOklch = oklch(baseColorHex);
    if (!baseOklch) return [baseColorHex, baseColorHex, baseColorHex];
    
    const hue1 = baseOklch.h || 0;
    let hue2 = hue1 + 150; // 180 - 30
    let hue3 = hue1 + 210; // 180 + 30
    
    while (hue2 >= 360) hue2 -= 360;
    while (hue3 >= 360) hue3 -= 360;
    
    return [
        baseColorHex,
        formatHex(clampChroma({ ...baseOklch, h: hue2 }, 'oklch')),
        formatHex(clampChroma({ ...baseOklch, h: hue3 }, 'oklch')),
    ];
}

/**
 * Harmonické schéma: Tetradic (čtyřúhelník, 60° a 180° intervaly)
 * Vytváří obdélník na barevném kruhu
 */
export function generateTetradicColors(baseColorHex: string): [string, string, string, string] {
    const baseOklch = oklch(baseColorHex);
    if (!baseOklch) return [baseColorHex, baseColorHex, baseColorHex, baseColorHex];
    
    const hue1 = baseOklch.h || 0;
    let hue2 = hue1 + 60;  // Adjacent
    let hue3 = hue1 + 180; // Complementary
    let hue4 = hue1 + 240; // Adjacent to complementary
    
    while (hue2 >= 360) hue2 -= 360;
    while (hue3 >= 360) hue3 -= 360;
    while (hue4 >= 360) hue4 -= 360;
    
    return [
        baseColorHex,
        formatHex(clampChroma({ ...baseOklch, h: hue2 }, 'oklch')),
        formatHex(clampChroma({ ...baseOklch, h: hue3 }, 'oklch')),
        formatHex(clampChroma({ ...baseOklch, h: hue4 }, 'oklch')),
    ];
}

/**
 * Zvýší sytost škály pro high contrast režimy
 * Extra-high (AAA) dostane nejvyšší boost sytosti
 */
export function applyContrastSaturationBoost(scale: ShadeScale, contrastMode: 'default' | 'high-contrast' | 'extra-high'): ShadeScale {
    if (contrastMode === 'default') return scale;
    
    // Extra-high: 1.3x boost, High: 1.15x boost
    const boostMultiplier = contrastMode === 'extra-high' ? 1.3 : 1.15;
    
    const boostedScale: Partial<ShadeScale> = {};
    for (const [step, hex] of Object.entries(scale)) {
        const color = oklch(hex);
        if (!color) {
            boostedScale[step as keyof ShadeScale] = hex;
            continue;
        }
        
        // Zvýšíme chroma, ale respektujeme fyzikální limity
        const newColor = {
            ...color,
            c: (color.c || 0) * boostMultiplier,
        };
        
        boostedScale[step as keyof ShadeScale] = formatHex(clampChroma(newColor, 'oklch'));
    }
    
    return boostedScale as ShadeScale;
}