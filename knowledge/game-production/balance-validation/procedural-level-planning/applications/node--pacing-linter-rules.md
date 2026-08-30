---
layer: application
type: application
subject: procedural-level-planning
technique: pacing-linter-rules
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# A five-rule pacing linter over a room graph

`src/lib/level-design/pacing-linter.ts` in the Path of Fire tooling repo
(`C:\Users\kazda\kiro\pof`) is a pure function from a `LevelDesignDocument` — rooms,
connections, and an explicit `difficultyArc` — to a `PacingLintResult`. It runs in the
browser, before any geometry exists.

## The finding shape

`PacingFinding` (`:17-28`) is the technique's "signature plus consequence plus fix" made
into a type: `ruleId`, `severity` (`info | warning | critical`), `roomIds` (documented as
*"First entry is the primary anchor for inline badges"*), a short `title`, a `message` that
states the player consequence, and a `suggestion` that is required to be actionable. The
result (`:31-36`) additionally groups findings `byRoom` for inline badges and carries
severity `counts` for summary chips — a graded report, not a pass/fail.

## The arc

`resolveArc()` (`:62-...`) prefers the document's explicit `difficultyArc` and otherwise
falls back to a best-effort BFS from rooms with no incoming connections. Every ordering rule
reads that arc, so "adjacent" means adjacent in intended traversal, not adjacent on the map.

## The five rules, with their exact numbers

**`consecutive-combat`** (`:138-170`, severity `warning`). `COMBAT_TYPES = {combat, boss}`;
`RESTFUL_TYPES = {safe, cutscene, puzzle, exploration, hub, transition}`. A run flushes at
length ≥ 3. Two details matter: a combat room tagged `pacing === 'rest'` does **not** extend
the run, and — the honest default — a room of an unrecognised type falls to
`run.push(room); // unknown room type — count as continuing the run`. Unknown does not grant
relief.

**`difficulty-cliff`** (`:174-...`). Threshold ±3 between arc-adjacent rooms; `delta >= 3`
is `critical` ("Sudden spikes feel unfair"), `delta <= -3` is `warning` ("Players may feel
under-stimulated"). Symmetric threshold, asymmetric severity — and the drop's suggestion
offers the deliberate reading: *"or frame the drop deliberately (treasure/rest beat)"*. The
spike's suggestion names the number: insert a room at `prev.difficulty + 1`, or lower this
one to it.

**`monotonic-ramp`** (`:207-...`, severity `info`). Requires `arc.length >= 4`, computes
`allNonDecreasing` / `allNonIncreasing` across the whole arc and `totalChange`, and fires
only when the arc never reverses **and** `Math.abs(totalChange) >= 3`. Both directions are
linted. The message is the craft statement: *"Great arcs zig-zag — players relax before each
new peak."* The suggestion asks for a dip of 1–2 around the arc's midpoint.

**`no-safe-before-boss`** (`:238-...`, severity `critical`). For each `type === 'boss'`
room, `neighborsOf()` (`:117-134`) collects both outbound and inbound edges — the comment is
explicit: *"a safe room placed before the boss is just as valid as one after"* — and the
neighbour qualifies by `n.type === 'safe' || n.pacing === 'rest'`. Kind or pacing tag,
either bears the role.

**`unreachable-room`** (`:263-...`, severity `critical`). BFS over `buildAdjacency()` from a
seed set: the first valid `difficultyArc` entry, then every room with zero incoming edges,
then the first room as a last resort. Any room not reached is reported. The multi-seed start
is deliberately forgiving — it reports only rooms that are unreachable under *every*
plausible entry.

## What the repo taught beyond the draft

Three things upgraded the technique. The unknown-type fallthrough (silence must not read as
a rest beat). The bidirectional boss adjacency (a one-directional check invents findings).
And the requirement that every finding carry a `suggestion` naming the specific rooms and
the specific replacement number — that field is what makes the linter a tool a designer uses
rather than a nag they mute.

## Where it falls short

`lintLevelPacing()` (`:316`) returns findings and counts, but nothing distinguishes *no
findings* from *rules that could not evaluate*: a document whose `difficulty` values are all
zero and whose room types are unset produces a clean-looking empty result. The standard
holds — the result should carry a per-rule evaluated/unevaluated state, so a half-authored
graph cannot read as a passing one.
