---
layer: technique
type: technique
subject: crash-forensics-attribution
technique: crash-signature-over-id-equality
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
use_when: [matching a new crash against previously diagnosed ones, deduplicating a crash corpus, a known-crash lookup never finds anything]
shared_with: []
---

# Crash signature over identifier equality

The concern: recognising that the crash in front of you is one you have already diagnosed. Get
this wrong and the corpus never pays back — every crash is new, every diagnosis re-derived, and
the archive of hard-won root causes sits there matching nothing.

## Why identifiers cannot be the key

The tempting key is an identifier the report already carries: a crash id assigned by the
collector, a report id, a session id, a build hash, a timestamp. Every one of these is an
identity of the **occurrence**, and occurrences are unique by construction. Matching on them
gives a lookup that is correct, fast, and has a hundred percent miss rate against a corpus that
contains the answer — silently, which is what makes it durable. Nothing errors; the tool reports
"no known diagnosis" and everyone believes the corpus is thin. The characteristic shape is a
headline capability that only ever fires for the authored examples, because those were the only
records whose ids were known when the lookup was written.

The key must be a property of the **crash**, not of the report: its shape.

## What a signature is

A description of the failure's shape, every field **derived, never authored**. Five components:

1. **The fault class** — access violation, assertion failure, collected-object reference, stack
   exhaustion, out of memory, unhandled exception. Coarse, cheap, survives bad symbolisation.
2. **The culprit symbol**, kept whole and split into its owning type and its bare method name —
   the split is what enables partial credit below.
3. **The culprit file, basename only, lowercased.** Real captures routinely omit the directory;
   requiring a full path fails on exactly the reports that came from users.
4. **The subsystem it was attributed to**, or the honest `unknown` when attribution declined.
5. **The canonical vocabulary terms** the error text and frames mention, deduplicated and
   sorted. Drawn from every frame including engine frames — an engine frame names the subsystem
   it belongs to even though it is not evidence of *ownership*.

Keep it a readable structure, not an opaque hash: a wrong key only ever gets corrected by
someone who could read it.

Signatures then serve two questions, and one key cannot answer both. **Bucketing** — same crash,
for grouping and counting — wants one stable identity string from the **identity fields only**:
fault class, culprit symbol, culprit file, subsystem. Deliberately *not* the vocabulary terms,
since an error message naming one extra engine type is the same crash and would bucket as new.
**Corpus matching** — do we already have a diagnosis — wants graded similarity. Keep the two
mechanisms separate, and let bucketing be the coarser grain.

## Similarity, a floor, and a strength band

Do not compare signatures for equality. Compare component by component with weights that **sum
to exactly 1.0**, so the result is a real fraction of the available evidence rather than an
arbitrary point total meaningless outside its own implementation. A workable split:

fault class **0.25** (the partition); culprit symbol **0.30**, the strongest discriminator of
*which* crash this is; culprit file **0.15** and subsystem **0.15** as corroboration; shared
vocabulary **0.15**, the weakest signal, since two unrelated crashes both naming the same
memory-fault constant have said very little.

Award **half** the symbol weight when the owning type matches but the method differs, or the
method matches but the type differs. Score shared vocabulary as an overlap ratio — shared over
total distinct — rather than a count, so a candidate with a huge term set cannot win on volume.

Then two thresholds: a **match floor** around **0.55** — more than half the available evidence —
below which there is **no match** and the crash is reported undiagnosed rather than handed the
nearest thing on the shelf, and a **strong band** at **0.75** separating a strong match from one
that is weak but real. Verify the floor against your own weights: a bare shared fault class plus
some shared vocabulary must not reach it, while the same culprit symbol in the same file and
subsystem must clear it even across differing fault classes.

Three rules govern the comparison, each load-bearing:

- **Missing evidence scores zero, never agreement.** Two crashes that both failed to attribute
  a subsystem have not agreed on one; two with no vocabulary have not matched on the empty set.
  An honest `unknown` must never manufacture similarity — that is exactly how the gates upstream
  get laundered into a false match downstream.
- **The comparison is symmetric.** A against B and B against A must give the same number, or the
  answer depends on iteration order.
- **It carries its reasons.** Emit the agreements and the differences beside the number; the
  differences are what make a weak match legible rather than merely low.

Round the emitted similarity to a fixed number of places; a displayed number that jitters in its
last digits destroys confidence in everything beside it.

## What must be normalised away

Anything occurrence-specific left in the signature causes a silent non-match, indistinguishable
from an empty corpus.

- **Addresses and offsets** — absolute addresses, base offsets, `+0x…` suffixes, relative
  virtual addresses; they differ per machine, per build, per load.
- **Line numbers**, unless builds are byte-identical: a one-line edit above the fault shifts
  every line number and breaks every stored signature.
- **Instance identifiers appended to object names** — runtimes suffix live instances with a
  counter or unique id; two identical crashes on two objects of one class differ only in that
  counter, and stripping it is what makes them compare equal.
- **Occurrence identity generally** — thread ids and numerically-suffixed thread names,
  timestamps, session and user ids, machine names, absolute paths (reduce to the
  project-relative tail), and build numbers in frame text. Keep the build **beside** the
  signature, never in it.
- **Numeric values embedded in assertion text** — "expected 4, got 7" and "expected 4, got 9"
  are the same defect; replace runs of digits with a placeholder token.
- **Template and generic instantiation noise**, where the language produces it: collapse
  parameter lists to a marker, since the same algorithm over two element types is one crash.

**Normalise aggressively, then check for over-collapse** — merging different crashes is visible
(a bucket accumulates contradictory diagnoses) and so fixable, while under-normalisation is
invisible. And **normalise at write and at read with one code path**: two normalisers drift, and
the drift presents as a corpus that stops matching for no reason.

## Procedure

1. Extract fault class, culprit frame and error text from the raw record, then run the single
   shared normaliser over each part.
2. Compose the signature; store it beside the raw text, never instead of it. The raw record is
   the evidence; the signature is an index into it.
3. Rank every corpus candidate by similarity, sorting deterministically — similarity descending,
   then a stable secondary key — so a tie never depends on array order.
4. Report the winner **only if it cleared the floor**, as a prior rather than a verdict: bound to
   the content it was derived from, stale if that content changed. Retain the top-ranked
   candidate either way, as the near miss.
5. On no match, run full attribution; when the root cause is confirmed, write the diagnosis back
   keyed by this signature.
6. Track the match rate. A corpus that never matches is a normaliser bug until proven otherwise.

Keep the comparison layer **pure** — no storage, transport or interface dependencies — so the
ranking is testable without the analyser around it.
## Decision rules

- When an identifier is available, use it for the corpus's **internal structure** — a diagnosis
  belongs to one authored crash — and never for matching. The matcher must not be able to see
  the query's identifier at all, or someone will eventually make it the fast path.
- When two candidates score identically, break the tie on something stable and stated. When one
  bucket accumulates two contradictory diagnoses, the grain is too coarse for that region — add
  a discriminating component for that fault class, not globally.
- When a stored diagnosis is used, record that it was matched rather than derived — inherited
  evidence is weaker than freshly confirmed evidence, and if the code has changed since, it is
  a statement about the past.
- When the corpus and the live scorer disagree, surface both — that disagreement is the most
  informative thing either produced.

## When not to use

Do not let a match *replace* attribution scoring. Use it to accelerate and to attach a prior; a
stack whose shape matches a known crash can still be a new defect with a similar shape, and a
match that short-circuits the analysis is how a stale diagnosis outlives its fix.

Do not build a signature from data your capture pipeline does not reliably produce. If half your
reports arrive without symbols, a symbol-based signature splits the corpus into two
non-interoperable halves; fall back to fault class plus normalised error text, and mark the
signature's tier so nobody compares across tiers.
