'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { businessDateKey } from '@zarva/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPurchaseReturnAction } from '@/features/purchases/purchases-actions';

interface IPurchaseOption {
  readonly id: string;
  readonly number: string;
  readonly goldWeight: string;
}

interface IProps {
  readonly purchases: ReadonlyArray<IPurchaseOption>;
}

export function PurchasesReturnForm({ purchases }: IProps) {
  const t = useTranslations('modules.purchases');
  const router = useRouter();
  const [purchaseId, setPurchaseId] = useState(purchases[0]?.id ?? '');
  const [number, setNumber] = useState(() => `RET-${Date.now().toString().slice(-6)}`);
  const [grams, setGrams] = useState('');
  const [amountLabel, setAmountLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!purchaseId) {
      setError(t('returnPurchaseRequired'));
      return;
    }
    startTransition(async () => {
      const gramsN = grams ? Number(grams) : undefined;
      const res = await createPurchaseReturnAction({
        purchaseId,
        number: number.trim(),
        displayDate: businessDateKey(),
        amountLabel: amountLabel.trim() || '0',
        grams: Number.isFinite(gramsN) ? gramsN : undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (purchases.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl bg-nested/70 p-4 ring-1 ring-border/50">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        {t('returnFormTitle')}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="text-secondary">{t('cols.purchase')}</span>
          <Select value={purchaseId} onValueChange={setPurchaseId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {purchases.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.number} · {p.goldWeight}g
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-secondary">{t('cols.number')}</span>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-secondary">{t('returnGrams')}</span>
          <Input
            className="zarva-num"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder={t('returnGramsPh')}
          />
        </label>
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="text-secondary">{t('cols.amount')}</span>
          <Input
            value={amountLabel}
            onChange={(e) => setAmountLabel(e.target.value)}
          />
        </label>
        <div className="flex items-end sm:col-span-2">
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={handleSubmit}
          >
            {pending ? t('returnSubmitting') : t('returnSubmit')}
          </Button>
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
