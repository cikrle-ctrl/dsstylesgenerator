import { useEffect, useMemo, useState } from 'react';

export function Docs() {
    const sections = useMemo(() => ([
        { id: 'intro', label: 'Introduction' },
        { id: 'getting-started', label: 'Getting Started' },
        { id: 'color-system', label: 'Color System' },
        { id: 'contrast-modes', label: 'Contrast Modes' },
        { id: 'tokens', label: 'Design Tokens' },
        { id: 'export', label: 'Export Options' },
        { id: 'advanced', label: 'Advanced Features' },
    ]), []);

    const [activeId, setActiveId] = useState<string>('intro');

    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActiveId(visible.target.id);
        }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.2, 0.4, 0.6, 0.8, 1] });
        sections.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, [sections]);

    return (
        <div style={{ 
            padding: '24px', 
            maxWidth: '1400px', 
            margin: '0 auto',
            minHeight: '100vh'
        }}>
            <style>{`
                .docs-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                }
                @media(min-width: 1024px) {
                    .docs-container {
                        grid-template-columns: minmax(0, 1fr) 240px;
                    }
                }
                .docs-nav {
                    position: sticky;
                    top: 80px;
                    align-self: start;
                    height: fit-content;
                    display: none;
                }
                @media(min-width: 1024px) {
                    .docs-nav {
                        display: block;
                    }
                }
                .docs-nav-link {
                    display: block;
                    padding: 10px 16px;
                    color: var(--color-on-surface-variant);
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.15s ease;
                    margin-bottom: 4px;
                }
                .docs-nav-link:hover {
                    background: var(--color-surface-hover);
                    color: var(--color-on-surface-heading);
                }
                .docs-nav-link[aria-current="true"] {
                    background: var(--color-primary-container);
                    color: var(--color-on-primary-container);
                    font-weight: 600;
                }
                .docs-section {
                    margin-bottom: 64px;
                    scroll-margin-top: 80px;
                }
                .docs-card {
                    background: var(--color-surface);
                    border: 1px solid var(--color-outline-subtle);
                    border-radius: 12px;
                    padding: 24px;
                    margin: 20px 0;
                }
                .docs-code {
                    background: var(--color-surface-variant);
                    border: 1px solid var(--color-outline-subtle);
                    border-radius: 10px;
                    padding: 18px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    overflow-x: auto;
                    margin: 16px 0;
                }
                .docs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                    margin: 20px 0;
                }
                .feature-card {
                    background: var(--color-primary-container);
                    border: 1px solid var(--color-primary);
                    border-radius: 12px;
                    padding: 20px;
                }
                .feature-card h4 {
                    color: var(--color-on-primary-container);
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                .feature-card p {
                    color: var(--color-on-primary-container);
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.5;
                    opacity: 0.9;
                }
                .token-chip {
                    display: inline-block;
                    background: var(--color-surface-variant);
                    color: var(--color-on-surface-heading);
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 13px;
                    font-weight: 500;
                    margin: 4px;
                }
                .contrast-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    margin: 4px;
                }
                .contrast-badge.default {
                    background: var(--color-info-container);
                    color: var(--color-on-info-container);
                }
                .contrast-badge.high {
                    background: var(--color-warning-container);
                    color: var(--color-on-warning-container);
                }
                .contrast-badge.extra-high {
                    background: var(--color-error-container);
                    color: var(--color-on-error-container);
                }
                .token-row {
                    display: grid;
                    grid-template-columns: 80px 1fr 2fr;
                    gap: 16px;
                    padding: 16px;
                    border-bottom: 1px solid var(--color-outline-subtle);
                    align-items: center;
                }
                .token-row:last-child {
                    border-bottom: none;
                }
                .token-row:hover {
                    background: var(--color-surface-hover);
                }
                .token-swatch {
                    width: 64px;
                    height: 48px;
                    border-radius: 8px;
                    border: 1px solid var(--color-outline-subtle);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .token-name {
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-on-surface-heading);
                }
                .token-desc {
                    font-size: 14px;
                    color: var(--color-on-surface-variant);
                    line-height: 1.5;
                }
                .mode-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin: 24px 0;
                }
                @media(min-width: 768px) {
                    .mode-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                .mode-card {
                    background: var(--color-surface);
                    border: 2px solid var(--color-outline-default);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s ease;
                }
                .mode-card:hover {
                    border-color: var(--color-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .mode-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .mode-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .mode-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-on-surface-heading);
                    margin: 0;
                }
                .mode-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--color-outline-subtle);
                }
                .mode-meta-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                }
                .mode-meta-label {
                    color: var(--color-on-surface-variant);
                }
                .mode-meta-value {
                    color: var(--color-on-surface-heading);
                    font-weight: 600;
                    font-family: 'Consolas', monospace;
                }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: '48px' }}>
                <h1 style={{ 
                    fontSize: '42px', 
                    fontWeight: '800', 
                    color: 'var(--color-on-surface-heading)',
                    margin: '0 0 16px 0',
                    letterSpacing: '-0.02em'
                }}>
                    Documentation
                </h1>
                <p style={{ 
                    fontSize: '18px', 
                    color: 'var(--color-on-surface-variant)',
                    lineHeight: '1.6',
                    maxWidth: '700px',
                    margin: 0
                }}>
                    Professional design system generator built on OKLCH color space, perceptual uniformity, and WCAG accessibility standards.
                </p>
            </div>

            <div className="docs-container">
                {/* Main Content */}
                <div>
                    {/* Introduction */}
                    <section id="intro" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Introduction
                        </h2>

                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '24px' }}>
                            DS Styles Generator creates complete, accessible color systems based on modern color science and W CAG standards. 
                            It solves the common problems of traditional palette generators: inconsistent perception and unreliable accessibility.
                        </p>

                        <div className="docs-grid">
                            <div className="feature-card">
                                <h4>🎨 Perceptual Uniformity</h4>
                                <p>Built on OKLCH color space. Colors that look equally spaced are numerically equally spaced.</p>
                            </div>
                            <div className="feature-card">
                                <h4>♿ Accessibility First</h4>
                                <p>Dynamically meets WCAG contrast ratios (4.5:1, 7:1, 9:1) across all modes.</p>
                            </div>
                            <div className="feature-card">
                                <h4>🎯 Semantic Tokens</h4>
                                <p>100+ design tokens organized by purpose, not just color values.</p>
                            </div>
                        </div>
                    </section>

                    {/* Getting Started */}
                    <section id="getting-started" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Getting Started
                        </h2>

                        <div className="docs-card">
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 16px 0' }}>
                                Quick Start (3 minutes)
                            </h3>
                            <ol style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.8', paddingLeft: '24px' }}>
                                <li style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: 'var(--color-on-surface-heading)' }}>Choose Primary Color:</strong> Use the color picker in the left sidebar
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: 'var(--color-on-surface-heading)' }}>Set Color Harmony:</strong> Select complementary, analogous, or triadic (or pick secondary manually)
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: 'var(--color-on-surface-heading)' }}>Test Contrast Modes:</strong> Toggle Light/Dark × Default/High/Extra-High in top toolbar
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: 'var(--color-on-surface-heading)' }}>Export:</strong> Click "Figma Variables" for 6-mode JSON with codeSyntax
                                </li>
                                <li>
                                    <strong style={{ color: 'var(--color-on-surface-heading)' }}>Use Tokens:</strong> Apply semantic CSS variables in your project
                                </li>
                            </ol>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '32px 0 16px 0' }}>
                            Basic Usage Example
                        </h3>
                        
                        <div className="docs-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
                                <div style={{ background: 'var(--color-surface-variant)', padding: '24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-on-surface-variant)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <button style={{
                                            background: 'var(--color-primary)',
                                            color: 'var(--color-on-primary)',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}>
                                            Primary Button
                                        </button>
                                        <button style={{
                                            background: 'var(--color-secondary)',
                                            color: 'var(--color-on-secondary)',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>
                                            Secondary
                                        </button>
                                        <button style={{
                                            background: 'transparent',
                                            color: 'var(--color-primary)',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-outline-default)',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>
                                            Outlined
                                        </button>
                                    </div>
                                </div>
                                <div className="docs-code" style={{ margin: 0, borderRadius: 0 }}>
{`/* Button Component */
.button {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
}

.button:hover {
  background: var(--color-primary-hover);
  color: var(--color-on-primary-hover);
}

.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}`}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Color System */}
                    <section id="color-system" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Color System
                        </h2>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 16px 0' }}>
                            OKLCH Color Space
                        </h3>
                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '20px' }}>
                            Unlike HSL/RGB, OKLCH is perceptually uniform. A blue at lightness 50 and a yellow at lightness 50 appear equally bright to the human eye.
                        </p>

                        <div className="docs-grid">
                            <div style={{ padding: '18px', background: 'var(--color-surface-variant)', borderRadius: '10px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-primary)', margin: '0 0 10px 0' }}>L (Lightness)</h4>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    0% = black, 100% = white. Perceptually linear scale.
                                </p>
                            </div>
                            <div style={{ padding: '18px', background: 'var(--color-surface-variant)', borderRadius: '10px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-secondary)', margin: '0 0 10px 0' }}>C (Chroma)</h4>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    0 = gray, higher = more vivid. Adaptive per hue.
                                </p>
                            </div>
                            <div style={{ padding: '18px', background: 'var(--color-surface-variant)', borderRadius: '10px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-error)', margin: '0 0 10px 0' }}>H (Hue)</h4>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    0-360° color wheel. Stable across lightness changes.
                                </p>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '32px 0 16px 0' }}>
                            Scale System (0-1000)
                        </h3>
                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '16px' }}>
                            Each color generates a 21-step scale from 0 (white) to 1000 (black). Steps are 50 units apart for easy reference.
                        </p>
                        
                        <div className="docs-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Scale Example</div>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                                    {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].map(step => (
                                        <div key={step} style={{ textAlign: 'center' }}>
                                            <div style={{
                                                height: '48px',
                                                background: `var(--primary-${step})`,
                                                borderRadius: '6px',
                                                border: '1px solid var(--color-outline-subtle)',
                                                marginBottom: '6px'
                                            }}></div>
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-on-surface-heading)', fontFamily: 'Consolas, monospace' }}>{step}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--color-outline-subtle)', fontSize: '13px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--color-on-surface-heading)', fontFamily: 'Consolas, monospace' }}>Step</div>
                                    <div style={{ fontWeight: '600', color: 'var(--color-on-surface-heading)' }}>Usage</div>
                                    <div style={{ fontWeight: '600', color: 'var(--color-on-surface-heading)' }}>Token</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--color-outline-subtle)', fontSize: '13px' }}>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-primary)', fontWeight: '600' }}>0</div>
                                    <div style={{ color: 'var(--color-on-surface-variant)' }}>Lightest tint</div>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-surface-heading)', fontSize: '12px' }}>--primary-0</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--color-outline-subtle)', fontSize: '13px', background: 'var(--color-info-container)' }}>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-info-container)', fontWeight: '600' }}>200</div>
                                    <div style={{ color: 'var(--color-on-info-container)' }}>Container (Light Mode) ⭐</div>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-info-container)', fontSize: '12px' }}>--primary-200</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--color-outline-subtle)', fontSize: '13px' }}>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-primary)', fontWeight: '600' }}>500</div>
                                    <div style={{ color: 'var(--color-on-surface-variant)' }}>Base color (mid-point)</div>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-surface-heading)', fontSize: '12px' }}>--primary-500</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--color-outline-subtle)', fontSize: '13px', background: 'var(--color-warning-container)' }}>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-warning-container)', fontWeight: '600' }}>800</div>
                                    <div style={{ color: 'var(--color-on-warning-container)' }}>Container (Dark Mode) ⭐</div>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-warning-container)', fontSize: '12px' }}>--primary-800</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--color-outline-subtle)', fontSize: '13px' }}>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-primary)', fontWeight: '600' }}>1000</div>
                                    <div style={{ color: 'var(--color-on-surface-variant)' }}>Darkest shade</div>
                                    <div style={{ fontFamily: 'Consolas, monospace', color: 'var(--color-on-surface-heading)', fontSize: '12px' }}>--primary-1000</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contrast Modes */}
                    <section id="contrast-modes" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Accessibility Modes
                        </h2>

                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '24px' }}>
                            Six accessibility modes ensure your design system works for everyone. Each mode guarantees WCAG-compliant contrast ratios.
                        </p>

                        <div className="mode-grid">
                            <div className="mode-card">
                                <div className="mode-header">
                                    <div className="mode-icon" style={{ background: 'var(--color-info-container)', color: 'var(--color-on-info-container)' }}>
                                        ☀️
                                    </div>
                                    <h3 className="mode-title">Light</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    Standard light mode with comfortable contrast for everyday use.
                                </p>
                                <div className="mode-meta">
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Text</span>
                                        <span className="mode-meta-value">4.5:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Container</span>
                                        <span className="mode-meta-value">3.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">WCAG</span>
                                        <span className="mode-meta-value">AA ✓</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mode-card">
                                <div className="mode-header">
                                    <div className="mode-icon" style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>
                                        🌙
                                    </div>
                                    <h3 className="mode-title">Dark</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    Standard dark mode reducing eye strain in low-light conditions.
                                </p>
                                <div className="mode-meta">
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Text</span>
                                        <span className="mode-meta-value">4.5:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Container</span>
                                        <span className="mode-meta-value">3.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">WCAG</span>
                                        <span className="mode-meta-value">AA ✓</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mode-card">
                                <div className="mode-header">
                                    <div className="mode-icon" style={{ background: 'var(--color-warning-container)', color: 'var(--color-on-warning-container)' }}>
                                        ☀️+
                                    </div>
                                    <h3 className="mode-title">Light High</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    Enhanced contrast for bright environments or visual impairments.
                                </p>
                                <div className="mode-meta">
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Text</span>
                                        <span className="mode-meta-value">7.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Container</span>
                                        <span className="mode-meta-value">4.5:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">WCAG</span>
                                        <span className="mode-meta-value">AAA ✓</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mode-card">
                                <div className="mode-header">
                                    <div className="mode-icon" style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
                                        🌙+
                                    </div>
                                    <h3 className="mode-title">Dark High</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    Enhanced dark mode with increased text clarity and readability.
                                </p>
                                <div className="mode-meta">
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Text</span>
                                        <span className="mode-meta-value">7.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Container</span>
                                        <span className="mode-meta-value">4.5:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">WCAG</span>
                                        <span className="mode-meta-value">AAA ✓</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mode-card">
                                <div className="mode-header">
                                    <div className="mode-icon" style={{ background: 'var(--color-error-container)', color: 'var(--color-on-error-container)' }}>
                                        ☀️++
                                    </div>
                                    <h3 className="mode-title">Light Extra-High</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    Maximum contrast for severe visual impairments or outdoor use.
                                </p>
                                <div className="mode-meta">
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Text</span>
                                        <span className="mode-meta-value">9.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Container</span>
                                        <span className="mode-meta-value">7.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">WCAG</span>
                                        <span className="mode-meta-value">AAA+ ✓</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mode-card">
                                <div className="mode-header">
                                    <div className="mode-icon" style={{ background: 'var(--color-success-container)', color: 'var(--color-on-success-container)' }}>
                                        🌙++
                                    </div>
                                    <h3 className="mode-title">Dark Extra-High</h3>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.6' }}>
                                    Ultimate dark mode contrast for accessibility compliance.
                                </p>
                                <div className="mode-meta">
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Text</span>
                                        <span className="mode-meta-value">9.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">Container</span>
                                        <span className="mode-meta-value">7.0:1</span>
                                    </div>
                                    <div className="mode-meta-item">
                                        <span className="mode-meta-label">WCAG</span>
                                        <span className="mode-meta-value">AAA+ ✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '32px 0 16px 0' }}>
                            Container Colors (Fixed Values)
                        </h3>
                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '16px' }}>
                            In Default mode, container colors use fixed scale steps for consistency:
                        </p>
                        <ul style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.8', paddingLeft: '24px' }}>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>Light Mode:</strong> Step 200 (soft, subtle background)</li>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>Dark Mode:</strong> Step 800 (muted, comfortable)</li>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>High Contrast:</strong> Dynamic (optimized for 4.5:1 / 7.0:1)</li>
                        </ul>
                    </section>

                    {/* Design Tokens */}
                    <section id="tokens" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Design Tokens
                        </h2>

                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '24px' }}>
                            100+ semantic tokens organized by purpose. Use these instead of hardcoded colors for automatic theme support across all 6 modes.
                        </p>

                        <div className="docs-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0', padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                Primary Colors
                            </h3>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-primary)' }}></div>
                                <div className="token-name">--color-primary</div>
                                <div className="token-desc">Main brand color for buttons, links, and primary actions</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-on-primary)', border: '1px solid var(--color-outline-default)' }}></div>
                                <div className="token-name">--color-on-primary</div>
                                <div className="token-desc">Text and icons on primary color backgrounds</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-primary-container)' }}></div>
                                <div className="token-name">--color-primary-container</div>
                                <div className="token-desc">Subtle backgrounds for chips, badges, and highlights</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-on-primary-container)' }}></div>
                                <div className="token-name">--color-on-primary-container</div>
                                <div className="token-desc">Text on primary container backgrounds</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-primary-hover)' }}></div>
                                <div className="token-name">--color-primary-hover</div>
                                <div className="token-desc">Hover state for primary elements</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-primary-pressed)' }}></div>
                                <div className="token-name">--color-primary-pressed</div>
                                <div className="token-desc">Active/pressed state for primary elements</div>
                            </div>
                        </div>

                        <div className="docs-card" style={{ padding: '0', overflow: 'hidden', marginTop: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0', padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                Surface & Background
                            </h3>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline-default)' }}></div>
                                <div className="token-name">--color-surface</div>
                                <div className="token-desc">Card backgrounds, modals, dropdowns</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-surface-variant)' }}></div>
                                <div className="token-name">--color-surface-variant</div>
                                <div className="token-desc">Alternate surface for subtle differentiation</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-background)', border: '1px solid var(--color-outline-default)' }}></div>
                                <div className="token-name">--color-background</div>
                                <div className="token-desc">Main page background</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-on-surface-heading)' }}></div>
                                <div className="token-name">--color-on-surface-heading</div>
                                <div className="token-desc">Headings, titles, emphasized text</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-on-surface-variant)' }}></div>
                                <div className="token-name">--color-on-surface-variant</div>
                                <div className="token-desc">Body text, descriptions, secondary content</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-surface-hover)' }}></div>
                                <div className="token-name">--color-surface-hover</div>
                                <div className="token-desc">Hover state for surface elements (list items, rows)</div>
                            </div>
                        </div>

                        <div className="docs-card" style={{ padding: '0', overflow: 'hidden', marginTop: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0', padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                Semantic States
                            </h3>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-error)' }}></div>
                                <div className="token-name">--color-error</div>
                                <div className="token-desc">Errors, destructive actions, validation failures</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-warning)' }}></div>
                                <div className="token-name">--color-warning</div>
                                <div className="token-desc">Warnings, caution alerts, important notices</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-success)' }}></div>
                                <div className="token-name">--color-success</div>
                                <div className="token-desc">Success messages, confirmations, positive states</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-info)' }}></div>
                                <div className="token-name">--color-info</div>
                                <div className="token-desc">Informational messages, tips, neutral alerts</div>
                            </div>
                        </div>

                        <div className="docs-card" style={{ padding: '0', overflow: 'hidden', marginTop: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0', padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                Outline & Focus
                            </h3>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-outline-default)' }}></div>
                                <div className="token-name">--color-outline-default</div>
                                <div className="token-desc">Default borders, dividers, input outlines</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-outline-subtle)' }}></div>
                                <div className="token-name">--color-outline-subtle</div>
                                <div className="token-desc">Subtle dividers, card borders</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-outline-strong)' }}></div>
                                <div className="token-name">--color-outline-strong</div>
                                <div className="token-desc">Emphasized borders, active states</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-focus)' }}></div>
                                <div className="token-name">--color-focus</div>
                                <div className="token-desc">Keyboard focus indicators (3px outline)</div>
                            </div>
                        </div>

                        <div className="docs-card" style={{ padding: '0', overflow: 'hidden', marginTop: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0', padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                Disabled States
                            </h3>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-disabled)' }}></div>
                                <div className="token-name">--color-disabled</div>
                                <div className="token-desc">Disabled button backgrounds, inactive elements</div>
                            </div>
                            
                            <div className="token-row">
                                <div className="token-swatch" style={{ background: 'var(--color-on-disabled)' }}></div>
                                <div className="token-name">--color-on-disabled</div>
                                <div className="token-desc">Text on disabled backgrounds</div>
                            </div>
                        </div>
                    </section>

                    {/* Export */}
                    <section id="export" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Export Options
                        </h2>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 16px 0' }}>
                            Figma Variables (Recommended)
                        </h3>
                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '16px' }}>
                            Exports all 6 modes with platform-specific codeSyntax for seamless design-to-code handoff:
                        </p>
                        
                        <div className="docs-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-outline-subtle)', background: 'var(--color-primary-container)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-on-primary-container)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Export Structure</div>
                                <div style={{ fontSize: '14px', color: 'var(--color-on-primary-container)', opacity: 0.9 }}>Single JSON file with multi-platform support</div>
                            </div>
                            
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-heading)', marginBottom: '12px' }}>📦 Collection</div>
                                    <div style={{ background: 'var(--color-surface-variant)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-subtle)' }}>
                                        <div style={{ fontFamily: 'Consolas, monospace', fontSize: '13px', color: 'var(--color-on-surface-heading)' }}>"collectionName": "Color Palette"</div>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-heading)', marginBottom: '12px' }}>🎨 Modes (6 total)</div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {['Light', 'Dark', 'LightHigh', 'DarkHigh', 'LightExtraHigh', 'DarkExtraHigh'].map(mode => (
                                            <div key={mode} style={{
                                                background: 'var(--color-secondary-container)',
                                                color: 'var(--color-on-secondary-container)',
                                                padding: '8px 14px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                fontFamily: 'Consolas, monospace'
                                            }}>
                                                {mode}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-heading)', marginBottom: '12px' }}>💻 Platform CodeSyntax</div>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div style={{ background: 'var(--color-surface-variant)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-subtle)' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>WEB</div>
                                            <div style={{ fontFamily: 'Consolas, monospace', fontSize: '13px', color: 'var(--color-on-surface-heading)' }}>var(--color-primary)</div>
                                        </div>
                                        <div style={{ background: 'var(--color-surface-variant)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-subtle)' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>iOS (Swift)</div>
                                            <div style={{ fontFamily: 'Consolas, monospace', fontSize: '13px', color: 'var(--color-on-surface-heading)' }}>PrimaryColor.primary</div>
                                        </div>
                                        <div style={{ background: 'var(--color-surface-variant)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-subtle)' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-success)', marginBottom: '8px', textTransform: 'uppercase' }}>ANDROID (Kotlin)</div>
                                            <div style={{ fontFamily: 'Consolas, monospace', fontSize: '13px', color: 'var(--color-on-surface-heading)' }}>color_primary</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '32px 0 16px 0' }}>
                            Other Formats
                        </h3>
                        <ul style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.8', paddingLeft: '24px' }}>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>CSS Variables:</strong> Standard CSS custom properties</li>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>Tailwind v3/v4:</strong> JavaScript or CSS @theme</li>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>SCSS:</strong> Sass variables</li>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>JSON:</strong> Complete tokens and scales</li>
                            <li><strong style={{ color: 'var(--color-on-surface-heading)' }}>CSV:</strong> Contrast audit with WCAG levels</li>
                        </ul>
                    </section>

                    {/* Advanced */}
                    <section id="advanced" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Advanced Features
                        </h2>

                        <div className="docs-card">
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 12px 0' }}>
                                🎨 Color Harmonies
                            </h3>
                            <p style={{ fontSize: '15px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                                Auto-generate secondary colors based on color theory:
                            </p>
                            <ul style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', paddingLeft: '20px', margin: 0 }}>
                                <li><strong>Complementary:</strong> Opposite on color wheel (180°)</li>
                                <li><strong>Analogous:</strong> Adjacent colors (±30°)</li>
                                <li><strong>Triadic:</strong> Evenly spaced (120°)</li>
                                <li><strong>Split-Complementary:</strong> Base + two neighbors of complement</li>
                                <li><strong>Tetradic:</strong> Four colors forming a rectangle</li>
                            </ul>
                        </div>

                        <div className="docs-card">
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 12px 0' }}>
                                🎯 Pro Mode (Custom Tones)
                            </h3>
                            <p style={{ fontSize: '15px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0 }}>
                                Override automatic tone selection. Specify exact scale steps (0-1000) for light and dark modes per semantic color.
                            </p>
                        </div>

                        <div className="docs-card">
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 12px 0' }}>
                                🌈 Neutral Tints
                            </h3>
                            <p style={{ fontSize: '15px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0 }}>
                                Choose neutral source: Primary-tinted (subtle brand color), Secondary-tinted, Custom color, or Pure gray (achromatic).
                            </p>
                        </div>

                        <div className="docs-card">
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 12px 0' }}>
                                👁️ Colorblind Simulation
                            </h3>
                            <p style={{ fontSize: '15px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6', margin: 0 }}>
                                Preview your palette through different types of color vision deficiency to ensure usability for all users.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Sidebar Navigation */}
                <nav className="docs-nav">
                    <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: 'var(--color-on-surface-variant)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                        paddingLeft: '16px'
                    }}>
                        On This Page
                    </div>
                    {sections.map(s => (
                        <a 
                            key={s.id} 
                            href={`#${s.id}`} 
                            className="docs-nav-link"
                            aria-current={activeId === s.id ? 'true' : undefined}
                        >
                            {s.label}
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
}
