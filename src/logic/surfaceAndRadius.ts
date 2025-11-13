/**
 * surfaceAndRadius.ts
 * ===================
 * Generování surface tokenů (radius, shadows, borders).
 * 
 * Radius strategie:
 * - none: Všechny rohy 0px (sharp design)
 * - medium: 4px/8px/12px (Material Design like)
 * - circular: 9999px pro UI, 16px pro karty (iOS like)
 * 
 * Shadow strategie:
 * - none: Bez stínů (flat design)
 * - subtle: Jemné stíny (Material Design)
 * - strong: Výrazné stíny (card elevations)
 * 
 * Border widths:
 * - default: 1px
 * - strong: 2px
 */
type CssTokenMap = Record<string, string>;

// --- Strategie pro Rádiusy ---
const radiusStrategies = {
    none: {
        '--radius-small-ui': '0px',
        '--radius-base-ui': '0px',
        '--radius-large-ui': '0px',
        '--radius-full': '0px',
    },
    medium: {
        '--radius-small-ui': '4px',
        '--radius-base-ui': '8px',
        '--radius-large-ui': '12px',
        '--radius-full': '9999px',
    },
    circular: {
        '--radius-small-ui': '9999px',
        '--radius-base-ui': '9999px',
        '--radius-large-ui': '16px',
        '--radius-full': '9999px',
    }
};

// --- Strategie pro Stíny ---
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

export function generateSurfaceTokens(
    radiusStrategy: RadiusStrategy,
    shadowStrategy: ShadowStrategy
): CssTokenMap {
    
    // Použijeme černou s nízkou alpha.
    // Náš token '--color-shadow' je definován v tokenMapper
    const shadowBaseTokens = {
        '--shadow-color-alpha-10': 'rgba(0, 0, 0, 0.07)',
        '--shadow-color-alpha-15': 'rgba(0, 0, 0, 0.1)',
        '--shadow-color-alpha-20': 'rgba(0, 0, 0, 0.12)',
    };
    
    const shadowTokens = shadowStrategies[shadowStrategy];
    const radiusTokens = radiusStrategies[radiusStrategy];
    const borderTokens = {
        '--border-width-default': '1px',
        '--border-width-strong': '2px',
    };

    return {
        ...shadowBaseTokens,
        ...shadowTokens,
        ...radiusTokens,
        ...borderTokens
    };
}