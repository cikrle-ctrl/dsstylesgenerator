import { useThemeStore } from '../store/themeStore';
import { 
    generateAnalogousColor,
    generateComplementaryColor,
    generateTriadicColors
} from '../logic/colorModule';
import { Accordion } from './ui/Accordion';
import { Settings } from 'lucide-react';
import { Checkbox } from './ui/Checkbox';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';

type HarmonyMode = 'none' | 'analogous' | 'complementary' | 'triadic';

interface AdvancedControlsProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export const AdvancedControls = ({ isExpanded, onToggle }: AdvancedControlsProps) => {
    const { inputs, advancedSettings, setSecondaryColor, setAdvancedSettings } = useThemeStore();

    const handleNeutralToggle = () => {
        setAdvancedSettings({ usePureNeutrals: !advancedSettings.usePureNeutrals });
    };

    const handleSaturationChange = (value: number) => {
        setAdvancedSettings({ saturationMultiplier: value });
    };

    const handleTemperatureChange = (value: number) => {
        setAdvancedSettings({ temperatureShift: value });
    };

    const handleHarmonyChange = (mode: HarmonyMode) => {
        setAdvancedSettings({ harmonyMode: mode });
        const primaryColor = inputs.colors.primary;
        
        switch (mode) {
            case 'analogous': {
                const analogous = generateAnalogousColor(primaryColor);
                setSecondaryColor(analogous);
                break;
            }
            case 'complementary': {
                const complementary = generateComplementaryColor(primaryColor);
                setSecondaryColor(complementary);
                break;
            }
            case 'triadic': {
                const [, triadic1] = generateTriadicColors(primaryColor);
                setSecondaryColor(triadic1);
                break;
            }
            case 'none':
            default:
                // Keep current secondary
                break;
        }
    };

    return (
        <Accordion 
            title="Advanced Settings" 
            icon={<Settings />} 
            isExpanded={isExpanded}
            onToggle={onToggle}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Stay True to Input Color Toggle */}
                <Checkbox
                  checked={advancedSettings.stayTrueToInputColor}
                  onChange={(v) => setAdvancedSettings({ stayTrueToInputColor: v })}
                  label={<span>Stay True to Input Colors</span>}
                  description={<span>Pin input color to closest scale step (300-600 range) instead of normalizing to 500</span>}
                />

                {/* Pure Neutrals Toggle */}
                <Checkbox
                  checked={advancedSettings.usePureNeutrals}
                  onChange={() => handleNeutralToggle()}
                  label={<span>Use Pure Neutrals (Grayscale)</span>}
                  description={<span>Remove color tint from neutral palette (chroma = 0)</span>}
                />

                {/* Saturation Multiplier */}
                <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-on-surface-heading)' }}>Saturation Multiplier</span>
                        <span style={{ fontSize: '14px', color: 'var(--color-info)', fontWeight: 600 }}>
                            {advancedSettings.saturationMultiplier.toFixed(2)}x
                        </span>
                    </label>
                                        <Slider
                                            min={0.5}
                                            max={1.5}
                                            step={0.05}
                                            value={advancedSettings.saturationMultiplier}
                                            onChange={(v) => handleSaturationChange(v)}
                                        />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-on-surface-subtle)', marginTop: '4px' }}>
                        <span>Desaturated (0.5x)</span>
                        <span>Normal (1.0x)</span>
                        <span>Vibrant (1.5x)</span>
                    </div>
                </div>

                {/* Temperature Shift */}
                <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-on-surface-heading)' }}>Temperature Shift</span>
                        <span style={{ fontSize: '14px', color: advancedSettings.temperatureShift > 0 ? 'var(--color-warning)' : advancedSettings.temperatureShift < 0 ? 'var(--color-info)' : 'var(--color-on-surface-variant)', fontWeight: 600 }}>
                            {advancedSettings.temperatureShift > 0 ? '+' : ''}{advancedSettings.temperatureShift}°
                        </span>
                    </label>
                                        <Slider
                                            min={-15}
                                            max={15}
                                            step={1}
                                            value={advancedSettings.temperatureShift}
                                            onChange={(v) => handleTemperatureChange(Math.round(v))}
                                        />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-on-surface-subtle)', marginTop: '4px' }}>
                        <span style={{ color: 'var(--color-info)' }}>Cooler (-15°)</span>
                        <span>Neutral (0°)</span>
                        <span style={{ color: 'var(--color-warning)' }}>Warmer (+15°)</span>
                    </div>
                </div>

                {/* Harmony Mode */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-on-surface-heading)' }}>
                        Color Harmony
                    </label>
                    <Select
                        value={advancedSettings.harmonyMode}
                        onChange={(v) => handleHarmonyChange(v as HarmonyMode)}
                        options={[
                            { value: 'none', label: 'None (Manual)' },
                            { value: 'analogous', label: 'Analogous (+30° hue)' },
                            { value: 'complementary', label: 'Complementary (+180° hue)' },
                            { value: 'triadic', label: 'Triadic (+120° hue)' },
                        ]}
                    />
                    <p style={{ 
                        margin: '6px 0 0 0', 
                        fontSize: '12px', 
                        color: 'var(--color-on-surface-variant)',
                        lineHeight: '1.4'
                    }}>
                        {advancedSettings.harmonyMode === 'none' && 'Set secondary color manually'}
                        {advancedSettings.harmonyMode === 'analogous' && 'Secondary color next to primary on color wheel'}
                        {advancedSettings.harmonyMode === 'complementary' && 'Secondary color opposite to primary on color wheel'}
                        {advancedSettings.harmonyMode === 'triadic' && 'Secondary color 120° apart for balanced triad'}
                    </p>
                </div>

                {/* Info Box */}
                <div style={{
                    background: 'var(--color-info-container)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-outline-subtle)',
                    fontSize: '12px',
                    color: 'var(--color-on-info-container)',
                    lineHeight: '1.5'
                }}>
                    <strong>💡 Tip:</strong> Controls respect perceptual color limits (OKLCH).
                    Saturation and temperature adjustments apply adaptive chroma to avoid clipping.
                </div>

            </div>
        </Accordion>
    );
};
