---
layer: golden-path
type: golden-path
subject: executive-reporting
status: forged
use_when: [assembling a periodic stakeholder briefing from system aggregates, a report will be forwarded to readers who cannot query the source, generating prose over numbers already computed, deciding what a summary is allowed to omit]
techniques:
  - denominator-naming
  - bad-news-labelling
  - provenance-caveats
  - single-ranked-next-move
  - grounded-narrative-generation
  - expiring-share-links
---

# Executive reporting

An executive report is a periodic, stakeholder-facing **document** assembled
out of a system's own aggregates. It is the point where measurement stops
being a query surface and becomes an artifact: a thing with a date on it, a
recipient, and a life after the session that produced it. Someone opens it,
reads four numbers, forms a belief, and forwards it. The forward is the whole
design constraint. Every reader after the first has no console, no filters, no
drill-down, and no way to ask what the denominator was — and they are usually
the readers who decide something.

So the discipline of this subject is not summarization. It is **writing for a
reader who cannot check you**, and treating that inability as a hard
obligation rather than a convenience. A dashboard can be terse because the
number is one click from its definition. A document that leaves the building
carries its own definitions or it carries nothing.

## Where this subject stops

The aggregate itself is not ours.
[metrics-rollups](../metrics-rollups/metrics-rollups.md) owns the fold —
bucketing, windows, comparisons, stored derivations — and its
[aggregate-honesty](../metrics-rollups/techniques/aggregate-honesty.md)
technique owns the honesty of the *series*: partial buckets marked, empty
distinguished from uncovered, provenance surviving a merge. This subject
assumes all of that has already been done correctly and asks the next
question: **what may a document say about those aggregates, in prose, to
someone who will never see the series.** The general epistemics of a single
reported number — sample floors, noise bands, renormalizing over what was
present — belong to
[measurement-honesty](../measurement-honesty/measurement-honesty.md); we
consume its verdicts and are responsible for not laundering them out of the
narrative.

Machine-consumable extraction is [structured-output](../structured-output/structured-output.md)'s
subject: schemas, validation, repair. A report is the opposite consumer — a
human surface whose failure mode is not a parse error but a confident
misreading. The two share a serialization more often than teams expect (see
below), but not a contract.

The nearest sibling is [`judgment-guardbands`](../judgment-guardbands/judgment-guardbands.md), and the seam is worth stating
precisely because it is easy to blur: guardbands bound a model's judgment
*over a number* — the model is permitted to produce or adjust a value within a
declared band, and the band is the safety property. This subject bounds a
model's **prose over numbers already computed**. Here the model is permitted
zero arithmetic authority: the quantities are fixed before generation begins,
and the only thing generation may choose is emphasis, ordering, and wording.
Where a guardband asks "is this judgment within tolerance?", we ask "did any
quantity appear in the output that was not in the input?" — a membership test,
not a tolerance test.

Finally, the report's distribution is ours only where it concerns
capabilities: link expiry, scope, revocation. Signing a *build output* so its
origin can be verified is [signed-artifacts](../signed-artifacts/signed-artifacts.md);
a share link for a rendered document is not a supply-chain artifact and should
not borrow that machinery's guarantees or its vocabulary.

## The forwarded-document contract

Five obligations, all of which follow from the reader who cannot check you.
They are stated as a contract because they are testable and because partial
compliance is the common failure: reports that name denominators but hide bad
news, or disclose degradation but offer six next steps, are the norm.

1. **Every comparative or derived figure names its denominator.** "Up 14%"
   over what base, across how many units, in what window. A percentage whose
   population is unnamed is the recurring failure of this document genre — it
   survives review because it *reads* fine, and it is the single most common
   way a report is honestly assembled and dishonestly received. The
   [denominator-naming](techniques/denominator-naming.md) technique covers the
   naming, and the harder half: what to do when the basis is too thin to
   quote.
2. **Bad news is labelled, never filtered.** A regression printed under a
   heading that means "improvement" is worse than a regression omitted,
   because it converts a reader's correct arithmetic into a wrong belief. The
   fix is always a heading, never a filter:
   [bad-news-labelling](techniques/bad-news-labelling.md).
3. **Provenance and degradation are disclosed in the document.** Partial
   coverage, a stale source, a projection built on thin data, a section that
   fell back to a default — each is a caveat printed next to the number it
   qualifies, not a log line: [provenance-caveats](techniques/provenance-caveats.md).
4. **Exactly one ranked next move.** A report that ends with a list of
   priorities has not prioritized; it has transferred the ranking problem to
   the reader while appearing to solve it:
   [single-ranked-next-move](techniques/single-ranked-next-move.md).
5. **Generated prose is grounded by construction.** If any part of the
   document is written by a model, the model sees only the document's own
   assembled facts, and no quantity may appear in its output that was not in
   that input: [grounded-narrative-generation](techniques/grounded-narrative-generation.md).

## Assembly order: facts, then verdicts, then prose

The pipeline that survives contact with real data has a fixed order, and most
report defects are order violations.

**Facts** are computed first and frozen: aggregates with their windows,
populations, coverage, and per-value honesty verdicts attached — and the
window resolved to absolute instants, never left as a relative label that a
later consumer would re-resolve against its own clock. Nothing in this stage
decides what is good or bad. **Verdicts** are computed next — which
direction is good for each dimension, which comparisons are quotable, which
items are strengths and which are risks, what the single next move is — all
deterministic, all inspectable, all derived from the facts and from a declared
direction-of-good per metric. **Prose** comes last and derives nothing: it
reads the frozen facts-and-verdicts structure and produces sentences.

The order buys three properties. The document can always be rendered without
the prose stage (which is what makes graceful degradation possible at all).
Every claim in the prose has a locatable origin in the facts. And the
direction-of-good lives in exactly one place, which is the only reason a
regression can be reliably labelled as one.

A rule that comes directly from that last property: **a metric's sign is data,
not narration.** If a dimension can move in a direction that is bad, the
knowledge of which direction that is must be attached to the dimension itself
and consulted by whatever prints the heading. A reporting layer that knows the
delta but not its polarity will eventually print a loss under the word
"Value", and no amount of prose review catches it, because the sentence is
arithmetically correct.

## Structural honesty: disjointness, caps, and the empty case

Report sections are not independent views of the data; they are a partition of
a story, and readers read them as one. Two consequences.

**Sections that imply mutual exclusion must be enforced as disjoint.** If a
document has "strengths" and "risks", an item appearing in both destroys
confidence in both: the reader assumes the sections were chosen, so an overlap
reads as an assembly bug. The pressure appears on sparse populations, where a
fixed target count ("show three of each") forces the selector past the honest
supply. **Cap the pool by population size, not by layout**, and let a section
render short.

**The empty and thin cases are first-class outputs, not error states.** A
period with no qualifying activity produces a document that says so, with its
window and population named — not a page of zeros indistinguishable from
measured zeros, and not a thrown error. A report that fails to render is a
report someone replaces with a hand-written email containing no denominators
whatsoever.

## Prose that may choose emphasis but never a quantity

Generated narrative is worth having: it turns a table into something a
stakeholder actually reads, and it can name a pattern across dimensions that
no single tile shows. It is also the surface most likely to leave the building
unedited, which sets the bar. Three guarantees, and they are enforced in code
rather than requested in the prompt, because a prompt is a preference and this
must be a property:

- **Grounded by construction.** The generator receives the document's own
  serialization and nothing else — no store access, no repository contents, no
  history. It cannot mention what it was not given, so the class of "plausible
  detail the model knows about this domain in general" never reaches the page.
- **No new numbers.** Every numeric token in the returned prose must already
  appear in the facts payload, and a single invented figure discards the whole
  narrative rather than being edited: editing implies you know which number
  was meant, and you do not.
- **Degradation the caller cannot structurally distinguish.** When generation
  is unavailable or rejected, the document renders deterministic template copy
  in the same slot with the same shape. There is no error state to render,
  because an error state in a stakeholder document is a worse outcome than a
  plainer sentence.

Note the asymmetry with the caveat rule: degradation of *generation* is
invisible to the reader (the sentence is simply plainer), while degradation of
*data* is always disclosed (the number is qualified). This is not
inconsistency. The reader's decision depends on the data's completeness and
never on which of two equally true sentences described it.

## Distribution: a report leaves as a capability, not a file

The moment a document is shareable, its access model is part of its design.
The default that holds up: a share link is a **signed, expiring capability**
that names exactly what it grants, is revocable independently of the reader's
account, and is verified server-side on every read rather than trusted because
it is long and hard to guess. Reports age badly — a snapshot forwarded eleven
months later is read as current — so expiry is a correctness feature before it
is a security one. Details, including the rule that a capability's audience is
never wider than its narrowest referenced fact, are in
[expiring-share-links](techniques/expiring-share-links.md).

One assembly economy worth taking: the same serialization that grounds the
prose generator also serves the human "copy this report" affordance and any
programmatic endpoint that hands the report to another agent. One
serialization, three consumers. The economy is not only code size — it means
what the model saw, what the user copied, and what a downstream tool ingested
are provably the same document, so a dispute about what the report said has
one arbiter.

## What this subject refuses

- **A percentage without a population.** No basis, no comparison — say why it
  was suppressed instead of quoting an inadequate one.
- **Silence as good news.** A section that disappears when its numbers are bad
  makes every future edition unreadable, because absence now means two things.
- **Filtering a regression.** Print it in full, with its basis, under a
  heading that says what it is.
- **A fallback that guesses a verdict.** A heuristic standing in for a missing
  ranking will eventually invert it — recommending the strongest dimension as
  the thing to fix. Absent the real ranking, print no recommendation.
- **Prose that introduces a quantity.** Any number in the narrative that is
  not in the facts payload voids the narrative.
- **Immortal share links.** A capability with no expiry is a document with no
  as-of date.

## The techniques

- [denominator-naming](techniques/denominator-naming.md) — every rate,
  percentage, and comparison carries its population, window, and basis; thin
  bases are suppressed with a stated reason rather than quoted.
- [bad-news-labelling](techniques/bad-news-labelling.md) — direction-of-good
  as data; regressions printed in full under headings that name them; no
  section may become quieter by hiding its own bad news.
- [provenance-caveats](techniques/provenance-caveats.md) — partial versus
  total coverage, staleness, noisy projections, and fallback sections
  disclosed next to the numbers they qualify.
- [single-ranked-next-move](techniques/single-ranked-next-move.md) — one
  recommendation from one ranked source, or none; why fallback heuristics for
  "what to fix" are worse than an empty section.
- [grounded-narrative-generation](techniques/grounded-narrative-generation.md)
  — closed-world inputs, a numeric-membership check that discards rather than
  edits, and indistinguishable degradation to template copy.
- [expiring-share-links](techniques/expiring-share-links.md) — signed,
  scoped, revocable, server-verified capabilities with expiry as a
  correctness property.
