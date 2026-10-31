import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCardTilt,
  calculateMagneticOffset,
  wrapGalleryIndex,
  formatCounterValue,
  getWorkshopStatus,
  RH_SOCIAL_LINKS,
  filterPriceItemsByQuery,
} from './rhLogic';

test('calculateCardTilt computes centered and edge tilt angles accurately', () => {
  const rect = { left: 100, top: 100, width: 200, height: 100 };
  const center = calculateCardTilt(200, 150, rect, 6);
  assert.equal(center.rotateX, 0);
  assert.equal(center.rotateY, 0);
  assert.equal(center.percentX, 50);
  assert.equal(center.percentY, 50);

  const topLeft = calculateCardTilt(100, 100, rect, 6);
  assert.equal(topLeft.rotateX, 6);
  assert.equal(topLeft.rotateY, -6);
  assert.equal(topLeft.percentX, 0);
  assert.equal(topLeft.percentY, 0);
});

test('calculateMagneticOffset clamps displacement within maxOffsetPx', () => {
  const rect = { left: 0, top: 0, width: 100, height: 50 };
  const near = calculateMagneticOffset(60, 25, rect, 0.5, 12);
  assert.equal(near.x, 5);
  assert.equal(near.y, 0);

  const far = calculateMagneticOffset(200, 200, rect, 0.5, 12);
  assert.equal(far.x, 12);
  assert.equal(far.y, 12);
});

test('wrapGalleryIndex cycles indices forward and backward cleanly', () => {
  assert.equal(wrapGalleryIndex(0, 5), 0);
  assert.equal(wrapGalleryIndex(5, 5), 0);
  assert.equal(wrapGalleryIndex(-1, 5), 4);
  assert.equal(wrapGalleryIndex(-6, 5), 4);
});

test('formatCounterValue formats integers and Russian decimal strings', () => {
  assert.equal(formatCounterValue(7238, 0), '7238');
  assert.equal(formatCounterValue(96.3, 1), '96,3');
});

test('getWorkshopStatus reflects Mon-Sat 10:00-20:00 schedule and 24/7 reception', () => {
  const openTue = getWorkshopStatus(2, 14);
  assert.equal(openTue.isRepairOpen, true);
  assert.equal(openTue.isReceptionOpen, true);

  const closedSun = getWorkshopStatus(0, 14);
  assert.equal(closedSun.isRepairOpen, false);
  assert.equal(closedSun.isReceptionOpen, true);

  const nightMon = getWorkshopStatus(1, 23);
  assert.equal(nightMon.isRepairOpen, false);
  assert.equal(nightMon.isReceptionOpen, true);
});

test('RH_SOCIAL_LINKS contains confirmed official URLs for YouTube, VK, WhatsApp, and 2GIS', () => {
  assert.ok(RH_SOCIAL_LINKS.youtube.startsWith('https://www.youtube.com/'));
  assert.equal(RH_SOCIAL_LINKS.vk, 'https://vk.com/red_hot_service');
  assert.equal(RH_SOCIAL_LINKS.whatsapp, 'https://wa.me/79160808082');
  assert.equal(RH_SOCIAL_LINKS.twogis, 'https://2gis.ru/lytkarino/firm/70000001018836416');
  assert.equal(
    RH_SOCIAL_LINKS.twogisPrices,
    'https://2gis.ru/lytkarino/firm/70000001018836416/tab/prices'
  );
});

test('filterPriceItemsByQuery filters 2GIS price items by title, note, or price', () => {
  const sample = [
    { title: 'Диагностика подвески', note: 'Полный осмотр агрегатов подвески (работа)', price: '550 ₽' },
    { title: 'Ремонт ТНВД', note: 'Снять/поставить, настроить на стенде (работа + запчасти)', price: '12 600 ₽' },
  ];
  assert.equal(filterPriceItemsByQuery(sample, '').length, 2);
  assert.equal(filterPriceItemsByQuery(sample, 'подвеск').length, 1);
  assert.equal(filterPriceItemsByQuery(sample, '12 600').length, 1);
  assert.equal(filterPriceItemsByQuery(sample, 'несуществующая').length, 0);
});

