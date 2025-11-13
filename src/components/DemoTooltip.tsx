import { useState } from 'react';

export function DemoTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{
          padding: '10px 16px',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          borderRadius: 'var(--radius-base-ui)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px'
        }}
      >
        Hover me
      </button>
      {show && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-inverse-surface)',
            color: 'var(--color-on-surface-inverse)',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          This is a tooltip
        </div>
      )}
    </div>
  );
}
