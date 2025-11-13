import { useMemo, useRef, useState } from 'react';
import { hsv, formatHex, formatRgb, formatHsl, formatCss, parse, type Hsv, type Color } from 'culori';
import { Slider } from './Slider';
import { Select } from './Select';
import './ColorPicker.css';

export interface ColorPickerProps {
  value: string; // hex
  onChange: (hex: string) => void;
  onClose?: () => void;
}

export function ColorPicker({ value, onChange, onClose }: ColorPickerProps) {
  // Internal hsv derived from prop
  const parsed = useMemo(() => hsv(value) as Hsv | null, [value]);
  const h = typeof parsed?.h === 'number' ? parsed!.h! : 0;
  const s = typeof parsed?.s === 'number' ? parsed!.s! * 100 : 100;
  const v = typeof parsed?.v === 'number' ? parsed!.v! * 100 : 100;

  const [fmt, setFmt] = useState<'hex' | 'rgb' | 'hsl' | 'css'>('hex');
  const [dirtyText, setDirtyText] = useState<string | null>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  const emit = (nh: number, ns: number, nv: number) => {
    const col = { mode: 'hsv', h: nh, s: ns / 100, v: nv / 100 } as const;
    const hex = formatHex(col);
    onChange(hex);
  };

  const onPlanePointer = (e: React.PointerEvent) => {
    const el = planeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const updateFrom = (clientX: number, clientY: number) => {
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const ns = (x / rect.width) * 100; // saturation
      const nv = 100 - (y / rect.height) * 100; // value
      emit(h, ns, nv);
    };
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFrom(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => updateFrom(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
  };

  const displayText = useMemo(() => {
    const col = parse(value);
    if (!col) return value.toUpperCase();
    const opaque = Object.assign({}, col, { alpha: 1 }) as Color;
    const out = fmt === 'hex' ? formatHex(opaque)
      : fmt === 'rgb' ? formatRgb(opaque)
      : fmt === 'hsl' ? formatHsl(opaque)
      : formatCss(opaque);
    return (out ?? '').toString().toUpperCase();
  }, [value, fmt]);

  const commitFromText = () => {
    const t = (dirtyText ?? displayText).trim();
    const parsedC = parse(t.startsWith('#') || t.startsWith('rgb') || t.startsWith('hsl') || t.startsWith('color') ? t : `#${t}`);
    if (parsedC) {
      const opaque = Object.assign({}, parsedC, { alpha: 1 }) as Color;
      const hx = formatHex(opaque) ?? '';
      onChange(hx.toString().toUpperCase());
    } else {
      // on invalid, just drop edits by clearing dirty state
      // input will re-render with displayText
    }
    setDirtyText(null);
  };

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const pickColorFromScreen = async () => {
    if (!hasEyeDropper) return;
    try {
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        onChange(result.sRGBHex.toUpperCase());
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('EyeDropper cancelled or failed:', err);
    }
  };

  return (
    <div className="cp">
      <div
        className="cp__plane"
        ref={planeRef}
        onPointerDown={onPlanePointer}
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))`
        }}
      >
        <div
          className="cp__thumb"
          style={{ left: `${s}%`, top: `${100 - v}%` }}
        />
      </div>
      <div className="cp__row">
        <div className="cp__label">Hue</div>
        <div className="cp__value">{Math.round(h)}</div>
      </div>
      <div className="cp__ctrl cp__hue">
        <Slider value={h} onChange={(nh) => { emit(nh, s, v); }} min={0} max={360} step={1} />
      </div>
      <div className="cp__inputs">
        <div className="cp__format">
          <Select
            value={fmt}
            onChange={(v) => setFmt(v as typeof fmt)}
            options={[
              { value: 'hex', label: 'HEX' },
              { value: 'rgb', label: 'RGB' },
              { value: 'hsl', label: 'HSL' },
              { value: 'css', label: 'CSS' },
            ]}
          />
        </div>
        {hasEyeDropper && (
          <button
            type="button"
            className="cp__eyedropper"
            onClick={pickColorFromScreen}
            title="Pick color from screen"
            aria-label="Pick color from screen"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 6.5L9.5 2.5L10.5 1.5C10.7761 1.22386 11.1478 1.06836 11.5355 1.06836C11.9232 1.06836 12.2949 1.22386 12.571 1.5L14.5 3.429C14.7761 3.70514 14.9316 4.07681 14.9316 4.4645C14.9316 4.85219 14.7761 5.22386 14.5 5.5L13.5 6.5ZM12.5 7.5L4.5 15.5H0.5V11.5L8.5 3.5L12.5 7.5Z" fill="currentColor"/>
            </svg>
          </button>
        )}
        <input
          className="cp__hexinput"
          value={dirtyText ?? displayText}
          onChange={(e) => setDirtyText(e.target.value)}
          onBlur={commitFromText}
          onKeyDown={(e) => { if (e.key === 'Enter') commitFromText(); }}
          spellCheck={false}
        />
      </div>
      {onClose && (
        <button type="button" className="cp__close" onClick={onClose}>Close</button>
      )}
    </div>
  );
}
