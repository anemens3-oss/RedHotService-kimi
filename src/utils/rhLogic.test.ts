import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCardTilt,
  calculateMagneticOffset,
  wrapGalleryIndex,
  formatCounterValue,
  getWorkshopStatus,
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
