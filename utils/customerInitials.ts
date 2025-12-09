// utils/customerInitials.ts
import { Customer } from '../services/customerService';

export const getCustomerInitials = (c?: Customer | null): string => {
  if (!c) return '??';

  // 1. Sigle pour une entreprise
  if (c.type === 'entreprise' && c.sigle) return c.sigle.slice(0, 2).toUpperCase();

  // 2. Nom + prénom pour un particulier
  const first = (c.prenoms || '').trim();
  const last = (c.nom || '').trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();

  // 3. Fallback sur l’e-mail
  const mail = c.email || '';
  if (mail.includes('@')) return mail.split('@')[0].slice(0, 2).toUpperCase();

  return '??';
};