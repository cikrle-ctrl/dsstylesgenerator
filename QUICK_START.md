# 🚀 Quick Start Guide

**5-minutový průvodce pro DS Styles Generator**

## 1️⃣ Nastav základní barvy (30 sekund)

```
Levý panel → Color Inputs
├─ Primary: Tvoje hlavní brand barva
└─ Secondary: Doplňková barva
```

**Tip**: Ostatní barvy (Error, Warning, Success, Info) se automaticky vygenerují.

**Bonus**: Použij **Randomize** tlačítko pro inspiraci! 🎲

---

## 2️⃣ Zvol režimy (10 sekund)

```
Horní toolbar → Režimy
├─ Theme:    [Light] nebo [Dark]
└─ Contrast: [Default] nebo [High Contrast]
```

### Možné kombinace:

| Theme | Contrast | Použití |
|-------|----------|---------|
| Light | Default | Standardní světlý režim |
| Light | High Contrast | Pro slabozraké (7:1+ kontrast) |
| Dark | Default | Standardní tmavý režim |
| Dark | High Contrast | Tmavý s max kontrastem |

**Live Preview** ukazuje všechny komponenty v aktuální kombinaci! 👁️

---

## 3️⃣ (Volitelné) Pokročilé nastavení (1-2 minuty)

```
Levý panel → Advanced Controls (klikni pro rozbalení)
```

### Dostupné kontroly:

#### 🎨 Pure Neutrals
☑️ Zapni pro čistou šedou bez barevného tónu  
(Default: tinted neutrals s jemným nádechem primary)

#### 🎚️ Saturation (0.5× - 1.5×)
Globální multiplikátor sytosti všech barev
- `0.5×` = Tlumené, minimalistické
- `1.0×` = Původní (default)
- `1.5×` = Živé, výrazné

#### 🌡️ Temperature (-15° až +15°)
Posun hue pro teplejší/chladnější tóny
- Záporné = Chladnější (→ modrá)
- Kladné = Teplejší (→ červená)

#### 🎨 Harmony Mode
Auto-generování secondary barvy:
- **None** - Manual input
- **Analogous** - Sousední barvy (+30° hue) - harmonické
- **Complementary** - Opačné barvy (+180°) - kontrastní
- **Triadic** - 3 barvy (+120° intervaly) - vyvážené

---

## 4️⃣ Prozkoumej vizualizace (1 minuta)

### Scroll dolů pro:

#### 📊 Color Scales
Všech 21 kroků (0-1000) pro každou barvu  
Včetně hex hodnot a WCAG contrast badgů (AAA/AA/FAIL)

#### 🎨 Color Harmony
Vizuální náhled harmonického schématu  
(Pokud je zapnutý Harmony Mode)

#### 👁️ Colorblind Simulation
Before/After pro všechny sémantické barvy  
Typy: Deuteranopia, Protanopia, Tritanopia, Grayscale

#### 📏 Tonal Palette
Material Design 3 HCT systém (0-100 tóny)

#### 🎯 Complete Tokens Preview
Všechny 100+ tokenů s jejich hodnotami a kontrasty

---

## 5️⃣ Exportuj tokeny (30 sekund)

```
Dolní panel → Export Options
```

### Dostupné formáty:

| Formát | Použití | Výstup |
|--------|---------|--------|
| **CSS Variables** | Vanilla CSS/HTML | `:root` + `[data-theme="dark"]` |
| **Tailwind v3** | Tailwind CSS v3 | JavaScript config file |
| **Tailwind v4** | Tailwind CSS v4 | CSS `@theme` direktiva |
| **SCSS** | Sass/SCSS projekty | `$color-` proměnné |
| **JSON** | Obecný export | Kompletní tokeny a škály |
| **Figma W3C** | Figma Tokens plugin | W3C Design Tokens spec |
| **CSV Audit** | Accessibility audit | WCAG kontrasty s AA/AAA/FAIL |

### Figma Export (speciální)

Checkbox volby:
- ☑️ **Scales** - Všechny barevné škály (0-1000)
- ☑️ **Aliases** - Semantic tokeny s aliasy `{scale.primary.500}`
- ☑️ **Surface** - Surface/radius/shadow tokeny

**Light/Dark selector** - exportuj tokeny pro konkrétní mód

### CSV Audit Export

- Seznam všech tokenů s hex hodnotami
- WCAG kontrast ratio vs background
- Level: **AA** / **AAA** / **FAIL**
- Light/Dark selector

---

## 💡 Tipy a triky

### 🎯 Pro zachování input barvy
```
Advanced Controls → Pro Mode
☑️ Stay True to Input Color

→ Primary škála bude obsahovat přesně tvoji input barvu
```

### 🎨 Pro custom neutral tint
```
Advanced Controls → Neutral Tint Source
└─ Dropdown: [Primary] [Secondary] [Custom] [Pure]

→ Zvol Custom a vyber vlastní barvu pro tónování šedi
```

### 📐 Pro custom radius/shadows
```
Levý panel → Surface Controls
├─ Radius: [None] [Medium] [Circular]
└─ Shadow: [None] [Subtle] [Strong]

→ Medium + Subtle = Material Design like
→ Circular + Subtle = iOS like
```

### 🔍 Pro manuální tone mapping
```
Advanced Controls → Pro Mode
☑️ Zapni Pro Mode

→ Objeví se Pro Mode Controls panel
→ Můžeš ručně nastavit tone (0-1000) pro každou semantic barvu
→ On-colors se automaticky vypočítají pro WCAG compliance
```

---

## 📚 Další dokumentace

| Dokument | K čemu je |
|----------|-----------|
| [README.md](./README.md) | Kompletní přehled feature |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Implementační detaily |
| [COLOR_THEORY.md](./COLOR_THEORY.md) | OKLCH a color science |
| **Docs page v app** | Interaktivní dokumentace s live audit |

---

## 🎯 Typické workflow

### Scénář 1: Rychlý start (2 minuty)
1. Nastav Primary barvu
2. Klikni Randomize pro Secondary
3. Zvol Light/Dark
4. Export → CSS Variables
5. Hotovo! ✅

### Scénář 2: Brand design system (10 minut)
1. Nastav Primary podle brand guidelines
2. Použij Harmony Mode: Analogous pro harmonickou secondary
3. Zapni Pure Neutrals (pokud brand nepoužívá tinted)
4. Upravit Saturation a Temperature dle potřeby
5. Zkontroluj Colorblind Simulation
6. Export → Figma W3C (se všemi checkboxy)
7. Import do Figma jako Variables
8. Hotovo! ✅

### Scénář 3: Accessibility-first (15 minut)
1. Nastav Primary a Secondary
2. Přepni na High Contrast mód
3. Zkontroluj Live Preview - všechny komponenty
4. Otevři Docs → Live Contrast Audit
5. Ověř že všechny tokeny jsou AAA (7:1+)
6. Export → CSV Audit pro dokumentaci
7. Export → CSS Variables pro implementaci
8. Hotovo! ✅

---

## ❓ FAQ

### Q: Jak změním kontrast jen pro jeden element?
**A**: High Contrast mód ovlivňuje všechny tokeny globálně. Pro per-element kontrolu použij Pro Mode a custom tone mapping.

### Q: Proč některé barvy mají badge "⚠️ P3"?
**A**: Tyto barvy překračují sRGB gamut. Vypadají super na moderních displejích (iPhone, MacBook Pro), ale můžou vypadat jinak na starších monitorech.

### Q: Co jsou to "tinted neutrals"?
**A**: Šedá škála s jemným barevným tónem (obvykle z primary barvy). Vytváří vizuálně koherentnější design než čistá šedá.

### Q: Proč má škála 21 kroků (0-1000)?
**A**: Power 0.9 easing poskytuje perceptuálně rovnoměrné rozložení. Kroky po 50 dávají dostatečnou granularitu pro všechny případy použití.

### Q: Můžu použít vlastní kroky místo auto-generovaných?
**A**: Ano! Zapni Pro Mode a nastav custom tones (0-1000) pro každou semantic barvu.

---

**Připraven? Běž do aplikace a vytvoř svůj design system! 🚀**
