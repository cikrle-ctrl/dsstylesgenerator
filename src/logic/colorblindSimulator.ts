/**
 * Colorblind simulation using color matrix transformations
 * Based on Brettel, Viénot and Mollon JPEG algorithm
 */

type ColorblindType = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'grayscale';

interface RGB {
    r: number;
    g: number;
    b: number;
}

// Převod hex na RGB
function hexToRgb(hex: string): RGB {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16)
    };
}

// Převod RGB na hex
function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => {
        const clamped = Math.max(0, Math.min(255, Math.round(n)));
        return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// Aplikuje color matrix na RGB hodnoty
function applyMatrix(rgb: RGB, matrix: number[][]): RGB {
    return {
        r: matrix[0][0] * rgb.r + matrix[0][1] * rgb.g + matrix[0][2] * rgb.b,
        g: matrix[1][0] * rgb.r + matrix[1][1] * rgb.g + matrix[1][2] * rgb.b,
        b: matrix[2][0] * rgb.r + matrix[2][1] * rgb.g + matrix[2][2] * rgb.b
    };
}

// Color matrices pro různé typy barvosleposti
const matrices: Record<Exclude<ColorblindType, 'none'>, number[][]> = {
    // Deuteranopia (red-green, nejčastější)
    deuteranopia: [
        [0.625, 0.375, 0.0],
        [0.7, 0.3, 0.0],
        [0.0, 0.3, 0.7]
    ],
    // Protanopia (red-green)
    protanopia: [
        [0.567, 0.433, 0.0],
        [0.558, 0.442, 0.0],
        [0.0, 0.242, 0.758]
    ],
    // Tritanopia (blue-yellow, vzácná)
    tritanopia: [
        [0.95, 0.05, 0.0],
        [0.0, 0.433, 0.567],
        [0.0, 0.475, 0.525]
    ],
    // Grayscale (achromatopsia)
    grayscale: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114]
    ]
};

/**
 * Simuluje barvoslepost na hex barvě
 */
export function simulateColorblindness(hex: string, type: ColorblindType): string {
    if (type === 'none' || !hex) return hex;
    
    const rgb = hexToRgb(hex);
    const transformed = applyMatrix(rgb, matrices[type]);
    return rgbToHex(transformed);
}

/**
 * Aplikuje colorblind filtr na celý token set
 */
export function applyColorblindFilter(
    tokens: Record<string, string>,
    type: ColorblindType
): Record<string, string> {
    if (type === 'none') return tokens;
    
    const filtered: Record<string, string> = {};
    Object.entries(tokens).forEach(([key, value]) => {
        filtered[key] = simulateColorblindness(value, type);
    });
    return filtered;
}

/**
 * Názvy pro UI
 */
export const colorblindLabels: Record<ColorblindType, string> = {
    none: 'Normal Vision',
    deuteranopia: 'Deuteranopia (Red-Green)',
    protanopia: 'Protanopia (Red-Green)',
    tritanopia: 'Tritanopia (Blue-Yellow)',
    grayscale: 'Grayscale (Achromatopsia)'
};
