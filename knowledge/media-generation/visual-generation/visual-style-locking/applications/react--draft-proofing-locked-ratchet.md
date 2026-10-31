---
layer: application
type: application
subject: visual-style-locking
technique: draft-proofing-locked-ratchet
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19
---

# React: the style record as a one-way ratchet

Described at gravitone-gcloud@`fd09c06`. The studio (a Next.js/React video
studio over a SQLite store) keeps the whole ratchet in one pure file,
`packages/domain/src/style.ratchet.ts`. The record's door, the kernel's
writes and the view a screen is handed all read the same functions, and the
file header (`:5-19`) records how two v1 ratchets, the catalogue's
`proven` and the theme's `locked`, were merged into it. The comments narrate
the incidents that shaped it.

## The record and the ratchet

Status is **derived, never written by a caller** (`statusOf`, `:127-131`):
a lock event on the record means `locked`; otherwise an operator's keeps in
`PROVEN_KEEPS = 2` distinct run/scene cells (`:49`, counted by `keptCells`,
`:122-125`) mean `proven`; otherwise `candidate`. An agent's keep is
evidence, never a vote (`:122`). The states and their edges are a table,
`candidate -> proven -> locked`, with no way out of `locked`
(`packages/domain/src/style.machine.ts:22-26`). Its comment (`:9-21`)
records that a `locked -> proven` edge existed until Phase 5 and was removed
because it contradicted the plan and v1's own lock.

The lock gate is `lockBlocker` (`style.ratchet.ts:185-202`). It keeps v1's
sentences in the user's words: a block must exist, at least one proof must
exist, no proof may still be pending, and not every proof may be rejected.
It adds two gates. Approvals under the **current** block must cover
`LOCK_PROBLEMS = 3` trial problems (`:51`, `:192-198`), and the style must
be proven (`:199-200`). Coverage is measured against block lineage: each
proof records the digest of the block it was drawn under, and an approval
under an earlier block is reported as stale and no longer counts
(`sheetCoverage`, `:142-164`).

The gate is refused **at the write**, not greyed out in a view. The kernel's
`lock` operation calls `lockBlocker` and returns `refused` with its sentence
(`packages/kernel/src/styles/core.ts:115-120`). The header records why:
v1's lock hook skipped `canLock` and could lock anything
(`style.ratchet.ts:15-16`). `ratchetBlocker` (`:211-223`) is the second
write rule. Status moves only along the machine, a lock is never lifted or
re-stamped, a locked block never changes, and a locked sheet keeps at least
one approval. Evolution is duplicate-into-new-draft: the kernel's
`duplicate` operation copies the look and drops the lock, proofs and
evidence (`core.ts:121-125`).

## One resolution point, honest misses

`lookOf` in `packages/producers/src/frames/look.ts` answers which style a
project's pictures are drawn in, from the project's own binding
(`:70-81`). Its header (`:11-34`) keeps the defects it replaced. v1 once
resolved "the" style as the account's most recently touched lock, which is
wrong for at least one project on any account with two. Later, Phase 4 drew
every plate in `PRESETS[0]` with no references, and nothing said so.

On a miss (`unset`, `missing`, or `no-block` for a catalogue style with no
block, `:71-73`) the resolver draws the named default `DEFAULT_LOOK_PRESET`
(`:58`) with no references, and carries the miss on the result.
`lookWords` prints it on the receipt as "default style … · " plus the miss
sentence from `LOOK_MISS_WORDS` (`:94`). A resolved style sends `styleRefs`:
the founding `PINNED_REFS = 2` approvals pinned, then the newest, up to
`SEND_REFS = 4`. Pending, rejected and stale approvals never travel
(`style.ratchet.ts:54-59`, `:227-235`).

## The proofing loop that feeds the gate

The atelier, under `app/(studio)/library/style/[id]/`, is where proofs are
made and judged. It renders against the fixed trial set `STYLE_TRIALS`:
five real beats that pose five visual problems, so that no style passes by
being good at one thing (`style.ratchet.ts:63-77`). The subject clause goes
to the model verbatim, and an edited subject is no longer the trial
(`:44`). Each generation is launched through the same receipt flow the
Plan and the part editors use (`_atelier/Atelier.tsx:4-5`,
`generate` at `:148-152`), so a proof run is priced before it spends.

The presets that seed drafts (`packages/catalog/src/presets.ts:1-16`)
encode the attribute-grammar finding. Each is "a complete four-slot style
block … not a mood word", every palette assigns ground/objects/accent
roles, and all six thumbnails render one `CANON_SUBJECT` "so the user is
comparing the only thing they are actually choosing."

## Where the realization departs from the technique

- **No project-creation gate.** A project binds a style by id and nothing
  checks the style's status. Per `look.ts:32-34`, a style with a block that
  is not yet locked "is still drawn in (the project chose it), and the
  receipt says 'not locked' - the gate is the atelier's, the honesty is
  here." `lookWords` appends ", not locked" for such a style (`:95`). So
  `locked` is the state the atelier ratifies and the receipt reports, not
  the state a project must be created against.
- **The resolver substitutes a named stand-in.** On a miss, `lookOf` draws
  `DEFAULT_LOOK_PRESET` itself rather than leaving the fallback to the
  caller. The miss stays named and is printed, which keeps the honesty half
  of the technique's rule.

## History

- **Forged** (date not recorded) against the v1 tree. The lifecycle lived
  in one module, `lib/themes.ts`, over IndexedDB. Its header stated
  `draft -> proofing -> locked` and that "`locked` is the state a project
  may be created against". Status was derived from `lockedAt` and the
  proofs array; `canLock` required one approval and no pending proof;
  `projectStyle()` returned a discriminated miss (`unset` / `deleted`) and
  substituted no stand-in theme; `app/library/Playground.tsx` let the user
  edit the subject and render twice with one block; `sheetSpend` counted
  unpriced proofs separately; and `putTheme` threw on write failure so an
  approved sheet could not be lost silently.
- **Re-checked 2026-10-31 at gravitone-gcloud@`fd09c06`.** Every v1 anchor
  is gone: the rebuild removed `lib/themes.ts`, its IndexedDB store,
  `Playground.tsx` and `app/library/presets.ts`. Findings at that commit:
  the **ratchet held and got stricter** (derived status, one-way edges,
  three-problem coverage under the current block, refusal at the write).
  The **project-creation gate did not survive**, and the resolver **now
  substitutes a named default**. Both reverse claims the v1 body stated as
  the realization; they are recorded above as current departures. The
  presets moved to `packages/catalog` with their reasoning intact.
  `sheetSpend` and `putTheme` have no successor under those names; spend
  now goes through the shared receipt flow.
