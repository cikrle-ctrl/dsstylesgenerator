import { useThemeStore } from '../store/themeStore';
import { 
    generateAnalogousColor, 
    generateComplementaryColor, 
    generateTriadicColors 
} from '../logic/colorModule';

function ColorSwatch({ color, label }: { color: string; label: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '60px',
                height: '60px',
                background: color,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                margin: '0 auto 8px'
            }} />
            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-on-surface-heading)', marginBottom: '2px' }}>
                {label}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--color-on-surface-subtle)', fontFamily: 'monospace' }}>
                {color.toUpperCase()}
            </div>
        </div>
    );
}

function HarmonyRow({
    title,
    description,
    colors
}: {
    title: string;
    description: string;
    colors: { color: string; label: string }[];
}) {
    return (
        <div style={{
            background: 'var(--color-surface)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--color-outline-subtle)',
            marginBottom: '12px',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))'
        }}>
            <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--color-on-surface-heading)' }}>
                    {title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.4' }}>
                    {description}
                </p>
            </div>
            <div style={{ 
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'flex-start',
                flexWrap: 'wrap'
            }}>
                {colors.map((c, i) => (
                    <ColorSwatch key={i} color={c.color} label={c.label} />
                ))}
            </div>
        </div>
    );
}

export const ColorHarmonyVisualizer = ({ showHeader = true, showNote = true }: { showHeader?: boolean; showNote?: boolean }) => {
    const { inputs } = useThemeStore();
    const primaryColor = inputs.colors.primary;
    
    const analogous = generateAnalogousColor(primaryColor);
    const complementary = generateComplementaryColor(primaryColor);
    const [triad1, triad2, triad3] = generateTriadicColors(primaryColor);
    
    return (
        <div style={{
            padding: '20px',
            background: 'transparent',
            borderRadius: '8px',
            marginTop: '20px'
        }}>
            {showHeader && (
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-on-surface-heading)' }}>
                        Color Harmony Generator
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.5' }}>
                        Automatic color combinations based on color theory. Use these for secondary colors or accent colors.
                    </p>
                </div>
            )}
            
            <HarmonyRow
                title="🎨 Analogous Colors"
                description="Colors adjacent on the color wheel (+30° hue). Creates harmonious, calming palettes."
                colors={[
                    { color: primaryColor, label: 'Primary' },
                    { color: analogous, label: 'Analogous' }
                ]}
            />
            
            <HarmonyRow
                title="🎯 Complementary Colors"
                description="Colors opposite on the color wheel (+180° hue). Creates high contrast, vibrant palettes."
                colors={[
                    { color: primaryColor, label: 'Primary' },
                    { color: complementary, label: 'Complementary' }
                ]}
            />
            
            <HarmonyRow
                title="🔺 Triadic Colors"
                description="Three colors evenly spaced on the color wheel (+120° intervals). Creates balanced, vibrant palettes."
                colors={[
                    { color: triad1, label: 'Triad 1' },
                    { color: triad2, label: 'Triad 2' },
                    { color: triad3, label: 'Triad 3' }
                ]}
            />
            
            {showNote && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'var(--color-warning-container)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-outline-subtle)',
                    fontSize: '12px',
                    color: 'var(--color-on-warning-container)',
                    lineHeight: '1.5'
                }}>
                    <strong>⚠️ Note:</strong> Don't use harmony mode for semantic colors (error, warning, success).
                    These should maintain their conventional meanings for usability.
                </div>
            )}
        </div>
    );
};
