---
layer: application
type: application
subject: document-text-extraction
technique: context-decided-escaping
stack: rust
verified_on: 2026-09-25
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# A converter that escaped nothing, and what each repair cost

A local-first scraping service converts fetched pages to Markdown for three
kinds of reader: a model that is handed the page, a readable-snapshot artifact
people open, and a plain-text field one app derives by stripping the Markdown
back off. The toolchain witness is the repository's pinned toolchain file,
which names the 1.96 channel.

The converter walked the page and wrote text nodes and its own markup into one
buffer. It escaped nothing in text except `|` inside table cells. A second
entry point converts one extracted fragment, whose value is stored as a field
for a caller to place.

## Instrument and arms

Every arm ran the same inputs through the project's own converter, behind a
mode switch on a worktree branch, and was read by an oracle outside the
project: render the Markdown with a strict CommonMark+GFM parser (raw HTML
allowed, as a renderer would), strip tags, decode entities, and compare with
the page's visible text as the project itself computes it, whitespace removed.
Positive controls: an unescaped `*x **y** z*` fails the oracle, the escaped
form passes, and the backslash counter reads 1 on `5 \* 3`.

Inputs: a seam table (10 cases where a text character pairs with something
another element emits, one added post hoc and labelled so), a single-run hazard
table (10), a benign table (11: prices, arithmetic, identifiers, a lone star,
comparisons, ampersands, a backslash path), four fragment pairs joined inline
as a caller would, the project's 10 frozen real-page fixtures, and 1,312 real
fragments cut from those pages.

| arm | seam 10 | hazard 10 | benign: escapes | fragment pairs 4 | real pages passing / escapes |
| --- | --- | --- | --- | --- | --- |
| as-is | 0 | 0 | 0 | 0 | 8 / 0 |
| escape every inline-capable character | 10 | 10 | 15 | 4 | 9 / 18 |
| minimal, per run, no lookahead | 6 | 10 | 0 | 0 | 9 / 14 |
| minimal, per run, whatever follows the run assumed unknown | 10 | 10 | 0 | 4 | 9 / 16 |
| minimal, look ahead over the block, escape both halves | 10 | 10 | 0 | 4 | 9 / 16 |
| same, fragment end assumed benign | 10 | 10 | 0 | 0 | 9 / 16 |
| minimal, escape the later half, look ahead for syntax (post hoc; shipped) | 10 | 10 | 0 | 4 | 9 / 9 |

## What the seam showed

The per-run arm failed exactly the four seam cases where the character that
follows cannot be escaped: a backslash before an emitted strong marker, a `!`
before an emitted link, a backtick before an emitted code span, and a
text-text backtick pair (a backslash does not stop a backtick from closing a
span, so escaping the later backtick does nothing). It passed the six text-text
pairs, because the later half saw the earlier one and escaping it broke the
pair. That observation is what the post-hoc arm was declared on, and it held:
the same fidelity as look-ahead-and-escape-both with 9 escapes on the real pages
instead of 16.

On the real pages the lookahead itself found nothing the per-run arm missed:
the one page the escaping repaired was a placeholder in angle brackets that a
renderer swallowed as an unknown tag, which any minimal arm catches. Of the 9
escapes the shipped arm emits there, 2 are needed and 7 are unneeded
single-bracket escapes (`list[string\]`). The remaining failing page is the
converter's own markup, a strong marker with a trailing space inside it, and no
escaping arm touches it.

The fragment-end rule separated its arms only on the constructed pairs (4 of 4
against 0 of 4). Across 1,302 real consecutive fragment pairs the two arms
passed the same count; the unknown-end rule cost 4 extra escapes over 1,312
fragments and bought nothing observed in this tree.

## Floor

- The project's tests for the converter and every crate that consumes it: 858
  passed, 0 failed, 6 ignored. Lint and format checks clean.
- **The pre-existing suite could not see the change.** Deleting the shipped
  arm's lookahead to emitted syntax turned exactly one test red, the new seam
  table; 578 existing library tests stayed green.
- **One consumer did see it.** The app that strips the Markdown to plain text
  failed its own fixture (`Uptake of \<trustworthy> AI`) the moment escaping
  was on, because it deleted markup characters and kept the backslash. It now
  drops the escapes before stripping, and its 14 tests pass.

Shipped as one commit on a measurement branch: the provenance mark and the
post-assembly decision, the two opposing tables as tests, the fragment rule,
the plain-text consumer's unescape, and the feature document.
