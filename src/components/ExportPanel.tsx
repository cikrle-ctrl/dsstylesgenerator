import { useThemeStore } from '../store/themeStore';
import { Accordion } from './ui/Accordion';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';

interface ExportPanelProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export const ExportPanel = ({ isExpanded, onToggle }: ExportPanelProps) => {
    const { tokens, scales } = useThemeStore();

    const generateFigmaVariables = (): string => {
        // W3C Design Tokens Format for Figma Variables
        // Struktura: každý token má $type a $value, může mít $description
        
        type ColorToken = {
            $type: 'color';
            $value: string;
            $description?: string;
        };

        type DimensionToken = {
            $type: 'dimension';
            $value: string;
            $description?: string;
        };

        type ShadowToken = {
            $type: 'shadow';
            $value: string;
            $description?: string;
        };

        type TokenGroup = {
            [key: string]: ColorToken | DimensionToken | ShadowToken | TokenGroup;
        };

        const designTokens: TokenGroup = {};

        // 1. Color Scales (0-1000)
        const scalesGroup: TokenGroup = {};
        (Object.keys(scales) as Array<keyof typeof scales>).forEach((scaleName) => {
            const scale = scales[scaleName] as Record<string, string>;
            const scaleGroup: TokenGroup = {};
            Object.entries(scale).forEach(([step, hex]) => {
                scaleGroup[step] = {
                    $type: 'color',
                    $value: hex
                };
            });
            scalesGroup[scaleName] = scaleGroup;
        });
        designTokens.scales = scalesGroup;

        // 2. Light Mode Semantic Tokens
        const lightGroup: TokenGroup = {};
        Object.entries(tokens.light).forEach(([key, value]) => {
            const cleanKey = key.replace('--color-', '').replace('--', '');
            if (key.startsWith('--color-')) {
                lightGroup[cleanKey] = {
                    $type: 'color',
                    $value: value
                };
            }
        });
        designTokens.light = lightGroup;

        // 3. Dark Mode Semantic Tokens  
        const darkGroup: TokenGroup = {};
        Object.entries(tokens.dark).forEach(([key, value]) => {
            const cleanKey = key.replace('--color-', '').replace('--', '');
            if (key.startsWith('--color-')) {
                darkGroup[cleanKey] = {
                    $type: 'color',
                    $value: value
                };
            }
        });
        designTokens.dark = darkGroup;

        // 4. Surface Tokens (radius, shadows, borders)
        const surfaceGroup: TokenGroup = {};
        Object.entries(tokens.surface).forEach(([key, value]) => {
            const cleanKey = key.replace('--', '');
            const lower = key.toLowerCase();
            
            if (lower.includes('radius') || lower.includes('border-width')) {
                surfaceGroup[cleanKey] = {
                    $type: 'dimension',
                    $value: value
                };
            } else if (lower.includes('shadow')) {
                surfaceGroup[cleanKey] = {
                    $type: 'shadow',
                    $value: value
                };
            }
        });
        designTokens.surface = surfaceGroup;

        return JSON.stringify(designTokens, null, 2);
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExport = () => {
        const content = generateFigmaVariables();
        downloadFile(content, 'figma-variables.json');
    };

    return (
        <Accordion 
            title="Export Tokens" 
            icon={<Download />} 
            isExpanded={isExpanded}
            onToggle={onToggle}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button 
                    onClick={handleExport}
                    variant="primary"
                    size="large"
                    fullWidth
                    icon={<Download size={18} />}
                >
                    Figma Variables
                </Button>
                
                <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-on-surface-variant)', 
                    lineHeight: '1.5',
                    padding: '12px',
                    background: 'var(--color-surface-variant)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-outline-subtle)'
                }}>
                    <strong>📦 W3C Design Tokens Format</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                        <li>Color scales (0-1000) for all palettes</li>
                        <li>Light & dark mode semantic tokens</li>
                        <li>Surface tokens (radius, shadows, borders)</li>
                    </ul>
                    <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
                        Import to Figma using the Variables Import plugin
                    </div>
                </div>
            </div>
        </Accordion>
    );
};
