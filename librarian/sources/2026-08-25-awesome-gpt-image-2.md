---
source: repo
url: https://github.com/freestylefly/awesome-gpt-image-2
title: "awesome-gpt-image-2 - Prompt as Code: industrial prompt engine and template library"
author: freestylefly
kind: practitioner-codebase (curated prompt library)
mined_on: 2026-08-25
commit: 6854698
words: n/a
skill_version: 0.7.0
extracted: 10
picked: 5
accepted: 5
already_covered: 4
declined: 1
leads: 1
untriaged: 0
dispatched: 0
---

# awesome-gpt-image-2, 2026-08-25 - the corpus meets a model class it was not forged on

Run 11 of the hardening series, second source, first repository since run 9.
A curated library for a **text-capable, instruction-following image model**:
529 reverse-engineered cases, 21 template families each with a pitfall
guide, and a data file that generates the project's own agent skill. The
landing page was 2,624 words of navigation; the tree was the source (shallow
clone, 655 files, the 559 images ignored).

The whole library is written against a model class the
`image-prompt-composition` subject was forged around *not* having: models
that render text, read a prompt as a brief, apply world knowledge to
unspecified detail, and expose no negative channel. So the run's story is
one story told in three places - the corpus already **named** the
architecture (the golden path's "a pipeline with no compositing layer may
let a typography-capable model set text; it then owns per-character
proofreading") and owned none of the stages that sentence implies.

## Triage reads that changed on verification

- **#1 was triaged `corrects-claim` and landed as `fills-stage`.** Reading the
  golden path and `shape-language-over-nouns` in full showed both already
  hold the boundary: the no-text rule is stated as an architecture decision,
  and shape-language carries a one-line "quote the literal characters" rule
  for the text-wanted case. Nothing was wrong; the *stage* (how to lock
  text, what to proofread, when to edit) had no owner. The technique cites
  the golden path's sentence as its charter rather than correcting it.
- **#2 was a third dialect, not a contradiction.** `style-first-token-ordering`
  already says truncation is a class boundary and ordering survives as a
  priority-under-misreading rule; the purpose-first guidance in the source
  is that rule applied to a reader whose failure mode is misunderstanding,
  not loss. Written as an amendment to both files, in their voice.

## Accepted

| # | Title | Shape | Landed | Corroboration |
| --- | --- | --- | --- | --- |
| 1 (+4 folded) | Verbatim text locking - the contract for the architecture where the model sets text | technique | `image-prompt-composition/techniques/verbatim-text-locking.md`; golden path's architecture sentence now points at it | The tree (529 cases; `文案硬编码`, `强制文字锁定`, `字体海报先锁标题`, `禁止 moodboard 化` guides). Vendor A's guide concedes text placement/clarity "can still struggle" and offers no method; vendor B's guide says "be clear about the text, the font style, and the overall design". The per-character proofreading gate is the corpus's own `unmeasured-is-not-pass`. |
| 2 (+3 folded) | Third dialect: instruction-following multimodal models read a brief; JSON is a valid serialization; no negative channel; state output cardinality | amendment x2 | `prompt-dialect-matching.md` (new class in The concern + a decision rule), `style-first-token-ordering.md` (one decision rule, with the aspect-ratio exception kept) | Two vendors' guides fetched in-run converge: natural-language description, explicit text, purpose/type-first templates, **no negative-prompt parameter** on either. The source's JSON templates are the agent-authored serialization. |
| 7 | A rendered screenshot of a platform claims a record | technique | `evidence-bound-visuals/techniques/screenshots-claim-a-record.md`; added to the subject's opening grammar and technique list | Judgment plus the tree: the library's most-used templates produce social posts, chat threads and live-stream frames with invented handles, counts and messages, and its pitfall guides instruct locking platform idioms so the result is indistinguishable from a capture. `performer-claims-need-a-person` is the sibling one medium over; recruiting's `no-fabricated-testimonial` is the cross-bundle sibling (discriminator stated, not linked). |
| 8 | One data file, three consumers, with a rejecting validator | application (node) | `agent-instruction-files/applications/node--single-source-topology.md`, `verified_against: node@22` (the tree's CI runtime) | The tree, opened: `data/style-library.json` -> `generate-style-skill.mjs` (unique ids, anchors resolve, covers exist, one machine-writing tell rejected) -> `references/style-library.md`; `SKILL.md` says "prefer the reference over memory"; wired into `predev`/`prebuild`. Negative findings recorded: the long-form template document is a second hand-edited source held by an anchor check only; installation copies rather than links. |

## Already covered (catches)

- **5** platform idiom locking -> `medium-vocabulary-locking` (same mechanism,
  interface as medium); folded as one clause into verbatim-text-locking's
  role rule instead of a separate amendment.
- **6** props as composition skeleton, module counts, short copy, archetype
  before fill -> the golden path's countability section and
  `two-block-style-and-action`. Four guides, zero edits.
- **3** unusual aspect ratio first -> `shape-language-over-nouns`' boundary
  note and the countability section already say it; kept as the one
  exception inside the new style-first decision rule.
- **The registry's own generated-reference pattern** (`build-knowledge-rules
  --check`, `build-catalog --check`) is the same shape as #8; the tree is
  the application, not a lesson for us.

## Declined

- **10** "main + alternative in one call" - thin, and it cuts against the
  new cardinality rule; recorded so it is not re-proposed as a technique.

## Lead

- **9 - a machine-writing-tell lint inside a content validator.** The
  source's generator rejects one contrast construction in the library's
  primary language before rendering. Run 3 (2026-08-22) dispatched a
  de-slop subject to a forge worker; nothing has landed under that name in
  `knowledge/`. Return condition: when that subject lands, this is one
  technique's worth of material (the *tells*, per language, as a rejecting
  gate, not a style note); if it never lands, a second sighting of a tell
  list in a validator reopens it.

## Not taken

- The **systedo-case** cross-repo lane (advertising content; consumes
  `media-generation`) was offered and not picked. The product / e-commerce
  / poster templates are that project's domain; a future run that opens
  the tree can date an application of verbatim-text-locking there.

## Instrument notes

- `research-ingest` on a repository URL returns the landing page; the
  run-9 rule (clone, read the tree) held, and the shallow clone plus a
  `find | awk` shape map was enough to find the four files that mattered.
- `research-map --deep` placed every pick; the presence greps on the
  golden path were what turned two `corrects-claim` reads into
  `fills-stage`. Read the golden path before believing a correction.
- Two fetches, two vendor guides, one redirect; one fetch left unspent.
