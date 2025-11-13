import { useState } from 'react';
import { Slider } from './ui/Slider';

export function DemoSlider() {
  const [val, setVal] = useState(42);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Volume</label>
      <Slider value={val} min={0} max={100} step={1} onChange={setVal} />
      <div style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)' }}>Value: {val}</div>
    </div>
  );
}
