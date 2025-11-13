/**
 * cssGenerator.ts
 * ===============
 * Export design tokenů do různých formátů.
 * 
 * Podporované formáty:
 * 1. CSS Variables - :root a [data-theme="dark"]
 * 2. Tailwind v3 - JavaScript config s theme.extend.colors
 * 3. Tailwind v4 - CSS @theme direktiva
 * 4. SCSS - $color- proměnné
 * 5. JSON - Kompletní tokeny a škály
 * 6. Figma W3C - Design Tokens spec s aliasy
 * 7. CSV - Contrast audit s WCAG levels
 * 
 * Každý formát respektuje Light/Dark módy a všechny design tokeny.
 */

type ShadeScale = Record<string, string>;
type CssTokenMap = Record<string, string>;

interface Scales {
    primary: ShadeScale;
    secondary: ShadeScale;
    neutral: ShadeScale;
    error: ShadeScale;
    warning: ShadeScale;
    success: ShadeScale;
    info: ShadeScale;
}

interface Tokens {
    light: CssTokenMap;
    dark: CssTokenMap;
    surface: CssTokenMap;
}

/**
 * Generuje finální CSS string ze škál a tokenů
 */
export function generateCssString(scales: Scales, tokens: Tokens): string {
    const formatScale = (scale: Record<string, string>, name: string) => 
        Object.entries(scale).map(([key, value]) => `  --${name}-${key}: ${value};\n`).join('');
    
    const formatTokens = (tokenMap: Record<string, string>) =>
        Object.entries(tokenMap).map(([key, value]) => `  ${key}: ${value};\n`).join('');

    // Vytvoříme blok pro VŠECHNY škály
    const scalesRoot = `:root {\n${
        formatScale(scales.primary, 'primary')
    }${formatScale(scales.secondary, 'secondary')
    }${formatScale(scales.neutral, 'neutral')
    }${formatScale(scales.error, 'error')
    }${formatScale(scales.warning, 'warning')
    }${formatScale(scales.success, 'success')
    }${formatScale(scales.info, 'info')
    }}\n\n`;
    
    // Světlé a povrchové tokeny
    const lightRoot = `:root {\n${formatTokens(tokens.light)}${formatTokens(tokens.surface)}}\n\n`;
    
    // Tmavé tokeny
    const darkRoot = `[data-theme="dark"] {\n${formatTokens(tokens.dark)}}\n\n`;

    return scalesRoot + lightRoot + darkRoot;
}