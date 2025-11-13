import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { Accordion } from './ui/Accordion';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';
import { getContrast } from '../logic/contrastChecker';
import { generateMappedTokens } from '../logic/tokenMapper';
import './HeaderToolbar.css'; // Import segmented control styles

type ExportFormat = 'css' | 'tailwind' | 'scss' | 'json' | 'figma-variables' | 'csv';
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
            // Odstranění --color- prefixu
            const cleanName = tokenKey.replace('--color-', '');
            
            // Určíme kategorii a název logicky
            let category: string;
            let tokenName: string;
            
            // Disabled tokeny - vlastní kategorie
            if (cleanName.startsWith('disabled') || cleanName.startsWith('on-disabled')) {
                category = 'disabled';
                tokenName = cleanName;
            }
            // Inverse tokeny - vlastní kategorie
            else if (cleanName.startsWith('inverse') || 
                     cleanName.startsWith('on-surface-inverse') ||
                     cleanName === 'primary-inverse') {
                category = 'inverse';
                tokenName = cleanName;
            }
            // Semantic colors s On-variants
            else if (cleanName.startsWith('on-primary')) {
                category = 'primary';
                tokenName = cleanName; // on-primary, on-primary-container atd.
            } else if (cleanName.startsWith('on-secondary')) {
                category = 'secondary';
                tokenName = cleanName;
            } else if (cleanName.startsWith('on-error')) {
                category = 'error';
                tokenName = cleanName;
            } else if (cleanName.startsWith('on-warning')) {
                category = 'warning';
                tokenName = cleanName;
            } else if (cleanName.startsWith('on-success')) {
                category = 'success';
                tokenName = cleanName;
            } else if (cleanName.startsWith('on-info')) {
                category = 'info';
                tokenName = cleanName;
            } else if (cleanName.startsWith('primary')) {
                category = 'primary';
                tokenName = cleanName;
            } else if (cleanName.startsWith('secondary')) {
                category = 'secondary';
                tokenName = cleanName;
            } else if (cleanName.startsWith('error')) {
                category = 'error';
                tokenName = cleanName;
            } else if (cleanName.startsWith('warning')) {
                category = 'warning';
                tokenName = cleanName;
            } else if (cleanName.startsWith('success')) {
                category = 'success';
                tokenName = cleanName;
            } else if (cleanName.startsWith('info')) {
                category = 'info';
                tokenName = cleanName;
            }
            // Outline a Focus do kategorie outline
            else if (cleanName.startsWith('outline') || cleanName === 'focus') {
                category = 'outline';
                tokenName = cleanName;
            }
            // Surface tokeny
            else if (cleanName.startsWith('surface') || 
                     cleanName.startsWith('background') || 
                     cleanName.startsWith('on-surface')) {
                category = 'surface';
                tokenName = cleanName;
            }
            // Ostatní
            else {
                category = 'other';
                tokenName = cleanName;
            }
            
            // Formátujeme název ve formátu "category/tokenName"
            const formattedName = `${category}/${tokenName}`;
            
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
            'figma-variables': 'json',
            csv: 'csv'
        };
        const suffix = format === 'csv' ? `-${figmaMode}` : '';
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

                {/* Figma Variables Export */}
                <Button
                    onClick={() => handleExport('figma-variables')}
                    variant="primary"
                    size="medium"
                    fullWidth
                >
                    Figma Variables
                </Button>

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
