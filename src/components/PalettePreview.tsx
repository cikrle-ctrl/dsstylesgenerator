import { useThemeStore } from '../store/themeStore';
import './PalettePreview.css';
import './PreviewCard.css';
import { getContrast } from '../logic/contrastChecker';
import { isInSRGBGamut } from '../logic/gamutChecker';

type ShadeScale = Record<string, string>;
type Scales = {
    primary: ShadeScale;
    secondary: ShadeScale;
    neutral: ShadeScale;
    error: ShadeScale;
    warning: ShadeScale;
    success: ShadeScale;
    info: ShadeScale;
};
type Tokens = {
    light: Record<string, string>;
    dark: Record<string, string>;
    surface: Record<string, string>;
};

function getContrastColor(hex: string): string {
    if (!hex || !hex.startsWith('#')) return '#ffffff';
    try {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);  
        const b = parseInt(hex.slice(5, 7), 16);
        // Použijeme přesnější výpočet relativní luminance (sRGB)
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        // Vyšší prah pro lepší čitelnost
        return luminance > 0.5 ? '#000000' : '#ffffff';
    } catch {
        return '#ffffff';
    }
}

type TokenScope = 'light' | 'dark' | 'surface';

const Cell = ({ label, sublabel, token, mode, tokens, scope, onToken }: { 
    label: React.ReactNode;
    sublabel: string; 
    token: string; 
    mode: 'light' | 'dark';
    tokens: Tokens;
    scope?: TokenScope;
    onToken?: string;
}) => {
    let tokenMap = mode === 'light' ? tokens.light : tokens.dark;
    if (scope === 'surface') tokenMap = tokens.surface;
    if (scope === 'light') tokenMap = tokens.light;
    if (scope === 'dark') tokenMap = tokens.dark;
    const colorValue = tokenMap[token];
    const onMap = mode === 'light' ? tokens.light : tokens.dark;
    const onColor = onToken ? onMap[onToken] : undefined;
    const contrast = onColor && colorValue ? getContrast(colorValue, onColor) : undefined;
    const inGamut = colorValue ? isInSRGBGamut(colorValue) : true;
    
    return (
        <div style={{
            backgroundColor: colorValue,
            color: getContrastColor(colorValue),
            padding: '16px 10px',
            minHeight: '70px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '11px',
            textAlign: 'center',
            position: 'relative',
            border: `1px solid rgba(128, 128, 128, 0.15)`
        }}>
            <div style={{ fontWeight: '600', marginBottom: '6px', lineHeight: '1.3' }}>
                {label}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'monospace' }}>{sublabel}</div>
            
            {/* Gamut warning badge */}
            {!inGamut && (
                <div style={{ 
                    position: 'absolute', 
                    top: '6px', 
                    left: '6px', 
                    fontSize: '9px',
                    background: '#ff9800',
                    color: '#000',
                    padding: '3px 5px',
                    borderRadius: '3px',
                    fontWeight: '600',
                    lineHeight: '1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                }}
                title="Outside sRGB gamut - may display differently on older monitors"
                >
                    ⚠️ P3
                </div>
            )}
            
            {/* Contrast badge */}
            {contrast !== undefined && (
                <div style={{ 
                    position: 'absolute', 
                    top: '6px', 
                    right: '6px', 
                    fontSize: '9px',
                    background: contrast >= 7.0 ? '#4caf50' : contrast >= 4.5 ? '#ffc107' : '#f44336',
                    color: contrast >= 7.0 ? '#fff' : contrast >= 4.5 ? '#000' : '#fff',
                    padding: '3px 5px',
                    borderRadius: '3px',
                    fontWeight: '600',
                    lineHeight: '1'
                }}>
                    {contrast >= 7.0 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'FAIL'} {contrast.toFixed(1)}
                </div>
            )}
        </div>
    );
};

// Komponenta pro jeden ��dek barev (Primary row)
const ColorRow = ({ name, mode, tokens, scales }: { name: string; mode: 'light' | 'dark'; tokens: Tokens, scales: Scales }) => {
    const s = name.toLowerCase();
    const isLight = mode === 'light';

    // Pomocn� fce: najde p�esn� �t�tek pro "On" barvu porovn�n�m s kandid�ty
    const getExactOnLabel = (onHex: string): string => {
        if (!onHex) return 'neutral-0/1000';
        const hex = String(onHex).toLowerCase();
    const n = scales.neutral;
    const current = (scales as Record<string, ShadeScale>)[s];
        const candidates: Array<{ group: string; step: string; hex: string }> = [
            { group: 'neutral', step: '0', hex: (n['0'] || '').toLowerCase() },
            { group: 'neutral', step: '1000', hex: (n['1000'] || '').toLowerCase() },
            { group: s, step: '0', hex: (current?.['0'] || '').toLowerCase() },
            { group: s, step: '1000', hex: (current?.['1000'] || '').toLowerCase() },
        ];
        const hit = candidates.find(c => c.hex === hex);
        return hit ? `${hit.group}-${hit.step}` : 'neutral-0/1000';
    };

    // Pomocn� fce: p�esn� �t�tek pro On{Color}Container z kandid�t�
    const getExactOnContainerLabel = (onHex: string): string => {
        if (!onHex) return isLight ? `${s}-700/1000` : `${s}-100/300`;
        const hex = String(onHex).toLowerCase();
    const current = (scales as Record<string, ShadeScale>)[s];
        const steps = ['700','800','900','1000','100','200','300'];
        const candidates = steps.map(step => ({ group: s, step, hex: (current?.[step] || '').toLowerCase() }));
        const hit = candidates.find(c => c.hex === hex);
        return hit ? `${hit.group}-${hit.step}` : (isLight ? `${s}-700/1000` : `${s}-100/300`);
    };

    // Pomocn� fce: p�esn� �t�tek podle skute�n� hodnoty tokenu z dan� �k�ly
    const getStepLabel = (group: string, tokenName: string): string => {
        const map = mode === 'light' ? tokens.light : tokens.dark;
        const hex = (map[tokenName] || '').toLowerCase();
        const scale = (scales as Record<string, ShadeScale>)[group];
        if (!hex || !scale) return group;
        const match = Object.entries(scale).find(([, value]) => String(value).toLowerCase() === hex);
        return match ? `${group}-${match[0]}` : group;
    };
    
    return (
        <div style={{ marginBottom: '40px' }}>
            <h4 style={{ 
                marginBottom: '12px', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--color-on-surface-heading)',
                textTransform: 'capitalize'
            }}>
                {name}
            </h4>
            
            {/* Grid: desktop 6 cols; tablet 3; mobile 2 (pairs: Color | OnColor) */}
            <div className="palette-row-grid" style={{
                border: '1px solid var(--color-outline-subtle)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                {/* ��dek 1: Z�kladn� stavy */}
                <Cell 
                    mode={mode} 
                    label={name} 
                    sublabel={getStepLabel(s, `--color-${s}`)}
                    token={`--color-${s}`} 
                    tokens={tokens} 
                    onToken={`--color-on-${s}`}
                />
                <Cell 
                    mode={mode} 
                    label={`On${name}`} 
                    sublabel={getExactOnLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}`])}
                    token={`--color-on-${s}`} 
                    tokens={tokens} 
                />
                <Cell 
                    mode={mode} 
                    label={`${name}Container`} 
                    sublabel={getStepLabel(s, `--color-${s}-container`)}
                    token={`--color-${s}-container`} 
                    tokens={tokens} 
                    onToken={`--color-on-${s}-container`}
                />
                <Cell 
                    mode={mode} 
                    label={`On${name}Container`} 
                    sublabel={getExactOnContainerLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-container`])}
                    token={`--color-on-${s}-container`} 
                    tokens={tokens} 
                />
                <Cell 
                    mode={mode}
                    label={`${name}Fix`}
                    sublabel={getStepLabel(s, `--color-${s}-fix`)}
                    token={`--color-${s}-fix`}
                    tokens={tokens}
                    onToken={`--color-on-${s}-fix`}
                />
                <Cell 
                    mode={mode}
                    label={`On${name}Fix`}
                    sublabel={getExactOnLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-fix`])}
                    token={`--color-on-${s}-fix`}
                    tokens={tokens}
                />

                {/* ��dek 2: Hover stavy */}
                <Cell 
                    mode={mode} 
                    label={`${name}:Hover`} 
                    sublabel={getStepLabel(s, `--color-${s}-hover`)}
                    token={`--color-${s}-hover`} 
                    tokens={tokens} 
                    onToken={`--color-on-${s}-hover`}

                />
                <Cell 
                    mode={mode} 
                    label={`On${name}:Hover`} 
                    sublabel={getExactOnLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-hover`])}
                    token={`--color-on-${s}-hover`} 
                    tokens={tokens} 

                />
                <Cell 
                    mode={mode} 
                    label={`${name}Container:Hover`} 
                    sublabel={getStepLabel(s, `--color-${s}-container-hover`)}
                    token={`--color-${s}-container-hover`} 
                    tokens={tokens} 
                    onToken={`--color-on-${s}-container-hover`}

                />
                <Cell 
                    mode={mode} 
                    label={`On${name}Container:Hover`} 
                    sublabel={getExactOnContainerLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-container-hover`])}
                    token={`--color-on-${s}-container-hover`} 
                    tokens={tokens} 

                />
                <Cell 
                    mode={mode}
                    label={`${name}Fix:Hover`}
                    sublabel={getStepLabel(s, `--color-${s}-fix-hover`)}
                    token={`--color-${s}-fix-hover`}
                    tokens={tokens}
                    onToken={`--color-on-${s}-fix-hover`}

                />
                <Cell 
                    mode={mode}
                    label={`On${name}Fix:Hover`}
                    sublabel={getExactOnLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-fix-hover`])}
                    token={`--color-on-${s}-fix-hover`}
                    tokens={tokens}

                />

                {/* ��dek 3: Pressed stavy */}
                <Cell 
                    mode={mode} 
                    label={`${name}:Pressed`} 
                    sublabel={getStepLabel(s, `--color-${s}-pressed`)}
                    token={`--color-${s}-pressed`} 
                    tokens={tokens} 
                    onToken={`--color-on-${s}-pressed`}

                />
                <Cell 
                    mode={mode} 
                    label={`On${name}:Pressed`} 
                    sublabel={getExactOnLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-pressed`])}
                    token={`--color-on-${s}-pressed`} 
                    tokens={tokens} 

                />
                <Cell 
                    mode={mode} 
                    label={`${name}Container:Pressed`} 
                    sublabel={getStepLabel(s, `--color-${s}-container-pressed`)}
                    token={`--color-${s}-container-pressed`} 
                    tokens={tokens} 
                    onToken={`--color-on-${s}-container-pressed`}

                />
                <Cell 
                    mode={mode} 
                    label={`On${name}Container:Pressed`} 
                    sublabel={getExactOnContainerLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-container-pressed`])}
                    token={`--color-on-${s}-container-pressed`} 
                    tokens={tokens} 

                />
                <Cell 
                    mode={mode}
                    label={`${name}Fix:Pressed`}
                    sublabel={getStepLabel(s, `--color-${s}-fix-pressed`)}
                    token={`--color-${s}-fix-pressed`}
                    tokens={tokens}
                    onToken={`--color-on-${s}-fix-pressed`}

                />
                <Cell 
                    mode={mode}
                    label={`On${name}Fix:Pressed`}
                    sublabel={getExactOnLabel((mode === 'light' ? tokens.light : tokens.dark)[`--color-on-${s}-fix-pressed`])}
                    token={`--color-on-${s}-fix-pressed`}
                    tokens={tokens}

                />

                {/* Disabled stavy p�esunuty do Outline & Other sekce */}
                
            </div>
        </div>
    );
};

// Sekce: Surface
const SurfaceSection = ({ mode, tokens, scales }: { mode: 'light' | 'dark'; tokens: Tokens; scales: Scales }) => {
    const getStepLabel = (group: string, tokenName: string): string => {
        const map = mode === 'light' ? tokens.light : tokens.dark;
        const hex = (map[tokenName] || '').toLowerCase();
        const scale = (scales as Record<string, ShadeScale>)[group];
        if (!hex || !scale) return group;
        const match = Object.entries(scale).find(([, value]) => String(value).toLowerCase() === hex);
        return match ? `${group}-${match[0]}` : group;
    };
    return (
        <div style={{ marginBottom: '40px' }}>
            <h4 style={{ 
                marginBottom: '12px', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--color-on-surface-heading)',
                textTransform: 'capitalize'
            }}>
                Surface
            </h4>
            <div className="palette-surface-grid" style={{
                border: '1px solid var(--color-outline-subtle)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <Cell mode={mode} label="Background" sublabel={getStepLabel('neutral', '--color-background')} token="--color-background" tokens={tokens} onToken="--color-on-surface-heading" />
                <Cell mode={mode} label="Surface" sublabel={getStepLabel('neutral', '--color-surface')} token="--color-surface" tokens={tokens} onToken="--color-on-surface-heading" />
                <Cell mode={mode} label="Surface Variant" sublabel={getStepLabel('neutral', '--color-surface-variant')} token="--color-surface-variant" tokens={tokens} onToken="--color-on-surface-variant" />
                <Cell mode={mode} label="Inverse Surface" sublabel={getStepLabel('neutral', '--color-inverse-surface')} token="--color-inverse-surface" tokens={tokens} onToken="--color-on-surface-inverse" />
                <Cell mode={mode} label="Surface Hover" sublabel={getStepLabel('neutral', '--color-surface-hover')} token="--color-surface-hover" tokens={tokens} onToken="--color-on-surface-heading" />
                <Cell mode={mode} label="Surface Pressed" sublabel={getStepLabel('neutral', '--color-surface-pressed')} token="--color-surface-pressed" tokens={tokens} onToken="--color-on-surface-heading" />
            </div>
        </div>
    );
};

// Sekce: OnSurface
const OnSurfaceSection = ({ mode, tokens, scales }: { mode: 'light' | 'dark'; tokens: Tokens; scales: Scales }) => {
    const getStepLabel = (group: string, tokenName: string): string => {
        const map = mode === 'light' ? tokens.light : tokens.dark;
        const hex = (map[tokenName] || '').toLowerCase();
        const scale = (scales as Record<string, ShadeScale>)[group];
        if (!hex || !scale) return group;
        const match = Object.entries(scale).find(([, value]) => String(value).toLowerCase() === hex);
        return match ? `${group}-${match[0]}` : group;
    };
    return (
        <div style={{ marginBottom: '40px' }}>
            <h4 style={{ 
                marginBottom: '12px', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--color-on-surface-heading)',
                textTransform: 'capitalize'
            }}>
                On Surface
            </h4>
            <div className="palette-onsurface-grid" style={{
                border: '1px solid var(--color-outline-subtle)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <Cell mode={mode} label="On Surface Heading" sublabel={getStepLabel('neutral', '--color-on-surface-heading')} token="--color-on-surface-heading" tokens={tokens} onToken="--color-surface" />
                <Cell mode={mode} label="On Surface Variant" sublabel={getStepLabel('neutral', '--color-on-surface-variant')} token="--color-on-surface-variant" tokens={tokens} onToken="--color-surface" />
                <Cell mode={mode} label="On Surface Subtle" sublabel={getStepLabel('neutral', '--color-on-surface-subtle')} token="--color-on-surface-subtle" tokens={tokens} onToken="--color-surface" />
                <Cell mode={mode} label="On Surface Inverse" sublabel={getStepLabel('neutral', '--color-on-surface-inverse')} token="--color-on-surface-inverse" tokens={tokens} onToken="--color-inverse-surface" />
                <Cell mode={mode} label="Primary Inverse" sublabel={getStepLabel('primary', '--color-primary-inverse')} token="--color-primary-inverse" tokens={tokens} onToken="--color-inverse-surface" />
            </div>
        </div>
    );
};

// Sekce: Outline a další
const OutlineAndOtherSection = ({ mode, tokens, scales }: { mode: 'light' | 'dark'; tokens: Tokens; scales: Scales }) => {
    const getStepLabel = (group: string, tokenName: string): string => {
        const map = mode === 'light' ? tokens.light : tokens.dark;
        const hex = (map[tokenName] || '').toLowerCase();
        const scale = (scales as Record<string, ShadeScale>)[group];
        if (!hex || !scale) return group;
        const match = Object.entries(scale).find(([, value]) => String(value).toLowerCase() === hex);
        return match ? `${group}-${match[0]}` : group;
    };
    return (
        <div style={{ marginBottom: '40px' }}>
            <h4 style={{ 
                marginBottom: '12px', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--color-on-surface-heading)',
                textTransform: 'capitalize'
            }}>
                Outline & Other
            </h4>
            <div className="palette-outline-grid1" style={{
                border: '1px solid var(--color-outline-subtle)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '8px'
            }}>
                <Cell mode={mode} label="Outline Subtle" sublabel={getStepLabel('neutral', '--color-outline-subtle')} token="--color-outline-subtle" tokens={tokens} />
                <Cell mode={mode} label="Outline Default" sublabel={getStepLabel('neutral', '--color-outline-default')} token="--color-outline-default" tokens={tokens} />
                <Cell mode={mode} label="Outline Strong" sublabel={getStepLabel('neutral', '--color-outline-strong')} token="--color-outline-strong" tokens={tokens} />
                <Cell mode={mode} label="Outline Hover" sublabel={getStepLabel('neutral', '--color-outline-hover')} token="--color-outline-hover" tokens={tokens} />
                <Cell mode={mode} label="Outline Pressed" sublabel={getStepLabel('neutral', '--color-outline-pressed')} token="--color-outline-pressed" tokens={tokens} />
                <Cell mode={mode} label="Focus" sublabel={getStepLabel('info', '--color-focus')} token="--color-focus" tokens={tokens} />
                <Cell mode={mode} label="Disabled" sublabel={getStepLabel('neutral', '--color-disabled')} token="--color-disabled" tokens={tokens} onToken="--color-on-disabled" />
            </div>
            <div className="palette-outline-grid2" style={{
                border: '1px solid var(--color-outline-subtle)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <Cell mode={mode} label="On Disabled" sublabel={getStepLabel('neutral', '--color-on-disabled')} token="--color-on-disabled" tokens={tokens} onToken="--color-disabled" />
                <Cell mode={mode} label="Shadow" sublabel={getStepLabel('neutral', '--color-shadow')} token="--color-shadow" tokens={tokens} />
                <Cell mode={mode} label="Backdrop" sublabel="alpha black" token="--color-backdrop" tokens={tokens} />
                <Cell mode={mode} label="Shadow α10" sublabel="rgba" token="--shadow-color-alpha-10" tokens={tokens} scope="surface" />
                <Cell mode={mode} label="Shadow α15" sublabel="rgba" token="--shadow-color-alpha-15" tokens={tokens} scope="surface" />
                <Cell mode={mode} label="Shadow α20" sublabel="rgba" token="--shadow-color-alpha-20" tokens={tokens} scope="surface" />
            </div>
        </div>
    );
};

export function PalettePreview() {
    const { tokens, scales, ui } = useThemeStore();
    const mode: 'light' | 'dark' = ui.themeMode;

    return (
        <section>
            <div className="preview-card">
                {/* Single mode based on toolbar selection */}
                {mode === 'light' ? (
                    <div style={{ marginBottom: '0' }}>
                        <h3 style={{ 
                            marginBottom: '24px', 
                            fontSize: '20px', 
                            fontWeight: '600',
                            color: 'var(--color-on-surface-heading)' 
                        }}>
                            Color Palette · Light Mode
                        </h3>
                        <ColorRow name="Primary" mode="light" tokens={tokens} scales={scales} />
                        <ColorRow name="Secondary" mode="light" tokens={tokens} scales={scales} />
                        <ColorRow name="Error" mode="light" tokens={tokens} scales={scales} />
                        <ColorRow name="Success" mode="light" tokens={tokens} scales={scales} />
                        <ColorRow name="Warning" mode="light" tokens={tokens} scales={scales} />
                        <ColorRow name="Info" mode="light" tokens={tokens} scales={scales} />
                        <SurfaceSection mode="light" tokens={tokens} scales={scales} />
                        <OnSurfaceSection mode="light" tokens={tokens} scales={scales} />
                        <OutlineAndOtherSection mode="light" tokens={tokens} scales={scales} />
                    </div>
                ) : (
                    <div style={{ marginBottom: '0' }}>
                        <h3 style={{ 
                            color: 'var(--color-on-surface-heading)', 
                            marginBottom: '24px', 
                            fontSize: '20px',
                            fontWeight: '600'
                        }}>
                            Color Palette · Dark Mode
                        </h3>
                        <ColorRow name="Primary" mode="dark" tokens={tokens} scales={scales} />
                        <ColorRow name="Secondary" mode="dark" tokens={tokens} scales={scales} />
                        <ColorRow name="Error" mode="dark" tokens={tokens} scales={scales} />
                        <ColorRow name="Success" mode="dark" tokens={tokens} scales={scales} />
                        <ColorRow name="Warning" mode="dark" tokens={tokens} scales={scales} />
                        <ColorRow name="Info" mode="dark" tokens={tokens} scales={scales} />
                        <SurfaceSection mode="dark" tokens={tokens} scales={scales} />
                        <OnSurfaceSection mode="dark" tokens={tokens} scales={scales} />
                        <OutlineAndOtherSection mode="dark" tokens={tokens} scales={scales} />
                    </div>
                )}
            </div>
        </section>
    );
}
