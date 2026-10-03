import { Shimmer } from '@/components/page/skeleton-primitives';
import { Icon } from '@/components/ui/icon';
import { POS_ICON_TILE, POS_PANEL } from '@/features/sales/sales-pos-layout';
import { cn } from '@/lib/utils';

interface ISalesPosBodySkeletonProps {
  readonly scanPlaceholder: string;
  readonly addLabel: string;
  readonly cartTitle: string;
  readonly cartCount: string;
  readonly checkoutTitle: string;
  readonly checkoutHint: string;
  readonly customerLabel: string;
  readonly customerPlaceholder: string;
  readonly subtotalLabel: string;
  readonly taxLabel: string;
  readonly totalLabel: string;
  readonly payLabel: string;
}

/** Mirrors cart + checkout panels — same shell height and chrome. */
export function SalesPosBodySkeleton({
  scanPlaceholder,
  addLabel,
  cartTitle,
  cartCount,
  checkoutTitle,
  checkoutHint,
  customerLabel,
  customerPlaceholder,
  subtotalLabel,
  taxLabel,
  totalLabel,
  payLabel,
}: ISalesPosBodySkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-busy="true">
      <section className={cn(POS_PANEL, 'lg:col-span-7')}>
        <header className="mb-4 flex items-center gap-3">
          <span className={cn(POS_ICON_TILE, 'bg-primary/15 text-primary ring-primary/25')}>
            <Icon name="cart-large-2-bold" className="text-lg" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-none text-foreground">{cartTitle}</h3>
            <p className="mt-1.5 text-[11px] font-medium leading-none text-secondary">
              {cartCount}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Icon
              name="barcode-bold"
              className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-base text-muted-fg"
            />
            <div
              className="zarva-glass-input flex min-h-11 w-full items-center ps-10 pe-3 text-sm text-muted-fg"
              aria-hidden
            >
              {scanPlaceholder}
            </div>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary/70 px-5 text-sm font-semibold text-primary-foreground opacity-80">
            <Icon name="add-circle-bold" className="text-base" />
            {addLabel}
          </span>
        </div>

        <div className="zarva-scrollbar mt-4 min-h-0 flex-1 space-y-1.5 overflow-auto">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-nested/60 px-3 py-2.5 ring-1 ring-border/50"
              aria-hidden
            >
              <Shimmer className="size-9 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Shimmer className="h-3.5 w-[70%] max-w-[14rem]" />
                <Shimmer className="h-2.5 w-24" />
              </div>
              <Shimmer className="h-3.5 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      <aside className={cn(POS_PANEL, 'lg:col-span-5')}>
        <header className="mb-4 flex items-center gap-3">
          <span className={cn(POS_ICON_TILE, 'bg-success/15 text-success ring-success/25')}>
            <Icon name="wallet-money-bold" className="text-lg" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-none text-foreground">
              {checkoutTitle}
            </h3>
            <p className="mt-1.5 text-[11px] font-medium leading-none text-secondary">
              {checkoutHint}
            </p>
          </div>
        </header>

        <label className="block space-y-1.5 text-sm">
          <span className="text-secondary">{customerLabel}</span>
          <div className="relative">
            <Icon
              name="user-bold"
              className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-base text-muted-fg"
            />
            <div
              className="zarva-glass-input flex min-h-11 w-full items-center ps-10 pe-3 text-sm text-muted-fg"
              aria-hidden
            >
              {customerPlaceholder}
            </div>
          </div>
        </label>

        <div className="mt-auto space-y-3 pt-4">
          <div className="rounded-xl bg-nested/70 p-3.5 ring-1 ring-border/50">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-secondary">{subtotalLabel}</span>
              <Shimmer className="h-3.5 w-24" />
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-3 text-sm">
              <span className="text-secondary">{taxLabel}</span>
              <Shimmer className="h-3.5 w-8" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-primary/15 pt-3">
              <span className="text-sm font-semibold text-foreground">{totalLabel}</span>
              <Shimmer className="h-6 w-28" />
            </div>
          </div>
          <span className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary/70 text-sm font-semibold text-primary-foreground opacity-80">
            <Icon name="hand-money-bold" className="text-lg" />
            {payLabel}
          </span>
        </div>
      </aside>
    </div>
  );
}
