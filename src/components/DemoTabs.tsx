import { useState } from 'react';

const hoverCss = `
    .demo-tab-button:hover {
        background: var(--color-surface-hover) !important;
    }
    .demo-tab-button:active {
        background: var(--color-surface-pressed) !important;
    }
`;

export function DemoTabs() {
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'billing', label: 'Billing' },
  ];
  const [active, setActive] = useState('general');
  return (
    <div style={{ minWidth: 320 }}>
      <style>{hoverCss}</style>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-outline-subtle)', marginBottom: 12 }} role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className="demo-tab-button"
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 0,
              color: active === t.id ? 'var(--color-on-surface-heading)' : 'var(--color-on-surface-variant)',
              borderBottom: active === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '-2px',
              transition: 'color 0.15s ease, border-color 0.15s ease, background 0.12s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
        {active === 'general' && 'General settings content'}
        {active === 'security' && 'Security preferences content'}
        {active === 'billing' && 'Billing details content'}
      </div>
    </div>
  );
}
