import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

export const Button = ({
    variant = 'primary',
    size = 'medium',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const classNames = [
        'custom-button',
        `custom-button--${variant}`,
        `custom-button--${size}`,
        fullWidth ? 'custom-button--full-width' : '',
        disabled ? 'custom-button--disabled' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled}
            {...props}
        >
            {icon && iconPosition === 'left' && (
                <span className="custom-button__icon custom-button__icon--left">
                    {icon}
                </span>
            )}
            {children && <span className="custom-button__text">{children}</span>}
            {icon && iconPosition === 'right' && (
                <span className="custom-button__icon custom-button__icon--right">
                    {icon}
                </span>
            )}
        </button>
    );
};
