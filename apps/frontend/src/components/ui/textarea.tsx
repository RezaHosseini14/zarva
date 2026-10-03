import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('zarva-glass-input min-h-24 w-full px-3 py-2 text-sm', className)}
      {...props}
    />
  );
}

export { Textarea };
