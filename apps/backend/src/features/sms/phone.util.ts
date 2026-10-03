/** Normalize Iranian mobile to 09XXXXXXXXX. Throws if invalid. */
export function normalizeIranPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '').replace(/^\+/, '');
  let phone = digits;
  if (phone.startsWith('0098')) phone = `0${phone.slice(4)}`;
  else if (phone.startsWith('98')) phone = `0${phone.slice(2)}`;
  if (!/^09\d{9}$/.test(phone)) {
    throw new Error('Invalid Iranian mobile number');
  }
  return phone;
}

export function isValidIranPhone(raw: string): boolean {
  try {
    normalizeIranPhone(raw);
    return true;
  } catch {
    return false;
  }
}
