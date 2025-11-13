import { useState } from 'react';

export function DemoModal() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
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
        Open Modal
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-backdrop)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 12,
              padding: 24,
              width: 320,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-outline-subtle)'
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: 'var(--color-on-surface-heading)' }}>
              Modal Title
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
              This is a modal dialog with some example content.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--color-outline-default)',
                  borderRadius: 'var(--radius-base-ui)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--color-on-surface-heading)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-base-ui)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
