import { useState, useEffect } from 'react';

export function DemoToast() {
  const [show, setShow] = useState(false);
  const trigger = () => {
    setShow(true);
    setTimeout(() => setShow(false), 3000);
  };
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <div>
      <button
        onClick={trigger}
        style={{
          padding: '10px 16px',
          background: 'var(--color-secondary)',
          color: 'var(--color-on-secondary)',
          border: 'none',
          borderRadius: 'var(--radius-base-ui)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px'
        }}
      >
        Show Toast
      </button>
      {show && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--color-inverse-surface)',
            color: 'var(--color-on-surface-inverse)',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 2000,
            animation: 'slideIn 0.2s ease'
          }}
        >
          Action completed successfully!
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
