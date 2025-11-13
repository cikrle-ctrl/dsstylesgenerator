/**
 * Material Design 3 Tone-Based Contrast System
 * 
 * Implementuje HCT (Hue, Chroma, Tone) principy pro dynamický kontrast:
 * - Standard contrast: 3:1 pro UI elementy, 4.5:1 pro text
 * - High contrast: 7:1 pro všechny elementy
 * 
 * Na rozdíl od jiných color spaces (HSL, RGB), HCT umožňuje měnit
 * hue a chroma bez ovlivnění tone (lightness).
 */

import { oklch, formatHex, clampChroma } from 'culori';
import type { Oklch } from 'culori';

// Tone hodnoty pro různé role v Material Design 3
export const MaterialTones = {
    light: {
        default: {
            primary: 40,              // Hlavní akce
            onPrimary: 100,          // Text na primary
            primaryContainer: 90,     // Kontejner pro primary
            onPrimaryContainer: 10,   // Text na container
            
            secondary: 40,
            onSecondary: 100,
            secondaryContainer: 90,
            onSecondaryContainer: 10,
            
            error: 40,
            onError: 100,
            errorContainer: 90,
            onErrorContainer: 10,
            
            surface: 98,             // Hlavní pozadí
            onSurface: 10,           // Text na surface
            surfaceVariant: 90,      // Variant surface
            onSurfaceVariant: 30,    // Text na variant
            
            outline: 50,             // Outline elementy
            outlineVariant: 80,
            
            inverseSurface: 20,
            inverseOnSurface: 95,
            inversePrimary: 80
        },
        highContrast: {
            primary: 30,             // Tmavší pro vyšší kontrast
            onPrimary: 100,
            primaryContainer: 95,    // Světlejší container
            onPrimaryContainer: 0,   // Černá pro max kontrast
            
            secondary: 30,
            onSecondary: 100,
            secondaryContainer: 95,
            onSecondaryContainer: 0,
            
            error: 30,
            onError: 100,
            errorContainer: 95,
            onErrorContainer: 0,
            
            surface: 100,            // Čistě bílá
            onSurface: 0,            // Čistě černá
            surfaceVariant: 95,
            onSurfaceVariant: 10,
            
            outline: 40,
            outlineVariant: 70,
            
            inverseSurface: 10,
            inverseOnSurface: 100,
            inversePrimary: 90
        }
    },
    dark: {
        default: {
            primary: 80,
            onPrimary: 20,
            primaryContainer: 30,
            onPrimaryContainer: 90,
            
            secondary: 80,
            onSecondary: 20,
            secondaryContainer: 30,
            onSecondaryContainer: 90,
            
            error: 80,
            onError: 20,
            errorContainer: 30,
            onErrorContainer: 90,
            
            surface: 6,
            onSurface: 90,
            surfaceVariant: 30,
            onSurfaceVariant: 80,
            
            outline: 60,
            outlineVariant: 30,
            
            inverseSurface: 90,
            inverseOnSurface: 20,
            inversePrimary: 40
        },
        highContrast: {
            primary: 90,             // Světlejší pro dark high contrast
            onPrimary: 10,
            primaryContainer: 20,    // Tmavší container
            onPrimaryContainer: 100, // Bílá pro max kontrast
            
            secondary: 90,
            onSecondary: 10,
            secondaryContainer: 20,
            onSecondaryContainer: 100,
            
            error: 90,
            onError: 10,
            errorContainer: 20,
            onErrorContainer: 100,
            
            surface: 0,              // Čistě černá
            onSurface: 100,          // Čistě bílá
            surfaceVariant: 10,
            onSurfaceVariant: 90,
            
            outline: 70,
            outlineVariant: 40,
            
            inverseSurface: 95,
            inverseOnSurface: 0,
            inversePrimary: 30
        }
    }
};

/**
 * Převede tone (0-100) na lightness v OKLCH (0-1)
 * Používá perceptuální mapping pro přesné tone hodnoty
 */
function toneToLightness(tone: number): number {
    // Material používá speciální mapping pro tone → lightness
    // Pro jednoduchost používáme lineární s korekcí na krajích
    if (tone === 0) return 0.0;
    if (tone === 100) return 1.0;
    
    // Perceptuální mapping
    const normalized = tone / 100;
    // Lehce nelineární pro lepší distribuci
    return Math.pow(normalized, 0.9);
}

/**
 * Aplikuje tone na barvu zachováním hue a chroma
 * Toto je klíčová vlastnost HCT - můžeme měnit lightness nezávisle
 */
export function applyTone(baseColor: string, tone: number): string {
    const color = oklch(baseColor);
    if (!color) return baseColor;
    
    const lightness = toneToLightness(tone);
    
    // Adaptive chroma based on tone (Material principle)
    // Chroma se musí redukovat na extrémech kvůli fyzikálním limitům
    let chromaMultiplier = 1.0;
    if (tone >= 95 || tone <= 5) {
        chromaMultiplier = 0.3; // Velmi světlé/tmavé
    } else if (tone >= 85 || tone <= 15) {
        chromaMultiplier = 0.6; // Světlé/tmavé
    } else if (tone >= 75 || tone <= 25) {
        chromaMultiplier = 0.8; // Lehce světlé/tmavé
    }
    
    const newColor: Oklch = {
        mode: 'oklch',
        l: lightness,
        c: (color.c || 0) * chromaMultiplier,
        h: color.h || 0
    };
    
    return formatHex(clampChroma(newColor, 'oklch'));
}

/**
 * Generuje kompletní tone palette pro barvu (0-100 po 10)
 */
export function generateTonalPalette(baseColor: string): Record<number, string> {
    const palette: Record<number, string> = {};
    
    // Material používá tone hodnoty: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100
    const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
    
    tones.forEach(tone => {
        palette[tone] = applyTone(baseColor, tone);
    });
    
    return palette;
}

/**
 * Harmonizuje barvu s jinou barvou (Material color harmonization)
 * Posune hue blíže k target hue pro lepší vizuální soulad
 */
export function harmonize(colorToHarmonize: string, targetColor: string): string {
    const source = oklch(colorToHarmonize);
    const target = oklch(targetColor);
    
    if (!source || !target || source.h === undefined || target.h === undefined) {
        return colorToHarmonize;
    }
    
    // Vypočítá rozdíl v hue
    let hueDiff = target.h - source.h;
    
    // Normalizace na -180 až 180
    while (hueDiff > 180) hueDiff -= 360;
    while (hueDiff < -180) hueDiff += 360;
    
    // Posun o 1/6 rozdílu (Material harmonization ratio)
    const newHue = (source.h + hueDiff / 6 + 360) % 360;
    
    const harmonized: Oklch = {
        ...source,
        h: newHue
    };
    
    return formatHex(clampChroma(harmonized, 'oklch'));
}

/**
 * Vytvoří tokeny podle Material Design 3 tone systému
 */
export function createMaterialTokens(
    primaryColor: string,
    secondaryColor: string,
    errorColor: string,
    themeMode: 'light' | 'dark',
    contrastMode: 'default' | 'high-contrast'
): Record<string, string> {
    const tones = MaterialTones[themeMode][contrastMode === 'high-contrast' ? 'highContrast' : 'default'];
    
    // Generuje tonal palety
    const primaryPalette = generateTonalPalette(primaryColor);
    const secondaryPalette = generateTonalPalette(secondaryColor);
    const errorPalette = generateTonalPalette(errorColor);
    
    // Neutral palette z desaturované primary
    const neutralBase = oklch(primaryColor);
    const neutralColor = neutralBase ? formatHex(clampChroma({ ...neutralBase, c: 0.02 }, 'oklch')) : '#808080';
    const neutralPalette = generateTonalPalette(neutralColor);
    
    // Vytvoří tokeny
    return {
        // Primary
        '--color-primary': primaryPalette[tones.primary],
        '--color-on-primary': primaryPalette[tones.onPrimary],
        '--color-primary-container': primaryPalette[tones.primaryContainer],
        '--color-on-primary-container': primaryPalette[tones.onPrimaryContainer],
        
        // Secondary
        '--color-secondary': secondaryPalette[tones.secondary],
        '--color-on-secondary': secondaryPalette[tones.onSecondary],
        '--color-secondary-container': secondaryPalette[tones.secondaryContainer],
        '--color-on-secondary-container': secondaryPalette[tones.onSecondaryContainer],
        
        // Error
        '--color-error': errorPalette[tones.error],
        '--color-on-error': errorPalette[tones.onError],
        '--color-error-container': errorPalette[tones.errorContainer],
        '--color-on-error-container': errorPalette[tones.onErrorContainer],
        
        // Surface
        '--color-surface': neutralPalette[tones.surface],
        '--color-on-surface': neutralPalette[tones.onSurface],
        '--color-surface-variant': neutralPalette[tones.surfaceVariant],
        '--color-on-surface-variant': neutralPalette[tones.onSurfaceVariant],
        
        // Outline
        '--color-outline': neutralPalette[tones.outline],
        '--color-outline-variant': neutralPalette[tones.outlineVariant],
        
        // Inverse
        '--color-inverse-surface': neutralPalette[tones.inverseSurface],
        '--color-inverse-on-surface': neutralPalette[tones.inverseOnSurface],
        '--color-inverse-primary': primaryPalette[tones.inversePrimary]
    };
}
