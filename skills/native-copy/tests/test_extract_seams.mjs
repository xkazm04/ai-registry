// Extraction false positives found by the first fleet adoptions (2026-09-14, ascent).
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only.
// Each case is a string the checker reported as copy that no reader ever sees as copy,
// with a negative control proving the neighbouring real copy is still extracted.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCode } from '../scripts/lib/extract.mjs';

const EM = '—';

test('member-call logging is not copy: console.warn / logger.info arguments are skipped', () => {
  const src = `
export function send() {
  console.warn("[email] no provider configured ${EM} nothing was sent");
  logger.info("Retrying the delivery in a moment");
  console?.error("[email] send failed badly");
  return notify("Your invite is on its way");
}
`;
  const texts = extractCode(src, 'src/lib/email/index.ts').map((r) => r.text);
  assert.ok(!texts.some((t) => t.includes('nothing was sent')), 'console.warn argument extracted');
  assert.ok(!texts.some((t) => t.includes('Retrying the delivery')), 'logger.info argument extracted');
  assert.ok(!texts.some((t) => t.includes('send failed')), 'console?.error argument extracted');
  assert.ok(texts.includes('Your invite is on its way'), 'negative control: a real user-facing string must still be extracted');
});

test('aria-hidden decoration is not copy; its sr-only sibling label still is', () => {
  const src = `
export function Cell() {
  return (
    <td>
      <span aria-hidden="true">${EM}</span>
      <span className="sr-only">Not included</span>
    </td>
  );
}
export function Icon() {
  return <p><span aria-hidden={true}>★</span> Rated by teams who ship weekly</p>;
}
export function Visible() {
  return <p aria-hidden="false">Shown and read aloud to everyone</p>;
}
`;
  const texts = extractCode(src, 'src/components/pricing/Cell.tsx').map((r) => r.text);
  assert.ok(!texts.some((t) => t.includes(EM)), `hidden glyph leaked into copy: ${JSON.stringify(texts)}`);
  assert.ok(texts.includes('Not included'), `sr-only label lost: ${JSON.stringify(texts)}`);
  assert.ok(texts.some((t) => t.includes('Rated by teams who ship weekly') && !t.includes('★')), `inline hidden icon handling: ${JSON.stringify(texts)}`);
  assert.ok(texts.includes('Shown and read aloud to everyone'), 'aria-hidden="false" must not hide copy');
});
