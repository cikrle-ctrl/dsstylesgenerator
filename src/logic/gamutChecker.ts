// src/logic/gamutChecker.ts
import { converter, inGamut } from 'culori/fn';

const rgb = converter('rgb');
const oklch = converter('oklch');

/**
 * Checks if a color is within sRGB gamut
 * @param colorHex - Hex color string
 * @returns true if color is in sRGB gamut, false if clipped/out-of-gamut
 */
export function isInSRGBGamut(colorHex: string): boolean {
    try {
        const rgbColor = rgb(colorHex);
        if (!rgbColor) return false;
        
        return inGamut('rgb')(rgbColor);
    } catch {
        return false;
    }
}

/**
 * Checks if a color's OKLCH values would be clipped in sRGB
 * Useful for showing warnings before conversion
 */
export function wouldClipInSRGB(l: number, c: number, h: number): boolean {
    const color = { mode: 'oklch' as const, l, c, h };
    const rgbColor = rgb(color);
    
    if (!rgbColor) return true;
    
    return !inGamut('rgb')(rgbColor);
}

/**
 * Get gamut information for a color
 * @returns Object with gamut status and potential alternatives
 */
export function getGamutInfo(colorHex: string) {
    const isValid = isInSRGBGamut(colorHex);
    const oklchColor = oklch(colorHex);
    
    if (!oklchColor) {
        return {
            inGamut: false,
            warning: 'Invalid color',
            severity: 'high' as const,
        };
    }
    
    if (isValid) {
        return {
            inGamut: true,
            warning: null,
            severity: 'none' as const,
        };
    }
    
    // Color is out of gamut - determine severity
    const { c } = oklchColor;
    const chromaExcess = c && c > 0.3 ? 'high' : c && c > 0.2 ? 'medium' : 'low';
    
    return {
        inGamut: false,
        warning: 'Outside sRGB gamut - may appear different on older displays',
        severity: chromaExcess as 'high' | 'medium' | 'low',
        suggestion: 'Reduce chroma or adjust lightness for better compatibility',
    };
}
