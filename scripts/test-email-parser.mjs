import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const parse = vm.runInNewContext(`${readFileSync('integrations/google-sheets/Code.gs', 'utf8')}\nemailField_;`, {});
assert.equal(parse('Mobile Number:\r\n+919000000000\r\n', 'Mobile Number'), '+919000000000');
assert.equal(parse('Mobile Number (optional):\r\n9037538485\r\n', 'Mobile Number (optional)'), '9037538485');
assert.equal(parse('Mobile Number:\r\n\r\n---\r\n', 'Mobile Number'), '');
console.log('Email parser passed: current label, older label, and empty phone.');
