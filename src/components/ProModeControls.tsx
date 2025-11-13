import { useThemeStore } from '../store/themeStore';
import { Checkbox } from './ui/Checkbox';
import { Select } from './ui/Select';

export function ProModeControls() {
    const advancedSettings = useThemeStore((s) => s.advancedSettings);
    const setAdvancedSettings = useThemeStore((s) => s.setAdvancedSettings);

    type ColorKey = 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
    type ToneEntry = { light?: number; dark?: number };

    const handleToneChange = (
        color: ColorKey,
        mode: 'light' | 'dark',
        value: string
    ) => {
        const current: Partial<Record<ColorKey, ToneEntry>> = { ...(advancedSettings.customTones ?? {}) };
        const entry: ToneEntry = { ...(current[color] ?? {}) };
        if (value === '') {
            delete entry[mode];
        } else {
            const num = Math.min(1000, Math.max(0, Math.round(parseInt(value, 10) / 50) * 50));
            entry[mode] = num;
        }
        if (!entry.light && !entry.dark) {
            delete current[color];
        } else {
            current[color] = entry;
        }
        setAdvancedSettings({ customTones: current });
    };

    const colors: Array<ColorKey> = [
        'primary',
        'secondary',
        'error',
        'warning',
        'success',
        'info',
    ];

    const toneOptions = [
        { value: '', label: 'Auto' },
        ...Array.from({ length: 21 }, (_, i) => i * 50).map((n) => ({ value: String(n), label: String(n) })),
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <h3
                    style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--color-on-surface-heading)',
                        marginBottom: 8,
                    }}
                >
                    🎯 Advanced Tone Mapping (Pro Mode)
                </h3>
                <p
                    style={{
                        fontSize: '12px',
                        color: 'var(--color-on-surface-variant)',
                        lineHeight: '1.4',
                        marginBottom: 12,
                    }}
                >
                    Override intelligent contrast-based selection with custom tone values (0-1000). On-colors will auto-calculate
                    to maintain accessibility.
                </p>
            </div>

            <Checkbox
                checked={advancedSettings.proMode}
                onChange={(v) => setAdvancedSettings({ proMode: v })}
                label={<span>Enable Pro Mode</span>}
                description={<span>Override automatic tone selection per color and mode</span>}
            />

            {advancedSettings.proMode && (
                <div style={{ marginTop: 8 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr 1fr',
                            gap: 8,
                            marginBottom: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--color-on-surface-variant)',
                        }}
                    >
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
                                style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 8, marginBottom: 8, alignItems: 'center' }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-on-surface-heading)', textTransform: 'capitalize' }}>
                                    {color}
                                </div>
                                <Select value={lightValue === '' ? '' : String(lightValue)} onChange={(v) => handleToneChange(color, 'light', v)} options={toneOptions} />
                                <Select value={darkValue === '' ? '' : String(darkValue)} onChange={(v) => handleToneChange(color, 'dark', v)} options={toneOptions} />
                            </div>
                        );
                    })}

                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            background: 'var(--color-info-container)',
                            color: 'var(--color-on-info-container)',
                            borderRadius: 8,
                            fontSize: 12,
                            lineHeight: 1.5,
                        }}
                    >
                        <strong>💡 Tip:</strong> Leave blank for automatic intelligent selection. Values are clamped to 0-1000 in 50-step
                        increments. The system ensures on-colors maintain minimum 4.5:1 contrast (7:1 in high contrast mode).
                    </div>
                </div>
            )}
        </div>
    );
}
