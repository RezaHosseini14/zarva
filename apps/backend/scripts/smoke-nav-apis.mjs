/**
 * Smoke: login as demo admin and GET every nav + report API path.
 * Exit 1 if any non-200 (empty lists are OK).
 */
const API = process.env.API_URL ?? 'http://localhost:4100/api/v1';

const PATHS = [
  '/reports/sales',
  '/reports/purchases',
  '/reports/inventory',
  '/reports/gold',
  '/reports/profit',
  '/sales/invoices',
  '/sales/returns',
  '/sales/payments',
  '/sales/customers',
  '/purchases',
  '/purchases/returns',
  '/inventory',
  '/inventory/movements',
  '/inventory/warehouses',
  '/inventory/low-stock',
  '/inventory/valuation',
  '/gold/transactions',
  '/gold/rates',
  '/gold/purities',
  '/gold/lots',
  '/gold/melted',
  '/gold/raw',
  '/gold/balance',
  '/accounting/summary',
  '/accounting/ledger',
  '/workshop/orders',
  '/workshop/artisans',
  '/workshop/production',
  '/branches',
  '/commerce/channels',
  '/commerce/summary',
  '/tax/filings',
  '/jewelry/pieces',
  '/ai/insights',
  '/integrations/summary',
  '/settings/general',
  '/organization',
  '/dashboard/overview',
] ;

async function main() {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@zarva.dev', password: 'Password123!' }),
  });
  if (!loginRes.ok) {
    console.error('login failed', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const loginJson = await loginRes.json();
  const accessToken = loginJson.accessToken;
  const headers = { Authorization: `Bearer ${accessToken}` };

  let failed = 0;
  for (const path of PATHS) {
    const res = await fetch(`${API}${path}`, { headers });
    const ok = res.status === 200;
    console.log(`${res.status} ${path}`);
    if (!ok) failed += 1;
  }
  if (failed > 0) {
    console.error(`FAIL: ${failed} path(s)`);
    process.exit(1);
  }
  console.log(`OK: ${PATHS.length} paths`);
}

void main();
