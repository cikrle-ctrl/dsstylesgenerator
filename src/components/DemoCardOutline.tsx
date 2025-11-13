import React, { useState } from 'react';

export function DemoCardOutline() {
    const [count, setCount] = useState(0);
    
    const cardStyles: React.CSSProperties = {
        fontFamily: 'var(--font-family-base)',
        width: '280px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-default)',
        borderRadius: 'var(--radius-large-ui)',
        padding: '20px',
        boxSizing: 'border-box',
        transition: 'background 0.12s ease, border-color 0.12s ease',
    };

    const titleStyles: React.CSSProperties = {
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--color-on-surface-heading)',
        margin: '0 0 8px 0',
    };

    const textStyles: React.CSSProperties = {
        fontSize: '14px',
        color: 'var(--color-on-surface-variant)',
        lineHeight: '1.5',
        margin: '0 0 16px 0',
    };

    const buttonStyles: React.CSSProperties = {
        fontFamily: 'var(--font-family-base)',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--color-primary)',
        background: 'transparent',
        border: 'none',
        padding: '8px 12px',
        borderRadius: 'var(--radius-base-ui)',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
    };

    return (
        <div style={cardStyles} onClick={() => setCount(count + 1)}>
            <h3 style={titleStyles}>Outlined Card</h3>
            <p style={textStyles}>
                Card with visible border and no elevation. Clicked {count} times.
            </p>
            <button style={buttonStyles} onClick={(e) => { e.stopPropagation(); setCount(count + 1); }}>
                Action
            </button>
        </div>
    );
}
