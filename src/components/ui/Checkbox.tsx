import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import './Checkbox.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, description, disabled }: CheckboxProps) {
  const toggle = useCallback(() => {
    if (!disabled) onChange(!checked);
  }, [checked, disabled, onChange]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="cbx">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        className={[
          'cbx__box',
          checked ? 'cbx__box--checked' : '',
          disabled ? 'cbx__box--disabled' : ''
        ].join(' ')}
        onClick={toggle}
        onKeyDown={onKeyDown}
        disabled={disabled}
      >
        {checked && <Check size={18} />}
      </button>
      {(label || description) && (
        <div className="cbx__text" onClick={toggle}>
          {label && <div className="cbx__label">{label}</div>}
          {description && <div className="cbx__desc">{description}</div>}
        </div>
      )}
    </div>
  );
}
