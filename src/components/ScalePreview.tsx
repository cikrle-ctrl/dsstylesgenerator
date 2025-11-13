// src/components/ScalePreview.tsx
import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import './PreviewCard.css';

// Helper function for contrast-based text color
const getTextColor = (hex: string) => {
    try {
        const rgb = parseInt(hex.substring(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        // Relative luminance in sRGB
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luminance > 0.5 ? 'black' : 'white';
    } catch { return 'white'; }
};

const steps = ['0', '50', '100', '150', '200', '250', '300', '350', '400', '450', '500', '550', '600', '650', '700', '750', '800', '850', '900', '950', '1000'];

export function ScalePreview() {
    const { scales } = useThemeStore();
    const [copied, setCopied] = useState('');
    const [highlightedStep, setHighlightedStep] = useState<string | null>(null);

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(''), 1500);
    };

    const handleStepHover = (scaleName: string, step: string) => {
        setHighlightedStep(`${scaleName}-${step}`);
    };

    const handleStepLeave = () => {
        setHighlightedStep(null);
    };

    const renderScale = (scaleName: keyof typeof scales, scale: Record<string, string>) => (
        <div style={{ marginBottom: '32px' }} key={scaleName}>
            <div style={{ 
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--color-on-surface-heading)',
                textTransform: 'capitalize',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px'
            }}>
                <span>{scaleName}</span>
                <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '400', 
                    color: 'var(--color-on-surface-variant)',
                    textTransform: 'none'
                }}>
                    {scaleName === 'primary' && 'main action color'}
                    {scaleName === 'secondary' && 'secondary actions'}
                    {scaleName === 'neutral' && 'text and backgrounds'}
                    {scaleName === 'error' && 'errors and warnings'}
                    {scaleName === 'warning' && 'alerts'}
                    {scaleName === 'success' && 'success'}
                    {scaleName === 'info' && 'information'}
                </span>
            </div>
            <div aria-label={`${scaleName} scale, click to copy`} style={{
                display: 'flex',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '56px',
                boxShadow: 'none',
                cursor: 'pointer',
                border: '1px solid var(--color-outline-subtle)'
            }}>
                {steps.map((step) => {
                    const color = scale[step];
                    if (!color) return null;
                    const isCopied = copied === color;
                    const isHighlighted = highlightedStep === `${scaleName}-${step}`;
                    const ariaLabel = `${String(scaleName)} ${step}: ${color}. Click or press Enter to copy`;
                    
                    return (
                        <div 
                            key={step} 
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.15s ease',
                                background: color,
                                color: getTextColor(color),
                                filter: isCopied ? 'brightness(1.2)' : isHighlighted ? 'brightness(1.1)' : 'none',
                                transform: isCopied ? 'scale(1.05)' : isHighlighted ? 'scale(1.02)' : 'scale(1)',
                                zIndex: isCopied ? 10 : isHighlighted ? 5 : 1,
                                position: 'relative',
                                outline: 'none',
                                boxShadow: isCopied ? '0 0 0 3px color-mix(in oklab, var(--color-focus) 30%, transparent)' : 'none'
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={ariaLabel}
                            onClick={() => handleCopy(color)}
                            onMouseEnter={() => handleStepHover(scaleName as string, step)}
                            onMouseLeave={handleStepLeave}
                            onFocus={() => handleStepHover(scaleName as string, step)}
                            onBlur={handleStepLeave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCopy(color);
                                }
                            }}
                            title={`${step}: ${color}`}
                        >
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                textAlign: 'center',
                                fontSize: '11px',
                                fontWeight: '600'
                            }}>
                                {isCopied ? '✓' : step}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ 
                fontSize: '11px', 
                color: 'var(--color-on-surface-subtle)',
                marginTop: '6px',
                textAlign: 'center',
                fontFamily: 'monospace'
            }}>
                0 → 1000
            </div>
        </div>
    );

    return (
        <section>
            <div className="preview-card">
                <h2 style={{ 
                    color: 'var(--color-on-surface-heading)',
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '20px' 
                }}>
                    Color Scales
                </h2>
                <p style={{ 
                    color: 'var(--color-on-surface-variant)',
                    marginBottom: '24px',
                    fontSize: '16px',
                    lineHeight: '1.5'
                }}>
                    The semantic palette is generated automatically from these color scales.
                    Each shade (50-900) has a specific purpose in the design system.
                    <br />
                    <strong>Click any color to copy its hex code.</strong>
                </p>
                {renderScale('primary', scales.primary)}
                {renderScale('secondary', scales.secondary)}
                {renderScale('neutral', scales.neutral)}
                {renderScale('error', scales.error)}
                {renderScale('warning', scales.warning)}
                {renderScale('success', scales.success)}
                {renderScale('info', scales.info)}
            </div>
        </section>
    );
}