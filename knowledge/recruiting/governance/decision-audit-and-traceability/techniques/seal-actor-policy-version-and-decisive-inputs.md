---
layer: technique
type: technique
subject: decision-audit-and-traceability
technique: seal-actor-policy-version-and-decisive-inputs
status: forged
laws: [every-decision-names-its-actor, a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds]
shared_with: []
use_when: [designing the shape of a decision record, deciding what to snapshot versus reference, auditing an existing record for replayability]
---

# Seal the actor, the policy version, and the decisive inputs

## The concern

A decision record that stores identifiers is a promise to reconstruct, not a
reconstruction. Identifiers resolve against live rows, and live rows move: scores get
recomputed, rubrics gain axes, thresholds get tuned, prompts get rewritten, people change
teams and titles. Every one of those changes is legitimate operational work, and every one
of them silently rewrites the past of every decision that pointed at it. Twelve months
later the record says the candidate fell below the bar, and neither the score nor the bar
is the number that decided anything.

Sealing means the record carries, in itself, the three things that make the outcome
re-derivable without the rest of the system: **who**, **under what rule**, and **on what
evidence**.

## Procedure

**1. Resolve the actor server-side, from the authenticated session.**
The actor is a natural person or an explicit automated process, never a value the caller
supplies. Two rules follow, and both have teeth:

- **Never accept an actor from the client.** A caller who can name the actor can name
  somebody else, and a forged actor field turns your audit trail into a weapon aimed at an
  innocent employee. Where an actor identity is hashed or otherwise made durable, the
  input to that hash must be server-derived for the same reason — a hash of a claim is
  still a claim.
- **Nullable on purpose, and three-state at render.** When the process genuinely cannot
  determine a person, the field is empty and renders as *not identified*. It never falls
  back to the account that owns the workspace, the service identity, or the last human
  seen. Per [every decision names its actor](../../../_laws.md#every-decision-names-its-actor),
  misattributing accountability is the one failure this surface may never have, and a
  default person is misattribution with extra confidence. The third state is genuinely
  third: an unknown writer is misattributed neither to a person *nor* to the machine, and
  a surface that renders only two classes will silently pick one.
- **A claimed actor may only downgrade.** Where a caller is permitted to declare itself —
  a simulation harness, a scheduled runner, an integration — honour only the known
  non-human values. The claim can then move authority from human to automated and never
  the reverse, so a caller can never forge a human decision. Note the two rules point in
  different directions and both are right: an *asserted* actor resolves downward, while an
  *unresolvable* actor resolves sideways into the unknown state rather than downward into
  "the machine did it".

**2. Stamp the version of every rule that was in force.**
Not the rule's name — its version. A rubric identifier, a threshold set, a policy tier, a
prompt version, a model routing decision: each gets a version token sealed into the record.
Per [a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged),
a verdict scored under a superseded rule is *marked superseded*, never silently re-meant
under the successor. The practical payoff arrives the first time you change a rule and
need to answer "how many people were decided under the old one" — a question that is a
one-line query with versions and an archaeology project without them.

**3. Snapshot the decisive inputs, and only those.**
An input is decisive if changing it changes the outcome. Apply the test mechanically:

| Seal | Do not seal |
| --- | --- |
| the score that was compared, at its value then | the whole scoring subsystem's intermediate state |
| the threshold it was compared against | the full configuration object it lived in |
| the flags or gates that routed the decision | every flag the system evaluates |
| the rule/rubric/prompt version in force | the rule's full text, unless short and stable |
| a short, clipped verbatim of any model reasoning that was actually read | the entire model response and full request payload |
| the honest status of any check that was supposed to run | a pass value standing in for a check that could not be read |
| the candidate's stable identifier | the candidate's full profile or source document |

Two sharpenings of the verbatim row, because it is where over-sealing starts. **Clip it**:
a few items, a few hundred characters each — a decision record is an audit artifact, not a
transcript store, and an uncapped field will one day contain a whole document. And **seal
it verbatim or not at all**: a model's stated reasoning is evidence, so it is never
summarized, re-narrated, or translated on the way in. A paraphrase of the model's words is
your claim about the model, which is not what the reader asked for. Where a check that was
supposed to run produced an unreadable or misaligned result, seal that as *unavailable* —
an unreadable check is not a check, and it must never seal as a pass.

The right-hand column is not a cost optimisation. Over-sealing converts an audit store
into an unbounded, hard-to-delete copy of your most sensitive data, colliding with
retention duties and enlarging the blast radius of any breach. The audit record is the one
store you must justify keeping through an erasure request; make it small enough to be
justifiable.

**4. Write it in the same transaction as the state change.**
If the record cannot be sealed, the decision does not commit. An audit write that fails
silently while the decision lands produces unrecorded adverse outcomes under precisely the
conditions — load, incidents, retries, backfills — where you most need the record.

**5. Ask what a value *means*, not just what it is.**
Per [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds), seal
what was actually observed. A missing input is sealed as missing, with its own state — not
as zero, not as a neutral default, not omitted. A record whose absent fields are
indistinguishable from measured ones lies by structure rather than by intent, and it lies
in whichever direction flatters the process.

## Decision rules

- **When a field's meaning depends on a row you do not control, snapshot it.** Anything
  owned by another team, another service, or a user-editable configuration screen is
  drifting by default.
- **When you cannot decide whether an input is decisive, run the counterfactual out loud**
  — "if this had been different, would the outcome have differed?" If the answer is no,
  the field belongs in operational logs, not in the sealed record.
- **When the decision is reversible, the reversal is a new sealed record** with its own
  actor. It never edits, never inherits the original's actor, and never overwrites the
  original's reason.
- **When the actor is an automated process, name *which* one.** "Automated" is a category,
  not an actor; the routable value should identify the specific automated path so a class
  question can be answered about it.

## When not to use this

- **On non-consequential events.** Page views, filter changes, list sorts and draft edits
  do not merit a sealed record; sealing them buries the consequential ones and inflates
  retention. The gate is: does this event change what happens to a person?
- **As a substitute for the operational log.** Sealed records are narrow and durable;
  debugging needs wide and short-lived. Keep both, on different clocks, and never let the
  debugging store become the only place a decision's basis exists — it will be rotated
  away exactly when it is needed.
- **Where the decisive input is itself the sensitive fact.** Some inputs cannot be sealed
  verbatim without creating a record you must not keep. Seal a derived, non-reversible
  form plus the rule version, and state in the record that the raw input was withheld by
  policy — an honest gap beats a silent one.
