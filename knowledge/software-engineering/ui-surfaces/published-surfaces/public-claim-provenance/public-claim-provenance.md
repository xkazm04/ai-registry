---
layer: golden-path
type: golden-path
subject: public-claim-provenance
status: forged
use_when: [writing a number into a public roadmap or status surface, a marketing counter must track the shipped catalog, a confirmation screen is about to promise a follow-up, deciding what a liveness badge is allowed to claim]
techniques:
  - derived-numerator-authored-denominator
  - no-data-source-labelled-inline
  - build-time-derivation-off-the-client-bundle
  - presentation-invariants-on-derived-values
  - promise-only-what-ships
  - degraded-never-claims-live
  - provenance-as-a-build-gate
---

# Public claim provenance

A public claim surface is any outward-facing page whose job is to say **what
the product is and how far along it is**: a roadmap with progress bars, a
status page, a counter in a headline, a coverage badge, a capability strip on
a pricing page, a confirmation panel telling someone what happens next. Every
value on such a surface has a provenance, and there are exactly two of them.
Either the value was **derived from the artifact the product actually ships**,
or **a person typed it**. This subject exists because those two provenances
render identically. "37 of 60" looks the same whether the 37 was counted out
of the shipped catalog during this build or typed into a headline six weeks
before the catalog moved.

The failure is therefore not inaccuracy, and treating it as inaccuracy is why
it recurs. An inaccurate number is wrong today and can be corrected today. A
number with unowned provenance is *correct on the day it is written* and
decays afterward at a rate nobody is watching, because nothing in the system
fails when it drifts. Six weeks later the page is wrong, everyone who could
have noticed has stopped reading it, and the first person to notice is a
prospective customer counting the entries themselves.

## The reader cannot check, and that changes the obligation

An internal metric is read by someone holding the instrument. They have the
dashboard, the query, the checkout; if a number looks odd they can go and
look. An outward claim is read by someone who has the page and nothing else.
They cannot audit the count, cannot see the catalog it came from, cannot tell
a derived value from a typed one, and — this is the load-bearing part — will
not tell you when it is wrong. They will simply revise downward what they
believe about everything else on the page.

So the honesty of an outward surface cannot be enforced on the reading side.
There is no caveat that fixes it, because a caveat is read by the same person
who cannot verify the claim it qualifies. It has to be enforced on the
**producing** side: at the site where the value is written, in the build that
assembles the page, and in the review that reads the value's declaration. A
public number is trustworthy exactly to the degree that the mechanism which
produced it could not have produced a different one.

## Aspiration is legitimate; disguised aspiration is not

The naive correction — "only publish what you can prove" — deletes the entire
category of surface this subject is about. A roadmap is *supposed* to contain
intent. A target is *supposed* to be a number nobody has measured, because a
target describes a decision rather than the world, and no instrument observes
a decision. Refusing to publish targets does not make a product honest; it
makes it silent about the thing readers came to find out.

The discipline is to make the **seam between fact and intent visible in the
artifact**, so it survives editing. A fraction on a public surface almost
always straddles that seam: the numerator is a fact about what ships, the
denominator is a commitment about what is wanted. Derive the fact half from
the shipped catalog. Hand-author the commitment half, and flag it as
hand-authored at the site where it is declared, with the reason no data source
exists. That pairing is
[derived-numerator-authored-denominator](./techniques/derived-numerator-authored-denominator.md),
and the inverse — a typed numerator over a derived denominator — is the shape
of the classic marketing lie, because it claims completeness over a real
population using a number that answers to nothing.

The seam is often finer than a fraction. A single element can carry both
provenances at once: a bar whose printed count is derived from the catalog and
whose fill geometry is a hand-authored judgment, because the underlying
completeness genuinely has no instrument. That is legitimate and frequently
the honest shape — but it means the sorting question is asked per *value*, not
per component, and the label has to sit on the half that needs it while the
derived half beside it stays untouched.

The flag is not decoration and not a `TODO`. It is a falsifiable statement
about the world: *no instrument produces this value, and here is why*. Stated
that way it can become wrong, and when it does — when somebody builds the
check that would measure it — the flag is the thing that says the value should
now derive. A label reading "hardcoded for now" has none of that property; it
names no mechanism, offers no exit, and by its second year means "nobody
remembers". The rules for what the label must say and where it must sit are
[no-data-source-labelled-inline](./techniques/no-data-source-labelled-inline.md).

## Derivation must not be paid for by the reader

The catalog behind a public claim is usually the heaviest thing the product
owns — every entry, every translation, every record — and the surface making
the claim is usually the first page a stranger loads. Deriving the count where
the page renders means shipping the catalog to the stranger to prove a
two-digit number.

What happens next is predictable and is the real reason honest surfaces
regress. Somebody measures the page weight, finds a catalog in it, and
replaces the derived count with a typed one, and the change looks like a
straightforward optimization in review because the number does not move that
day. Honesty was traded for bytes, silently, by someone who was not thinking
about honesty at all.

The structural answer is to **reduce the catalog to scalars where the catalog
already lives** — at build, on the server, in a generator — and let only the
scalars cross into the page. The module that does this exports counts, never
collections, and that export constraint is the mechanism: a number cannot drag
its catalog across a boundary it is not shaped to fit through. Deriving at
build time additionally buys the strongest property available to a public
claim, which is that **the claim and the thing it describes ship in the same
artifact and cannot disagree** — a build that adds catalog entries publishes
the new count in the same breath, with no human in the loop and nothing to
remember. The techniques for that boundary are
[build-time-derivation-off-the-client-bundle](./techniques/build-time-derivation-off-the-client-bundle.md).

## A derived half moves on its own, so the pair reaches undrawn states

The moment one half of a displayed fraction updates without a human, the pair
can reach combinations the designer never saw. Two are worth naming because
both ship regularly and neither looks like a bug in review.

The first is **overflow**: the live count grows past the hand-authored target,
because the catalog kept going and the goal did not. The bar renders past its
track, or clamps quietly and now under-reports a success. The invariant —
every target sits at or above its live count, or the target is stale and must
be raised — belongs at the declaration site where both halves are visible, not
at the render site where only the ratio is.

The second is **the number that is not a number**: an empty catalog divided by
an empty target. The visual survives this, because a zero-width bar looks
exactly like honest zero progress, while the non-visual rendering emits
garbage into an accessibility attribute. The defect ships to precisely the
readers who cannot see that it is a defect, and no screenshot review will ever
catch it. The general rule this instance teaches: **one condition must flip
every dependent presentation together** — the count, the percentage, the
accessible value, the bar geometry and the pluralised prose all read the same
boolean or none of them do. A surface with five dependents on one condition
and four of them switched is worse than a surface that never switched at all,
because it is internally inconsistent in a way that reads as a lie rather than
a gap. Both invariants, and where to assert them, are
[presentation-invariants-on-derived-values](./techniques/presentation-invariants-on-derived-values.md).

## Claims are not only numbers

The same provenance question applies to every forward-looking sentence on the
surface, and the most-copied sentence in any product is a promise: *thanks,
we'll be in touch shortly*. It is written when the form is built, before any
delivery mechanism exists, and it survives indefinitely because nothing fails
when no message is sent. The recipient's inbox is not instrumented; the
absence is invisible to the team and total to the reader, who concludes — with
no way to be corrected — that they were ignored.

A promise ships or it is not made. Where a mechanism is planned but not built,
the surface says nothing about it, because from the reader's side a planned
pipeline and no pipeline are the same pipeline. The replacement for a removed
promise is not an apology but a **redirect to something that is real**: here
is what exists today, here is where to go next. The reader leaves with a
surface instead of an expectation, and expectations are the only thing that
can be disappointed. That rule, including the case where the mechanism is a
human doing the work by hand — which does count as shipping, at the latency
the human actually achieves — is
[promise-only-what-ships](./techniques/promise-only-what-ships.md).

## Liveness is itself a claim

Where a public number is derived at request time rather than at build time,
the surface acquires a load-state vocabulary, and one of its states is a
badge saying the number is current. That badge is a claim with a provenance
like any other, and it is the cheapest lie on the page, because it is
rendered by the layout rather than by the data — it appears whether or not
anything answered.

The vocabulary must be closed, defined in one place, and derived from the
fetch outcome rather than from whether the rendered value happens to be
non-zero: a plausible number proves nothing about its source. Where every
source failed, a public surface may legitimately render seed values quietly
rather than an error box, because a broken-looking marketing page costs more
credibility than a placeholder — but the placeholder **drops the liveness
claim**, it does not soften it. And the states never blend: adding a
hand-authored floor to a live count and rendering the sum as one figure under
a currency badge produces a value that is unfalsifiable to the reader *and* to
the team that built it, because the sum has no predicate anybody could state.
If a floor is wanted, it is a separate labelled component or it is absent. The
state machine is
[degraded-never-claims-live](./techniques/degraded-never-claims-live.md).

## An invariant nothing enforces is a preference

Everything above is asserted at runtime, at the site where a value is
declared or rendered, by code somebody remembered to write. That leaves one
gap, and it is the gap through which this subject's failures actually arrive:
the value that was added to a page by an author who was not thinking about
provenance at all, in a file where nothing existed to notice. No render-time
invariant fires, because no render-time invariant was wired to a value nobody
classified. The rule was in the style guide; the number is on the page.

The answer is to move one of the invariants out of runtime and into the
build — to make a rendered figure with no provenance marker in its file a
failing check rather than a review comment. Doing that well is almost entirely
a question of what the check is allowed to trigger on: a static rule cannot
see "a claim", so it must trigger on positive evidence that a value is one,
which in practice means it stands on a formatting chokepoint and fires on
calls through it, in render position, and nowhere else. It sacrifices recall
on purpose, because a rule that flags array indices is a rule somebody turns
off, and an off rule is worse than none — it looks like protection. Its escape
hatch has to cost something on the page rather than in the configuration, so
that waiving the rule discloses the missing source to the reader instead of to
the linter. And once the rules exist they are worth extracting from the
repository that grew them, since the doctrine is more portable than the
codebase: a self-contained plugin with per-rule documentation naming what an
adopter must remap. The trigger design, the file-scoped satisfiers, the
reader-visible waiver and the packaging are
[provenance-as-a-build-gate](./techniques/provenance-as-a-build-gate.md).

## Where this subject sits

[Measurement honesty](../../../engineering-assessment/measurement-method/measurement-honesty/measurement-honesty.md)
owns the epistemics of a **measured** number shown to the people who operate
the instrument that produced it: whether the sample supports the digits,
whether an incomplete collection may be reported as a verdict, whether zero
means zero or means blind. Its reader can go and check, and its failure is
that a real measurement overstates its own evidence. This subject owns the
outward surface, where the reader is a prospective customer, the numbers are
marketing artifacts, and the failure is one layer earlier: not *does the
evidence support this digit* but *did anything at all produce this digit, or
did a person type it into a headline*. The rule for picking: if the number
came out of an instrument and the question is how much it may claim, that is
measurement honesty; if the question is whether an instrument exists, and
whether the reader can tell, that is this subject. Deliberately flooring or
proxy-labelling a genuine measurement is on their side of the seam, not ours.

[Charts and data visualization](../../data-display/data-viz/data-viz.md) owns the
drawn mark — what geometry may encode, what an axis may imply, what an empty
plot area asserts by rendering its own chrome. A progress bar on a public
roadmap is incidentally one of their marks, and their rules bind it; but this
subject's rules bind the same claim when it has no geometry at all, as a
headline counter, a badge, or a sentence. Their question is whether the
picture is drawn honestly, ours is whether the value in it was produced by
anything.

[Maturity ladders](../../../engineering-assessment/maturity-and-conformance/maturity-ladders/maturity-ladders.md)
owns present-vs-enforced inside a **scored rubric**: an assessment vocabulary,
with rungs, criteria, assessors and a version. A public capability strip is
not an assessment — nobody is being graded, there is no rubric to version, and
the reader is the subject's customer rather than its assessor. Where a public
surface does publish a rung, the ladder's rules govern the rung and this
subject's rules govern whether the surface derived it or someone typed it.

## Failure modes of the naive reading

- **"We'll keep it updated."** A maintenance promise with no owner, no
  trigger, and nothing that fails when it lapses. It is not a plan; it is the
  absence of one, stated confidently. The test is mechanical: name the event
  that changes this number and the code that runs on it.
- **"It's just marketing copy."** Marketing copy is the most-copied text the
  product owns — into decks, partner pages, press mentions, a competitor's
  comparison table. A public number cannot be amended everywhere it lands, so
  it is the *least* revisable claim in the product, not the most.
- **"Nobody will count."** Somebody always counts, and the person who counts
  is by construction the most engaged reader on the page — an evaluator deep
  enough to check is the reader whose trust is worth the most and who is
  cheapest to lose.
- **"We'll write the caveat in the docs."** The claim travels and the caveat
  does not. Provenance that is not adjacent to the value has already failed;
  it must live at the value's declaration and, where the distinction is
  visible to the reader, on the surface beside it.
- **"Round it up, it'll be true soon."** A number that is true soon is a
  target, and targets have a legitimate slot on the surface already. Borrowing
  the numerator's slot for it is the one move this subject exists to forbid.
- **"Show something rather than nothing."** True for layout, false for
  provenance. A seeded value may hold the space; it may not wear the badge
  that says it is current, and it may never be summed into a real one.

## What good looks like, compressed

- Every public value has a stated provenance, and the two provenances are
  visibly different at the site where the value is declared.
- The fact half of every published fraction derives from the same catalog the
  product ships from; the commitment half is hand-authored and flagged.
- Each hand-authored value carries, beside it, the named reason no instrument
  produces it — a statement that can become false, and that says what would
  make it false.
- Derivation runs where the catalog already lives and crosses into the page as
  scalars, so honesty costs the reader nothing and is not traded away later
  for page weight.
- Targets sit at or above their live counts, the empty-denominator case is
  guarded at its single computation, and one condition flips every dependent
  presentation in lockstep.
- No surface promises a follow-up the product has no mechanism for; removed
  promises are replaced by pointers to surfaces that exist.
- The load-state vocabulary is closed and defined once, degraded states drop
  the liveness claim rather than qualifying it, and seeded values are never
  summed into derived ones.

## The techniques

- [derived-numerator-authored-denominator](./techniques/derived-numerator-authored-denominator.md)
  — splitting a public fraction by provenance: the fact half derives, the
  commitment half is declared, and the inversion is forbidden.
- [no-data-source-labelled-inline](./techniques/no-data-source-labelled-inline.md)
  — what a hand-authored value's label must say, where it must sit, and why
  the reason is the part that does the work.
- [build-time-derivation-off-the-client-bundle](./techniques/build-time-derivation-off-the-client-bundle.md)
  — reducing a heavy catalog to scalars on the producing side, and the export
  constraint that keeps the catalog from following.
- [presentation-invariants-on-derived-values](./techniques/presentation-invariants-on-derived-values.md)
  — the overflow and empty-denominator invariants, and the lockstep rule for
  everything one condition drives.
- [promise-only-what-ships](./techniques/promise-only-what-ships.md) — naming
  the mechanism behind every forward-looking sentence, and redirecting to real
  surfaces where there is none.
- [degraded-never-claims-live](./techniques/degraded-never-claims-live.md) —
  the closed load-state vocabulary, the badge as a claim, and the rule against
  blending seeded and derived values.
- [provenance-as-a-build-gate](./techniques/provenance-as-a-build-gate.md) —
  making an uncited figure fail the build: triggering on positive evidence
  through a formatting chokepoint, file-scoped satisfiers, an escape hatch the
  reader can see, and the doctrine packaged for adopters.
