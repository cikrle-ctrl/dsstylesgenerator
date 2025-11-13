import { useState } from 'react';

const hoverCss = `
    .demo-switch:hover:not(:disabled) {
        background: var(--color-primary-hover) !important;
    }
    .demo-switch:active:not(:disabled) {
        background: var(--color-primary-pressed) !important;
        transform: scale(0.98);
    }
    .demo-switch.demo-switch-off:hover:not(:disabled) {
        background: var(--color-outline-hover) !important;
    }
    .demo-switch.demo-switch-off:active:not(:disabled) {
        background: var(--color-outline-pressed) !important;
    }
`;

export function DemoSwitch() {
  const [on, setOn] = useState(true);
  const toggle = () => setOn((v) => !v);
  const track: React.CSSProperties = {
    width: 44,
    height: 24,
    borderRadius: 999,
    background: on ? 'var(--color-primary)' : 'var(--color-outline-subtle)',
    border: '1px solid var(--color-outline-subtle)',
    position: 'relative',
    transition: 'background .15s ease, transform .08s ease',
    cursor: 'pointer'
  };
  const knob: React.CSSProperties = {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'var(--color-surface)',
    position: 'absolute',
    top: 2,
    left: on ? 24 : 2,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    transition: 'left .15s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
      <style>{hoverCss}</style>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Notifications</label>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className={`demo-switch ${on ? '' : 'demo-switch-off'}`}
        style={{
          ...track,
          display: 'inline-block',
          padding: 0,
          border: 'none',
          background: on ? 'var(--color-primary)' : 'var(--color-outline-default)',
        }}
        title={on ? 'On' : 'Off'}
      >
        <span style={knob} />
      </button>
      <div style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)' }}>State: {on ? 'On' : 'Off'}</div>
    </div>
  );
}
