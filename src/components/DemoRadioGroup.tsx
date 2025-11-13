import { useState } from 'react';

const hoverCss = `
    .demo-radio-label:hover .demo-radio {
        border-color: var(--color-outline-hover);
        background: var(--color-surface-hover);
    }
    .demo-radio-label:active .demo-radio {
        border-color: var(--color-outline-pressed);
        background: var(--color-surface-pressed);
        transform: scale(0.95);
    }
`;

export function DemoRadioGroup() {
  const [v, setV] = useState('left');
  const radioStyle: React.CSSProperties = {
    appearance: 'none',
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '1px solid var(--color-outline-default)',
    background: 'var(--color-surface)',
    display: 'inline-grid',
    placeItems: 'center',
    transition: 'border-color 0.15s ease, transform 0.08s ease',
  };
  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--color-primary)'
  };
  const labelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' };

  const Radio = (val: string, label: string) => (
    <label key={val} style={labelStyle} className="demo-radio-label">
      <span style={radioStyle} className="demo-radio" aria-checked={v === val} role="radio">
        {v === val ? <span style={dotStyle} /> : null}
      </span>
      <input
        type="radio"
        name="align"
        value={val}
        checked={v === val}
        onChange={() => setV(val)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
      <style>{hoverCss}</style>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Text alignment</div>
      <div role="radiogroup" style={{ display: 'flex', gap: 16 }}>
        {Radio('left', 'Left')}
        {Radio('center', 'Center')}
        {Radio('right', 'Right')}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)' }}>Selected: {v}</div>
    </div>
  );
}
