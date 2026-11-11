// scripts/lib/pdf-text.mjs over synthetic, uncompressed PDFs built in the test. Each case is
// a shape a real generator emits; the reader used to lose words on every one of them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isPdf, pdfToText } from '../lib/pdf-text.mjs';

/** Objects numbered from 1, in order; a trailer with no xref (the reader never needs one). */
function pdf(objects) {
  let s = '%PDF-1.4\n';
  objects.forEach((body, i) => { s += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  return Buffer.from(`${s}trailer\n<< /Root 1 0 R >>\n%%EOF\n`, 'latin1');
}
const stream = (content) => `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
const CATALOG = '<< /Type /Catalog /Pages 2 0 R >>';
const PAGES = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
const HELVETICA = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
/** One page, one Type1 font as /F1, the given content stream. */
const onePage = (content) => pdf([CATALOG, PAGES,
  '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
  stream(content), HELVETICA]);

test('isPdf sniffs the magic bytes, not the name', () => {
  assert.equal(isPdf(onePage('BT ET')), true);
  assert.equal(isPdf(Buffer.from('<html>%PDF-</html>')), false);
});

test('control: Td and ET break lines', () => {
  const r = pdfToText(onePage('BT /F1 12 Tf 72 700 Td (First line) Tj 0 -14 Td (Second line) Tj ET'));
  assert.equal(r.pages, 1);
  assert.equal(r.text, 'First line\nSecond line');
});

test('T* starts a new line instead of fusing the next line onto this one', () => {
  const r = pdfToText(onePage('BT /F1 12 Tf 14 TL (First line) Tj T* (Second line) Tj ET'));
  assert.equal(r.text, 'First line\nSecond line');
});

test("the ' and \" operators move to the next line BEFORE showing their string", () => {
  const r = pdfToText(onePage("BT /F1 12 Tf 14 TL (Alpha) Tj (Beta) ' 1 2 (Gamma) \" <44656c7461> ' ET"));
  assert.equal(r.text, 'Alpha\nBeta\nGamma\nDelta');
});

// A subset font whose codes 01 02 mean "H" "i" only through its /ToUnicode CMap (object 7).
// Without the map the codes are control bytes and the word vanishes - which is exactly what
// happened whenever the font was reachable only through an indirect reference.
const CMAP = stream('begincmap\n1 beginbfchar\n<01> <0048>\nendbfchar\n1 beginbfchar\n<02> <0069>\nendbfchar\nendcmap');
const SUBSET = '<< /Type /Font /Subtype /TrueType /BaseFont /ABCDEF+Sub /ToUnicode 7 0 R >>';
const subsetPdf = ({ pages = PAGES, page, six = '<< >>' }) =>
  pdf([CATALOG, pages, page, stream('BT /F1 12 Tf <0102> Tj ET'), SUBSET, six, CMAP]);

test('control: a direct /Resources << /Font << >> >> resolves the ToUnicode map', () => {
  const r = pdfToText(subsetPdf({ page: '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>' }));
  assert.equal(r.text, 'Hi');
});

test('an indirect /Resources object still resolves the page fonts', () => {
  const r = pdfToText(subsetPdf({
    page: '<< /Type /Page /Parent 2 0 R /Resources 6 0 R /Contents 4 0 R >>',
    six: '<< /Font << /F1 5 0 R >> /ProcSet [/PDF /Text] >>',
  }));
  assert.equal(r.text, 'Hi');
});

test('an indirect /Font dictionary still resolves the page fonts', () => {
  const r = pdfToText(subsetPdf({
    page: '<< /Type /Page /Parent 2 0 R /Resources << /Font 6 0 R >> /Contents 4 0 R >>',
    six: '<< /F1 5 0 R >>',
  }));
  assert.equal(r.text, 'Hi');
});

test('resources inherited from the /Pages node resolve for a page that declares none', () => {
  const r = pdfToText(subsetPdf({
    pages: '<< /Type /Pages /Kids [3 0 R] /Count 1 /Resources << /Font << /F1 5 0 R >> >> >>',
    page: '<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>',
  }));
  assert.equal(r.text, 'Hi');
});

test('a bfrange with an array destination maps each code to its own string', () => {
  const objs = [CATALOG, PAGES, '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    stream('BT /F1 12 Tf <010203> Tj ET'), SUBSET, '<< >>',
    stream('begincmap\n1 beginbfrange\n<01> <03> [<0048> <0069> <00660066>]\nendbfrange\nendcmap')];
  assert.equal(pdfToText(pdf(objs)).text, 'Hiff');
});

test('a bfrange with a multi-unit destination increments its last unit', () => {
  const objs = [CATALOG, PAGES, '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    stream('BT /F1 12 Tf <0102> Tj ET'), SUBSET, '<< >>',
    stream('begincmap\n1 beginbfrange\n<01> <02> <00660061>\nendbfrange\nendcmap')];
  assert.equal(pdfToText(pdf(objs)).text, 'fafb');
});

test('Tm on a new baseline breaks the line; Tm on the same baseline separates the word', () => {
  const lines = pdfToText(onePage('BT /F1 12 Tf 1 0 0 1 72 700 Tm (Hello) Tj 1 0 0 1 72 680 Tm (World) Tj ET'));
  assert.equal(lines.text, 'Hello\nWorld');
  const words = pdfToText(onePage('BT /F1 12 Tf 1 0 0 1 72 700 Tm (Hello) Tj 1 0 0 1 120 700 Tm (World) Tj ET'));
  assert.equal(words.text, 'Hello World');
});

// ---- the corrupt band (extraction-yield-bands, "Corrupt is the band teams do not build") ----
// A body face holding about 90 % of the page's letters (/F1, Helvetica) and a 38-character
// heading in a second face with NO /ToUnicode table (/F2). Before the letter statistics, cases
// (a) and (b) passed research-ingest's non-text check at 0 %: (a) because the cleanup deleted
// the heading first, (b) because a shifted alphabet is printable ASCII.
const BODY = [
  'The committee reviewed the annual report and agreed that the outlook for the coming year',
  'remains positive overall. Revenue rose in every quarter, operating costs were held close to',
  'the plan, and the board approved a modest increase in the research budget for the new',
  'product line. Several open questions about the supply chain were deferred to the next',
  'meeting, where the finance team will present a revised forecast to the members.',
];
const HEADING = 'Quarterly revenue grew across regions';
const DISPLAY = '<< /Type /Font /Subtype /Type1 /BaseFont /ABCDEF+Display >>';
const hex = (codes) => `<${codes.map((c) => c.toString(16).padStart(2, '0')).join('')}>`;
const ascii = (str) => [...str].map((c) => c.charCodeAt(0));
/** One page: the heading run (codes, shown in /F2) above the body (shown in /F1). */
const twoFaces = (headingCodes) => pdf([CATALOG, PAGES,
  '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
  stream(`BT /F2 18 Tf 72 740 Td ${hex(headingCodes)} Tj /F1 11 Tf 0 -24 Td ${BODY.map((l) => `(${l}) Tj 0 -14 Td`).join(' ')} ET`),
  HELVETICA, DISPLAY]);
const caesar = (str, k) => str.replace(/[a-z]/gi, (c) => {
  const b = c < 'a' ? 65 : 97;
  return String.fromCharCode(((c.charCodeAt(0) - b + k) % 26) + b);
});
const namesF2 = (r) => r.corruption.corrupt.some((c) => c.scope === 'font' && /\/F2/.test(c.font));
const namesF1 = (r) => r.corruption.corrupt.some((c) => /\/F1/.test(c.font ?? ''));

test('control: a clean mixed-font page is clean, and its text is unchanged', () => {
  const r = pdfToText(twoFaces(ascii(HEADING)));
  assert.equal(r.text, `${HEADING}\n${BODY.join('\n')}`);
  assert.equal(r.corruption.verdict, 'clean');
  assert.deepEqual(r.corruption.corrupt, []);
  assert.equal(r.corruption.share, 0);
});

test('(a) a font with no table whose codes are 0x01-0x1f is named corrupt, though the cleanup deletes it', () => {
  // 0x09/0x0a/0x0d are whitespace to every reader; a glyph-index face uses the rest of the range.
  const CTRL = Array.from({ length: 31 }, (_, i) => i + 1).filter((c) => ![0x09, 0x0a, 0x0d].includes(c));
  const codes = Array.from({ length: HEADING.length }, (_, i) => CTRL[i % CTRL.length]);
  const r = pdfToText(twoFaces(codes));
  assert.equal(r.text, BODY.join('\n'), 'the cleaned text is what it was: the heading vanishes');
  assert.equal(r.corruption.verdict, 'corrupt');
  assert.ok(namesF2(r), JSON.stringify(r.corruption));
  assert.ok(!namesF1(r), 'the healthy body face is not condemned');
  assert.equal(r.corruption.corrupt.find((c) => c.scope === 'font').reason, 'control-glyphs');
  assert.ok(r.corruption.share > 0 && r.corruption.share < 0.5, 'a heading is not document-wide');
});

test('(b) a letter-for-letter substitution in printable ASCII is named by its own vowel share', () => {
  const cipher = caesar(HEADING, 1); // 'Rvbsufsmz sfwfovf ...': vowel share 0.09, all printable
  const r = pdfToText(twoFaces(ascii(cipher)));
  assert.equal(r.text, `${cipher}\n${BODY.join('\n')}`, 'text is unchanged; the band rides beside it');
  assert.equal(r.corruption.verdict, 'corrupt');
  assert.ok(namesF2(r), JSON.stringify(r.corruption));
  assert.ok(!namesF1(r));
  const f2 = r.corruption.corrupt.find((c) => c.scope === 'font');
  assert.equal(f2.reason, 'vowel-share');
  assert.ok(f2.vowelShare < 0.2);
  assert.ok(!r.corruption.corrupt.some((c) => c.scope === 'page'), 'the page-wide share stays natural - only the per-font check sees it');
});

test('control: a stray 10-letter acronym run in an odd face is below the floor and does not flag the page', () => {
  const r = pdfToText(twoFaces(ascii('XKCDBRTMNP')));
  assert.equal(r.corruption.verdict, 'clean');
  assert.deepEqual(r.corruption.corrupt, []);
});

test('a substitution that keeps a natural vowel share is named by its letter profile, document-wide', () => {
  // Shift 1 sends t,h,n,d onto u,i,o,e: 'Uif dpnnjuuff sfwjfxfe' has vowels to spare.
  const cipher = caesar(BODY.join(' '), 1);
  const r = pdfToText(onePage(`BT /F1 12 Tf 72 700 Td (${cipher}) Tj ET`));
  assert.equal(r.text, cipher);
  assert.equal(r.corruption.verdict, 'corrupt');
  assert.ok(r.corruption.corrupt.every((c) => c.reason === 'letter-profile'), JSON.stringify(r.corruption));
  assert.ok(r.corruption.corrupt[0].vowelShare >= 0.2, 'the vowel share alone would have passed it');
  assert.equal(r.corruption.share, 1, 'the whole document is condemned, which research-ingest treats as fatal');
});

test('control: a page of XML element names and /Lang tags is not condemned for its missing vowels', () => {
  // Shape of a real bank's SEPA format guide (2026-11-11): vowel-dropped ISO 20022 tags, each
  // line preceded by a marked-content `cs-CZ` run, read 0.02-0.19 vowel share before the filter.
  const tags = ['DbtrAgt', 'ChrgsAcct', 'Ccy', 'CdtTrfTxInf', 'PmtId', 'SvcLvl', 'CtgyPurp', 'Othr', 'Cd', 'Nm', 'Ustrd', 'Ctry'];
  const lines = tags.flatMap((tag) => ['(cs-CZ) Tj 0 -14 Td', `(<${tag}>) Tj 0 -14 Td`, `(</${tag}>) Tj 0 -14 Td`]);
  const r = pdfToText(onePage(`BT /F1 12 Tf 72 700 Td (The payment order carries these elements.) Tj 0 -14 Td ${lines.join(' ')} ET`));
  assert.notEqual(r.corruption.verdict, 'corrupt', JSON.stringify(r.corruption));
});

test('text with no letters to judge is unknown, never clean', () => {
  const r = pdfToText(onePage('BT /F1 12 Tf 72 700 Td (2024 2025 2026 1.5 3.25 4,700 16,000 89.7 55.2 21.1) Tj ET'));
  assert.equal(r.corruption.verdict, 'unknown');
  assert.deepEqual(r.corruption.corrupt, []);
});
