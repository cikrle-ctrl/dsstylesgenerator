import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

export interface AccordionProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    defaultExpanded?: boolean;
}

export const Accordion = ({ title, icon, children, defaultExpanded = false }: AccordionProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="accordion">
            <button
                className="accordion__header"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <div className="accordion__title">
                    {icon && <span className="accordion__icon">{icon}</span>}
                    <span className="accordion__title-text">{title}</span>
                </div>
                <ChevronDown
                    size={18}
                    className={`accordion__chevron ${isExpanded ? 'accordion__chevron--expanded' : ''}`}
                />
            </button>
            <div className={`accordion__content ${isExpanded ? 'accordion__content--expanded' : ''}`}>
                <div className="accordion__content-inner">
                    {children}
                </div>
            </div>
        </div>
    );
};
