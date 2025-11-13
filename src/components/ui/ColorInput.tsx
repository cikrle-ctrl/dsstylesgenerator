import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import './ColorInput.css';
import { ColorPicker } from './ColorPicker';
import { Portal } from './Portal';

export interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const ColorInput = ({ label, value, onChange, disabled }: ColorInputProps) => {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const swatchRef = useRef<HTMLButtonElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            const target = e.target as Node;
            if (wrapRef.current?.contains(target)) return; // inside wrapper
            if (popoverRef.current?.contains(target)) return; // inside popover
            // If click is inside a portalized select menu, don't close
            if (target instanceof Element) {
                const portalHit = target.closest('[data-portal-kind="select-menu"]');
                if (portalHit) return;
            }
            setOpen(false);
        };
        document.addEventListener('mousedown', onDoc, true);
        return () => document.removeEventListener('mousedown', onDoc, true);
    }, []);

    useEffect(() => {
        if (!open) return;
        const update = () => {
            const el = swatchRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const top = rect.bottom + 8;
            const minWidth = 320;
            const width = Math.max(minWidth, rect.width);
            const maxLeft = window.innerWidth - width - 8;
            const left = Math.max(8, Math.min(rect.left, maxLeft));
            setPopoverStyle({ position: 'fixed', top, left, zIndex: 1100, width });
        };
        update();
        const onScroll = () => update();
        const onResize = () => update();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [open]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="color-input">
            <label className="color-input__label">{label}</label>
            <div className="color-input__wrapper" ref={wrapRef}>
                <button
                    type="button"
                    className="color-input__swatch"
                    style={{ background: value }}
                    onClick={() => !disabled && setOpen((o) => !o)}
                    aria-label="Open color picker"
                    disabled={disabled}
                    ref={swatchRef}
                />
                <div className="color-input__hex">
                    <span className="color-input__hex-value">{value.toUpperCase()}</span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="color-input__copy-btn"
                        title="Copy hex value"
                        disabled={disabled}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
                {open && (
                    <Portal>
                        <div className="color-input__popover" style={popoverStyle} ref={popoverRef}>
                            <ColorPicker value={value} onChange={onChange} onClose={() => setOpen(false)} />
                        </div>
                    </Portal>
                )}
            </div>
        </div>
    );
};
