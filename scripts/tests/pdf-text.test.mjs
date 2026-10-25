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

test('Tm on a new baseline breaks the line; Tm on the same baseline separates the word', () => {
  const lines = pdfToText(onePage('BT /F1 12 Tf 1 0 0 1 72 700 Tm (Hello) Tj 1 0 0 1 72 680 Tm (World) Tj ET'));
  assert.equal(lines.text, 'Hello\nWorld');
  const words = pdfToText(onePage('BT /F1 12 Tf 1 0 0 1 72 700 Tm (Hello) Tj 1 0 0 1 120 700 Tm (World) Tj ET'));
  assert.equal(words.text, 'Hello World');
});
