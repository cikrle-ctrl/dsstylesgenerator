export function DemoBadge() {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid var(--color-outline-subtle)'
  };
  const variants = [
    { label: 'Primary', style: { background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' } },
    { label: 'Secondary', style: { background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' } },
    { label: 'Success', style: { background: 'var(--color-success-container)', color: 'var(--color-on-success-container)' } },
    { label: 'Warning', style: { background: 'var(--color-warning-container)', color: 'var(--color-on-warning-container)' } },
    { label: 'Info', style: { background: 'var(--color-info-container)', color: 'var(--color-on-info-container)' } },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {variants.map(v => (
        <span key={v.label} style={{ ...base, ...v.style }}>{v.label}</span>
      ))}
    </div>
  );
}
