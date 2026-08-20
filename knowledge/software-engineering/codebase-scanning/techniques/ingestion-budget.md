---
layer: technique
type: technique
subject: codebase-scanning
technique: ingestion-budget
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
  - count-carries-predicate
shared_with: []
use_when: [scanning a repository you do not control, reading a target over a metered remote interface, a detector goes blind on large targets, deciding how much of a tree to fetch]
---

# Ingestion budget

When the scanner owns the tree, gathering is nearly free: read everything,
re-read it whenever a rule changes. When the scanner reads a *foreign* target
over a metered remote interface, that assumption inverts. Every file costs a
round trip against a rate limit, adds latency to a request a person is waiting
on, and — where content crosses an organizational boundary — enlarges a
privacy claim somebody has to stand behind. The corpus a scan can afford is a
small fraction of the tree, often a few dozen files out of tens of thousands.
Which means the most consequential decision in the whole sweep is made
**before a single rule runs**: what enters the snapshot. Ingestion budgeting is
the discipline of spending a hard cap deliberately, and of reporting honestly
on what the cap bought.

## Read the whole listing; ration only the contents

The structure of a target and the contents of a target have wildly different
prices. A recursive listing is one request and yields a whole-population fact:
every path, every directory, the complete shape. Contents are per-file and
metered. **Always take the full listing, always ration the contents** — and
the payoff is larger than the saved bytes, because the listing is what gives
every later sample an honest denominator. A scan can legitimately say "six of
the target's four hundred test files were read" only because the listing
counted four hundred while the budget bought six. Ration the listing too and
you lose the ability to describe your own sample
([count-carries-predicate](../../_laws.md#count-carries-predicate)).

## Rank in ordered steps; never filter in one pass

The picker is a ranked multi-step selection, not a predicate. Each step names
a class of file, contributes a bounded slice, and yields to the next: exact
high-signal names first (the declarations, the manifests, the governing
documents), then the class-specific configuration, then bounded samples of
documentation, tests, and ordinary source for texture. The ordering is the
policy, and it must be written as steps precisely so that a later maintainer
can see which class gets starved when the cap binds — a single filtering
expression hides that, and the starvation shows up as a silently weakened
detector six months later.

## Reserved quota: a detector that needs completeness cannot share a cap

The failure this rule exists to prevent is exact. A shared per-scan file cap
is consumed in step order. A class of file that ranks late — but that a
*deterministic* detector requires **completely**, not as a sample — gets
whatever slots the higher-volume classes left over, which on a large,
manifest-heavy target is zero. And the starvation is worst precisely where the
detector matters most: the biggest targets, with the most automation
definitions and the most to check, are the ones whose budget fills before the
class is reached. The check ends up reading a proxy for the population, and
the proxy diverges on the population it was built for
([gate-sees-target](../../_laws.md#gate-sees-target)).

The rule: **when a detector's correctness depends on seeing every member of a
file class, give that class a reserved quota outside the shared cap.** Not a
higher rank inside it — outside it, with its own ceiling and its own share of
the total byte budget. And rank it *last* for any consumer that reads a
prefix, so the reserved tail exists for the detectors without displacing
high-signal material from a language model's window. Two consumers, one fetch,
different orders. Sizing note: pick the ceiling from the observed maximum in
the real population, not from a guess — a cap of three set from intuition
blinded a whole battery against targets that routinely carry thirty.

## The byte cap is a property of the consumer, not of the file

Per-file truncation is necessary, and a single global truncation limit is
wrong, because files are consumed in two incompatible modes:

- **Sampled as evidence** for a model or a heuristic. A prefix is fine; the
  file is texture, and the tenth screen adds little. A tight cap is correct.
- **Parsed as an exact structured document** whose meaning depends on all of
  it — an ownership table, a manifest, a policy file. Truncation here does not
  degrade the reading, it *falsifies* it: entries past the cutoff vanish
  silently, and where the format uses a catch-all rule that conventionally
  sits last, truncation can invert the document's conclusion rather than
  merely shorten it.

So the cap is set per consumption mode, and generously for the exact-parse
class, which is always small in number and high in signal. The test to apply
to any file class before assigning it a cap: *if the last line were deleted,
would the reading be shorter, or would it be wrong?*

## Ingest more than any one consumer can hold

A tempting simplification is to size ingestion to the language model's context
window, since the model is usually the most expensive consumer. It is a
mistake, and it is the seam worth naming: **the deterministic detectors and
the model are different consumers with different appetites.** Detectors need
whole files, exhaustively, over narrow classes; the model needs a broad,
shallow sample. Sizing the fetch to the model starves the detectors; sizing
the model's prompt to the fetch drowns it in tail material. Fetch the union,
then let each consumer take its own ordered slice of the snapshot. The
snapshot is the shared artifact; the window is a view onto it.

## Coverage confidence measures the fetch, not the target

Every budgeted scan owes a confidence figure, and its input must be chosen
with care, because the obvious input is wrong. **Confidence is a function of
how much of what was asked for actually arrived — the fetch success rate —
not of how large the target is.** Deriving it from files-fetched over
files-that-exist looks reasonable and is degenerate: the numerator is capped
by the budget, so the ratio falls with target size and every large target is
reported as poorly covered on the strength of its size alone. Nothing was
missing; the formula was measuring the cap.

The consequences travel further than the number. Downstream consumers gate on
confidence — a caveat printed to the reader, a decision about whether a
snapshot may be cached — so a formula that reports large targets as degraded
suppresses caching for all of them, while the opposite error (pinning a small
target's confidence at a constant regardless of failures) lets a transient
outage that dropped half the picks read as fully covered *and then persists
that degraded snapshot for its full lifetime*
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)).
Construct it instead as: success rate of the attempted picks, ceilinged a
notch lower where a large unseen tail exists, and clamped hard whenever the
listing itself was truncated. What the number is then allowed to *claim* is
general epistemics and belongs to
[measurement honesty](../../measurement-honesty/measurement-honesty.md); what
is owned here is that its input must be the ingestion's own success.

## Re-aiming the budget at a sub-tree

When the subject of the scan is one component inside a much larger tree, the
budget is not too small — it is aimed wrong, spread evenly across a dozen
components so each gets a couple of files. Re-aiming has three classes, and
collapsing them into one filter breaks the scan:

- **Kept regardless** — target-wide governing artifacts: the root declaration,
  ownership, security policy, all automation definitions. These are
  whole-target facts that target-level detectors depend on; filtering them to
  the sub-tree floors those detectors exactly as a too-small quota would.
- **Scoped** — the sample budgets for documentation, tests, and source. These
  are the slots that were being spread thin, and they are the whole point of
  re-aiming.
- **Preferred, not filtered** — guidance and configuration that may exist at
  either level: keep both, but float the sub-tree's copy first, since the more
  specific artifact is the better evidence about the component.

Whatever the aim, an unaimed scan must remain byte-for-byte what it was:
sub-scope support that changes the default selection has silently rewritten
every baseline the scanner ever recorded.

## When not to use it

A locally checked-out tree the scanner may read exhaustively needs none of
this; there, budgeting is a premature optimization that introduces sampling
error for nothing. The moment the read is metered, remote, latency-bound, or
crosses a boundary somebody has to disclose, all of it applies at once.
