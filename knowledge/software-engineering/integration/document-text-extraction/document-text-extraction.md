---
layer: golden-path
type: golden-path
subject: document-text-extraction
status: forged
use_when: [turning uploaded documents into text for a search index or a model, deciding whether a partly-readable document counts as extracted, a corpus is answering questions from documents that were never fully read, sizing safety caps for containers produced by software you do not control]
techniques:
  - unreadable-region-refusal
  - screen-then-confirm-detection
  - extraction-yield-bands
  - recognition-boundary-and-escalation
  - structural-amplification-caps
---

# Document text extraction

An extractor is handed a byte container produced by software nobody on your
team wrote, and asked to return the text a human would have seen. What comes
back is inert — no entity is created, nothing executes, nothing is scheduled.
That inertness is exactly what makes this surface dangerous, and it is why the
discipline here is not the importer's discipline. **Text that is missing a
third of the document is still text.** It parses, it indexes, it embeds, it
chunks, and it answers a question about the missing third with the same
fluency it answers every other question — confidently, and wrong. Nothing
downstream notices, because there is no consumer of inert text whose job is to
notice absence.

So the subject has one obligation, and everything below is machinery for it:
**incompleteness must be impossible to mistake for completeness**, and
impossible structurally, not by the diligence of whoever reads the output next.

## The verdict is the product; the text is a payload

The naive framing is that an extractor returns text and, on a bad day, an
error. The framing that survives is that an extractor returns a **verdict**
about a specific document — *this is all of it*, or *this is not all of it and
here is which parts are missing* — and text rides along with the first kind.
Everything hard follows from insisting that the verdict be a value the caller
can branch on rather than a shape the caller has to infer.

The rule, stated so it can be applied today:

> An extractor never returns a document-shaped result that omits a region it
> could not read. It returns complete text, or a typed refusal naming the
> regions. The fraction does not enter into it — one page in a hundred refuses
> exactly as loudly as a hundred in a hundred, because the output has no way of
> saying which hundredth is absent.

That settles the extractor's half. The other half — *what the caller does with
a refusal* — is genuinely open, and hedging on it is how this subject gets
built wrong. An ingest pipeline may legitimately admit the readable regions and
record the unreadable ones as a queued obligation rather than discarding the
document. **The discriminator is whether anything downstream can act per
region.** If a recognition pass, a re-upload prompt, or a human review queue
can be handed *those specific regions*, partial admission plus a durable
per-region obligation is the better design: it delivers value now and names the
debt. If nothing downstream can act per region, whole-document refusal is
correct, because a partial result whose partiality nobody can act on is a
silent loss wearing a warning label. What is never available is the third
option teams actually ship — admit the readable regions, count the unreadable
ones, and let the count evaporate into a log line.

Where the region list lives once it survives is the question that decides
whether any of this was real. It belongs on **the record the extracted text
landed on** — the document row, the chunk set, the artifact the next pass will
read. A log rotates, a metric aggregates, an error message is a transport, and
none of the three is a home. The record must also distinguish three states, not
two: assessed and complete, assessed with these regions unreadable, and *not
yet assessed*. An empty list and an absent list are different facts, and
collapsing them is how a corpus acquires documents nobody ever checked and
reads as though it had
([unknown-is-not-a-value](../../_laws.md#unknown-is-not-a-value)). The locus
rules, and the narrow case where a bare count is honest, are
[unreadable-region-refusal](./techniques/unreadable-region-refusal.md).

## Loss here is a property of one instance, not of a format pair

The neighbouring discipline of foreign-format import also loses information,
and it grades that loss on a closed scale assigned in the adapter's capability
table at mapping-authoring time — statically, per feature, per format pair, by
the person who knew what the mapping does. That works because the loss is a
property of the *mapping*: a foreign retry policy with no counterpart has no
counterpart in every file of that format, forever.

Extraction loss is not like that. It is a property of **this upload**: which
page of this file carried no text layer, which sheet in this workbook was
pasted in as an image, which column was drawn as glyph positions rather than
words. A capability table cannot express "page seven of this document", and no
amount of authoring-time care discovers it, because it is discovered by trying.
The two subjects therefore share an ethic — enumerate loss, never absorb it —
and share nothing else. Import decides what a *format* costs; extraction
decides what a *file* cost, and only after the attempt.

## Detect cheaply, confirm with the real operation, on the flagged subset only

Deciding whether a region holds readable text is expensive when done properly
and unreliable when done cheaply, which invites the standard mistake: pick one,
and live with either the bill or the errors. The structure that beats both is a
two-stage cascade in which the **cheap stage is deliberately biased toward
false positives and the expensive stage is the real operation, not a second
heuristic**.

Stage one samples structure — is there a text stream here at all, is it
suspiciously short, is this region dominated by imagery — and it is tuned so a
region with no text never escapes it. It will over-report; short regions and
image-dense-but-textual regions get flagged when they are fine. Stage two runs
full extraction **scoped to the flagged regions only**, and answers the one
question a heuristic cannot get wrong in the way heuristics get things wrong:
*did the actual operation produce anything?*

The economics are what license the bias. Over-reporting costs the price of
extracting the flagged subset, not the corpus, so a screen tuned never to miss
is cheap in exactly the proportion that the screen is selective. A second
heuristic in stage two would not be a confirmation at all — it would relocate
the error onto a different set of documents while making the pipeline feel
rigorous. The cascade's rules, and how to keep stage one's suspicion from
laundering itself into a verdict, are
[screen-then-confirm-detection](./techniques/screen-then-confirm-detection.md).

## Empty is easy; the middle band is the subject

Regions that yield nothing and regions that yield clean prose are both
trivially decidable. Everything expensive lives between them: the region that
returned forty characters where a page should be, the region whose text came
back through a broken character mapping and is fluent-looking rubbish, the
table that extracted as one run of concatenated cells. These are the states in
which an extractor is most likely to report success, because success has been
defined as *bytes came back*.

The correction is to grade yield on a **closed band set and route each band to
an action** — not to attach a confidence number and move on. A confidence score
is the right instrument when the consumer *ranks* results and can afford to be
approximately right about ordering. It is the wrong instrument when the
consumer must decide **whether to re-acquire the region**, because a float does
not tell anyone what to re-run. A band does, and it does so precisely because
it was defined by what the caller can do about it. The band vocabulary, the
discriminator against scoring, and the treatment of text that is present but
corrupt are
[extraction-yield-bands](./techniques/extraction-yield-bands.md).

## Say plainly what you will not do, and escalate only what was refused

An extractor that reads text layers and does not perform optical recognition
has made a legitimate engineering choice, and the choice is legitimate only if
it is **published as a property of the component** rather than discovered by a
caller whose corpus is already short. State it where callers look: in the
contract, in the error vocabulary, in whatever instructions an automated caller
reads before it decides what to send. A boundary that exists in the
implementation and not in the contract is not a boundary; it is a surprise with
a scheduled delivery date.

Recognition, where it exists, is the escalation, and its design rule is narrow:
**it receives the documents the cheap path refused, and only those.** Not
"route this format to the expensive engine" — route the *refusals*. That
scoping is what stops a recognition capability from converting every
born-digital document into a bill, and it falls out for free from having made
the refusal typed in the first place, because the escalation's trigger is then
a verdict rather than a guess about the input. Which way the escalation
defaults, and why the answer inverts the usual guidance about protections that
must be switched on, is
[recognition-boundary-and-escalation](./techniques/recognition-boundary-and-escalation.md).

## The document is an adversary with a friendly filename

Every document reaching this surface was produced by software, and some of that
software was written by someone who wants your process to die. The attacks are
not clever; they are arithmetic. Container formats compress, repeat, nest and
reference, and each of those is a multiplier between the bytes on disk and the
bytes in memory. A few kilobytes of markup can declare a grid with millions of
positions, a repeat count that materializes one cell ten million times, or a
nesting depth that overflows a recursive walker.

Bounded parsing of the input — a byte cap at intake, a depth cap in the
deserializer — is the neighbouring import discipline's territory, and it is not
sufficient here, because it bounds the *input* while the danger is the
**amplification factor**. Two rules make the difference. An expansion needs a
cap on its count *and* a cap on its payload, because bounding positions does
not bound memory when each position carries content, and count times payload is
the quantity that actually allocates. And a cap derived from a measured
per-unit cost needs a test pinning that cost, or the derivation rots invisibly
the first time the representation changes. The reason these can be constants
rather than configuration is itself a stated rule, not a preference: a cap is
safe to freeze exactly when the legitimate distribution sits orders of
magnitude below it, and where it does not, you have chosen a tuning knob and
mislabelled it a safety limit. This is
[structural-amplification-caps](./techniques/structural-amplification-caps.md).

## Where this subject stops

Three borders are worth stating, because each neighbour is close enough that a
careless reading absorbs it.

**Error taxonomy, routing and doors** belong to the resilience domain, in
[error-handling](../../backend-platform/resilience/error-handling/error-handling.md).
That subject owns what a failure is classified as, who learns of it, and what
the user is told. This one owns the question that runs before all of that:
**is a partial extraction a failure at all?** Once the answer is yes,
everything that happens to the failure is that subject's, and the typed-refusal
machinery here is a consumer of its propagation discipline rather than a second
copy of it.

**Rate and quota limiting** derives a budget over time from cost-per-admission
and legitimate cadence. The caps in this subject are fixed and structural, over
the shape of *one* input, derived from nothing about traffic; a limiter cannot
express them and they cannot express a limiter.

**Reading a document a person wrote in order to persuade someone** is a
different problem with a different failure model. There, extraction feeds a
judgment about a human being, the losses fall hardest on writers who never
learned the genre, and the governing concern is fairness. Here the writer is
software, the container is binary, and the verdict is a contract a caller
branches on. Where the downstream consumer ranks people, that discipline
governs and this one is merely its first stage.

## Operator posture

This surface decays without symptoms, so it has to be counted rather than
watched. Three numbers, each carrying its predicate
([count-carries-predicate](../../_laws.md#count-carries-predicate)): the
**refusal rate by cause**, which says whether the corpus is drifting toward
inputs the cheap path cannot serve; the **over-report ratio**, flagged regions
over confirmed regions, which is the honest price of the cascade and whose
upward drift means stage one has stopped discriminating; and the **unresolved
obligation backlog**, regions admitted as unreadable and never re-acquired,
which is the only number that reveals whether the per-region record was a real
queue or a decorative column.

The one alarm worth waking someone for is the third going flat while the first
stays positive. That is the signature of a pipeline that records its debts and
never pays them — materially worse than refusing, because a refusal leaves the
operator knowing the document is absent, and a stale obligation leaves them
believing it is present.

## The techniques

- [unreadable-region-refusal](./techniques/unreadable-region-refusal.md) — when
  a partial result is a failure, why the locus must survive as a list rather
  than a count, and the one case where a count is enough.
- [screen-then-confirm-detection](./techniques/screen-then-confirm-detection.md)
  — a cheap screen biased to over-report, confirmed by the real operation over
  the flagged subset alone.
- [extraction-yield-bands](./techniques/extraction-yield-bands.md) — the closed
  band set over what a region actually yielded, the discriminator against
  confidence scores, and text that is present but corrupt.
- [recognition-boundary-and-escalation](./techniques/recognition-boundary-and-escalation.md)
  — publishing the boundary as a contract, and escalating refusals only.
- [structural-amplification-caps](./techniques/structural-amplification-caps.md)
  — count and payload caps on one expansion, testing the constant a cap was
  derived from, and when non-configurability is earned rather than asserted.
