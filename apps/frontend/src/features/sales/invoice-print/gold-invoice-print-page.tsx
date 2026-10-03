'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { ISaleInvoiceDetailDto } from '@zarva/shared';
import { useResolveMoney } from '@/features/settings/use-resolve-money';
import { useWeightUnitLabel } from '@/features/settings/use-resolve-weight';

import { GoldInvoiceDocument, type IGoldInvoiceLabels } from './gold-invoice-document';
import { mapInvoiceMoneyUnits } from './map-invoice-money-units';

import './gold-invoice-print.css';

interface IProps {
  readonly invoice: ISaleInvoiceDetailDto;
  readonly autoPrint?: boolean;
}

export function GoldInvoicePrintPage({ invoice: raw, autoPrint = false }: IProps) {
  const t = useTranslations('modules.sales.print');
  const locale = useLocale();
  const resolveMoney = useResolveMoney();
  const gramsLabel = useWeightUnitLabel();
  const invoice = mapInvoiceMoneyUnits(raw, resolveMoney);

  const labels: IGoldInvoiceLabels = {
    shopPhone: t('shopPhone'),
    guildId: t('guildId'),
    documentTitle: t('documentTitle'),
    invoiceNumber: t('invoiceNumber'),
    date: t('date'),
    customer: t('customer'),
    phone: t('phone'),
    nationalId: t('nationalId'),
    seller: t('seller'),
    row: t('cols.row'),
    description: t('cols.description'),
    weight: t('cols.weight'),
    purity: t('cols.purity'),
    dailyRate: t('cols.dailyRate'),
    goldValue: t('cols.goldValue'),
    wage: t('cols.wage'),
    profit: t('cols.profit'),
    tax: t('cols.tax'),
    lineTotal: t('cols.lineTotal'),
    totalWeight: t('totalWeight'),
    grandTotal: t('grandTotal'),
    amountInWords: t('amountInWords'),
    grams: gramsLabel,
    warranty: t('warranty'),
    buyerSign: t('buyerSign'),
    sellerSign: t('sellerSign'),
  };

  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <div className="gold-invoice-print-root">
      <div className="gold-invoice-toolbar">
        <button type="button" className="gi-btn-primary" onClick={() => window.print()}>
          {t('print')}
        </button>
        <Link href={`/${locale}/sales/invoices/${raw.id}`} className="gi-btn-secondary">
          {t('back')}
        </Link>
      </div>
      <GoldInvoiceDocument invoice={invoice} labels={labels} />
    </div>
  );
}
