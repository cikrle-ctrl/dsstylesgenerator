// src/store/themeStore.ts
import { create } from 'zustand';
import { 
    generateShades, 
    generateTintedNeutrals, 
    autoGenerateSemantics,
    generatePureNeutrals,
    applySaturationMultiplier,
    applyTemperatureShift,
    applyContrastSaturationBoost
} from '../logic/colorModule';
import { generateMappedTokens } from '../logic/tokenMapper';
import { 
    generateSurfaceTokens, 
    type RadiusStrategy, 
    type ShadowStrategy 
} from '../logic/surfaceAndRadius';
import { type Oklch, oklch } from 'culori'; // <-- TOTO JE TA OPRAVA

// Výchozí hodnoty
const defaultPrimary = '#0052cc';
const defaultSecondary = '#E87D00';
const defaultRadius: RadiusStrategy = 'medium';
const defaultShadow: ShadowStrategy = 'subtle';

// --- Funkce pro generování výchozího stavu ---
function generateInitialState() {
    const primaryOklch = oklch(defaultPrimary) as Oklch; // <-- OPRAVA
    const autoSemantics = autoGenerateSemantics(primaryOklch);

    const inputs = {
        colors: {
            primary: defaultPrimary,
            secondary: defaultSecondary,
            error: autoSemantics.error,
            warning: autoSemantics.warning,
            success: autoSemantics.success,
            info: autoSemantics.info,
        },
        surface: {
            radiusStrategy: defaultRadius,
            shadowStrategy: defaultShadow,
        },
    };

    const scales = {
        primary: generateShades(inputs.colors.primary),
        secondary: generateShades(inputs.colors.secondary),
        neutral: generateTintedNeutrals(inputs.colors.primary),
        error: generateShades(inputs.colors.error),
        warning: generateShades(inputs.colors.warning),
        success: generateShades(inputs.colors.success),
        info: generateShades(inputs.colors.info),
    };

    const colorTokens = generateMappedTokens(scales, 'default', false);

    const tokens = {
        light: colorTokens.light,
        dark: colorTokens.dark,
        surface: generateSurfaceTokens(defaultRadius, defaultShadow),
    };

    const ui = { themeMode: 'light' as 'light' | 'dark', contrastMode: 'default' as 'default' | 'high-contrast' | 'extra-high' };
    return { inputs, scales, tokens, ui };
}

// Helper function to generate neutrals based on source
function generateNeutralsFromSource(
    source: 'primary' | 'secondary' | 'custom' | 'pure',
    primaryColor: string,
    secondaryColor: string,
    customColor?: string
) {
    if (source === 'pure') {
        return generatePureNeutrals();
    }
    
    const tintColor = source === 'secondary' 
        ? secondaryColor 
        : source === 'custom' && customColor 
            ? customColor 
            : primaryColor;
    
    return generateTintedNeutrals(tintColor, 0.02);
}

// --- Definice TS Interface ---
interface ThemeState {
    inputs: ReturnType<typeof generateInitialState>['inputs'];
    scales: ReturnType<typeof generateInitialState>['scales'];
    tokens: ReturnType<typeof generateInitialState>['tokens'];
    ui: {
        themeMode: 'light' | 'dark';
        contrastMode: 'default' | 'high-contrast' | 'extra-high';
        preview?: {
            density: 'comfortable' | 'compact';
            hover: boolean;
            pressed: boolean;
            focus: boolean;
            disabled: boolean;
            a11yOverlay: boolean;
        };
    };
    
    // Advanced settings
    advancedSettings: {
        usePureNeutrals: boolean;
        saturationMultiplier: number;
        temperatureShift: number;
        harmonyMode: 'none' | 'analogous' | 'complementary' | 'triadic';
        stayTrueToInputColor: boolean;
        proMode: boolean;
        customTones?: {
            primary?: { light?: number; dark?: number };
            secondary?: { light?: number; dark?: number };
            error?: { light?: number; dark?: number };
            warning?: { light?: number; dark?: number };
            success?: { light?: number; dark?: number };
            info?: { light?: number; dark?: number };
        };
        neutralTintSource: 'primary' | 'secondary' | 'custom' | 'pure';
        customNeutralTint?: string;
    };
    
    // Akce
    setPrimaryColor: (color: string) => void;
    setSecondaryColor: (color: string) => void;
    setErrorColor: (color: string) => void;
    setWarningColor: (color: string) => void;
    setSuccessColor: (color: string) => void;
    setInfoColor: (color: string) => void;
    setRadiusStrategy: (strategy: RadiusStrategy) => void;
    setShadowStrategy: (strategy: ShadowStrategy) => void;
    setAdvancedSettings: (settings: Partial<ThemeState['advancedSettings']>) => void;
    setThemeMode: (mode: 'light' | 'dark') => void;
    setContrastMode: (mode: 'default' | 'high-contrast' | 'extra-high') => void;
    setPreview: (patch: Partial<NonNullable<ThemeState['ui']['preview']>>) => void;
    resetPreview: () => void;
}

// --- Vytvoření Store ---
export const useThemeStore = create<ThemeState>((set) => ({
    ...generateInitialState(),
    
    // Advanced settings default
    advancedSettings: {
        usePureNeutrals: false,
        saturationMultiplier: 1.0,
        temperatureShift: 0,
        harmonyMode: 'none',
        stayTrueToInputColor: false,
        proMode: false,
        neutralTintSource: 'primary',
    },

    // --- Akce ---
    setThemeMode: (mode) => set((state) => ({ ui: { ...state.ui, themeMode: mode } })),
    setContrastMode: (mode) =>
        set((state) => {
            // Při změně kontrastu aplikujeme saturation boost na všechny škály
            const boostedScales = {
                primary: applyContrastSaturationBoost(state.scales.primary, mode),
                secondary: applyContrastSaturationBoost(state.scales.secondary, mode),
                neutral: state.scales.neutral, // Neutral zůstává beze změny
                error: applyContrastSaturationBoost(state.scales.error, mode),
                warning: applyContrastSaturationBoost(state.scales.warning, mode),
                success: applyContrastSaturationBoost(state.scales.success, mode),
                info: applyContrastSaturationBoost(state.scales.info, mode),
            };
            
            // Přegenerujeme tokeny s novým kontrastem a boosted scales
            const newColorTokens = generateMappedTokens(
                boostedScales, 
                mode, 
                state.advancedSettings.stayTrueToInputColor,
                state.inputs.colors,
                state.advancedSettings.proMode ? state.advancedSettings.customTones : undefined
            );
            return {
                ui: { ...state.ui, contrastMode: mode },
                scales: boostedScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark },
            };
        }),
    setPreview: (patch) =>
        set((state) => ({
            ui: {
                ...state.ui,
                preview: {
                    density: state.ui.preview?.density ?? 'comfortable',
                    hover: state.ui.preview?.hover ?? false,
                    pressed: state.ui.preview?.pressed ?? false,
                    focus: state.ui.preview?.focus ?? false,
                    disabled: state.ui.preview?.disabled ?? false,
                    a11yOverlay: state.ui.preview?.a11yOverlay ?? false,
                    ...patch,
                },
            },
        })),
    resetPreview: () =>
        set((state) => ({
            ui: {
                ...state.ui,
                preview: {
                    density: 'comfortable',
                    hover: false,
                    pressed: false,
                    focus: false,
                    disabled: false,
                    a11yOverlay: false,
                },
            },
        })),
    setPrimaryColor: (color: string) =>
        set((state) => {
            const primaryOklch = oklch(color) as Oklch; // <-- OPRAVA
            const autoSemantics = autoGenerateSemantics(primaryOklch);
            
            const newInputs = {
                ...state.inputs,
                colors: {
                    ...state.inputs.colors,
                    primary: color,
                    error: autoSemantics.error,
                    warning: autoSemantics.warning,
                    success: autoSemantics.success,
                    info: autoSemantics.info,
                }
            };

            let newScales = {
                primary: generateShades(newInputs.colors.primary),
                secondary: generateShades(newInputs.colors.secondary),
                neutral: generateTintedNeutrals(newInputs.colors.primary),
                error: generateShades(newInputs.colors.error),
                warning: generateShades(newInputs.colors.warning),
                success: generateShades(newInputs.colors.success),
                info: generateShades(newInputs.colors.info),
            };
            
            // Aplikuj contrast boost pokud je nastaven
            if (state.ui.contrastMode !== 'default') {
                newScales = {
                    primary: applyContrastSaturationBoost(newScales.primary, state.ui.contrastMode),
                    secondary: applyContrastSaturationBoost(newScales.secondary, state.ui.contrastMode),
                    neutral: newScales.neutral,
                    error: applyContrastSaturationBoost(newScales.error, state.ui.contrastMode),
                    warning: applyContrastSaturationBoost(newScales.warning, state.ui.contrastMode),
                    success: applyContrastSaturationBoost(newScales.success, state.ui.contrastMode),
                    info: applyContrastSaturationBoost(newScales.info, state.ui.contrastMode),
                };
            }

            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                state.advancedSettings.stayTrueToInputColor,
                newInputs.colors,
                state.advancedSettings.proMode ? state.advancedSettings.customTones : undefined
            );
            const newTokens = {
                ...state.tokens,
                light: newColorTokens.light,
                dark: newColorTokens.dark,
            };

            return { inputs: newInputs, scales: newScales, tokens: newTokens };
        }),

    setSecondaryColor: (color: string) =>
        set((state) => {
            const newScales = { ...state.scales, secondary: generateShades(color) };
            
            // Aplikuj contrast boost pokud je nastaven
            if (state.ui.contrastMode !== 'default') {
                newScales.secondary = applyContrastSaturationBoost(newScales.secondary, state.ui.contrastMode);
            }
            
            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                state.advancedSettings.stayTrueToInputColor,
                { ...state.inputs.colors, secondary: color }
            );
            return {
                inputs: { ...state.inputs, colors: { ...state.inputs.colors, secondary: color } },
                scales: newScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark }
            };
        }),
    setErrorColor: (color: string) =>
        set((state) => {
            const newScales = { ...state.scales, error: generateShades(color) };
            
            // Aplikuj contrast boost pokud je nastaven
            if (state.ui.contrastMode !== 'default') {
                newScales.error = applyContrastSaturationBoost(newScales.error, state.ui.contrastMode);
            }
            
            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                state.advancedSettings.stayTrueToInputColor,
                { ...state.inputs.colors, error: color }
            );
            return {
                inputs: { ...state.inputs, colors: { ...state.inputs.colors, error: color } },
                scales: newScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark }
            };
        }),
    setWarningColor: (color: string) =>
        set((state) => {
            const newScales = { ...state.scales, warning: generateShades(color) };
            
            // Aplikuj contrast boost pokud je nastaven
            if (state.ui.contrastMode !== 'default') {
                newScales.warning = applyContrastSaturationBoost(newScales.warning, state.ui.contrastMode);
            }
            
            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                state.advancedSettings.stayTrueToInputColor,
                { ...state.inputs.colors, warning: color }
            );
            return {
                inputs: { ...state.inputs, colors: { ...state.inputs.colors, warning: color } },
                scales: newScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark }
            };
        }),
    setSuccessColor: (color: string) =>
        set((state) => {
            const newScales = { ...state.scales, success: generateShades(color) };
            
            // Aplikuj contrast boost pokud je nastaven
            if (state.ui.contrastMode !== 'default') {
                newScales.success = applyContrastSaturationBoost(newScales.success, state.ui.contrastMode);
            }
            
            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                state.advancedSettings.stayTrueToInputColor,
                { ...state.inputs.colors, success: color }
            );
            return {
                inputs: { ...state.inputs, colors: { ...state.inputs.colors, success: color } },
                scales: newScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark }
            };
        }),
    setInfoColor: (color: string) =>
        set((state) => {
            const newScales = { ...state.scales, info: generateShades(color) };
            
            // Aplikuj contrast boost pokud je nastaven
            if (state.ui.contrastMode !== 'default') {
                newScales.info = applyContrastSaturationBoost(newScales.info, state.ui.contrastMode);
            }
            
            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                state.advancedSettings.stayTrueToInputColor,
                { ...state.inputs.colors, info: color }
            );
            return {
                inputs: { ...state.inputs, colors: { ...state.inputs.colors, info: color } },
                scales: newScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark }
            };
        }),
    setRadiusStrategy: (strategy: RadiusStrategy) =>
        set((state) => ({
            inputs: { ...state.inputs, surface: { ...state.inputs.surface, radiusStrategy: strategy } },
            tokens: { ...state.tokens, surface: generateSurfaceTokens(strategy, state.inputs.surface.shadowStrategy) }
        })),
    setShadowStrategy: (strategy: ShadowStrategy) =>
        set((state) => ({
            inputs: { ...state.inputs, surface: { ...state.inputs.surface, shadowStrategy: strategy } },
            tokens: { ...state.tokens, surface: generateSurfaceTokens(state.inputs.surface.radiusStrategy, strategy) }
        })),
    
    setAdvancedSettings: (newSettings: Partial<ThemeState['advancedSettings']>) =>
        set((state) => {
            const updatedSettings = { ...state.advancedSettings, ...newSettings };
            
            // Regeneruj scales s novými settings
            const newScales = { ...state.scales };
            
            // Pokud se změnilo stayTrueToInputColor, NEPŘEGENERUJ škály (zůstávají stejné)
            // Jen přegenerujeme tokeny s novým mappingem níže
            
            // Neutral tinting podle zdroje
            newScales.neutral = generateNeutralsFromSource(
                updatedSettings.neutralTintSource,
                state.inputs.colors.primary,
                state.inputs.colors.secondary,
                updatedSettings.customNeutralTint
            );
            
            // Saturation multiplier
            if (updatedSettings.saturationMultiplier !== 1.0) {
                Object.keys(newScales).forEach(key => {
                    if (key !== 'neutral') {
                        newScales[key as keyof typeof newScales] = applySaturationMultiplier(
                            newScales[key as keyof typeof newScales],
                            updatedSettings.saturationMultiplier
                        );
                    }
                });
            }
            
            // Temperature shift
            if (updatedSettings.temperatureShift !== 0) {
                Object.keys(newScales).forEach(key => {
                    if (key !== 'neutral') {
                        newScales[key as keyof typeof newScales] = applyTemperatureShift(
                            newScales[key as keyof typeof newScales],
                            updatedSettings.temperatureShift
                        );
                    }
                });
            }
            
            // Regeneruj tokeny s novým stayTrueToInputColor nastavením
            const newColorTokens = generateMappedTokens(
                newScales, 
                state.ui.contrastMode,
                updatedSettings.stayTrueToInputColor,
                state.inputs.colors,
                state.advancedSettings.proMode ? state.advancedSettings.customTones : undefined
            );
            
            return {
                advancedSettings: updatedSettings,
                scales: newScales,
                tokens: { ...state.tokens, light: newColorTokens.light, dark: newColorTokens.dark }
            };
        }),
}));