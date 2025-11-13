import type { ChangeEvent } from 'react';
import './Slider.css';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1 }: SliderProps) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value));
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="sld">
      <div className="sld__track">
        <div className="sld__fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handle}
          className="sld__input"
        />
      </div>
    </div>
  );
}
