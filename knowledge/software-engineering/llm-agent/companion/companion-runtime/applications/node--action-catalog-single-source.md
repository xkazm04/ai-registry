---
layer: application
type: application
subject: companion-runtime
technique: action-catalog-single-source
stack: node
status: forged
verified_on: 2026-08-24
---

# One array, across a process and a language (kp / Candi)

This companion's model call is a spawned Python CLI and its actions are
TypeScript functions in a Next.js 16 app, so the three consumers that must agree —
the prompt that teaches, the validator that reads the model back, the executor
that runs an accepted proposal — do not share a process, a language, or a
release. The catalog is nevertheless one array. Its header states the
arrangement in the technique's own terms
(`app/_lib/companion-actions.ts:1-24`):

> THE ACTION CATALOG — one array, three derivations. … All three DERIVE from
> `COMPANION_ACTIONS`. The Python half never hardcodes the list:
> `companionActionWire()` serializes the catalog into `turn.json`, so the prompt
> addendum and the fence validator are both built from what was shipped across
> the boundary that turn.

## Confirmed: the catalog crosses as data, and the far side names nothing

`COMPANION_ACTIONS` (`companion-actions.ts:138`) carries four specs, each with an
id, a one-line `doc` shipped verbatim to the model, a declared `params` array
whose `doc` fields are written as instructions rather than types, a pure
`summary`, and an `execute`. `companionActionWire()` (`:262`) projects the
teachable subset — id, description, params — and the turn writer serializes it
into the file the CLI reads: `JSON.stringify({ ...turn, actions:
companionActionWire() })` (`app/_lib/companion-run.ts:256`).

On the far side, neither Python file contains an action name.
`_action_contract()` (`pipeline/jobfit/companion_cli.py:192-236`) renders the
teaching block by iterating the shipped list, and its docstring says why: "No
action name is written in this file … so the prompt cannot teach an action the
parser rejects, or miss one it would accept." The fence validator does the same
from the other direction — `_catalog_by_id()`
(`pipeline/jobfit/companion_blocks.py:258-268`) keys the shipped array, and
`_action()` (`:223-254`) resolves the emitted id against it and checks each
declared parameter's presence, refusing an id the shipped catalog does not carry.

Both halves fail closed on an absent catalog, and both say so where the default
is chosen. `_catalog_by_id` returns an empty map, "which makes every action fence
invalid — the right default for a caller that did not ask for an actor" (`:261`);
`_action_contract` returns an empty string, so "a caller that ships no catalog
gets NO addendum, and the model is never taught to propose" (`companion_cli.py:198`).
A turn that ships nothing therefore teaches nothing and accepts nothing, without
a flag.

## Confirmed: the set-equality pin, including the non-vacuity line

`app/_lib/companion-actions.test.ts` pins the derivation rather than the
membership, and its header states the distinction the technique asks for
(`:11-14`): "It is deliberately a SET-EQUALITY test rather than a 'does the
catalog contain run_analysis' test. Pinning the members would pass while a fourth
action was added to the executor and never taught."

Four assertions close the loop: the wire ids equal the catalog ids (`:33`), each
wire spec's params equal the declared params by name and requiredness (`:44`),
`companionAction()` — the same lookup the resolve route uses — resolves every
catalog id to a spec with a real `execute` and resolves nothing else (`:60-72`),
and the coercer accepts exactly the catalog's ids (`:74-83`). The non-vacuity
line is present and carries the reason (`:39-41`): "an empty catalog would make
every set-equality below trivially true, which is how this family of guard reads
green while checking nothing."

What this pin cannot reach is the Python half: it asserts that the wire form
matches the catalog, not that the two Python files read the wire form and hold no
list of their own. That property is currently maintained by the docstrings quoted
above and by the absence of any literal, not by an assertion — the one seam here
where the language boundary still costs something.

## Confirmed: the catalog is the validator, consulted again at acceptance

`POST /api/companion/proposals/[id]/resolve` re-derives everything from the
catalog at click time rather than trusting the row
(`app/api/companion/proposals/[id]/resolve/route.ts:16-25`):

> THIS IS THE ONE DOOR … this handler re-validates from scratch: the proposal is
> still open, its stored payload still parses, its action still exists in the
> catalog, its parameters still satisfy the catalog's declared shape … a
> proposal-time check is a claim and an execution-time check is the guarantee.

The re-check is `coerceCompanionAction({ id: payload.actionId, params:
payload.params })` — the *same* function that validated the CLI's stdout, run
again on the stored parameters. Both the retirement paths are present and both
resolve rather than error: a payload that no longer parses or an action this
build no longer carries is declined on the operator's behalf and stamped
`retired`, "rather than leaving an Accept button that can never succeed"; a
payload that no longer satisfies its declared shape takes the same path.

Parameter resolution against the store also happens at execution, not at
proposal: `resolveEntryByLabel` (`companion-actions.ts:113-130`) looks the
model-supplied label up in this tenant's own board and refuses on zero matches
and on two, "rather than guessing which human the operator meant".

## Confirmed, and belonging to the neighbour: claim, run, stamp

Acceptance is three steps, and the reasoning is recorded at the repo function
(`app/_lib/db/companion.ts:464-473`): "doing the write first and the work second
means a failed accept leaves a proposal marked accepted that nothing ever did;
doing the work first and the write second means a double-click runs it twice."
So `claimProposal` (`:476`) is a conditional `UPDATE … WHERE status = 'open'`
only one caller can win, `stampProposalOutcome` (`:489`) merges the outcome and
sets `resolved_at` guarded on `resolved_at IS NULL`, and `releaseProposal`
(`:516`) can only undo a claim that never completed. A losing double-click reads
the same 409 a second tab does.

This is a clean realization of `hitl-approval`'s
[gate-state-machines](../../../orchestration/hitl-approval/techniques/gate-state-machines.md)
and
[resume-after-decision](../../../orchestration/hitl-approval/techniques/resume-after-decision.md)
rather than of this technique, and it is cited here because it is the half that
makes the catalog's second consultation reachable: the re-validation runs before
the claim, so a proposal that has outlived its catalog is retired without ever
consuming the one traversal the claim authorizes.

## Deviation: the executor's exhaustiveness is a test, not a type

`companionAction()` returns `null` for an unknown id and the test asserts every
catalog id resolves — which is the property, checked at the right place. But the
binding is a `Map` built at module load (`companion-actions.ts:240`) rather than
an exhaustive match, so a kind added to the array without an `execute` is a
compile error only because `execute` is required by `CompanionActionSpec`. The
arrangement holds here because catalog and executors live in the same literal;
it would stop holding the moment the executors move to their own modules, and the
test is what would still catch it.

## Deviation: nothing has run in a browser

The product's own doc records it (`docs/features/companion/README.md:698-701`): the dock,
the proposal card and the resolve route "have been type-checked, linted and
unit-tested, but no browser has painted a proposal card and no accept has
dispatched a real task". The single-source property is asserted mechanically and
is believable; the end-to-end claim is not yet evidence.
