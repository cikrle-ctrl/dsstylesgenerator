// src/components/ThemeInjector.tsx
import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { generateCssString } from '../logic/cssGenerator';
import { getHighContrastCSS } from '../logic/highContrastSupport';

export function ThemeInjector() {
    // Čteme jen to, co potřebujeme
    const { scales, tokens, ui } = useThemeStore();

    // Použijeme naši centrální funkci
    const css = generateCssString(scales, tokens);
    
    // Přidáme high-contrast CSS
    const highContrastCSS = getHighContrastCSS();

    // Synchronizace atributů pro globální styly
    useEffect(() => {
        if (ui?.themeMode) {
            document.documentElement.setAttribute('data-theme', ui.themeMode);
        }
        if (ui?.contrastMode) {
            document.documentElement.setAttribute('data-contrast', ui.contrastMode);
        }
    }, [ui?.themeMode, ui?.contrastMode]);

    // Vložíme CSS do <style> tagu
    return (
        <style>{css}{highContrastCSS}</style>
    );
}