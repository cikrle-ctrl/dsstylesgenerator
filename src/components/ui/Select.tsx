import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Select.css';
import { Portal } from './Portal';

export interface SelectOption<T = string> {
  label: ReactNode;
  value: T;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
}

export function Select<T = string>({ value, onChange, options, placeholder }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const controlRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return; // click inside control
      if (menuRef.current?.contains(t)) return; // click inside menu
      setOpen(false);
    };
    document.addEventListener('mousedown', fn, true);
    return () => document.removeEventListener('mousedown', fn, true);
  }, []);

  const selected = options.find(o => o.value === value);
  const selectedIndex = useMemo(() => options.findIndex(o => o.value === value), [options, value]);

  // Compute and apply menu position when open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = controlRef.current;
      const menu = menuRef.current;
      if (!btn || !menu) return;
      const rect = btn.getBoundingClientRect();
      const menuHeight = menu.offsetHeight || 200; // fallback estimate
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Open above if not enough space below and more space above
      const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      const top = openAbove ? rect.top - menuHeight - 6 : rect.bottom + 6;
      const left = Math.max(8, Math.min(rect.left, (window.innerWidth - rect.width - 8)));
      // Raise above ColorPicker popover (1100)
      setMenuStyle({ position: 'fixed', top, left, width: rect.width, zIndex: 1200 });
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

  // Note: We intentionally set highlightedIndex when opening via handlers to avoid setState-in-effect lint issues.

  useEffect(() => {
    if (!open) return;
    const el = optionRefs.current[highlightedIndex];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const max = options.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setHighlightedIndex((i) => (i < 0 ? 0 : Math.min(max, i + 1)));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setHighlightedIndex((i) => (i < 0 ? max : Math.max(0, i - 1)));
      }
    } else if (e.key === 'Home') {
      if (open) { e.preventDefault(); setHighlightedIndex(0); }
    } else if (e.key === 'End') {
      if (open) { e.preventDefault(); setHighlightedIndex(max); }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else if (highlightedIndex >= 0) {
        const opt = options[highlightedIndex];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false); }
    }
  };

  const listboxId = useId();

  return (
    <div className="sel" ref={ref}>
      <button
        type="button"
        className="sel__control"
        aria-haspopup="listbox"
        aria-expanded={open}
  aria-controls={listboxId}
        onClick={() => {
          if (!open) {
            setOpen(true);
            setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          } else {
            setOpen(false);
            setHighlightedIndex(-1);
          }
        }}
        onKeyDown={onKeyDown}
        ref={controlRef}
      >
        <span className="sel__value">{selected ? selected.label : (placeholder ?? 'Select')}</span>
        <ChevronDown size={16} className={`sel__chev ${open ? 'sel__chev--open' : ''}`} />
      </button>
      {open && (
        <Portal>
          <div
            className="sel__menu"
            role="listbox"
            id={listboxId}
            style={menuStyle}
            ref={menuRef}
            data-portal-kind="select-menu"
          >
            {options.map((opt, idx) => (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={`sel__option ${opt.value === value ? 'sel__option--selected' : ''} ${idx === highlightedIndex ? 'sel__option--active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                ref={(el) => { optionRefs.current[idx] = el; }}
              >
                <span className="sel__check">{opt.value === value ? <Check size={16} /> : null}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}
