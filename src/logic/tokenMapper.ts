/**
 * tokenMapper.ts
 * ==============
 * Mapování barevných škál na sémantické design tokeny.
 * 
 * Kombinuje dva přístupy:
 * 1. DYNAMICKÉ mapování: FindOptimalShade, FindOptimalContainer, GetOnColor
 *    - Vybírá kroky podle WCAG kontrastu (4.5:1, 7:1, 9:1)
 *    - Adaptivní pro různé kontrastní módy (Default/High/Extra-High)
 * 
 * 2. STATICKÉ mapování: Surface, text, disabled tokeny
 *    - Pevně definované kroky z formálního algoritmu (Krok 4 + 6D)
 *    - Konzistentní napříč tématy
 * 
 * Výstup:
 * - 100+ CSS custom properties (--color-primary, --color-on-primary, etc.)
 * - Light/Dark módy
 * - Support pro high contrast režimy
 */
import { findBestContrast, findOptimalStepByContrast } from './contrastChecker';
import { findClosestStepInScale } from './colorModule';
import { generateTonalPalette } from './toneContrastSystem';

type ShadeScale = Record<string, string>;
type CssTokenMap = Record<string, string>;
type ContrastMode = 'default' | 'high-contrast' | 'extra-high';

// Typ pro kompletní sadu škál
type AllScales = {
    primary: ShadeScale;
    secondary: ShadeScale;
    neutral: ShadeScale;
    error: ShadeScale;
    warning: ShadeScale;
    success: ShadeScale;
    info: ShadeScale;
};

// Typ pro input barvy (pro stay true feature)
type InputColors = {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
};

// Typ pro custom tone overrides (Profi režim)
type CustomTones = {
    primary?: { light?: number; dark?: number };
    secondary?: { light?: number; dark?: number };
    error?: { light?: number; dark?: number };
    warning?: { light?: number; dark?: number };
    success?: { light?: number; dark?: number };
    info?: { light?: number; dark?: number };
};

/**
 * Konvertuje HCT tonal palette na naš ShadeScale formát (0-1000 kroky)
 * HCT používá tóny 0-100, my používáme 0-1000 po krocích 50
 */
function convertHctToScale(baseColor: string): ShadeScale {
    const tonalPalette = generateTonalPalette(baseColor);
    
    // Mapování našich kroků na HCT tóny
    const toneMapping: Record<string, number> = {
        '0': 100,      // Nejsvětlejší
        '50': 99,
        '100': 95,
        '150': 90,
        '200': 85,
        '250': 80,
        '300': 70,
        '350': 60,
        '400': 50,
        '450': 45,
        '500': 40,     // Střední
        '550': 35,
        '600': 30,
        '650': 25,
        '700': 20,
        '750': 15,
        '800': 10,
        '850': 8,
        '900': 6,
        '950': 4,
        '1000': 0,     // Nejtmavší
    };
    
    const scale: Record<string, string> = {};
    for (const [step, tone] of Object.entries(toneMapping)) {
        scale[step] = tonalPalette[tone];
    }
    
    return scale as ShadeScale;
}

// Pomocná funkce pro generování sady tokenů (Primary, Secondary, Error...)
function createTokenSet(
    scales: AllScales,
    name: keyof AllScales,
    mode: 'light' | 'dark',
    contrast: ContrastMode,
    stayTrueToInputColor: boolean,
    inputColor?: string,
    customTones?: CustomTones
): CssTokenMap {
    const isLight = mode === 'light';
    const s = scales[name]; // např. scales.primary
    const n = scales.neutral; // neutrální škála

    // Určíme background pro výpočet kontrastu (SURFACE, ne neutral-0/1000!)
    const backgroundHex = isLight ? n['0'] : n['950'];

    // Cílové kontrasty podle režimu a typu tokenu
    // Kontrastní tabulka:
    // Light Default: 4.5:1 (akcent), 3.0:1 (container)
    // Light High: 7.0:1 (akcent), 4.5:1 (container)
    // Light Extra-High: 9.0:1 (akcent), 7.0:1 (container)
    // Dark Default: 4.5:1 (akcent), 3.0:1 (container)
    // Dark High: 7.0:1 (akcent), 4.5:1 (container)
    // Dark Extra-High: 9.0:1 (akcent), 7.0:1 (container)
    
    const accentContrast = (() => {
        if (contrast === 'extra-high') return 9.0;
        if (contrast === 'high-contrast') return 7.0;
        return 4.5; // default
    })();

    const containerContrast = (() => {
        if (contrast === 'extra-high') return 7.0;
        if (contrast === 'high-contrast') return 4.5;
        return 3.0; // default
    })();

    // A. FindOptimalShade (Pro akcenty - primary, secondary, error...)
    // Najde krok s kontrastem nejblíže accentContrast
    const baseStep = (() => {
        // 1. Profi režim - vlastní tóny (pouze pro semantic colors, ne neutral)
        if (customTones && name !== 'neutral' && customTones[name as keyof typeof customTones]) {
            const customTone = mode === 'light' 
                ? customTones[name as keyof typeof customTones]?.light 
                : customTones[name as keyof typeof customTones]?.dark;
            if (customTone !== undefined) {
                const clampedTone = Math.min(1000, Math.max(0, Math.round(customTone / 50) * 50));
                return String(clampedTone);
            }
        }
        
        // 2. Stay true to input color - najdi nejbližší krok v rozsahu 300-600
        if (stayTrueToInputColor && inputColor) {
            return findClosestStepInScale(inputColor, s, 300, 600);
        }
        
        // 3. SPRÁVNÝ ALGORITMUS: FindOptimalShade
        // Light mode: preferuj rozsah 400-700 (tmavší barvy pro dobrý kontrast na bílém)
        // Dark mode: preferuj rozsah 300-600 (světlejší barvy pro dobrý kontrast na černém)
        const range: [number, number] = isLight ? [400, 700] : [300, 600];
        return findOptimalStepByContrast(s, backgroundHex, accentContrast, range);
    })();

    // B. FindOptimalContainer (Pro kontejnery)
    // Kontejnery potřebují NIŽŠÍ kontrast (3.0:1 v default, 4.5:1 v high, 7.0:1 v extra-high)
    // Light mode: světlejší tóny
    // Dark mode: tmavší tóny
    const containerStep = (() => {
        // Pro default mode: pevné hodnoty 200 (light) a 800 (dark)
        if (contrast === 'default') {
            return isLight ? '200' : '800';
        }
        // Pro high contrast módy: dynamické hledání
        const range: [number, number] = isLight ? [100, 300] : [700, 900];
        return findOptimalStepByContrast(s, backgroundHex, containerContrast, range);
    })();
    const containerColor = s[containerStep];

    // Pomocné funkce pro práci se stupnicí
    const clampStep = (value: number) => Math.min(1000, Math.max(0, value));
    const toStepKey = (value: number) => String(clampStep(Math.round(value / 50) * 50));
    const offsetStep = (baseKey: string, delta: number) => {
        const base = parseInt(baseKey, 10);
        return toStepKey(base + delta);
    };

    // Hover/Pressed stavy: offsety od base
    // Light mode: tmavší (+ delta)
    // Dark mode: světlejší (- delta)
    const hoverDelta = isLight ? 100 : -100;
    const pressedDelta = isLight ? 200 : -200;

    const baseHover = s[offsetStep(baseStep, hoverDelta)];
    const basePressed = s[offsetStep(baseStep, pressedDelta)];

    // Container hover/pressed
    const containerHover = s[offsetStep(containerStep, hoverDelta)];
    const containerPressed = s[offsetStep(containerStep, pressedDelta)];

    // Fix tokeny (fix = 400 vždy, nezávisle na módu)
    const fixHover = s['500'];
    const fixPressed = s['600'];
    
    // C. GetOnColor (Pro text na barevném pozadí)
    // VŽDY jen neutral-0 (bílá) nebo neutral-1000 (černá)
    // Respektuje lightness pozadí pro lepší vizuální hierarchii
    const getOnColor = (bgColor: string): string => {
        // Převedeme hex na OKLCH a zjistíme lightness
        const rgb = hexToRgb(bgColor);
        if (!rgb) return n['0']; // fallback
        
        const [r, g, b] = rgb;
        // Aproximace relativní luminance (simplified)
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        
        // Pokud je pozadí světlé (> 50% lightness), použij černý text
        // Pokud je pozadí tmavé (< 50% lightness), použij bílý text
        return luminance > 0.5 ? n['1000'] : n['0'];
    };
    
    // Pomocná funkce pro převod hex -> RGB
    function hexToRgb(hex: string): [number, number, number] | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }
    
    // D. GetOnContainerColor (Pro text na container pozadí)
    // Preferuj hodnoty ze škály: 900 > 1000 > 800 > 100 > 0
    // Light mode: preferuj tmavé (900, 1000, 800)
    // Dark mode: preferuj světlé (100, 0)
    const getOnContainerColor = (bgColor: string): string => {
        const candidates = isLight 
            ? [s['900'], s['1000'], s['800'], s['700'], n['1000'], n['900'], n['0']]
            : [s['100'], s['0'], s['200'], s['300'], n['0'], n['100'], n['1000']];
        
        return findBestContrast(
            bgColor,
            candidates,
            accentContrast
        );
    };

    // Základní tokeny
    const tokens: CssTokenMap = {
        // Hlavní akcent
        [`--color-${name}`]: s[baseStep],
        [`--color-on-${name}`]: getOnColor(s[baseStep]),
        
        // Container
        [`--color-${name}-container`]: containerColor,
        [`--color-on-${name}-container`]: getOnContainerColor(containerColor),        
        // Fix varianty (fix = 400 vždy)
        [`--color-${name}-fix`]: s['400'],
        [`--color-${name}-fix-hover`]: fixHover,
        [`--color-${name}-fix-pressed`]: fixPressed,
        [`--color-on-${name}-fix`]: getOnColor(s['400']),
        [`--color-on-${name}-fix-hover`]: getOnColor(fixHover),
        [`--color-on-${name}-fix-pressed`]: getOnColor(fixPressed),
        
        // Hover stavy
        [`--color-${name}-hover`]: baseHover,
        [`--color-on-${name}-hover`]: getOnColor(baseHover),
        
        // Pressed stavy
        [`--color-${name}-pressed`]: basePressed,
        [`--color-on-${name}-pressed`]: getOnColor(basePressed),
        
        // Container hover/pressed
        [`--color-${name}-container-hover`]: containerHover,
        [`--color-on-${name}-container-hover`]: getOnContainerColor(containerHover),
        [`--color-${name}-container-pressed`]: containerPressed,
        [`--color-on-${name}-container-pressed`]: getOnContainerColor(containerPressed),
    };
    return tokens;
}

/**
 * Hlavní funkce, která generuje VŠECHNY tokeny pro daný mód
 */
function getTokens(
    scales: AllScales, 
    mode: 'light' | 'dark', 
    contrast: ContrastMode,
    stayTrueToInputColor: boolean,
    inputColors?: InputColors,
    customTones?: CustomTones
): CssTokenMap {
    const isLight = mode === 'light';
    const n = scales.neutral;

    // Vypočítáme accent kontrast pro použití níže (Focus token)
    const accentContrast = (() => {
        if (contrast === 'extra-high') return 9.0;
        if (contrast === 'high-contrast') return 7.0;
        return 4.5; // default
    })();

    const primarySet = createTokenSet(scales, 'primary', mode, contrast, stayTrueToInputColor, inputColors?.primary, customTones);
    const secondarySet = createTokenSet(scales, 'secondary', mode, contrast, stayTrueToInputColor, inputColors?.secondary, customTones);
    const errorSet = createTokenSet(scales, 'error', mode, contrast, stayTrueToInputColor, inputColors?.error, customTones);
    const warningSet = createTokenSet(scales, 'warning', mode, contrast, stayTrueToInputColor, inputColors?.warning, customTones);
    const successSet = createTokenSet(scales, 'success', mode, contrast, stayTrueToInputColor, inputColors?.success, customTones);
    const infoSet = createTokenSet(scales, 'info', mode, contrast, stayTrueToInputColor, inputColors?.info, customTones);

    // Základní tokeny podle finální specifikace (Krok 4 + 6 algoritmu)
    const baseTokens: CssTokenMap = {
        // Surface (Povrchy a Pozadí) - Krok 4: Definice Režimů a Sémantických Povrchů
        // background: Vnější pozadí stránky ("za" kartami)
        '--color-background': isLight ? n['50'] : n['1000'],
        
        // surface-default: Výchozí pozadí komponent (karty, modály) - hlavní pozadí pro výpočty kontrastu
        '--color-surface': isLight ? n['0'] : n['950'],
        
        // surface-variant: Pozadí pro odlišené sekce (tmavší na světlém, světlejší na tmavém)
        '--color-surface-variant': isLight ? n['100'] : n['900'],
        
        '--color-inverse-surface': isLight ? n['950'] : n['0'],

        // OnSurface (Texty a Ikony) - Krok 6D: Statická mapování pro Text
        // on-surface-heading: Nejvyšší důraz, téměř černá/bílá
        '--color-on-surface-heading': isLight ? n['950'] : n['50'],
        
        // on-surface-variant: Standardní text (body)
        // Light: 700 (default), 800 (high), 900 (extra-high)
        // Dark: 300 (default), 200 (high), 100 (extra-high)
        '--color-on-surface-variant': (() => {
            if (isLight) {
                if (contrast === 'extra-high') return n['900'];
                if (contrast === 'high-contrast') return n['800'];
                return n['700'];
            } else {
                if (contrast === 'extra-high') return n['100'];
                if (contrast === 'high-contrast') return n['200'];
                return n['300'];
            }
        })(),
        
        // on-surface-subtle: Nízký důraz (placeholders, captions)
        // Light: 400 (default), 500 (high), 600 (extra-high)
        // Dark: 600 (default), 500 (high), 400 (extra-high)
        '--color-on-surface-subtle': (() => {
            if (isLight) {
                if (contrast === 'extra-high') return n['600'];
                if (contrast === 'high-contrast') return n['500'];
                return n['400'];
            } else {
                if (contrast === 'extra-high') return n['400'];
                if (contrast === 'high-contrast') return n['500'];
                return n['600'];
            }
        })(),
        
        '--color-on-surface-inverse': isLight ? n['0'] : n['1000'],
        '--color-primary-inverse': isLight ? scales.primary['300'] : scales.primary['500'],

        // Outline (Ohraničení) - Fixní hodnoty pro default mode, dynamické pro high contrast
        // Používají neutral škálu
        ...(() => {
            const surfaceHex = isLight ? n['0'] : n['950'];
            
            // Pro default contrast mode používáme fixní kroky
            if (contrast === 'default') {
                return {
                    '--color-outline-subtle': isLight ? n['150'] : n['850'],
                    '--color-outline-default': isLight ? n['300'] : n['700'],
                    '--color-outline-hover': isLight ? n['350'] : n['650'],
                    '--color-outline-pressed': isLight ? n['450'] : n['550'],
                    '--color-outline-strong': isLight ? n['400'] : n['600'],
                } as CssTokenMap;
            }
            
            // Pro high contrast režimy - dynamické výpočty
            const subtleTarget = 2.0;
            const defaultTarget = contrast === 'extra-high' ? 4.5 : 3.5;
            const hoverTarget = contrast === 'extra-high' ? 5.0 : 4.0;
            const pressedTarget = contrast === 'extra-high' ? 6.0 : 4.5;
            const strongTarget = contrast === 'extra-high' ? 7.0 : 5.5;
            
            // Adjusted ranges for high contrast
            const subtleRange: [number, number] = isLight ? [100, 200] : [800, 900];
            const defaultRange: [number, number] = isLight ? [300, 500] : [500, 700];
            const hoverRange: [number, number] = isLight ? [350, 550] : [450, 650];
            const pressedRange: [number, number] = isLight ? [450, 650] : [350, 550];
            const strongRange: [number, number] = isLight ? [400, 600] : [400, 600];
            
            return {
                '--color-outline-subtle': n[findOptimalStepByContrast(n, surfaceHex, subtleTarget, subtleRange)],
                '--color-outline-default': n[findOptimalStepByContrast(n, surfaceHex, defaultTarget, defaultRange)],
                '--color-outline-hover': n[findOptimalStepByContrast(n, surfaceHex, hoverTarget, hoverRange)],
                '--color-outline-pressed': n[findOptimalStepByContrast(n, surfaceHex, pressedTarget, pressedRange)],
                '--color-outline-strong': n[findOptimalStepByContrast(n, surfaceHex, strongTarget, strongRange)],
            } as CssTokenMap;
        })(),
        
        // Focus: Vždy z Primary color (ne Info!)
        '--color-focus': scales.primary[findOptimalStepByContrast(
            scales.primary,
            isLight ? n['0'] : n['950'],
            accentContrast,
            isLight ? [400, 700] : [300, 600]
        )],

        // Ostatní
        '--color-shadow': isLight ? n['1000'] : n['1000'],
        '--color-backdrop': contrast === 'extra-high'
            ? (isLight ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.9)')
            : contrast === 'high-contrast'
                ? (isLight ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.8)')
                : (isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)'),
        
        // Stavy povrchů - Krok 4: surface-hover a surface-pressed
        // surface-hover: Stav surface-default při najetí myší
        '--color-surface-hover': isLight ? n['50'] : n['900'],
        
        // surface-pressed: Stav surface-default při stisknutí
        '--color-surface-pressed': isLight ? n['100'] : n['850'],
        
        // Disabled stavy - Krok 6D: Statická mapování pro Stavy
        // disabled-surface: Pozadí vypnutého prvku (nízký kontrast)
        '--color-disabled': isLight ? n['100'] : n['850'],
        
        // on-disabled: Text na vypnutém pozadí
        '--color-on-disabled': isLight ? n['400'] : n['600'],
    };

    return {
        ...baseTokens,
        ...primarySet,
        ...secondarySet,
        ...errorSet,
        ...warningSet,
        ...successSet,
        ...infoSet,
    };
}

/**
 * Hlavní export: Generuje oba módy na základě dodaných škál
 */
export function generateMappedTokens(
    scales: AllScales, 
    contrast: ContrastMode = 'default',
    stayTrueToInputColor = false,
    useHctModel = false,
    inputColors?: InputColors,
    customTones?: CustomTones
) {
    // Pokud je zapnutý HCT model, konvertuj škály na HCT tonal palettes
    let processedScales = scales;
    if (useHctModel && inputColors) {
        processedScales = {
            primary: convertHctToScale(inputColors.primary),
            secondary: convertHctToScale(inputColors.secondary),
            error: convertHctToScale(inputColors.error),
            warning: convertHctToScale(inputColors.warning),
            success: convertHctToScale(inputColors.success),
            info: convertHctToScale(inputColors.info),
            neutral: scales.neutral, // Neutral zůstává stejný
        };
    }
    
    return {
        light: getTokens(processedScales, 'light', contrast, stayTrueToInputColor, inputColors, customTones),
        dark: getTokens(processedScales, 'dark', contrast, stayTrueToInputColor, inputColors, customTones),
    };
}