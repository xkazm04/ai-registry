---
layer: technique
type: technique
subject: prompt-assembly
technique: summary-evidence-gate
status: forged
laws: [derivation-names-recomputation, one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [a model-written summary is about to replace history in every later prompt, updating a running summary from the previous summary, a summary names a value or identifier nobody can find in the source, the summarization call timed out or failed mid-compaction, restoring a session whose summary cites history that retention has since purged, a cheaper model reads a long log before the main model sees it, deciding whether a delegated reader may paraphrase or must quote]
---

# Summary evidence gate

[history-compaction](./history-compaction.md) names the risk exactly: a summary
is model output promoted into a standing layer, and its errors do not produce
one bad answer, they produce a conversation that has changed its mind with no
artifact showing where. It gives two disciplines to contain that. This
technique is the third, and it is of a different kind: the first two shape how
a summary is read and what it is trusted to carry, and this one decides
**whether a summary is admitted at all**. The summary is treated as a checked
state cache, not as testimony, and it enters the prompt only through a gate
that runs without another model call.

[tiered-history-projection](./tiered-history-projection.md) requires that
identifiers survive every rewrite a summarizer performs. The gate is how a
system checks that they did, and checks the half that requirement does not
state: that nothing was added.

## Ask for prose in a fixed schema, and parse it locally

The summarizer is asked for plain headed text in a fixed set of sections (the
active task and its status, current state, constraints, decisions, open work),
with each factual item on its own line followed by a source pointer. It is not
asked for structured output. Providers differ in how they honour structured
formats: fenced wrappers, dropped fields, escaped newlines, refusals to emit a
schema at all. A compaction step that depends on those quirks breaks on the
provider that has them. Plain headed text is what every model emits reliably,
and the strictness moves to where the system controls it, the local parser.

The parser **fails closed**. Headings out of order or missing, text outside any
section, a status outside the closed set, more than one status line, a section
that mixes "none" with items, a line that is not an item: each returns no
summary rather than a partial one. A raw length cap runs before parsing. The
failure mode being prevented is specific. A lenient parser turns a malformed
response into an empty or half-populated summary, which is then written over
the last valid one, and an empty summary is failure spelled as success
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The checks that need no model

A parsed candidate then passes a deterministic validator. Each check is cheap,
local, and aimed at one way a summary lies.

- **Every factual item carries a source pointer**, either a sequence range in
  the durable record or an artifact reference. A sequence range must sit inside
  the span the summary claims to cover, and both of its endpoints must exist in
  the store now, not when the summary was written. An artifact reference must
  appear in the evidence the summary was built from. An item that cannot name
  where it came from is testimony, and testimony is what the gate exists to
  refuse. The pointer is also the summary's recomputation path
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
  the exact rows are one recall away whenever wording matters.
- **No identifier appears that the evidence does not contain.** Extract opaque
  identifiers from the candidate and from the evidence (hashes, ticket and
  issue keys, error and status codes, version strings, call names) and take the
  set difference. Anything left over was invented or misspelled, and either way
  it is about to become a standing fact. Ordinary numbers are deliberately left
  out of the extraction: paraphrase, unit conversion and formatting would make
  them false rejections, and a gate that rejects good summaries teaches its
  operators to turn it off.
- **No secrets.** A summary lives in every later prompt and in saved state, so a
  credential that reached it is copied everywhere the prompt goes. Pattern-match
  the rendered summary and reject.
- **No duplicate items, and a cap on item count.** Duplicates are the signature
  of a summary appended to rather than updated; the cap bounds a summary that
  has quietly become a transcript.

What the gate does **not** check should be written next to what it does. A
pointer whose endpoints exist is not a pointer whose range supports the claim.
The gate catches invention and dangling provenance, not misattribution to a
real range. That is the price of running without a model, and it is the reason
the pointer is kept: a reader who doubts an item can follow it.

## The previous summary is evidence only while it is source-backed

An update builds from the previous summary plus the newly evicted span, and
summary-from-summary is where errors compound: each generation paraphrases the
last one, and an invention admitted once becomes evidence for the next. Two
rules keep the chain honest.

The previous summary joins the evidence only if the endpoints of its covered
range still exist in the durable record. When retention has purged them, the
previous summary is **dropped**, and a fresh one is built from the new span
alone. It is never kept by re-pointing its claims at a newer range so that
pointer validation passes; that would convert an unsupported claim into a
supported-looking one. The same check runs eagerly when a session is restored,
before any "nothing to compact" fast path, because saved state routinely
outlives the history it summarized.

All writes to the standing summary go through this one validator: initial
builds, updates, repairs and restores
([one-validation-door](../../../../_laws.md#one-validation-door)). A restore
path that bypassed it would re-admit exactly the summaries retention was meant
to expire.

## One repair, and failures keep the last valid state, marked stale

A candidate rejected for quality gets **one** repair attempt, with the
validator's issues handed back as feedback. A second rejection ends the attempt.
A timeout or a provider error ends it immediately, with no retry: an
authentication failure, a rate limit or a dead connection is not a quality
problem, and asking the same provider again with a quality prompt spends a call
to learn nothing. The whole update runs under one end-to-end deadline, so the
repair cannot double the time compaction holds the turn.

On any failure the previous valid summary stays, and the rendered background
says it is **stale** because the latest update failed. Keeping the old summary
silently would present a view that stopped tracking the conversation as a
current one. The evicted rows are already durable, so nothing is lost; only the
digest is behind, and the model is told so.

The admitted summary enters the prompt behind a prefix stating that it is
archived background: not a user message, not an instruction, not permission to
resume any listed work, with the latest live request taking precedence. Beside
it sits the exact sequence range it covers, as the way back to the rows.

## Decision rules

- Ask for headed plain text in a fixed schema; parse locally; reject on any
  parse deviation rather than salvaging part of it.
- Require a resolvable source pointer on every factual item, and check
  endpoints against the store at admission time.
- Reject any candidate containing opaque identifiers absent from its evidence.
  Keep ordinary numbers out of that check.
- Include the previous summary in the evidence only while its covered range
  still exists. When it does not, rebuild from the new span; never re-point old
  claims.
- Allow one repair for a quality rejection. Allow none for a timeout or a
  provider error.
- On failure, keep the last valid summary and render it as stale.
- Route every write, including restore, through the same validator.

## The quote-only form closes the gap the gate names as its price

The gate above admits **paraphrase with a pointer**, and says what that costs: it
catches invention and dangling provenance, not misattribution to a real range. There
is a stricter form for the case where the summary's job is to *select* rather than to
*restate* — a long build or test log, a diagnostic dump, any source where the few
lines that change the next decision are already written and only need finding. Ask
the reducer for **kinds and quotes, no prose**: each item is one label from a closed
set (fatal, failure, warning, target, summary) and one contiguous quotation, and the
validator admits the item only when the quotation is a byte-exact substring of the
archived source, bound to that source by its hash. Misattribution becomes impossible
by construction, because there is nothing in the item but the source's own bytes and
a label; the line number is derived by the validator, never reported by the model.

Three checks come with the form and are not available to the paraphrase gate:

- **Status is the runtime's, not the reducer's.** The item set must agree with the
  outcome the runtime already knows — a failed command may not produce a receipt
  without at least one fatal or failure quotation when the source carries a failure
  signal. A summary that reads clean over a red log is the failure this form exists
  to refuse.
- **A receipt not smaller than its source is rejected.** The point of the reduction
  is the tokens it removes from every later prompt; a receipt that removes none is a
  rewrite for nothing, and the original is cheaper.
- **Every rejection falls back to the original, with its reason journaled from a
  closed set** — over-size, likely secret, model timeout, schema, unverifiable quote,
  missing failure evidence, not smaller. The fallback is free precisely because
  nothing was summarized in place: the source is still there.

The form trades coverage for certainty. It cannot express "the tests passed except
for the three below" as a sentence; it can only quote the three. Where the reader
needs the sentence — a running summary of decisions and constraints across turns —
the paraphrase gate above is the right one. Where the reader needs the lines, quote
them, and let the reader keep diagnosis, repair and pass/fail authority for itself.

## When not to use this

- **A summary nobody promotes into a standing layer.** A digest a human reads
  once, or a one-off report, does not compound and does not steer later calls.
  The gate's cost buys nothing there.
- **Evidence without stable addresses.** The pointer check needs a record whose
  positions do not shift. Where history is an in-place list with no durable
  sequence, build the addresses first; a gate over unaddressable evidence
  checks only format.
- **Domains where the load-bearing names are not lexically distinctive.** People,
  places, file names in ordinary words: identifier extraction does not see
  them, and the set difference is blind to their invention. Do not advertise
  the check as covering them.
- **As a quality score.** The gate is admission, not grading. A summary that
  passes can still be a poor summary; tune the summarizer's prompt against
  [recovery-path-as-loss-signal](./recovery-path-as-loss-signal.md), not against
  the gate's pass rate.
