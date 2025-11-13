import { useThemeStore } from '../store/themeStore';
import './AdvancedControls.css';

export function ProModeControls() {
    const advancedSettings = useThemeStore((s) => s.advancedSettings);
    const setAdvancedSettings = useThemeStore((s) => s.setAdvancedSettings);

    const handleToneChange = (
        color: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info',
        mode: 'light' | 'dark',
        value: string
    ) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        const newCustomTones = {
            ...advancedSettings.customTones,
            [color]: {
                ...advancedSettings.customTones?.[color],
                [mode]: numValue,
            },
        };

        setAdvancedSettings({ customTones: newCustomTones });
    };

    const colors: Array<'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info'> = [
        'primary',
        'secondary',
        'error',
        'warning',
        'success',
        'info',
    ];

    return (
        <div className="adv">
            <div className="adv__header" style={{ marginBottom: 16 }}>
                <h3 className="adv__title">🎯 Advanced Tone Mapping (Pro Mode)</h3>
                <p className="adv__desc">
                    Override intelligent contrast-based selection with custom tone values (0-1000).
                    On-colors will auto-calculate to maintain accessibility.
                </p>
            </div>

            <div className="adv__row" style={{ marginBottom: 12 }}>
                <label className="adv__label">
                    <input
                        type="checkbox"
                        checked={advancedSettings.proMode}
                        onChange={(e) => setAdvancedSettings({ proMode: e.target.checked })}
                    />
                    <span style={{ marginLeft: 8 }}>Enable Pro Mode</span>
                </label>
            </div>

            {advancedSettings.proMode && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '120px 1fr 1fr', 
                        gap: 8, 
                        marginBottom: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-on-surface-variant)'
                    }}>
                        <div>Color</div>
                        <div>Light Mode Tone</div>
                        <div>Dark Mode Tone</div>
                    </div>

                    {colors.map((color) => {
                        const lightValue = advancedSettings.customTones?.[color]?.light ?? '';
                        const darkValue = advancedSettings.customTones?.[color]?.dark ?? '';

                        return (
                            <div
                                key={color}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '120px 1fr 1fr',
                                    gap: 8,
                                    marginBottom: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ 
                                    fontSize: 13, 
                                    fontWeight: 500,
                                    color: 'var(--color-on-surface-heading)',
                                    textTransform: 'capitalize'
                                }}>
                                    {color}
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={lightValue}
                                    onChange={(e) => handleToneChange(color, 'light', e.target.value)}
                                    placeholder="Auto"
                                    className="adv__input"
                                    style={{
                                        height: 32,
                                        padding: '0 8px',
                                        fontSize: 13,
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={darkValue}
                                    onChange={(e) => handleToneChange(color, 'dark', e.target.value)}
                                    placeholder="Auto"
                                    className="adv__input"
                                    style={{
                                        height: 32,
                                        padding: '0 8px',
                                        fontSize: 13,
                                    }}
                                />
                            </div>
                        );
                    })}

                    <div style={{
                        marginTop: 16,
                        padding: 12,
                        background: 'var(--color-info-container)',
                        color: 'var(--color-on-info-container)',
                        borderRadius: 8,
                        fontSize: 12,
                        lineHeight: 1.5,
                    }}>
                        <strong>💡 Tip:</strong> Leave blank for automatic intelligent selection. 
                        Values are clamped to 0-1000 in 50-step increments. 
                        The system ensures on-colors maintain minimum 4.5:1 contrast (7:1 in high contrast mode).
                    </div>
                </div>
            )}
        </div>
    );
}
