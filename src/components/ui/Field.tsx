'use client';

import { forwardRef, useState } from 'react';
import type { ReactNode, TextareaHTMLAttributes } from 'react';

import type { InputProps, SelectProps, FormControlProps } from '@/types/ui';
import { cn } from '@/utils/cn';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons/ActionIcons';

const FIELD_BASE =
  'flex min-h-[50px] items-center gap-1.5 rounded-md border-[1.5px] border-gray-300 bg-white px-3 shadow-md transition focus-within:border-2 focus-within:border-primary-600';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { isInvalid, leftElement, rightElement, className, wrapperClassName, disabled, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        FIELD_BASE,
        isInvalid && 'border-error-600 focus-within:border-error-600',
        disabled && 'bg-gray-50 opacity-60',
        wrapperClassName,
      )}
    >
      {leftElement}
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          'min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-3',
          className,
        )}
        {...rest}
      />
      {rightElement}
    </div>
  );
});

export function PasswordInput(props: Omit<InputProps, 'type' | 'rightElement'>) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="cursor-pointer p-1 text-gray-500"
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      }
    />
  );
}

export function TextArea({
  isInvalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { isInvalid?: boolean }) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-md border-[1.5px] border-gray-300 bg-white px-3 py-3 text-base text-ink shadow-md outline-none transition placeholder:text-ink-3 focus:border-2 focus:border-primary-600',
        isInvalid && 'border-error-600',
        className,
      )}
      {...rest}
    />
  );
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  isInvalid,
  className,
  ...rest
}: SelectProps<T>) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          'min-h-[46px] w-full cursor-pointer appearance-none rounded-md border border-line bg-white py-2.5 pr-9 pl-3 text-base outline-none transition focus:border-primary-600',
          value ? 'text-ink' : 'text-ink-3',
          isInvalid && 'border-error-600',
          className,
        )}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-3">▾</span>
    </div>
  );
}

export function FormControl({ label, helperText, errorText, isInvalid, isRequired, className, children }: FormControlProps) {
  const showError = isInvalid && !!errorText;
  return (
    <label className={cn('mb-4 block', className)}>
      {label ? (
        <span className="mb-1 block text-base font-semibold text-ink">
          {label}
          {isRequired ? <span className="text-error-600"> *</span> : null}
        </span>
      ) : null}
      {children}
      {showError ? (
        <span className="mt-1 block text-sm text-error-600">{errorText}</span>
      ) : helperText ? (
        <span className="mt-1 block text-sm text-ink-2">{helperText}</span>
      ) : null}
    </label>
  );
}

export function Switch({
  value,
  onChange,
  disabled,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        value ? 'bg-primary-400' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full shadow transition-transform',
          value ? 'translate-x-6 bg-primary-600' : 'translate-x-1 bg-gray-50',
        )}
      />
    </button>
  );
}

export function CheckBox({
  value,
  onChange,
  label,
  disabled,
  isInvalid,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  isInvalid?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className="flex cursor-pointer items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-sm border-2 bg-white',
          value ? 'border-primary-600 bg-primary-600' : isInvalid ? 'border-error-600' : 'border-gray-300',
        )}
      >
        {value ? <span className="mb-0.5 h-1.5 w-2.5 -rotate-45 border-b-2 border-l-2 border-white" /> : null}
      </span>
      {label ? <span className="text-base text-ink">{label}</span> : null}
    </button>
  );
}
