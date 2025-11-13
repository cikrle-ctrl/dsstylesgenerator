import { useEffect, useMemo, useState } from 'react';
import { ColorHarmonyVisualizer } from '../components/ColorHarmonyVisualizer';

const title = {
    marginTop: 0,
    marginBottom: 12,
    color: 'var(--color-on-surface-heading)'
} as const;
const body = {
    color: 'var(--color-on-surface-variant)',
    lineHeight: 1.7,
    margin: 0
} as const;
const section = {
    marginBottom: 16
} as const;

export function Docs() {
    const sections = useMemo(() => ([
        { id: 'how', label: 'How it works' },
        { id: 'color-theory', label: 'Color theory & OKLCH' },
        { id: 'scales', label: 'Color scales' },
        { id: 'adaptive-chroma', label: 'Adaptive chroma' },
        { id: 'contrast', label: 'Contrast modes' },
        { id: 'tokens', label: 'Design tokens' },
        { id: 'surface', label: 'Surface & Radius & Outline' },
        { id: 'advanced', label: 'Advanced settings' },
        { id: 'export', label: 'Exports' },
        { id: 'a11y', label: 'Accessibility' },
        { id: 'files', label: 'File structure' },
        { id: 'harmony', label: 'Color Harmony Generator' },
    ]), []);

    const [activeId, setActiveId] = useState<string>('how');
    const [q, setQ] = useState('');

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

    const filtered = useMemo(() => sections.filter(s => s.label.toLowerCase().includes(q.toLowerCase())), [q, sections]);

    return (
        <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
                        <style>{`
                            .docs-grid{display:grid;grid-template-columns:1fr;gap:16px}
                            @media(min-width:1100px){.docs-grid{grid-template-columns:minmax(0,1fr) 300px}}
                            .docs-toc{position:sticky;top:16px;align-self:start;max-height:calc(100vh - 24px);overflow:auto}
                            .docs-toc a{color:var(--color-on-surface-heading);text-decoration:none;display:block;padding:10px 12px;border-radius:8px}
                            .docs-toc a:hover{background:var(--color-surface-hover)}
                              .docs-toc a[aria-current="true"]{background:var(--color-primary-container);color:var(--color-on-primary-container);font-weight:600}
                            .docs-search{display:block;width:100%;box-sizing:border-box;height:36px;border:1px solid var(--color-outline-subtle);background:var(--color-surface);color:var(--color-on-surface-heading);border-radius:8px;padding:0 12px}
                            .docs-search:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px var(--color-focus)}
                        `}</style>
            
            <h1 style={{ ...title, fontSize: 24 }}>Documentation</h1>
            <p style={{ ...body, marginBottom: 20 }}>
                A complete guide to how the theme builder works: scale generation, token mapping,
                contrast modes, customization, exports, and tools for accessibility verification.
            </p>
            <div className="docs-grid">
              <div>
            {/* How it works */}
            <section id="how" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>How the app works</h2>
                <ol style={{ ...body, paddingLeft: 18 }}>
                    <li>
                        <b>Inputs</b> – Pick primary/secondary colors and surface strategies. Inputs are managed by Zustand
                        (<code>src/store/themeStore.ts</code>).
                    </li>
                    <li>
                        <b>Scale generation</b> – <code>colorModule.ts</code> produces a 0→1000 scale (step 50) in OKLCH.
                        We use a perceptual <i>lightness</i> curve and <i>adaptive chroma</i> for natural results.
                    </li>
                    <li>
                        <b>Token mapping</b> – The <code>generateMappedTokens()</code> in
                        <code> tokenMapper.ts</code> creates semantic tokens for light/dark and contrast modes.
                    </li>
                    <li>
                        <b>Live Preview</b> – Components read CSS custom properties and reflect resulting styles. Toggles update
                        <code>data-theme</code> and <code>data-contrast</code> on the container.
                    </li>
                </ol>
            </section>

            {/* Color Theory */}
            <section id="color-theory" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Color theory & OKLCH</h2>
                <p style={body}>
                    This system uses <b>OKLCH</b> (Oklab Lightness-Chroma-Hue), a perceptually uniform color space.
                    Unlike HSL or RGB, OKLCH ensures equal visual steps between colors.
                </p>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Why OKLCH?</h3>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>Perceptual uniformity</b> – Equal numeric changes = equal visual changes</li>
                    <li><b>Independent lightness</b> – Change hue/chroma without affecting perceived brightness</li>
                    <li><b>Better gradients</b> – Smooth color transitions without muddy mid-tones</li>
                    <li><b>Predictable contrast</b> – Lightness directly correlates with WCAG contrast</li>
                </ul>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>OKLCH Components</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 8 }}>
                    <div style={{ padding: 12, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                        <b style={{ color: 'var(--color-primary)' }}>L (Lightness)</b>
                        <p style={{ ...body, margin: '4px 0 0' }}>0.0 = black, 1.0 = white. Matches human perception.</p>
                    </div>
                    <div style={{ padding: 12, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                        <b style={{ color: 'var(--color-secondary)' }}>C (Chroma)</b>
                        <p style={{ ...body, margin: '4px 0 0' }}>0 = gray, higher = more vivid. Typical range: 0-0.4.</p>
                    </div>
                    <div style={{ padding: 12, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                        <b style={{ color: 'var(--color-error)' }}>H (Hue)</b>
                        <p style={{ ...body, margin: '4px 0 0' }}>0-360° on color wheel. Red≈30°, Blue≈260°, Green≈145°.</p>
                    </div>
                </div>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Physical Color Limits</h3>
                <p style={body}>
                    Not all hue/chroma/lightness combinations are physically possible. For example, "bright light blue at 95% lightness"
                    exceeds the sRGB gamut. Our system automatically reduces chroma at extreme lightness values (adaptive chroma).
                </p>
            </section>

            {/* Scales */}
            <section id="scales" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Color scales and generation</h2>
                <p style={body}>
                    Scales are generated in OKLCH: each step targets a specific lightness. The system uses a <b>0-1000 scale</b> with
                    21 steps (0, 50, 100...1000) for finer granularity than Material Design 3's 0-100 scale.
                </p>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Lightness Distribution</h3>
                <p style={body}>
                    Lightness values follow a <b>perceptual curve</b> (power 0.9) for better visual distribution:
                </p>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>0-200</b>: Very light tones (backgrounds, containers in light mode)</li>
                    <li><b>300-600</b>: Mid-tones (primary accents, interactive elements)</li>
                    <li><b>700-1000</b>: Dark tones (backgrounds in dark mode, text on light)</li>
                </ul>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Scale Generation Logic</h3>
                <p style={body}>
                    <code>generateShades(baseColorHex)</code> in <code>colorModule.ts</code>:
                </p>
                <ol style={{ ...body, paddingLeft: 18 }}>
                    <li>Parse input color to OKLCH</li>
                    <li>For each step (0-1000), apply target lightness</li>
                    <li>Apply adaptive chroma multiplier based on lightness</li>
                    <li>Clamp to valid sRGB gamut using <code>clampChroma()</code></li>
                    <li>Convert back to hex color</li>
                </ol>
            </section>

            {/* Adaptive Chroma */}
            <section id="adaptive-chroma" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Adaptive chroma</h2>
                <p style={body}>
                    Adaptive chroma automatically reduces saturation at extreme lightness values to honor physical color limitations
                    and create more natural-looking palettes.
                </p>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Multiplier Rules</h3>
                <div style={{ background: 'var(--color-surface-variant)', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: 13, marginTop: 8 }}>
                    <div>Lightness &gt; 0.90 (steps 0, 50) → chroma × 0.3 <span style={{ color: 'var(--color-on-surface-variant)' }}> // Very light pastels</span></div>
                    <div>Lightness &gt; 0.80 (steps 100-200) → chroma × 0.6 <span style={{ color: 'var(--color-on-surface-variant)' }}> // Light containers</span></div>
                    <div>Lightness 0.65-0.77 (steps 300-400) → chroma × 1.1 <span style={{ color: 'var(--color-on-surface-variant)' }}> // Mid boost</span></div>
                    <div>Lightness &lt; 0.30 (steps 750-850) → chroma × 0.65 <span style={{ color: 'var(--color-on-surface-variant)' }}> // Dark surfaces</span></div>
                    <div>Lightness &lt; 0.20 (steps 900-1000) → chroma × 0.35 <span style={{ color: 'var(--color-on-surface-variant)' }}> // Very dark</span></div>
                </div>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Why This Matters</h3>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>Avoids impossible colors</b> – Prevents out-of-gamut errors</li>
                    <li><b>Natural appearance</b> – Pastels shouldn't be neon, darks shouldn't be muddy</li>
                    <li><b>Dark mode optimization</b> – Mid-tone boost (1.1×) improves visibility on dark backgrounds</li>
                    <li><b>Consistent perception</b> – All colors feel balanced across the scale</li>
                </ul>
            </section>

            {/* Contrast */}
            <section id="contrast" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Contrast modes</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>Default</b> – Text 4.5:1, UI 3:1, subtle surface states.</li>
                    <li><b>High-contrast</b> – Text 7:1, stronger states, more colorful containers (no grayscale).</li>
                    <li><b>Extra-high</b> – 7:1+ with maximum readability and controlled colorfulness.</li>
                </ul>
                <p style={{ ...body, marginTop: 8 }}>
                    In contrast modes we preserve colorfulness: containers and <code>surface-variant</code> are gently tinted
                    from the primary scale, while ensuring required WCAG ratios for on-colors.
                </p>
            </section>

            {/* Tokens */}
            <section id="tokens" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Design tokens</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    <div>
                        <h3 style={{ ...title, fontSize: 14, marginBottom: 6 }}>Accents</h3>
                        <ul style={{ ...body, paddingLeft: 18 }}>
                            <li>--color-primary, --color-secondary</li>
                            <li>--color-<i>role</i>-container</li>
                            <li>--color-<i>role</i>-hover / -pressed</li>
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ ...title, fontSize: 14, marginBottom: 6 }}>On-colors</h3>
                        <ul style={{ ...body, paddingLeft: 18 }}>
                            <li>--color-on-<i>role</i>, --color-on-<i>role</i>-container</li>
                            <li>Automaticky hledáme nejlepší kontrast (4.5:1 / 7:1)</li>
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ ...title, fontSize: 14, marginBottom: 6 }}>Surface & Outline</h3>
                        <ul style={{ ...body, paddingLeft: 18 }}>
                            <li>--color-surface, --color-surface-variant</li>
                            <li>--color-outline-subtle/default/strong</li>
                            <li>--color-surface-hover / -pressed</li>
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ ...title, fontSize: 14, marginBottom: 6 }}>Other</h3>
                        <ul style={{ ...body, paddingLeft: 18 }}>
                            <li>--color-disabled, --color-on-disabled</li>
                            <li>--color-focus (focus ring)</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Surface & Radius */}
            <section id="surface" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Surface & Radius & Outline</h2>
                <p style={body}>
                    Surfaces and radii are generated in <code>surfaceAndRadius.ts</code>. Cards use larger radii for a cleaner look
                    and no shadows (flat aesthetics). Hover/pressed states are subtle in default and stronger in contrast modes.
                </p>
            </section>

            {/* Advanced */}
            <section id="advanced" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Advanced settings</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li>Pure neutrals, Saturation multiplier, Temperature shift</li>
                    <li>Harmony mode (analogous/complementary/triadic)</li>
                    <li>Stay true to input color (map accent to nearest step)</li>
                </ul>
            </section>

            {/* Export */}
            <section id="export" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Exports</h2>
                <p style={body}>Multiple formats are supported for cross-platform compatibility:</p>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>CSS Variables</b> – Standard CSS custom properties with <code>:root</code> and <code>[data-theme="dark"]</code></li>
                    <li><b>Tailwind Config</b> – Choose between v3 (JavaScript) or v4 (CSS <code>@theme</code>)</li>
                    <li><b>SCSS Variables</b> – Sass/SCSS <code>$variable-name</code> format</li>
                    <li><b>JSON</b> – Complete token and scale data for programmatic use</li>
                    <li><b>Figma Tokens</b> – Compatible with Figma Tokens plugin</li>
                </ul>
                <h3 style={{ ...title, fontSize: 16, marginTop: 12 }}>Tailwind Version Selector</h3>
                <p style={body}>
                    The Tailwind export includes a version toggle:
                </p>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>v3</b>: JavaScript config (<code>tailwind.config.js</code>) with <code>theme.extend.colors</code></li>
                    <li><b>v4</b>: CSS-first approach with <code>@theme</code> directive (requires Tailwind 4.0+)</li>
                </ul>
            </section>

            {/* A11y */}
            <section id="a11y" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Accessibility</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li>WCAG contrast checks with correct relative luminance</li>
                    <li>Colorblind Simulation (deuteranopia, protanopia, tritanopia, grayscale)</li>
                    <li>Focus rings on all interactive elements</li>
                </ul>
            </section>

            {/* Files */}
            <section id="files" className="preview-card" style={{ ...section, marginBottom: 24 }}>
                <h2 style={{ ...title, fontSize: 18 }}>File structure</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><code>src/logic/colorModule.ts</code> – scale generation</li>
                    <li><code>src/logic/tokenMapper.ts</code> – token mapping</li>
                    <li><code>src/logic/contrastChecker.ts</code> – WCAG calculations</li>
                    <li><code>src/store/themeStore.ts</code> – state, modes, export</li>
                    <li><code>src/components</code> – UI and Live Preview</li>
                </ul>
            </section>

                        {/* Harmony tools */}
                        <div id="harmony" className="preview-card" style={{ marginBottom: 12 }}>
                            <h2 style={{ ...title, fontSize: 18, marginBottom: 12 }}>Color Harmony Generator</h2>
                            <p style={{ ...body, marginBottom: 10 }}>
                                Automatic color combinations based on color theory. Useful for secondary colors or accents.
                            </p>
                            <ColorHarmonyVisualizer showHeader={false} showNote={false} />
                            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--color-warning-container)', color: 'var(--color-on-warning-container)', border: '1px solid var(--color-outline-subtle)' }}>
                                <b>Note:</b> Don’t use harmony for semantic colors (error, warning, success). They should
                                keep conventional meanings for usability.
                            </div>
                          </div>
                            </div>
                            {/* Sticky TOC */}
                            <aside className="docs-toc">
                                <div className="preview-card">
                                    <h3 style={{ ...title, fontSize: 16, marginBottom: 10 }}>Contents</h3>
                                    <input
                                        className="docs-search"
                                        placeholder="Search sections..."
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && filtered[0]) { document.getElementById(filtered[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }}
                                        style={{ marginBottom: 10 }}
                                    />
                                    <nav>
                                        {(q ? filtered : sections).map(s => (
                                            <a key={s.id} href={`#${s.id}`} aria-current={activeId === s.id ? 'true' : undefined}>
                                                {s.label}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            </aside>
                        </div>
        </div>
    );
}
