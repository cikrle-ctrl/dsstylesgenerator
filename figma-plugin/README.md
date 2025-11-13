# DS Styles Generator - Figma Plugin

Custom Figma plugin for importing design tokens as Variables with full theme mode support.

## Features

- ✅ Import colors as **Figma Variables** (not just styles)
- ✅ Support for **Light/Dark/High Contrast** modes
- ✅ Import all color scales (0-1000 shades)
- ✅ Import semantic tokens (primary, secondary, etc.)
- ✅ Direct integration with DS Styles Generator JSON export

## Installation

### Option 1: Development Mode (Recommended for testing)

1. Open Figma Desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this `figma-plugin` folder
4. Plugin will appear in **Plugins** → **Development** → **DS Styles Generator**

### Option 2: Build for Distribution

```bash
# Not yet implemented - requires bundling
```

## Usage

1. In DS Styles Generator web app:
   - Configure your color palette
   - Choose contrast mode
   - Click **Export** → **JSON Format**
   - Copy the JSON output

2. In Figma:
   - Run plugin: **Plugins** → **DS Styles Generator**
   - Paste JSON into text area
   - Choose import options:
     - ☑ Import all color scales
     - ☑ Import semantic tokens
     - ☑ Create theme modes
   - Click **Import Variables**

3. Access imported variables:
   - Open **Local Variables** panel
   - Find collection: **DS Styles**
   - Switch between modes: **Light**, **Dark**, **High Contrast**

## Import Options

### Import all color scales (0-1000)
Creates variables for every shade in your color palette:
- `colors/primary/0`, `colors/primary/50`, ..., `colors/primary/1000`
- `colors/secondary/0`, `colors/secondary/50`, ...
- `colors/neutral/0`, `colors/neutral/50`, ...

### Import semantic tokens
Creates variables for semantic color tokens:
- `tokens/colorPrimary`, `tokens/colorSecondary`
- `tokens/colorBackground`, `tokens/colorText`
- `tokens/colorBorder`, etc.

### Create theme modes
Creates 3 modes in the variable collection:
- **Light** - Default theme
- **Dark** - Dark mode values
- **High Contrast** - WCAG AAA values

## Variable Naming Convention

The plugin creates variables using path-style names:

```
colors/
  primary/
    0, 50, 100, 150, ..., 950, 1000
  secondary/
    0, 50, 100, 150, ..., 950, 1000
  ...

tokens/
  colorPrimary
  colorSecondary
  colorBackground
  colorText
  ...
```

## Color Space

The plugin accepts both:
- **OKLCH** format: `oklch(0.5 0.1 180)`
- **HEX** format: `#3b82f6`

OKLCH is converted to RGB for Figma compatibility.

## Palette Swapping

To swap palettes:

1. Export new palette from DS Styles Generator
2. Run plugin in Figma
3. Import new JSON
4. Variables are updated automatically (same names = update existing)

## Troubleshooting

### "Invalid JSON" error
- Ensure you copied the **entire** JSON output
- Check for trailing commas or syntax errors

### Variables not updating
- Delete existing "DS Styles" collection first
- Re-import with fresh JSON

### Colors look different
- OKLCH→RGB conversion may have slight variations
- Use HEX export for exact color matching

### Plugin not appearing
- Restart Figma Desktop app
- Verify `manifest.json`, `code.js`, `ui.html` are in same folder
- Check Figma Desktop version (requires v116+)

## File Structure

```
figma-plugin/
  manifest.json    # Plugin configuration
  code.js          # Main plugin logic
  ui.html          # User interface
  README.md        # This file
```

## Development

To modify the plugin:

1. Edit `code.js` or `ui.html`
2. Save changes
3. In Figma: **Plugins** → **Development** → **Reload plugin** (or Cmd/Ctrl+Alt+P)
4. Test changes

## Limitations

- Figma Variables API only supports COLOR, NUMBER, STRING, BOOLEAN types
- Shadows, typography, spacing cannot be imported as variables yet
- OKLCH conversion is approximated (use HEX for precision)
- No undo for variable creation (manual deletion required)

## Future Improvements

- [ ] Bundle with esbuild/webpack for distribution
- [ ] Add TypeScript support
- [ ] Import typography as number variables
- [ ] Import spacing scale
- [ ] Batch update existing variables
- [ ] Export Figma variables back to JSON
- [ ] Support for more color formats (HSL, RGB, LCH)

## License

MIT - Same as parent DS Styles Generator project
