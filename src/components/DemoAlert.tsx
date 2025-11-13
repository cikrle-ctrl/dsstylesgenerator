export function DemoAlert() {
  type Kind = 'info'|'success'|'warning'|'error';
  const box = (title: string, desc: string, kind: Kind) => {
    const map: Record<Kind, {bg: string; fg: string; bd?: string}> = {
      info: { bg: 'var(--color-info-container)', fg: 'var(--color-on-info-container)' },
      success: { bg: 'var(--color-success-container)', fg: 'var(--color-on-success-container)' },
      warning: { bg: 'var(--color-warning-container)', fg: 'var(--color-on-warning-container)' },
      error: { bg: 'var(--color-error-container)', fg: 'var(--color-on-error-container)' },
    };
    const t = map[kind];
    return (
      <div key={kind} style={{
        background: t.bg,
        color: t.fg,
        border: '1px solid var(--color-outline-subtle)',
        borderRadius: 8,
        padding: 12,
        minWidth: 220
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13 }}>{desc}</div>
      </div>
    );
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {box('Info', 'Helpful contextual note.', 'info')}
      {box('Success', 'Action completed successfully.', 'success')}
      {box('Warning', 'Please double-check your settings.', 'warning')}
      {box('Error', 'Something went wrong.', 'error')}
    </div>
  );
}
