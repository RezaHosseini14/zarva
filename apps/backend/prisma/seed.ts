import {
  ALL_PERMISSION_KEYS,
  SIDEBAR_NAV_SEED,
  type IPlanEntitlements,
} from '@zarva/shared';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const FULL_NAV_MODULES = [
  'dashboard',
  'sales',
  'purchases',
  'inventory',
  'gold',
  'customers',
  'suppliers',
  'accounting',
  'reports',
  'workshop',
  'settings',
  'integrations',
  'branches',
  'commerce',
  'tax',
  'jewelry',
  'ai',
] as const;

const TRIAL: IPlanEntitlements = {
  maxUsers: 3,
  maxBranches: 1,
  maxStorageMb: 500,
  modules: [...FULL_NAV_MODULES],
  features: [],
  trialDays: 14,
  graceDaysPastDue: 3,
};

const STARTER: IPlanEntitlements = {
  maxUsers: 5,
  maxBranches: 1,
  maxStorageMb: 2048,
  modules: [...FULL_NAV_MODULES],
  features: ['export.csv'],
  trialDays: 0,
  graceDaysPastDue: 3,
};

const PROFESSIONAL: IPlanEntitlements = {
  maxUsers: 20,
  maxBranches: 5,
  maxStorageMb: 10240,
  modules: [...FULL_NAV_MODULES],
  features: ['export.csv', 'theme.custom', 'audit.advanced'],
  trialDays: 0,
  graceDaysPastDue: 7,
};

const ENTERPRISE: IPlanEntitlements = {
  maxUsers: 200,
  maxBranches: 50,
  maxStorageMb: 102400,
  modules: ['*'],
  features: ['export.csv', 'theme.custom', 'audit.advanced', 'api.access'],
  trialDays: 0,
  graceDaysPastDue: 14,
};

async function main(): Promise<void> {
  for (const key of ALL_PERMISSION_KEYS) {
    const module = key.split('.')[0] ?? 'general';
    await prisma.permission.upsert({
      where: { key },
      create: { key, module },
      update: { module },
    });
  }

  const allPerms = await prisma.permission.findMany();

  const systemRoles: Array<{ name: string; all: boolean; keys?: string[] }> = [
    { name: 'PLATFORM_ADMIN', all: true },
    { name: 'SUPER_ADMIN', all: true },
    {
      name: 'ORG_ADMIN',
      all: false,
      keys: allPerms
        .map((p) => p.key)
        .filter((k) => k !== 'notifications.send.critical'),
    },
    {
      name: 'BRANCH_MANAGER',
      all: false,
      keys: allPerms
        .map((p) => p.key)
        .filter(
          (k) =>
            !k.startsWith('roles.') &&
            k !== 'notifications.send.high' &&
            k !== 'notifications.send.critical',
        ),
    },
    {
      name: 'ACCOUNTANT',
      all: false,
      keys: [
        'dashboard.read',
        'accounting.read',
        'accounting.create',
        'accounting.update',
        'reports.read',
        'reports.export',
        'customers.read',
        'suppliers.read',
        'notifications.read',
      ],
    },
    {
      name: 'CASHIER',
      all: false,
      keys: [
        'dashboard.read',
        'sales.read',
        'sales.create',
        'customers.read',
        'customers.create',
        'inventory.read',
        'gold.read',
        'reports.read',
        'accounting.read',
        'notifications.read',
      ],
    },
    {
      name: 'INVENTORY_CLERK',
      all: false,
      keys: [
        'dashboard.read',
        'inventory.read',
        'inventory.create',
        'inventory.update',
        'inventory.adjust',
        'gold.read',
        'purchases.read',
        'workshop.read',
        'notifications.read',
      ],
    },
    {
      name: 'VIEWER',
      all: false,
      keys: [
        'dashboard.read',
        'sales.read',
        'purchases.read',
        'inventory.read',
        'gold.read',
        'customers.read',
        'suppliers.read',
        'accounting.read',
        'reports.read',
        'workshop.read',
        'jewelry.read',
        'tax.read',
        'ai.read',
        'commerce.read',
        'branches.read',
        'integrations.read',
        'notifications.read',
      ],
    },
  ];

  for (const roleDef of systemRoles) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      create: { name: roleDef.name, isSystem: true },
      update: { isSystem: true },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const keys = roleDef.all ? allPerms.map((p) => p.key) : (roleDef.keys ?? []);
    const perms = allPerms.filter((p) => keys.includes(p.key));
    if (perms.length) {
      await prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }
  }

  const plans = [
    { code: 'trial', name: 'Trial', entitlements: TRIAL, prices: [] as Array<{ interval: string; amountCents: number }> },
    {
      code: 'starter',
      name: 'Starter',
      entitlements: STARTER,
      prices: [
        { interval: 'month', amountCents: 4900 },
        { interval: 'year', amountCents: 49000 },
      ],
    },
    {
      code: 'professional',
      name: 'Professional',
      entitlements: PROFESSIONAL,
      prices: [
        { interval: 'month', amountCents: 14900 },
        { interval: 'year', amountCents: 149000 },
      ],
    },
    {
      code: 'enterprise',
      name: 'Enterprise',
      entitlements: ENTERPRISE,
      prices: [
        { interval: 'month', amountCents: 39900 },
        { interval: 'year', amountCents: 399000 },
      ],
    },
  ];

  for (const plan of plans) {
    const row = await prisma.plan.upsert({
      where: { code: plan.code },
      create: {
        code: plan.code,
        name: plan.name,
        entitlements: plan.entitlements as object,
      },
      update: {
        name: plan.name,
        entitlements: plan.entitlements as object,
      },
    });
    await prisma.planPrice.deleteMany({ where: { planId: row.id } });
    for (const price of plan.prices) {
      await prisma.planPrice.create({
        data: {
          planId: row.id,
          interval: price.interval,
          amountCents: price.amountCents,
          currency: 'usd',
        },
      });
    }
  }

  const superAdmin = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });
  const cashierRole = await prisma.role.findUniqueOrThrow({ where: { name: 'CASHIER' } });
  const enterprise = await prisma.plan.findUniqueOrThrow({ where: { code: 'enterprise' } });
  const passwordHash = await argon2.hash('Password123!');

  const demo = await prisma.organization.upsert({
    where: { slug: 'demo-zarva' },
    create: {
      name: 'Demo Zarva',
      slug: 'demo-zarva',
      users: {
        create: [
          {
            email: 'admin@zarva.dev',
            phone: '09120000001',
            address: 'تهران، خیابان ولیعصر',
            name: 'مدیر کل',
            passwordHash,
            locale: 'fa',
            roleId: superAdmin.id,
          },
          {
            email: 'cashier@zarva.dev',
            phone: '09120000002',
            address: 'تهران، خیابان ولیعصر',
            name: 'صندوقدار',
            passwordHash,
            locale: 'fa',
            roleId: cashierRole.id,
          },
        ],
      },
      subscription: {
        create: {
          planId: enterprise.id,
          status: 'active',
          source: 'manual',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 86_400_000),
        },
      },
    },
    update: {},
  });

  await prisma.subscription.upsert({
    where: { organizationId: demo.id },
    create: {
      organizationId: demo.id,
      planId: enterprise.id,
      status: 'active',
      source: 'manual',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86_400_000),
    },
    update: {
      planId: enterprise.id,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 86_400_000),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zarva.dev' },
    create: {
      email: 'admin@zarva.dev',
      phone: '09120000001',
      address: 'تهران، خیابان ولیعصر',
      name: 'مدیر کل',
      passwordHash,
      locale: 'fa',
      roleId: superAdmin.id,
      organizationId: demo.id,
    },
    update: {
      name: 'مدیر کل',
      phone: '09120000001',
      address: 'تهران، خیابان ولیعصر',
      passwordHash,
      roleId: superAdmin.id,
      organizationId: demo.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'cashier@zarva.dev' },
    create: {
      email: 'cashier@zarva.dev',
      phone: '09120000002',
      address: 'تهران، خیابان ولیعصر',
      name: 'صندوقدار',
      passwordHash,
      locale: 'fa',
      roleId: cashierRole.id,
      organizationId: demo.id,
    },
    update: {
      name: 'صندوقدار',
      phone: '09120000002',
      address: 'تهران، خیابان ولیعصر',
      passwordHash,
      roleId: cashierRole.id,
      organizationId: demo.id,
    },
  });

  const shop = {
    shopName: 'گالری زروا',
    shopAddress: 'تهران، خیابان ولیعصر، پاساژ طلا، پلاک ۱۲',
    shopPhone: '۰۲۱-۸۸۷۷۶۶۵۵',
    shopGuildId: '۱۲۳۴۵۶۷۸۹۰',
  };

  const customerMaryam = await prisma.customer.upsert({
    where: { organizationId_phone: { organizationId: demo.id, phone: '09121234567' } },
    create: {
      organizationId: demo.id,
      name: 'مریم احمدی',
      phone: '09121234567',
      address: 'تهران',
      nationalId: '0012345678',
      balanceLabel: '۰',
      lastTxnLabel: '1403/12/01',
      totalLabel: '۲٫۱ میلیارد ریال',
      partyStatus: 'active',
    },
    update: {
      name: 'مریم احمدی',
      balanceLabel: '۰',
      lastTxnLabel: '1403/12/01',
      totalLabel: '۲٫۱ میلیارد ریال',
      partyStatus: 'active',
    },
  });

  const customerAli = await prisma.customer.upsert({
    where: { organizationId_phone: { organizationId: demo.id, phone: '09139876543' } },
    create: {
      organizationId: demo.id,
      name: 'علی رضایی',
      phone: '09139876543',
      address: 'تهران',
      nationalId: '0023456789',
      balanceLabel: '۱۲۰ م.ریال',
      lastTxnLabel: '1403/12/01',
      totalLabel: '۸۸۰ م.ریال',
      partyStatus: 'active',
    },
    update: {
      name: 'علی رضایی',
      balanceLabel: '۱۲۰ م.ریال',
      lastTxnLabel: '1403/12/01',
      totalLabel: '۸۸۰ م.ریال',
    },
  });

  const customerGallery = await prisma.customer.upsert({
    where: { organizationId_phone: { organizationId: demo.id, phone: '02166554433' } },
    create: {
      organizationId: demo.id,
      name: 'گالری نور',
      phone: '02166554433',
      address: 'تهران',
      nationalId: '10101234567',
      balanceLabel: '۰',
      lastTxnLabel: '1403/11/28',
      totalLabel: '۲٫۸ میلیارد ریال',
      partyStatus: 'active',
    },
    update: { name: 'گالری نور' },
  });

  async function upsertSale(input: {
    number: string;
    customerId: string;
    status: 'draft' | 'confirmed' | 'ready' | 'completed' | 'void';
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    goldWeightGrams: number;
    amountIRT: number;
    remainingIRT: number;
    seller: string;
    displayDate: string;
    amountLabel: string;
    totals: object;
    lines: Array<{
      description: string;
      weight: string;
      purity: string;
      dailyRate: string;
      goldValue: string;
      wage: string;
      profit: string;
      tax: string;
      lineTotal: string;
    }>;
  }) {
    const existing = await prisma.saleInvoice.findUnique({
      where: { organizationId_number: { organizationId: demo.id, number: input.number } },
    });
    if (existing) {
      await prisma.saleInvoiceLine.deleteMany({ where: { invoiceId: existing.id } });
      await prisma.saleInvoice.delete({ where: { id: existing.id } });
    }
    await prisma.saleInvoice.create({
      data: {
        organizationId: demo.id,
        customerId: input.customerId,
        number: input.number,
        status: input.status,
        paymentStatus: input.paymentStatus,
        goldWeightGrams: input.goldWeightGrams,
        amountIRT: input.amountIRT,
        remainingIRT: input.remainingIRT,
        seller: input.seller,
        displayDate: input.displayDate,
        amountLabel: input.amountLabel,
        ...shop,
        totalsJson: input.totals,
        lines: {
          create: input.lines.map((l, i) => ({ ...l, sortOrder: i })),
        },
      },
    });
  }

  await upsertSale({
    number: 'INV-1403-1001',
    customerId: customerMaryam.id,
    status: 'completed',
    paymentStatus: 'paid',
    goldWeightGrams: 12.4,
    amountIRT: 840_200_000,
    remainingIRT: 0,
    seller: 'صندوق ۱',
    displayDate: '1403/12/01',
    amountLabel: '۸۴۰٫۲ م.ریال',
    totals: {
      totalWeight: '12.40',
      goldValue: '۷۲۵٫۴ م.ر',
      wage: '۱۰۸٫۸ م.ر',
      profit: '۵۸٫۴ م.ر',
      tax: '۱۶٫۷ م.ر',
      grandTotal: '۹۰۹٫۳ م.ر',
      amountInWords: 'نهصد و نه میلیون و سیصد هزار ریال',
    },
    lines: [
      {
        description: 'گردنبند طلای ۱۸ عیار',
        weight: '7.20',
        purity: '750',
        dailyRate: '۵۸٫۵ م.ر',
        goldValue: '۴۲۱٫۲ م.ر',
        wage: '۶۳٫۲ م.ر',
        profit: '۳۳٫۹ م.ر',
        tax: '۹٫۷ م.ر',
        lineTotal: '۵۲۸٫۰ م.ر',
      },
      {
        description: 'دستبند زنجیری ۱۸ عیار',
        weight: '5.20',
        purity: '750',
        dailyRate: '۵۸٫۵ م.ر',
        goldValue: '۳۰۴٫۲ م.ر',
        wage: '۴۵٫۶ م.ر',
        profit: '۲۴٫۵ م.ر',
        tax: '۷٫۰ م.ر',
        lineTotal: '۳۸۱٫۳ م.ر',
      },
    ],
  });

  await upsertSale({
    number: 'INV-1403-1002',
    customerId: customerAli.id,
    status: 'completed',
    paymentStatus: 'partial',
    goldWeightGrams: 8.15,
    amountIRT: 552_000_000,
    remainingIRT: 120_000_000,
    seller: 'صندوق ۲',
    displayDate: '1403/12/01',
    amountLabel: '۵۵۲٫۰ م.ریال',
    totals: {
      totalWeight: '8.15',
      goldValue: '۴۷۶٫۸ م.ر',
      wage: '۳۸٫۱ م.ر',
      profit: '۳۶٫۰ م.ر',
      tax: '۷٫۴ م.ر',
      grandTotal: '۵۵۸٫۳ م.ر',
      amountInWords: 'پانصد و پنجاه و هشت میلیون و سیصد هزار ریال',
    },
    lines: [
      {
        description: 'انگشتر طلای ۱۸ عیار',
        weight: '8.15',
        purity: '750',
        dailyRate: '۵۸٫۵ م.ر',
        goldValue: '۴۷۶٫۸ م.ر',
        wage: '۳۸٫۱ م.ر',
        profit: '۳۶٫۰ م.ر',
        tax: '۷٫۴ م.ر',
        lineTotal: '۵۵۸٫۳ م.ر',
      },
    ],
  });

  await upsertSale({
    number: 'INV-1403-1003',
    customerId: customerGallery.id,
    status: 'draft',
    paymentStatus: 'unpaid',
    goldWeightGrams: 42,
    amountIRT: 2_804_000_000,
    remainingIRT: 2_804_000_000,
    seller: 'عمده',
    displayDate: '1403/11/28',
    amountLabel: '۲٫۸ میلیارد ریال',
    totals: {
      totalWeight: '42.00',
      goldValue: '۲٫۶۰۴ م.ر',
      wage: '۰',
      profit: '۱۸۲٫۳ م.ر',
      tax: '۱۸٫۲ م.ر',
      grandTotal: '۲٫۸۰۴ م.ر',
      amountInWords: 'دو میلیارد و هشتصد و چهار میلیون ریال',
    },
    lines: [
      {
        description: 'شمش طلای ۲۴ عیار (عمده)',
        weight: '42.00',
        purity: '999',
        dailyRate: '۶۲٫۰ م.ر',
        goldValue: '۲٫۶۰۴ م.ر',
        wage: '۰',
        profit: '۱۸۲٫۳ م.ر',
        tax: '۱۸٫۲ م.ر',
        lineTotal: '۲٫۸۰۴ م.ر',
      },
    ],
  });

  const supplierSepahan = await prisma.supplier.upsert({
    where: { organizationId_phone: { organizationId: demo.id, phone: '03131234567' } },
    create: {
      organizationId: demo.id,
      name: 'پالایشگاه طلای سپاهان',
      phone: '03131234567',
      address: 'اصفهان',
      balanceLabel: '۰',
      lastTxnLabel: '1403/11/20',
      totalLabel: '۴۲ میلیارد ریال',
      partyStatus: 'active',
    },
    update: { name: 'پالایشگاه طلای سپاهان', balanceLabel: '۰', lastTxnLabel: '1403/11/20', totalLabel: '۴۲ میلیارد ریال' },
  });

  const supplierZarrin = await prisma.supplier.upsert({
    where: { organizationId_phone: { organizationId: demo.id, phone: '02188776655' } },
    create: {
      organizationId: demo.id,
      name: 'بازرگانی زرین',
      phone: '02188776655',
      address: 'تهران',
      balanceLabel: '۸۰۰ م.ریال',
      lastTxnLabel: '1403/11/25',
      totalLabel: '۱۲ میلیارد ریال',
      partyStatus: 'active',
    },
    update: { name: 'بازرگانی زرین', balanceLabel: '۸۰۰ م.ریال', lastTxnLabel: '1403/11/25', totalLabel: '۱۲ میلیارد ریال' },
  });

  await prisma.purchaseReturn.deleteMany({ where: { organizationId: demo.id } });
  await prisma.purchaseLine.deleteMany({
    where: { purchase: { organizationId: demo.id } },
  });
  await prisma.purchase.deleteMany({ where: { organizationId: demo.id } });
  await prisma.purchase.createMany({
    data: [
      {
        organizationId: demo.id,
        supplierId: supplierSepahan.id,
        number: 'PUR-882',
        displayDate: '1403/11/20',
        goldWeightGrams: 250,
        amountLabel: '۱۶٫۲ میلیارد ریال',
        paymentStatus: 'paid',
      },
      {
        organizationId: demo.id,
        supplierId: supplierZarrin.id,
        number: 'PUR-883',
        displayDate: '1403/11/25',
        goldWeightGrams: 85.5,
        amountLabel: '۵٫۶ میلیارد ریال',
        paymentStatus: 'partial',
      },
    ],
  });

  await prisma.stockMovement.deleteMany({ where: { organizationId: demo.id } });
  await prisma.inventoryItem.deleteMany({ where: { organizationId: demo.id } });
  await prisma.inventoryItem.createMany({
    data: [
      {
        organizationId: demo.id,
        name: 'زنجیر ۱۸ عیار',
        sku: 'CH-18-001',
        barcode: '8901001',
        weight: '8.20',
        purity: '18K',
        qty: 14,
        location: 'ویترین A',
        valueLabel: '۵۴۰ م.ریال',
        status: 'available',
        kind: 'jewelry',
      },
      {
        organizationId: demo.id,
        name: 'شمش خام',
        sku: 'RAW-995',
        barcode: '8901002',
        weight: '100.00',
        purity: '995',
        qty: 3,
        location: 'خزانه',
        valueLabel: '۶٫۸ میلیارد ریال',
        status: 'available',
        kind: 'raw',
      },
      {
        organizationId: demo.id,
        name: 'سکه بهار آزادی',
        sku: 'COIN-BAH',
        barcode: '8901003',
        weight: '8.13',
        purity: '22K',
        qty: 2,
        location: 'گاوصندوق',
        valueLabel: '۳۱۰ م.ریال',
        status: 'low',
        kind: 'coin',
      },
    ],
  });

  await prisma.goldTxn.deleteMany({ where: { organizationId: demo.id } });
  await prisma.goldTxn.createMany({
    data: [
      {
        organizationId: demo.id,
        displayDate: '1403/12/01',
        typeLabel: 'فروش',
        weight: '12.40',
        purity: '18K',
        fineGold: '9.30',
        counterparty: 'مریم احمدی',
        reference: 'INV-1403-1001',
      },
      {
        organizationId: demo.id,
        displayDate: '1403/11/25',
        typeLabel: 'خرید',
        weight: '85.50',
        purity: '995',
        fineGold: '85.07',
        counterparty: 'بازرگانی زرین',
        reference: 'PUR-883',
      },
    ],
  });

  await prisma.workshopOrder.deleteMany({ where: { organizationId: demo.id } });
  await prisma.workshopOrder.createMany({
    data: [
      {
        organizationId: demo.id,
        orderNumber: 'WO-441',
        customerId: customerGallery.id,
        customerName: 'گالری نور',
        product: 'دستبند سفارشی',
        artisan: 'استاد کریمی',
        dueLabel: '1403/12/10',
        statusLabel: 'در حال ساخت',
        progress: 65,
      },
      {
        organizationId: demo.id,
        orderNumber: 'WO-442',
        customerId: customerMaryam.id,
        customerName: 'مریم احمدی',
        product: 'انگشتر نگین',
        artisan: 'استاد نوری',
        dueLabel: '1403/12/05',
        statusLabel: 'تأخیر',
        progress: 40,
      },
    ],
  });

  await prisma.ledgerEntry.deleteMany({ where: { organizationId: demo.id } });
  await prisma.journalLine.deleteMany({
    where: { journal: { organizationId: demo.id } },
  });
  await prisma.journalEntry.deleteMany({ where: { organizationId: demo.id } });
  await prisma.chartAccount.deleteMany({ where: { organizationId: demo.id } });

  const cash = await prisma.chartAccount.create({
    data: {
      organizationId: demo.id,
      code: '1010',
      name: 'صندوق',
      type: 'asset',
    },
  });
  const bank = await prisma.chartAccount.create({
    data: {
      organizationId: demo.id,
      code: '1020',
      name: 'بانک',
      type: 'asset',
    },
  });
  const ar = await prisma.chartAccount.create({
    data: {
      organizationId: demo.id,
      code: '1100',
      name: 'حساب‌های دریافتنی',
      type: 'asset',
    },
  });
  const ap = await prisma.chartAccount.create({
    data: {
      organizationId: demo.id,
      code: '2100',
      name: 'حساب‌های پرداختنی',
      type: 'liability',
    },
  });
  const salesRev = await prisma.chartAccount.create({
    data: {
      organizationId: demo.id,
      code: '4100',
      name: 'درآمد فروش',
      type: 'income',
    },
  });
  const expense = await prisma.chartAccount.create({
    data: {
      organizationId: demo.id,
      code: '5100',
      name: 'هزینه عملیاتی',
      type: 'expense',
    },
  });

  await prisma.journalEntry.create({
    data: {
      organizationId: demo.id,
      number: 'JE-1001',
      displayDate: '1403/12/01',
      description: 'فروش نقدی INV-1001',
      lines: {
        create: [
          {
            accountId: cash.id,
            debitLabel: '۸۴۰٬۲۰۰٬۰۰۰',
            creditLabel: '۰',
            debitAmount: 840_200_000,
            creditAmount: 0,
            memo: 'صندوق',
          },
          {
            accountId: salesRev.id,
            debitLabel: '۰',
            creditLabel: '۸۴۰٬۲۰۰٬۰۰۰',
            debitAmount: 0,
            creditAmount: 840_200_000,
            memo: 'فروش',
          },
        ],
      },
    },
  });
  await prisma.journalEntry.create({
    data: {
      organizationId: demo.id,
      number: 'JE-1002',
      displayDate: '1403/12/01',
      description: 'هزینه اجاره',
      lines: {
        create: [
          {
            accountId: expense.id,
            debitLabel: '۵۰٬۰۰۰٬۰۰۰',
            creditLabel: '۰',
            debitAmount: 50_000_000,
            creditAmount: 0,
          },
          {
            accountId: bank.id,
            debitLabel: '۰',
            creditLabel: '۵۰٬۰۰۰٬۰۰۰',
            debitAmount: 0,
            creditAmount: 50_000_000,
          },
        ],
      },
    },
  });
  await prisma.journalEntry.create({
    data: {
      organizationId: demo.id,
      number: 'JE-1003',
      displayDate: '1403/11/25',
      description: 'بدهی خرید PUR-883',
      lines: {
        create: [
          {
            accountId: ar.id,
            debitLabel: '۱۲۰٬۰۰۰٬۰۰۰',
            creditLabel: '۰',
            debitAmount: 120_000_000,
            creditAmount: 0,
            memo: 'دریافتنی نمونه',
          },
          {
            accountId: ap.id,
            debitLabel: '۰',
            creditLabel: '۱۲۰٬۰۰۰٬۰۰۰',
            debitAmount: 0,
            creditAmount: 120_000_000,
            memo: 'پرداختنی نمونه',
          },
        ],
      },
    },
  });

  await prisma.ledgerEntry.createMany({
    data: [
      {
        organizationId: demo.id,
        displayDate: '1403/11/01',
        description: 'مانده افتتاحیه',
        debitLabel: '—',
        creditLabel: '—',
        balanceLabel: '۱۲٫۴ میلیارد ریال',
        sortOrder: 1,
      },
      {
        organizationId: demo.id,
        displayDate: '1403/12/01',
        description: 'فروش INV-1001',
        debitLabel: '—',
        creditLabel: '۸۴۰ م.ریال',
        balanceLabel: '۱۳٫۲ میلیارد ریال',
        sortOrder: 2,
      },
      {
        organizationId: demo.id,
        displayDate: '1403/12/01',
        description: 'خرید PUR-883',
        debitLabel: '۵٫۶ میلیارد ریال',
        creditLabel: '—',
        balanceLabel: '۷٫۶ میلیارد ریال',
        sortOrder: 3,
      },
    ],
  });

  await prisma.warehouse.deleteMany({ where: { organizationId: demo.id } });
  const whMain = await prisma.warehouse.create({
    data: { organizationId: demo.id, name: 'انبار مرکزی', city: 'تهران' },
  });
  const whVitrin = await prisma.warehouse.create({
    data: { organizationId: demo.id, name: 'ویترین', city: 'تهران' },
  });

  const invItems = await prisma.inventoryItem.findMany({
    where: { organizationId: demo.id },
  });
  if (invItems[0]) {
    await prisma.inventoryItem.update({
      where: { id: invItems[0].id },
      data: { warehouseId: whVitrin.id },
    });
    await prisma.stockMovement.create({
      data: {
        organizationId: demo.id,
        itemId: invItems[0].id,
        kind: 'IN',
        qty: 14,
        displayDate: '1403/11/15',
        note: 'ورود اولیه',
        toWarehouseId: whVitrin.id,
      },
    });
  }
  if (invItems[1]) {
    await prisma.inventoryItem.update({
      where: { id: invItems[1].id },
      data: { warehouseId: whMain.id, kind: 'raw' },
    });
  }
  if (invItems[2]) {
    await prisma.inventoryItem.update({
      where: { id: invItems[2].id },
      data: { warehouseId: whMain.id },
    });
  }

  const purchases = await prisma.purchase.findMany({
    where: { organizationId: demo.id },
  });
  await prisma.purchaseReturn.deleteMany({ where: { organizationId: demo.id } });
  if (purchases[0]) {
    await prisma.purchaseLine.create({
      data: {
        purchaseId: purchases[0].id,
        description: 'شمش',
        weight: '250',
        purity: '995',
        amountLabel: purchases[0].amountLabel,
      },
    });
    await prisma.purchaseReturn.create({
      data: {
        organizationId: demo.id,
        purchaseId: purchases[0].id,
        number: 'PR-101',
        displayDate: '1403/11/22',
        amountLabel: '۱۲۰ م.ریال',
      },
    });
  }

  const invoices = await prisma.saleInvoice.findMany({
    where: { organizationId: demo.id },
  });
  await prisma.salePayment.deleteMany({ where: { organizationId: demo.id } });
  await prisma.saleReturn.deleteMany({ where: { organizationId: demo.id } });
  if (invoices[0]) {
    await prisma.salePayment.create({
      data: {
        organizationId: demo.id,
        invoiceId: invoices[0].id,
        ref: 'PAY-9001',
        method: 'cash',
        amountLabel: '۸۴۰ م.ریال',
        displayDate: '1403/12/01',
      },
    });
  }
  if (invoices[1]) {
    await prisma.saleReturn.create({
      data: {
        organizationId: demo.id,
        invoiceId: invoices[1].id,
        number: 'SR-201',
        displayDate: '1403/12/02',
        amountLabel: '۵۵ م.ریال',
      },
    });
  }

  await prisma.goldPurity.deleteMany({ where: { organizationId: demo.id } });
  const p18 = await prisma.goldPurity.create({
    data: {
      organizationId: demo.id,
      name: '۱۸ عیار',
      karat: '18K',
      ratioLabel: '۰٫۷۵۰',
    },
  });
  const p24 = await prisma.goldPurity.create({
    data: {
      organizationId: demo.id,
      name: '۲۴ عیار',
      karat: '24K',
      ratioLabel: '۰٫۹۹۹',
    },
  });
  await prisma.goldLot.deleteMany({ where: { organizationId: demo.id } });
  await prisma.goldLot.createMany({
    data: [
      {
        organizationId: demo.id,
        code: 'LOT-A1',
        purityId: p18.id,
        weightLabel: '120.5g',
        statusLabel: 'open',
      },
      {
        organizationId: demo.id,
        code: 'LOT-B2',
        purityId: p24.id,
        weightLabel: '50.0g',
        statusLabel: 'closed',
      },
    ],
  });
  await prisma.goldBalance.deleteMany({ where: { organizationId: demo.id } });
  await prisma.goldBalance.createMany({
    data: [
      {
        organizationId: demo.id,
        partyName: 'مریم احمدی',
        purityId: p18.id,
        weightLabel: '2.10g',
      },
      {
        organizationId: demo.id,
        partyName: 'گالری نور',
        purityId: p24.id,
        weightLabel: '15.00g',
      },
    ],
  });
  await prisma.goldOrgRate.deleteMany({ where: { organizationId: demo.id } });
  await prisma.goldOrgRate.createMany({
    data: [
      {
        organizationId: demo.id,
        label: 'مثقال ۱۸',
        buyLabel: '۵۸٫۲ م.ر',
        sellLabel: '۵۸٫۸ م.ر',
        sortOrder: 1,
      },
      {
        organizationId: demo.id,
        label: 'انس',
        buyLabel: '۲٬۳۴۰',
        sellLabel: '۲٬۳۴۵',
        sortOrder: 2,
      },
    ],
  });

  await prisma.artisan.deleteMany({ where: { organizationId: demo.id } });
  const artisan1 = await prisma.artisan.create({
    data: {
      organizationId: demo.id,
      name: 'استاد کریمی',
      skill: 'دستبند',
      statusLabel: 'active',
    },
  });
  await prisma.artisan.create({
    data: {
      organizationId: demo.id,
      name: 'استاد نوری',
      skill: 'انگشتر',
      statusLabel: 'active',
    },
  });
  await prisma.workshopOrder.updateMany({
    where: { organizationId: demo.id, orderNumber: 'WO-441' },
    data: { artisanId: artisan1.id },
  });
  await prisma.productionBatch.deleteMany({ where: { organizationId: demo.id } });
  await prisma.productionBatch.createMany({
    data: [
      {
        organizationId: demo.id,
        code: 'PB-01',
        product: 'سری دستبند نوروز',
        progressLabel: '40%',
      },
      {
        organizationId: demo.id,
        code: 'PB-02',
        product: 'انگشتر نگین',
        progressLabel: '80%',
      },
    ],
  });

  await prisma.branch.deleteMany({ where: { organizationId: demo.id } });
  await prisma.branch.createMany({
    data: [
      {
        organizationId: demo.id,
        name: 'شعبه مرکزی',
        code: 'HQ',
        city: 'تهران',
        address: 'ولیعصر',
        isActive: true,
      },
      {
        organizationId: demo.id,
        name: 'شعبه اصفهان',
        code: 'ISF',
        city: 'اصفهان',
        address: 'چهارباغ',
        isActive: true,
      },
    ],
  });

  await prisma.commerceChannel.deleteMany({ where: { organizationId: demo.id } });
  const channel = await prisma.commerceChannel.create({
    data: {
      organizationId: demo.id,
      name: 'ویترین آنلاین',
      type: 'storefront',
      status: 'active',
      updatedAt: new Date(),
    },
  });
  const invItem = await prisma.inventoryItem.findFirst({
    where: { organizationId: demo.id },
  });
  if (invItem) {
    await prisma.commerceListing.create({
      data: {
        channelId: channel.id,
        inventoryItemId: invItem.id,
        status: 'active',
        externalSku: invItem.sku,
        updatedAt: new Date(),
      },
    });
  }

  await prisma.taxPeriod.deleteMany({ where: { organizationId: demo.id } });
  const taxPeriod = await prisma.taxPeriod.create({
    data: {
      organizationId: demo.id,
      label: 'VAT-Q3',
      fromDate: new Date('2025-07-01'),
      toDate: new Date('2025-09-30'),
      status: 'open',
      updatedAt: new Date(),
    },
  });
  await prisma.taxFiling.create({
    data: {
      periodId: taxPeriod.id,
      kind: 'vat',
      status: 'draft',
      totals: { sales: 0, purchases: 0, vat: 0 },
      updatedAt: new Date(),
    },
  });

  await prisma.jewelryPiece.deleteMany({ where: { organizationId: demo.id } });
  const piece = await prisma.jewelryPiece.create({
    data: {
      organizationId: demo.id,
      title: 'انگشتر یاقوت',
      sku: 'JR-01',
      status: 'showcase',
      weight: '4.2',
      purity: '750',
      inventoryItemId: invItem?.id,
      updatedAt: new Date(),
    },
  });
  await prisma.jewelryBomLine.create({
    data: {
      pieceId: piece.id,
      componentType: 'stone',
      description: 'یاقوت',
      carat: '0.5',
      qty: 1,
    },
  });

  await prisma.aiInsight.deleteMany({ where: { organizationId: demo.id } });
  await prisma.aiInsight.create({
    data: {
      organizationId: demo.id,
      code: 'seed.info',
      title: 'سیستم آماده است',
      body: 'بینش‌های قانون‌محور با Refresh به‌روز می‌شوند.',
      severity: 'info',
      source: 'rules',
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: demo.id,
        userId: admin.id,
        action: 'login',
        meta: { ip: '127.0.0.1' },
      },
      {
        organizationId: demo.id,
        userId: admin.id,
        action: 'role.update',
        meta: { role: 'CASHIER' },
      },
    ],
  });

  await prisma.orgSetting.deleteMany({ where: { organizationId: demo.id } });
  for (const section of [
    'general',
    'business',
    'invoices',
    'gold',
    'inventory',
    'accounting',
    'tax',
    'notifications',
    'security',
    'language',
    'backup',
  ]) {
    await prisma.orgSetting.create({
      data: {
        organizationId: demo.id,
        section,
        values: { f1: 'پیش‌فرض', f2: section },
      },
    });
  }

  await prisma.organization.update({
    where: { id: demo.id },
    data: {
      taxId: '14001234567',
      phone: '02191000000',
      address: 'تهران، بازار طلا',
    },
  });

  await prisma.integration.deleteMany({ where: { organizationId: demo.id } });
  await prisma.integration.createMany({
    data: [
      {
        organizationId: demo.id,
        kind: 'scale',
        code: 'SCALE-01',
        status: 'healthy',
        detail: 'ok',
      },
      {
        organizationId: demo.id,
        kind: 'device',
        code: 'PRINTER-01',
        status: 'degraded',
        detail: 'paper low',
      },
      {
        organizationId: demo.id,
        kind: 'api',
        code: 'API-KEY',
        status: 'healthy',
        detail: 'active',
      },
      {
        organizationId: demo.id,
        kind: 'webhook',
        code: 'WH-OUT',
        status: 'unknown',
        detail: 'pending',
      },
    ],
  });

  for (const item of SIDEBAR_NAV_SEED) {
    await prisma.sidebarNavItem.upsert({
      where: { key: item.key },
      create: {
        key: item.key,
        href: item.href,
        labelKey: item.labelKey,
        icon: item.icon,
        iconActive: item.iconActive,
        group: item.group,
        subject: item.subject,
        roles: item.roles ? [...item.roles] : [],
        moduleKey: item.moduleKey ?? null,
        sortOrder: item.sortOrder,
        isActive: true,
        parentId: null,
      },
      update: {
        href: item.href,
        labelKey: item.labelKey,
        icon: item.icon,
        iconActive: item.iconActive,
        group: item.group,
        subject: item.subject,
        roles: item.roles ? [...item.roles] : [],
        moduleKey: item.moduleKey ?? null,
        sortOrder: item.sortOrder,
        isActive: true,
        parentId: null,
      },
    });
  }

  console.log('Seeded permissions, roles, plans, sidebar nav, demo org + domain data', demo.slug);
  console.log('  admin@zarva.dev / Password123!  (SUPER_ADMIN)');
  console.log('  cashier@zarva.dev / Password123! (CASHIER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
