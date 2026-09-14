---
layer: application
type: application
subject: translation-pipeline-topology
technique: prompt-context-contract
stack: process
status: forged
verified_on: 2026-09-14
---

# A guide translation prompt carrying two of ten contract fields, and the facts that went stale inside it (personas-web)

`personas-web` on `chore/remove-react-virtuoso` at `35d557b` (2026-09-14). The
guide is 116 topics in 11 English category files under `src/data/guide/content/`,
translated into 13 locales by one model subagent per locale from a single template,
`scripts/i18n/translate-guide-subagent-prompt.md` (last changed in `36c6444`,
2026-05-16, until the same-day amendment noted at the end). Every line number below
is that file at `35d557b`, read directly. Every count was re-measured that day.

## The template against the field list

The template is prose with five substitution slots: `<LOCALE_NAME>`,
`<LOCALE_CODE>`, `<WORKTREE>`, `<WORKTREE_ABSOLUTE_PATH>` and `<SOURCE_HASHES_PATH>`
(`:231-237`). Measured against the technique's ten fields:

| field | at `35d557b` | where |
|---|---|---|
| unit text | present | read lists `:27-36`, `topics.ts` `:39` |
| key or identifier | present | topic ids, "NEVER translate the keys" `:206` |
| human context note | absent | no per-topic note exists anywhere in the corpus |
| surface | absent | "the personas-web user guide" `:20`; nothing says titles and descriptions render in navigation and search |
| sibling units | partial | a whole category file is read at once (`:185-190`), but that is never stated as context |
| memory matches with scores | absent | a stale topic is re-translated from scratch; its previous translation is not shown |
| occurring glossary terms | absent (whole list sent) | 64 named terms plus seven trigger-label examples inline for every locale (`:139-157`) |
| target plural categories | absent | — |
| check findings on the unit | absent | — |
| placeholder map | partial | a global list of structural markers (`:125-137`), not a per-unit map |
| action | partial | full translation only; the drift detector exists "to identify topics that need re-translation" (`:11-13`), but the template has no refresh mode |

That is **2 present, 3 partial, 5 absent**, plus the whole-glossary failure mode.
There are no examples, as prior turns or otherwise. The per-language instructions
are one paragraph covering two script groups: right-to-left (`:172`) and CJK spacing
(`:173-174`). The other nine locales, Czech and Russian with their four plural
categories among them, get nothing. There is no resolution order because there is no
map to resolve.

## Context that nobody versions

The template is where facts about the corpus live, and nothing checks them against
the corpus:

- **File count.** "English source content (8 files):" (`:26`) heads a list of ten
  (`:27-36`). That was already wrong when it was written: `36c6444` had ten category
  files. `companion.ts` arrived in `42e83ae` (2026-06-14) and is in neither the read
  list nor the write list (`:50-59`). Step 2 still says "Read each of the 10 English
  content files" (`:185`).
- **Topic count.** "all 102" appears at `:75`, `:106` and `:192`, and "expected: 102"
  at `:217`. 102 was true at `36c6444`. The corpus holds 116 today.
- **Direction.** "For RTL languages (ar, hi)" (`:172`). Hindi is left-to-right, and
  the site marks only `ar` with `rtl: true` (`src/stores/i18nStore.ts:30`). This was
  false when written, not stale.
- **Tier names.** "Tier names: Starter, Team, Builder." (`:152`) is a third set. The
  catalog's pricing tiers are Local, Cloud and Enterprise (`src/i18n/en.ts:1825-1827`),
  and its FAQ says "Starter, Pro, Team" (`:2017`). The template told 13 subagents to
  preserve a vocabulary the source does not use.
- **Engine identity.** `"translator": "claude-opus-4-7"` is typed into the
  `_meta.json` shape (`:99`), so a run on any other engine records the wrong engine.

What the counts cost is measurable. `node scripts/i18n/check-guide-translations.mjs`
reports **19 topics missing in every locale**: all eight in `companion.ts` plus 11
added elsewhere since the bootstrap run (`cs/_meta.json` `translatedAt`
2026-05-16). The run predates those topics, so the template did not cause the gap.
But a run started from this template today would read ten files, stop at 102, and
report success against its own "expected: 10" and "expected: 102" (`:217-218`). The
done criteria are oracles copied from the same stale prose. The template also invites
the one silent loss it could have flagged: "Any topic where you intentionally left a
field shorter than the English source" is listed as acceptable (`:219-221`).

## The context is outside the key

The drift detector's key is `JSON.stringify({ title, description, body })` of the
English topic (`scripts/i18n/guide-source.mjs:145-147`). The template, the
do-not-translate list and the engine are not in it. The technique's last failure mode
can be read directly off this tree. The template was amended the same day in
`b3fe23f` (below). The detector was re-run after that commit and still reports
**871** drift entries, **637** topic-locale pairs fresh. Those 637 translations were
produced under the old tier-name rule and the false Hindi direction instruction.
They remain fresh indefinitely, because the key cannot tell a better context from
the same one.

## The same-day amendment (`b3fe23f`)

An apply pass on 2026-09-14 amended the template. This reading is of its commit
message and diff only, not of a run. The amendment:
- corrects the file count to 11 and adds `companion.ts`
- takes the topic count from the source-hash manifest, so the pipeline attaches a
  derivable field instead of the writer typing it
- removes the Hindi claim
- adds a unit-context block (action, surface and audience, units and siblings)
- adds a `<PLURAL_CATEGORIES>` slot filled from locale data
- requires a shorter field to be flagged with a reason
- moves the do-not-translate lists into `docs/i18n/glossary.md`, with the three
  tier-name sets recorded as UNRESOLVED instead of chosen

The residue against the technique:
- **Occurring terms are still filtered by the engine, not the pipeline.** "For each
  unit, apply the entries that occur in that unit" asks the model to do the
  pipeline's job over the whole list.
- **The key is unchanged**, so the amendment moved zero pins (above).
- **No per-locale map was added.** Czech still reaches the engine with only its plural
  category names.
