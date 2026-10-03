const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

async function main() {
  const p = new PrismaClient();
  try {
    const u = await p.user.findUnique({
      where: { email: 'admin@zarva.dev' },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    console.log('user', !!u, u?.role?.name, 'perms', u?.role?.permissions?.length);
    if (u) {
      const ok = await argon2.verify(u.passwordHash, 'Password123!');
      console.log('passwordOk', ok);
    }
    const cols = await p.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Notification' ORDER BY ordinal_position`,
    );
    console.log('Notification cols', cols);
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await p.$disconnect();
  }
}

main();
