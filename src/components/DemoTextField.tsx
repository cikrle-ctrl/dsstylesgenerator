import React, { useState } from 'react';

const wrapperStyles: React.CSSProperties = {
    width: 'min(100%, 320px)',
    position: 'relative',
};

const inputStyles: React.CSSProperties = {
    fontFamily: 'var(--font-family-base)',
    fontSize: '15px',
    color: 'var(--color-on-surface-heading)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-outline-default)',
    borderRadius: 'var(--radius-base-ui)',
    padding: '20px 12px 8px 12px',
    width: '100%',
    boxSizing: 'border-box',
    caretColor: 'var(--color-primary)',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const labelStyles = (isFocused: boolean, hasValue: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-family-base)',
    fontSize: isFocused || hasValue ? '11px' : '15px',
    fontWeight: '500',
    color: isFocused ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
    position: 'absolute',
    top: isFocused || hasValue ? '6px' : '50%',
    left: '13px',
    transform: isFocused || hasValue ? 'none' : 'translateY(-50%)',
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    background: 'var(--color-surface)',
    padding: '0 2px',
});

const focusCss = `
    .demo-input:hover:not(:focus) {
        border-color: var(--color-outline-hover);
    }
    .demo-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-focus);
    }
`;

export function DemoTextField() {
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useState('');
    
    return (
        <div style={wrapperStyles}>
            <style>{focusCss}</style>
            <label style={labelStyles(focused, value.length > 0)}>Label</label>
            <input 
                type="text" 
                style={inputStyles} 
                className="demo-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </div>
    );
}
