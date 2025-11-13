import { useState } from 'react';
import { Select } from './ui/Select';

export function DemoSelect() {
  const [value, setValue] = useState('apple');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Select a fruit</label>
      <Select
        value={value}
        onChange={(v) => setValue(String(v))}
        options={[
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'orange', label: 'Orange' },
          { value: 'grape', label: 'Grape' },
        ]}
      />
      <div style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)' }}>Selected: {value}</div>
    </div>
  );
}
