---
source: github:AmanVarshney01/create-better-t-stack
kind: repository - first-party practitioner account in repository form (a single-maintainer scaffolding CLI whose operating documents, ADR, domain glossary, openspec change and upstream-defect ledger are first-party accounts of a stack-combination product; the README is its ad)
url: https://github.com/AmanVarshney01/create-better-t-stack
title: "create-better-t-stack - a CLI for scaffolding end-to-end type-safe TypeScript projects"
author: AmanVarshney01
commit: 1c534b274e48b0a0d9670c11d0e939daf8eabd71
words: 669 landing / 32,182 in-tree markdown excluding templates (5,207 openspec design + 4,312 spec + 3,848 upstream-defect findings log + 737 CONTEXT.md + 322 ADR) - plus 17,568 lines of CLI source and 18,732 lines of tests, which is where the instrument lives
extracted: 15
accepted: 2
declined: 0
leads: 2
already_covered: 2
untriaged: 7
dispatched: 0
applied: 2
shipped: 0
run_id: intake-cbts-0902
siblings: 2
rescan_when: "the repo lands a typed rejection-rule enum shared by validator and oracle (untriaged #1/#14 becomes a clean amendment); or a fleet project runs live-provider tests and needs the ownership-marker rules (lead #11); or a second first-party project ships a glossary with avoid-terms and an agent consumption rule (lead #8)"
---

# create-better-t-stack (first-party practitioner account, repository form)

**Class read at Phase 2:** first-party practitioner account in repository form. The
landing page is 669 words of feature list; the tree carries an ADR, a domain glossary
with flagged ambiguities, a 5,000-word openspec design, and a 3,800-word log of
upstream-defect findings with a disproved-claims section. Expected yield for the class:
1-3 landings from the operating documents and the instrument, none from the README.
**Declared focus applied:** the changelog-fragment sweep does not apply - the repo
generates its changelog from conventional commits and carries no fragments. The
substitute was the class's own advice: operating documents first. The two landings
came from `docs/alchemy-v2-beta-findings.md` and from `compatibility-rules.ts` +
`config-validation.ts` (the instrument), in that order. The README contributed proper
nouns to strip and nothing else.

**Lead check (declared focus, Phase 1):** the last ten source notes' return conditions
were read. None fired by its own terms. One lead advanced anyway - the firstmate note's
"a defect record that states what would have refuted its own conclusion" (return: a
debugging subject is forged, or a project adopts a postmortem template) got its second
sighting from this source's findings log, and landed as convergence inside amendment A.
That is the scorecard's "advanced because a source happened to land on it" case, not
"because its condition was read". Recorded as such.

**Board at claim:** 2 live siblings (`intake-sentry-selfhosted` on health-checks /
packaging / test-harness / supply-chain; `intake-sherpa-onnx-0902` on voice-io). Neither
held either home this run landed in. The sentry sibling held `test-harness` and
`supply-chain`, which is one reason the tiered-matrix and prerelease-pin candidates were
routed as a catch and a fold respectively rather than as amendments there.

**Fetch budget:** 0 of 3. Both landings corroborated corpus-internally and from training
data (semver prerelease ordering and caret semantics; the evidence-tier ladder is the
source's own, and it is the half a source can authorize - what it did and measured).

## What was swept

In yield order: `docs/adr/0001` (tiered matrix testing), `CONTEXT.md` (glossary with
_Avoid_ terms, relationships, flagged ambiguities), `docs/alchemy-v2-beta-findings.md`
(13 confirmed rows with removal conditions, a limitations section, a disproved-claims
section, an upgrade checklist), `openspec/config.yaml` + `design.md` (evidence levels,
live-test ownership rules), then the instrument: `apps/cli/src/utils/compatibility-rules.ts`
(717 lines), `config-validation.ts` (646), `test/matrix/oracle.ts` + `cases.ts` +
`create-matrix.test.ts`, `src/mcp.ts` (394), `AGENTS.md`, the plugin's agent and skill
files, and the README last. Full-matrix bound computed from `cases.ts`: 52,254,720
normalized cases, which is why the full run refuses to start unsharded.

## Candidates

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | M | Oracle predicts the rejecting RULE, not the verdict; three mismatch kinds | test-input-generation/model-based-oracle | new-technique? | partial | untriaged |
| 2 | K | technique | M | Three testing tiers; full matrix refuses unsharded runs | test-harness/suite-partitioning, exhaustive-when-bounded | none | likely catch | **already covered** (both read: "keeping both" lanes + tier table) |
| 3 | K | amendment | M | A conflict is reported only against explicitly provided values | settings/inherited-default-override | new-technique | real gap | **accepted -> amendment B** |
| 4 | K | amendment | S | Normalize unordered selections before enumerating; input shape is a separate test | test-input-generation/exhaustive-when-bounded | none | likely catch | **already covered** ("the real limits rather than the type's limits") |
| 5 | K | amendment | M | Defect ledger: evidence tiers, removal condition per row, disproved claims | optional-dependency-degradation/fallback-retirement-condition | new-technique | real gap | **accepted -> amendment A** (convergence with firstmate lead) |
| 6 | K | amendment | S | Exact pin as permanent policy: a `-test` prerelease outranks `-beta.N` under caret | release-pipeline/version-single-truth (publisher side only) | corrects-claim | real gap | folded into A |
| 7 | K | amendment | S | Typechecking does not prove startup: declaration files accept a broad peer range | _laws#gate-sees-target | none | likely catch | untriaged |
| 8 | P | practice | M | Glossary with _Avoid_ synonyms + flagged ambiguities + "term not in glossary is a signal" | agent-instruction-files (nearest) | none | partial (relay of a skills pack) | lead |
| 9 | K | amendment | S | Agent-facing surface: no defaults, full explicit payload, plan before create | mcp-tools/tool-schema-design | none | partial | explicit-payload half folded into B; plan-before-create half untriaged |
| 10 | K | technique | M | In-memory generation as the test substrate; curated build set proves compile | test-harness/fixture-economics? | none | likely catch | untriaged |
| 11 | K | technique | L | Live-test ownership: unique stage + marker before creating, marker-matched reconciliation, never delete unowned | test-harness/isolation-lanes; _laws#creation-names-reaper | fills-stack-gap | partial | lead |
| 12 | K | amendment | S | An unprovable include-list: disable the cache rather than carry the list | build-economics/cache-budgeting | none | partial | folded into A (last paragraph) |
| 13 | K | - | S | Control characters rejected in agent-supplied paths | - | none | thin | untriaged |
| 14 | K | boundary | S | Rule identity recovered by message substring couples the oracle to prose | with #1 | none | partial | untriaged (with #1) |
| 15 | K | amendment | S | Provider compatibility must fail during configuration, not after generation | _laws#one-validation-door | none | likely catch | untriaged |

**Unattended rule applied:** only `real gap` rows advanced (#3, #5, with #6 and #12
folded). `partial` and `likely catch` rows are recorded below with anchors, unverified.

## Landed

### Amendment A - `fallback-retirement-condition`: "When the gap is in something you pin: the release is the reaper"

The technique's "Where this does not reach" section handed every workaround that cannot
test its own premise to the dated-audit lane. The source shows a third kind: a defect in
a **pinned upstream** (a prerelease infrastructure library), where the dated stamp fails
in a specific direction - the upstream merges the fix long before it publishes an
artifact containing it. The amendment states four evidence tiers (released source,
provider-free reproduction, live reproduction, and "upstream main is not evidence"),
makes the reaper three things at once (published artifact + pin moved to exactly it +
minted case rerun), and adds three consequences the source paid for:

- the accepted version can itself regress (the source's beta.66 D1 row; the fleet's
  CLI-floor ledger says the same twice in its own comments), so every row re-runs on a
  pin move with its evidence tier labelled;
- a **disproved-claims ledger** (five in the source, each with the reproduction that
  refuted it) - the second sighting of the firstmate lead's "defect record that states
  its own falsifier", now written as convergence;
- **policy vs workaround** labelling, with the prerelease-ordering hazard as the case
  (#6): a caret over a prerelease admits any same-tuple prerelease, ordered lexically.

Corrected premise worth recording for the class: the source's *own* ledger is the
strongest artifact in the repo and the README does not mention it exists.

### Amendment B - `inherited-default-override`: "The third column: a default derived from sibling keys" + "Provenance travels with the value"

The technique's table had two default sources (constant, environment). The instrument
shows the third and commonest: a sibling key. `compatibility-rules.ts` threads a
`providedFlags` set beside the config through every rule, and a rule fires only when the
keys it names were explicitly provided; `config-validation.ts` carries `canResolve...`
functions that re-derive the defaulted side instead of erroring. The amendment adds the
third column, the provenance rule ("a rule fires only when every key it names was
decided; a derived operand means re-derive, silently"), the one exception (nothing can
be derived for a secret), and the machine-caller boundary from `mcp.ts` (#9): an
agent-facing surface removes every default and rejects a partial payload.

Nearest prior art was a seam, not a hole: the technique already said "the stored value's
presence carries meaning independent of its content" for inherited defaults; this
extends the same fact to derived ones and to the validation door.

## Applied (Phase 7.5)

| Amendment | Project | Mode | Verdict | Application |
| --- | --- | --- | --- | --- |
| A | personas | simulation (3 cases from the CLI-floor ledger) | better (2/3) | `optional-dependency-degradation/applications/rust--fallback-retirement-condition.md` |
| B | personas (+ pumper structural) | simulation (3 cases) | better (1/3, 2 equal) | `settings/applications/rust--inherited-default-override.md` |

Ship 0: B's one concrete change crosses a provider-trait signature (the resume path
does not receive the model profile), and the personas tree had a live sibling run
committing in it this session. Filed as the project's next change in its `.ai/applied.jsonl`.

## Already covered (verified by reading)

- **#2 tiered matrix testing** - `suite-partitioning` has the tier table and
  "membership by location"; `exhaustive-when-bounded` § "Keeping both" is the
  default-suite / long-lane split, and its "when the bound comes back large" is the
  source's sharded full run. The source's refusal to run unsharded is an
  implementation of the corpus's "compare against the lane's budget".
- **#4 normalize before enumerating** - `exhaustive-when-bounded` step 2 ("the real
  limits rather than the type's limits"); the source's Input Shape / Exhaustive Matrix
  split is the same rule with a glossary entry.

## Leads

- **#8 A domain glossary as an agent contract.** CONTEXT.md carries per-term _Avoid_
  synonyms, a relationships list, an example dialogue, and a "flagged ambiguities"
  section recording how each ambiguous phrase was resolved; `docs/agents/domain.md`
  adds the consumption rule (use the glossary's term; a concept not in it is either
  invented language or a documentation gap). The form is relayed from a third-party
  skills pack, so it is one sighting. **Return when** a second first-party project
  ships its own glossary with avoid-terms and an agent rule, or a fleet project's
  instruction file grows a vocabulary section that drifts.
- **#11 Live-test ownership.** The openspec rules: every live test gets a unique stage
  and a persisted ownership marker *before* it creates resources; owned child processes
  and ports are tracked and killed in `finally`; destroy from the original directory
  with retained state, then audit for leaks; an independent marker-matched
  reconciliation path handles interrupted runs; never delete an unowned resource. This
  is `creation-names-reaper` applied to cloud test fixtures, and `isolation-lanes` does
  not carry the marker or the reconciliation. **Return when** a fleet project runs tests
  against a live provider (none does today - kp is Docker, gravitone ships nowhere), or
  a second source states the marker rule.

## Untriaged (7) - reached the table, never picked, nobody verified

Recorded with anchors so a later run does not re-derive them. **No judgment is
implied**; these were not declined.

| Candidate | Where in the tree | My read at triage |
| --- | --- | --- |
| #1 oracle predicts the rule | `test/matrix/oracle.ts` `MatrixRule` union (37 rules); `create-matrix.test.ts:110-160` fails on unpredicted accept, unpredicted reject, `unknown` classification, and wrong rule | partial - `model-based-oracle` has the model; it does not say the comparison unit can be a rejection *reason* and that an unclassifiable rejection is itself a finding |
| #14 classifier by message substring | `oracle.ts:347` `classifyMatrixError` | partial - the boundary for #1: the oracle's rule identity is bound to prose; the ADR says "assert the rejecting rule or category", and the tree cannot, because the validator returns strings |
| #7 typecheck is not startup | findings log A11: declaration files accepted a peer range whose runtime lacked the API; `--help` crashed before any provider loaded | likely catch under `gate-sees-target`; would be one sentence in the evidence-tier list if a run wants it |
| #9b plan before create | `mcp.ts` `bts_plan_project` dry run, skill says "always plan before create", `install: false` to stay under transport timeouts | partial - hitl-approval / oracle-before-gate may own it; not read |
| #10 virtual generation | `virtual.ts`, `template-generator/src/core/virtual-fs.ts`; the smoke lane parses the generated root manifest, the curated build set installs and typechecks | likely catch (fixture-economics?); not read |
| #13 control-character path hardening | `input-hardening.ts` `validateAgentSafePathInput` | thin - 33 lines, one rule |
| #15 fail at configuration, not after generation | `openspec/config.yaml` specs rule | likely catch under `one-validation-door`; not read |

### Promoting questions for the partial rows (a sibling's declared focus, applied late)

The sentry sibling's scorecard focus - one question per `partial` row whose answer
would promote it to `real gap` - was appended after this run's Phase 1 read. Applied
here, late:

- **#1 / #14** - does `model-based-oracle` anywhere say the comparison unit may be a
  *reason* rather than a verdict, and that an unclassifiable rejection is a finding in
  its own right? If its "Reading a disagreement" section is verdict-only, this is a real
  gap of one section, with #14 as its boundary paragraph.
- **#9b** - does `hitl-approval/oracle-before-gate` (or any technique in `mcp-tools`)
  already require a side-effect-free plan call before a creating call on an
  agent-facing surface? If neither names the pair, this is a real gap in `mcp-tools`.
- **#11** - does `isolation-lanes` or `live-app-harness` carry an ownership marker
  written *before* the resource exists and a reconciliation path keyed on it? If the
  marker is absent, this promotes from lead to real gap the day a fleet project runs a
  live-provider test.

## Reusable engineering seen (not landed)

The compatibility oracle is a 400-line dependency-free file that models 37 rejection
rules independently of the validator and is compared over a 52-million-case product
under sharding. It is the strongest instrument in the tree and the pattern this
registry's own `check-bundles` does not have: a second model of what should be accepted.
Not ported this run; recorded here for a `scripts/` run that wants a test-owned oracle
for the bundle gate.
