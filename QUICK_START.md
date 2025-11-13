# 🚀 Quick Start Guide

## 5-minute guide to DS Styles Generator

### 1️⃣ Set base colors (30 seconds)
```
Left panel → Color Inputs
├─ Primary: Your main brand color
└─ Secondary: Complementary color (or use Harmony mode)
```

Tip: Other colors (Error, Warning, Success, Info) are auto-generated.

---

### 2️⃣ Choose modes (10 seconds)
```
Live Preview → Top buttons
├─ Theme:    [Light] or [Dark]
└─ Contrast: [Default] or [High Contrast]
```

Combos:
- Light + Default = Standard light mode
- Dark + Default  = Standard dark mode
- Light + High Contrast = For low-vision users (up to 21:1 contrast)
- Dark + High Contrast  = Dark mode with max contrast

---

### 3️⃣ (Optional) Advanced settings (1 minute)
```
Left panel → Advanced Controls (click to expand)

☑️ Pure Neutrals           → Remove color tint from grays
🎚️ Saturation (0.5-1.5x)  → Global saturation
🌡️ Temperature (-15°+15°)  → Cooler/warmer
🎨 Harmony Mode            → Auto-generate secondary color
```

Harmony modes:
- Analogous → Adjacent colors (harmonious)
- Complementary → Opposite colors (contrasty)
- Triadic → 3 colors, 120° apart (balanced)

---

### 4️⃣ Review visualizations (1 minute)
Scroll down to check:

Color Harmony Generator
- Shows automatically generated combinations
- Use for inspiration or copy hex values

Colorblind Simulation
- Choose vision type from dropdown
- See how your colors appear for colorblind users

Material Design 3 Tonal Palettes
- Shows full tone palette (0-100)
- ⚠️ indicates adaptive chroma reductions due to physical limits

Complete Token Preview
- 100+ tokens with real-time WCAG contrast badges
- 🟢 AAA (≥7:1) | 🟡 AA (≥4.5:1) | 🔴 FAIL (<4.5:1)

Scale Preview
- Full 0-1000 scales (step 50)
- 21 shades per color

---

### 5️⃣ Export (10 seconds)
```
Scroll to the bottom → Export Panel

Click a format:
├─ [CSS Variables]   → For vanilla CSS/HTML
├─ [Tailwind Config] → For Tailwind CSS
├─ [SCSS Variables]  → For Sass/SCSS
├─ [JSON]            → For JavaScript/TypeScript
└─ [Figma Tokens]    → For the Figma plugin
```

The file downloads automatically.

---

## 🎓 For advanced users

When to use High Contrast?
- Accessibility for low-vision users
- WCAG AAA targets (7:1+ contrast)
- Readability in bright sunlight
- Not recommended as default for general use

When to use Pure Neutrals?
- When you want strictly gray neutrals (no tint)
- Minimalist design
- Backgrounds behind color photography
- Not ideal when you want warm/cool grays (tinted are better)

How to read AAA/AA/FAIL badges?
```
🟢 AAA (≥7:1)   → Excellent. Enhanced contrast for text and UI.
🟡 AA (≥4.5:1)  → OK. Standard contrast for normal text.
🔴 FAIL (<4.5:1) → Not WCAG compliant, avoid for text.
```

Material Design 3 Tone System
```
Tone 0   = Black
Tone 40  = Primary in light mode
Tone 50  = Mid-tone
Tone 80  = Primary in dark mode
Tone 100 = White
```

Key tones highlighted: 40, 80, 90, 100.

---

## ⚡ Quick tips

I want harmonious colors
1) Set Primary
2) Advanced Controls → Harmony Mode → Analogous
3) Secondary is auto-generated

Test colorblindness
1) Scroll to Colorblind Simulation
2) Dropdown → pick a type (Deuteranopia is most common)
3) Compare Original vs Filtered

Export to Tailwind
1) Scroll to Export Panel
2) Click [Tailwind Config]
3) Copy the downloaded `theme-tokens.js` into `tailwind.config.js`

See all tokens
1) Scroll to Complete Token Preview
2) Sections:
   - Color Rows (Primary, Secondary, Error...)
   - Surface Section
   - OnSurface Section
   - Outline & Other Section

Need maximum contrast
1) Live Preview → [High Contrast]
2) All text contrasts ≥ 7:1
3) Suitable for WCAG AAA compliance

---

## 🐛 Troubleshooting

Why do some colors look desaturated?
- Adaptive chroma reduces saturation at extreme tones due to physical color limits.

How do I set the secondary color manually?
- Harmony Mode → None, then set Secondary in the color picker.

The export file didn’t download
- Check browser permissions for downloads. Try another browser.

What does ⚠️ mean in Tonal Palette?
- Indicates adaptive chroma where saturation is reduced at extreme tones.

Why does High Contrast look “too harsh”?
- It’s intentional for accessibility. Use Default for normal usage.

---

## 📚 More resources

- `IMPROVEMENTS.md` → Technical details of the improvements
- `MATERIAL_HCT_INTEGRATION.md` → Material Design 3 HCT system
- `README_FINAL.md` → Complete documentation

---

Done. You’ve got a professional design system in 5 minutes. 🎉

Copy the exported tokens into your project and you’re good to go! 🚀
