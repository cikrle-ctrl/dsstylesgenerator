// src/logic/contrastChecker.ts
import { converter } from 'culori/fn';

const rgb = converter('rgb');

/**
 * Calculate relative luminance of a color according to WCAG 2.1
 */
function getRelativeLuminance(color: string): number {
    const rgbColor = rgb(color);
    if (!rgbColor) return 0;

    const { r, g, b } = rgbColor;
    
    // Convert to linear RGB
    const linearRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    // Calculate luminance
    return 0.2126 * linearRGB[0] + 0.7152 * linearRGB[1] + 0.0722 * linearRGB[2];
}

/**
 * Měří WCAG kontrast mezi dvěma HEX barvami
 */
export function getContrast(color1: string, color2: string): number {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Najde nejlepší barvu textu (z poskytnutých možností) pro dané pozadí.
 * Vrací první, která splní minimální poměr.
 */
export function findBestContrast(
    background: string,
    textOptions: string[],
    minRatio: number
): string {
    for (const option of textOptions) {
        if (getContrast(background, option) >= minRatio) {
            return option;
        }
    }
    return textOptions.reduce((best, current) => {
        const bestContrast = getContrast(background, best);
        const currentContrast = getContrast(background, current);
        return currentContrast > bestContrast ? current : best;
    }, textOptions[0]);
}