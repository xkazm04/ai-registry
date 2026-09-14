// Second round of fixes from the first eight fleet adoptions (2026-09-14).
//
// `node --test "skills/native-copy/tests/*.mjs"` - builtins only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCode, makeRecord } from '../scripts/lib/extract.mjs';
import { lintRecords } from '../scripts/lib/rules.mjs';
import { contractFor } from '../scripts/lib/contract.mjs';
import { formatHuman } from '../scripts/lib/report.mjs';

const EM = '—';

test('a dash-joined page title is copy, so a banned dash in it is seen (was skipped as non-prose)', () => {
  const src = `
export const metadata = { title: "Foundry ${EM} Gravitone" };
const TITLE = "Trust & compliance ${EM} KandiDate";
const ID = "foundry-gravitone";
`;
  const recs = extractCode(src, 'app/foundry/page.tsx');
  const texts = recs.map((r) => r.text);
  assert.ok(texts.includes(`Foundry ${EM} Gravitone`), JSON.stringify(texts));
  assert.ok(texts.includes(`Trust & compliance ${EM} KandiDate`), JSON.stringify(texts));
  assert.ok(!texts.includes('foundry-gravitone'), 'negative control: an identifier is still not copy');
  const dash = lintRecords(recs, contractFor({ dash: { emDash: 'ban' } })).filter((f) => f.rule === 'EN-DASH' && f.severity === 'error');
  assert.equal(dash.length, 2);
});

test('HTTP response bodies are not landing copy: new Response / NextResponse.json arguments are skipped', () => {
  const src = `
export async function GET() {
  if (!code) return new Response("Share code is required", { status: 400 });
  return NextResponse.json({ error: "Something went wrong on our side" }, { status: 500 });
}
export const heading = "Share your ranking with friends";
`;
  const texts = extractCode(src, 'src/app/api/share/og-image/route.tsx').map((r) => r.text);
  assert.ok(!texts.some((t) => t.includes('Share code is required')), JSON.stringify(texts));
  assert.ok(!texts.some((t) => t.includes('went wrong on our side')), JSON.stringify(texts));
  assert.ok(texts.includes('Share your ranking with friends'), 'negative control: real copy in the same file');
});

test('EN-EXCLAIM: sibling catalog messages are not one page; component files still are one surface', () => {
  const catalog = [
    makeRecord('messages/en.json', 1, 'apply.acceptedMessage', "You're in! Thanks for applying."),
    makeRecord('messages/en.json', 2, 'apply.declinedMessage', 'Thanks for your interest! We will keep your details.'),
    makeRecord('messages/en.json', 3, 'apply.alreadyMessage', 'Wow! Amazing! You applied already.'),
  ];
  const cat = lintRecords(catalog, contractFor({})).filter((f) => f.rule === 'EN-EXCLAIM');
  assert.deepEqual(cat.map((f) => f.key), ['apply.alreadyMessage'], 'only the message with two marks is flagged');

  const component = [
    makeRecord('src/components/Modal.tsx', 10, '<p>', 'Blueprint created!'),
    makeRecord('src/components/Modal.tsx', 20, '<p>', 'Link copied!'),
  ];
  const comp = lintRecords(component, contractFor({})).filter((f) => f.rule === 'EN-EXCLAIM');
  assert.equal(comp.length, 1, 'the second exclamation on one component surface is still a finding');
});

test('report: by default only new errors are listed; baselined errors and warnings are counted', () => {
  const base = { file: 'messages/en.json', line: 1, key: 'a', text: 'x', span: 'x', index: 0, message: 'm' };
  const findings = [
    { ...base, rule: 'EN-DASH', severity: 'error', baselined: true, key: 'old' },
    { ...base, rule: 'EN-DASH', severity: 'error', baselined: false, key: 'new.one' },
    { ...base, rule: 'EN-LATIN', severity: 'warn', key: 'hint' },
  ];
  const summary = { strings: 3, fragments: 0, files: 1, sources: 1, unreadable: 0, errors: 2, newErrors: 1, warnings: 1, notes: [] };
  const quiet = formatHuman(findings, summary);
  assert.ok(quiet.includes('new.one'));
  assert.ok(!quiet.includes(' old '), 'baselined error must not be listed by default');
  assert.ok(!quiet.includes(' hint '), 'warning must not be listed by default');
  assert.match(quiet, /not listed: 1 baselined error\(s\), 1 warning\(s\)/);
  assert.match(quiet, /checked 3 strings/, 'the coverage line is always printed');
  const full = formatHuman(findings, summary, { allFindings: true });
  assert.ok(full.includes(' old ') && full.includes(' hint '));
});
