# Choose a development workflow

Start with the work's intended result. Select one coordinating workflow for a tranche;
call supporting skills for specific outputs. This routing guide describes the current
library and proposes no new runtime or automatic installation.

| Intended result | Start here | Boundary and supporting methods |
| --- | --- | --- |
| Set up a new repository | [onboarding](../skills/onboarding/SKILL.md) | Use [agent-guidance-bootstrap](../skills/agent-guidance-bootstrap/SKILL.md), [project-populate](../skills/project-populate/SKILL.md), and [ci-bootstrap](../skills/ci-bootstrap/SKILL.md) for their specific artifacts. |
| Turn an idea into a buildable design | [spark](../skills/spark/SKILL.md) | Establish acceptance criteria before moving to implementation. [friend](../skills/friend/SKILL.md) is the ongoing single-area companion. |
| Review architecture and choose a structural change | [architect](../skills/architect/SKILL.md) | Use a decision record and a bounded migration. [consult](../skills/consult/SKILL.md) retrieves relevant standards; [conform](../skills/conform/SKILL.md) checks a project's alignment with them. |
| Find and fix codebase weaknesses | [scan-sweep](../skills/scan-sweep/SKILL.md) | Name the context and finish condition. [explorer](../skills/explorer/SKILL.md) is a broader ongoing improvement workflow. Avoid starting both as competing coordinators of the same files. |
| Improve a product through repeated implementation tranches | [perfect](../skills/perfect/SKILL.md) | Freeze each tranche's scope and acceptance evidence. Use [value-ledger](../skills/value-ledger/SKILL.md) to track the value case. |
| Prepare a release | [ship-loop](../skills/ship-loop/SKILL.md) | [mvp](../skills/mvp/SKILL.md) supplies a launch-readiness checklist. [test-before-commit](../skills/test-before-commit/SKILL.md) validates a change; it does not establish whole-product readiness. |
| Diagnose delivery failures | [ci-triage](../skills/ci-triage/SKILL.md) | [ci-gate-check](../skills/ci-gate-check/SKILL.md) inspects gates; [flake-register](../skills/flake-register/SKILL.md) records flaky tests. |
| Evaluate user or model outcomes | [uat](../skills/uat/SKILL.md) | [cx](../skills/cx/SKILL.md) examines experience; [kpi-sim](../skills/kpi-sim/SKILL.md) models KPI scenarios; [tiger](../skills/tiger/SKILL.md) evaluates LLM call sites. A simulation is not a production outcome. |
| Research a justified improvement | [research](../skills/research/SKILL.md) | [npm-updates](../skills/npm-updates/SKILL.md) specializes in dependency updates. [promote](../skills/promote/SKILL.md) extracts an already demonstrated pattern. |
| Produce or improve media and language assets | [leonardo](../skills/leonardo/SKILL.md) | [motionize](../skills/motionize/SKILL.md) covers motion SVG work; [i18n-translate](../skills/i18n-translate/SKILL.md) covers localization; [dojo](../skills/dojo/SKILL.md) covers repeated craft improvement. Check each method's tool prerequisites. |
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
The remaining integration work is an explicit adapter: discovery paths, overlay paths,
tool capabilities, installation mode, and a smoke task. Do not copy the entire library
into always-loaded instructions. Codex uses skill descriptions for selection and loads
the selected skill body on demand; large bodies still cost context after selection.
[Source](https://learn.chatgpt.com/docs/build-skills).
