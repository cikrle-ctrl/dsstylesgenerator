import React, { useState } from 'react';

const chipStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    fontFamily: 'var(--font-family-base)',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: 'var(--radius-base-ui)',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    border: '1px solid var(--color-outline-subtle)',
};

const hoverCss = `
    .demo-chip:hover { 
        background: var(--color-secondary-container-hover) !important;
        border-color: var(--color-secondary-container-hover) !important;
    }
    .demo-chip:active { 
        background: var(--color-secondary-container-pressed) !important;
        border-color: var(--color-secondary-container-pressed) !important;
        transform: scale(0.98); 
    }
    .demo-chip-selected:hover {
        background: var(--color-secondary-hover) !important;
        border-color: var(--color-secondary-hover) !important;
    }
    .demo-chip-selected:active {
        background: var(--color-secondary-pressed) !important;
        border-color: var(--color-secondary-pressed) !important;
    }
`;

export function DemoChip({ children }: { children: React.ReactNode }) {
    const [selected, setSelected] = useState(false);

    const dynamicStyles: React.CSSProperties = selected
        ? {
            background: 'var(--color-secondary)',
            color: 'var(--color-on-secondary)',
            borderColor: 'var(--color-secondary)'
        }
        : {
            background: 'var(--color-secondary-container)',
            color: 'var(--color-on-secondary-container)',
            borderColor: 'var(--color-outline-subtle)'
        };

    return (
        <>
            <style>{hoverCss}</style>
            <div
                className={`demo-chip ${selected ? 'demo-chip-selected' : ''}`}
                style={{ ...chipStyles, ...dynamicStyles }}
                onClick={() => setSelected((s) => !s)}
                title={selected ? 'Selected' : 'Click to select'}
            >
                {children}
            </div>
        </>
    );
}
