// src/logic/colorModule.ts
import { type Oklch, formatHex, oklch, clampChroma } from 'culori'; // <-- TOTO JE TA OPRAVA

// Naše definice kroků světlosti (0-1000, po 50)
// S perceptuálním easingem pro lepší vizuální odstupňování
const lightnessSteps = {
    '0': 1.0,      // Nejsvětlejší - bílá
    '50': 0.98,
    '100': 0.95,
    '150': 0.92,
    '200': 0.88,
    '250': 0.83,
    '300': 0.77,
    '350': 0.71,
    '400': 0.65,
    '450': 0.59,
    '500': 0.53,   // Střední tón
    '550': 0.47,
    '600': 0.41,
    '650': 0.36,
    '700': 0.31,
    '750': 0.27,
    '800': 0.23,
    '850': 0.19,
    '900': 0.15,
    '950': 0.10,
    '1000': 0.05,  // Nejtmavší - černá
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
        // Adaptivní chroma: optimalizováno pro light i dark mode
        let chromaMultiplier = 1.0;
        
        if (lightness > 0.90) { // Velmi světlé (0, 50) - pro light mode pozadí
            chromaMultiplier = 0.3;
        } else if (lightness > 0.80) { // Světlé (100, 150, 200) - containers v light mode
            chromaMultiplier = 0.6;
        } else if (lightness >= 0.65 && lightness <= 0.77) { // Mid-tones (300-400) - dark mode akcenty
            chromaMultiplier = 1.1; // Boost pro dark mode viditelnost
        } else if (lightness < 0.20) { // Velmi tmavé (900-1000) - dark mode pozadí
            chromaMultiplier = 0.35;
        } else if (lightness < 0.30) { // Tmavé (750-850) - dark mode surfaces
            chromaMultiplier = 0.65;
        }
        
        const newColor = {
            ...baseOklch,
            l: lightness,
            c: baseChroma * chromaMultiplier,
        };
        scale[step as keyof ShadeScale] = formatHex(clampChroma(newColor, 'oklch')); // <-- OPRAVA
    }
    return scale as ShadeScale;
}

/**
 * Generuje TÓNOVANOU neutrální škálu
 */
export function generateTintedNeutrals(baseColorHex: string): ShadeScale {
    const baseOklch = oklch(baseColorHex); // <-- OPRAVA
    if (!baseOklch) return {} as ShadeScale;

    const baseHue = baseOklch.h;
    const TINT_CHROMA = 0.02;

    const scale: Partial<ShadeScale> = {};
    for (const [step, lightness] of Object.entries(lightnessSteps)) {
        const newColor = {
            mode: 'oklch' as const,
            l: lightness,
            c: TINT_CHROMA,
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