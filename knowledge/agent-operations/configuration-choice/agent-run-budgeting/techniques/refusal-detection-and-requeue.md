---
layer: technique
type: technique
subject: agent-run-budgeting
technique: refusal-detection-and-requeue
status: draft
laws: [a-refusal-is-not-a-result, measure-the-tree-not-the-summary]
shared_with: []
use_when: [a provider returns a limit or capacity message mid-queue, writing the runner that records agent runs, auditing stored results for runs that never happened]
---

# Refusal detection and requeue

The concern: a provider refusal is not an agent result, but it arrives through the same
channel as one and is trivially mistaken for a fast, empty run. Stored, it becomes a
zero-output data point attributed to a model — and because such runs are cheap, a single
exhausted window can manufacture dozens in minutes. **The detector must read the refusal
wherever the runner puts it, and the handler must requeue rather than record.**

## Detecting

- **Never trust the status field alone.** A refusal can arrive as a non-zero exit, as an
  error envelope whose category says nothing useful, or as a *success-shaped* envelope
  whose body carries the message. A detector keyed only to the status misses the last one
  entirely.
- **Read the structured fields before the text.** Where the runner forwards them, the
  error flag, the terminal reason, the upstream status (429 is your allowance, 529 is the
  provider's capacity), a rate-limit event carrying its reset instant and limit type, and
  the provider's spend-limit error code classify a refusal exactly. The order and the
  observed disagreements are in
  [termination-cause-record](termination-cause-record.md).
- **Match on the message text as the fallback**, across the vocabulary providers actually
  use: usage limit, session limit, rate limit, quota, at capacity, overloaded, server busy,
  temporarily unavailable — and carry the text into the run's error field so the handler
  and the log both see it. Match only the error text of an envelope that says it errored:
  a model's *output* that quotes a limit message is content, and a detector that reads it
  pauses a healthy seat.
- **Treat suspiciously fast runs as suspects.** A run that returns in seconds with no
  tokens and no output is either a refusal or a crash; both are requeued, never scored.
  The sharper signature, where the runner reports it, is zero time spent in the API with
  zero tokens: the request was rejected before inference. A duration floor per task shape
  is a cheap backstop for refusal wording nobody has seen - set it from the shape's honest
  minimum, not as one constant, since a trivial task finishes fast legitimately and a
  refusal that arrives after the runner's own internal retries is not fast at all.
- **Distinguish the two families of refusal.** *Capacity* ("busy, try again") recovers in
  minutes; *allowance* ("limit reached, resets at T") recovers at a stated time. They get
  different pauses, and the provider usually names T — use it rather than guessing.

## Requeueing

1. **Quarantine the artefact.** Move the partial record out of the result set so nothing
   downstream can mistake it for a result - but move it, do not delete it. The quarantine
   is how the detector's vocabulary grows, and it is the only evidence left when the
   detector is wrong the other way: a real run misclassified as a refusal and deleted
   disappears without a trace.
2. **Pause the scope the limit belongs to**, not just the failed cell - and not more than
   that scope. A subscription seat's session or weekly window is the whole seat; an API
   key's limits are per model or per model group, so other models on the same key keep
   running; a spend cap is the whole organisation; a capacity refusal is the provider's
   state for that model, not your allowance. Within that scope the next cell will hit the
   refusal too, and a queue that keeps trying converts one refusal into a hundred log
   lines. Per-model limits have been observed on subscription sessions as well, so a
   seat-wide pause is the safe default only for a single-model queue.
3. **Requeue the cell** for the next pass, and make a pass boundary exist — a queue that
   only ever runs each cell once loses every refused cell permanently.
4. **Audit afterwards.** Scan stored results for refusal vocabulary and near-zero durations
   before trusting any aggregate; a detector added after a window closed does not
   retroactively clean the record it failed to catch.

## Decision rules

- **A refused cell is never reported as a failed cell.** In coverage tables it is *missing*,
  which is honest and visibly incomplete, rather than *zero*, which is a lie that averages.
- **Do not raise parallelism to beat a volume allowance.** Against a fixed-volume window -
  a session or weekly cap - concurrency spends the same window faster and leaves more cells
  in flight when it closes; it converts a slow queue into an exhausted seat. A per-minute
  token bucket is different: it refills continuously, so below its rate parallelism is free
  and the rule is to size to the rate and ramp up gradually.
- **Record the reset time in the log, not just the pause.** An operator reading the log
  needs to know whether the fleet resumes in ten minutes or in five days — those are
  different decisions about what else to run.
