---
layer: technique
type: technique
subject: llm-extracted-entity-graph
technique: recall-passes-with-a-declared-cap
status: forged
laws: [failure-not-empty-success, absent-guard-is-loud, silent-state-is-ungoverned]
shared_with: []
use_when: [a single extraction pass returns a plausible handful, deciding how many further passes a passage gets, a re-prompt loop that started inventing entities, extraction that was skipped for budget and reported as complete]
---

# Recall passes, with a declared cap

A model asked to extract every entity and relation from a dense passage returns a
well-formed, plausible, **incomplete** answer. It satisfices: it produces enough to look
like it did the task and stops. Every field is present, every parse succeeds, every schema
check passes, and a third of the passage is missing from the graph.

This is the defect class of the extraction stage, and its danger is that nothing fails.
There is no exception, no malformed payload, no empty result — the shortfall is invisible
in the output and stays invisible downstream, where a missing node is indistinguishable
from an entity the corpus never mentioned. It is
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned) at the
extraction boundary: the model's belief that it has finished shapes the graph, and until
that belief is converted into something inspectable, no gate can reach it.

## The further pass

The remedy is to ask again. A second call over the same passage, with the first call's
prompt *and its answer* in the conversation, asking specifically for what was missed and
for anything that came back malformed. The model's own prior output is what makes the pass
work: it can see what it already listed, so it is answering a different question rather
than repeating the first one.

Three rules about what comes back.

**A later pass adds; it does not replace.** Entities the further pass names for the first
time are new. Entities it names again have arrived twice, and the two versions are merged
into the passage's contribution the same way any two mentions merge — accumulated, not
adjudicated. The shortcut that shows up here is picking whichever version has the longer
description and discarding the other. It is a length heuristic standing in for a judgment,
it silently drops a short precise description in favour of a verbose one, and it breaks the
accumulate-everything property that
[accumulate-then-threshold-merge](./accumulate-then-threshold-merge.md) depends on one
stage later.

**A relation whose endpoints were established in an earlier pass is still a relation.** The
further pass sees a partial entity set and will name edges into it; refusing edges whose
endpoints are absent from *this* pass's own output discards exactly the additions the pass
existed to find.

**The pass is per passage, not per document.** Recall shortfall is a property of one
passage's density, and a further pass over an already-thorough passage costs a call and
returns nothing. Where the budget is tight, spend passes on the passages that produced the
most in pass one — density predicts shortfall better than any other cheap signal.

## The cap is a knob, and the knob is priced

Unbounded re-prompting has a specific and reliable failure: **a model asked repeatedly what
else is there will eventually answer, and what it answers with is invented.** The prompt
supplies the pressure — the question presupposes a remainder — and a cooperative model
supplies a remainder. The invented entities are well-formed, plausible, and attributed to a
real passage, which makes them the hardest kind of bad data to find later.

So the loop is bounded by a **declared, operator-visible cap on passes**, not by the
model's report that it is done. The completion signal is the same judgment the first pass
already got wrong, and trusting it is trusting the defect to detect itself. The cap is
stated in the configuration a reader can price: passes multiply the extraction call count
per passage almost exactly, so a cap of two is a doubling of the corpus's largest cost
line, and that arithmetic is the decision — not a default nobody argued for. One further
pass is the common setting because the first pass captures the bulk and the second captures
most of the rest; the third is where invention starts to outpace recovery on most corpora,
and a team that wants it should be able to show the labelled measurement that justified it.

Name the knob for what it bounds. A setting called *maximum passes* that the code reads as
a boolean — any positive value meaning exactly one further pass — is a control surface
lying about its own range, and the operator who sets it to five and observes no change has
been told nothing.

## A skipped pass is not a completed one

The further pass carries the first pass's prompt and answer, so its input is by
construction larger than the first call's and can exceed the extraction budget on precisely
the densest passages — the ones the pass exists for. The correct response is to skip it
rather than fail the passage. The incorrect response, and the default one, is to skip it
**silently**.

Per [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), a passage
that got its full pass allocation and a passage whose pass was dropped for budget must not
produce the same record. The first says the passage is as fully extracted as this system
knows how to make it; the second says its extraction is known-partial and by how much. Carry
the skip on the passage's own extraction record, count it per document, and surface the
count — because a corpus where a tenth of passages skipped their recall pass has a recall
problem concentrated exactly in its richest material, and no other instrument will report
it.

The same law covers the pass that ran and found nothing. "Asked again, nothing further" is
a healthy result and evidence the first pass was thorough; "could not ask" is an outage.
Rendering both as an empty addition makes the two indistinguishable, and per
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) the guard that quietly
stops engaging is worse than no guard: a deployment where the budget was lowered and every
further pass now skips has silently reverted to single-pass extraction, and its graph will
degrade for months with nothing in the logs but a warning nobody aggregated.

## Rejected: making the model report completeness

The alternative is to have the extractor emit a completeness signal — a flag, a token, a
count — and loop until it declares itself finished. It is rejected, and the force is the
same one that motivates the technique: **the completeness judgment and the extraction are
the same judgment.** A model that under-recalls because it satisficed is precisely a model
that believes it is done. Its signal is not an independent check on its output; it is the
output's own opinion of itself, which is the shape of state that
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned) says cannot
govern anything.

The signal is not worthless — an early "nothing further" is a cheap way to stop paying for
passes on sparse passages, and it is worth honouring *downward*, as permission to stop
early. It may never extend the loop past the cap. Trust it to save money, never to
certify recall.

## Recall is measured, or it is imagined

Nothing above tells anyone whether extraction recall is 0.5 or 0.9, and no amount of
looking at the graph will. It grows either way, the nodes look reasonable either way, and
the tuning knobs — pass cap, passage size, the type vocabulary offered to the extractor —
all change recall in directions intuition cannot rank.

The instrument is a **held-out sample somebody labelled**: a few dozen passages with their
entities and relations enumerated by hand, scored against what the extractor produced, with
precision and recall reported separately because the cap moves them in opposite directions.
Score it against the production extraction path, not a fixture of it. Then every knob above
becomes an experiment rather than a preference, and the fabrication guard becomes
observable — precision falling while recall stalls is the signature of a cap set one pass
too high, and it is not visible any other way.

## The boundary against parsing the reply

[extraction-strategies](../../structured-output/techniques/extraction-strategies.md) owns
everything about a reply that came back **defective**: the payload wrapped in prose, the
fence with the wrong label, the object torn by truncation, the near-miss syntax. Its ladder
is thorough and this subject uses it unchanged — a passage's extraction is parsed by those
rungs before anything here sees it, and a partial rescued at its fourth rung arrives marked
as recovered-partial.

The seam is sharp: **that subject's failures are visible in the reply; this one's is not.**
A satisficed extraction parses cleanly at the first rung, validates against every field the
schema requires, and carries no marker of any kind. Its own subject's neighbouring
technique reaches the adjacent case — a reply cut off by an output budget, retried for the
section that grew — but that is still a defective reply. The pass described here exists for
the reply that was perfectly valid and simply did not contain enough, which no parser can
detect because there is nothing wrong with it.
