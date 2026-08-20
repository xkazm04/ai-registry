---
layer: technique
type: technique
subject: automated-screening-fairness-gates
technique: hold-as-the-canonical-fallback-verdict
status: forged
laws: [uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [designing the outcome vocabulary of an automated screening step, handling an unparseable or unexpected model verdict, deciding what happens when a scoring service is degraded]
---

# Hold as the canonical fallback verdict

## The concern

Every decision path in a screening pipeline has a default branch, whether or not anyone
designed one. The default is reached by malformed model output, by a verdict string the
vocabulary does not contain, by a scoring service that timed out, by a candidate record
missing the field the rule keys off, by an enum extended in one service and not the
other, and by the plain `else` at the bottom of a chain of conditions. In an
unconsidered system that branch resolves to whatever is cheapest to execute — usually
"no action", which in a pipeline with an aging sweep behind it eventually becomes a
rejection, or worse, to the first branch in the list, which is often advance.

The technique is to make **hold** — a real, named, terminal-for-automation state meaning
*a person must look at this* — the single destination of every unhandled path, and to
make it structurally impossible for a fallback to resolve to advance or reject.

## The procedure

1. **Declare the outcome vocabulary as a closed set** with exactly three members:
   advance, hold, reject. Closed means the type refuses unknown members at the boundary,
   not that a comment lists them.
2. **Designate hold as the fallback in the type itself**, at the point where the
   vocabulary is defined, with the reason written next to it: never advance, because
   advancing on an unparsed verdict promotes a candidate on nothing; never reject,
   because rejection is not a routable automated outcome at all.
3. **Make every parse a total function.** Anything that converts an external string,
   model output, stored value or configuration entry into the vocabulary returns hold for
   every input it does not recognize — and returns hold *loudly*, emitting a signal that
   an unrecognized value was seen, so the vocabulary drift gets fixed rather than
   absorbed.
4. **Give hold a real destination.** A hold enqueues a candidate into a named human
   queue with the reason attached — low confidence, shielded cohort, unparsed verdict,
   degraded run, missing evidence. A hold with no reason is indistinguishable from
   neglect.
5. **Wire degradation to hold.** When the scoring model is unavailable, rate-limited or
   returning errors, the pipeline continues on the deterministic path with provenance
   truthfully downgraded, and the outcome is hold — never a frozen verdict presented as
   authoritative, and never a block on the candidate's own progress.
6. **Instrument the hold rate and the hold *age*.** The first tells you whether the
   policy band is sane; the second tells you whether hold still means what it says.

## Decision rules

- **When the verdict cannot be parsed, mapped, or trusted, the outcome is hold.** No
  exceptions, no per-caller overrides, no "advance if the score was high and only the
  rationale failed to parse" — a partially parsed verdict is an unparsed verdict.
- **When a deterministic verdict for this exact candidate already exists, prefer it over
  a blind hold — and only then.** A pipeline that computes a rule-based verdict as its
  fallback path has something better than "we don't know": a context-aware answer
  produced under the same fairness gates as the model's. Passing that as the coercion
  default is strictly more informative than a blanket hold. The conditions are strict,
  though: the deterministic answer must itself pass the shield and the route narrowing,
  and where no such answer exists the default returns to hold. Never let a caller supply
  an arbitrary fallback — that is how advance gets in through the back door.
- **When the fallback would be advance, you have inverted the asymmetry.** A wrongly-held
  candidate costs one review; a wrongly-advanced candidate costs an interview slot and
  gives a hiring manager a candidate the system never actually endorsed. A wrongly-
  rejected candidate costs them the job and costs you the claim. Order the defaults by
  that ranking, every time.
- **When a hold has no reason attached, treat the code path as unfinished.** The reason
  is what makes the human review meaningful rather than a rubber stamp, and a review
  that could not have gone the other way does not satisfy the oversight obligation.
- **When median hold age approaches the aging horizon, the hold state has failed.** Hold
  is a promise of human attention; unstaffed, it degrades into an unannounced rejection.
  [A candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
  — your review capacity is your constraint, not theirs. Fix it by narrowing the band or
  staffing the queue, never by widening the auto-reject ceiling.
- **When the vocabulary needs a fourth member, add it as a hold *reason*, not as an
  outcome.** The outcome set is closed because the code that acts on it is enumerable;
  reasons can proliferate freely because nothing branches on them.

## The band that produces holds

Hold is not only the error path — it is the ordinary outcome for the middle of the score
distribution, and that band must be non-empty by construction. Two properties:

- **The advance floor is strictly above the reject ceiling**, with real distance between
  them. A configuration where they meet abolishes the undecided state; refuse to load it.
- **The band widens under uncertainty, never narrows.** Low model confidence, a sparse
  candidate record, a role with few historical decisions, a freshly-changed rubric: each
  is a reason to route more candidates to a person, not fewer. A team under throughput
  pressure will try to narrow the band; the honest lever is the advance floor, not the
  reject ceiling, because only one of those two directions is irreversible.

## When NOT to use it

- **Not where the automation has no adverse branch.** A ranking surface or a
  notification does not need a hold state; it needs an empty state and an honest "not
  scored" marker.
- **Not as a dumping ground for engineering defects.** If a parse fails routinely, hold
  is catching a bug and hiding it. Hold must be loud: the candidate is safe, and someone
  is paged about the vocabulary drift.
- **Not as a stand-in for the shield.** Hold catches uncertainty; the cohort shield
  catches known instrument failure. A shielded candidate should be held *by the shield*,
  named as such in the record, not incidentally by a low-confidence fallback that a
  future confidence-threshold change would remove.
- **Not where a genuine human decision already exists.** Do not re-hold a candidate a
  person has already decided on. The fallback governs the machine's paths;
  [no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated)
  is satisfied the moment a person with authority has actually decided, and re-queueing
  their decision only teaches reviewers that the queue is noise.
