# 🚀 Quick Start Guide

## 5-minutový průvodce DS Styles Generator

### 1️⃣ Nastav základní barvy (30 sekund)
```
Levý panel → Color Inputs
├─ Primary: Tvoje hlavní brand barva
└─ Secondary: Doplňková barva (nebo použij Harmony mode)
```

**💡 Tip:** Ostatní barvy (Error, Warning, Success, Info) se generují automaticky!

---

### 2️⃣ Vyber režimy (10 sekund)
```
Live Preview → Horní tlačítka
├─ Theme:    [Light] nebo [Dark]
└─ Contrast: [Default] nebo [High Contrast]
```

**Kombinace:**
- **Light + Default** = Běžný světlý režim
- **Dark + Default** = Běžný tmavý režim  
- **Light + High Contrast** = Pro uživatele s nízkým viděním (21:1 kontrast!)
- **Dark + High Contrast** = Tmavý režim s maximálním kontrastem

---

### 3️⃣ (Volitelné) Pokročilé nastavení (1 minuta)
```
Levý panel → Advanced Controls (klikni pro rozbalení)

☑️ Pure Neutrals          → Odstraní color tint z šedých
🎚️ Saturation (0.5-1.5x) → Celková sytost palet
🌡️ Temperature (-15°+15°) → Teplota barev (cool/warm)
🎨 Harmony Mode           → Auto-generování secondary barvy
```

**Harmony režimy:**
- **Analogous** → Barvy vedle sebe (harmonické)
- **Complementary** → Protilehlé barvy (kontrastní)
- **Triadic** → 3 barvy v 120° rozestupu (vyvážené)

---

### 4️⃣ Zkontroluj vizualizace (1 minuta)
Scroll down pro kontrolu:

**🎨 Color Harmony Generator**
- Ukáže ti automaticky generované kombinace
- Použij pro inspiraci nebo zkopíruj hex hodnoty

**👁️ Colorblind Simulation**
- Vyber typ barvosleposti z dropdown
- Uvidíš jak tvoje barvy vypadají pro uživatele s color blindness

**📊 Material Design 3 Tonal Palettes**
- Zobrazuje kompletní tone palette (0-100)
- ⚠️ indikátory ukazují kde se redukuje chroma kvůli fyzikálním limitům

**🎯 Complete Token Preview**
- 100+ tokenů s real-time WCAG kontrast badgem
- 🟢 AAA (≥7:1) | 🟡 AA (≥4.5:1) | 🔴 FAIL (<4.5:1)

**📏 Scale Preview**
- Kompletní škály 0-1000 (po 50 krocích)
- 21 odstínů pro každou barvu

---

### 5️⃣ Exportuj (10 sekund)
```
Scroll úplně dolů → Export Panel

Klikni na formát:
├─ [CSS Variables]   → Pro vanilla CSS/HTML
├─ [Tailwind Config] → Pro Tailwind CSS
├─ [SCSS Variables]  → Pro Sass/SCSS
├─ [JSON]            → Pro JavaScript/TypeScript
└─ [Figma Tokens]    → Pro Figma plugin
```

**💾 Soubor se automaticky stáhne!**

---

## 🎓 Pro pokročilé

### Kdy použít High Contrast?
- ✅ Accessibility features pro uživatele s nízkým viděním
- ✅ WCAG AAA compliance (7:1+ kontrast)
- ✅ Bright sunlight readability
- ❌ Ne jako default (je moc ostrý pro běžné použití)

### Kdy použít Pure Neutrals?
- ✅ Když chceš čistě šedé bez color tint
- ✅ Minimalistický design
- ✅ Pro backgrounds s color photography
- ❌ Ne když chceš teplé/chladné šedé (tinted jsou lepší)

### Jak číst AAA/AA/FAIL badges?
```
🟢 AAA (≥7:1)   → Perfektní! Enhanced contrast pro text i UI
🟡 AA (≥4.5:1)  → OK! Standard kontrast pro běžný text
🔴 FAIL (<4.5:1) → ❌ Nesplňuje WCAG, nepoužívej pro text!
```

### Material Design 3 Tone System
```
Tone 0   = Černá
Tone 40  = Primary v light mode
Tone 50  = Mid-tone
Tone 80  = Primary v dark mode  
Tone 100 = Bílá
```

**Klíčové tones jsou zvýrazněné modře** (40, 80, 90, 100)

---

## ⚡ Rychlé tipy

### 🎨 Chci harmonické barvy
1. Nastav Primary
2. Advanced Controls → Harmony Mode → Analogous
3. Secondary se auto-generuje!

### 👁️ Chci otestovat colorblindness
1. Scroll k Colorblind Simulation
2. Dropdown → vyber typ (Deuteranopia je nejčastější)
3. Porovnej Original vs Filtered

### 📦 Chci exportovat do Tailwind
1. Scroll k Export Panel
2. Klikni [Tailwind Config]
3. Překopíruj stažený `theme-tokens.js` do `tailwind.config.js`

### 🔍 Chci vidět všechny tokeny
1. Scroll k Complete Token Preview
2. Rozbalené sekce:
   - Color Rows (Primary, Secondary, Error...)
   - Surface Section
   - OnSurface Section  
   - Outline & Other Section

### 🎯 Potřebuji max kontrast
1. Live Preview → [High Contrast]
2. Všechny kontrasty >= 7:1
3. Vhodné pro WCAG AAA compliance

---

## 🐛 Troubleshooting

**Q: Proč některé barvy vypadají desaturované?**  
A: Adaptive chroma! Extrémně světlé/tmavé tones automaticky redukují saturaci kvůli fyzikálním limitům barev.

**Q: Jak změním secondary barvu ručně?**  
A: Harmony Mode → None, pak nastav Secondary color picker ručně.

**Q: Export soubor se nestáhl**  
A: Zkontroluj browser permissions pro download. Zkus jiný browser.

**Q: Co znamená ⚠️ v Tonal Palette?**  
A: Indikuje kde se aplikuje adaptive chroma (redukce saturace na extrémních tones).

**Q: Proč High Contrast vypadá "too harsh"?**  
A: To je záměr! High contrast je pro uživatele s nízkým viděním. Pro normální použití použij Default.

---

## 📚 Další zdroje

- `IMPROVEMENTS.md` → Technické detaily všech 10 improvements
- `MATERIAL_HCT_INTEGRATION.md` → Material Design 3 HCT systém
- `README_FINAL.md` → Kompletní dokumentace

---

**Hotovo! Nyní máš profesionální design system za 5 minut.** 🎉

Zkopíruj exportované tokeny do svého projektu a jsi ready to go! 🚀
