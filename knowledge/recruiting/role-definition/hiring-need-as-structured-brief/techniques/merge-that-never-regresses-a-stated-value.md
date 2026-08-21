---
layer: technique
type: technique
subject: hiring-need-as-structured-brief
technique: merge-that-never-regresses-a-stated-value
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a brief accumulates across turns or sessions, a re-extraction overwrites confirmed content, deciding what a manual save confirms]
---

# A merge that never regresses a stated value

A hiring brief is written many times: once per extraction pass during a
session, again when a human edits it, again when the need changes and the role
is re-opened, again when a second pass runs over the same transcript. Each of
those is a merge of a new partial brief into an existing one, and the merge
rule is where the record's integrity is either kept or quietly lost.

Two properties define a correct merge.

## Union, not replace

A later pass carries what it saw, not what exists. Extraction is lossy in both
directions: a second pass over a longer transcript will surface things the
first missed, and will also fail to re-surface things it found the first time
— models are not deterministic re-readers, and a pass focused on the last five
turns has no reason to re-emit an entry from turn two.

So a merge **unions** entries: everything in the existing brief survives unless
something explicitly supersedes it. Absence in the incoming pass is not a
deletion signal — it is silence, and silence is not data here any more than a
skipped question is. A replace-semantics merge produces the worst bug in this
whole subject, because it is invisible: content disappears between saves, and
nobody notices until a rubric is missing an axis.

Deletion therefore needs its own explicit path — a human removing an entry —
and that removal is itself an event with an actor and a moment.

## Trust is monotone

Where both sides hold a value for the same entry, the merge picks by **basis
first, recency second**:

- A `stated` value is never overwritten by an `inferred` or `default` one. The
  requestor said it; a later model reading does not get to un-say it.
- An `inferred` value yields to a `stated` one immediately, whatever the
  confidence attached to it.
- An `inferred` value yields to a later `inferred` one only when the newer
  reading is at least as confident, or rests on newer evidence — a later pass
  that got *less* certain has not learned anything worth overwriting with.
- A `default` yields to anything.

The single sentence that carries the technique: **a stated grading never
regresses to an inferred one.** It applies to the grade as much as the content
— a requirement a human moved from prerequisite to learnable must not be
re-promoted by the next extraction pass reading the same forceful sentence
that produced the original grading. Losing that is how a brief acquires the
folk reputation of "it keeps changing back", after which humans stop editing
it, after which the extractor's readings become the record unchallenged. See
[inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
— an inference that can overwrite an assertion has stopped looking like one.

## What a manual save confirms

The tempting shortcut is: the human opened the brief, reviewed it, saved it,
so everything in it is now confirmed. It is wrong, and it is the most damaging
form of provenance laundering available, because it converts a whole record of
mixed-basis content into uniformly `stated` in one click — after which no
reviewer, ever again, can find the lines the extractor invented.

The rule: **only entries that actually changed flip to `stated`.** Untouched
entries keep the basis they had. A reviewer who edits one requirement has
confirmed one requirement. If the surface wants a bulk-confirm affordance, it
must be an explicit, per-entry, visibly-deliberate action — not a side effect
of saving.

## Freezing

Once a brief has been promoted into an open role and candidates are being
measured against it, the record stops merging. Later changes create a new
version; the promoted one is frozen, with its entries, its bases and its source
pointers intact. This is not archival hygiene, it is the only way a decision
can be bound to what it judged
([a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)):
a screening decision taken against a brief that has since silently mutated
cannot be explained at all, and the explanation that *is* offered will describe
requirements the decision never saw —
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).

## Decision rules

- **When two entries collide, compare bases before timestamps.** Recency is
  the tiebreak within a basis, never across bases.
- **Match entries by a stable identity, not by prose equality.** Requirements
  collide on the normalised capability they name; facets collide on their key,
  never on their human label — labels are free-form and localised, and two
  different facets will match by accident the day the interface is translated.
- **Never use "equal to the schema default" as the test for untouched.** A
  scalar merge that skips an incoming value because it happens to equal the
  default cannot distinguish a requestor who genuinely stated that value from a
  pass that never captured it — and it silently refuses to record a real
  answer. Consult the basis map; that is what it is for.
- **Cap the lists, and cap them where a human can see it.** Unbounded
  accumulation across many passes turns a brief into an unreviewable pile, and
  an unreviewable brief is approved unread. A cap is a design decision about
  how much a reviewer can hold, not a storage limit.
- **When the incoming pass omits an existing entry, keep the entry.** Silence
  never deletes.
- **When a human deletes, record the deletion with actor and moment** rather
  than removing the row from history. The removed requirement is often exactly
  what a later challenge asks about.
- **When a requestor genuinely reverses themselves in a later turn**, the new
  statement is `stated` and supersedes the old `stated` value — monotonicity
  is about basis, not about immutability of content. Keep the superseded entry
  with its source turn; a reversal is a fact about the role's definition.
- **When merging two briefs from different sessions with different requestors**
  — a manager and a team lead, say — do not silently union conflicting stated
  values into one list. Two people stated different things; that is a finding
  for the conversation, not a schema problem, and the brief should surface the
  conflict rather than resolve it by arrival order.
- **When a brief is frozen, reject writes rather than diverting them.** A
  write that silently lands on a new draft the user cannot see is worse than
  an error message.

## When not to use this

- **On free-text working notes.** Last-write-wins is fine where nothing
  downstream reads the field and no basis is tracked.
- **On a first write.** There is nothing to merge into; the machinery starts
  at the second pass, and building it before there is a second writer is
  premature.
- **As a substitute for a conflict conversation.** The merge rule protects
  the record from the *system*; it cannot adjudicate two humans who want
  different roles. Surface, do not resolve.
