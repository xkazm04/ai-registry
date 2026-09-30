---
layer: technique
type: technique
subject: game-dialogue-voice-pipeline
technique: line-id-catalog-and-revision-diff
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a script changed and only the affected recordings should be redone, building the list of every voiced unit in a game, finding which lines were made by an older model or voice]
---

# Line-id catalog and revision diff

The named concern: a catalog in which every spoken line has one stable identifier and four
recorded facts, so that any change (to the words, to the voice, to the model, to the
pronunciation rules) resolves to exactly the set of lines it invalidates. A voiced game
without this catalog can still ship; it cannot be revised, because nobody can say what a
revision touches.

## The identifier is not new

The conversation graph already gives every node a stable identity, and the graph validation
craft already treats that identity as minted once, never reused, and independent of text
and position. The line identifier is that node identity, with a variant marker where one
node speaks more than one text (a conditional variant, a gendered form, an alternate for a
repeated visit). Lines that belong to no graph (barks, ambient chatter, tutorial prompts,
filler reads) get identifiers minted in the same scheme by the catalog itself. Two rules
follow from
[one authority per quantity](../../../../_laws.md#one-authority-per-quantity):

- **Never derive identity from text, path or list position.** Text-derived identity turns
  a typo fix into a delete plus an add and re-records the line; position-derived identity
  renumbers everything after an insertion.
- **Never derive identity from a name that can be renamed.** An identifier built from an
  entity's display name breaks the day the entity is renamed, and every recording attached
  to it becomes an orphan without any error.

## What a row carries

| Field | Meaning | Invalidated by |
| --- | --- | --- |
| `id` | node identity plus variant marker | never changes; deleted ids are never reused |
| `speaker` | the ledger role that speaks it | recasting the role |
| `script_rev` | revision of the text and its direction | any edit to the words or the acting note |
| `render_rev` | the recipe that produced the take: model identifier, voice asset, settings, pronunciation dictionary version, context text, and a hash of the output | a change to any recipe element |
| `class` | baked-authored, baked-pool or runtime | reclassification |
| `duration_budget` | seconds, per locale | see the timing technique |

The two revisions are separate on purpose. A rewritten line changes `script_rev` and forces
a new render; a new model changes `render_rev` for a set of lines whose words did not move.
Merge them and every diff is either too wide or too narrow.

## The diff, in the catalog's terms

Diff two catalog states by id, and classify each id by what changed.

- **Words changed:** re-render and re-accept exactly those lines, and mark their
  translations stale. The line's earlier acceptance describes the old words
  ([a verdict is bound to the content it judged](../../../../_laws.md#a-verdict-is-bound-to-its-content)).
- **Direction changed, words unchanged:** re-render only; translations stand.
- **Recipe element changed for some lines** (a pronunciation dictionary edit, one voice's
  settings): re-render the lines that carry the element, found by querying `render_rev`,
  not by searching text. A dictionary edit touches only lines containing the affected
  words.
- **Model changed for the catalog:** not a diff at all. It is a catalog-wide event and is
  handled by the re-cast gate; the diff's only job is to list what would be affected.
- **Added or deleted id:** new render, or retire the take and keep the tombstone so the
  id is never reused.

Stale acceptance is marked, not deleted, and renders as *not accepted since the last change*
rather than as its old state or a blank; both of those read as a pass
([unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass)).

## Decision rules

- **When a writer splits, merges or reorders nodes, ids follow the graph;** an id that
  disagrees with the graph is a defect the catalog check reports, not a second truth.
- **When a line has no take yet, its row says so** instead of holding a placeholder path
  that looks real. A missing take is a state, and the catalog exposes it as a count.
- **When comparing states, exclude pipeline bookkeeping** (render timestamps, job ids) in
  exactly one place, or every touch of the catalog reads as a revision.
- **When the recipe includes a pronunciation dictionary, record its version, not its
  name.** Providers version dictionaries, and a render made under a superseded version is
  a different render.
- **When a line is edited after acceptance, the cost is real:** count re-render churn as a
  budget item, and freeze authored text before its bulk render.

## When not to use this

- **On a prototype scene nobody will voice permanently.** A throwaway render needs a file,
  not a catalog.
- **As a substitute for the graph's own validation.** The catalog says what a change
  invalidates; whether the conversation is playable is decided by the graph craft.
- **For text that is not spoken** (author notes, node names, debug strings). Counting it
  inflates the catalog and makes its totals untrustworthy.
