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
    // Light mode: světlejší tóny (100-300)
    // Dark mode: tmavší tóny (700-900)
    const containerStep = (() => {
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
    // Kandidáti: neutral-0 (bílá), neutral-1000 (černá)
    // Vrací tu, která má lepší kontrast a splňuje minimum
    const getOnColor = (bgColor: string): string => {
        return findBestContrast(
            bgColor,
            [n['0'], n['1000']], // Vždy jen bílá nebo černá
            accentContrast // Použij stejný kontrast jako pro akcenty
        );
    };

    // Základní tokeny
    const tokens: CssTokenMap = {
        // Hlavní akcent
        [`--color-${name}`]: s[baseStep],
        [`--color-on-${name}`]: getOnColor(s[baseStep]),
        
        // Container
        [`--color-${name}-container`]: containerColor,
        [`--color-on-${name}-container`]: getOnColor(containerColor),        
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
        [`--color-on-${name}-container-hover`]: getOnColor(containerHover),
        [`--color-${name}-container-pressed`]: containerPressed,
        [`--color-on-${name}-container-pressed`]: getOnColor(containerPressed),
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
        
        // on-surface-body: Standardní text (použijeme on-surface-variant jako body)
        '--color-on-surface-variant': isLight ? n['800'] : n['100'],
        
        // on-surface-subtle: Nízký důraz (placeholders), střední šedá
        '--color-on-surface-subtle': isLight ? n['500'] : n['500'],
        
        '--color-on-surface-inverse': isLight ? n['0'] : n['1000'],
        '--color-primary-inverse': isLight ? scales.primary['300'] : scales.primary['500'],

        // Outline (Ohraničení) - Krok 6D: Statická mapování pro Okraje
        // Subtle ~2:1, Default ~3:1, Strong ~4.5:1
        ...(() => {
            const surfaceHex = isLight ? n['0'] : n['950'];
            
            // border-subtle: Nejméně viditelný okraj (oddělovač)
            const subtle = findBestContrast(surfaceHex, isLight ? [n['100'], n['150'], n['200']] : [n['850'], n['800'], n['750']], 2.0);
            
            // border-default: Výchozí okraj (např. u surface-variant)
            const deflt = findBestContrast(surfaceHex, isLight ? [n['200'], n['250'], n['300']] : [n['800'], n['750'], n['700']], 3.0);
            
            // border-default-hover: Zvýraznění okraje při najetí
            const hover = findBestContrast(surfaceHex, isLight ? [n['300'], n['350'], n['400']] : [n['700'], n['650'], n['600']], 3.0);
            
            const pressed = findBestContrast(surfaceHex, isLight ? [n['400'], n['450'], n['500']] : [n['600'], n['550'], n['500']], 3.0);
            
            // border-strong: Vysoce viditelný okraj (kontrastní)
            const strong = findBestContrast(surfaceHex, isLight ? [n['500'], n['550'], n['600']] : [n['500'], n['450'], n['400']], contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 4.5 : 4.5);
            
            return {
                '--color-outline-subtle': subtle,
                '--color-outline-default': deflt,
                '--color-outline-strong': strong,
                '--color-outline-hover': hover,
                '--color-outline-pressed': pressed,
            } as CssTokenMap;
        })(),
        
        // border-focus: Dynamický token, odkazuje na již vypočítanou primary-default
        '--color-focus': isLight ? scales.info['500'] : scales.info['400'],

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
    inputColors?: InputColors,
    customTones?: CustomTones
) {
    return {
        light: getTokens(scales, 'light', contrast, stayTrueToInputColor, inputColors, customTones),
        dark: getTokens(scales, 'dark', contrast, stayTrueToInputColor, inputColors, customTones),
    };
}