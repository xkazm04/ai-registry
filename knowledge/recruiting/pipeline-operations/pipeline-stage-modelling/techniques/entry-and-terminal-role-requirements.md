---
layer: technique
type: technique
subject: pipeline-stage-modelling
technique: entry-and-terminal-role-requirements
status: forged
laws: [meaning-does-not-live-in-a-label, a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor]
shared_with: []
use_when: [validating a team's edited pipeline, deciding whether a board edit may be saved, writing the move rulebook]
---

# Entry and terminal role requirements

A team may shape its board freely, but not *every* shape is a pipeline. Two
invariants make an ordered list of stages into a funnel a candidate can
actually traverse, and both concern the ends:

- **Exactly one entry-role stage, and it is first.** A new applicant needs
  one unambiguous landing place. Two entry stages means an arriving candidate
  has no defined destination and the answer becomes whichever code path ran.
- **At least one terminal-role stage, and terminal stages sit last.** A
  pipeline with no absorbing state is one a candidate can never leave, which
  is a process that never ends for a person waiting on it
  ([a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

Everything between the ends is the team's business.

## The full well-formedness set

The governing principle: **validate exactly what something resolves through,
and nothing else.** Every rule you add is a shape you have forbidden a real
team from expressing, so each one has to earn its place by naming the
consumer that would break without it. That yields a short list:

1. **Exactly one entry-role stage, and the axis opens with it.** Not "an
   entry exists somewhere" — arrival needs one destination, and a rule that
   only checks presence lets a team bury it in the middle.
2. **Exactly one terminal-role stage, and the axis ends with it.** A stage
   ordered after the end is unreachable by construction.
3. **At most one offer-role stage.** Two offer stages make "are they at the
   offer step" ambiguous for every guard that asks it.
4. **Every stage has a role.** No defaults, no nulls; the strongest form of
   this refuses to compile when a stage is added without a role decided.
5. **Identities are unique and bounded**, and ordering is total.
6. **At least two stages.** An axis that is only an entry has no way out.

And then stop. Any number of screening stages, interview rounds, scoring
passes and custom columns, in any order, under any name, is a legitimate
board. A team that runs no screening step, or five interview rounds, or a
client-approval column between them, is describing their real process — and
a validator that refuses it teaches them to work around the editor, which
produces exactly the off-axis candidates the invariants exist to prevent.

Custom stages hold no powers by consequence rather than by a separate rule:
they are not the entry, not the terminal, not the offer, and every
policy-carrying slot is resolved by role, so a control attached to a custom
column would be a switch wired to nothing.

## Terminal means absorbing, and refuses rather than accepts

The most commonly weakened invariant is terminality. It is tempting to allow
moving a candidate out of a terminal stage — someone marked hired by mistake,
a rejection reversed. Allow that and every terminal count becomes provisional
and every "hired" event has to be re-checked for later reversal.

The rule that holds: **a move whose source is a terminal stage is refused
with an explicit error, not silently accepted and not silently ignored.** The
correction path is a separate, named, actor-recorded action — a reversal —
which is a decision about a person and therefore names who made it
([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
A reversal seals to the reverser; it does not restore the candidate's
previous state as though nothing happened.

The mirror rule guards the entrance: the terminal stage is **outcome-bearing**,
so it is entered by the event that produces the outcome and not by a manual
move. A recruiter dragging a card into the hired column has recorded a hire
with no offer, no acceptance and no record of the candidate agreeing to
anything. Both guards are the same statement — a terminal stage is not a
place on the board you move people to and from, it is where a concluded
process is written down.

Refusing loudly matters more than it appears. A move rulebook that silently
declines produces an interface where a drag lands and then bounces back with
no explanation, and recruiters conclude the board is broken and stop trusting
every other refusal it issues.

## Offer approval extends; it does not hire

The second invariant that gets weakened is at the offer end. An approval on
an offer-role stage means *the offer may be extended* — it is a decision
about terms, taken by the employer. Whether the person is hired depends on
them accepting, which is their decision and arrives later, from outside.

Collapsing the two makes a hire count that measures employer intent rather
than filled roles, inflates every acceptance-related metric to a constant,
and — worse — tells a candidate they have been hired before they have agreed
to anything. The transition an approval performs is *into the offer-extended
state*, and terminal-hired is reached only by an acceptance the candidate
supplies.

## Where the invariants are enforced

Enforce at every write door, not only in the editing screen:

- **Axis edit** — refuse malformed saves with a specific message naming the
  broken rule.
- **Board provisioning** — a default axis handed to a new team must itself
  satisfy the set, or the first thing every team inherits is an invalid
  board.
- **Move execution** — re-check at the moment of the move; the axis may have
  changed between the interface rendering and the drop.
- **Bulk and automated moves** — same rulebook, no privileged path. An
  automated route that can enter a terminal stage the interface refuses is a
  second writer with different rules.

The recurring bug is a validation that lives only in the editing surface,
leaving the interface and an integration to write boards the rules would have
refused.

## Decision rules

- When a save would leave zero terminal stages, refuse and name the rule. Do
  not auto-append a terminal: a silently invented stage is one nobody
  designed and nobody explains to a candidate.
- When a save would create a second entry stage, refuse and ask which one
  arrivals should land in — the answer is a decision, not a tiebreak.
- When a manual move targets the terminal stage, refuse it too. Terminal is
  the *outcome*, and on a well-built board it is reached by the event that
  produces the outcome — an acceptance, a rejection, a withdrawal — never by
  dragging a card. Hand-setting it bypasses the record that outcome was
  supposed to create. The refusal must name the route: "the final stage is
  set when the candidate accepts; move them to the offer stage and extend an
  offer" is a redirection, where "invalid move" is a wall.
- When a stage-changing write arrives naming a *retired* stage, accept it:
  that is a legitimate place for a candidate to be standing until a migration
  moves them, and refusing the write loses the application. Validate against
  what the axis can *resolve*, not against what it currently renders.
- When a move's source view may be stale, carry the stage the caller believed
  the candidate was in and refuse on mismatch. A board is a snapshot, and a
  decision taken against a stale snapshot is a decision about a situation
  that no longer exists.
- When an automated actor would enter a terminal stage carrying an adverse
  outcome, park it at a human gate instead. Automation may move a candidate
  onward; concluding a person's process adversely is a human act.
- When ordering constraints conflict with a team's requested layout — they
  want a terminal in the middle — the answer is that they have two boards, or
  a custom stage, not a relaxed invariant.

## When not to use this

Do not apply the full set to a board that is not a candidate pipeline. An
internal task lane, a sourcing scratchpad or a saved shortlist may
legitimately have no entry and no terminal, and forcing funnel invariants on
them produces meaningless stages teams work around.

Do not use the invariants as a reason to block a team mid-edit. Validation
belongs at save, with a clear message, and the board they already have keeps
working until they fix it. A pipeline that refuses to load because it is
malformed strands every candidate in it — the failure the terminal invariant
exists to prevent, reintroduced by its own enforcement.
