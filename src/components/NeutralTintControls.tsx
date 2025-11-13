import { useThemeStore } from '../store/themeStore';
import { ColorPicker } from './ui/ColorPicker';

export function NeutralTintControls() {
    const advancedSettings = useThemeStore((s) => s.advancedSettings);
    const setAdvancedSettings = useThemeStore((s) => s.setAdvancedSettings);

    const handleSourceChange = (source: 'primary' | 'secondary' | 'custom' | 'pure') => {
        setAdvancedSettings({ neutralTintSource: source });
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                    { value: 'primary' as const, label: 'Primary Color', desc: 'Neutrals tinted with primary hue' },
                    { value: 'secondary' as const, label: 'Secondary Color', desc: 'Neutrals tinted with secondary hue' },
                    { value: 'custom' as const, label: 'Custom Color', desc: 'Choose your own tint color' },
                    { value: 'pure' as const, label: 'Pure Gray', desc: 'No tint - pure grayscale (chroma = 0)' }
                ].map(({ value, label, desc }) => (
                    <label 
                        key={value}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: `2px solid ${advancedSettings.neutralTintSource === value ? 'var(--color-primary)' : 'var(--color-outline-subtle)'}`,
                            background: advancedSettings.neutralTintSource === value ? 'var(--color-primary-container)' : 'var(--color-surface)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <input
                            type="radio"
                            name="neutralTintSource"
                            value={value}
                            checked={advancedSettings.neutralTintSource === value}
                            onChange={() => handleSourceChange(value)}
                            style={{ marginRight: '10px' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ 
                                fontSize: '13px', 
                                fontWeight: 500,
                                color: 'var(--color-on-surface-heading)',
                                marginBottom: '2px'
                            }}>
                                {label}
                            </div>
                            <div style={{ 
                                fontSize: '11px', 
                                color: 'var(--color-on-surface-subtle)'
                            }}>
                                {desc}
                            </div>
                        </div>
                    </label>
                ))}
            </div>

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
