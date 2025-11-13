import { useState, useEffect } from 'react';

export function DemoProgress() {
  const [v, setV] = useState(30);
  useEffect(() => {
    const id = setInterval(() => setV((n) => (n >= 100 ? 0 : n + 10)), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minWidth: 260 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>Upload progress</div>
      <div style={{
        height: 10,
        borderRadius: 999,
        background: 'var(--color-surface-variant)',
        border: '1px solid var(--color-outline-subtle)',
        overflow: 'hidden'
      }} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} role="progressbar">
        <div style={{
          height: '100%',
          width: `${v}%`,
          background: 'var(--color-primary)',
          transition: 'width .4s ease'
        }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)', marginTop: 6 }}>{v}%</div>
    </div>
  );
}
