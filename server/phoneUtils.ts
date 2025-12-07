export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  let normalized = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (normalized.startsWith('966')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('00966')) {
    normalized = '0' + normalized.slice(5);
  }
  
  if (normalized.length === 9 && !normalized.startsWith('0')) {
    normalized = '0' + normalized;
  }
  
  return normalized || null;
}

export function phonesMatch(phone1: string | null | undefined, phone2: string | null | undefined): boolean {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  return !!(normalized1 && normalized2 && normalized1 === normalized2);
}
