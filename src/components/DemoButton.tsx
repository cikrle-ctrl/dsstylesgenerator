import React, { useState } from 'react';

const buttonStyles: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    padding: '12px 20px',
    cursor: 'pointer',
    borderRadius: 'var(--radius-base-ui)',
    boxShadow: 'none',
    fontFamily: 'var(--font-family-base)',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background 0.15s ease, color 0.15s ease, transform 0.08s ease',
    marginRight: '12px',
};

const buttonHoverStyles = `
    .demo-button {
        outline: none;
    }
    .demo-button:hover:not(:disabled) {
        background: var(--color-primary-hover) !important;
        color: var(--color-on-primary-hover) !important;
    }
    .demo-button:active:not(:disabled) {
        background: var(--color-primary-pressed) !important;
        color: var(--color-on-primary-pressed) !important;
        transform: scale(0.98);
    }
    .demo-button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }
    .demo-button:disabled {
        background: var(--color-disabled) !important;
        color: var(--color-on-disabled) !important;
        cursor: not-allowed;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .demo-button-loading .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
`;

export function DemoButton() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleLoadingClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setCount(count + 1);
        }, 2000);
    };

    return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <style>{buttonHoverStyles}</style>
            <button style={buttonStyles} className="demo-button" onClick={() => setCount(count + 1)}>
                Clicked {count} times
            </button>
            <button style={buttonStyles} className="demo-button" disabled>
                Disabled
            </button>
            <button 
                style={buttonStyles} 
                className="demo-button demo-button-loading" 
                disabled={loading}
                onClick={handleLoadingClick}
            >
                {loading && <span className="spinner" />}
                {loading ? 'Loading...' : 'Load'}
            </button>
        </div>
    );
}
