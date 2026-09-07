---
domain: software-engineering
subject: build-economics
last_touched: 2026-09-06
touched_by: intake
dry_streak: 0
---

# build-economics

First touch: [[2026-08-31-remeda]], intake of a utility library repository mined
for its agent-facing reference documents. `build-measurement` amended in two
places; no new techniques.

## What the gap actually was

Not an omission and not a wrong claim. `build-measurement` is thorough — three
instruments, a scenario-labelling discipline that insists the predicate travels
with the number, a before/after rule with one-variable-per-comparison, and a
loud-failure clause for the instruments themselves. Its scenario axes ask **which**
build (cold / warm / incremental), **which** variant, **which** machine, and
**when**.

The missing axis is **whose**. Every instrument in the subject is standing inside
the repository being measured, and some of the costs a repository creates are paid
entirely elsewhere: a published artifact imposes compile cost on everything that
consumes it, that cost accretes by exactly the mechanism the subject already
describes, and no instrument named is positioned to see it.

What makes it a real gap rather than a scoping choice is that the cost is invisible
to *every other* signal too. A change that doubles a consumer's compile time is
correct, tested, and green — there is no assertion it violates and no suite that
gets slower. `gate-sees-target` in a place the subject had not looked.

## The measured half

The source supplies the mechanism and a number for why the intuitive approach
fails. Measuring type-level cost from inside the project carries the whole codebase
as baseline overhead: **~115,000 symbols before the measured change is reached**,
against an effect worth low single-digit percent — unresolvable inside that much
noise, and cleanly resolvable through the published artifact. So the harness is a
separate minimal project consuming the build output the way a consumer does, never
the source tree.

Two protocol requirements landed with it, and one folded in from a separate
candidate in the same source: rebuild before measuring and **check that you did**
(the harness reads an artifact, so a stale one silently reports the previous
version's cost) — scoped to the inputs that actually reach the artifact, because a
freshness check that counts test files cries wolf until someone disables it. Plus
warm-up-and-discard.

## The second amendment: gate on the leading indicator

A separate section, because it is a different claim. Among the figures such a
harness reports, the count of intermediate compiler work items moves **first** —
before wall time or memory budge. A metric that only shifts once the cost is
perceptible is a detector, not a gate: it fires after the change has shipped and
after the decision that caused it has been forgotten. Same argument as the
subject's own regression baseline, one level finer.

## Applied: unmeasurable, and the instrument is named

Three real cases from a managed project's Rust workspace under both policies. The
producer/consumer crate boundary exists and policy B has a clear prediction there;
the run's own two arms (1m19s vs 5m33s, same crate, same hour, both labelled
"warm") support the *predicate* half and explicitly do **not** test the vantage
half; and the application binary is a leaf where the rule correctly declines,
which is what a well-bounded rule should do somewhere.

Verdict `unmeasurable` rather than `better`, because the core claim was reasoned
and not run. Instrument named as the vocabulary requires: a minimal crate
depending on the engine, timed after an interface change against a body-only
change — which separates the two costs the single producer-side number currently
fuses. Nothing in the fleet has it, and it is cheap.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 technique, +2 amendments, +1 application.

**`declinable-capability-split`** — a fourth payoff for splitting a publication
unit. `compilation-unit-splitting` named exactly three (parallelism, invalidation
frontier, memory peak), all build-economics. A boundary can also be drawn so a
capability *and everything it drags in* is **absent** rather than merely unused:
the consumer who declines it inherits none of its upgrade obligations, licence
review or vulnerability surface.

**This overrode the subject's own stated resource list** (wall-clock/memory/disk),
and says so — the golden path gained a section titled "A payoff this subject's
three resources do not price". Justified from `capability-feature-gating`'s
existing reach into consumer territory ("the cheapest feature gate is the
dependency you declined"). Inverts when nearly every consumer enables the
capability: the split then buys nothing and costs a combinatorial matrix most of
which is never built.

Amendments: `capability-feature-gating` gains a second motive — buying a
*verification* budget rather than a compile budget, since shrinking an expensive
instrument's target is what makes the lane exist at all;
`compilation-unit-splitting` gains the function-level fix for duplicated
specialisation, cheaper and available before a split is justified.

**Catch:** the run's brief predicted feature-flag combinatorics was a hole. It is
covered twice and better — here at `:43-48` (feature unification, which the source
never names) and `:49-55` ("Ten independent flags is 1,024 configurations"), and
in `gate-laddering`'s cross-configuration section.

## 2026-09-06 — `/intake` openclaude: a gate whose two halves have different owners

Landed one amendment to `capability-feature-gating`: **"When the flag and the code
it gates have different owners"** — and, unusually for this skill, shipped the
instrument it argues for into a connected project on the same day.

**The gap.** Rules 1 and 4 both assume the flag and the capability it admits are
co-owned, so "the flag is on" and "the capability is present" are one statement.
Rule 1 says it outright — *"there is no flag whose absence breaks the default
build"* — and rule 4 designs the runtime gap only for the flag-**off** direction.
The source is an open fork assembled from a partial mirror of an upstream tree,
where which files arrive is not the repository's decision. There the flag is a
*claim* about the source, the bundler's missing-module fallback substitutes a
stub exporting only `default`, and the result builds green, starts green, and
throws at the first named import — their issue #856,
`fetchMcpSkillsForClient is not a function`. Two obligations restore the
identity: assert the flag's source precondition where the flag is set, and mark
substituted placeholders so a post-build step fails on any that reached the
artifact — keyed on a path from the source root, because a basename key lets one
stub mask another (`stubMarkerGuard.ts` says so in its own header).

**Applied to `personas`, mode `experiment`, verdict `better`, proof `ab-paired`.**
The generalisation that made this worth applying: the ownership split does not
have to cross an organisation, it only has to cross a *decision*. `personas` owns
both halves of every gate and is still caught, because two independent selectors
decide what a user can call — cargo features decide which `#[tauri::command]`
functions register, and the frontend's imports and tier decide which names the UI
passes to `invoke`. Nothing asserted a relationship.

`scripts/check-command-registration.mjs` guards the union of the first and says so
in its own comment (duplicate names are cfg-gated variants "and are not a
finding"). Same data, partitioned by the feature set each `tauri.*.conf.json`
actually builds:

| config | features | union guard | feature-partitioned |
| --- | --- | --- | --- |
| `tauri.conf.json` | `desktop-full` | 0 | **4** |
| `tauri.stable.conf.json` | `desktop-full` | 0 | **4** |
| `tauri.lite.conf.json` | `desktop` | 0 | **72** |
| `tauri.android.conf.json` | none | 0 | **97** |

**One of the four is live.** `companion_list_pending_approvals` is registered only
under `#[cfg(feature = "test-automation")]`, which `desktop-full` does not
include, and three shipped chat modules call it inside `silentCatch(...)`. In
every production build the invoke fails with `Command "…" not found`, the
rejection is swallowed by design, and the pending-approvals list is permanently
empty with nothing logged. Nobody was wrong at any single site — the command is
genuinely test-only, the callers are genuinely defensive — and no instrument
joined the two facts. It is recorded in the new gate's baseline rather than
repaired, because the repair is a product decision belonging to the owner.

Shipped: `scripts/check-command-feature-coverage.mjs` + a two-sided baseline + a
20-assertion self-test, wired into `npm run check` (commit `ca1d53ddd`,
unpushed). Verified red on both a rise and a silent drop before being seeded
green. Application document updated in place — `rust--capability-feature-gating`
already covered this tree from rule 4's positive side, so the complement became a
section there rather than a near-duplicate file, and it closes one of that
document's own stated limitations ("nothing mechanical requires a gated entry
point to have a designed gap").

**Two instrument lessons, both from getting it wrong first**, and both now in the
application: bracket-match the handler list over *masked* source (a naive matcher
over-counted 1,634 against the true 1,627, because `lib.rs` carries an unbalanced
`[` inside a comment within the list), and read the feature name back out of the
*raw* text at the same offset, since masking blanks string literals and the
feature name is one.

Still open from 2026-09-03: nothing here touches the switch-cost inequality,
which remains asserted rather than computed.
