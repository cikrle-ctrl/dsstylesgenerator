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
        // Pro light mode preferujeme 300-500, pro dark mode 500-700
        const range: [number, number] = isLight ? [300, 500] : [500, 700];
        return findOptimalStepByContrast(s, backgroundHex, targetContrast, range);
    })();

    // Container: světlé (100-300) pro light mode, tmavé (700-900) pro dark mode
    // V high/extra-high kontrastu se rozsah může měnit podle potřeby kontrastu s on-container
    const containerTargetContrast = (() => {
        if (contrast === 'extra-high') return 7.0; // Vyšší kontrast pro extra-high
        if (contrast === 'high-contrast') return 4.5; // Střední kontrast pro high
        return 3.0; // Základní jemný kontrast pro default
    })();
    
    const containerStep = (() => {
        if (isLight) {
            // Light mode: světlé tóny 100-300
            // Logika: Čím tmavší je baseStep, tím světlejší musí být container
            const baseStepNum = parseInt(baseStep, 10);
            if (baseStepNum >= 600) {
                // Tmavá primary (600+) → nejsvětlejší container (100-150)
                return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [100, 150]);
            } else if (baseStepNum >= 400) {
                // Střední primary (400-599) → střední světlý container (150-250)
                return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [150, 250]);
            } else {
                // Světlá primary (0-399) → tmavší světlý container (200-300)
                return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [200, 300]);
            }
        } else {
            // Dark mode: tmavé tóny 700-900
            // Logika: Čím světlejší je baseStep, tím tmavší musí být container
            const baseStepNum = parseInt(baseStep, 10);
            if (baseStepNum <= 400) {
                // Světlá primary (0-400) → nejtmavší container (850-900)
                return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [850, 900]);
            } else if (baseStepNum <= 600) {
                // Střední primary (401-600) → střední tmavý container (750-850)
                return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [750, 850]);
            } else {
                // Tmavá primary (601+) → světlejší tmavý container (700-800)
                return findOptimalStepByContrast(s, backgroundHex, containerTargetContrast, [700, 800]);
            }
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
            // Pro tmavé/sytější barvy (400+) použij pouze bílou a světlé tóny
            // Pro světlé barvy (<400) použij pouze černou a tmavé tóny
            parseInt(baseStep, 10) >= 400 
                ? [n['0'], s['0'], s['50'], s['100']]  // Pouze světlé možnosti
                : [n['1000'], s['1000'], s['950'], s['900']],  // Pouze tmavé možnosti
            contrast === 'extra-high' ? 8.5 : contrast === 'high-contrast' ? 7.0 : 4.5
        ),
        [`--color-${name}-container`]: containerColor,
        [`--color-on-${name}-container`]: findBestContrast(
            containerColor,
            // V light: preferuj tmavé; v dark: preferuj světlé
            isLight
                ? [n['1000'], s['1000'], s['900'], s['800'], n['900'], n['800'], n['0']]
                : [n['0'], s['0'], s['50'], s['100'], n['1000'], n['900'], n['800']],
            contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5
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
            isLight
                ? [n['1000'], s['1000'], s['900'], s['800'], n['900'], n['800'], n['0']]
                : [n['0'], s['0'], s['50'], s['100'], n['1000'], n['900'], n['800']],
            contrast === 'extra-high' ? 7.0 : contrast === 'high-contrast' ? 7.0 : 4.5
        ),
        [`--color-${name}-container-pressed`]: containerPressed,
        [`--color-on-${name}-container-pressed`]: findBestContrast(
            containerPressed,
            isLight
                ? [n['1000'], s['1000'], s['900'], s['800'], n['900'], n['800'], n['0']]
                : [n['0'], s['0'], s['50'], s['100'], n['1000'], n['900'], n['800']],
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