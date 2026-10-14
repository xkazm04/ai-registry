# Choose a development workflow

Start with the work's intended result. Select one coordinating workflow for a tranche;
call supporting skills for specific outputs. A simple bounded edit needs no coordinator.
Honor the scope and inputs already supplied; skill menus do not require asking again.
Findings require evidence, with no minimum quota. Missing capabilities must be reported
before dependent work. Read-only review also keeps reflection and telemetry read-only. This routing guide describes the current
library and proposes no new runtime or automatic installation.

| Intended result | Start here | Boundary and supporting methods |
| --- | --- | --- |
| Set up a new repository | [onboarding](../skills/onboarding/SKILL.md) | Use [agent-guidance-bootstrap](../skills/agent-guidance-bootstrap/SKILL.md), [project-populate](../skills/project-populate/SKILL.md), and [ci-bootstrap](../skills/ci-bootstrap/SKILL.md) for their specific artifacts. |
| Turn an idea into a buildable design | [spark](../skills/spark/SKILL.md) | Establish acceptance criteria before moving to implementation. |
| Review architecture and choose a structural change | [architect](../skills/architect/SKILL.md) | Use a decision record and a bounded migration. [consult](../skills/consult/SKILL.md) retrieves relevant standards; [conform](../skills/conform/SKILL.md) checks a project's alignment with them. |
| Find and fix codebase weaknesses | [scan-sweep](../skills/scan-sweep/SKILL.md) | Name the context and finish condition. [explorer](../skills/explorer/SKILL.md) is the short, interactive, joins-first probe sweep of one area: it reads scan-sweep's coverage ledger to pick a lens neither loop has run there, and never writes that ledger. Avoid starting both as competing coordinators of the same files. |
| Maintain code after rapid development | [maintain](../skills/maintain/SKILL.md) | Resume small verified refactors and maintenance batches with context coverage and durable evidence. Use a time/batch budget; product ideation stays in [perfect](../skills/perfect/SKILL.md). |
| Improve a product through repeated implementation tranches | [perfect](../skills/perfect/SKILL.md) | Freeze each tranche's scope and acceptance evidence. Use [value-ledger](../skills/value-ledger/SKILL.md) to track the value case. [friend](../skills/friend/SKILL.md) is the light single-area variant: it proposes and executes one direction per cycle in a worktree. |
| Prepare a release | [ship-loop](../skills/ship-loop/SKILL.md) | [mvp](../skills/mvp/SKILL.md) supplies a launch-readiness checklist. [test-before-commit](../skills/test-before-commit/SKILL.md) validates a change; it does not establish whole-product readiness. |
| Diagnose delivery failures | [ci-triage](../skills/ci-triage/SKILL.md) | [ci-gate-check](../skills/ci-gate-check/SKILL.md) inspects gates; [flake-register](../skills/flake-register/SKILL.md) records flaky tests. |
| Evaluate user or model outcomes | [uat](../skills/uat/SKILL.md) | [cx](../skills/cx/SKILL.md) examines experience; [kpi-sim](../skills/kpi-sim/SKILL.md) models KPI scenarios. A simulation is not a production outcome. |
| Make the product's most valuable area markedly better | [tiger](../skills/tiger/SKILL.md) | Hunts the area by value evidence; a cross-vendor council proposes evolutionary moves; a person approves the scope item by item. [contest](../skills/contest/SKILL.md) builds competing UI prototypes instead of a scope. |
| Research a justified improvement | [research](../skills/research/SKILL.md) | [npm-updates](../skills/npm-updates/SKILL.md) specializes in dependency updates. [promote](../skills/promote/SKILL.md) extracts an already demonstrated pattern. |
| Produce or improve media and language assets | [leonardo](../skills/leonardo/SKILL.md) | [motionize](../skills/motionize/SKILL.md) covers motion SVG work; [i18n-translate](../skills/i18n-translate/SKILL.md) covers localization; [dojo](../skills/dojo/SKILL.md) covers repeated craft improvement. Check each method's tool prerequisites. |
| Unify an app's visual design from one composition kit | [kit](../skills/kit/SKILL.md) | `/kit init` chooses and promotes a kit first; `/kit adopt` enters a repo that already has one. Batches run across sessions from a coverage ledger, gated per batch or by key decisions plus a summary gate. |
| Bring consuming projects up to current standards | [straighten](../skills/straighten/SKILL.md) | Operates across connected projects using their conformance records. Establish project scope before running operator-side work. |

Versions and complete skill resources are derived in [catalog.json](../catalog.json).
The descriptions above are a human navigation aid; the selected skill's current body
defines its procedure.

## A reviewable development tranche

For a bounded improvement, record these fields in the project's existing plan or decision
record. This is a suggested common handoff shape, not a replacement for existing skill state.

| Field | What it establishes |
| --- | --- |
| Problem and baseline | A concrete failure or missing capability, with reproduction or evidence. |
| Scope and dependencies | Owned paths, interfaces affected, prerequisite decisions, concurrent work. |
| Acceptance | Observable result and the check that distinguishes success from failure. |
| Execution | Selected workflow, required capabilities, and relevant knowledge or recipe versions. |
| Validation | Commands and outcomes; distinguish structural checks, scenario tests, and field evidence. |
| Handoff | Diff, unresolved risks, rollback procedure, and the next independent tranche. |

Do not treat a successful format check as evidence that a method produces better work.
For behavioral changes, use a frozen task and compare the old and proposed procedures
with the same inputs. Record inconclusive and negative results as well as improvements.

## Codex integration

The registry's existing linker targets `.claude/skills` and `.claude/rules`. Codex's
documented repository skill discovery uses `.agents/skills`, supports symlinked skill
directories, and reads project instructions from `AGENTS.md`. A Claude installation is
therefore not sufficient evidence that a skill is installed for Codex.
Sources: [Codex skills](https://learn.chatgpt.com/docs/build-skills) and
[project instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md),
checked 2026-09-09.

This repository now has a root `AGENTS.md` for navigation and validation guidance.
The [explicit installer](installations.md) now supplies discovery paths, installation
modes, local receipts and capability preflight. Do not copy the entire library
into always-loaded instructions. Codex uses skill descriptions for selection and loads
the selected skill body on demand; large bodies still cost context after selection.
[Source](https://learn.chatgpt.com/docs/build-skills).

The [frozen routing cases](evals/routing-cases.json) cover adjacent workflows, explicit
read-only scope, missing tools, and tasks that need no skill. See the
[evaluation protocol](evals/README.md) before claiming a routing improvement.
