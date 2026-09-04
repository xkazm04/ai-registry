---
source: github:workweave/router (redirects to weave-os/router)
kind: repository
class: vendor repository
url: https://github.com/workweave/router
title: "Model router for agentic systems"
author: weave-os
commit: 1699cf603e0bfd7cd87c027d7e6407155b20b53e
words: 1834 landing / 72225 in-tree markdown (~39:1)
extracted: 12 (8 design + 4 claim)
accepted: 4
declined: 0
untriaged: 6
already_covered: 3
leads: 2
applied: 3
shipped: 1
dispatched: 1 (peer study, personas — 48 points, 4 seeds corrected)
run_id: workweave-router-0904
siblings: 2 at claim (vibevoice-peer-0904 @ 7.7, sozu-rust @ 0); 3 by Phase 7 (pi-01 joined)
rescan_when: >
  the `translation.compatibility` rollout leaves `shadow` and `enforce` becomes the
  documented default (TRANSLATION_COMPATIBILITY.md names shadow as the first-rollout
  posture, so the flip is the evidence the requirement set survived contact); or the
  silent-drop mapping contract of `DeployedModelsForRosterIDs` is removed, which is
  the last item on HMM_GO_SELECTION.md's own "Still to remove" list; or a second CLI
  provider re-enters `EngineKind`-equivalent territory upstream (a `policy_router_v4`
  or a second in-process `Router` impl), which would give the exclusive-authority
  technique a multi-candidate instance instead of a degenerate one; or 8 weeks elapse
  (2026-10-30)
---

# weave-os/router — a second, independent multi-provider gateway

## Why this source, and what it was priced at

Round 23's focus item (1) asks the run to price the source before ingesting.
Stated before extraction:

> **Class:** vendor repository. 1,834 landing words against 72,225 words of
> in-tree markdown — a ~39:1 ratio, with a 6,262-word configuration reference, an
> out-of-process policy contract, a semantics document, a translation-compatibility
> document and sixteen per-package module guides. **Forecast: 2–5 landings weighted
> toward design**, most of them homing into `multi-provider-gateway-plane`, which was
> forged from a *different* gateway 48 hours earlier and is single-sourced. Plus a
> peer study, which discharges the debt round 23 item (3) names.
>
> **Does it justify the run?** Yes, and for a reason specific to this week: the
> corpus's gateway subject is two days old and built from one system. A second,
> independently designed gateway is the cheapest corroboration that subject will
> ever get, and the only way to find out which of its nine techniques describe
> *gateways* and which describe *that one gateway*.

**Actual: 4 landings** — 2 techniques, 1 amendment, and one golden-path
correction found while reading the boundary (the gateway subject stated its
discriminator with `model-routing` inverted, routing every reader to the wrong
subject). 3 applied rows, 1 shipped.
`priced=2-5 weighted to design / 4 weighted to design` — inside the band.

The prediction that mattered was the *routing* one, and it held: eight of the
twelve candidates homed into subjects that already exist, so the count did not
fire a forge. See the routing count below.

## Sweep

Cloned at `1699cf6`, 1,633 files. Swept in the method's order — operating
documents, instrument, measurement, types/config, tests, README last:

- `docs/` — `CONFIGURATION.md` (6,262 w), `POLICY_ROUTER_HARNESS.md`,
  `HMM_GO_SELECTION.md`, `SEMANTICS.md`, `TRANSLATION_COMPATIBILITY.md`,
  `SMOKE.md`, `ANALYTICS_EXPORT.md`
- module guides: root `CLAUDE.md` (3,450 w) plus 16 per-package guides, each
  mirrored to a generated `AGENTS.md` with **CI rejecting drift**
- the instrument layer: `validate-roster` CLI, `TestGlobalLoggerBudget`,
  `TestNoReservedLogKeyShadowing`, `make generate-agent-guides`
- the measurement: `POLICY_ROUTER_HARNESS.md`'s release gates, `smoke/` (record/
  replay MITM against real providers, path-gated in CI)
- types/config: `internal/router/catalog`, the `policy_router_v1`/`v3` wire schemas

The README was read last and contributed nothing but proper nouns to strip. Its
own headline claim — "<50ms", "40–70% cost cut" — is unverifiable from the tree
and was not extracted.

## Design record

Eight decisions with forces. Product names are kept here by the v2 rule; they
are stripped where these became techniques.

**D1 — the routing grain is one upstream API request.**
*forces:* an agent turn contains many upstream calls with different
characteristics (main loop vs tool result); "turn" already meant three things in
the codebase. *buys:* the finest unit at which a model choice can differ, plus a
notation that addresses a subagent's Nth call. *rejects:* per-turn and
per-session routing (session state may inform the decision, not be its grain).
*where:* `docs/SEMANTICS.md`. *stage:* ingress. *corpus:* `model-routing` — near,
partial; the subject decides which tier serves a call and never fixes the unit.

**D2 — a vocabulary migration is dated, and its legacy usages are enumerated.**
*forces:* renaming code is expensive; docs and telemetry drift silently.
*buys:* a reader of old code knows it is old. *rejects:* a big-bang rename, and
silent coexistence. *where:* `docs/SEMANTICS.md` § Legacy naming, which names
`internal/router/turntype` as mis-named and says so in the file that defines the
right word. *corpus:* `prompt-assembly/house-vocabulary-layer` — **catch**.

**D3 — narrow a probabilistic component's authority to the inference only.**
*forces:* a measured incident — the roster↔catalog binding dropped unknown IDs
silently; one inert arm sent **19.8% of balanced-cluster turns to maximum-tier
arms, $821 of $1,022 of that cluster's spend**. *buys:* the failure class is
removed rather than monitored — the roster is declarative data validated
fail-loud at boot, and an invalid arm panics the process. *rejects:* the ML
sidecar selecting the arm. *where:* `docs/HMM_GO_SELECTION.md`;
`internal/router/hmm/{mapping,roster,validate}.go`. *stage:* policy → selection.
*corpus:* **NONE**; nearest is `optional-dependency-degradation/absent-degrades-malformed-fails-fast`,
which models the config axis and not the "put the deterministic half where it can
fail loud" axis. Untriaged (see below) — it is a real gap and this run could not
afford a fourth landing honestly.

**D4 — no automatic per-request fallback to a second policy.**
*forces:* a fallback restores availability by silently substituting the product,
and it absorbs exactly the requests that would prove the primary is broken; the
previous heuristic-vs-cluster design was retired because "silent-fallback
behavior masked cluster regressions". *buys:* countable failures (503s) and a
comparison that stays valid. *rejects:* the automatic per-request fallback and
the runtime A/B switch — while *keeping* an operator-level rollback lever.
*where:* `docs/POLICY_ROUTER_HARNESS.md` § Ownership boundary + Release gates;
root `CLAUDE.md` § "What to NOT do"; `internal/router/CLAUDE.md` rule 6.
*corpus:* **NONE** for the force. → landed, see below.

**D5 — authority over a decision is the suspension of every other writer.**
*forces:* six mechanisms can change the served model after selection (session
reuse, EV planner override, model-changing baseline failover, semantic cache
hits, router-generated summarizer calls, post-selection loop breakers); if any
fires, the recorded outcome belongs to a model the policy did not choose.
*buys:* "one accepted policy action maps to one selected model dispatch attempt",
and therefore attributable outcomes. *rejects:* authority as a flag on the
selection step. *where:* `docs/POLICY_ROUTER_HARNESS.md`
§ `authoritative_per_turn_selection`; `selected_served_model_match` on `/outcome`;
"an authoritative model mismatch is marked ineligible for training and logged as
an error". *corpus:* **NONE**. → landed with D4 (same root; see the landing note).

**D6 — hoist only the leading system run; demote the rest in place.**
*forces:* the destination 400s on system-role messages inside the message list,
so *something* must move; hoisting all of them is semantically faithful and moves
a per-turn system reminder to the front of the prompt, shifting the cached prefix
every turn. Measured on production agent traffic: **~890k cache-creation tokens
per turn against a flat 17.5k of reads.** *buys:* prefix stability under a
conformance rewrite performed by a party that does not own the transcript.
*rejects:* the faithful global hoist. *where:* `internal/translate/CLAUDE.md`
§ "Prefix-stable system handling (load-bearing)". *corpus:* `prompt-assembly/layered-composition`
owns the stability gradient **for the composer** and asserts one enumerable
assembler door. Partial → promoted (see the promoting question) → amendment.

**D7 — an opaque token echoed through a client gets exactly one typed carrier.**
*forces:* the plane keeps no transcript, so the client's next request is the
record; a raw off-spec field is dropped by typed SDKs (not a carrier) *and*
echoed by some clients (a liability) — a client that echoes it makes the next
turn 400 against a validator that rejects unknown fields. *buys:* cross-turn
reasoning replay survives a client round trip with no added rejection surface.
*rejects:* belt-and-suspenders dual carriers — **in the same file that mandates
belt-and-suspenders for stripping**. *where:* `internal/translate/CLAUDE.md`
§ Gemini 3.x `thoughtSignature`; `thought_signature_id.go`;
`clampOpenAIToolCallID`. *corpus:* `prompt-assembly/endpoint-sealed-continuation-metadata`
owns strip-vs-keep for a composer that owns a record; carrier selection is
**NONE**, and its "strip at materialization; never in the record" rule presumes a
record this topology does not have. → landed.

**D8 — bypass the intermediate representation when source format equals target
family; derive semantic requirements at ingress as hard candidate filters.**
*forces:* the IR cannot represent extension points it does not model — custom,
namespace, built-in and *unknown* unions are reduced to function tools by a
round trip; and a requirement that must survive the wire path is a
representability constraint, not a quality signal a scorer may trade away.
*buys:* unknown extensions survive, and a model the path cannot carry is never a
candidate regardless of score. *rejects:* uniform IR round-tripping; capability
as a scoring weight. *where:* `docs/TRANSLATION_COMPATIBILITY.md`.
*corpus:* `caller-scoped-normalization-strictness` owns the **response** strictness
switch per caller; `model-routing/capability-floors` owns a **quality** floor.
Neither models a request-path representability filter. Untriaged — see below.

### Routing count (Phase 2d)

Grouped by system, counting `corpus: NONE`:

| System | Decisions | NONE | Home if new |
|---|---|---|---|
| routing / policy plane | D1, D3, D4, D5 | **3** (D3, D4, D5) | `multi-provider-gateway-plane` — **exists** |
| translation layer | D6, D7, D8 | 1 clear (D7), 2 partial | `multi-provider-gateway-plane` / `prompt-assembly` — **exist** |
| vocabulary | D2 | 0 | — |

Whole tree: **8 decisions across 3 systems, 4 unhomed.** The largest system
reaches three — but its home **already exists**, so by the v2.2 clause that is a
technique triple inside `multi-provider-gateway-plane`, not a forge. The
HOME-IF-NEW clause does not fire either, for the same reason: nothing is
*new*-homed. **No forge handoff, and that is the interesting result** — 48 hours
ago this tree would have been a forge job, and the Portkey run built the home
that absorbed it.

## Triage (v2.5 scored)

Expected yield stated before the table: 2–5 landings weighted toward design.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Nothing may answer for, or override, a measured decision (D4+D5) | mp-gateway-plane/router-versus-candidate-failure | new-technique | real gap | 3/1/2 | **accept** |
| 2 | K | technique | M | One typed carrier for state echoed through a client (D7) | prompt-assembly/endpoint-sealed-continuation-metadata | new-technique | real gap | 2/0/2 | **accept** |
| 3 | K | amendment | M | A conformance rewrite by the last hop breaks the gradient (D6) | prompt-assembly/layered-composition | corrects-claim | real gap | 2/0/2 | **accept** |
| 4 | K | technique | M | Wire-path representability filters candidates (D8) | model-routing/capability-floors | new-technique | real gap | 2/0/2 | untriaged — budget |
| 5 | K | technique | M | The deterministic half of an ML decision fails loud at boot (D3) | optional-dependency-degradation | new-technique | real gap | 2/0/2 | untriaged — budget |
| 6 | K | technique | M | Correlation tags fail toward hiding what you hunt (D10) | telemetry-pii-redaction/correlation-preserving-redaction | new-technique | partial | 2/1/2 | untriaged |
| 7 | K | technique | S | The routing grain is one upstream request (D1) | model-routing | new-technique | partial | 1/1/1 | untriaged |
| 8 | T | practice | S | A generated agent guide with CI drift rejection (D12) | agent-instruction-files | none | partial | 1/2/1 | untriaged — **contended**, a sibling holds that subject note |
| 9 | K | — | — | Dated vocabulary migration with legacy usages enumerated (D2) | prompt-assembly/house-vocabulary-layer | none | likely catch | — | already covered |
| 10 | K | — | — | Managed mode does not mount the admin surface at all (D11) | browser-credential-boundary, brokered-egress | none | likely catch | — | already covered |
| 11 | K | — | — | Public repo forbids customer names even when a customer motivated the change | this registry's own purity rule | none | likely catch | — | already covered (**convergence**, see below) |
| 12 | K | lead | S | `--fallback-model` exists upstream and this router declines it | — | none | thin | — | lead |

**Rows 4 and 5 are real gaps recorded untriaged for budget, not for doubt.**
Both carry their anchors above. Row 5 in particular carries a measured incident
(19.8% / $821 of $1,022) and should be the first thing a later run picks up.

### Promoting questions executed

- **Row 3 (partial → real gap).** *Question:* does `layered-composition`'s
  stability gradient survive a writer the assembler cannot enumerate? *Read:*
  `layered-composition.md:48–104`. *Answer:* no. The gradient is stated over the
  composed bytes and the door is stated as enumerable — "all prompt text for a
  family passes through one assembler, and the writers are enumerable — they are
  the assembler's callers". A proxy that rewrites for the destination's
  conformance rules is a writer that is not a caller, in another process, owned
  by another party. Promoted.
- **Row 4 (likely catch → real gap).** *Question:* does `capability-floors` model
  a constraint that comes from the *path* rather than the *model*? *Read:*
  `capability-floors.md:1–50`. *Answer:* no — a floor is "set by observed
  breakage" of a capability below a tier, a quality measurement about the model.
  A wire-path requirement is about representability: a fully capable model is
  ineligible because the only translation to it drops the request's semantics.
  Promoted, then held for budget.

## Landings

**1. `multi-provider-gateway-plane/exclusive-authorship-of-a-measured-decision`**
(new technique). D4 and D5 merged, because they are the two directions of one
root — *a decision you intend to measure must be the only thing that determined
the outcome you record.* Nothing may answer in its place (so a per-request
fallback and an evaluation of the thing it protects cannot coexist; availability
comes from replication, readiness, pinned artifacts, staged rollout and an
**operator-level** lever, which is a substitution too and is fine because it is
one decision by a person on the record). Nothing may override it afterwards (so
granting authority is the enumerated suspension of every other writer). And
something must check that neither happened (record decided beside served; on
mismatch **drop the sample rather than correct the record**, because a corrected
row still attributes an outcome to a selector that did not produce it).

Kept them as one technique rather than two deliberately: two files sharing one
force is how a corpus pads.

**2. `multi-provider-gateway-plane/one-typed-carrier-for-echoed-state`**
(new technique). D7. The carrier is chosen by which field a stock SDK is
*obliged* to round-trip, not by where the state belongs semantically; the
carrier's own constraints become the state's; exactly one carrier, because a
second is a second rejection surface rather than redundancy. The discriminator
the source states twice in opposite directions is the reusable part:
**defensive redundancy is safe subtractively and unsafe additively.** Stripping
twice is idempotent; carrying twice hands a client an extra thing to echo into a
validator that refuses unknown keys.

Also absorbed the source's correction to the obvious guard: strip on
*provenance*, never on a "did we switch?" flag, because a client-side compaction
re-keys the session and destroys the previous-served-endpoint fact — and it does
so **correlated with the switch**, since both are triggered by a long
conversation. The guard is most likely to be missing on exactly the turn it
exists for.

**3. `prompt-assembly/layered-composition` — amendment**, "The last writer is not
always yours". D6, with the measured 890k/17.5k. The claim it corrects is a
sufficiency claim the subject makes twice: that byte-determinism per message
gives a stable prefix. It does not, when the last hop reorders for conformance.
The correction is that a required rewrite must be made **position-preserving**
rather than merely meaning-preserving.

## Already covered — three catches worth recording

- **D2** is `house-vocabulary-layer`. The source's version is a good instance
  (dated, with the legacy usages enumerated inside the document that defines the
  right word) but adds no mechanism.
- **D11** — managed mode does not mount the admin surface *at all* rather than
  auth-gating it, and an unknown deployment mode panics at boot. Between
  `browser-credential-boundary` and the Portkey run's `brokered-egress` this is
  covered; removal-over-protection is already the corpus's posture.
- **The convergence worth naming:** the source's root guide forbids customer or
  org names anywhere committed to its public repo, *even when the change was
  motivated by one customer's incident* — "describe the trigger generically". That
  is this registry's own purity rule, independently derived, by a team with the
  same problem (a public artifact whose changes are driven by private evidence).
  Corroboration for a boundary we drew, from outside.

## Leads

- **The router declines an upstream capability it could have taken.** The wrapped
  CLI ecosystem ships a `--fallback-model` session-switch; this router records it
  as "informational" and keeps its own failover. Two independent systems choosing
  to own substitution rather than delegate it is one sighting short of a rule
  about *where* a substitution decision belongs when both layers can make it.
  *Return condition:* a third system in the corpus is found to have moved
  substitution across that layer boundary in either direction.
- **`docs/ANALYTICS_EXPORT.md` was swept but not mined.** A read-only
  routing-decision export with a keyset cursor and a schema-plus-price-book pair
  — a shape that likely converges with `llm-observability`'s accounting subjects,
  and this run had no budget to check whether the price book's versioning solves
  the problem that domain's `refuse-to-derive` describes. *Return condition:* a
  run mining an analytics export or a priced event stream.

## Board

2 siblings live at claim (`vibevoice-peer-0904` at 7.7 holding voice-io and
serving-process-topology; `sozu-rust` at 0 holding nothing yet), 3 by Phase 7
(`pi-01` joined holding agent-runtime-assembly, session-continuation,
job-coordination, delivery-guarantees). `sozu-rust` is an HTTP reverse proxy and
reached Phase 7 with **no declared subjects**, which is the one collision this
run could not see coming — `backend-platform/resilience` is plausible ground for
it. `check` returned clear on both files this run edited; the golden-path
`techniques:` edit was made under the `content` lock anyway.

Fetch budget: **0 of 3.** Everything corroborated from the tree, from the corpus,
or from a connected project's live data.

## Phase 7.6 — the peer study, and the correction it forced

Dispatched against **personas**, the fleet's one universal-wrapper peer (its
`scope.does` names running personas over *wrapped CLIs* and tuning routing from
evidence). `.ai/directions/2026-09-04-weave-router-comparison.md`, committed in
that project as `dc08122bd`. **48 points across 11 areas: 14 `adopt`, 15 `adapt`,
15 `keep ours`, 4 `different forces`.** Round 23's owed peer study is discharged.

The `adopt` column concentrates almost entirely on *what the project records after
it decides* — the one axis where a request-path router and a CLI wrapper face the
same problem — which is a useful result on its own: the peer's routing *mechanics*
transfer badly (different forces, correctly) and its *record discipline* transfers
almost wholesale.

**The study corrected four of the thirteen seeds, and one correction lands on this
run's own shipped change.** That is the study earning its cost, and it is recorded
here rather than smoothed over.

- **Seed 2 was inverted, and I verified the correction myself.** I seeded the
  model ladder as personas' fail-soft answer to the router's 503. It is not: the
  spawn loop breaks on `CliProcessDriver::spawn` **succeeding**
  (`runner/mod.rs:1899-1903`), so the chain advances only on a process-launch
  failure — which a different model cannot fix, since it is the same binary. Every
  fault a model swap could survive (rate limit, context overflow, refusal) happens
  *after* a successful spawn and never reaches the ladder. The project's own docs
  already say the ladder is reachable only when changing the model cannot help.
  **So `was_failover = 0` on 6,163 rows is consistent with the ladder never firing,
  not with substitutions going unrecorded**, and this run's apply verdict was moved
  from `better` to `unmeasurable` with the instrument named.

  The correction produces the better finding. A constant-`false` flag cannot
  distinguish *"the substitution mechanism never fires"* from *"it fires and we do
  not record it"* — and those two states call for opposite responses, deleting the
  ladder or fixing the record. **The audit that would have shown the fallback was
  inert was itself inert.** That is a sharper instance of the landed technique than
  the one the run started with.

- **Seed 4 undercounted.** I seeded the router's six suspended writers against an
  assumed comparable set; personas has **twelve** mechanisms that can change model,
  prompt, persona or session after the decision, and four partial lists each
  covering a different subset. The technique's "enumerated rather than assumed"
  rule is confirmed harder than the source stated it.
- **Seed 6 was half wrong in each direction.** personas *does* carry a
  prefix-stability instrument — but only in the companion, measuring a reorder that
  was never built; and the cache columns *are* read, by exactly one stat tile and
  nothing else. Neither absence nor presence, which is why the seed had to be
  checked rather than assumed.
- **Seed 11 was already answered** by a golden path the project had written, so the
  verdict moved from `adapt` to `keep ours`.
- **Seed 9 confirmed and sharpened, and I re-verified it.** personas is ahead of
  the source on model-identity discipline (one door, a census rule ratcheting bare
  literals down) — and the door has **zero importers anywhere in the desktop
  crate**, with 156 bare `"claude-…"` literals still live across 70 files including
  `failover.rs`, the file the door's own docstring names as the casualty that
  motivated it. A single-source-of-truth nobody imports is the shape worth
  remembering.

## Lead added by the study

- **A fallback that is unreachable for its own faults.** personas' ladder advances
  only on spawn failure and ladders across *models*, which are irrelevant to spawn
  failure. Neither the corpus's `fallback-retirement-condition` (a fallback for a
  closing capability gap) nor this run's new technique (a fallback that hides a
  measurement) covers a fallback whose trigger condition and whose remedy are
  about different things. *Return condition:* a second sighting of a fallback whose
  advance condition cannot be affected by what the advance changes.
