import { useThemeStore } from '../store/themeStore';
import { ColorPicker } from './ui/ColorPicker';
import { RadioGroup } from './ui/RadioGroup';

export function NeutralTintControls() {
    const advancedSettings = useThemeStore((s) => s.advancedSettings);
    const setAdvancedSettings = useThemeStore((s) => s.setAdvancedSettings);

    const handleSourceChange = (source: string) => {
        setAdvancedSettings({ neutralTintSource: source as 'primary' | 'secondary' | 'custom' | 'pure' });
    };

    const handleCustomTintChange = (color: string) => {
        setAdvancedSettings({ customNeutralTint: color });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: 'var(--color-on-surface-heading)' 
                }}>
                    🎨 Neutral Tint Source
                </label>
                <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-on-surface-variant)',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                }}>
                    Choose which color tints your neutral palette (slight chroma added for warmth/coolness)
                </p>
            </div>

            <RadioGroup
                name="neutralTintSource"
                value={advancedSettings.neutralTintSource}
                onChange={handleSourceChange}
                options={[
                    { value: 'primary', label: 'Primary Color', description: 'Neutrals tinted with primary hue' },
                    { value: 'secondary', label: 'Secondary Color', description: 'Neutrals tinted with secondary hue' },
                    { value: 'custom', label: 'Custom Color', description: 'Choose your own tint color' },
                    { value: 'pure', label: 'Pure Gray', description: 'No tint - pure grayscale (chroma = 0)' }
                ]}
            />

            {advancedSettings.neutralTintSource === 'custom' && (
                <div style={{ marginTop: '8px', position: 'relative', zIndex: 2000 }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: 'var(--color-on-surface-heading)' 
                    }}>
                        Custom Tint Color
                    </label>
                    <ColorPicker
                        value={advancedSettings.customNeutralTint || '#6b7280'}
                        onChange={handleCustomTintChange}
                    />
                </div>
            )}
        </div>
    );
}
