---
layer: technique
type: technique
subject: agent-memory
technique: decay-and-forgetting
status: forged
laws: [creation-names-reaper, deletion-is-not-repair, unknown-is-not-a-value]
shared_with: []
use_when: [deciding whether a memory may be forgotten, stale beliefs crowd out fresh recall, a refuted belief still gets recalled, a fact that was true for a window is still recited after the window closed]
---

# Decay and forgetting

Forgetting is a feature, not a failure. A memory store that only grows makes
its owner *worse* at remembering: recall precision falls as candidates
multiply, stale beliefs crowd fresh ones, and the injection budget is spent
on items whose relevance expired quietly months ago. Decay is how the system
keeps its promise that what it recalls is what matters — and the entire
discipline can be compressed into one sentence: **demote gradually, delete
rarely, and never lose the audit trail silently.**

## Importance is scored, and the score names its inputs

Decay needs an ordering — which items matter least right now — and that
ordering is a computed score whose inputs are explicit:

- **Recency** — of last *use*, not only of creation. A belief recalled and
  acted on yesterday is alive regardless of its age; this is the retrieval
  loop feeding back into retention (see
  [recall-injection](./recall-injection.md)).
- **Reinforcement** — how many independent episodes ground it, and whether
  consolidation has strengthened it since.
- **Source grade** — an operator-issued correction outranks an inferred
  pattern at equal age; identity-adjacent items may be exempt from decay
  entirely (their lifecycle belongs to
  [memory-governance](./memory-governance.md)).
- **Category weight** — procedures for systems still in use decay slower
  than observations about a finished project; the categories carry
  deliberate half-lives.

Two disciplines keep the score honest. It is a **derivation** — recomputable
from its named inputs, never hand-poked into individual rows, because a
score adjusted by hand is a ranking with an unmarked exception in it. And it
is **not a private score**: forgetting imports the same value model recall
ranks by ([memory-value-model](./memory-value-model.md)), so remembering and
forgetting can never disagree about what an item is worth. A janitor with its
own notion of importance will retire items the read path was actively serving,
and neither component looks wrong when read alone.

Prefer the **relative** use of the score wherever pressure supplies the
ordering: "the category is over cap, demote the lowest-ranked" states what
actually happens, while a bare "prune below this value" is a constant that
absorbs every disagreement about policy and expresses none of it. But a bare
threshold and *no* threshold are not the only options, and the next section is
the honest middle.

## The forgetting gate is a conjunction, and every clause names a failure

An unattended sweep needs an absolute admission test, because there is no
pressure supplying an ordering — nothing is over cap, the pass just runs. The
rule that makes such a test safe: **the score floor is one clause among
several, and each other clause names the specific failure the floor alone
would cause.** A defensible gate is roughly four conjunctive conditions:

1. **Below the value floor** — computed by the shared value model, so this
   clause cannot disagree with recall.
2. **Older than a grace period** — nothing recent is ever retired, whatever
   it scores. A tentative note written this morning legitimately carries low
   confidence and zero usage; it must survive long enough to be confirmed or
   corrected. Without this clause the sweep eats every new hunch before the
   system can learn whether it was right.
3. **Inside the low-confidence band** — a well-grounded item is never retired
   by age alone. *Old and true is the normal state of a durable fact*, and a
   gate that lets decay reach it quietly erases the organization's history
   while reporting a healthy store.
4. **Not of an exempt kind** — the longest-lived and most expensive-to-lose
   category (typically procedures: what was tried and what worked) is exempt
   from automatic forgetting outright. Not decayed more slowly — exempt. A
   procedure is rediscovered only by repeating the work that produced it.

Two consequences worth stating explicitly. First, the conjunction is what
makes automation acceptable at all: any one clause alone is wrong, and their
intersection is small, conservative, and explainable per item ("this one was
spared by its confidence"). Recording *which clause spared an item* turns the
sweep's output into an audit line instead of a count.

Second, clauses 1 and 3 interact with the value model's retrieval term, and
this is the place implementations get wrong in a way that is invisible until
the store is old. An old, low-trust item that is still being retrieved keeps
its score up through that term and survives the sweep. Read quickly that looks
like a feature — the store declining to forget something still in demand.

It is only a feature if the term is bounded. Retrieval is caused by rank and
rank is caused by score, so the term feeds its own input; sharing the model
with the sweep closes the loop. Unbounded, an item can finance its own
survival indefinitely by being retrieved, and the sweep that exists to retire
it is what confirms it. Worse, the term almost never measures usefulness — it
measures delivery — so what is being protected is not "still valuable" but
"still matching queries".

Require of the value model that the retirement floor stay reachable: state the
number of half-lives after which a low-trust item is archived *whatever* its
retrieval count, and pin it with a test at an absurd count. Retrieval buys a
bounded reprieve, never a veto.

## A pass has a blast radius, and it is declared

However good the gate, the sweep is one edit away from being wrong, and the
edit will be made by someone tuning a constant. So a single pass retires at
most a declared maximum number of items, with the remainder left for the next
pass.

This is not throughput management; it is the difference between a bad policy
edit that costs a reviewable batch and one that empties the store in a single
call. The cap also inserts a human into a loop that otherwise has none: the
pass reports its count, and an unusual count is visible *before* the next pass
compounds it. Pair the cap with the report-only rollout below — the cap
bounds the damage, the report prevents it.

## Demotion tiers, not a trapdoor

Between "active" and "gone" the store keeps intermediate states, because the
cost of wrongly forgetting is asymmetric with the cost of briefly
over-remembering:

1. **Active** — eligible for recall, spending injection budget.
2. **Dormant** — excluded from default recall, still present, still
   reachable by explicit search; a use while dormant revives it. Most
   "forgetting" is exactly this and nothing more.
3. **Archived** — off the hot store entirely, retained for audit and
   provenance resolution, retrievable with effort.
4. **Deleted** — actually gone. Reserved for redaction (sensitivity that
   escaped the write-time screen) and for archive horizons declared up
   front — not a routine stage that bulk cleanup reaches for.

The tiering is what makes decay safe to automate. An automated pass that
*demotes* aggressively costs little when wrong; an automated pass that
*deletes* aggressively converts a scoring bug into permanent amnesia.

## Decay runs on a path that actually runs

The quietest failure in this technique is a lifecycle pass that exists,
is correct, and never executes — reachable only from a manual control
nobody remembers to press, or from the tail of another process that itself
stopped running. The store then carries stale items reciting themselves as
current for months, while the design documents describe a decay model that
is, measurably, fiction. **Forgetting that only happens when a human
remembers to press a button is not forgetting.**

The fix is structural: hook the sweep to a path that provably runs — the
recall path is ideal, since a system whose memory is being read is a system
whose maintenance matters — throttled to a minimum interval, best-effort so
a sweep failure never blocks the live operation, and idempotent so a re-run
after restart costs one cheap check. And because a pass that silently stops
is the original failure again, the sweep's activity is observable: when it
last ran, what it touched.

Two rollout disciplines complete this:

- **Ship report-only first.** New automated forgetting starts by *computing*
  its candidates and reporting them, demoting nothing, until the operator
  has watched it choose correctly. Crucially, the report is produced by the
  **same selection the enforcement will use** — one definition of the
  criteria, two callers — or "what we said we would forget" and "what we
  forget" drift apart the first time the policy is tuned.
- **Demotion has one implementation.** Every path that retires an item —
  supersedence, cap enforcement, decay floor — goes through the same
  operation. A second hand-written spelling of "demote" is a second
  forgetting semantics, and a memory model cannot afford two of those.

## Caps are per category, declared at creation

Every class of memory declares its bound when the class is introduced — so
growth has a named reaper from day one, per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper), instead of a
panic purge scheduled implicitly for the day the store gets slow. Caps are
per category, not global: one global cap means the chattiest category evicts
everything else, and observation volume starves procedure retention. When a
category exceeds its cap, the lowest-*valued* members demote one tier —
ranked by the shared value model, not by a column sort — and the caps drive
the demotion machinery; nothing jumps to deletion because a counter crossed a
line. The ranking clause is load-bearing, because a cap is the janitor
arriving through a second door: one store read for this technique ranks its
recall and its decay sweep by one score and then enforces its active-tier cap
by `importance, then accesses, then age` — a lexicographic order under which a
never-read item of importance four outranks a recently and repeatedly read
item of importance three whose shared-model value is ten times higher. The
cap archives what recall would have served first, which is precisely the
disagreement the one-model rule exists to prevent, and nothing in the cap's
own code reads as wrong.

## Forgetting never orphans provenance

The structural rule that separates principled decay from data loss: **the
provenance graph stays resolvable, or its breakage is explicit.** Beliefs
cite episodes; supersedence chains cite beliefs. Pruning that severs those
links silently converts grounded knowledge into confabulation — the belief
still asserts, but "why do you believe this?" now dead-ends.

Concretely:

- An episode cited by an active or dormant belief is not deleted; it
  archives, and the citation follows it there.
- Deleting a belief that others supersede or derive from keeps a
  **tombstone** — id, kind, when and why removed — so chains terminate at a
  marked stump, never at a dangling pointer. Audit can tell "forgotten on
  purpose" from "lost".
- Redaction is the hard case, since its whole point is content destruction:
  the content goes, the tombstone stays, and dependent beliefs are
  re-judged — demoted or re-grounded — in the same pass, not left standing
  on evidence that no longer exists.

## Decay removes the stale, not the wrong

A belief discovered to be *false* is not a decay case. Letting refuted
beliefs fade on the importance curve leaves them recallable — asserting
confidently — for their whole remaining half-life. Wrongness is handled by
**supersedence** at the consolidation layer, immediately, with the
contradiction preserved as lineage. Decay handles a second axis: things
that were true and simply stopped mattering. There is a third, and neither
mechanism can see it.

The same boundary seen from the other side is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair): when memory
misbehaves — recall surfacing garbage, beliefs contradicting themselves —
the repair is at the layer that failed (scoring, consolidation judgment,
capture screening), not a purge of the artifacts that made the failure
visible. A store that gets emptied every time it embarrasses its owner
converges on an agent with no past, which is the failure the whole subject
exists to prevent.

## The fact that expires by its own terms

Some claims arrive with their own end date written into them: a leave that runs
until October, a constraint that holds until the migration ships, a rate that
applies for this quarter. They are the third case, and they are invisible to
both mechanisms above.

Supersedence cannot reach them, because nothing arrives to supersede. October
produces no replacement fact; the world simply moves past the claim and files
no notice. And decay cannot reach them either, because on every input the score
reads they look healthy — recently written, well grounded, high confidence,
often *heavily* retrieved, since a claim about the current quarter is exactly
what queries about the current quarter match. That last property is the trap:
a time-boxed fact banks its retrieval bonus precisely during the window in
which it is true, and then spends it staying alive afterwards. The store's own
usage signal keeps its most confidently wrong items in the recall set.

The rule: **when a captured claim states its own validity boundary, store the
boundary as a field, not as prose inside the body.** This is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) at the level of
the individual item rather than the category — the claim named its reaper when
it was written, and the only job is to not throw that away.

Three consequences follow from where the boundary is read:

- **At capture, not at recall.** The context that dates a claim — "until
  October", "for this sprint", "before the cutover" — is present when the
  episode is written and gone by the time anything retrieves it. A pipeline
  that defers the question re-asks "is this still true?" on every read,
  forever, which is the read-time judgment the whole hierarchy exists to
  perform once.
- **On the boundary, not on a score.** Retiring an expired item needs no
  threshold, no conjunction and no argument about weight. The conjunctive
  gate exists because an unattended sweep is *guessing* whether something
  still matters; here the item already answered. Expiry is a separate,
  simpler exit from the same store, and it runs on its own clause.
- **Category half-lives cannot substitute.** A half-life is a property of a
  kind; an expiry is a property of one claim. Most preferences outlive the
  year and this one dies on the fourteenth, and no per-kind curve fits both
  without being wrong for one of them.

Expiring is still forgetting, so it inherits the discipline above unchanged:
an expired item demotes and leaves its tombstone, and the beliefs it grounded
are re-judged in the same pass. What it does not inherit is the grace period —
a claim past its own stated end has nothing to be spared for.

The honest bound: a claim that states no boundary does not get one invented.
Most facts have no expiry, guessing at one manufactures a deletion date out of
nothing, and an absent boundary is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value),
not a default. This clause only ever fires on what the source actually said.

## A review window is not an expiry

The bound above forbids inventing one field. A different field not only
may be estimated but must be: **when to ask again.** An expiry is a
property of the claim — the world stops matching it on a date — and only
the claim can supply it. A review deadline is a property of the store's
confidence in the claim, and its consequence is a *re-judgment*, not a
removal. Guessing it wrong costs one review; guessing an expiry wrong
costs a fact. So the same judgment that writes an item assigns it an
expected-valid window, and the sweep that reaches aged items asks a
question rather than pulling a lever.

Five rules keep the estimate from becoming a trapdoor:

- **Clamp at write.** The assigned window is capped at the category's age
  floor times a multiplier, so the writer cannot defer first review
  indefinitely by being confident. A generous cap is fine — several years
  for the stable tier — as long as it is a cap.
- **The review's verdicts are keep, remove, or extend.** Remove inherits
  every discipline above (demote, tombstone, re-judge dependents). Extend
  sets a new window bounded by an **absolute ceiling**, not the creation
  multiplier: a deliberate review may push past the creation cap, and the
  ceiling exists so a malformed extension cannot defer forever or overflow
  the clock.
- **The reviewer touches only what the selector surfaced.** The candidate
  set is computed deterministically — older than its own window, not in a
  protected category — and both the removal and the extension sets are
  intersected with it before the per-cycle cap applies. Protected kinds
  (an operator's correction, above all) never enter, whatever the reviewer
  proposes. An item proposed for removal is excluded from extension even
  when the cap spared it this cycle.
- **A merged item inherits the earliest deadline.** When consolidation
  synthesises one item from several, the merged item's window is the
  earliest source review deadline, expressed relative to the newest
  source's creation, clamped to a minimal positive window if a source is
  already overdue and capped at the creation cap. A volatile detail must
  not inherit a stable sibling's long window and escape review for years;
  a merge of uniformly stable sources should not re-enter review early. A
  legacy source with no window contributes the category default, so its
  short default is not swallowed by a long-lived sibling.
- **The clock is the source's, not the synthesis's.** The merged item
  carries the newest source's creation time, so staleness measures the
  age of the information rather than the age of the merge.

The discriminator to carry: a date the claim stated is an exit and runs on
its own clause; a date the store estimated is a question and runs through
the review. A store that treats the second as the first has reinvented the
trapdoor with a confidence score attached.

## A deliberate forget bars re-derivation; an expiry does not

Every exit above retires an item and leaves the episodes that grounded it in
place. That is correct, and it has a consequence the tombstone section does
not cover: the next distillation pass reads the same episodes and **derives
the item again.** For an expired claim that is the right outcome — October
closing is exactly the moment a fresh fact under that key becomes learnable.
For an operator's "forget that" it is the correction being reversed, silently,
on the next cycle, by a pass doing its job. The person who asked sees the
fact return and concludes, correctly, that forgetting did not happen.

So forgetting is two operations with opposite re-derivation policies, and a
store with one forget verb cannot express both:

- **An expiry** retires the item and leaves the key learnable.
- **A deliberate forget** retires the item *and* writes a bar on the key —
  scoped to the owner or scope it was forgotten in, so one scope's silence
  does not fall on another — that consolidation consults before it mints.
  The bar is keyed on the **key, never the value**: matching on the value
  would let the next cycle re-derive the same fact under slightly different
  wording, which is the silent relearn the bar exists to prevent. It records
  what was forgotten for the audit trail and is never matched against.

Two stores in one tree converged on this shape independently, and both chose
the same lifting rule, which is the part worth taking: **the bar is lifted
only by the person speaking again** — an explicit write under that key clears
it inside the write's own transaction, and there is deliberately no separate
un-forget operation, because an unused one would be a second door. A
consolidation pass never lifts it; a pass that reaches a barred key skips the
candidate and counts the skip, so the operator can see how often the store
wanted the fact back. This bar is a different artifact from the provenance
tombstone above — that one terminates chains so audit can tell forgotten from
lost; this one faces forward, at the writer — and a store needs both, because
neither answers the other's question.

The bound is the same as the expiry's: the bar fires only on a forget the
human issued. An automated sweep, a cap, a decay floor — none of them may
write one, or the store's own hygiene starts forbidding itself knowledge.
