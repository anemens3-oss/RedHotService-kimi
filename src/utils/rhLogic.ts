/**
 * Pure helper functions for Red Hot Service interactive logic
 * (Mirrored in vanilla script.js for zero-dependency static execution)
 */

export interface TiltResult {
  rotateX: number;
  rotateY: number;
  percentX: number;
  percentY: number;
}

/**
 * Calculates 3D card tilt angles and spotlight percentage coordinates
 */
export function calculateCardTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxTiltDeg = 6
): TiltResult {
  if (rect.width <= 0 || rect.height <= 0) {
    return { rotateX: 0, rotateY: 0, percentX: 50, percentY: 50 };
  }
  const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  const rotateY = Number(((relX - 0.5) * 2 * maxTiltDeg).toFixed(2));
  const rotateX = Number(((0.5 - relY) * 2 * maxTiltDeg).toFixed(2));
  return {
    rotateX,
    rotateY,
    percentX: Math.round(relX * 100),
    percentY: Math.round(relY * 100),
  };
}

/**
 * Calculates magnetic button translation offset within a safe radius
 */
export function calculateMagneticOffset(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  strength = 0.28,
  maxOffsetPx = 12
): { x: number; y: number } {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const rawX = (clientX - centerX) * strength;
  const rawY = (clientY - centerY) * strength;
  const clamp = (val: number) => Math.max(-maxOffsetPx, Math.min(maxOffsetPx, val));
  return {
    x: Number(clamp(rawX).toFixed(2)),
    y: Number(clamp(rawY).toFixed(2)),
  };
}

/**
 * Wraps gallery lightbox index safely in both directions
 */
export function wrapGalleryIndex(targetIndex: number, totalItems: number): number {
  if (totalItems <= 0) return 0;
  return ((targetIndex % totalItems) + totalItems) % totalItems;
}

/**
 * Formats animated counter numbers using Russian decimal comma convention
 */
export function formatCounterValue(currentValue: number, decimals: number): string {
  const safeDecimals = Math.max(0, Math.min(4, decimals));
  return currentValue.toFixed(safeDecimals).replace('.', ',');
}

/**
 * Determines workshop status based on Moscow time (Mon-Sat 10:00-20:00, 24/7 reception)
 */
export function getWorkshopStatus(dayOfWeek: number, hour: number): {
  isRepairOpen: boolean;
  isReceptionOpen: boolean;
  label: string;
} {
  // dayOfWeek: 0 = Sunday, 1..6 = Mon..Sat
  const isWorkDay = dayOfWeek >= 1 && dayOfWeek <= 6;
  const isRepairHours = hour >= 10 && hour < 20;
  const isRepairOpen = isWorkDay && isRepairHours;

  return {
    isRepairOpen,
    isReceptionOpen: true, // Приём 24 часа в сутки
    label: isRepairOpen
      ? 'Ремзона открыта (до 20:00) · Приём 24/7'
      : 'Приём автомобилей открыт 24/7 · Ремзона Пн–Сб с 10:00',
  };
}

export const RH_SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@RedHotService',
  vk: 'https://vk.com/red_hot_service',
  whatsapp: 'https://wa.me/79160808082',
  twogis: 'https://2gis.ru/lytkarino/firm/70000001018836416',
  twogisPrices: 'https://2gis.ru/lytkarino/firm/70000001018836416/tab/prices',
} as const;

export interface PriceServiceItem {
  title: string;
  note: string;
  price: string;
}

export function filterPriceItemsByQuery(
  items: PriceServiceItem[],
  query: string
): PriceServiceItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.note.toLowerCase().includes(normalized) ||
      item.price.toLowerCase().includes(normalized)
  );
}

