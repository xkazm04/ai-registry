---
layer: application
type: application
subject: proposal-quality-review
technique: placeholder-and-jargon-detection
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: three placeholder families in a deterministic proofreading pass

The grant-writing-nonprofits app (Wellspring) implements the
three-family split as data-driven pattern tables in
`src/features/proofreader/config.ts`, consumed by a pure compliance pass in
`src/features/proofreader/rules.ts` ("Pure — same input always yields the
same report", `rules.ts:84`).

## Family 1: deliberate AI fill-in slots

`FILL_IN_PATTERNS` (`config.ts:71-86`) matches bracketed label-like content:
`/\[(?=[^\]]*[A-Za-z])[A-Za-z0-9 #$.,/\-'&():;%]{1,40}\]/` — a lookahead
requiring a letter and a 40-char cap bound false positives, so `[1]` footnote
markers and long legitimate asides pass. The comment above the table
(`config.ts:65-70`) states the intent: the draft prompts "deliberately ask
the model to emit a bracketed [insert …] placeholder instead of inventing a
figure… they're EXPECTED scaffolding — checked separately with their own
actionable message, not lumped in with the sloppy markers below (which would
make every compliant AI draft read as 'full of errors')." The corresponding
issue (`rules.ts:171-186`) is still severity `error` — "you can't file
'[insert # served]' to a funder" — but its message reads "Replace each with
a real figure before filing", framing completion, not breakage.

The character class carries an incident scar (`config.ts:79-82`): `( ) : ; %`
were added after "[Insert outcome (e.g., 412 students)]" fell outside the
class and "a ship-blocking placeholder passed the gate as 'Clean'" — the
false-negative-in-the-character-class lesson, fixed while keeping the
letter-lookahead and length cap that guard precision.

The mirror rule lives in the gate library: `hasNumber`
(`src/lib/ai/critique.ts:94-98`) counts a bracketed placeholder as a number
slot — "the honest, anti-fabrication form of 'quantified'" — so the
quantification gate never pressures the generator to invent a figure.

## Family 2: sloppy markers

`PLACEHOLDER_PATTERNS` (`config.ts:89-97`): `TODO`, `TBD`, `lorem ipsum`,
the literal word `placeholder`, and the masked-figure pattern
`/(?<![A-Za-z])X{2,}(?![A-Za-z])/` — non-letter lookarounds so `20XX` and
`$XX,XXX` fire while `XXL` and Roman `XXVII` do not (the word-boundary
false-positive lesson, recorded in the comment at `config.ts:92-94`). These
surface as `error` severity with a blunt "unfinished placeholders" message
(`rules.ts:158-169`), deduplicated per pattern via labels.

## Family 3: vague filler

`VAGUE_PATTERNS` (`config.ts:100-107`) squiggles jargon at `info` severity —
"style, not blocking": `synergy` ("jargon"), `leverage` ("say what you will
actually do"), `world-class` ("unsubstantiated"), `game-changing` ("cliché"),
`cutting-edge` ("show, don't claim"), `very unique` ("unique is already
absolute"). Each finding carries the pattern's own note (`rules.ts:188-199`).
One term is additionally promoted in the generation-time rubric: `gNoLeverage`
(`critique.ts:209-216`) makes "leverage" a quality-severity gate on generated
drafts, mirroring the prompt's ban.

## The verdict stays honest about coverage

`runComplianceChecks` (`rules.ts:85-119`) returns a `coverage` record naming
which optional checks actually ran (`docChecklist`, `missionCoverage`, each
`"ran"` or a `skipped-*` reason). The rendering card
(`src/app/drafts/[grantId]/ProofreaderCard.tsx:36-48`) honors both flags: a
zero-issue report shows "Clean" only when `allChecksRan`, else "Limited
check" naming the skipped checks — after an incident where "only the doc
checklist was consulted, so a draft whose mission-coverage check silently
skipped… still got a green 'Clean' stamp." Placeholder detection thus sits
inside a report that can never confuse "no issues found" with "not checked".
