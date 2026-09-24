---
source: shadcn-lint-tailwind-design-system
kind: second-hand practitioner review (YouTube), primary read as a cloned repository
url: https://www.youtube.com/watch?v=tPQgw_DPIoM
title: "Shadcn Just Fixed Tailwind's Biggest Problem"
author: Better Stack
words: 1583 transcript / 16383 primary docs (README 2658) / eval harness read
primary: https://github.com/shadcn-ui/lint
commit: a89d04792f340bcea26af2d539a9eec7285fcc77
extracted: 11
accepted: 2
declined: 0
already_covered: 4
untriaged: 4
leads: 2
dispatched: 0
applied: 3
shipped: 2
run_id: intake-tPQgw
siblings: 1
rescan_when: "the primary ships a Biome plugin, or its evals add a cross-family judge or a second model family; or 8 weeks elapse (2026-11-19)"
---

# A token-legal restyle is still a restyle

A channel's walkthrough of a design-system linter for a utility-class CSS
framework. The linter is built for agent-written UI: six rules, per-component
contracts, and error messages that read the component's own variant
definitions to list the legal fix. The video is the happy path. The primary
repository is much better than the video. It holds a paired before/after
eval across three models with a rules-only **control**, a neutral-task suite,
a drift-over-time run, a red-team table, and a registry ratchet, and it
states its own limits in plain words. For a review, the fetch is the
extraction, and here the extraction was a clone (Phase 2b), not a fetch.
Zero web fetches were spent beyond one search to locate the repository.

**Class and expected yield, said before triage:** second-hand practitioner
review. It is reliable for "it shipped". Its constraints live in the
primary. Expected yield: a currency signal and a lead, plus one technique if
the primary carries a measurement the video compressed. It did, twice.

**Siblings:** 1 live at claim (`in-0924-harness`, another video intake,
holding no subject). No contention on either landing.

**Declared focus (from SCORECARD):** *replay our own instrument's history
against the source's headline measurement before writing the technique.*
Applied to the headline "enforcement moves drift into the vocabulary". The
fleet's nearest same-class instrument is the native-copy gate's writable
baseline (`.ai/copy-baseline.json` in 6 projects). Every post-install edit
was net-negative (burn-down) apart from one net-neutral edit, and all of
them fell on install day 2026-09-14. No session since has raised a baseline
to get green. That is a weak negative. The window is ten days and the gate
is a ratchet, not a vocabulary. It did not confirm the mechanism in our
fleet, so the amendment cites the primary's measurement, not ours.

## What the primary says that the video does not

- **Neutral tasks** (no styling language at all): agents still restyle
  handed components on most tasks, and *all 35 findings were appearance
  classes passed to a component from outside*. With a complete vocabulary
  the agent does not invent values. It restyles.
- **Control:** strong models reach green from the rules text alone (8/8).
  The diagnostics buy one round instead of 1.25-1.57, 10-48% lower
  correction cost, and the weaker model's last task. The video's framing
  ("markdown is not great at enforcing") is only half right: for a strong
  model the prose rules converge, just more expensively.
- **Red-team:** "minting a new theme token" and "raw CSS class in the global
  stylesheet" escape, by design.
- **Drift:** the enforced project ends every sequence at zero findings *with
  more variants than it started with*. The unenforced one ends with 18-23
  findings and a vocabulary that never grew. First drafts did not get
  cleaner as the project did.
- **Fidelity** is judged by a same-family model, and "snapping to the
  nearest token counts as intent preserved". The primary lists both as
  limits itself.

## Triage (v2.5 gate; the rule each row ran under is named)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Gate the property family, not the value: caller places, control appears | ui-controls/variant-discipline, composition-contracts | new-technique | real gap | 3/1/2 | **accept** (score) |
| 2 | K | amendment | M | A membership gate relocates drift into the vocabulary | design-tokens/token-enforcement; quality-gates/self-reported-gate-inputs | new-technique (section) | real gap | 2/0/2 | **accept** (score) |
| 3 | K | amendment | S | A multiplier scale is an open vocabulary; "nearest step" launders | design-tokens/token-enforcement (byte-identical token) | corrects-claim | partial | 2/0/1 then falsified | **untriaged** (see below) |
| 4 | K | amendment | S | Diagnostics buy cost and weak-model convergence, not capability | ci/machine-paced-delivery (agent-readable-build-outcomes) | none | partial | 1/2/1 | untriaged |
| 5 | K | amendment | S | For a context-free agent a gate filters, it does not teach | design-tokens/token-enforcement (decay mechanism) | corrects-claim | thin | 2/2/1 | untriaged |
| 6 | K | amendment | S | Make the unanalyzable form a finding (static-class rule) | design-tokens/token-enforcement (unvisited branch) | none | likely catch | 1/2/1 | untriaged |
| 7 | K | technique | S | Error remedy read from the component's own variant definition | quality-gates/refusal-names-a-reachable-remedy; token-enforcement ("ban + pointer") | none | catch | - | already covered |
| 8 | K | technique | S | Release ratchet over a pinned corpus snapshot | metric-gates/ratchet-design | none | catch | - | already covered |
| 9 | K | technique | S | "Violations to zero" is graded by the linter itself | quality-gates/instrument-answers-only-its-own-question | none | catch | - | already covered |
| 10 | K | technique | S | Markdown rules are weaker than a deterministic check | agent-instruction-files/enforcement-demotion, prose-rule-drift | none | catch | - | already covered |
| 11 | K | currency | S | A design-system linter for agent-written utility-class UI shipped | - | none | - | - | lead (currency rule; no application claims its absence) |

Auto `2/4/0`, fp `0` so far (both accepts survived Phase 6).

**Row 1** - GAIN 2 (new technique, subject not in the scan's top 15) +1
convergence (an earlier forge run wrote "the control still owns layout,
spacing" into composition-contracts, and "the hatch may not reach
internals" into variant-discipline, without this source). RISK 0 (tree
opened, measured in the fleet) +1 (home contested between ui-controls and
design-tokens). Home chosen by stated job: design-tokens owns *which value*,
ui-controls owns *what a primitive's contract lets a caller do*. The
finding is the second.

**Row 2** - GAIN 1 (boundary case) +1 convergence (self-reported-gate-inputs,
reached from a guard-stack source in an earlier run, is the general case).
RISK 0 (primary evals read), an append (every standing sentence of
token-enforcement stays true). Landed as a section, not a technique. The
file's rule (allow-list against the authority) survives the finding. The
finding is the condition under which the allow-list's authority becomes the
escape route.

**Row 3, the proudest segment, falsified at its seam.** The demo's best
moment is "13px padding -> use p-3.25, same value on the scale", and the
primary confirms it. With the default 4px unit any quarter-step multiple is
a legal utility, so the "scale" admits every value a designer's ladder
excludes, and the remedy turns an off-ladder value into a legal spelling.
It scored 2/0/1 on convergence with token-enforcement's byte-identical
token. **Then the seam was chosen to falsify it:** personas (tailwindcss
4.3, the generated scale in force) holds 14 off-ladder spacing steps out of
27,672 (0.05%), and some of those are not even classes. The hazard is real
in the grammar and absent in practice here. It is banked with that number
rather than landed as a warning nobody's tree needs. Return: a tree whose
off-ladder share is non-trivial, or an agent eval that measures it under
temptation.

**Rows 4-6**: anchors `docs/evals.md` "Rules only versus diagnostics",
"Drift over time", and `docs/rules/require-static-classes.md`. Each rests
on the primary's prose or on an unread corpus file. Nobody verified them.

## Corrected premise

The video: "markdown is not as strict as a linter", which reads as "rules
text doesn't work". The primary's own control: rules text works for the
strong models and costs more. It fails only for the weaker model, on one
task in eight. The honest claim is about **cost and floor**, not about
whether prose can enforce. This is the same shape as the 2026-08-27 review:
the video's sharpest line was a simplification the primary had already
qualified.

## Design read (primary, count only)

Three load-bearing decisions: (a) the placement/appearance ownership
partition, `corpus: NONE` (nearest variant-discipline, which closes the
variant set but leaves the passthrough undivided); (b) remedy lists read
from the component's variant definition, a catch (refusal-names-a-reachable-remedy);
(c) new tokens allowed by design, partial (token-taxonomy governs admission,
nothing names the gate's pressure on it). Routing count NONE = 1, so it
stays in intake with no handoff. `directions=n/a`: the one mechanism is
coverage in governed contexts (a lint rule over an existing primitive), not
a new capability.

## Applied (Phase 7.5) and shipped (Phase 8)

- `call-site-ownership` / personas / **experiment** / **better**. The seam
  was chosen to falsify: the fleet tree with the most mature token gates.
  678 shared-button call sites, 34 restyle it, 17 of those with no raw
  value. The project's full lint config sees 0 of 34. Filed as the
  project's next change (a census ratchet at baseline 34).
- `token-enforcement` (unvisited-branch clause) / personas / **code** /
  **better**. Found by the seam hunt while running arm A. The white-color
  rule's anchor was whitespace-only, so 15 of 25 uses (every `hover:` /
  `focus:` form) escaped. Paired: 3 -> 9 findings, errors 0 -> 0, other
  messages unchanged, rule tests 59/59. **Shipped** personas `f9e257bcd`,
  not pushed. The same anchor in `no-low-contrast-text-classes` is
  **deliberate** (its contract exempts state modifiers), which is why the
  fix was read against each rule's stated contract rather than applied by
  pattern.
- `token-enforcement` (vocabulary section) / fleet copy baselines /
  **experiment** / **unmeasurable**. Instrument that would measure it: a
  membership gate at error level over a vocabulary agents can write, with
  the authority's member count tracked across the rollout. No fleet project
  has one (personas' token rules are warn/off).

## Leads

- **Currency:** a design-system linter for agent-written utility-class UI
  shipped in September 2026 (ESLint and an alpha Oxlint JS-plugin path, no
  Biome). No corpus application claims such a tool is absent, so there is no
  clock to reset. Return: when a fleet project adopts it, write the
  application against that tree.
- **A same-family judge scoring fidelity** after a correction that snaps to
  the nearest token counts the snap as preserved intent. Return: a
  cross-family judge on the same pairs. The primary names this itself.

## Untriaged (nobody verified these; not declined)

Rows 3-6 above, with their anchors. Not re-derived by this run beyond what
is written.
