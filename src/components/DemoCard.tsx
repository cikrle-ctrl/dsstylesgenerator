import React from 'react';

const cardStyles: React.CSSProperties = {
    background: 'var(--color-surface)',
    color: 'var(--color-on-surface-heading)',
    border: '1px solid var(--color-outline-subtle)',
    padding: '20px',
    width: '280px',
    borderRadius: 'var(--radius-large-ui)',
    boxShadow: 'none',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
};

const textStyles: React.CSSProperties = {
    margin: 0,
    color: 'var(--color-on-surface-variant)',
    fontFamily: 'var(--font-family-base)',
    fontSize: '14px',
    lineHeight: '1.5',
};

const hoverCss = `
    .demo-card:hover { 
        background: var(--color-surface-hover) !important; 
    }
    .demo-card:active { 
        background: var(--color-surface-pressed) !important; 
    }
`;

export function DemoCard() {
    return (
        <div className="demo-card" style={cardStyles}>
            <style>{hoverCss}</style>
            <h3 style={{ 
                margin: '0 0 12px 0',
                fontFamily: 'var(--font-family-base)',
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--color-on-surface-heading)',
            }}>
                Ukázková Karta
            </h3>
            <p style={textStyles}>
                Tato karta používá sémantické tokeny pro pozadí,
                okraj a barvu textu.
            </p>
        </div>
    );
}
