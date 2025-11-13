/**
 * High Contrast Mode Support
 * Rozšíření stávajícího theme systému o Material Design 3 high-contrast režim
 */

import { createMaterialTokens } from './toneContrastSystem';

type ColorScale = Record<string, string>;

type AllScales = {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    error: ColorScale;
    warning: ColorScale;
    success: ColorScale;
    info: ColorScale;
};

/**
 * Přidá high-contrast varianty tokenů k existujícímu theme
 */
export function enhanceWithHighContrast(
    scales: AllScales,
    mode: 'light' | 'dark',
    contrastLevel: 'default' | 'high-contrast'
): Record<string, string> {
    if (contrastLevel === 'default') {
        // Vrátí prázdný objekt, použijí se standardní tokeny
        return {};
    }

    // Získá base barvy pro Material tone systém
    const primaryBase = scales.primary['500'];
    const secondaryBase = scales.secondary['500'];
    const errorBase = scales.error['500'];

    // Vytvoří Material Design 3 high-contrast tokeny
    const materialTokens = createMaterialTokens(
        primaryBase,
        secondaryBase,
        errorBase,
        mode,
        'high-contrast'
    );

    return materialTokens;
}

/**
 * CSS helper pro aplikaci high-contrast režimu
 */
export function getHighContrastCSS(): string {
    return `
/* High Contrast Mode Overrides */
[data-contrast="high-contrast"],
[data-contrast="extra-high"] {
    /* Zvýšení border width pro lepší viditelnost */
    --border-width-multiplier: 2;
    
    /* Zvýšení font weight */
    --font-weight-multiplier: 1.2;
    
    /* Odstranění průhledností */
    --opacity-disabled: 1.0;
    
    /* Zvýraznění focus states */
    --focus-ring-width: 4px;
    --focus-ring-offset: 3px;
}

[data-contrast="high-contrast"] *,
[data-contrast="extra-high"] * {
    /* Odstranění jemných shadows pro čistší kontrast */
    text-shadow: none !important;
}

[data-contrast="high-contrast"] button,
[data-contrast="high-contrast"] input,
[data-contrast="high-contrast"] select,
[data-contrast="extra-high"] button,
[data-contrast="extra-high"] input,
[data-contrast="extra-high"] select {
    /* Silnější borders */
    border-width: 2px;
}

[data-contrast="high-contrast"] :focus-visible,
[data-contrast="extra-high"] :focus-visible {
    /* Výrazný focus ring */
    outline: 4px solid currentColor;
    outline-offset: 3px;
}

/* Extra High tweaks */
[data-contrast="extra-high"] {
    --border-width-multiplier: 3;
    --font-weight-multiplier: 1.3;
}
[data-contrast="extra-high"] :focus-visible {
    outline-width: 5px;
    outline-offset: 4px;
}
`;
}
