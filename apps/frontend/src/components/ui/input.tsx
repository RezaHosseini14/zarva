import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn('zarva-glass-input min-h-11 w-full px-3 text-sm', className)}
      {...props}
    />
  );
}

export { Input };
