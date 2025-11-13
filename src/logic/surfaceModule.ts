// src/logic/surfaceModule.ts

type CssTokenMap = Record<string, string>;

// --- Strategie pro Rádiusy ---
// Přesně jak jsi navrhoval: sémantické přiřazení
const radiusStrategies = {
    none: {
        '--radius-small-ui': '0px', // Checkbox
        '--radius-base-ui': '0px',  // Button, Input
        '--radius-large-ui': '0px', // Card, Modal
        '--radius-full': '0px',     // Avatar
    },
    medium: { // Standardní 8px
        '--radius-small-ui': '4px',
        '--radius-base-ui': '8px',
        '--radius-large-ui': '12px',
        '--radius-full': '9999px',
    },
    circular: { // "Pilulka" styl
        '--radius-small-ui': '9999px',
        '--radius-base-ui': '9999px',
        '--radius-large-ui': '16px', // Karta NEBUDE pilulka!
        '--radius-full': '9999px',
    }
};

// --- Strategie pro Stíny ---
// Používají proměnné, které definujeme níže
const shadowStrategies = {
    none: {
        '--shadow-sm': 'none',
        '--shadow-md': 'none',
        '--shadow-lg': 'none',
    },
    subtle: {
        '--shadow-sm': '0 1px 2px 0 var(--shadow-color-alpha-10)',
        '--shadow-md': '0 4px 6px -1px var(--shadow-color-alpha-15), 0 2px 4px -2px var(--shadow-color-alpha-10)',
        '--shadow-lg': '0 10px 15px -3px var(--shadow-color-alpha-15), 0 4px 6px -4px var(--shadow-color-alpha-10)',
    },
    strong: {
        '--shadow-sm': '0 2px 3px 0 var(--shadow-color-alpha-15)',
        '--shadow-md': '0 6px 8px -1px var(--shadow-color-alpha-20), 0 3px 5px -2px var(--shadow-color-alpha-15)',
        '--shadow-lg': '0 12px 18px -3px var(--shadow-color-alpha-20), 0 5px 8px -4px var(--shadow-color-alpha-15)',
    }
};

export type RadiusStrategy = keyof typeof radiusStrategies;
export type ShadowStrategy = keyof typeof shadowStrategies;

/**
 * Hlavní funkce modulu
 * Generuje rádiusy a TÓNOVANÉ stíny
 */
export function generateSurfaceTokens(
    radiusStrategy: RadiusStrategy,
    shadowStrategy: ShadowStrategy
): CssTokenMap {
    
    // --- 1. Generování Tónovaných Stínů ---
    
    // Pro jednoduchost použijeme černou s nízkou alpha
    // TODO: V příštím kroku nahradit za tónované!
    const shadowBaseTokens = {
        '--shadow-color-alpha-10': 'rgba(0, 0, 0, 0.07)',
        '--shadow-color-alpha-15': 'rgba(0, 0, 0, 0.1)',
        '--shadow-color-alpha-20': 'rgba(0, 0, 0, 0.12)',
    };
    
    const shadowTokens = shadowStrategies[shadowStrategy];

    // --- 2. Generování Rádiusů ---
    const radiusTokens = radiusStrategies[radiusStrategy];

    // --- 3. Generování Border Width ---
    const borderTokens = {
        '--border-width-default': '1px',
        '--border-width-strong': '2px',
    };
    
    // Note: neutralScale kept for potential future use in tone-aware shadows

    return {
        ...shadowBaseTokens,
        ...shadowTokens,
        ...radiusTokens,
        ...borderTokens
    };
}