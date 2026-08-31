# Spec: `document-text-extraction` — a new subject in software-engineering

    status:   PROPOSED
    run:      anydoc-ocr (/intake, 2026-08-31)
    source:   github.com/firecrawl/anydoc @ 261fc257d17c3eab0f673be31c408fd9fdc2171a
    operator: picked at Phase 5 triage — "forge new path regarding OCR"

## Placement (verified against the authority, not against a count)

    bundle:    software-engineering
    category:  integration          (flat; holds 8 subjects, cap is 10 — a 9th keeps it flat)
    path:      knowledge/software-engineering/integration/document-text-extraction/
    laws link: ../../../_laws.md    from techniques/  (3 levels — matches import-normalization)

`taxonomy.json` → `software-engineering` → categories → `integration` currently lists:
`cicd-monitoring, connector-catalog, embedded-preview, import-normalization,
markdown-vault, sql-console, templates-scaffolding, web-scraping`. Append
`document-text-extraction` — **append, never reorder**.

## Why this is a subject and not an amendment

`research-map` over 340 subjects in 8 bundles returns, verbatim:

    term: "ocr"                → PRIOR ART: none. The corpus has never heard of this.
    term: "decompression bomb" → PRIOR ART: none.
    term: "amplification"      → PRIOR ART: none.

Three neighbours cover *parts* of the ground and each stops at a stated boundary. The
subject exists in the space none of them claims.

**`integration/import-normalization`** — nearest, same category. Its
`lossy-conversion-disclosure` grades loss on a closed scale (`full / approximate /
data-only / dropped`) assigned **in the adapter's capability table at mapping-authoring
time, by the person who knew what the mapping does**. That is loss known *statically, per
feature, per format pair*. A document extractor's loss is per-*region of one instance* —
which page of *this* file had no text layer — discovered at extraction time and unknowable
in advance. A capability table cannot express "page 7 of this upload." Its pipeline also
ends in a `review-before-commit` gate over entities that may later *execute*; extraction
has no review gate and produces inert text. Same category, adjacent, different problem.

**`backend-platform/resilience/error-handling`** — owns *what a failure is and who learns
of it*. This subject owns *whether a partial extraction is a failure at all*, which
error-handling's taxonomy assumes has already been decided upstream.

**`recruiting/candidate-evidence/cv-parsing-and-career-reading`** — a different bundle, and
the one place the corpus already says "never let loss masquerade as absence." It says it
about *résumés and whether a person gets a phone call*: its failure model is fairness and
scoring bias. **Do not link to it — cross-bundle links are forbidden.** State the boundary
in prose on this side: that subject reads a persuasive document written by a person under a
genre convention; this one reads a binary container written by software, and its verdict is
a contract, not a score.

## The evidence, and what it cost the source to learn

Four release notes on one crate, read in order, are an account of the same defect found
four times: **content vanishing from a lossy conversion without the output saying so.**

| version | what vanished | the fix |
| --- | --- | --- |
| v0.2.1 | equations, entirely | render them; escape `$` in prose |
| v0.2.2 | *regression* — every `$` escaped, so prices became `\$20.00` | escape only where a math span could actually open |
| v0.2.3 | spreadsheet checkboxes — "a sheet of tick boxes lost its answers" | one node, rendered by the renderer |
| v0.2.4 | scanned pages, "silently missing" | typed refusal **naming the pages** |

The rule the source states for v0.2.4, in `src/formats/pdf.rs`, is the subject's spine:

> OCR is out of scope here: a document with scanned or image-only pages errors naming
> them, **whether that is every page or one of a hundred, because output missing those
> pages would read as complete.**

The threshold is not a fraction. It is whether the consumer can *tell*.

## Proposed techniques

Five. Each carries the decision rule it must state; a draft that describes the mechanism
without the rule has not earned the slug.

### 1. `unreadable-region-refusal`

**Rule: a partial result is an error when its partiality is invisible in the result, and
the locus must survive as a list, never as a count.**

- The fraction is irrelevant — one page in a hundred refuses, because the output has no
  way to say which hundredth is absent. Cites `failure-not-empty-success`.
- The refusal is *typed and structured*: `ConvertError::NeedsOcr { pages: Vec<u32>,
  page_count: u32 }`, not a message. The surface that renders only `Display` gets the
  pages *in* the message — the source pins this with a test whose name is the reason:
  `/// The CLI shows only the message, so it has to name the pages.`
- **Count vs. list is the load-bearing half, and it is where the corpus can be new.** A
  count answers "how bad", a list answers "which" — and only the list can be *handed to
  the thing that fixes it*. See the measured instance below: a fleet project computes the
  count, stores it in a column, renders it in a warning, and cannot route the pages to the
  recognition engine sitting in the same binary, because the page numbers were dropped at
  the point they were counted. Cites `unknown-is-not-a-value`.
- Must state the one case where a count is enough: when nothing downstream can act
  per-region, a count is honest reporting and a list is unused ceremony. Name that test.

### 2. `screen-then-confirm-detection`

**Rule: a cheap detector may over-report only if the confirming stage is the real
operation, not a second heuristic — and it must run on the flagged subset alone.**

From `src/formats/pdf.rs`, with the source's own comment as the anchor:

    // Detection samples content streams and over-reports short or
    // image-heavy text pages; extraction knows which of them yielded none.

Stage 1 samples content streams, is deliberately biased to false positives, and is cheap.
Stage 2 is full extraction *scoped to the flagged pages*, and its verdict is "did the real
work produce nothing" — a question a heuristic cannot get wrong in the way a heuristic
can. The technique must be explicit that a second heuristic would only relocate the error,
and that the economics are what license the over-reporting: the expensive stage is paid
for on the flagged subset, so a screen tuned to never miss costs the flagged count, not
the corpus.

### 3. `recognition-boundary-and-escalation`

**Rule: an extractor that will not do recognition must say so as a contract, and the
escalation must be opt-in, single-purpose, and carry only what failed.**

- The boundary is a published property, not an implementation detail: the crate's own
  skill file states it as a rule for its callers (exit code 3, "Personas reads the text
  layer and does not run OCR" is the same statement in a different codebase).
- The escalation sends **the document that failed with `needsOcr`, and only that** —
  scoping the expensive path to the input the cheap path refused. Not "route PDFs to the
  vision model"; route the *refusals*.
- Cites `absent-guard-is-loud` on the inverse: a recognition path that is on by default
  turns every born-digital document into a vision-model bill, and one that must be
  switched on protects nobody. State which way this guard should default and why.

### 4. `extraction-confidence-bands`

**Rule: the sparse band is not resolvable by lowering a confidence score, because a score
does not tell a caller what to re-run.**

The empty/sparse/full split appears independently in both trees read for this run — and
they resolve the middle band differently. One confirms it by re-running extraction; the
other attaches a reduced confidence float and keeps the chunk. The technique must name the
discriminator: a confidence score is right when the consumer *ranks* results and wrong when
the consumer must *decide whether to re-acquire the region*. Read the two together — this
is the technique with the most room to be genuinely new, and the least evidence, so keep
it modest and state what is unmeasured.

### 5. `amplification-caps-on-untrusted-documents`

**Rule: an amplification limit must bound the count and the payload, because bounding
count alone leaves count × payload unbounded.**

From `src/package/limits.rs`, which is the densest 40 lines in the tree. Three rules, each
with the source's own justification:

- **Two caps on one expansion.** `MAX_EXPANSION` bounds grid positions; `MAX_EXPANSION_TEXT_BYTES`
  bounds "the memory a small document can amplify by repeating content-bearing cells." A
  positional cap does not bound memory when each position carries content.
- **A derived cap needs a test on the constant it was derived from.** `MAX_XML_NODES` is
  "sized from the measured worst-case DOM cost (~400 bytes/node, see the node-cap memory
  test) so a saturating part stays around the archive budget" — the caps form a *system*,
  chosen so saturating one lands inside another, and the derivation rots silently without
  a test pinning the per-unit cost. Cites `derivation-names-recomputation`.
- **Non-configurability is earned by distance, not asserted.** "Deliberately not
  configurable: real-world documents sit orders of magnitude below every value here." The
  decision rule the technique must state: a cap is safe to freeze when the legitimate
  distribution sits orders of magnitude below it; when it does not, it is a tuning knob
  and you have chosen the wrong cap. Cites `absent-guard-is-loud`.

State the boundary with `backend-platform/resilience/rate-limiting` in prose, on this
side: that subject derives a *rate* from cost-per-admission and legitimate cadence — a
budget over time. These are fixed structural caps on the shape of **one** input, derived
from nothing about traffic, and a limiter cannot express them.

## Boundaries this subject must NOT absorb

- **Rate and quota limiting.** `rate-limiting` owns budgets over time. Row 5 above is the
  only limits content here and it is per-input-shape.
- **Error taxonomy, doors, propagation.** `error-handling` owns them. This subject decides
  *whether a partial extraction is a failure*; that one decides what happens to the failure
  once it is one. Reference it by name in prose, do not restate it.
- **Foreign-format import of executable artifacts.** `import-normalization`'s territory,
  including capability tables, the loss ledger, and review-before-commit.
- **Anything about résumés, candidates, scoring or fairness.** Different bundle.
- **Prompt construction for a vision model.** Not this subject at any depth.

## Open questions the drafter must decide, not discover

1. **Does the refusal belong to the extractor or to the caller?** anydoc refuses the whole
   document; a knowledge-base ingest might reasonably index the readable pages *and* record
   the unreadable ones as a queued obligation. Both are defensible and they differ on
   whether the consumer can act per-region. Decide, state the discriminator, and do not
   hedge — the golden path's opening should carry it.
2. **Where does the page list live once it survives?** A column, a sidecar, or the
   chunk records themselves. The measured instance below has a column for the count and
   no home for the list; that is the concrete form of the question.
3. **Is `extraction-confidence-bands` a technique or a section inside
   `unreadable-region-refusal`?** Thinnest of the five. If the draft cannot state its
   decision rule in one sentence, fold it in and forge four.

## Instances a drafter can open (this is what makes the dispatch cheap)

Both trees are on this machine and were read during this run.

- **The source**, cloned at `261fc25`: `src/formats/pdf.rs` (52 lines, the whole
  screen-then-confirm cascade), `src/error.rs` (the typed refusal + the test that pins
  it), `src/package/limits.rs` (40 lines, every cap with its justification),
  `.github/releases/v0.2.4.md`.
- **A fleet project already standing on the gap**, resolved via `loadFleet()` — the seam is
  a text-layer ingest that computes an empty-page *count*, admits the document as indexed
  whenever at least one page had text, and cannot hand the unreadable pages to the
  recognition command that exists in the same binary. Do not cite its paths in the golden
  path or the techniques; the application document written by the intake run carries them.

## Why proposed rather than written inline

Five techniques with a golden path is a subject, and the run that found it landed two
other techniques and a cross-repo change in the same session. It is `XL` because the
*boundary work* is the expensive part: three neighbours had to be opened and read before
the placement was defensible, and two of them (`lossy-conversion-disclosure`,
`cv-parsing-and-career-reading`) say things close enough that a careless draft would
duplicate them. That reading is done and is written down above — which is exactly why this
is dispatched now, in-session, rather than banked.

## Instruction to the worker

Read `docs/forge-brief.md`, `docs/harvest-brief.md`, `docs/rkb-profile.md`, this spec, and
every neighbour named above, in that order. Draft expert-first. Reconcile read-only against
the cloned source tree. Run `node scripts/check-bundles.mjs` on your own subject. **Run no
git.** Return a report naming every override you made.

**Override this spec where it is wrong, and argue the override.** Two prior runs' workers
overrode their briefs and both were right. In particular: if the boundary argument in "Why
this is a subject" does not survive contact with the neighbours' actual text, say so rather
than forging around it — a fifth technique dropped for a stated reason is a better outcome
than five forged to fill a table.
