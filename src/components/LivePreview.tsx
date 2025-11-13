import { useEffect } from 'react';
import { DemoButton } from './DemoButton';
import { DemoChip } from './DemoChip';
import { DemoTextField } from './DemoTextField';
import { DemoCard } from './DemoCard';
import { DemoCardOutline } from './DemoCardOutline';
import { DemoCardElevated } from './DemoCardElevated';
import { DemoSelect } from './DemoSelect';
import { DemoSlider } from './DemoSlider';
import { DemoRadioGroup } from './DemoRadioGroup';
import { DemoSwitch } from './DemoSwitch';
import { DemoBadge } from './DemoBadge';
import { DemoAlert } from './DemoAlert';
import { DemoProgress } from './DemoProgress';
import { DemoTabs } from './DemoTabs';
import { DemoTooltip } from './DemoTooltip';
import { DemoToast } from './DemoToast';
import { DemoModal } from './DemoModal';
import { DemoBreadcrumb } from './DemoBreadcrumb';
import { useThemeStore } from '../store/themeStore';
import './LivePreview.css';
import './PreviewCard.css';

export const LivePreview = () => {
    const themeMode = useThemeStore((s) => s.ui.themeMode);
    const contrastMode = useThemeStore((s) => s.ui.contrastMode);
    // Density controls removed from toolbar; keep preview for future flags if needed

    const getModeStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            minHeight: '400px',
        };

        // High contrast režimy mají specifické nastavení (vztahuje se i na extra-high)
        if (contrastMode === 'high-contrast' || contrastMode === 'extra-high') {
            return {
                ...baseStyles,
                background: themeMode === 'light' ? '#fff' : '#000',
                color: themeMode === 'light' ? '#000' : '#fff',
                border: `2px solid ${themeMode === 'light' ? '#000' : '#fff'}`,
                // High contrast CSS variables override
                ['--high-contrast-multiplier' as string]: '1.5'
            };
        }

        // Default režim používá theme variables
        return { ...baseStyles };
    };

    // Zajistíme, že atributy na rootu se synchronizují s výběrem
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeMode);
        document.documentElement.setAttribute('data-contrast', contrastMode);
    }, [themeMode, contrastMode]);

    

    return (
        <section className="lp">
            <div
                data-theme={themeMode === 'dark' ? 'dark' : undefined}
                data-contrast={contrastMode}
                className="lp__card preview-card preview-root"
                style={getModeStyles()}
            >
                <div className="lp__block">
                    <h3 className="lp__block-title">Buttons</h3>
                    <div className="lp__row">
                        <DemoButton />
                        <DemoChip>Filter Chip</DemoChip>
                    </div>
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Text Field</h3>
                    <DemoTextField />
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Cards</h3>
                    <div className="lp__row">
                        <DemoCard />
                        <DemoCardOutline />
                        <DemoCardElevated />
                    </div>
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Inputs</h3>
                    <div className="lp__row">
                        <DemoSelect />
                        <DemoSlider />
                        <DemoRadioGroup />
                        <DemoSwitch />
                    </div>
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Badges</h3>
                    <DemoBadge />
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Alerts</h3>
                    <DemoAlert />
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Progress</h3>
                    <DemoProgress />
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Tabs</h3>
                    <DemoTabs />
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Overlays</h3>
                    <div className="lp__row">
                        <DemoTooltip />
                        <DemoToast />
                        <DemoModal />
                    </div>
                </div>

                <div className="lp__block">
                    <h3 className="lp__block-title">Navigation</h3>
                    <DemoBreadcrumb />
                </div>
            </div>
        </section>
    );
};

// Static child component to satisfy react-hooks/static-components
// Internal density toggles removed; theme/contrast handled globally by toolbar.
