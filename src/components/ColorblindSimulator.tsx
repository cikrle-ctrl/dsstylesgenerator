import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { applyColorblindFilter, colorblindLabels } from '../logic/colorblindSimulator';
import { Select } from './ui/Select';
import './PreviewCard.css';

type ColorblindType = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'grayscale';

export const ColorblindSimulator = () => {
    const [filter, setFilter] = useState<ColorblindType>('none');
    const { scales } = useThemeStore();

    const getTextColor = (hex: string) => {
        try {
            const rgb = parseInt(hex.substring(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            // Relativní luminance podle sRGB
            const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            return luminance > 0.5 ? '#000000' : '#ffffff';
        } catch { return '#ffffff'; }
    };

    // Aplikuje filtr na příklad barvy
    const getFilteredColors = () => {
        if (filter === 'none') return null;
        
        const sampleColors = [
            { label: 'Primary', hex: scales.primary['500'] },
            { label: 'Secondary', hex: scales.secondary['500'] },
            { label: 'Error', hex: scales.error['500'] },
            { label: 'Warning', hex: scales.warning['500'] },
            { label: 'Success', hex: scales.success['500'] },
            { label: 'Info', hex: scales.info['500'] }
        ];

        const tokenMap = Object.fromEntries(sampleColors.map(c => [c.label, c.hex]));
        const filtered = applyColorblindFilter(tokenMap, filter);

        return sampleColors.map(c => ({
            ...c,
            filteredHex: filtered[c.label]
        }));
    };

    const filteredColors = getFilteredColors();

    return (
        <section>
            <div className="preview-card">
                <h3 style={{ 
                    marginBottom: '20px', 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    color: 'var(--color-on-surface-heading)' 
                }}>
                    Colorblind Simulation
                </h3>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '10px', 
                        fontWeight: 600, 
                        fontSize: '14px',
                        color: 'var(--color-on-surface-heading)' 
                    }}>
                        Vision Type:
                    </label>
                    <div style={{ maxWidth: '400px' }}>
                        <Select
                            value={filter}
                            onChange={(v) => setFilter(v as ColorblindType)}
                            options={(Object.keys(colorblindLabels) as ColorblindType[]).map((t) => ({ value: t, label: colorblindLabels[t] }))}
                        />
                    </div>
                </div>

            {filteredColors && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '12px',
                    marginTop: '16px'
                }}>
                    {filteredColors.map(color => (
                        <div key={color.label} style={{
                            background: 'var(--color-surface)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--color-outline-subtle)'
                        }}>
                            <div style={{
                                height: '60px',
                                background: color.hex,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getTextColor(color.hex),
                                fontWeight: 600,
                                fontSize: '12px'
                            }}>
                                Original
                            </div>
                            <div style={{
                                height: '60px',
                                background: color.filteredHex,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getTextColor(color.filteredHex),
                                fontWeight: 600,
                                fontSize: '12px'
                            }}>
                                Filtered
                            </div>
                            <div style={{
                                padding: '8px',
                                textAlign: 'center',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: 'var(--color-on-surface-variant)'
                            }}>
                                {color.label}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filter === 'none' && (
                <div style={{
                    padding: '20px',
                    background: 'var(--color-primary-container)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-outline-default)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--color-on-primary-container)'
                }}>
                    Select a vision type above to see how your colors appear to people with colorblindness.
                </div>
            )}
            </div>
        </section>
    );
};
