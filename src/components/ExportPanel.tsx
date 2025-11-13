import { useThemeStore } from '../store/themeStore';
import { Accordion } from './ui/Accordion';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';

interface ExportPanelProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export const ExportPanel = ({ isExpanded, onToggle }: ExportPanelProps) => {
    const { scales } = useThemeStore();

    const generateFigmaVariables = (): string => {
        // Import generateMappedTokens pro generování tokenů
        const { generateMappedTokens } = require('../logic/tokenMapper');
        
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

        // Sbíráme všechny unikátní názvy tokenů
        const tokenNamesSet = new Set<string>();
        allTokens.forEach(tokens => {
            Object.keys(tokens).forEach(key => {
                if (key.startsWith('--color-')) {
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
                    <strong>📦 Figma Variables Format</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                        <li>6 modes: Light, Dark, LightHigh, DarkHigh, LightExtraHigh, DarkExtraHigh</li>
                        <li>All semantic color tokens organized by category</li>
                        <li>Ready for Figma Variables import</li>
                    </ul>
                    <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
                        Import directly to Figma using Variables panel → Import
                    </div>
                </div>
            </div>
        </Accordion>
    );
};
