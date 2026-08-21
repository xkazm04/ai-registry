---
layer: technique
type: technique
subject: inference-labelling-and-refusal
technique: declare-degraded-provenance-never-launder-it
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, inference-must-look-like-inference, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a model call fails or falls back, deciding what may be cached, a grounding check strips an unsupported claim]
---

# Declare degraded provenance, never launder it

Every system with a model in it runs without one sometimes. Outage, quota, timeout,
malformed response, a schema repair, a grounding post-check that removed a claim the
evidence did not support. The pipeline continues — it must, because a candidate's
process may not stall on the operator's constraints
([a-candidates-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

The failure is not the fallback. The failure is the fallback arriving dressed as
the real thing. A deterministic keyword match that renders in the same panel, with
the same wording and the same visual weight as a full analysis, has laundered its
provenance: the reader cannot tell that today's assessment of this person is a
weaker instrument than yesterday's.

## The two rules

**Rule one: every verdict is tagged with its source at the moment it is produced.**
Not derived later, not inferred from a timestamp — stamped by the code path that
made it. The minimum vocabulary:

| Source | Means |
| --- | --- |
| **authoritative** | the intended model produced it, validated against the output contract |
| **repaired** | the model produced it, but a validation or grounding step altered it |
| **fallback** | a deterministic path produced it because the model path did not run or did not survive |
| **human** | a person wrote or overrode it |

The tag travels with the verdict for its whole life: through storage, through
export, into the audit record, onto the screen. A tag that is dropped at the first
hop is not provenance, it is a local variable.

**Rule two: only the authoritative grade may be frozen.** A degraded result must
never be cached, memoised, or promoted into the durable record as though it were
the real one. This is the rule teams skip, and it is the one that does lasting
damage: caching converts a five-minute outage into a permanent, invisible
misstatement about a specific person, which will be read months later by someone
who has no idea the model was down that afternoon. If the run was degraded, either
do not cache it, or cache it with an expiry short enough that it cannot outlive the
incident — and mark it so that any read knows what it is holding.

## Procedure

1. **Make the source a required field of the verdict type.** Not optional, not
   defaulted. A producer that cannot say how it produced something should not be
   able to compile.
2. **Gate the cache on the tag, at the write.** The cacheability decision belongs at
   the moment of production, where the degradation is known — not at the read, where
   it has already been forgotten.
3. **Surface degradation as lowered confidence, not as identical output.** The
   reader sees that this assessment ran on a weaker instrument, and the surface
   invites the human step that a full run would not have needed.
4. **Treat a stripped claim as a coerced answer.** When a grounding check removes an
   unsupported statement, what remains is no longer the model's answer; it is the
   system's. Mark it repaired. A coerced answer that poses as model output is the
   subtlest form of laundering, because the text is genuine — only its authorship
   changed.
5. **Bind the verdict to its instrument version.** A verdict is bound to what it
   judged and to the rubric that judged it
   ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged));
   the producing path is part of that binding, so a later comparison does not put a
   fallback and a full analysis side by side as equals.
6. **Never let a fallback drive an adverse outcome.** A degraded run may produce a
   hold or a "needs review"; it may not produce a rejection, and it may not
   contribute an unmarked input to one.
7. **Judge degradation on the core of the result, and let it colour the whole.**
   When a model under-delivers and only part of the output is backfilled from a
   deterministic template, the result is not "mostly authoritative". If the parts
   that carry the verdict came from the fallback, the whole payload is degraded.
   Partial-credit provenance is how laundering re-enters through the back door.
8. **Declare degradation you can predict, before the run.** Where a routing choice
   is known in advance to lack a capability the task depends on — a grounding
   source, a document input, a schema mode — the system should refuse the routing
   or flag the missing capability up front, so the surface shows lower confidence
   from the start rather than discovering the weakness at read time.
9. **Record the degradation as an operational event too.** Provenance tags tell the
   reader; a metered rate of degraded runs tells the operator that the instrument
   has been weak for a week.

## Decision rules

- **When the model path fails and no honest fallback exists, hold — do not
  substitute a weaker judgment silently.** An empty, explicitly-pending state is a
  better artifact than a confident guess from a keyword matcher.
- **When a degraded verdict already exists and a full run becomes possible, prefer
  recomputation over reuse**, and let the record show that the earlier verdict was
  degraded rather than overwriting the history.
- **When a candidate asks how a decision about them was reached, the provenance tag
  is part of the answer.** "This was produced by a fallback path during a service
  outage" is an honest and defensible sentence; discovering it later from a log is
  not.
- **When a fallback is used for a candidate-initiated action — booking, submitting,
  accepting — it must never block or fail them.** Degrade the assistance, never the
  candidate's path.
- **When several verdicts of different grades are aggregated, the aggregate takes
  the weakest grade present.** Averaging a fallback into an authoritative set does
  not raise the fallback; it lowers everything.

## When not to use it

- **Where there is no meaningful degradation.** A purely deterministic pipeline with
  no model in it produces one grade of output; adding provenance ceremony there is
  noise. (It still owes its rubric version — that is a different obligation.)
- **Where the tag would be the only difference visible to a candidate and would
  confuse more than inform.** Candidate-facing surfaces should express degradation
  as its consequence — "a person is reviewing this step" — rather than as internal
  vocabulary. The tag stays in the record and in the internal surface.
- **Where an operator explicitly chose the cheaper path as policy** rather than
  hitting a failure. That is a deliberate instrument choice, not a degradation, and
  it should be recorded as such — but the same rule applies to what it may be
  compared against, because the reader still needs to know which instrument ran.
</content>
