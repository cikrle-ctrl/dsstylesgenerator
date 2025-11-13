// src/logic/tokenMapper.ts
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

    // Určíme background pro výpočet kontrastu
    const backgroundHex = isLight ? n['0'] : n['1000'];

    // Cílové kontrasty podle režimu
    const targetContrast = (() => {
        if (contrast === 'extra-high') return 9.0;
        if (contrast === 'high-contrast') return 7.0;
        return 4.5; // default
    })();

    // Základní krok pro akcent - najdi optimální podle kontrastu
    // Pokud je stayTrueToInputColor, najdi nejbližší krok k input barvě (300-600)
    // Pokud je customTones (Profi režim), použij uživatelský tón
    // Jinak použij inteligentní hledání podle kontrastu
    const baseStep = (() => {
        // 1. Profi režim - vlastní tóny (pouze pro semantic colors, ne neutral)
        if (customTones && name !== 'neutral' && customTones[name as keyof typeof customTones]) {
            const customTone = mode === 'light' 
                ? customTones[name as keyof typeof customTones]?.light 
                : customTones[name as keyof typeof customTones]?.dark;
            if (customTone !== undefined) {
                // Clamp to valid step
                const clampedTone = Math.min(1000, Math.max(0, Math.round(customTone / 50) * 50));
                return String(clampedTone);
            }
        }
        
        // 2. Stay true to input color
        if (stayTrueToInputColor && inputColor) {
            return findClosestStepInScale(inputColor, s, 300, 600);
        }
        
        // 3. Inteligentní výběr: najdi krok s kontrastem nejblíže cílové hodnotě
        // Preferujeme střední tóny (200-800) pro balanc sytosti a kontrastu
        return findOptimalStepByContrast(s, backgroundHex, targetContrast, [200, 800]);
    })();

    // Container: najdi světlejší/tmavší variantu s nižším kontrastem (3:1)
    const containerTargetContrast = contrast === 'extra-high' ? 3.0 : 3.0;
    const containerStep = (() => {
        // Pro container preferujeme světlejší/tmavší tóny
        if (isLight) {
            return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [100, 400]);
        } else {
            return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [600, 900]);
        }
    })();
    const containerColor = s[containerStep];

    // Pomocné funkce pro práci se stupnicí (0..1000 po 50)
    const clampStep = (value: number) => Math.min(1000, Math.max(0, value));
    const toStepKey = (value: number) => String(clampStep(Math.round(value / 50) * 50));
    const offsetStep = (baseKey: string, delta: number) => {
        const base = parseInt(baseKey, 10);
        return toStepKey(base + delta);
    };

    // Offsety pro interakční stavy podle kontrastu
    const hoverDelta = mode === 'light'
        ? (contrast === 'extra-high' ? 150 : 100)
        : (contrast === 'extra-high' ? -100 : -50); // Menší delta pro dark mode
    const pressedDelta = mode === 'light'
        ? (contrast === 'extra-high' ? 300 : 200)
        : (contrast === 'extra-high' ? -200 : -100);

    // Vypočítáme container hover/pressed barvy
    const containerHover = s[offsetStep(containerStep, hoverDelta)];
    const containerPressed = s[offsetStep(containerStep, pressedDelta)];

    // Vypočítáme fix hover/pressed barvy
    const fixHover = s['500'];
    const fixPressed = s['600'];
    
    // Vypočítáme base hover/pressed barvy
    const baseHover = s[offsetStep(baseStep, hoverDelta)];
    const basePressed = s[offsetStep(baseStep, pressedDelta)];

    // Základní tokeny podle finální specifikace
    const tokens: CssTokenMap = {
        // Hlavní tokeny
        [`--color-${name}`]: s[baseStep],
        [`--color-on-${name}`]: findBestContrast(
            s[baseStep],
            [n['0'], n['1000'], s['0'], s['1000']], // Možnosti textu
            contrast === 'extra-high' ? 8.5 : contrast === 'high-contrast' ? 7.0 : 4.5 // Extra-high: 8.5:1, High: 7:1
        ),
        [`--color-${name}-container`]: containerColor,
        [`--color-on-${name}-container`]: findBestContrast(
            containerColor,
            [s['700'], s['800'], s['900'], s['1000'], s['100'], s['200'], s['300'], s['0'], n['0'], n['1000']], // Rozšířené možnosti
            contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5 // High/Extra: 7:1 pro text
        ),

        // Fix varianty (stejné pro Light i Dark mode) + stavy
        // Fix = 400 (typicky světlejší tón) → preferuj černou, fallback bílá
        [`--color-${name}-fix`]: s['400'],
        [`--color-${name}-fix-hover`]: fixHover,
        [`--color-${name}-fix-pressed`]: fixPressed,
        [`--color-on-${name}-fix`]: findBestContrast(s['400'], [n['1000'], n['0']], contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5),
        
        // Interakční stavy s přepočítaným on-color
        // V light módu: hover/pressed jsou tmavší → preferuj černou
        // V dark módu: hover/pressed jsou světlejší → preferuj bílou
        [`--color-${name}-hover`]: baseHover,
        [`--color-on-${name}-hover`]: findBestContrast(
            baseHover,
            isLight ? [n['1000'], n['0'], s['1000'], s['0']] : [n['0'], n['1000'], s['0'], s['1000']],
            contrast === 'extra-high' ? 8.5 : contrast === 'high-contrast' ? 7.0 : 4.5
        ),
        [`--color-${name}-pressed`]: basePressed,
        [`--color-on-${name}-pressed`]: findBestContrast(
            basePressed,
            isLight ? [n['1000'], n['0'], s['1000'], s['0']] : [n['0'], n['1000'], s['0'], s['1000']],
            contrast === 'extra-high' ? 8.5 : contrast === 'high-contrast' ? 7.0 : 4.5
        ),
        
        // Container hover/pressed s novým on-color (minimum 4.5:1 pro text)
        [`--color-${name}-container-hover`]: containerHover,
        [`--color-on-${name}-container-hover`]: findBestContrast(
            containerHover,
            [s['700'], s['800'], s['900'], s['1000'], s['100'], s['200'], s['300'], s['0'], n['0'], n['1000']],
            contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5
        ),
        [`--color-${name}-container-pressed`]: containerPressed,
        [`--color-on-${name}-container-pressed`]: findBestContrast(
            containerPressed,
            [s['700'], s['800'], s['900'], s['1000'], s['100'], s['200'], s['300'], s['0'], n['0'], n['1000']],
            contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5
        ),
        
        // Fix hover/pressed s novým on-color (preferuj černou - fix tokeny jsou typicky světlejší)
        [`--color-on-${name}-fix-hover`]: findBestContrast(fixHover, [n['1000'], n['0']], contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5),
        [`--color-on-${name}-fix-pressed`]: findBestContrast(fixPressed, [n['1000'], n['0']], contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5),
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
    const p = scales.primary;

    const primarySet = createTokenSet(scales, 'primary', mode, contrast, stayTrueToInputColor, inputColors?.primary, customTones);
    const secondarySet = createTokenSet(scales, 'secondary', mode, contrast, stayTrueToInputColor, inputColors?.secondary, customTones);
    const errorSet = createTokenSet(scales, 'error', mode, contrast, stayTrueToInputColor, inputColors?.error, customTones);
    const warningSet = createTokenSet(scales, 'warning', mode, contrast, stayTrueToInputColor, inputColors?.warning, customTones);
    const successSet = createTokenSet(scales, 'success', mode, contrast, stayTrueToInputColor, inputColors?.success, customTones);
    const infoSet = createTokenSet(scales, 'info', mode, contrast, stayTrueToInputColor, inputColors?.info, customTones);

    // Základní tokeny podle finální specifikace
    const baseTokens: CssTokenMap = {
        // Surface (Povrchy a Pozadí)
        // High contrast: čisté extrémy pro maximální čitelnost
        '--color-background': (contrast === 'high-contrast' || contrast === 'extra-high') ? (isLight ? n['0'] : n['1000']) : (isLight ? n['50'] : n['1000']),
        '--color-surface': (contrast === 'high-contrast' || contrast === 'extra-high') ? (isLight ? n['0'] : n['1000']) : (isLight ? n['0'] : n['900']),
        // V kontrastních režimech dejme variantě lehkou barevnost z primary, aby UI nepůsobilo černobíle
        '--color-surface-variant': (contrast === 'high-contrast' || contrast === 'extra-high')
            ? (isLight ? p['150'] : p['800'])
            : (isLight ? n['200'] : n['800']),
        '--color-inverse-surface': isLight ? n['950'] : n['0'],

        // OnSurface (Texty a Ikony) - klíčové pro čitelnost
        '--color-on-surface-heading': (contrast === 'high-contrast' || contrast === 'extra-high') ? (isLight ? n['1000'] : n['0']) : (isLight ? n['900'] : n['0']),
        '--color-on-surface-variant': contrast === 'extra-high'
            ? (isLight ? n['800'] : n['200'])  // Extra: tmavší/světlejší pro body text
            : (isLight ? n['700'] : n['300']),
        '--color-on-surface-subtle': contrast === 'extra-high'
            ? (isLight ? n['700'] : n['300'])  // Extra: méně subtle
            : (isLight ? n['600'] : n['400']),
        '--color-on-surface-inverse': isLight ? n['0'] : n['1000'],
        '--color-primary-inverse': isLight ? scales.primary['300'] : scales.primary['500'],

        // Outline (Ohraničení) - zvýrazněné v kontrastních režimech
        '--color-outline-subtle': (
            contrast === 'extra-high' ? (isLight ? n['300'] : n['700']) :
            contrast === 'high-contrast' ? (isLight ? n['250'] : n['750']) :
            (isLight ? n['200'] : n['800'])
        ),
        '--color-outline-default': (
            contrast === 'extra-high' ? (isLight ? n['600'] : n['400']) :
            contrast === 'high-contrast' ? (isLight ? n['500'] : n['500']) :
            (isLight ? n['400'] : n['600'])
        ),
        '--color-outline-strong': (
            contrast === 'extra-high' ? (isLight ? n['850'] : n['150']) :
            contrast === 'high-contrast' ? (isLight ? n['800'] : n['200']) :
            (isLight ? n['700'] : n['300'])
        ),
        '--color-outline-hover': (
            contrast === 'extra-high' ? (isLight ? n['600'] : n['400']) :
            contrast === 'high-contrast' ? (isLight ? n['550'] : n['450']) :
            (isLight ? n['500'] : n['500'])
        ),
        '--color-outline-pressed': (
            contrast === 'extra-high' ? (isLight ? n['700'] : n['300']) :
            contrast === 'high-contrast' ? (isLight ? n['650'] : n['350']) :
            (isLight ? n['600'] : n['400'])
        ),
        '--color-focus': isLight ? scales.info['500'] : scales.info['400'],

        // Ostatní
        '--color-shadow': isLight ? n['1000'] : n['1000'],
        '--color-backdrop': contrast === 'extra-high'
            ? (isLight ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.9)')
            : contrast === 'high-contrast'
                ? (isLight ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.8)')
                : (isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)'),
        
        // Stavy povrchů - explicitně podle kontrastu (default jemný, high výraznější, extra nejvýraznější)
        '--color-surface-hover': (
            contrast === 'extra-high'
                ? (isLight ? n['200'] : n['750'])
                : contrast === 'high-contrast'
                    ? (isLight ? n['150'] : n['800'])
                    : (isLight ? n['100'] : n['850'])
        ),
        '--color-surface-pressed': (
            contrast === 'extra-high'
                ? (isLight ? n['300'] : n['700'])
                : contrast === 'high-contrast'
                    ? (isLight ? n['250'] : n['750'])
                    : (isLight ? n['150'] : n['800'])
        ),
        
        // Disabled stavy - musí být rozpoznatelné
        '--color-disabled': contrast === 'extra-high' 
            ? (isLight ? n['150'] : n['850']) 
            : (contrast === 'high-contrast' ? (isLight ? n['200'] : n['800']) : (isLight ? n['300'] : n['700'])),
        '--color-on-disabled': contrast === 'extra-high'
            ? (isLight ? n['600'] : n['400'])  // Extra: lepší čitelnost disabled textu
            : (isLight ? n['500'] : n['500']),
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