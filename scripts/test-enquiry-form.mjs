import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function element(value = '') {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  return {
    value, listeners, hidden: false, disabled: false, textContent: '', dataset: {},
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
    addEventListener: (name, handler) => listeners.set(name, handler),
    dispatchEvent: event => listeners.get(event.type)?.(event),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    hasAttribute: name => attributes.has(name),
    setCustomValidity(message) { this.validationMessage = message; },
    focus() {},
  };
}

const form = element();
const submitButton = element();
const name = element('QA Form Test');
const phone = element();
const phoneError = element();
const status = element();
const another = element();
form.querySelector = () => submitButton;
form.reportValidity = () => Boolean(name.value && phone.value && !name.validationMessage && !phone.validationMessage);
form.reset = () => { name.value = ''; phone.value = ''; };
const elements = { batchInquiryForm: form, studentName: name, studentPhone: phone, phoneError, enquiryStatus: status, anotherEnquiry: another };
let sentBody = '';

class FormDataStub {
  constructor() { this.values = new Map([['form-name', 'batch-enquiry'], ['name', name.value], ['phone', phone.value]]); }
  set(key, value) { this.values.set(key, value); }
  *[Symbol.iterator]() { yield* this.values; }
}

vm.runInNewContext(readFileSync('assets/enquiry-form.js', 'utf8'), {
  document: { getElementById: id => elements[id] },
  FormData: FormDataStub, URLSearchParams, AbortController, Event,
  setTimeout, clearTimeout,
  fetch: async (_url, options) => { sentBody = options.body; return { ok: true }; },
});

phone.value = '1235545455555555';
phone.dispatchEvent({ type: 'input' });
assert.equal(phone.value, '');
assert.equal(phoneError.hidden, false);

let prevented = false;
phone.dispatchEvent({ type: 'paste', clipboardData: { getData: () => '+91 98765 43210' }, preventDefault: () => { prevented = true; } });
assert.equal(prevented, true);
assert.equal(phone.value, '9876543210');
assert.equal(phoneError.hidden, true);

const submission = form.listeners.get('submit')({ preventDefault() {} });
assert.equal(submitButton.classList.contains('is-sending'), true);
assert.equal(submitButton.disabled, true);
await submission;
assert.match(sentBody, /phone=%2B919876543210/);
assert.equal(submitButton.classList.contains('is-sending'), false);
assert.equal(form.classList.contains('is-submitted'), true);
assert.match(status.textContent, /Thank you!/);
another.dispatchEvent({ type: 'click' });
assert.equal(form.classList.contains('is-submitted'), false);
console.log('Form behavior passed: rejects long numbers, normalizes +91 paste, submits +91, and resets confirmation.');
