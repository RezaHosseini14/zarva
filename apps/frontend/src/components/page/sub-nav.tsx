'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ISubNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon?: IconName;
}

interface ISubNavProps {
  readonly items: ReadonlyArray<ISubNavItem>;
  readonly className?: string;
}

const HREF_ICONS: ReadonlyArray<readonly [string, IconName]> = [
  ['/sales/new', 'shop-linear'],
  ['/sales/returns', 'refresh-linear'],
  ['/sales/payments', 'card-linear'],
  ['/sales', 'document-text-linear'],
  ['/purchases/new', 'add-circle-linear'],
  ['/purchases/returns', 'refresh-linear'],
  ['/purchases', 'clipboard-list-linear'],
  ['/customers/receivables', 'hand-money-linear'],
  ['/suppliers/payables', 'dollar-linear'],
  ['/customers', 'users-group-rounded-linear'],
  ['/suppliers', 'delivery-linear'],
  ['/workshop/production', 'settings-minimalistic-linear'],
  ['/workshop/artisans', 'users-group-rounded-linear'],
  ['/workshop', 'clipboard-list-linear'],
  ['/accounting/rial-ledger', 'notes-linear'],
  ['/accounting/cash-bank', 'wallet-money-linear'],
  ['/accounting/income', 'graph-up-linear'],
  ['/accounting/expenses', 'bill-list-linear'],
  ['/accounting/receivables', 'hand-money-linear'],
  ['/accounting/payables', 'dollar-linear'],
  ['/accounting/transactions', 'transfer-horizontal-linear'],
  ['/accounting', 'widget-2-linear'],
  ['/gold/rates', 'chart-linear'],
  ['/gold/transactions', 'transfer-horizontal-linear'],
  ['/gold/ledger', 'notes-linear'],
  ['/gold/balance', 'scale-linear'],
  ['/gold/raw', 'layers-minimalistic-linear'],
  ['/gold/melted', 'flame-linear'],
  ['/gold/lots', 'box-linear'],
  ['/gold/purities', 'medal-star-linear'],
  ['/gold/calculator', 'calculator-linear'],
  ['/gold', 'crown-star-linear'],
  ['/inventory/products', 'box-linear'],
  ['/inventory/movements', 'transfer-horizontal-linear'],
  ['/inventory/warehouses', 'buildings-2-linear'],
  ['/inventory/low-stock', 'danger-triangle-linear'],
  ['/inventory/valuation', 'dollar-linear'],
  ['/inventory/adjustments', 'settings-linear'],
  ['/inventory/barcodes', 'barcode-linear'],
  ['/inventory', 'widget-2-linear'],
  ['/notifications/sent', 'inbox-out-linear'],
  ['/notifications', 'inbox-in-linear'],
];

function resolveIcon(href: string, explicit?: IconName): IconName {
  if (explicit) return explicit;
  for (const [prefix, icon] of HREF_ICONS) {
    if (href === prefix) return icon;
  }
  if (/\/(customers|suppliers)\/[^/]+$/.test(href)) return 'user-linear';
  if (href.includes('/receivables') || href.includes('/balances')) return 'hand-money-linear';
  if (href.includes('/payables')) return 'dollar-linear';
  return 'clipboard-list-linear';
}

/** Route tabs — glass border + outline Solar icons per route. */
export function SubNav({ items, className }: ISubNavProps) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav data-slot="tabs-list" className={cn('zarva-tabs-list mb-4', className)}>
      {items.map((item) => {
        const href = `/${locale}${item.href}`;
        const isActive =
          pathname === href ||
          (item.href.split('/').length > 2 && pathname.startsWith(`${href}/`));
        const icon = resolveIcon(item.href, item.icon);
        return (
          <Link
            key={item.href}
            href={href}
            data-slot="tabs-trigger"
            data-active={isActive ? 'true' : undefined}
            className="zarva-tabs-trigger"
          >
            <Icon name={icon} className="zarva-tabs-trigger-icon" />
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
