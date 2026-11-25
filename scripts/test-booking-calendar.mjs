import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync('assets/booking-calendar.js', 'utf8');

function runCalendar(initialDate) {
  let now = new Date(initialDate);
  const elements = new Map();
  const events = new Map();
  const makeElement = () => {
    const listeners = new Map();
    const attributes = new Map();
    return {
      children: [], listeners, attributes, style: {}, hidden: false, open: false, textContent: '', className: '',
      addEventListener: (event, listener) => listeners.set(event, listener),
      setAttribute: (name, value) => attributes.set(name, value),
      replaceChildren() { this.children = []; },
      append(child) { this.children.push(child); },
      show() { this.open = true; },
      close() { this.open = false; listeners.get('close')?.(); },
      getBoundingClientRect: () => ({ top: 100, bottom: 640, right: 1000, width: 360, height: 400 }),
      contains: () => false,
      focus() {}, scrollIntoView() { this.scrolledIntoView = true; },
    };
  };
  const ids = [
    'bookingCalendar', 'bookingCalendarToggle', 'bookingCalendarPanel', 'bookingDays', 'bookingMonth',
    'bookingDateStatus', 'fullyBookedSummary', 'partiallyBookedSummary',
    'unmarkedBookingSummary', 'fullyBookedRange', 'partiallyBookedRange',
    'bookingCalendarClose', 'bookingPreviousMonth', 'bookingNextMonth', 'studentName', 'enrollSection'
  ];
  for (const id of ids) elements.set(id, makeElement());
  const document = {
    getElementById: id => elements.get(id),
    querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 80 }) }),
    createElement: makeElement,
    addEventListener: (event, listener) => events.set(event, listener),
    dispatchEvent: event => events.get(event.type)?.(event),
    hidden: false,
  };
  const window = {
    innerHeight: 800, innerWidth: 1280, location: { hash: '' }, scrollBy() {},
    requestAnimationFrame: callback => callback(),
    setInterval() {}, addEventListener() {},
  };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
  }
  vm.runInNewContext(source, { document, window, Date: FixedDate, Intl, Event });
  const element = id => elements.get(id);
  const click = id => element(id).listeners.get('click')();
  const day = value => element('bookingDays').children.find(child => child.textContent === value);
  return { element, click, day, events, window, setNow: value => { now = new Date(value); events.get('visibilitychange')(); } };
}

const calendar = runCalendar('2025-11-25T12:00:00+05:30');
assert.equal(calendar.element('fullyBookedRange').textContent, '14–25 Nov');
assert.equal(calendar.element('partiallyBookedRange').textContent, '26–28 Nov');
assert.match(calendar.day(25).className, /is-booked/);
assert.match(calendar.day(27).className, /is-partial/);
calendar.click('bookingCalendarToggle');
assert.equal(calendar.element('bookingCalendarPanel').open, true);
assert.equal(calendar.element('bookingCalendarPanel').style.top, '388px');
calendar.day(27).listeners.get('click')();
assert.equal(calendar.window.location.hash, '#enrollSection');
assert.equal(calendar.element('enrollSection').scrolledIntoView, true);
assert.equal(calendar.element('bookingCalendarPanel').open, false);

calendar.click('bookingNextMonth');
assert.equal(calendar.element('bookingMonth').textContent, 'December 2025');
assert.equal(calendar.element('fullyBookedSummary').hidden, true);

const currentYear = runCalendar('2026-11-25T12:00:00+05:30');
assert.equal(currentYear.element('fullyBookedRange').textContent, '14–25 Nov');
assert.equal(currentYear.element('partiallyBookedRange').textContent, '26–28 Nov');
currentYear.click('bookingNextMonth');
assert.equal(currentYear.element('fullyBookedSummary').hidden, true);
assert.equal(calendar.element('partiallyBookedSummary').hidden, true);
assert.equal(calendar.element('unmarkedBookingSummary').hidden, false);
assert.doesNotMatch(calendar.day(14).className, /is-booked|is-partial/);

calendar.click('bookingPreviousMonth');
calendar.setNow('2025-11-26T12:00:00+05:30');
assert.equal(calendar.element('fullyBookedRange').textContent, '14–26 Nov');
assert.equal(calendar.element('partiallyBookedRange').textContent, '27–29 Nov');
calendar.setNow('2025-12-01T12:00:00+05:30');
assert.equal(calendar.element('bookingMonth').textContent, 'December 2025');
assert.equal(calendar.element('fullyBookedRange').textContent, '1 Dec');
assert.equal(calendar.element('partiallyBookedRange').textContent, '2–4 Dec');
calendar.click('bookingNextMonth');
assert.equal(calendar.element('bookingMonth').textContent, 'January 2026');
assert.equal(calendar.element('fullyBookedSummary').hidden, true);

console.log('Calendar behavior passed: rolling dates, future months, anchored opening, and enquiry navigation.');
