// src/logic/typographyModule.ts

/**
 * Klíčová "magie" - generátor clamp() funkce
 * Zajišťuje fluidní typografii mezi dvěma body (viewporty).
 */
function generateClamp(minRem: number, maxRem: number): string {
    const MIN_VIEWPORT_PX = 320;
    const MAX_VIEWPORT_PX = 1200;

    const minVwRem = MIN_VIEWPORT_PX / 16;
    const maxVwRem = MAX_VIEWPORT_PX / 16;

    const slope = (maxRem - minRem) / (maxVwRem - minVwRem);
    const interceptRem = minRem - (minVwRem * slope);

    const preferredVw = slope * 100;

    const minStr = minRem.toFixed(3) + 'rem';
    const maxStr = maxRem.toFixed(3) + 'rem';
    const preferredStr = `${interceptRem.toFixed(3)}rem + ${preferredVw.toFixed(3)}vw`;

    return `clamp(${minStr}, ${preferredStr}, ${maxStr})`;
}

// --- Definice našich strategií (Šablony) ---

// Toto je "recept" pro Material Design 3
const materialStrategy = {
    '--type-display-large-size': generateClamp(2.8, 3.56), // 57px
    '--type-display-medium-size': generateClamp(2.3, 2.8), // 45px
    '--type-display-small-size': generateClamp(1.8, 2.25), // 36px
    '--type-headline-large-size': generateClamp(1.6, 2), // 32px
    '--type-headline-medium-size': generateClamp(1.4, 1.75), // 28px
    '--type-headline-small-size': generateClamp(1.2, 1.5), // 24px
    '--type-title-large-size': generateClamp(1.1, 1.375), // 22px
    '--type-title-medium-size': generateClamp(0.9, 1), // 16px
    '--type-title-small-size': generateClamp(0.8, 0.875), // 14px
    '--type-label-large-size': generateClamp(0.8, 0.875), // 14px
    '--type-label-medium-size': generateClamp(0.7, 0.75), // 12px
    '--type-label-small-size': generateClamp(0.6, 0.6875), // 11px
    '--type-body-large-size': generateClamp(0.9, 1), // 16px
    '--type-body-medium-size': generateClamp(0.8, 0.875), // 14px
    '--type-body-small-size': generateClamp(0.7, 0.75), // 12px
};

// Toto je "recept" pro Apple (zjednodušený)
const appleStrategy = {
    '--type-large-title-size': generateClamp(1.7, 2.125), // 34px
    '--type-title-1-size': generateClamp(1.4, 1.75), // 28px
    '--type-title-2-size': generateClamp(1.1, 1.375), // 22px
    '--type-title-3-size': generateClamp(1.0, 1.25), // 20px
    '--type-headline-size': generateClamp(0.9, 1.0625), // 17px (Bold)
    '--type-body-size': generateClamp(0.9, 1.0625), // 17px
    '--type-callout-size': generateClamp(0.85, 1), // 16px
    '--type-subheadline-size': generateClamp(0.8, 0.9375), // 15px
    '--type-footnote-size': generateClamp(0.7, 0.8125), // 13px
    '--type-caption-1-size': generateClamp(0.6, 0.75), // 12px
    '--type-caption-2-size': generateClamp(0.55, 0.6875), // 11px
};

export type TypographyStrategy = 'material' | 'apple' | 'simple';

/**
 * Hlavní "dirigent" - generuje tokeny na základě strategie
 */
export function generateTypographyTokens(
    family: string,
    baseSize: number, // (v px)
    strategy: TypographyStrategy
) {
    let strategyTokens = {};

    switch (strategy) {
        case 'material':
            strategyTokens = materialStrategy;
            break;
        case 'apple':
            strategyTokens = appleStrategy;
            break;
        case 'simple':
        default:
            // Jednoduchá strategie, pokud nechceme M3/Apple
            strategyTokens = {
                '--type-heading-1': generateClamp(1.5, 2.5),
                '--type-heading-2': generateClamp(1.2, 2.0),
                '--type-body': generateClamp(0.9, 1.0),
                '--type-small': generateClamp(0.8, 0.875),
            };
            break;
    }

    // Základní tokeny, které tam budou vždy
    const baseTokens = {
        '--font-family-base': family,
        '--font-size-base': `${baseSize}px`,
        // (V budoucnu můžeme násobit baseSize, ale teď používáme REM)
    };

    return { ...baseTokens, ...strategyTokens };
}