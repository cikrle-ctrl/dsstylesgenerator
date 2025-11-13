import { ChevronRight } from 'lucide-react';

export function DemoBreadcrumb() {
  const items = ['Home', 'Products', 'Electronics', 'Headphones'];
  return (
    <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              color: i === items.length - 1 ? 'var(--color-on-surface-heading)' : 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: i === items.length - 1 ? 600 : 400
            }}
          >
            {item}
          </a>
          {i < items.length - 1 && <ChevronRight size={16} style={{ color: 'var(--color-on-surface-subtle)' }} />}
        </span>
      ))}
    </nav>
  );
}
