import { useEffect, useMemo, useState } from 'react';
import { useThemeStore } from '../store/themeStore';

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

    const { ui } = useThemeStore();

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
                            Basic Usage
                        </h3>
                        <div className="docs-code">
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
                        <div className="docs-code">
{`/* Scale Examples */
--primary-0: #ffffff     /* Lightest */
--primary-200: #c5d9ff   /* Container (Light Mode) */
--primary-500: #4c8bfd   /* Base color */
--primary-800: #1a3d7a   /* Container (Dark Mode) */
--primary-1000: #000000  /* Darkest */`}
                        </div>
                    </section>

                    {/* Contrast Modes */}
                    <section id="contrast-modes" className="docs-section">
                        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-on-surface-heading)', margin: '0 0 24px 0' }}>
                            Contrast Modes
                        </h2>

                        <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '1.7', marginBottom: '24px' }}>
                            The generator supports 6 modes (Light/Dark × Default/High/Extra-High) with guaranteed WCAG contrast ratios.
                        </p>

                        <div className="docs-card" style={{ background: 'var(--color-surface-variant)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-outline-default)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-on-surface-heading)', fontWeight: '600' }}>Mode</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-on-surface-heading)', fontWeight: '600' }}>Text Contrast</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-on-surface-heading)', fontWeight: '600' }}>Container Contrast</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-on-surface-heading)', fontWeight: '600' }}>WCAG Level</th>
                                    </tr>
                                </thead>
                                <tbody style={{ color: 'var(--color-on-surface-variant)' }}>
                                    <tr style={{ borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                        <td style={{ padding: '12px' }}><span className="contrast-badge default">Default</span></td>
                                        <td style={{ padding: '12px' }}>4.5:1</td>
                                        <td style={{ padding: '12px' }}>3.0:1</td>
                                        <td style={{ padding: '12px' }}>AA</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--color-outline-subtle)' }}>
                                        <td style={{ padding: '12px' }}><span className="contrast-badge high">High Contrast</span></td>
                                        <td style={{ padding: '12px' }}>7.0:1</td>
                                        <td style={{ padding: '12px' }}>4.5:1</td>
                                        <td style={{ padding: '12px' }}>AAA</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '12px' }}><span className="contrast-badge extra-high">Extra-High</span></td>
                                        <td style={{ padding: '12px' }}>9.0:1</td>
                                        <td style={{ padding: '12px' }}>7.0:1</td>
                                        <td style={{ padding: '12px' }}>AAA+</td>
                                    </tr>
                                </tbody>
                            </table>
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
                            100+ semantic tokens organized by purpose. Use these instead of hardcoded colors for automatic theme support.
                        </p>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '0 0 16px 0' }}>
                            Primary Semantic Colors
                        </h3>
                        <div style={{ marginBottom: '24px' }}>
                            <span className="token-chip">--color-primary</span>
                            <span className="token-chip">--color-on-primary</span>
                            <span className="token-chip">--color-primary-container</span>
                            <span className="token-chip">--color-on-primary-container</span>
                            <span className="token-chip">--color-primary-hover</span>
                            <span className="token-chip">--color-primary-pressed</span>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '24px 0 16px 0' }}>
                            Surface & Background
                        </h3>
                        <div style={{ marginBottom: '24px' }}>
                            <span className="token-chip">--color-surface</span>
                            <span className="token-chip">--color-surface-variant</span>
                            <span className="token-chip">--color-background</span>
                            <span className="token-chip">--color-on-surface-heading</span>
                            <span className="token-chip">--color-on-surface-variant</span>
                            <span className="token-chip">--color-surface-hover</span>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '24px 0 16px 0' }}>
                            Outline & Focus
                        </h3>
                        <div style={{ marginBottom: '24px' }}>
                            <span className="token-chip">--color-outline-default</span>
                            <span className="token-chip">--color-outline-subtle</span>
                            <span className="token-chip">--color-outline-strong</span>
                            <span className="token-chip">--color-focus</span>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-on-surface-heading)', margin: '24px 0 16px 0' }}>
                            States
                        </h3>
                        <div>
                            <span className="token-chip">--color-disabled</span>
                            <span className="token-chip">--color-on-disabled</span>
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
                            Exports all 6 modes with platform-specific codeSyntax for seamless handoff:
                        </p>
                        <div className="docs-code">
{`{
  "collectionName": "Color Palette",
  "modes": ["Light", "Dark", "LightHigh", "DarkHigh", 
            "LightExtraHigh", "DarkExtraHigh"],
  "variables": [
    {
      "name": "primary/primary",
      "type": "COLOR",
      "values": ["#4c8bfd", "#4c8bfd", ...],
      "codeSyntax": {
        "WEB": "var(--color-primary)",
        "IOS": "PrimaryColor.primary",
        "ANDROID": "color_primary"
      }
    }
  ]
}`}
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
