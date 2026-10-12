---
layer: application
type: application
subject: evidence-grounded-claims
technique: bracketed-placeholder-over-invention
stack: node
status: forged
verified_on: 2026-10-11
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Five readers, four bounds, one placeholder

Source tree: the fleet's grant-writing platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-11 at `a1e95cb` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `57ddf02` and its ledger row is `3c568f0`,
both on the project's `main`.

## The generator half was already complete

The prompt half of the technique holds without exception. Four prompts write applicant-facing
prose: the draft sections (narrative, budget, logic model), the report sections, the need
statement, and the targeted revision pass that rewrites a section that failed a check. All four
carry the clause, and the draft prompts share it as one constant whose comment reads "every
narrative variant must carry it". The tree also built every downstream use the technique names.
A critic lists unresolved fill-ins. A readiness score turns each one into a blocker. A public
"verified impact" certificate is refused while a report still carries one. The fabrication scans
skip bracketed spans so the honest form is never flagged. The outcome harvester refuses to read a
number inside a placeholder, and its comment calls this its "fail-closed honesty bar".

## What the readers disagreed about

Each of those readers carried its own regular expression for "a placeholder", and the bounds did
not agree:

| Reader | What counts as a placeholder |
| --- | --- |
| fill-in list (readiness, certificate gate, critic flag) | any single-line bracket, 1-60 chars |
| fabrication scans (percentages, counts, amounts) | any single-line bracket, 0-80 chars |
| outcome harvester | any single-line bracket, 1-60 chars |
| proofreader | an ASCII label class, 1-40 chars |
| "quantified" quality gate | any bracket, unbounded, across lines |

The harvester's comment explained the bound: "Spans are short by construction." The project's
own recorded model output says they are not. The quality-gate harness keeps the raw output of
every scenario it ran against the live model. Three result files hold 69 outputs and 157
placeholders, identified by content: a bracket opening with the want verb ("insert", or the Czech
"vložit"), plus one choice slot, `[higher/lower]`. 15 of the 157 run from 61 to 134 characters,
and every one of them opens with "insert". The model follows the technique's *name the want*
rule, then appends an example: "[insert specific barrier, such as transportation or scheduling
conflicts]". One of them carries a figure inside the example: "[insert specific result, e.g., a
15% increase in local housing retention ...]".

Two failures follow. A placeholder of 61-80 characters is exempt from the fabrication scan but
never listed, so the gate cannot see it. And a placeholder over 80 characters is not exempt from
the scan either, so the figure in its example is flagged as a fabrication and harvested as a
reported outcome.

## The paired proof

Arm A is the tree at `a1e95cb`. Arm B moves the grammar into one shared module that every reader
imports. It accepts any single-line bracket of 1-60 characters, as before, and a longer one of up
to about 200 characters only when it opens with a want verb (insert, add, enter, specify,
provide, and the Czech vložit, doplňte, uveďte). The proofreader keeps its stricter short rule
and gains the long form. Both arms replayed the same 69 recorded outputs through the project's
own reader functions. Ground truth was labelled from each span's content, never from a reader
under test.

| Measure | A | B |
| --- | --- | --- |
| placeholders the fill-in list misses | 15 of 157 | 0 |
| sections still holding a fill-in after the writer fills every listed one | 6 of 18 | 0 |
| ... of which readiness, proofreader and certificate reader all come back clean | 6 | 0 |
| example figures inside a placeholder flagged as fabrication | 1 | 0 |
| example figures inside a placeholder harvested as an outcome | 1 | 0 |

The second row is the walk a writer actually takes. The editor shows a list, and the writer fills
what it shows. On A, 6 of the 18 sections that carried a fill-in passed every gate afterwards
with a placeholder still in the text. Three of them were report sections, which is the text a
public certificate links to.

**Floor**, declared before the run: real-figure fabrication flags identical on all 69 outputs,
and no non-placeholder span listed on either arm. Controls: a 120-character want-led span is
listed on B and not on A. A 100-character bracketed aside with no want verb stays prose on both
arms and in both readers. A bare footnote `[1]` is unchanged on both readers. Type check and lint
are clean. The suite has 3,588 passing tests, up from 3,579 with the nine new ones, and the same
two deadline-reminder failures as before the change. The five reader-level new tests fail on
arm A.

## What the tree says about the technique

The seam was chosen to falsify the technique's *machine legibility* ground, which assumes a
bounded pattern the generator stays inside. That assumption failed, and the cause was another of
the technique's own rules. *Name the want* asks for a descriptive placeholder. A model asked to
be descriptive adds examples, and examples make the span long. No rule in the tree bounded its
length: the prompts show only the short form, and nothing says how long a placeholder may be. So
the bound lived only in the readers, five times over, and each author sized theirs to the
examples they had seen.

The structural fact goes beyond this project. Once a placeholder form is a contract between a
generator and several readers, the real failure is readers that disagree with each other, not a
generator that drifts. A span can be exempt from one check and invisible to another at the same
time. That is a free pass, and no single reader's test can see it, because each reader is
correct by its own definition.

## What this realization cannot do

The change makes the readers tolerate long placeholders. It does not stop the model writing
them, and it does not stop example figures appearing inside brackets. A prompt clause for both
(name the want in a few words, never put a figure inside the brackets) is the generator-side
half. It needs a live run of the quality-gate harness, which this run did not make. The short
form still differs between readers on one point: the critic lists a bare footnote `[1]` as a
fill-in, and the proofreader ignores it. That divergence is left to the owner.
