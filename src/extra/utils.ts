export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const sanitizeText = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

export const sanitizeSafeText = (value: string) =>
  sanitizeText(value).replace(/[<>`{}[\]\\]/g, '');

export const normalizeSearch = (value: string) =>
  sanitizeSafeText(value).toLocaleLowerCase('pt-BR');

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone: string) => {
  const d = onlyDigits(phone);
  return d.length >= 10 && d.length <= 13;
};

export const isValidCPF = (cpf: string) => {
  const value = onlyDigits(cpf);
  if (value.length !== 11 || /^(\d)\1+$/.test(value)) return false;

  const calc = (slice: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < slice.length; i++) total += Number(slice[i]) * (factor - i);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calc(value.slice(0, 9), 10);
  const d2 = calc(value.slice(0, 10), 11);
  return d1 === Number(value[9]) && d2 === Number(value[10]);
};

export const formatCPF = (cpf: string) => {
  const d = onlyDigits(cpf).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatPhone = (phone: string) => {
  const d = onlyDigits(phone).slice(0, 13);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

export const formatDate = (date: string) => {
  const d = onlyDigits(date).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  return d.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3').replace(/\/$/, '');
};

export const formatTime = (time: string) => {
  const d = onlyDigits(time).slice(0, 4);
  if (d.length <= 2) return d;
  return d.replace(/(\d{2})(\d{0,2})/, '$1:$2').replace(/:$/, '');
};

export const parseBRDateTimeToTimestamp = (dateBR: string, timeBR: string) => {
  const [dd, mm, yyyy] = dateBR.split('/').map(Number);
  const [hh, min] = timeBR.split(':').map(Number);

  const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  return date.getTime();
};

export const formatDateTimeBR = (timestamp: number) => {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

export const formatDateBR = (value?: string | number | Date) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('pt-BR');
};

export const sameLocalDay = (timestamp: number, year: number, monthIndex: number, day: number) => {
  const d = new Date(timestamp);
  return (
    d.getFullYear() === year &&
    d.getMonth() === monthIndex &&
    d.getDate() === day
  );
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const monthKey = (value: Date | number | string) => {
  const d = new Date(value);
  return d.toISOString().slice(0, 7);
};

export const parseMoneyBR = (value: string) => {
  const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

export const formatMoneyBR = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export const isValidDateBR = (value: string) => {
  const trimmed = value.trim();
  const match = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/.exec(trimmed);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || year < 1900 || year > new Date().getFullYear()) return false;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date > now) return false;

  return true;
};

export const sanitizeFloatInput = (value: string) => {
  const cleaned = value.replace(/,/g, '.').replace(/[^0-9.+-]/g, '');
  const sign = cleaned[0] === '+' || cleaned[0] === '-' ? cleaned[0] : '';
  const rest = sign ? cleaned.slice(1) : cleaned;
  const normalizedRest = rest.replace(/[+-]/g, '');
  const parts = normalizedRest.split('.');
  const normalized = parts.length <= 1 ? normalizedRest : `${parts[0]}.${parts.slice(1).join('')}`;
  return `${sign}${normalized}`;
};

export const safeArray = <T,>(value: T[] | null | undefined) => (Array.isArray(value) ? value : []);

export const formatMonthBR = (monthKey: string) => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const [year, month] = monthKey.split('-');
  const monthIndex = Number(month) - 1;
  return `${months[monthIndex]} de ${year}`;
};