---
layer: application
type: application
subject: model-composed-workspace
technique: arrangement-memory
stack: python
status: forged
verified_on: 2026-11-03
verified_against: python@3.12
---

# The companion's project report: pins as constraints, enforced at commit

The private companion (repository `athena-meta`) gives every project that keeps
records a front page the model arranges: a report composed from a closed kit of
eight blocks on a twelve-column grid, with every figure computed by the daemon
from the project's records. The owner can pin a block so it survives the next
arrangement. Every anchor below was read at commit
`7000a27c944d10772dacafe05b6840fe601e3551` through `git archive` of that sha, and
paths are relative to the repository root. The daemon targets
`pyproject.toml:5 "requires-python"` 3.12; the report's front end is a React 18.3
client in the same repository.

The report is the fleet's strongest realization of the persistence half of this
technique - pins as constraints the composer is told about and the commit
enforces - and of the composition region's numbers rule. Its gaps are scope and
expiry, which the technique treats as the half that is easy to skip.

## Pins live apart from the spec and reach the composer as constraints - confirmed

The decision record states it in one line
(`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:32 "Pins live apart from the spec."`).
Pins are their own table, not a flag inside the stored spec
(`src/athena/report/compose.py:73 "SELECT block_id FROM report_pins"`), and the
composer's user message names them as a standing instruction
(`src/athena/report/compose.py:132 "Pinned by the owner (keep each, unchanged, with its id)"`),
with the pinned blocks marked in the current spec it is shown
(`src/athena/report/compose.py:120 "pinned"`). The generated composer
instructions repeat the rule
(`src/athena/report/vocab.py:196 "was pinned by the owner: keep it"`). The front
end tells the owner what a pin means in the pin's own tooltip
(`apps/desktop/src/main/report/Block.tsx:85 "Pin it so it stays when Athena rearranges the page"`).

Identity is minted once and carried: a block's id survives recomposition by
contract (`src/athena/contracts.py:1616 "minted once; a recompose keeps it"`), the
composer is told to keep it even when it moves, resizes or retitles a block
(`src/athena/report/vocab.py:194 "keep the id of every block you carry over"`),
and pinning an id that is not on the report is refused
(`src/athena/report/compose.py:214 "there is no block"`). The technique's
"pinned by identity, not by position or title" is confirmed.

## Enforced again at commit - upward lesson, taken into the technique

The draft said "write the rule before applying the next composition". The
report does more, and the technique now carries it. The pins are re-read and
enforced inside the transaction that stores the new composition
(`src/athena/report/compose.py:190 "pins set while she was thinking still hold"`,
applied at `src/athena/report/compose.py:192 "spec = _carry_pins(checked.spec, current, _pins(daemon, space_id))"`),
so a pin set while the model was composing is honoured even though the model
never saw it.

The enforcement is mechanical. A pinned block the model left out comes back
verbatim by id in its old place
(`src/athena/report/compose.py:148 "Pinned blocks verbatim by id, in their old place"`),
and a fresh block that only repeats a pinned one is removed by comparing kind,
binding and config (`src/athena/report/compose.py:154 "_signature(b) not in kept_sigs"`),
so respecting a pin never shows the same block twice
(`src/athena/report/compose.py:149 "never shows the same thing twice"`). Both
rules are now in the technique.

## When the report re-forms - upward lesson, taken into composition-region

Recomposition happens on request or on a change of shape, never on a change of
value: the owner presses "Arrange again"
(`apps/desktop/src/main/report/Report.tsx:76 "Arrange again"`), or a record kind
goes from none to some or back
(`src/athena/report/compose.py:237 "a kind going 0 -> >=1 or >=1 -> 0 recomposes"`),
at most once an hour (`src/athena/contracts.py:32 "RECOMPOSE_MIN_S = 3600"`); a
verdict alone never recomposes
(`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:36 "A verdict alone never recomposes."`).
A failed composition keeps the last good spec
(`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:30 "A failed composition keeps the last good spec."`,
surfaced as `src/athena/report/compose.py:187 "the last report stands"`), and a
project gets a fixed default layout before its first composition
(`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:31 "fixed default layout"`).
The draft had none of the three; all are now in composition-region.

## The model never writes a number - confirmed, with an upward refinement

The rule is in the decision record
(`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:26 "The model never writes a number."`),
in the composer's instructions
(`src/athena/report/vocab.py:181 "Never write a number."`), and at the door,
where a digit in any model-written string drops the block
(`src/athena/report/validate.py:57 "has a number in it"`). The composer is even
shown the record counts as context and told never to write them
(`src/athena/report/compose.py:129 "never write these numbers anywhere in your answer"`).
**Refinement taken:** a report title refused for a digit falls back to the
project's own name, because
(`src/athena/report/validate.py:217 "the person's words may hold digits; the model's may not"`).
Each block distinguishes failure from emptiness
(`apps/desktop/src/main/report/Block.tsx:110 "if (!v) return unread;"`, worded at
`apps/desktop/src/main/report/Block.tsx:104 "This part could not be read."`,
against `apps/desktop/src/main/report/Block.tsx:126 "No tracks waiting for you."`),
and the grid is the declared twelve columns
(`apps/desktop/src/main/report/report.css:80 "grid-template-columns: repeat(12, minmax(0, 1fr));"`),
spans validated at the door (`src/athena/report/validate.py:126 "not 1 <= span <= 12"`).

## Deviations - the standard stays

1. **Pins are the only remembered act.** The owner can pin and nothing else:
   there is no resize, sort, group or dismiss that becomes a standing rule. The
   pin set is the whole of `src/athena/contracts.py:1658 "pinned: list[str]"`.
   Work: dismiss first, since a dismissed block the composer re-proposes is the
   most visible failure.
2. **Pins never expire.** They are scoped to the project and carry no task
   boundary or reaper; `set_pins` replaces the set wholesale
   (`src/athena/report/compose.py:217 "DELETE FROM report_pins WHERE space_id = ?"`)
   and nothing else removes one. A project is a long-lived scope, so the
   accumulation the technique warns about is the expected failure here. Work: a
   visible expiry, or at least a periodic "still want these?" when pins pile up.
3. **No readable list of what is being honoured.** Pin state is visible per
   block (the tooltip above), but the report shows no summary of the rules in
   force. With one kind of rule this is tolerable; it stops being so with the
   second.
4. **Cap eviction is silent.** When pins push the report past its cap, unpinned
   blocks give way from the tail
   (`src/athena/report/compose.py:157 "unpinned blocks give way from the tail"`)
   and no reason is recorded for them. Work: add each evicted block to the drop
   reasons.
5. **A recomposition has no "what changed" line and no undo.** Every
   composition is stored as a new version
   (`src/athena/report/compose.py:197 "INSERT INTO reports"`), so the record an
   undo needs exists, but the page offers only when it was arranged and the
   button to arrange again
   (`apps/desktop/src/main/report/Report.tsx:73 "Athena has not arranged this yet"`).
   A shape-triggered recomposition changes the page while the owner is elsewhere
   and says nothing about what moved. Work: a one-line change summary and "back
   to the previous arrangement" over the stored versions.
6. **Drop reasons are not stored.** The record names its own gap
   (`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:45 "The drop reasons from a composition are returned but not stored"`).
7. **The simulated engine cannot compose**
   (`docs/adr/0018-projects-keep-records-and-her-report-is-composed-from-a-closed-kit.md:46 "The simulated engine cannot compose a report"`),
   so offline and test runs only ever see the default layout, and nothing about
   arrangement memory runs without a live model. That also rules out a
   view-choice evaluation that replays sessions cheaply.
8. **The conversation does not conduct the report.** Composition is reached only
   by the button route and the shape trigger
   (`src/athena/report/routes.py:70 "space_report_compose"`); the companion's
   chat renders its answers as a plain paragraph
   (`apps/desktop/src/athena/Transcript.tsx:37 "her-say"`) and waits behind a
   wordless pending indicator
   (`apps/desktop/src/athena/Transcript.tsx:39 "Athena is replying"`). The kit
   that composes the report never reaches the conversation. Work: let a turn
   propose a recomposition, and let the transcript render a block.
9. **The cap is a dashboard's, not a region's.** The report admits twelve blocks
   (`src/athena/contracts.py:29 "BLOCKS_MAX = 12"`); the composition region asks
   for a handful. A front page is closer to a dashboard than a per-turn
   composition, so this is recorded as a tension to measure, not a defect.
