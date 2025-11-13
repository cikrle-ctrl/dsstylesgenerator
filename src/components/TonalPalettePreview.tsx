import { useThemeStore } from '../store/themeStore';
import { generateTonalPalette } from '../logic/toneContrastSystem';

function ToneRow({ label, palette }: { label: string; palette: Record<number, string> }) {
    const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
    return (
        <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: '8px',
                color: 'var(--color-on-surface-heading)'
            }}>
                {label} Tonal Palette
            </h4>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(13, 1fr)',
                gap: '4px',
                marginBottom: '4px'
            }}>
                {tones.map(tone => {
                    const color = palette[tone];
                    const isExtremeLight = tone >= 95;
                    const isExtremeDark = tone <= 10;
                    return (
                        <div
                            key={tone}
                            style={{
                                background: color,
                                height: '60px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '10px',
                                fontWeight: 600,
                                color: tone > 50 ? 'var(--color-on-surface-inverse)' : '#fff',
                                borderRadius: '4px',
                                border: isExtremeLight ? '1px solid var(--color-outline-subtle)' : 'none',
                                position: 'relative'
                            }}
                            title={`Tone ${tone}: ${color}`}
                        >
                            <span>{tone}</span>
                            {(isExtremeLight || isExtremeDark) && (
                                <span style={{ 
                                    fontSize: '8px', 
                                    opacity: 0.7,
                                    marginTop: '2px'
                                }}>
                                    {isExtremeLight ? '⚠️' : '⚠️'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(13, 1fr)',
                gap: '4px',
                fontSize: '9px',
                color: 'var(--color-on-surface-subtle)',
                textAlign: 'center'
            }}>
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span style={{ fontWeight: 600, color: 'var(--color-info)' }}>40</span>
                <span>50</span>
                <span>60</span>
                <span>70</span>
                <span style={{ fontWeight: 600, color: 'var(--color-info)' }}>80</span>
                <span style={{ fontWeight: 600, color: 'var(--color-info)' }}>90</span>
                <span>95</span>
                <span>99</span>
                <span style={{ fontWeight: 600, color: 'var(--color-info)' }}>100</span>
            </div>
        </div>
    );
}

export const TonalPalettePreview = () => {
    const { inputs } = useThemeStore();
    
    const primaryTones = generateTonalPalette(inputs.colors.primary);
    const secondaryTones = generateTonalPalette(inputs.colors.secondary);
    const errorTones = generateTonalPalette(inputs.colors.error);
    
    return (
        <div style={{
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginTop: '20px'
        }}>
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 600,
                    marginBottom: '8px'
                }}>
                    Tonal Palettes (reference)
                </h3>
                <p style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    margin: 0,
                    lineHeight: '1.5'
                }}>
                    Tone-based palette preview. Bold numbers (40, 80, 90, 100) show common role tones. ⚠️ indicates extremes where chroma is reduced.
                </p>
            </div>
            
            <ToneRow label="Primary" palette={primaryTones} />
            <ToneRow label="Secondary" palette={secondaryTones} />
            <ToneRow label="Error" palette={errorTones} />
            
            <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#1565c0',
                lineHeight: '1.5'
            }}>
                <strong>💡 Note:</strong> This is a reference-only tonal view (not used in token generation). Our engine uses OKLCH scales + contrast-aware mapping.
            </div>
        </div>
    );
};
