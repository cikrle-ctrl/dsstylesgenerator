# DS Styles Generator

Vizuální theme builder, který generuje kompletní design tokens a barevné škály (0→1000), podporuje Light/Dark režimy, tři úrovně kontrastu, a export do více formátů. Postaveno na React + TypeScript + Vite a OKLCH/HCT principech.

## Co umí

- 0–1000 barevná škála po 50 krocích (perceptuální rozestupy)
- Semantic tokens pro Primary, Secondary, Error, Warning, Success, Info + Neutral
- Light/Dark módy a kontrasty: default / high-contrast / extra-high
- Adaptive chroma (vyšší sytost ve středních tónech, redukce na extrémech)
- Tokeny pro surface/outline/focus/disabled + hover/pressed varianty
- Color harmonies (analogous, complementary, triadic)
- Colorblind simulace (4 typy)
- Export: CSS, SCSS, Tailwind, JSON, Figma (JSON)

## Jak to funguje (zkráceně)

- Generování škál: `src/logic/colorModule.ts`
  - OKLCH lightness křivka (perceptuální), adaptive chroma podle světlosti
  - Neutrál: tónovaná šedá z primární barvy nebo čistá šedá (volitelně)
- Mapování na tokeny: `src/logic/tokenMapper.ts`
  - Vytvoří semantic tokens pro oba módy a všechny kontrasty
  - On-colors jsou vybírány funkcí `findBestContrast` (WCAG 2.1)
  - Kontrastní módy zachovávají barevnost (barevnější containers a surface-variant)
- Stavový systém: `src/store/themeStore.ts` (Zustand)
  - Ukládá vstupy (barvy, surface strategie), škály, vygenerované tokeny a UI režimy

## Kontrastní módy

- Default: text 4.5:1, UI 3:1, jemné surface stavy
- High-contrast: text 7:1, výraznější surface, barevné containers (ne černobíle)
- Extra-high: text 7:1+, nejvyšší čitelnost a výraznost stavů

## Tokeny (výběr)

- Barvy: `--color-primary`, `--color-secondary`, `--color-error`, ...
- On-colors: `--color-on-primary`, `--color-on-primary-container`, ...
- Surface: `--color-surface`, `--color-surface-variant`, `--color-surface-hover/pressed`
- Outline: `--color-outline-subtle/default/strong/hover/pressed`
- Disabled: `--color-disabled`, `--color-on-disabled`
- Focus ring: `--color-focus`

## UI a komponenty

- Vlastní komponenty: Select, Slider, Checkbox, ColorInput, ColorPicker, Tabs, atd.
- Live Preview: ukázky tlačítek, karet, text fieldu, tabs, alertů, badge, progress…
- Colorblind Simulation: vizuální srovnání originální vs. filtrované barvy

## Použití

Vývojový server spustíte a otevřete v prohlížeči. Exporty najdete v sekci Export/Accordion přímo v UI.

## Responsivní chování

- Karty a layout mají adaptivní paddingy, řádky se skládají na sloupce pod 768 px
- Select a vstupy používají šířku 100% v kontejnerech
- Komponenty s pevnou šířkou (např. text field) se omezují na `min(100%, …px)`

## Struktura projektu (zkráceně)

- `src/components` – UI a demo komponenty (LivePreview, Palette/Scale Preview, …)
- `src/logic` – generování škál, tokenů, kontrast, HCT/OKLCH
- `src/store` – Zustand store pro vstupy, škály, tokeny a UI režimy

## Skripty

Dev: `npm run dev`  •  Build: `npm run build`  •  Lint: `npm run lint`

## Další dokumentace

- Material HCT integrace: `MATERIAL_HCT_INTEGRATION.md`
- Detailní rozpis zlepšení: `IMPROVEMENTS.md`

---

Tipy: Pokud chcete upravit přísnost kontrastu nebo saturaci v kontrastních módech, podívejte se do `tokenMapper.ts` a `colorModule.ts` (komentáře u příslušných větví).
