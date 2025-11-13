import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { Sun, Moon, FileText, Home } from 'lucide-react';
import { Button } from './ui/Button';
import './HeaderToolbar.css';

export function HeaderToolbar() {
    const themeMode = useThemeStore((s) => s.ui.themeMode);
    const contrastMode = useThemeStore((s) => s.ui.contrastMode);
    const setThemeMode = useThemeStore((s) => s.setThemeMode);
    const setContrastMode = useThemeStore((s) => s.setContrastMode);
    const location = useLocation();
    const navigate = useNavigate();

    const isDocs = location.pathname.startsWith('/docs');

    return (
        <div className="toolbar">
            <div className="toolbar__side">
                {/* Theme toggle with icons */}
                <div role="group" aria-label="Theme" className="seg">
                    <Button
                        variant="ghost"
                        size="small"
                        aria-pressed={themeMode === 'light'}
                        title="Light Mode"
                        onClick={() => setThemeMode('light')}
                        className="seg__btn"
                        icon={<Sun size={16} />}
                    />
                    <Button
                        variant="ghost"
                        size="small"
                        aria-pressed={themeMode === 'dark'}
                        title="Dark Mode"
                        onClick={() => setThemeMode('dark')}
                        className="seg__btn"
                        icon={<Moon size={16} />}
                    />
                </div>

                {/* Contrast (A/AA/AAA) */}
                <div role="group" aria-label="Contrast" className="seg">
                    {([
                        { v: 'default' as 'default' | 'high-contrast' | 'extra-high', label: 'A' },
                        { v: 'high-contrast' as 'default' | 'high-contrast' | 'extra-high', label: 'AA' },
                        { v: 'extra-high' as 'default' | 'high-contrast' | 'extra-high', label: 'AAA' },
                    ]).map((opt) => (
                        <Button
                            key={opt.v}
                            variant="ghost"
                            size="small"
                            aria-pressed={contrastMode === opt.v}
                            title={opt.label}
                            onClick={() => setContrastMode(opt.v)}
                            className="seg__btn"
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>

                {/* Density controls removed as requested */}
            </div>

            <div className="toolbar__side">
                <Button
                    variant="ghost"
                    size="medium"
                    onClick={() => navigate(isDocs ? '/' : '/docs')}
                    className="toolbar__docbtn"
                    icon={isDocs ? <Home size={16} /> : undefined}
                    iconPosition="left"
                >
                    {isDocs ? 'Zpět' : 'Dokumentace'} {isDocs ? '' : ''}
                    {!isDocs && <span style={{ display: 'inline-flex', marginLeft: 8 }}><FileText size={16} /></span>}
                </Button>
            </div>
        </div>
    );
}
