import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { Accordion } from './ui/Accordion';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { getContrast } from '../logic/contrastChecker';
import { generateMappedTokens } from '../logic/tokenMapper';
import './HeaderToolbar.css'; // Import segmented control styles

type ExportFormat = 'css' | 'tailwind' | 'scss' | 'json' | 'figma' | 'figma-variables' | 'csv';
type TailwindVersion = 'v3' | 'v4';
type ThemeMode = 'light' | 'dark';

interface ExportPanelProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export const ExportPanel = ({ isExpanded, onToggle }: ExportPanelProps) => {
    const { tokens, scales } = useThemeStore();
    const [tailwindVersion, setTailwindVersion] = useState<TailwindVersion>('v4');
    const [figmaMode, setFigmaMode] = useState<ThemeMode>('light');
    const [figmaIncludeScales, setFigmaIncludeScales] = useState(true);
    const [figmaIncludeAliases, setFigmaIncludeAliases] = useState(true);
    const [figmaIncludeSurface, setFigmaIncludeSurface] = useState(true);

    const generateCSS = (): string => {
        let css = ':root {\n  /* Light Mode */\n';
        Object.entries(tokens.light).forEach(([key, value]) => {
            css += `  ${key}: ${value};\n`;
        });
        css += '\n  /* Surface Tokens */\n';
        Object.entries(tokens.surface).forEach(([key, value]) => {
            css += `  ${key}: ${value};\n`;
        });
        css += '}\n\n[data-theme="dark"] {\n';
        Object.entries(tokens.dark).forEach(([key, value]) => {
            css += `  ${key}: ${value};\n`;
        });
        css += '}\n';
        return css;
    };

    const generateTailwindV3 = (): string => {
        const config = {
            theme: {
                extend: {
                    colors: {} as Record<string, Record<string, string>>
                }
            }
        };

        // Konverze scales do Tailwind formátu
        Object.entries(scales).forEach(([colorName, scale]) => {
            config.theme.extend.colors[colorName] = {};
            Object.entries(scale).forEach(([step, hex]) => {
                config.theme.extend.colors[colorName][step] = hex;
            });
        });

        return `module.exports = ${JSON.stringify(config, null, 2)}`;
    };

    const generateTailwindV4 = (): string => {
        let css = '@theme {\n';

        // Color scales
        Object.entries(scales).forEach(([colorName, scale]) => {
            Object.entries(scale).forEach(([step, hex]) => {
                css += `  --color-${colorName}-${step}: ${hex};\n`;
            });
        });

        css += '\n  /* Semantic tokens - Light */\n';
        Object.entries(tokens.light).forEach(([key, value]) => {
            const cleanKey = key.replace('--', '');
            css += `  --${cleanKey}: ${value};\n`;
        });

        css += '\n  /* Surface tokens */\n';
        Object.entries(tokens.surface).forEach(([key, value]) => {
            const cleanKey = key.replace('--', '');
            css += `  --${cleanKey}: ${value};\n`;
        });

        css += '}\n\n@media (prefers-color-scheme: dark) {\n  @theme {\n';
        Object.entries(tokens.dark).forEach(([key, value]) => {
            const cleanKey = key.replace('--', '');
            css += `    --${cleanKey}: ${value};\n`;
        });
        css += '  }\n}';

        return css;
    };

    const generateTailwind = (): string => {
        return tailwindVersion === 'v3' ? generateTailwindV3() : generateTailwindV4();
    };

    const generateSCSS = (): string => {
        let scss = '// Light Mode\n';
        Object.entries(tokens.light).forEach(([key, value]) => {
            scss += `$${key.replace('--', '')}: ${value};\n`;
        });
        scss += '\n// Dark Mode\n';
        Object.entries(tokens.dark).forEach(([key, value]) => {
            scss += `$${key.replace('--', '')}-dark: ${value};\n`;
        });
        scss += '\n// Surface Tokens\n';
        Object.entries(tokens.surface).forEach(([key, value]) => {
            scss += `$${key.replace('--', '')}: ${value};\n`;
        });
        return scss;
    };

    const generateJSON = (): string => {
        return JSON.stringify({ tokens, scales }, null, 2);
    };

    const generateFigma = (): string => {
        // W3C Design Tokens compatible JSON for Figma Variables Import/Export
        const modeTokens = figmaMode === 'light' ? tokens.light : tokens.dark;

        // Helper to sanitize names (remove leading --)
        const clean = (k: string) => k.replace(/^--/, '');

        // Build color group from semantic tokens (only --color-* keys)
        type W3CStringVal = { $value: string };
        type W3CNumVal = { $value: number };
        type W3CAliasVal = { $value: string };

        const colorGroup = ({ $type: 'color' } as const) as { $type: 'color' } & Record<string, W3CStringVal | W3CAliasVal>;
        Object.entries(modeTokens).forEach(([key, value]) => {
            if (key.startsWith('--color-')) {
                const tokenName = clean(key).replace('color-', '');
                if (figmaIncludeAliases) {
                    // If aliases enabled, check if we can reference a scale step
                    let aliasRef: string | null = null;
                    Object.entries(scales).forEach(([scaleName, scaleColors]) => {
                        if (!aliasRef && Object.values(scaleColors).includes(value)) {
                            const step = Object.keys(scaleColors).find(s => (scaleColors as Record<string, string>)[s] === value);
                            if (step) aliasRef = `{scale.${scaleName}.${step}}`;
                        }
                    });
                    colorGroup[tokenName] = aliasRef ? { $value: aliasRef } : { $value: value };
                } else {
                    colorGroup[tokenName] = { $value: value };
                }
            }
        });

        // Build number group from surface numeric tokens (radius, border widths)
        const numberGroup = ({ $type: 'number' } as const) as { $type: 'number' } & Record<string, W3CNumVal>;
        if (figmaIncludeSurface) {
            Object.entries(tokens.surface).forEach(([key, value]) => {
                const lower = key.toLowerCase();
                if (lower.includes('radius') || lower.includes('border-width')) {
                    const m = String(value).match(/(-?\d+(?:\.\d+)?)/);
                    if (m) numberGroup[clean(key).replace('--', '')] = { $value: Number(m[1]) };
                }
            });
        }

        // Build color scales under a separate group
        const scaleGroup = ({ $type: 'color' } as const) as { $type: 'color' } & Record<string, Record<string, W3CStringVal>>;
        if (figmaIncludeScales) {
            (Object.keys(scales) as Array<keyof typeof scales>).forEach((scaleName) => {
                const scale = scales[scaleName] as Record<string, string>;
                const group: Record<string, W3CStringVal> = {};
                Object.entries(scale).forEach(([step, hex]) => {
                    group[step] = { $value: hex };
                });
                scaleGroup[scaleName] = group;
            });
        }

        const designTokens: Record<string, unknown> = {
            color: colorGroup,
        };

        if (figmaIncludeSurface && Object.keys(numberGroup).length > 1) {
            designTokens.number = numberGroup;
        }

        if (figmaIncludeScales) {
            designTokens.scale = scaleGroup;
        }

        return JSON.stringify(designTokens, null, 2);
    };

    const generateCSV = (): string => {
        const modeTokens = figmaMode === 'light' ? tokens.light : tokens.dark;
        const bg = figmaMode === 'light' ? (scales.neutral as Record<string, string>)['0'] : (scales.neutral as Record<string, string>)['1000'];

        let csv = 'Token,Value,Type,Contrast vs Background,WCAG Level\n';

        // Semantic colors
        Object.entries(modeTokens).forEach(([key, value]) => {
            if (key.startsWith('--color-')) {
                const contrast = getContrast(value, bg);
                const wcag = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'FAIL';
                csv += `${key},${value},color,${contrast.toFixed(2)},${wcag}\n`;
            }
        });

        // Surface tokens (shadows, etc)
        Object.entries(tokens.surface).forEach(([key, value]) => {
            const type = key.includes('radius') || key.includes('border') ? 'dimension' : 'other';
            csv += `${key},${value},${type},,\n`;
        });

        // Scales
        Object.entries(scales).forEach(([scaleName, scale]) => {
            Object.entries(scale as Record<string, string>).forEach(([step, hex]) => {
                const contrast = getContrast(hex, bg);
                const wcag = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'FAIL';
                csv += `--scale-${scaleName}-${step},${hex},color,${contrast.toFixed(2)},${wcag}\n`;
            });
        });

        return csv;
    };

    const generateFigmaVariables = (): string => {
        // Struktura pro Figma Variables JSON
        type FigmaVariable = {
            name: string;
            type: 'COLOR';
            values: string[]; // 6 hodnot pro 6 módů
        };
        
        type FigmaVariablesExport = {
            collectionName: string;
            modes: string[];
            variables: FigmaVariable[];
        };

        // Generujeme tokeny pro všech 6 módů
        const modesConfig = [
            { mode: 'light' as const, contrast: 'default' as const },      // Light
            { mode: 'dark' as const, contrast: 'default' as const },       // Dark
            { mode: 'light' as const, contrast: 'high-contrast' as const },  // LightHigh
            { mode: 'dark' as const, contrast: 'high-contrast' as const },   // DarkHigh
            { mode: 'light' as const, contrast: 'extra-high' as const },   // LightExtraHigh
            { mode: 'dark' as const, contrast: 'extra-high' as const },    // DarkExtraHigh
        ];

        // Vygenerujeme tokeny pro každý mód
        const allTokens = modesConfig.map(({ mode, contrast }) => {
            const mapped = generateMappedTokens(scales, contrast, false);
            return mapped[mode];
        });

        // Sbíráme všechny unikátní názvy COLOR tokenů (bez shadows, radius atd.)
        const tokenNamesSet = new Set<string>();
        allTokens.forEach(tokens => {
            Object.keys(tokens).forEach(key => {
                // Pouze barevné tokeny, vynecháme shadow, backdrop
                if (key.startsWith('--color-') && 
                    !key.includes('shadow') && 
                    !key.includes('backdrop')) {
                    tokenNamesSet.add(key);
                }
            });
        });

        const tokenNames = Array.from(tokenNamesSet).sort();

        // Vytvoříme proměnné pro export
        const variables: FigmaVariable[] = tokenNames.map(tokenKey => {
            // Odstranění --color- prefixu a formátování názvu
            const cleanName = tokenKey.replace('--color-', '');
            
            // Určíme kategorii (první část názvu před pomlčkou)
            const parts = cleanName.split('-');
            const category = ['primary', 'secondary', 'error', 'warning', 'success', 'info'].includes(parts[0]) 
                ? parts[0] 
                : parts.includes('surface') || parts.includes('background') || parts.includes('outline')
                    ? 'surface'
                    : 'other';
            
            // Formátujeme název ve formátu "category/tokenName"
            const formattedName = `${category}/${cleanName}`;
            
            // Vytvoříme array hodnot pro všech 6 módů
            const values = allTokens.map(tokens => tokens[tokenKey] || '#000000');
            
            return {
                name: formattedName,
                type: 'COLOR',
                values
            };
        });

        const figmaExport: FigmaVariablesExport = {
            collectionName: 'Color Palette',
            modes: ['Light', 'Dark', 'LightHigh', 'DarkHigh', 'LightExtraHigh', 'DarkExtraHigh'],
            variables
        };

        return JSON.stringify(figmaExport, null, 2);
    };

    const generateExport = (format: ExportFormat): string => {
        switch (format) {
            case 'css': return generateCSS();
            case 'tailwind': return generateTailwind();
            case 'scss': return generateSCSS();
            case 'json': return generateJSON();
            case 'figma': return generateFigma();
            case 'figma-variables': return generateFigmaVariables();
            case 'csv': return generateCSV();
        }
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExport = (format: ExportFormat) => {
        const content = generateExport(format);
        const extensions: Record<ExportFormat, string> = {
            css: 'css',
            tailwind: tailwindVersion === 'v3' ? 'js' : 'css',
            scss: 'scss',
            json: 'json',
            figma: 'json',
            'figma-variables': 'json',
            csv: 'csv'
        };
        const suffix = (format === 'figma' || format === 'csv') ? `-${figmaMode}` : '';
        downloadFile(content, `theme-tokens${suffix}.${extensions[format]}`);
    };

    return (
        <Accordion 
            title="Export Tokens" 
            icon={<Download />} 
            isExpanded={isExpanded}
            onToggle={onToggle}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button
                    onClick={() => handleExport('css')}
                    variant="primary"
                    size="medium"
                    fullWidth
                >
                    CSS Variables
                </Button>

                {/* Tailwind s výběrem verze */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Button
                            onClick={() => handleExport('tailwind')}
                            variant="primary"
                            size="medium"
                            style={{ flex: 1 }}
                        >
                            Tailwind Config
                        </Button>
                        <div role="group" aria-label="Tailwind Version" className="seg">
                            <Button
                                variant="ghost"
                                size="small"
                                aria-pressed={tailwindVersion === 'v3'}
                                onClick={() => setTailwindVersion('v3')}
                                className="seg__btn"
                            >
                                v3
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                aria-pressed={tailwindVersion === 'v4'}
                                onClick={() => setTailwindVersion('v4')}
                                className="seg__btn"
                            >
                                v4
                            </Button>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--color-on-surface-variant)',
                        paddingLeft: '4px',
                        lineHeight: '1.3'
                    }}>
                        {tailwindVersion === 'v3' ? 'JavaScript config (tailwind.config.js)' : 'CSS @theme directive (Tailwind v4)'}
                    </div>
                </div>

                <Button
                    onClick={() => handleExport('scss')}
                    variant="secondary"
                    size="medium"
                    fullWidth
                >
                    SCSS Variables
                </Button>

                <Button
                    onClick={() => handleExport('json')}
                    variant="ghost"
                    size="medium"
                    fullWidth
                >
                    JSON
                </Button>

                {/* Figma W3C Export with Mode selector and checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', borderRadius: '8px', background: 'var(--color-surface-variant)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Button
                            onClick={() => handleExport('figma')}
                            variant="ghost"
                            size="medium"
                            style={{ flex: 1 }}
                        >
                            Figma W3C
                        </Button>
                        <div role="group" aria-label="Figma Mode" className="seg">
                            <Button
                                variant="ghost"
                                size="small"
                                aria-pressed={figmaMode === 'light'}
                                onClick={() => setFigmaMode('light')}
                                className="seg__btn"
                            >
                                Light
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                aria-pressed={figmaMode === 'dark'}
                                onClick={() => setFigmaMode('dark')}
                                className="seg__btn"
                            >
                                Dark
                            </Button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px' }}>
                        <Checkbox
                            checked={figmaIncludeScales}
                            onChange={setFigmaIncludeScales}
                            label="Include color scales (0-1000)"
                        />
                        <Checkbox
                            checked={figmaIncludeAliases}
                            onChange={setFigmaIncludeAliases}
                            label="Use aliases (references to scales)"
                        />
                        <Checkbox
                            checked={figmaIncludeSurface}
                            onChange={setFigmaIncludeSurface}
                            label="Include surface tokens (radius, borders)"
                        />
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--color-on-surface-variant)',
                        paddingTop: '4px',
                        lineHeight: '1.3'
                    }}>
                        Single-mode JSON (W3C spec). Import via Figma Tokens plugin.
                    </div>
                </div>

                {/* Figma Variables - NEW FORMAT */}
                <Button
                    onClick={() => handleExport('figma-variables')}
                    variant="primary"
                    size="medium"
                    fullWidth
                >
                    Figma Variables (6 Modes)
                </Button>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--color-on-surface-variant)',
                    paddingLeft: '4px',
                    lineHeight: '1.3',
                    marginTop: '-6px'
                }}>
                    All 6 modes (Light, Dark, LightHigh, DarkHigh, LightExtraHigh, DarkExtraHigh)
                </div>

                {/* CSV Export with Mode selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Button
                            onClick={() => handleExport('csv')}
                            variant="ghost"
                            size="medium"
                            style={{ flex: 1 }}
                        >
                            CSV Report (Contrast Audit)
                        </Button>
                        <div role="group" aria-label="CSV Mode" className="seg">
                            <Button
                                variant="ghost"
                                size="small"
                                aria-pressed={figmaMode === 'light'}
                                onClick={() => setFigmaMode('light')}
                                className="seg__btn"
                            >
                                Light
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                aria-pressed={figmaMode === 'dark'}
                                onClick={() => setFigmaMode('dark')}
                                className="seg__btn"
                            >
                                Dark
                            </Button>
                        </div>
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--color-on-surface-variant)',
                        paddingLeft: '4px',
                        lineHeight: '1.3'
                    }}>
                        Token list with WCAG contrast ratios
                    </div>
                </div>
            </div>
        </Accordion>
    );
};
