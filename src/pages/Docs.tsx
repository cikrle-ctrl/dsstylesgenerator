import { useEffect, useMemo, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { getContrast } from '../logic/contrastChecker';

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
    marginBottom: 24
} as const;

export function Docs() {
    const sections = useMemo(() => ([
        { id: 'introduction', label: '1. Introduction' },
        { id: 'quick-start', label: '2. Quick Start' },
        { id: 'how-it-works', label: '3. How It Works' },
        { id: 'token-reference', label: '4. Token Reference' },
        { id: 'advanced', label: '5. Advanced Features' },
        { id: 'recipes', label: '6. Practical Recipes' },
        { id: 'forced-colors', label: '7. forced-colors Support' },
    ]), []);

    const [activeId, setActiveId] = useState<string>('introduction');
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

    const { tokens, ui } = useThemeStore();
    const tokenMap = ui.themeMode === 'light' ? tokens.light : tokens.dark;
    const contrastTargetText = ui.contrastMode === 'extra-high' ? 9.0 : ui.contrastMode === 'high-contrast' ? 7.0 : 4.5;
    const contrastTargetContainer = ui.contrastMode === 'extra-high' ? 7.0 : ui.contrastMode === 'high-contrast' ? 4.5 : 3.0;

    const audits = [
        { role: 'Primary', fg: '--color-on-primary', bg: '--color-primary', target: contrastTargetText },
        { role: 'Primary container', fg: '--color-on-primary-container', bg: '--color-primary-container', target: contrastTargetText },
        { role: 'Secondary', fg: '--color-on-secondary', bg: '--color-secondary', target: contrastTargetText },
        { role: 'Error', fg: '--color-on-error', bg: '--color-error', target: contrastTargetText },
        { role: 'Surface heading', fg: '--color-on-surface-heading', bg: '--color-surface', target: contrastTargetText },
        { role: 'Outline default', fg: '--color-outline-default', bg: '--color-surface', target: 3.0 },
        { role: 'Container vs surface', fg: '--color-primary-container', bg: '--color-surface', target: contrastTargetContainer },
    ].map(item => {
        const fgHex = tokenMap[item.fg];
        const bgHex = tokenMap[item.bg];
        const ratio = fgHex && bgHex ? getContrast(fgHex, bgHex) : 0;
        const pass = ratio >= item.target;
        return { ...item, fgHex, bgHex, ratio: Number(ratio.toFixed(2)), pass };
    });

    return (
        <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
            <style>{`
                .docs-grid{display:grid;grid-template-columns:1fr;gap:20px}
                @media(min-width:1100px){.docs-grid{grid-template-columns:minmax(0,1fr) 280px}}
                .docs-toc{position:sticky;top:16px;align-self:start;max-height:calc(100vh - 32px);overflow:auto}
                .docs-toc a{color:var(--color-on-surface-heading);text-decoration:none;display:block;padding:8px 12px;border-radius:6px;font-size:14px}
                .docs-toc a:hover{background:var(--color-surface-hover)}
                .docs-toc a[aria-current="true"]{background:var(--color-primary-container);color:var(--color-on-primary-container);font-weight:600}
                .docs-search{display:block;width:100%;box-sizing:border-box;height:36px;border:1px solid var(--color-outline-subtle);background:var(--color-surface);color:var(--color-on-surface-heading);border-radius:8px;padding:0 12px;margin-bottom:12px}
                .docs-search:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px var(--color-focus)}
                .code-block{background:var(--color-surface-variant);padding:16px;border-radius:8px;font-family:monospace;font-size:13px;overflow-x:auto;margin:12px 0;line-height:1.5}
                .info-box{padding:16px;border-radius:10px;margin:16px 0;border:1px solid var(--color-outline-subtle)}
                .info-box.primary{background:var(--color-primary-container);color:var(--color-on-primary-container);border-color:var(--color-primary)}
                .info-box.warning{background:var(--color-warning-container);color:var(--color-on-warning-container);border-color:var(--color-warning)}
                .info-box.error{background:var(--color-error-container);color:var(--color-on-error-container);border-color:var(--color-error)}
            `}</style>

            <h1 style={{ ...title, fontSize: 32, marginBottom: 8 }}>DS Styles Generator</h1>
            <p style={{ ...body, fontSize: 18, marginBottom: 32, maxWidth: 800 }}>
                Professional design token generator built on OKLCH color space, perceptual uniformity, and contrast-first accessibility.
            </p>

            <div className="docs-grid">
                <div>
                    {/* 1. INTRODUCTION */}
                    <section id="introduction" className="preview-card" style={section}>
                        <h2 style={{ ...title, fontSize: 26 }}>1. Introduction</h2>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 20 }}>The Problem We Solve</h3>
                        <p style={body}>
                            Traditional palette generators (like "darken by 10%" or simple HSL shifts) fail in two critical ways:
                        </p>
                        <ul style={{ ...body, paddingLeft: 22, marginTop: 8 }}>
                            <li><strong>Inconsistent perception:</strong> HSL/RGB lightness changes don't match human vision. A "10% darker blue" and "10% darker yellow" look completely different perceptually.</li>
                            <li><strong>Unreliable accessibility:</strong> Static color assignments can't guarantee WCAG contrast ratios across different modes and user preferences.</li>
                        </ul>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 20 }}>Our Approach: Three Pillars</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 14 }}>
                            <div className="info-box primary">
                                <h4 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16 }}>① Perceptual Uniformity (OKLCH)</h4>
                                <p style={{ ...body, margin: 0, fontSize: 14 }}>
                                    Generate colors in a space that matches human vision. Changing lightness doesn't affect perceived hue or saturation. Blue stays blue from light to dark.
                                </p>
                            </div>
                            <div className="info-box primary">
                                <h4 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16 }}>② Accessibility First (Contrast-Driven)</h4>
                                <p style={{ ...body, margin: 0, fontSize: 14 }}>
                                    Colors are dynamically selected to meet precise WCAG contrast ratios (4.5:1, 7:1, or 9:1). Not static picks—algorithmic guarantees.
                                </p>
                            </div>
                            <div className="info-box primary">
                                <h4 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16 }}>③ Semantic Scale (0-1000)</h4>
                                <p style={{ ...body, margin: 0, fontSize: 14 }}>
                                    Intuitive 21-step scale from white (0) to black (1000). Friendly to design systems and tools like Tailwind. Fine-grained control.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. QUICK START */}
                    <section id="quick-start" className="preview-card" style={section}>
                        <h2 style={{ ...title, fontSize: 26 }}>2. Quick Start</h2>

                        <ol style={{ ...body, paddingLeft: 22, marginTop: 12 }}>
                            <li style={{ marginBottom: 10 }}><strong>Step 1:</strong> Pick your primary color using the color picker in the left panel</li>
                            <li style={{ marginBottom: 10 }}><strong>Step 2:</strong> Choose a color harmony (complementary, analogous, triadic) or set secondary manually</li>
                            <li style={{ marginBottom: 10 }}><strong>Step 3:</strong> Explore 6 accessibility modes using the top toolbar: Light/Dark × Default/High/Extra-High</li>
                            <li style={{ marginBottom: 10 }}><strong>Step 4:</strong> Click "Export" → "Figma Variables" and copy the output</li>
                            <li style={{ marginBottom: 10 }}><strong>Step 5:</strong> Use semantic tokens in your CSS</li>
                        </ol>

                        <h3 style={{ ...title, fontSize: 17, marginTop: 20 }}>Basic Usage Example</h3>
                        <div className="code-block">
{`body {
  background-color: var(--color-background);
  color: var(--color-on-surface-variant);
}

.button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-outline-default);
  padding: 10px 20px;
  border-radius: 8px;
}

.button:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-on-primary-hover);
}

.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}`}
                        </div>
                    </section>

                    {/* 3. HOW IT WORKS */}
                    <section id="how-it-works" className="preview-card" style={section}>
                        <h2 style={{ ...title, fontSize: 26 }}>3. Core Logic: How It Works</h2>

                        {/* Part 1 */}
                        <h3 style={{ ...title, fontSize: 20, marginTop: 24, borderBottom: '2px solid var(--color-outline-subtle)', paddingBottom: 8 }}>
                            Part 1: Primitive Palette Generation (Scale 0-1000)
                        </h3>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 16 }}>OKLCH Explained</h4>
                        <p style={body}>
                            OKLCH (Oklab Lightness-Chroma-Hue) is a perceptually uniform color space. Unlike HSL, equal numeric changes produce equal visual changes.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 10 }}>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong style={{ color: 'var(--color-primary)' }}>L (Lightness)</strong>
                                <p style={{ ...body, margin: '6px 0 0', fontSize: 13 }}>0.0 = black, 1.0 = white. Perceptually linear.</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong style={{ color: 'var(--color-secondary)' }}>C (Chroma)</strong>
                                <p style={{ ...body, margin: '6px 0 0', fontSize: 13 }}>0 = gray, higher = more vivid. Range: 0-0.4.</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong style={{ color: 'var(--color-error)' }}>H (Hue)</strong>
                                <p style={{ ...body, margin: '6px 0 0', fontSize: 13 }}>0-360° color wheel. Constant across lightness.</p>
                            </div>
                        </div>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Hue Preservation (Why Blue Stays Blue)</h4>
                        <p style={body}>
                            In HSL, changing lightness often shifts perceived hue. OKLCH maintains hue constancy: a blue input (#0066FF)
                            remains perceptually blue from step 0 to 1000. No color drift.
                        </p>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>"Adaptive Chroma"</h4>
                        <p style={body}>
                            Not all OKLCH combinations are physically possible in sRGB. Colors near white (0-200) or black (800-1000) must reduce
                            chroma to avoid out-of-gamut errors. We apply a <strong>parabolic multiplier</strong>:
                        </p>
                        <div className="code-block">
{`Lightness > 0.92 (steps 0-50)   → chroma × 0.25  // Very light pastels
Lightness > 0.85 (steps 100-150) → chroma × 0.50  // Light containers
Lightness 0.55-0.70 (350-500)    → chroma × 1.15  // MID-TONE BOOST (dark mode optimization!)
Lightness 0.38-0.55 (550-600)    → chroma × 1.0   // Full chroma
Lightness < 0.20 (900-1000)      → chroma × 0.30  // Very dark backgrounds`}
                        </div>
                        <p style={{ ...body, marginTop: 10 }}>
                            The mid-tone boost (1.15×) at steps 350-500 improves color vibrancy in dark mode, where these steps become primary accents.
                        </p>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Neutral (Gray) Palette Generation</h4>
                        <ul style={{ ...body, paddingLeft: 20, marginTop: 8 }}>
                            <li><strong>Tinted Neutrals:</strong> Uses primary color's hue with very low chroma (~0.02) for subtle warmth</li>
                            <li><strong>Pure Neutrals:</strong> Achromatic gray (chroma = 0) for true neutral grayscale</li>
                        </ul>

                        {/* Part 2 */}
                        <h3 style={{ ...title, fontSize: 20, marginTop: 28, borderBottom: '2px solid var(--color-outline-subtle)', paddingBottom: 8 }}>
                            Part 2: Token Architecture (Primitive vs Semantic)
                        </h3>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 16 }}>Primitive Tokens (Building Blocks)</h4>
                        <p style={body}>
                            Raw scale values like <code>primary-0</code>, <code>primary-500</code>, <code>primary-1000</code>.
                            <strong> Never use these directly in your components!</strong> They're internal implementation details.
                        </p>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 16 }}>Semantic Tokens (Public API)</h4>
                        <p style={body}>
                            Role-based tokens like <code>--color-primary</code>, <code>--color-surface</code>, <code>--color-on-primary</code>.
                            These describe <em>purpose</em>, not value. This is your design system's public interface.
                        </p>

                        <div className="info-box warning">
                            <strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>⚠️ Why This Separation Matters</strong>
                            <ul style={{ ...body, paddingLeft: 20, margin: '8px 0 0', fontSize: 14 }}>
                                <li><strong>Maintainability:</strong> Change light/dark/contrast modes without touching component code</li>
                                <li><strong>Flexibility:</strong> Same token adapts to 6 accessibility modes automatically</li>
                                <li><strong>Clarity:</strong> Tokens communicate intent (<code>--color-primary</code>) not implementation (<code>primary-500</code>)</li>
                            </ul>
                        </div>

                        {/* Part 3 */}
                        <h3 style={{ ...title, fontSize: 20, marginTop: 28, borderBottom: '2px solid var(--color-outline-subtle)', paddingBottom: 8 }}>
                            Part 3: Dynamic Mapping (The Magic ✨)
                        </h3>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 16 }}>Six Accessibility Modes</h4>
                        <div className="code-block">
{`┌─────────────────────┬──────────┬──────────────┬──────────────────┐
│ Mode                │ Theme    │ Text Target  │ Container Target │
├─────────────────────┼──────────┼──────────────┼──────────────────┤
│ Default             │ Light    │ 4.5:1 (AA)   │ 3.0:1            │
│ High Contrast       │ Light    │ 7.0:1 (AAA)  │ 4.5:1            │
│ Extra-High Contrast │ Light    │ 9.0:1        │ 7.0:1            │
│ Default             │ Dark     │ 4.5:1 (AA)   │ 3.0:1            │
│ High Contrast       │ Dark     │ 7.0:1 (AAA)  │ 4.5:1            │
│ Extra-High Contrast │ Dark     │ 9.0:1        │ 7.0:1            │
└─────────────────────┴──────────┴──────────────┴──────────────────┘`}
                        </div>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Static Anchors (The Canvas)</h4>
                        <p style={body}>
                            Before dynamic mapping, we establish fixed "anchor" colors that define the canvas:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
                            <div>
                                <strong>Light Mode</strong>
                                <div className="code-block" style={{ marginTop: 8 }}>
{`--background:      neutral-50
--surface:         neutral-0
--surface-variant: neutral-100
--surface-hover:   neutral-50
--surface-pressed: neutral-100`}
                                </div>
                            </div>
                            <div>
                                <strong>Dark Mode</strong>
                                <div className="code-block" style={{ marginTop: 8 }}>
{`--background:      neutral-1000
--surface:         neutral-950
--surface-variant: neutral-900
--surface-hover:   neutral-900
--surface-pressed: neutral-850`}
                                </div>
                            </div>
                        </div>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Algorithm 1: FindOptimalShade (Accents & Text)</h4>
                        <p style={body}>
                            <code>--color-primary</code> isn't hardcoded to <code>primary-500</code>. Instead, we iterate the <strong>entire scale</strong>
                            (0-1000) and measure WCAG contrast against <code>--color-surface</code>. The <strong>first step that meets or exceeds</strong>
                            the target contrast is selected.
                        </p>
                        <div className="code-block">
{`// Pseudocode
function findOptimalShade(scale, background, targetContrast, searchRange) {
  for (step in searchRange) {
    if (getContrast(scale[step], background) >= targetContrast) {
      return step; // First match wins
    }
  }
  return highestContrastStep; // Fallback if none meet target
}

// Light mode: search range [400-700]
// Dark mode: search range [300-600]`}
                        </div>
                        <div className="info-box primary">
                            <strong>Why restricted ranges?</strong> To prevent extreme picks. In light mode, we don't want <code>primary-1000</code>
                            (pure black) even if it technically meets 4.5:1. Ranges ensure aesthetic balance.
                        </div>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Algorithm 2: FindOptimalContainer (Containers)</h4>
                        <p style={body}>
                            <code>--color-primary-container</code> uses the <strong>same algorithm</strong> but with:
                        </p>
                        <ul style={{ ...body, paddingLeft: 20, marginTop: 8 }}>
                            <li><strong>Lower contrast target:</strong> 3.0:1 (Default), 4.5:1 (High), 7.0:1 (Extra-High)</li>
                            <li><strong>Different ranges:</strong> Light mode [100-300], Dark mode [700-900]</li>
                        </ul>
                        <p style={{ ...body, marginTop: 10 }}>
                            Result: Subtle, visually distinct backgrounds for chips, badges, alerts.
                        </p>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Algorithm 3: GetOnColor (Text on Colored Backgrounds)</h4>
                        <p style={body}>
                            <code>--color-on-primary</code> must be readable on <code>--color-primary</code>. We compare:
                        </p>
                        <div className="code-block">
{`function getOnColor(background) {
  const contrastWhite = getContrast(background, neutral['0']);    // White
  const contrastBlack = getContrast(background, neutral['1000']); // Black
  
  return contrastWhite > contrastBlack ? neutral['0'] : neutral['1000'];
}

// Result: ALWAYS pure white OR pure black (never scale values!)`}
                        </div>

                        <h4 style={{ ...title, fontSize: 17, marginTop: 18 }}>Algorithm 4: GetOnContainerColor</h4>
                        <p style={body}>
                            <code>--color-on-primary-container</code> prefers <strong>scale values</strong> for visual richness instead of pure black/white:
                        </p>
                        <div className="code-block">
{`// Light mode candidate order (prefers dark scale values first):
[primary-900, primary-1000, primary-800, primary-700, ..., neutral-1000, neutral-0]

// Dark mode candidate order (prefers light scale values first):
[primary-100, primary-0, primary-200, primary-300, ..., neutral-0, neutral-1000]

// Pick first candidate that meets targetContrast`}
                        </div>
                        <p style={{ ...body, marginTop: 10 }}>
                            Why? Visual hierarchy. Container text using <code>primary-900</code> feels more "branded" than generic black.
                        </p>

                        {/* Live Audit */}
                        <h3 style={{ ...title, fontSize: 19, marginTop: 28 }}>Live Contrast Audit</h3>
                        <p style={{ ...body, marginBottom: 14 }}>
                            Real-time WCAG validation for current mode (<strong>{ui.themeMode}</strong>) and contrast
                            (<strong>{ui.contrastMode}</strong>):
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                            {audits.map(a => (
                                <div key={a.role} style={{ border: '1px solid var(--color-outline-subtle)', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-surface-variant)' }}>
                                        <span style={{ color: 'var(--color-on-surface-heading)', fontWeight: 600, fontSize: 14 }}>{a.role}</span>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: 999,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            letterSpacing: '0.5px',
                                            color: a.pass ? 'var(--color-on-success-container)' : 'var(--color-on-error-container)',
                                            background: a.pass ? 'var(--color-success-container)' : 'var(--color-error-container)'
                                        }}>{a.pass ? 'PASS' : 'FAIL'}</span>
                                    </div>
                                    <div style={{ padding: '12px 14px' }}>
                                        <div style={{ fontSize: 11, color: 'var(--color-on-surface-subtle)', marginBottom: 6 }}>Contrast Ratio</div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-on-surface-heading)' }}>{a.ratio}:1</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>Target: ≥{a.target}:1</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. TOKEN REFERENCE */}
                    <section id="token-reference" className="preview-card" style={section}>
                        <h2 style={{ ...title, fontSize: 26 }}>4. Token Reference</h2>
                        <p style={body}>
                            Complete dictionary of all semantic tokens generated by the system.
                        </p>

                        <h3 style={{ ...title, fontSize: 18, marginTop: 20 }}>A. Surfaces (Backgrounds & Layers)</h3>
                        <div className="code-block">
{`--color-background          // Outer page background ("behind" cards)
                            // Light: neutral-50, Dark: neutral-1000

--color-surface              // Default component background (cards, modals, dialogs)
                            // Light: neutral-0, Dark: neutral-950

--color-surface-variant      // Differentiated sections (darker on light, lighter on dark)
                            // Light: neutral-100, Dark: neutral-900

--color-surface-hover        // Surface hover state
                            // Light: neutral-50, Dark: neutral-900

--color-surface-pressed      // Surface pressed/active state
                            // Light: neutral-100, Dark: neutral-850`}
                        </div>

                        <h3 style={{ ...title, fontSize: 18, marginTop: 20 }}>B. On-Surface Content (Text on Backgrounds)</h3>
                        <div className="code-block">
{`--color-on-surface-heading   // Highest emphasis text (headings, titles)
                            // Light: neutral-950, Dark: neutral-50

--color-on-surface-variant   // Body text, standard content
                            // Light: neutral-800, Dark: neutral-100

--color-on-surface-subtle    // Placeholders, captions, secondary text
                            // Light/Dark: neutral-500 (same for both!)`}
                        </div>

                        <h3 style={{ ...title, fontSize: 18, marginTop: 20 }}>C. Outlines (Borders & Dividers)</h3>
                        <div className="code-block">
{`--color-outline-subtle       // Subtle dividers, card borders (~2:1 contrast)
--color-outline-default      // Default input borders, separators (~3:1)
--color-outline-hover        // Hover state for borders (~3.5:1)
--color-outline-pressed      // Pressed/active state (~4:1)
--color-outline-strong       // Strong emphasis borders (~4.5:1)

// All dynamically calculated via FindBestContrast against --color-surface`}
                        </div>

                        <h3 style={{ ...title, fontSize: 18, marginTop: 20 }}>D. States (Disabled)</h3>
                        <div className="code-block">
{`--color-disabled             // Disabled element background
                            // Light: neutral-100, Dark: neutral-850

--color-on-disabled          // Text on disabled elements (low contrast intentional)
                            // Light: neutral-400, Dark: neutral-600`}
                        </div>

                        <h3 style={{ ...title, fontSize: 18, marginTop: 20 }}>E. Accents (Primary, Secondary, Error, Warning, Success, Info)</h3>
                        <p style={{ ...body, marginTop: 10 }}>
                            Each accent color follows this pattern (example with <code>primary</code>):
                        </p>
                        <div className="code-block">
{`--color-primary                      // Base accent (dynamic 4.5/7/9:1)
--color-on-primary                   // Text on primary (white or black)
--color-primary-container            // Subtle container (3/4.5/7:1)
--color-on-primary-container         // Text on container (prefers scale values)

// Interactive states
--color-primary-hover                // Hover state (±50 step offset)
--color-on-primary-hover
--color-primary-pressed              // Pressed state (±100 step offset)
--color-on-primary-pressed
--color-primary-container-hover
--color-on-primary-container-hover
--color-primary-container-pressed
--color-on-primary-container-pressed`}
                        </div>
                        <p style={{ ...body, marginTop: 10 }}>
                            This exact structure repeats for: <code>secondary</code>, <code>error</code>, <code>warning</code>,
                            <code>success</code>, <code>info</code>.
                        </p>

                        <h3 style={{ ...title, fontSize: 18, marginTop: 20 }}>F. Special Tokens</h3>
                        <div className="code-block">
{`--color-focus                // Focus ring (derived from Primary color, not Info!)
                            // Uses FindOptimalShade with accent contrast target

--color-shadow               // Drop shadow color
                            // Light/Dark: neutral-1000 (always black for shadows)

--color-backdrop             // Modal/dialog backdrop overlay
                            // Opacity varies by contrast mode (0.4 / 0.6 / 0.75)`}
                        </div>
                    </section>

                    {/* 5. ADVANCED FEATURES */}
                    <section id="advanced" className="preview-card" style={section}>
                        <h2 style={{ ...title, fontSize: 26 }}>5. Advanced Features (Pro Mode)</h2>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 20 }}>"Stay True to Input Color"</h3>
                        <p style={body}>
                            <strong>What it does:</strong> Forces the algorithm to include your exact input hex value somewhere
                            in the generated scale, bypassing dynamic contrast-based selection.
                        </p>
                        <p style={body}>
                            <strong>When to use:</strong> Strict branding requirements where the precise corporate color must appear
                            (e.g., Coca-Cola red #F40009 must be exact).
                        </p>
                        <div className="info-box error">
                            <strong style={{ display: 'block', marginBottom: 6 }}>⚠️ Warning: Accessibility Trade-off</strong>
                            <p style={{ ...body, margin: 0, fontSize: 14 }}>
                                Enabling this <strong>may sacrifice guaranteed contrast compliance</strong>. The input color might not meet
                                4.5:1 or 7:1 targets. Use only when brand identity outweighs accessibility guarantees, and manually verify
                                contrasts in the audit section.
                            </p>
                        </div>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>Manual Tone Overrides (Pro Mode)</h3>
                        <p style={body}>
                            Pro Mode UI lets you manually "pin" specific scale steps to semantic tokens, completely overriding
                            FindOptimalShade and FindOptimalContainer algorithms:
                        </p>
                        <div className="code-block">
{`Primary Light:  400   // Forces --color-primary to use primary-400 in light mode
Primary Dark:   600   // Forces --color-primary to use primary-600 in dark mode

Container Light: 200  // Forces --color-primary-container to primary-200
Container Dark:  800  // Forces --color-primary-container to primary-800`}
                        </div>
                        <p style={body}>
                            Select <strong>"Auto"</strong> in dropdowns to restore algorithmic selection. Useful for design iteration
                            and fine-tuning specific tokens without changing the entire system.
                        </p>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>Export: Figma Variables (W3C Design Tokens)</h3>
                        <p style={body}>
                            The export generates a JSON file compatible with W3C Design Tokens specification and Figma Variables import:
                        </p>
                        <div className="code-block">
{`{
  "scales": {
    "primary": { "0": "#ffffff", "50": "#f0f4ff", ... },
    "neutral": { ... }
  },
  "light": {
    "color-primary": { "value": "{scales.primary.500}" },
    "color-surface": { "value": "{scales.neutral.0}" },
    ...
  },
  "dark": { ... },
  "surface": { ... }
}`}
                        </div>
                        <ul style={{ ...body, paddingLeft: 20, marginTop: 10 }}>
                            <li>Aliases use <code>{`{scales.colorName.step}`}</code> syntax</li>
                            <li>Separate collections for light/dark modes</li>
                            <li>Import directly into Figma → Local Variables</li>
                        </ul>
                    </section>

                    {/* 6. PRACTICAL RECIPES */}
                    <section id="recipes" className="preview-card" style={section}>
                        <h2 style={{ ...title, fontSize: 26 }}>6. Practical Recipes</h2>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 20 }}>Applying Themes with Data Attributes</h3>
                        <p style={body}>
                            Set <code>data-theme</code> and <code>data-contrast</code> attributes on your root HTML element
                            to activate different modes:
                        </p>
                        <div className="code-block">
{`<!-- Light mode, default contrast -->
<html data-theme="light" data-contrast="default">

<!-- Dark mode, high contrast -->
<html data-theme="dark" data-contrast="high-contrast">

<!-- Dark mode, extra-high contrast -->
<html data-theme="dark" data-contrast="extra-high">`}
                        </div>
                        <p style={body}>
                            CSS variables automatically switch values. No JavaScript required for theming!
                        </p>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>Recipe: Button Component</h3>
                        <div className="code-block">
{`.button {
  /* Base styles */
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-outline-default);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-on-primary-hover);
  border-color: var(--color-outline-hover);
}

.button:active {
  background-color: var(--color-primary-pressed);
  color: var(--color-on-primary-pressed);
  transform: scale(0.98);
}

.button:disabled {
  background-color: var(--color-disabled);
  color: var(--color-on-disabled);
  border-color: var(--color-outline-subtle);
  cursor: not-allowed;
  opacity: 0.6;
}

.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* Secondary variant */
.button--secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}
.button--secondary:hover {
  background-color: var(--color-secondary-hover);
  color: var(--color-on-secondary-hover);
}

/* Container variant (subtle) */
.button--container {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}
.button--container:hover {
  background-color: var(--color-primary-container-hover);
  color: var(--color-on-primary-container-hover);
}`}
                        </div>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>Recipe: Card Component</h3>
                        <div className="code-block">
{`.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline-subtle);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.card:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-outline-default);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.card__title {
  color: var(--color-on-surface-heading);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
}

.card__body {
  color: var(--color-on-surface-variant);
  line-height: 1.6;
  margin: 0;
}

.card__caption {
  color: var(--color-on-surface-subtle);
  font-size: 13px;
  margin-top: 12px;
}`}
                        </div>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>Recipe: Input Field</h3>
                        <div className="code-block">
{`.input {
  background-color: var(--color-surface-variant);
  color: var(--color-on-surface-heading);
  border: 1px solid var(--color-outline-default);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: var(--color-on-surface-subtle);
}

.input:hover:not(:disabled) {
  border-color: var(--color-outline-hover);
  background-color: var(--color-surface);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus);
  background-color: var(--color-surface);
}

.input:disabled {
  background-color: var(--color-disabled);
  color: var(--color-on-disabled);
  border-color: var(--color-outline-subtle);
  cursor: not-allowed;
}

.input--error {
  border-color: var(--color-error);
}
.input--error:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 20%, transparent);
}`}
                        </div>
                    </section>

                    {/* 7. FORCED-COLORS */}
                    <section id="forced-colors" className="preview-card" style={{ marginBottom: 24 }}>
                        <h2 style={{ ...title, fontSize: 26 }}>7. High Contrast: extra-high vs forced-colors</h2>

                        <div className="info-box warning">
                            <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16 }}>⚠️ Critical Distinction</h3>
                            <ul style={{ ...body, paddingLeft: 20, margin: 0, fontSize: 14 }}>
                                <li><strong>extra-high mode:</strong> Our custom-generated high-contrast theme (9:1 text, 7:1 containers)</li>
                                <li><strong>forced-colors:</strong> OS-level override (Windows High Contrast Mode, browser forced colors)</li>
                            </ul>
                            <p style={{ ...body, marginTop: 10, marginBottom: 0, fontSize: 14 }}>
                                These are <strong>not the same</strong>. extra-high is our palette; forced-colors replaces all colors with system palette.
                            </p>
                        </div>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>What is forced-colors Mode?</h3>
                        <p style={body}>
                            An OS-level accessibility feature (Windows High Contrast Mode, browser settings) that <strong>ignores all
                            author-defined colors</strong> and forces a system-defined palette—typically black, white, yellow, and 1-2 accent colors.
                        </p>
                        <p style={body}>
                            Activated by users who need <em>maximum</em> contrast or have specific visual impairments (e.g., cataracts, photophobia).
                        </p>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>How to Support forced-colors</h3>
                        <p style={body}>
                            Use the <code>@media (forced-colors: active)</code> CSS query and replace custom colors with
                            <strong> system color keywords</strong>:
                        </p>
                        <div className="code-block">
{`@media (forced-colors: active) {
  .button {
    background-color: ButtonFace;
    color: ButtonText;
    border: 1px solid ButtonBorder;
  }

  .card {
    background-color: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
  }

  a {
    color: LinkText;
  }

  .input {
    background-color: Field;
    color: FieldText;
    border: 1px solid FieldText;
  }

  /* Critical: Focus rings */
  .button:focus-visible,
  .input:focus {
    /* Transparent outlines are auto-colored by OS! */
    outline: 3px solid transparent;
    outline-offset: 2px;
  }
}`}
                        </div>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>System Color Keywords</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 12 }}>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>Canvas</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Page background</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>CanvasText</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Text on Canvas</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>LinkText</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Hyperlinks</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>ButtonFace</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Button background</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>ButtonText</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Text on buttons</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>ButtonBorder</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Button borders</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>Field</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Input background</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>FieldText</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Text in inputs</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--color-surface-variant)', borderRadius: 8 }}>
                                <strong>GrayText</strong>
                                <p style={{ ...body, margin: '4px 0 0', fontSize: 13 }}>Disabled text</p>
                            </div>
                        </div>

                        <div className="info-box primary" style={{ marginTop: 20 }}>
                            <h4 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 15 }}>💡 Pro Tip: Transparent Outlines</h4>
                            <p style={{ ...body, margin: 0, fontSize: 14 }}>
                                Using <code>outline-color: transparent</code> is a clever trick: in forced-colors mode, the OS
                                <strong> automatically replaces transparent with a visible color</strong>, ensuring focus rings
                                remain visible for keyboard navigation. In normal mode, you control the color via <code>var(--color-focus)</code>.
                            </p>
                        </div>

                        <h3 style={{ ...title, fontSize: 19, marginTop: 24 }}>Why This Matters</h3>
                        <ul style={{ ...body, paddingLeft: 20 }}>
                            <li>Our extra-high mode gives you control over specific contrast ratios (9:1 text)</li>
                            <li>forced-colors is user-controlled and unpredictable—you don't choose the colors</li>
                            <li>Supporting both ensures maximum accessibility: designer control + user override capability</li>
                        </ul>
                    </section>
                </div>

                {/* Sticky TOC */}
                <aside className="docs-toc">
                    <div className="preview-card">
                        <h3 style={{ ...title, fontSize: 15, marginBottom: 12 }}>Contents</h3>
                        <input
                            className="docs-search"
                            placeholder="Search..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && filtered[0]) {
                                    document.getElementById(filtered[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
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
