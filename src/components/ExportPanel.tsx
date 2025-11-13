import { useThemeStore } from '../store/themeStore';
import { Accordion } from './ui/Accordion';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';

type ExportFormat = 'css' | 'tailwind' | 'scss' | 'json' | 'figma';

export const ExportPanel = () => {
    const { tokens, scales } = useThemeStore();

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

    const generateTailwind = (): string => {
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
        const figmaTokens: Record<string, { value: string; type: string }> = {};
        
        Object.entries(tokens.light).forEach(([key, value]) => {
            figmaTokens[`light/${key}`] = { value, type: 'color' };
        });
        Object.entries(tokens.dark).forEach(([key, value]) => {
            figmaTokens[`dark/${key}`] = { value, type: 'color' };
        });
        Object.entries(tokens.surface).forEach(([key, value]) => {
            figmaTokens[`surface/${key}`] = { value, type: 'color' };
        });

        return JSON.stringify(figmaTokens, null, 2);
    };

    const generateExport = (format: ExportFormat): string => {
        switch (format) {
            case 'css': return generateCSS();
            case 'tailwind': return generateTailwind();
            case 'scss': return generateSCSS();
            case 'json': return generateJSON();
            case 'figma': return generateFigma();
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
            tailwind: 'js',
            scss: 'scss',
            json: 'json',
            figma: 'json'
        };
        downloadFile(content, `theme-tokens.${extensions[format]}`);
    };

    return (
        <Accordion title="Export Tokens" icon={<Download />} defaultExpanded={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button 
                    onClick={() => handleExport('css')}
                    variant="primary"
                    size="medium"
                    fullWidth
                >
                    CSS Variables
                </Button>
                <Button 
                    onClick={() => handleExport('tailwind')}
                    variant="primary"
                    size="medium"
                    fullWidth
                >
                    Tailwind Config
                </Button>
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
                <Button 
                    onClick={() => handleExport('figma')}
                    variant="ghost"
                    size="medium"
                    fullWidth
                >
                    Figma Tokens
                </Button>
            </div>
        </Accordion>
    );
};
