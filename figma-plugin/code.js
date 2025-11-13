// DS Styles Generator - Figma Plugin
// Creates Figma Variables from exported JSON tokens

figma.showUI(__html__, { width: 340, height: 520 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'cancel') {
    figma.closePlugin();
    return;
  }

  if (msg.type === 'import') {
    try {
      const { data, options } = msg;
      await importTokensAsVariables(data, options);
      figma.ui.postMessage({
        type: 'status',
        message: '✓ Variables imported successfully!',
        status: 'success'
      });
      
      // Close after 1.5s
      setTimeout(() => figma.closePlugin('Variables imported!'), 1500);
    } catch (error) {
      figma.ui.postMessage({
        type: 'status',
        message: '✗ Error: ' + error.message,
        status: 'error'
      });
    }
  }
};

async function importTokensAsVariables(data, options) {
  const { tokens, scales, contrastMode } = data;
  
  if (!tokens && !scales) {
    throw new Error('No tokens or scales found in JSON');
  }

  // Get or create collection
  const collectionName = 'DS Styles';
  let collection = figma.variables.getLocalVariableCollections()
    .find(c => c.name === collectionName);
  
  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
  }

  // Create modes if requested
  let lightMode = collection.modes[0];
  let darkMode, highContrastMode;
  
  if (options.createModes) {
    // Rename first mode to Light
    collection.renameMode(lightMode.modeId, 'Light');
    
    // Create Dark mode if doesn't exist
    darkMode = collection.modes.find(m => m.name === 'Dark');
    if (!darkMode) {
      const darkModeId = collection.addMode('Dark');
      darkMode = collection.modes.find(m => m.modeId === darkModeId);
    }
    
    // Create High Contrast mode if doesn't exist
    highContrastMode = collection.modes.find(m => m.name === 'High Contrast');
    if (!highContrastMode) {
      const hcModeId = collection.addMode('High Contrast');
      highContrastMode = collection.modes.find(m => m.modeId === hcModeId);
    }
  }

  // Helper to parse OKLCH/HEX to RGB
  function parseColor(colorStr) {
    // Handle hex colors
    if (colorStr.startsWith('#')) {
      return hexToRgb(colorStr);
    }
    
    // Handle oklch colors
    if (colorStr.startsWith('oklch(')) {
      return oklchToRgb(colorStr);
    }
    
    // Default fallback
    return { r: 0, g: 0, b: 0 };
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }

  function oklchToRgb(oklchStr) {
    // Extract L, C, H from "oklch(L C H)" format
    const match = oklchStr.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (!match) return { r: 0, g: 0, b: 0 };
    
    const [, L, C, H] = match.map(parseFloat);
    
    // Simple OKLCH -> RGB conversion (approximation)
    // For production, use proper color space conversion
    const hue = H * Math.PI / 180;
    const a = C * Math.cos(hue);
    const b = C * Math.sin(hue);
    
    // OKLAB to linear RGB (simplified)
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    
    let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b_out = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    
    // Gamma correction and clamp
    r = Math.max(0, Math.min(1, r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r));
    g = Math.max(0, Math.min(1, g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g));
    b_out = Math.max(0, Math.min(1, b_out > 0.0031308 ? 1.055 * Math.pow(b_out, 1/2.4) - 0.055 : 12.92 * b_out));
    
    return { r, g, b: b_out };
  }

  // Create or get variable
  function getOrCreateVariable(name, collectionId) {
    const existing = figma.variables.getLocalVariables()
      .find(v => v.name === name && v.variableCollectionId === collectionId);
    
    if (existing) return existing;
    
    return figma.variables.createVariable(name, collectionId, 'COLOR');
  }

  // Import scales if requested
  if (options.importScales && scales) {
    for (const [scaleName, scaleData] of Object.entries(scales)) {
      // Skip if not an object with default/light/dark
      if (typeof scaleData !== 'object' || !scaleData.default) continue;
      
      const scaleShades = scaleData.default; // e.g., { "0": "#fff", "50": "...", ... }
      
      for (const [shade, colorValue] of Object.entries(scaleShades)) {
        const varName = `colors/${scaleName}/${shade}`;
        const variable = getOrCreateVariable(varName, collection.id);
        
        const rgb = parseColor(colorValue);
        variable.setValueForMode(lightMode.modeId, rgb);
        
        // Set dark mode if available
        if (darkMode && scaleData.dark && scaleData.dark[shade]) {
          const darkRgb = parseColor(scaleData.dark[shade]);
          variable.setValueForMode(darkMode.modeId, darkRgb);
        } else if (darkMode) {
          variable.setValueForMode(darkMode.modeId, rgb);
        }
        
        // Set high contrast mode if available
        if (highContrastMode && scaleData['extra-high'] && scaleData['extra-high'][shade]) {
          const hcRgb = parseColor(scaleData['extra-high'][shade]);
          variable.setValueForMode(highContrastMode.modeId, hcRgb);
        } else if (highContrastMode) {
          variable.setValueForMode(highContrastMode.modeId, rgb);
        }
      }
    }
  }

  // Import semantic tokens if requested
  if (options.importTokens && tokens) {
    for (const [tokenName, tokenValue] of Object.entries(tokens)) {
      // Skip nested objects
      if (typeof tokenValue === 'object') continue;
      
      const varName = `tokens/${tokenName}`;
      const variable = getOrCreateVariable(varName, collection.id);
      
      const rgb = parseColor(tokenValue);
      variable.setValueForMode(lightMode.modeId, rgb);
      
      // For semantic tokens, use same value across modes
      // (in real app, you'd have mode-specific values)
      if (darkMode) {
        variable.setValueForMode(darkMode.modeId, rgb);
      }
      
      if (highContrastMode) {
        variable.setValueForMode(highContrastMode.modeId, rgb);
      }
    }
  }
}
