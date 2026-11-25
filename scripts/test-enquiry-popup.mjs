import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync('assets/enquiry-popup.js', 'utf8');

function runVisit(innerHeight) {
  const scrollListeners = new Map();
  const dialogListeners = new Map();
  const rootClasses = new Set();
  const root = {
    scrollHeight: innerHeight * 10,
    clientHeight: innerHeight,
    classList: {
      contains: name => rootClasses.has(name),
      add: name => rootClasses.add(name),
      remove: name => rootClasses.delete(name),
    },
  };
  const form = {
    addEventListener() {},
    getBoundingClientRect: () => ({ top: innerHeight * 2, bottom: innerHeight * 2 + 300, height: 300 }),
    replaceWith(placeholder) { placeholder.replacedForm = true; },
  };
  const dialog = {
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; dialogListeners.get('close')?.(); },
    querySelectorAll: () => [],
    addEventListener: (event, listener) => dialogListeners.set(event, listener),
  };
  const formSlot = { append() {} };
  const document = {
    documentElement: root,
    activeElement: { isConnected: true, focus() {} },
    getElementById: id => ({ enquiryPopup: dialog, batchInquiryForm: form,
      bookingCalendarPanel: { open: false }, enquiryPopupForm: formSlot })[id],
    createElement: () => ({ style: {}, setAttribute() {}, replaceWith() {} }),
    querySelectorAll: () => [],
    addEventListener() {},
  };
  const window = {
    innerHeight, scrollY: 0, location: { hash: '' },
    addEventListener: (event, listener) => scrollListeners.set(event, listener),
    removeEventListener: event => scrollListeners.delete(event),
  };
  const sessionStorage = { getItem: () => '1', setItem() {} };
  vm.runInNewContext(source, { document, window, sessionStorage });
  const scrollToPercent = percent => {
    window.scrollY = percent * (root.scrollHeight - root.clientHeight);
    scrollListeners.get('scroll')?.();
  };
  return { dialog, scrollToPercent, hasScrollListener: () => scrollListeners.has('scroll') };
}

for (const height of [900, 640]) {
  const visit = runVisit(height);
  assert.equal(visit.hasScrollListener(), true, 'a previous visit must not block the popup');
  visit.scrollToPercent(0.11);
  assert.equal(visit.dialog.open, false);
  visit.scrollToPercent(0.13);
  assert.equal(visit.dialog.open, true);
  visit.dialog.close();
  visit.scrollToPercent(0.2);
  assert.equal(visit.dialog.open, false, 'dismissal lasts for this page visit');
  const nextVisit = runVisit(height);
  nextVisit.scrollToPercent(0.13);
  assert.equal(nextVisit.dialog.open, true, 'the next page visit can show the popup');
}

console.log('Enquiry popup passed: opens after 12% scroll on desktop and mobile, and reappears on a new visit.');
