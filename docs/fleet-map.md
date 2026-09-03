# The fleet map - the map of context maps, and the direction lane

Two kinds of gap exist between a project and the registry, and until 2026-09-02 the
registry's instruments could see only the first.

| | Coverage gap | Direction gap |
| --- | --- | --- |
| **What it is** | a context exists, a subject governs it, the project deviates | no context exists for a capability the corpus models and a project of this purpose lacks |
| **Where it is visible** | `<project>/.ai/registry-map.json`, one `state` per context-subject pair | `librarian/fleet-map.json`, one classification per absent (subject, project) pair |
| **Who decides** | the recommendation - a `task` or `code` apply row, auto-approved on the project's own gate | the owner - a direction proposal, human-gated |
| **Lane in `/intake`** | Phase 7.5 apply, Phase 8 ship | Phase 7.6 direction pass, Phase 8 lane split |

A project's registry map is built by joining its contexts to subjects, so a subject with
no matching context never appears in it. That is why reforging does not close a direction
gap: forging the same repository again produces the same subjects, and the absence stays
invisible either way.

## The three pieces

**1. The scope block** in each project's `.ai/manifest.yaml`. Absence is only a hypothesis
against declared intent; without it every subject in the corpus is a missing feature and
the list is noise. The block is owner-written (the registry drafted the first ones on
2026-09-02; the owner edits, the registry only reads):

```yaml
scope:
  does:
    - one line per thing the project is for
  does_not:
    - one line per thing it deliberately is not
  out_of_scope_categories:
    - <bundle>/<category>            # e.g. software-engineering/ui-surfaces
    - <bundle>/<category>/<subcat>   # e.g. software-engineering/llm-agent/companion
  out_of_scope_subjects:
    - <bundle>/<subject>
  directions_ledger: .ai/directions/ledger.jsonl
```

`does` / `does_not` are for readers and for the intake direction pass's judgment step. The
two lists are for the script: a subject in an excluded category or list is never a
candidate. Unknown keys are ignored, as the manifest contract requires.

**2. The fleet map**, `node scripts/build-fleet-map.mjs`, regenerated like the index and
checked with `--check`. It folds every project's registry map, manifest and directions
ledger with every bundle's index into:

- `librarian/fleet-map.json` - `projects` (slug -> purpose, domains, scope, groups ->
  contexts -> governing subjects with states) and `subjects` (`bundle/slug` -> projects
  present with context counts and state tallies, projects absent with a classification),
  plus a per-project `summary`.
- `librarian/fleet-map.md` - the same, readable: a summary table, one section per project
  with its groups and its candidate directions by category, and the list of subjects that
  govern no context in any mapped project.

Classification of an absence, first match wins:

| Class | Meaning | Source |
| --- | --- | --- |
| `out-of-domain` | the subject's bundle is not in the project's declared domains | manifest `domains:` |
| `out-of-scope` | the scope block excludes the subject, its category or its subcategory | manifest `scope:` |
| `declined` | the owner declined this direction, with a reason | directions ledger |
| `deferred` | the owner deferred it, with a return condition | directions ledger |
| `accepted` | a direction in flight - not a candidate, a task | directions ledger |
| `candidate` | everything else | - |

Public, with one rule about paths: **every path is relative to the project's root.** The
JSON carries each context's paths exactly as the registry map stores them
(project-relative), and a row carrying an absolute path is dropped and counted in that
project's `absolutePathsDropped`. The root per device lives in `projects.json` under
`machines.<name>.root`, and the project's checkout under it in `checkouts.<name>`, so the
same fleet map resolves on every device without editing. No evidence strings, no hosts;
those stay in the project's own map.

**3. The direction proposal and its ledger**, in the project's own tree:

```
<project>/.ai/directions/<YYYY-MM-DD>-<subject>.md     one proposal
<project>/.ai/directions/ledger.jsonl                  one decision per line
```

A proposal has a fixed shape, so the owner's review is a read and not an investigation:

```markdown
---
subject: <bundle>/<subject>
project: <slug>
raised_by: intake <run-id>            # or: fleet-map sweep, operator
source: librarian/sources/<note>.md   # the design record entry that implied it
stage: <where in the project's pipeline the capability would sit>
size: <files> files / <lines> lines / <S|M|L|XL>
status: proposed
---
## Why the scope implies it        (one paragraph, citing scope.does)
## What the first context contains (the module, its boundary, what it must NOT absorb)
## The measurable                  (the number that would say the direction paid off)
## What would make this wrong      (the falsifier)
```

The ledger row is the decision: `{"date","subject","bundle","decision":"accepted|declined|deferred","reason","proposal":"<file>","by":"<contributor>"}`.
The fleet map reads it, so a declined direction is never re-proposed, and a deferred one
carries its return condition. Three declines on one shape across projects are a scope
rule, and the owner adds it to `out_of_scope_*` so the script stops asking.

## The decision gate (intake 2.3.0)

The ledger row is written by the operator through the run, not by hand. At the end of
every attended intake, Phase 7.7 shows every proposal still `proposed` across the fleet as
one multi-select screen per project: selected is accepted, unselected is declined, and
there is no third state - a direction the operator wants to think about is declined now
and can be re-raised by a later run. The rows land in each project's ledger and the
proposal's `status:` line flips; accepted proposals are then executed in the same session,
one worker per proposal in an isolated worktree on a `direction/<slug>` branch, with the
gate's verdict written to the project's `.ai/applied.jsonl`. A branch whose gate ran
green is merged by the director in the same session (`--no-ff`, never pushed); a branch
whose gate is red or could not run stays a branch with the reason recorded - the
operator's acceptance at the gate was the human decision, and there is no second one at
merge time (intake 2.3.1). The first gate ran on 2026-09-03: eleven shown, nine
accepted, two declined, nine executed, nine merged.

## How intake uses it

After the design read (Phase 2d) every design-record entry with a corpus home is looked up
in `subjects[<home>].absent`. A project classified `candidate` there, whose `scope.does`
admits the decision's forces, gets a proposal - at most three per run, written to the
project's `.ai/directions/`, committed with a pathspec, never executed. The judgment in
that sentence - "admits the decision's forces" - is the LLM's, and the proposal schema
exists to make it reviewable rather than to remove it. Phase 8 then runs two lanes:
coverage improvements ship on the recommendation, directions wait for the ledger row.

## Reading the first map honestly

On the day the script was written, with no scope blocks, candidate counts ran 43 to 139
per project. That is the "tens per project" reading: it means scope needs tightening, not
that the fleet is missing a hundred features each. The number to watch is candidates per
project after the owner has edited the scope block once; a handful means the direction
pass is worth running on every intake, and a number that will not fall below twenty means
the categories are too coarse for scope to cut and the exclusions belong at subject
granularity.
