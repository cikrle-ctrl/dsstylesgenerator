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
        { id: 'scales', label: 'Color scales' },
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

            {/* Scales */}
            <section id="scales" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Color scales and generation</h2>
                <p style={body}>
                    Scales are generated in OKLCH: each step targets a specific lightness. Chroma adaptively reduces
                    at extremes (very light/dark) and slightly increases in mid-tones for dark mode accents. Neutral is
                    a tinted gray derived from the primary color (or pure gray when Pure neutrals is enabled).
                </p>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>Stay true to input</b> – accent maps to the nearest scale step (300–600).</li>
                    <li><b>Harmony</b> – optional analogous/complementary/triadic complementary colors.</li>
                    <li><b>WCAG validation</b> – contrast is tested using proper relative luminance.</li>
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
                <p style={body}>Multiple formats are supported: CSS, SCSS, Tailwind, JSON and Figma JSON.</p>
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
