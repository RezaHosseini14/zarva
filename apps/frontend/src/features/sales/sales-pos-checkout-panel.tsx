'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { MoneyText } from '@/components/business/metrics';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  checkoutSaleAction,
  createSaleInvoiceAction,
} from '@/features/sales/sales-actions';
import type { IPosCartLine } from '@/features/sales/sales-pos-cart-panel';
import { POS_ICON_TILE, POS_PANEL } from '@/features/sales/sales-pos-layout';
import { cn } from '@/lib/utils';
import type {
  IGoldLockedRate,
  ISaleCustomer,
  SaleDocumentKind,
  SalePaymentMethod,
} from '@zarva/shared';

interface IPayRow {
  readonly id: string;
  readonly method: SalePaymentMethod;
  readonly amountIrt: number;
}

interface IProps {
  readonly customers: ReadonlyArray<ISaleCustomer>;
  readonly lines: ReadonlyArray<IPosCartLine>;
  readonly lockedRate: IGoldLockedRate | null;
  readonly customerSmsEnabled?: boolean;
  readonly onCleared: () => void;
}

export function SalesPosCheckoutPanel({
  customers,
  lines,
  lockedRate,
  customerSmsEnabled = false,
  onCleared,
}: IProps) {
  const t = useTranslations('modules.sales');
  const locale = useLocale();
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [kind, setKind] = useState<SaleDocumentKind>('sale');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [payments, setPayments] = useState<IPayRow[]>([]);

  const rateForKind =
    lockedRate == null
      ? 0
      : kind === 'buyback'
        ? lockedRate.buyRateIrt
        : lockedRate.sellRateIrt;

  const pricedTotal = useMemo(() => {
    return lines.reduce((s, l) => {
      const gold = Math.round(
        l.weightGrams * (rateForKind || l.rateIrt) * (l.purityKarat / 24),
      );
      return s + gold + l.wageIrt + l.profitIrt + l.taxIrt - l.discountIrt;
    }, 0);
  }, [lines, rateForKind]);

  const taxTotal = useMemo(
    () => lines.reduce((s, l) => s + l.taxIrt, 0),
    [lines],
  );

  const payRows =
    payments.length > 0
      ? payments
      : [
          {
            id: 'default',
            method: 'cash' as const,
            amountIrt: pricedTotal,
          },
        ];

  function handlePay() {
    setError(null);
    if (!lockedRate) {
      setError(t('posRateRequired'));
      return;
    }
    if (!customerId) {
      setError(t('posCustomerRequired'));
      return;
    }
    if (lines.length === 0) {
      setError(t('posCartEmpty'));
      return;
    }

    startTransition(async () => {
      const number = `POS-${Date.now().toString().slice(-8)}`;
      const clientRequestId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `req-${Date.now()}`;
      const res = await checkoutSaleAction({
        customerId,
        number,
        documentKind: kind,
        displayDate: lockedRate.businessDate,
        clientRequestId,
        lines: lines.map((l) => ({
          description: l.name,
          weightGrams: l.weightGrams,
          purityKarat: l.purityKarat,
          rateIrt: rateForKind || l.rateIrt,
          wageIrt: l.wageIrt,
          profitIrt: l.profitIrt,
          taxIrt: l.taxIrt,
          discountIrt: l.discountIrt,
        })),
        payments: payRows.map((p, i) => ({
          ref: `PAY-${number}-${i + 1}`,
          method: p.method,
          amountIrt: p.amountIrt > 0 ? p.amountIrt : pricedTotal,
        })),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onCleared();
      router.push(
        `/${locale}/sales/invoices/${res.result.invoice.id}/print`,
      );
      router.refresh();
    });
  }

  function handleDraft() {
    setError(null);
    if (!customerId || lines.length === 0) {
      setError(t('posCartEmpty'));
      return;
    }
    startTransition(async () => {
      const number = `DRF-${Date.now().toString().slice(-8)}`;
      const created = await createSaleInvoiceAction({
        customerId,
        number,
        documentKind: kind,
        confirm: false,
        displayDate: lockedRate?.businessDate,
        lines: lines.map((l) => ({
          description: l.name,
          weightGrams: l.weightGrams,
          purityKarat: l.purityKarat,
          rateIrt: rateForKind || l.rateIrt,
          wageIrt: l.wageIrt,
          profitIrt: l.profitIrt,
          taxIrt: l.taxIrt,
          discountIrt: l.discountIrt,
        })),
      });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      onCleared();
      router.push(`/${locale}/sales/invoices/${created.invoice.id}`);
      router.refresh();
    });
  }

  return (
    <aside className={cn(POS_PANEL, 'lg:col-span-5')}>
      <header className="mb-4 flex items-center gap-3">
        <span
          className={cn(POS_ICON_TILE, 'bg-success/15 text-success ring-success/25')}
        >
          <Icon name="wallet-money-bold" className="text-lg" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-none text-foreground">
            {t('posCheckout')}
          </h3>
          <p className="mt-1.5 text-[11px] font-medium leading-none text-secondary">
            {lockedRate
              ? t('posRateLocked', {
                  buy: lockedRate.buyRateIrt,
                  sell: lockedRate.sellRateIrt,
                })
              : t('posRateMissing')}
          </p>
        </div>
      </header>

      {customerSmsEnabled ? null : (
        <p className="mb-3 text-[11px] leading-snug text-muted-fg">{t('posCustomerSmsOff')}</p>
      )}

      <div className="space-y-3">
        <label className="block space-y-1.5 text-sm">
          <span className="text-secondary">{t('posDocumentKind')}</span>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as SaleDocumentKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">{t('posKindSale')}</SelectItem>
              <SelectItem value="buyback">{t('posKindBuyback')}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="text-secondary">{t('cols.customer')}</span>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder={t('posCustomerPh')} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} · {c.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-secondary">{t('posPayments')}</span>
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() =>
                setPayments([
                  ...payRows.filter((p) => p.id !== 'default'),
                  {
                    id: `pay-${payRows.length + 1}`,
                    method: 'card',
                    amountIrt: 0,
                  },
                ])
              }
            >
              {t('posAddPayment')}
            </Button>
          </div>
          {payRows.map((p, idx) => (
            <div key={p.id} className="grid grid-cols-2 gap-2">
              <Select
                value={p.method}
                onValueChange={(v) => {
                  const method = v as SalePaymentMethod;
                  setPayments((prev) => {
                    const base =
                      prev.length > 0 ? prev : [{ ...p, id: 'p0' }];
                    return base.map((row, i) =>
                      i === idx ? { ...row, method } : row,
                    );
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('posPayCash')}</SelectItem>
                  <SelectItem value="card">{t('posPayCard')}</SelectItem>
                  <SelectItem value="transfer">{t('posPayTransfer')}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="zarva-num"
                value={String(p.amountIrt || '')}
                onChange={(e) => {
                  const amountIrt = Number(e.target.value) || 0;
                  setPayments((prev) => {
                    const base =
                      prev.length > 0
                        ? prev
                        : [{ id: 'p0', method: p.method, amountIrt: pricedTotal }];
                    return base.map((row, i) =>
                      i === idx ? { ...row, amountIrt } : row,
                    );
                  });
                }}
                aria-label={t('posPaymentAmount')}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-4">
        <div className="rounded-xl bg-nested/70 p-3.5 ring-1 ring-border/50">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-secondary">{t('posSubtotal')}</span>
            <span className="zarva-num font-medium tabular-nums">
              <MoneyText value={String(pricedTotal - taxTotal)} />
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3 text-sm">
            <span className="text-secondary">{t('posTax')}</span>
            <span className="zarva-num tabular-nums">
              <MoneyText value={String(taxTotal)} />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-primary/15 pt-3">
            <span className="text-sm font-semibold text-foreground">
              {t('posTotal')}
            </span>
            <span className="zarva-num text-xl font-bold tabular-nums tracking-tight text-primary">
              <MoneyText value={String(pricedTotal)} />
            </span>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-12 text-sm font-semibold"
            disabled={pending || lines.length === 0}
            onClick={handleDraft}
          >
            {t('posSaveDraft')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-12 text-sm font-semibold"
            disabled={pending || lines.length === 0}
            onClick={handlePay}
          >
            <Icon name="hand-money-bold" className="text-lg" />
            {pending ? t('posPaying') : t('posPay')}
          </Button>
        </div>
      </div>
    </aside>
  );
}
