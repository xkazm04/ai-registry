#!/usr/bin/env node
// Gate: what this repository GENERATES must not depend on the checkout it was taken from.
//
// Two artifacts are built from bundle bytes and both have now been bitten by the same
// class of defect: catalog.json's content digest, and index.json's law statements.
//
// WHY THIS EXISTS. The digest used to hash raw bytes. Git hands a Windows clone CRLF
// and a Linux clone LF for the same commit, so the hash was a property of the machine
// that ran the builder: whoever wrote catalog.json made every other platform's
// `build-catalog.mjs --check` fail. The catalog-freshness job sat red for weeks against
// hashes generated on a CRLF machine, and a red gate nobody can distinguish from a real
// staleness is a gate that has stopped working.
//
// The fix (newline normalization inside the digest) is one line and would be one line to
// undo by accident. This asserts the property directly instead of trusting that nobody
// does: build the same tree twice — once with LF endings, once with CRLF — and require
// one digest. No network, no deps, nothing written outside a temp directory.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hashBundle, stripCrLf } from './lib/bundle-hash.mjs';
import { extractLawStatements } from './lib/laws.mjs';

const FIXTURE = {
  'index.md': '---\nokf_version: "0.1"\n---\n\n# A bundle\n\nOne line, then another.\n',
  'subject/subject.md': '---\ntype: golden-path\n---\n\n# Subject\n\nBody text.\n',
  'subject/techniques/one.md': '---\ntype: technique\n---\n\n# One\n\nProcedure.\n',
  // A byte that is not valid UTF-8, so a digest that round-tripped through a string
  // would mangle it and this test would notice.
  'subject/raw.bin': Buffer.from([0x00, 0xff, 0x0d, 0x0a, 0xfe, 0x41]),
};

const write = (root, eol) => {
  for (const [rel, content] of Object.entries(FIXTURE)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    if (Buffer.isBuffer(content)) fs.writeFileSync(p, content);
    else fs.writeFileSync(p, content.replace(/\n/g, eol), 'utf8');
  }
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rkb-hash-'));
let failures = 0;
const fail = (msg) => {
  console.error(`  ✗ ${msg}`);
  failures++;
};

try {
  const lf = path.join(tmp, 'lf');
  const crlf = path.join(tmp, 'crlf');
  write(lf, '\n');
  write(crlf, '\r\n');

  const a = hashBundle(lf);
  const b = hashBundle(crlf);

  if (a.hash !== b.hash) {
    fail(`digest depends on line endings — LF ${a.hash} vs CRLF ${b.hash}.\n` +
         `    A catalog written on one platform will fail --check on the other.`);
  }
  if (a.count !== b.count) fail(`file counts differ: ${a.count} vs ${b.count}`);

  // The normalization must not be a blunt "drop every CR": a lone CR is content
  // (old-Mac line endings, and any binary that happens to contain 0x0d).
  const loneCr = stripCrLf(Buffer.from([0x41, 0x0d, 0x42]));
  if (loneCr.length !== 3) fail('a CR not followed by LF was dropped — that is content, not a line ending');
  const crlfPair = stripCrLf(Buffer.from([0x41, 0x0d, 0x0a, 0x42]));
  if (crlfPair.length !== 3 || crlfPair[1] !== 0x0a) fail('a CRLF pair did not normalize to a single LF');

  // Real content changes must still move the digest, or the normalization has
  // flattened something it should not have.
  fs.appendFileSync(path.join(lf, 'subject/subject.md'), 'One more sentence.\n');
  if (hashBundle(lf).hash === a.hash) fail('an edited file did not change the digest');

  // ---- the same property, for the OTHER generated artifact
  //
  // The digest is not the only thing built from bundle bytes: index.json embeds each law's
  // statement, lifted out of `_laws.md` by pattern. That parser ends a statement at a blank
  // line by requiring the character after a newline not to be one — and on a CRLF checkout
  // the character sitting there is `\r`, which satisfied the class. The match ran through
  // the blank line and swallowed every following paragraph.
  //
  // It only bit the one bundle whose laws carry a second elaborating paragraph, which is
  // why it survived: every other bundle's law is followed immediately by a `#` heading,
  // where the same pattern stops correctly on both platforms. `build-index --check` was
  // green on the machine that wrote the index and red in CI, indistinguishable from real
  // staleness, and it sat red on main across two pushes before anyone read the log.
  //
  // So the fixture below is deliberately the shape that broke: a multi-paragraph law.
  const MULTI = [
    '# Laws',
    '',
    '## <a id="one"></a>One',
    '',
    'The statement itself.',
    '',
    'An elaborating paragraph that must NOT be part of the statement.',
    '',
    '## <a id="two"></a>Two',
    '',
    'A single-paragraph law.',
    '',
  ].join('\n');

  const lawsLf = extractLawStatements(MULTI);
  const lawsCrLf = extractLawStatements(MULTI.replace(/\n/g, '\r\n'));

  for (const id of ['one', 'two']) {
    if (lawsLf[id] !== lawsCrLf[id]) {
      fail(
        `law "${id}" parses differently across line endings —\n` +
          `    LF:   ${JSON.stringify(lawsLf[id])}\n` +
          `    CRLF: ${JSON.stringify(lawsCrLf[id])}\n` +
          '    An index written on one platform will fail --check on the other.',
      );
    }
  }
  if (lawsLf.one !== 'The statement itself.') {
    fail(`a law statement did not stop at its blank line — got ${JSON.stringify(lawsLf.one)}`);
  }
  // Assert the instrument: a fixture that parsed to nothing would pass every check above.
  if (Object.keys(lawsLf).length !== 2) {
    fail(`the law fixture yielded ${Object.keys(lawsLf).length} statements, expected 2 — THE PARSER IS BROKEN`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures) {
  console.error(`\nbundle digest is NOT checkout-stable — ${failures} failure(s).`);
  process.exit(1);
}
console.log(
  'generated output is checkout-stable — digest identical across LF and CRLF trees and still ' +
    'content-sensitive; law statements parse identically and still stop at their blank line',
);
