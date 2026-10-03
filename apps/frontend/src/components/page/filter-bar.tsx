'use client';

import type { ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface IFilterBarProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/** Layout-only row for mixed filters — no panel/card chrome. Prefer bare FilterSearch when alone. */
export function FilterBar({ children, className }: IFilterBarProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center', className)}>
      {children}
    </div>
  );
}

interface IFilterInputProps {
  readonly placeholder: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly className?: string;
}

export function FilterSearch({ placeholder, value, onChange, className }: IFilterInputProps) {
  return (
    <Input
      className={cn('min-h-10 w-full flex-1 sm:min-w-[200px]', className)}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

interface IFilterSelectOption {
  readonly value: string;
  readonly label: string;
}

interface IFilterSelectProps {
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly options: ReadonlyArray<IFilterSelectOption>;
  readonly 'aria-label'?: string;
  readonly className?: string;
  readonly placeholder?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className,
  placeholder,
}: IFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className={cn('min-h-10 w-auto sm:min-w-[140px]', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
