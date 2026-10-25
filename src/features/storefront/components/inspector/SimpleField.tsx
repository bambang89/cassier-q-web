'use client';

import { TextArea, Select, Input } from '@/components/ui/Field';
import { ToggleRow, ColorInput, Labeled, Segmented, EmojiInput } from '@/features/storefront/components/inspector/fields';
import type { SimpleFieldDef } from '@/features/storefront/types';
import { ImageField } from '@/features/storefront/components/inspector/ImageField';

export function SimpleField({ field, value, onSet }: { field: SimpleFieldDef; value: unknown; onSet: (v: unknown) => void }) {
  const str = value == null ? '' : String(value);
  switch (field.kind) {
    case 'text':
    case 'url':
      return (
        <Labeled label={field.label} help={field.help}>
          <Input value={str} onChange={(e) => onSet(e.target.value)} placeholder={field.placeholder} />
        </Labeled>
      );
    case 'textarea':
      return (
        <Labeled label={field.label} help={field.help}>
          <TextArea value={str} onChange={(e) => onSet(e.target.value)} rows={4} placeholder={field.placeholder} />
        </Labeled>
      );
    case 'number':
      return (
        <Labeled label={field.label} help={field.help}>
          <div className="flex items-center gap-2">
            <Input
              value={str || '0'}
              onChange={(e) => onSet(Math.max(field.min ?? 0, Math.min(field.max ?? 9999, Number(e.target.value.replace(/\D/g, '')) || 0)))}
              inputMode="numeric"
              className="w-24"
            />
            {field.suffix ? <span className="text-[12.5px] text-ink-3">{field.suffix}</span> : null}
          </div>
        </Labeled>
      );
    case 'range':
      return (
        <Labeled label={`${field.label}: ${str || field.min}${field.suffix ?? ''}`} help={field.help}>
          <input type="range" min={field.min} max={field.max} step={field.step ?? 1} value={Number(value ?? field.min)} onChange={(e) => onSet(Number(e.target.value))} className="w-full cursor-pointer accent-primary-600" />
        </Labeled>
      );
    case 'select':
      return (
        <Labeled label={field.label} help={field.help}>
          {field.segmented ? <Segmented value={str} options={field.options} onChange={onSet} /> : <Select value={str} onChange={onSet} options={field.options} />}
        </Labeled>
      );
    case 'toggle':
      return <ToggleRow label={field.label} value={!!value} onChange={onSet} />;
    case 'image':
      return <ImageField label={field.label} value={str} onChange={onSet} />;
    case 'color':
      return (
        <Labeled label={field.label} help={field.help}>
          <ColorInput value={str} onChange={onSet} />
        </Labeled>
      );
    case 'datetime':
      return (
        <Labeled label={field.label} help={field.help}>
          <Input type="datetime-local" value={str} onChange={(e) => onSet(e.target.value)} />
        </Labeled>
      );
    case 'emoji':
      return (
        <Labeled label={field.label} help={field.help}>
          <EmojiInput value={str} onChange={onSet} />
        </Labeled>
      );
    default:
      return null;
  }
}
