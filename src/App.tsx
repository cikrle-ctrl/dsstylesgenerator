// src/App.tsx
import { useThemeStore } from './store/themeStore';
import { ThemeInjector } from './components/ThemeInjector';
import './App.css';
import { ScalePreview } from './components/ScalePreview';
import { PalettePreview } from './components/PalettePreview';
import { LivePreview } from './components/LivePreview';
import { ExportPanel } from './components/ExportPanel';
import { ColorblindSimulator } from './components/ColorblindSimulator';
import { AdvancedControls } from './components/AdvancedControls';
import type { RadiusStrategy, ShadowStrategy } from './logic/surfaceAndRadius';
import { Routes, Route } from 'react-router-dom';
import { HeaderToolbar } from './components/HeaderToolbar';
import { Docs } from './pages/Docs';
import { ColorInput } from './components/ui/ColorInput';
import { Accordion } from './components/ui/Accordion';
import { Palette, Sparkles, Box, Shuffle } from 'lucide-react';
import { Select } from './components/ui/Select';
import { Button } from './components/ui/Button';


function App() {
    const {
        inputs,
        setPrimaryColor,
        setSecondaryColor,
        setErrorColor,
        setWarningColor,
        setSuccessColor,
        setInfoColor,
        setRadiusStrategy,
        setShadowStrategy,
    } = useThemeStore();

    return (
        <>
            <ThemeInjector />
            <div className="app-layout">
                {/* LEFT PANEL (CONTROLS) */}
                <div className="control-panel">
                    <div className="control-panel__header">
                        <h2 className="control-panel__title">ThemeEngine</h2>
                        <p className="control-panel__subtitle">Design System Generator</p>
                    </div>

                    <Accordion title="Core Colors" icon={<Palette />} defaultExpanded={true}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <ColorInput
                                label="Primary"
                                value={inputs.colors.primary}
                                onChange={setPrimaryColor}
                            />
                            <ColorInput
                                label="Secondary"
                                value={inputs.colors.secondary}
                                onChange={setSecondaryColor}
                            />
                            <Button
                                variant="ghost"
                                size="medium"
                                icon={<Shuffle size={16} />}
                                fullWidth
                                onClick={() => {
                                    const rand = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
                                    setPrimaryColor(rand());
                                    setSecondaryColor(rand());
                                }}
                            >
                                Randomize
                            </Button>
                        </div>
                    </Accordion>

                    <Accordion title="Semantic Colors" icon={<Sparkles />} defaultExpanded={false}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <ColorInput
                                label="Error"
                                value={inputs.colors.error}
                                onChange={setErrorColor}
                            />
                            <ColorInput
                                label="Warning"
                                value={inputs.colors.warning}
                                onChange={setWarningColor}
                            />
                            <ColorInput
                                label="Success"
                                value={inputs.colors.success}
                                onChange={setSuccessColor}
                            />
                            <ColorInput
                                label="Info"
                                value={inputs.colors.info}
                                onChange={setInfoColor}
                            />
                        </div>
                    </Accordion>

                    <Accordion title="Surfaces & Shadows" icon={<Box />} defaultExpanded={false}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--color-on-surface-variant)' }}>
                                    Corner Radius
                                </label>
                                                                <Select
                                                                    value={inputs.surface.radiusStrategy}
                                                                    onChange={(v) => setRadiusStrategy(v as RadiusStrategy)}
                                                                    options={[
                                                                        { value: 'none', label: 'None' },
                                                                        { value: 'medium', label: 'Medium (8px)' },
                                                                        { value: 'circular', label: 'Circular (Pill)' },
                                                                    ]}
                                                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--color-on-surface-variant)' }}>
                                    Shadow Style
                                </label>
                                                                <Select
                                                                    value={inputs.surface.shadowStrategy}
                                                                    onChange={(v) => setShadowStrategy(v as ShadowStrategy)}
                                                                    options={[
                                                                        { value: 'none', label: 'None' },
                                                                        { value: 'subtle', label: 'Subtle' },
                                                                        { value: 'strong', label: 'Strong' },
                                                                    ]}
                                                                />
                            </div>
                        </div>
                    </Accordion>

                    <AdvancedControls />
                    <ExportPanel />
                    
                    <div style={{ 
                        marginTop: 'auto', 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontSize: '12px', 
                        color: 'var(--color-on-surface-variant)',
                        borderTop: '1px solid var(--color-outline-subtle)'
                    }}>
                        made with ❤️ by <a 
                            href="https://github.com/cikrle-ctrl" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--color-primary)',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            ciki
                        </a>
                    </div>
                </div>

                {/* MIDDLE PANEL: routes */}
                <div className="main-content">
                    <HeaderToolbar />
                    <div className="live-preview">
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <div className="content-container">
                                        <LivePreview />
                                        <PalettePreview />
                                        <ScalePreview />
                                        {/* Colorblind sim completely at bottom */}
                                        <ColorblindSimulator />
                                    </div>
                                }
                            />
                            <Route path="/docs" element={<Docs />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;