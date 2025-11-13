import './RadioGroup.css';

interface RadioOption {
    value: string;
    label: string;
    description?: string;
}

interface RadioGroupProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: RadioOption[];
}

export function RadioGroup({ name, value, onChange, options }: RadioGroupProps) {
    return (
        <div className="radio-group">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={`radio-group__option ${value === option.value ? 'radio-group__option--selected' : ''}`}
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        className="radio-group__input"
                    />
                    <div className="radio-group__indicator" />
                    <div className="radio-group__content">
                        <div className="radio-group__label">{option.label}</div>
                        {option.description && (
                            <div className="radio-group__description">{option.description}</div>
                        )}
                    </div>
                </label>
            ))}
        </div>
    );
}
