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
        { id: 'how', label: 'Jak aplikace funguje' },
        { id: 'scales', label: 'Barevné škály' },
        { id: 'contrast', label: 'Kontrastní módy' },
        { id: 'tokens', label: 'Design tokens' },
        { id: 'surface', label: 'Surface & Radius & Outline' },
        { id: 'advanced', label: 'Pokročilá nastavení' },
        { id: 'export', label: 'Exporty' },
        { id: 'a11y', label: 'Přístupnost' },
        { id: 'files', label: 'Struktura souborů' },
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
            
            <h1 style={{ ...title, fontSize: 24 }}>Dokumentace</h1>
            <p style={{ ...body, marginBottom: 20 }}>
                Kompletní průvodce tím, jak náš theme builder funguje: generování škál, mapování do tokenů,
                kontrastní režimy, přizpůsobení, exporty a nástroje pro ověření přístupnosti.
            </p>
            <div className="docs-grid">
              <div>
            {/* How it works */}
            <section id="how" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Jak aplikace funguje</h2>
                <ol style={{ ...body, paddingLeft: 18 }}>
                    <li>
                        <b>Vstupy</b> – Zvolíte primární/sekundární barvu a strategie povrchů. Vstupy spravuje Zustand store
                        (<code>src/store/themeStore.ts</code>).
                    </li>
                    <li>
                        <b>Generování škál</b> – Z <code>colorModule.ts</code> vznikne škála 0→1000 (po 50) v OKLCH.
                        Používáme perceptuální <i>lightness</i> křivku a <i>adaptive chroma</i> pro přirozené výsledky.
                    </li>
                    <li>
                        <b>Mapování do tokenů</b> – Funkce <code>generateMappedTokens()</code> v
                        <code> tokenMapper.ts</code> vytvoří semantic tokens pro light/dark a kontrastní režimy.
                    </li>
                    <li>
                        <b>Live Preview</b> – Komponenty čtou CSS custom properties a zobrazují výsledné styly. Přepínače
                        režimů mění <code>data-theme</code> a <code>data-contrast</code> na kontejneru.
                    </li>
                </ol>
            </section>

            {/* Scales */}
            <section id="scales" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Barevné škály a generování</h2>
                <p style={body}>
                    Škály generujeme v OKLCH: pro každý krok je definovaná cílová světlost. Chroma se adaptivně snižuje
                    na extrémech (velmi světlé/tmavé) a mírně zvyšuje v mid-tone pásmu pro dark mode akcenty. Neutrál je
                    tónovaná šedá odvozená z primární barvy (nebo čistá šedá, pokud je aktivována volba Pure neutrals).
                </p>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>Stay true to input</b> – akcent se mapuje na nejbližší krok ve škále (300–600).</li>
                    <li><b>Harmony</b> – volitelné generování analogous/complementary/triadic doplňkových barev.</li>
                    <li><b>WCAG validace</b> – testujeme kontrast textu vůči pozadí pomocí správné relativní luminance.</li>
                </ul>
            </section>

            {/* Contrast */}
            <section id="contrast" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Kontrastní módy</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><b>Default</b> – Text 4.5:1, UI 3:1, jemné surface stavy.</li>
                    <li><b>High-contrast</b> – Text 7:1, výraznější stavy, barevnější containers (žádná černobílá plocha).</li>
                    <li><b>Extra-high</b> – 7:1+ s nejvyšší čitelností a kontrolovanou barevností.</li>
                </ul>
                <p style={{ ...body, marginTop: 8 }}>
                    V kontrastních módech udržujeme barevnost: containers a <code>surface-variant</code> lehce tintujeme
                    z primární škály, zároveň zajišťujeme požadované WCAG poměry pro on-colors.
                </p>
            </section>

            {/* Tokens */}
            <section id="tokens" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Design tokens</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    <div>
                        <h3 style={{ ...title, fontSize: 14, marginBottom: 6 }}>Akcenty</h3>
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
                        <h3 style={{ ...title, fontSize: 14, marginBottom: 6 }}>Další</h3>
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
                    Povrchy a rádiusy generujeme ve <code>surfaceAndRadius.ts</code>. Karty mají větší poloměr pro čistší
                    vzhled a žádné stíny (flat estetika). Stavy hover/pressed jsou jemné v default a výraznější v
                    kontrastních módech.
                </p>
            </section>

            {/* Advanced */}
            <section id="advanced" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Pokročilá nastavení</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li>Pure neutrals, Saturation multiplier, Temperature shift</li>
                    <li>Harmony mode (analogous/complementary/triadic)</li>
                    <li>Stay true to input color (mapování akcentu na nejbližší krok)</li>
                </ul>
            </section>

            {/* Export */}
            <section id="export" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Exporty</h2>
                <p style={body}>Generujeme více formátů: CSS, SCSS, Tailwind, JSON a Figma JSON.</p>
            </section>

            {/* A11y */}
            <section id="a11y" className="preview-card" style={section}>
                <h2 style={{ ...title, fontSize: 18 }}>Přístupnost</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li>WCAG kontrastní výpočty s korektní relativní luminancí</li>
                    <li>Colorblind Simulation (deuteranopia, protanopia, tritanopia, grayscale)</li>
                    <li>Focus ring na všech interaktivních prvcích</li>
                </ul>
            </section>

            {/* Files */}
            <section id="files" className="preview-card" style={{ ...section, marginBottom: 24 }}>
                <h2 style={{ ...title, fontSize: 18 }}>Struktura souborů</h2>
                <ul style={{ ...body, paddingLeft: 18 }}>
                    <li><code>src/logic/colorModule.ts</code> – generování škál</li>
                    <li><code>src/logic/tokenMapper.ts</code> – mapování na tokens</li>
                    <li><code>src/logic/contrastChecker.ts</code> – WCAG výpočty</li>
                    <li><code>src/store/themeStore.ts</code> – stav, režimy, export</li>
                    <li><code>src/components</code> – UI a Live Preview</li>
                </ul>
            </section>

                        {/* Harmony tools */}
                        <div id="harmony" className="preview-card" style={{ marginBottom: 12 }}>
                            <h2 style={{ ...title, fontSize: 18, marginBottom: 12 }}>Color Harmony Generator</h2>
                            <p style={{ ...body, marginBottom: 10 }}>
                                Automatické kombinace barev založené na teorii barev. Vhodné pro sekundární barvy nebo akcenty.
                            </p>
                            <ColorHarmonyVisualizer showHeader={false} showNote={false} />
                            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--color-warning-container)', color: 'var(--color-on-warning-container)', border: '1px solid var(--color-outline-subtle)' }}>
                                <b>Poznámka:</b> Harmonii nepoužívejte pro sémantické barvy (error, warning, success). Ty by měly
                                zachovávat konvenční významy kvůli použitelnosti.
                            </div>
                          </div>
                            </div>
                            {/* Sticky TOC */}
                            <aside className="docs-toc">
                                <div className="preview-card">
                                    <h3 style={{ ...title, fontSize: 16, marginBottom: 10 }}>Obsah</h3>
                                    <input
                                        className="docs-search"
                                        placeholder="Hledat v sekcích..."
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
