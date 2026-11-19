---
source: batch
kind: batch
url: "youtube:9U0W6FRNI7E"
urls:
  - https://www.youtube.com/watch?v=9U0W6FRNI7E
title: "Layout decision placement, /shift batch of 1 video from 1 channel"
author: "1 channel: Satori Graphics (first-party practitioner, tutorial form, redesigning his own mock pieces; sponsored segment skipped)"
words: 2318
extracted: 10
accepted: 0
declined: 0
leads: 3
already_covered: 2
untriaged: 5
currency: 0
dispatched: 0
applied: 0
shipped: 0
held: 0
run_id: shift-1119-ldp
siblings: 3
fetches: 4
rescan_when: a second voice states the decision-point rule for procedures or instructions (rows 1-2); or a fleet project takes print, poster or thumbnail layout work (rows 5-9); or the supervisor approves a gpu-bank.md edit and the sibling's scripts/tests/shift-review.test.mjs edit is committed (row 3); or 8 weeks elapse (2027-01-14)
---

# Layout decision placement, mined under /shift, 2026-11-19

Plan `plan-20261119-072526`, cluster `layout-decision-placement`, board run `shift-1119-ldp`. The
question: where does a page put what the reader needs at the moment they decide? One miner read the
transcript whole. No GPU, no download, no render. Phase 7.7: gate=skipped.

- **V** = `youtube:9U0W6FRNI7E`, Satori Graphics, "NEW Layout Techniques That Feel Like Cheating!"
  (2,318 words, 12:04, 2026-11-17). A designer redesigns his own mock poster, spread, exhibition wall
  and noodle pack on camera, before and after. Sponsored segment [00:05:30]-[00:06:50] skipped.

**Class and expected yield, stated first:** a first-party practitioner account. He is a reliable
witness to what he chose and no evidence of what works in general: each move is shown once and judged
by eye. Expected: catches, one or two leads, no accept. That held: 0 accepted, 3 leads (two escalated,
one tooling proposal), 2 caught, 5 untriaged.

**Voices.** One channel, so no convergence inside the cluster. Row 2's convergence is across earlier
runs in the corpus, not inside this batch.

**Admission.** The **+3 bar** governed rows 1, 2 and 6, the three scored rows. It comes from `/intake`
Phase 5 Step 3 (its v2.21 paragraph) and Step 4 as they stand, read against `SCORECARD.md`: the last
nonzero fp is 2026-11-11 document-understanding (fp=1); the step-down needs three runs whose rejected
rows a later run re-derived without reading the bank, and none is recorded. A step is a method edit,
never a lander's setting, so +3 stands. Row 2 is the row the bar decides: +2 would have cleared it on
score, and E3 holds it either way. `auto=0/2/1`. **fp=1**: the miner's one accept (row 3) died at this
read, not because its claim was false (the code says what the miner says) but because the rewrite test
was not run: the change falsifies a sentence in the shift skill's own spec (below). Rows 5, 7, 8 and 9
are V2 vetoes, recorded untriaged and not scored.

## What landed

This note and its ledger lines. No corpus file changed, no code changed, no project touched, no row
banked.

## What the promotion read found

The lander opened `scripts/shift-review.mjs` (lines 54, 108-116, 147-176), `scripts/tests/shift-review.test.mjs`
(80-90, 185-192), `.claude/skills/shift/references/gpu-bank.md` § The rolling review page, the four
techniques row 2 cites, `legibility-floor`, `scan-path-hierarchy`, the technical-writing taxonomy and
laws, gravitone at 6b9802d4 (`scout` SKILL.md:274, `music-video` SKILL.md:108), and fetched both style
guides row 1 cites.

- **Held.** `pickRules()` prints what tie and neither do only after the last pair; `DEFAULT_DECIDES`
  says "What each answer does is under the pairs"; the test asserts the reason comes before the outputs
  per pair. Gravitone makes no print, poster series or thumbnail (scout:274, music-video:108), so the
  plan's gravitone consumer is refuted. Technical-writing has no procedures subject and its categories
  have room (2, 1, 2, 1 subjects), so V1 does not bite row 1. Visual-generation holds 9 of 10, so a
  print-layout subject would fill it. Both style-guide quotes read verbatim.
- **Contradicted (row 3).** `gpu-bank.md` specifies the page's order: "the question in plain words,
  and per pair what it decides, the blind outputs side by side, and one radio group ... **Then what
  follows from each kind of pick.** Numbers last." Moving `pickRules()` above the pairs makes that
  sentence false, so the change is a rewrite of a spec under `.claude/skills/shift`, which a lander may
  not edit. Contention as well: another session holds an uncommitted edit to
  `scripts/tests/shift-review.test.mjs` (V5, defer). So it is a proposal.
- **Narrowed (row 2).** Three of the four cited techniques place a thing at the decision:
  `contest-door-at-the-point-of-decision`, `mid-body-anchor-cta` ("placed where the reader's need
  peaks"), `demo-badge-beside-the-number` with marketing law `provenance-is-binary-and-labelled`. The
  fourth, `refusal-names-a-reachable-remedy`, is about the remedy *working* where it is read, which is
  reachability more than placement: partial.
- **Found by the read (row 1).** Google's guide also says "State the action first and the
  justification second." So the primaries split what governs the action (before it) from what explains
  it (after it). That is the discriminator the proposed wording needs.

## Candidates

Rule column: "Phase 5, +3" for scored upper-layer rows; "corroboration table" for leads; "catch" for
rows the corpus already holds.

| # | Candidate | Voices | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A choice that changes how a step is done belongs inside that step, before its action | V | [00:10:01]-[00:10:56] | Lead, escalated E4, raw 4/1/XL | Phase 5, +3 | GAIN 3 new subject +1 convergence (two primary guides fetched by the miner and re-fetched here order location and goal before the action). RISK 1: partial support, neither guide says "inside the step". No procedures subject; technical-writing covers articles. A subject is a forge dispatch, so E4 |
| 2 | Put each detail where the reader acts on it (root) | V + 3 earlier runs | [00:10:56]-[00:11:24] | Lead, escalated E3, raw 3/1/2 (+2) | Phase 5, +3 | Law candidate; V3 passes on cross-run convergence (three techniques in recruiting and marketing, a fourth partial). No domain law states the root, and no cross-domain home exists. Below +3 and a new law: the operator's call |
| 3 | On the verdict page, state what tie and neither do above the pairs | V (applied to our tooling) | `scripts/shift-review.mjs` 54, 108-116, 170-174 | Lead (tooling proposal), not scored | none (not a corpus layer) | Miner's accept. Falsifies `gpu-bank.md` § The rolling review page; test file contended. Proposal below |
| 4 | Shrink the design to its viewing size first; decide what reads in the first second | V | [00:03:35]-[00:05:03] | Already covered | catch | `legibility-floor` step 6 "Review at actual phone size"; technical-writing law `check-the-page-where-it-is-read`; `angular-legibility-floor` |
| 5 | Give two must-reads one focal point (the date over the face) | V | [00:04:05]-[00:05:10] | Untriaged | V2 | By eye, nothing fetched. Not against `one-function-per-visual`, which counts jobs, not objects |
| 6 | Avoid near tangencies | V | [00:02:15]-[00:03:35] | Untriaged, raw 3/2/XL (+1), E4 | Phase 5, +3 | No print-layout subject; HOME IF NEW `media-generation/visual-generation` (9 of 10). No fleet consumer |
| 7 | Squint-test visual weight, not only flow | V | [00:01:00]-[00:02:15] | Untriaged | V2 | `aaa-craft-rubric-authoring` squints key poses for the action, not for weight |
| 8 | Break the grid only where two things should interact | V | [00:00:00]-[00:00:53] | Untriaged | V2 | No home |
| 9 | Lock type and colour across a series so crops can vary | V | [00:06:50]-[00:08:40] | Untriaged | V2 | `visual-style-locking` locks a style but names nothing allowed to vary. No poster series in the fleet |
| 10 | Line up answers to one repeated question in one column | V | [00:08:40]-[00:10:01] | Already covered | catch | `designed-comparison-tables`; `scan-path-hierarchy` "Consistency is the hierarchy" |

## Leads

- **Row 1, procedures.** Proposed wording for a future procedures subject in technical-writing, no
  proper nouns: "A condition, choice or warning that changes how a step is performed is part of that
  step, stated before its action. What only explains the step may follow it. Test an instruction set by
  following it in order, as its reader will: at each action, ask whether anything still below could
  change it; if so, move it up into the step." Primaries: Microsoft Writing Style Guide, "Make sure
  that customers know where the action should take place before you describe the action"; Google
  developer documentation style guide, "When a step includes a goal, state the goal before the action"
  and "State the action first and the justification second". Not fetched: the IEC/IEEE 82079-1 rule on
  safety notices before the step (training data only). **Return when** a second voice states the
  in-step rule, or the operator dispatches a procedures subject; fetch 82079-1 first.
- **Row 2, root law.** "Walk the reader's order; at each choice, everything that could change it is
  already in view." **Return when** the operator decides a home: technical-writing `_laws.md`, or a
  cross-domain home, which does not exist.
- **Row 3, tooling.** Below.

## Proposals (not landed)

- **`scripts/shift-review.mjs`, `blindSection()` (row 3, size S).** Emit `${pickRules(manifest.landing)}`
  right after the question line and before `${pairs.join('\n')}`; change `DEFAULT_DECIDES` to "What each
  answer does is above the pairs."; add one assertion to `scripts/tests/shift-review.test.mjs` that
  `<div class="card plan">` comes before the first `<fieldset`. The existing assertions at 86-89
  (`lastIndexOf` before the landing text) and 189 (prefix match) still hold, and blindness is untouched
  because `pickRules` carries no arm. Why: choosing neither over tie re-owes a GPU proof, which is a
  detail that should be read before the choice. **Depends on** two things: an edit to
  `.claude/skills/shift/references/gpu-bank.md` § The rolling review page ("Then what follows from each
  kind of pick" becomes "then what each kind of pick does, then per pair ..."), which is the
  supervisor's; and the sibling session's uncommitted `shift-review.test.mjs` edit landing first. No
  honest A/B: one operator who has used the page since 11-08. Proof is structural plus the next verdict
  session.
- **Row 2.** A law is never landed unattended (E3).

## Replication

Nothing to remake. The source shows his own design work but no generated output and no prompts, and no
row's use is a picture.

## What the plan got right and wrong

- **Right:** cheap, strike-likely; catches and one or two leads; no print-layout subject.
- **Wrong:** gravitone thumbnails and posters as a consumer (refuted at gravitone 6b9802d4). "Decision
  first" is not new for the shift's pages: it is already applied per pair and asserted by a test, and
  the shift's own spec put the pick rules after the pairs on purpose. Row 3 is the one gap.

## Plan homes

Rows drew on `data-video-art-direction` (`legibility-floor`), `seated-in-world-reading`
(`angular-legibility-floor`), `cv-presentation-and-parseability` (`scan-path-hierarchy`),
`frame-direction` (`one-function-per-visual`) and `figures-and-tables` (`designed-comparison-tables`).
`image-prompt-composition` and `medium-format-fidelity` drew no row beyond the law
`check-the-page-where-it-is-read`.
