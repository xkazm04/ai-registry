---
source: batch
kind: batch
url: "youtube:9oCppy1gZpo"
urls:
  - https://www.youtube.com/watch?v=9oCppy1gZpo
title: "Story before shots, /shift batch of 1 video"
author: "1 channel (AI Samson), sponsored by the hosted agent it demonstrates; second sighting after 2026-11-06-reference-artifact-for-identity-and-motion"
words: 3162
extracted: 11
accepted: 0
declined: 0
leads: 1
already_covered: 6
untriaged: 4
dispatched: 0
applied: 0
shipped: 0
run_id: shift-story-before-shots
siblings: 1
fetches: 1
rescan_when: the operator gives the 2026-11-09 hero takes a plot-only verdict (instrument P1 below), or R18's paper brief gets its verdict; or 8 weeks elapse (2027-01-05)
---

# Story before shots, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `story-before-shots`, board run `shift-story-before-shots`. The
question: what must be settled before any shot so a viewer cares what happens, and where does the
operator sign it off before stills or GPU? This is the operator's live gap: boards were rejected for
beats with "no potential", R15 (The Vault) was dropped for "not interesting plot", and the 27 hero takes
kept on 2026-11-10 were kept only as lessons, the operator expecting none to reach the final cut.

One video, one voice, read whole from cached captions (3,162 words to [00:21:33], including the
finished film's spoken lines [00:17:55]-[00:18:56]). The film's first 2.5 minutes are uncaptioned
music, and nothing on screen was watched. The miner spent one fetch, on the linked prompt pack: it is an
email sign-up form with no stated licence, and nothing was submitted, so every rule and prompt below
comes from the transcript. The lander spent none. No GPU, no download. Phase 7.7: gate=skipped.

**Class.** A first-party practitioner account in build-walkthrough form, sponsored by the hosted agent
it demonstrates. The story half ([00:00:26]-[00:07:58]) is first-party and does not depend on the
sponsor. The production half ([00:08:16]-[00:14:54]) is the sponsor demo, and nothing in it survives
the strip test with a measure.

**Expected yield, stated first:** catches on beat theory (the craft is textbook and the corpus holds
most of it), one finding about where a story is checked rather than what a story is, and a remake.
**Actual:** 0 accepted, 1 lead with a spec, 6 catches, 4 untriaged, one held replica row. No corpus
file changed. **Voices:** one channel, so no convergence.

## What landed

This note, its ledger lines and one held replica row, `shift-replica-r18-vault-brief`, whose paper
stage is a hard stop for the operator. No corpus file and no project file changed.

## The finding: the paper door exists, and it shows the wrong fields

The plan read gravitone's stage table as having no story step before hero. **The tree says otherwise.**
Gravitone at `407f0aec` (read only; the lander re-opened each file below) starts a Production only from
an outline the operator marked `approve` in the dated scout-outlines `verdicts.json`, through
`approvedOutlines()` in `lib/foundry/scout/concepts.ts`. The verdict set is `approve`, `iterate`,
`drop`. On 2026-11-09 the operator approved 28 of 30 outlines and dropped 2. On 2026-11-10 the hero
takes were judged 27 keep and 1 drop, with one note for all of them: kept for rework and lessons, none
expected to reach the final cut.

**So the paper gate exists, and it passed 28 plots the operator later judged weak.** The defect is what
an outline puts in front of the operator, not whether a door exists. A second door with the same
contents would pass the same plots. Every outline row carries `title, logline, beats, spec, look,
why_interesting, fit, risk` (30 of 30; the lander confirmed the keys). The source's order asks for
fields none of them hold:

| Brief field, in the source's order | In the outline? |
| --- | --- |
| A named protagonist with a **want** [00:00:26], [00:05:43] | No field; a logline sometimes implies one |
| What they are **afraid of losing** [00:00:26] | No field (0 of 30 rows mention fear) |
| A **reason to care**, placed before the conflict [00:07:03] | No field and no position rule; beat 1 is labelled `Hook`, an attention device |
| The **turn as a choice** by the character who wants, costing that want | `Turn` is a beat, usually an event that happens to the scene |
| **World rules** as a short never-break list [00:03:07]-[00:04:50] | Partly: `look` and `spec` |
| Why it is interesting | `why_interesting` argues the device in all 30 rows, never a person |

**The finished film corrects its own maker's beat list.** The spoken list ends at the android's
decision to delete herself [00:07:58]. The cut ends on the man's choice instead: he cancels it,
giving up the certainty he wanted [00:18:30]-[00:18:56]. The turn lands on the character whose want
was stated first, and the choice costs him that want. That is checkable on paper, and it is the turn
field of the brief.

**R15 read against the same checks** (its `plan.md`, local): world rules yes (steel-teal, one gold
accent, 2.39:1); a turn yes ("When does it open?" "It doesn't."); want thin (open a vault, no reason
given); fear of losing none; reason to care none (shot 1 is two thieves at the door); the turn is not a
choice, because the vault simply wins. Every check the rules and the turn do not cover was empty, and
it was empty on paper before 107.9 GPU minutes were spent. One case, read after its verdict: it supports
the reading and does not prove it.

**Counter-evidence, stated plainly.** The miner sorted the 30 outlines by these fields from logline
and beats alone (one unblind reader): 12 device-first with no protagonist, 9 with a want but no fear
and no care beat, 9 closest to the full brief. Three Miles has a want, a clock and a rescue, and it is
the one hero take the operator dropped. Field presence is not sufficient, and nothing on disk says
whether it predicts taste: **no operator verdict yet separates plots by plot.** That is instrument P1.

## Candidates

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| 1 | A film brief is signed before stills and holds protagonist, want, fear of loss, a care beat before the conflict, the turn as a choice costing the want, and world rules; the paper gate shows these fields, not beats alone | [00:00:26]-[00:07:58], [00:18:30]-[00:18:56]; gravitone `concepts.ts:73-74`, `:126` | Lead, with a spec; escalated (E4) | Below. No subject in `media-generation/narrative-craft` owns a fiction short-film premise (its six are factual explainer, ad, trailer, data video, creator voice, engine selection). Nearest: `ad-concept-development` (concept locked before frames), `production-pipeline-phasing` |
| 2 | The turn lands on the wanting character's choice, and the choice pays for the resolution | [00:18:30]-[00:18:56] | Already covered (for games) | `ending-first-narrative-structure`: the decisive act is a decision the character makes, and the final card shows the price. For film it folds into row 1's turn field |
| 3 | Theme as an unanswerable question, answered by the final choice and never said aloud | [00:05:43]-[00:06:38] | Already covered | `ending-first-narrative-structure/theme-carried-by-structure` |
| 4 | World rules as a short never-break list: location, light, three colours as hex, motif objects, camera | [00:03:07]-[00:04:50] | Already covered | `assigned-colour-roles` (a listed palette is re-cast; it goes further than three hex codes) and the style contract of visual-style locking |
| 5 | A character sheet, front, side and back, locks likeness | [00:01:21]-[00:01:46] | Already covered | `character-identity-continuity`; the same channel's 2026-11-06 note |
| 6 | Put the stills in order and look at the film before it exists, then animate one shot before all | [00:12:46]-[00:13:11] | Already covered | `production-pipeline-phasing` (cheap probe first), `storyboard-grid-conditioning`; gravitone already runs boards, hero, rough |
| 7 | Watch the cut, leave it a day, write every change in one prompt, fix only that | [00:14:26]-[00:14:54] | Untriaged (the edit-plan half is covered) | `edit-plan-over-regeneration`, `note-taxonomy-focus-scope-order` cover the one-prompt change list. "Leave it a day" is unmeasured habit |
| 8 | A checker agent reads each output against the locked rules and reports drift | [00:12:21], [00:14:01]-[00:14:26] | Untriaged | Not examined against `review-iteration-loops` beyond its technique names; no measure in the source |
| 9 | Hosted moderation refused a near-human robot body; an unmistakably mechanical redesign passed | [00:14:26]-[00:14:54] | Untriaged | Host behaviour; nothing left after the strip. The local video route has no such gate |
| 10 | The sponsor's second agent is "four times faster", and playbooks hold context across generations | [00:13:31] | Untriaged | Sponsor claim, no number shown, and no project uses the host |
| 11 | Build the world once and new stories are cheap | [00:13:36] | Already covered (in the project) | Gravitone channels and ventures are built this way; no corpus subject needed |

Rule each row ran under: row 1 under the Phase 5 score and its escalations; rows 7-10 untriaged with
their anchors; the rest are catches. Nothing was declined.

## Row 1: why it is a lead and not a landing

Score: GAIN 3 (a new subject: no fiction short-film premise subject exists, and `narrative-craft` holds
6 of 10, so V1 is clear). RISK 2: the craft half is training-data convergence (want and obstacle,
sympathy before jeopardy) and the gate half is a seam read in a tree, but the claim that the fields
would have changed this operator's verdicts rests on one unblind reading after the fact. COST 3.
3 - 2 = 1, below +3. **It is also E4:** a new subject is a forge dispatch, and a shift dispatches none
unattended. And the evidence that matters is the operator's taste, which no source can supply.

**Return condition:** P1's plot-only verdict separates kept plots from dropped ones by these fields, or
R18's paper brief is kept where R15 was dropped. Either earns the subject dispatch, attended, with the
spec below as its input.

**Spec for that dispatch** (`media-generation/narrative-craft`, slug to decide; a fiction short film
of 30-120 s on a generative route, not a factual explainer, an ad or a trailer). Proposed techniques,
each with the rule it must carry:

- **want-and-fear-premise:** a premise is a bind (a want the character cannot simply act on) plus what
  they are afraid of losing, stated before any look. A premise stated as a look or a device is the
  failure.
- **care-before-conflict:** one beat that gives a reason to care is placed before the first beat of
  conflict; an attention hook does not substitute for it.
- **turn-as-costly-choice:** the turn is a choice by the character whose want was stated, and the
  choice costs that want. An event that happens to the scene is not a turn.
- **brief-fields-at-the-paper-gate:** the operator's outline door shows the brief fields above the
  beats, with an empty field shown empty. It shows the gap and never blocks on it.

Boundaries it must not absorb: the ad subject's concept work (persuasion has a product, not a
protagonist), the factual subject's question stack, the game subjects' ending-first structure (cite as
the game-side twin, do not link across bundles). Open question for the drafter: whether this is one
subject or a section of `ad-concept-development` widened to narrative shorts; the boundary statements
of both decide it.

## Instruments for the operator

**P1, no GPU: a plot-only verdict, compared blind with brief fields.** The method has no backlog row
type for an operator review: a held media row is a `replica`, `proof` or `benchmark`, and this is none
of them. So it is recorded here as the named instrument, not banked.

1. The operator gives each of the 28 kept hero takes a **plot-only** verdict: keep developing, close or
   drop, one line each. The 2026-11-10 file holds a single note for all of them, so this verdict does
   not exist yet. One page, the takes side by side, the decision first.
2. Separately and blind to step 1, a seat fills the six brief fields for each outline from its text
   alone, leaving a field empty when the text does not support it.
3. Compare. If plot keeps cluster on full briefs, P2 is earned and row 1's return condition fires. If
   they do not, the source's frame does not explain this operator's taste, and that is a result too.

**P2, held until P1 says better: the gravitone seam, named and not edited.** An optional `brief` object
on an outline row (`protagonist, want, fearOfLoss, careBeat, turnChoice, worldRules`). The outline
schema is `.passthrough()`, so it is additive. The outline review shows it above the beats, empty
fields shown empty. The door stays `approve`, `iterate`, `drop`. At casting, `want` and `fearOfLoss`
carry into the role brief, so a role is cast against what the character wants as well as how they look.
The outline writer is not tracked code in the tree (a grep for `why_interesting` finds only the data
file), so the writer seam is open. No proof exists for any of this yet, so nothing ships.

**P3, banked: `shift-replica-r18-vault-brief`.** R15's own outline (The Vault, the scout S1-10 theme)
rewritten in the source's order, with R15's world rules and route kept, so the only thing that changes
is the plot. That gives the operator a same-theme pair at the end of the batch. **Its first stage is
paper**: the brief and beat sheet go to the operator as a page before any still or GPU job, and the
row is blocked until that verdict is recorded. The draft brief (original; the brand stays fictional and
off screen):

- **Protagonist:** Dara, 54, a safecracker. **Want:** one last job, the vault. **Fear of losing:** the
  old steel watch she times every lock by (her teacher's), and with it the ear that makes her who she is.
- **Care beat, before the conflict:** in the van, without a word, she opens Cole's cheap broken watch,
  sets it running and hands it back. It plants the payoff.
- **Rungs:** every hole Cole cuts, the door fills. She listens and hears the door ticking in time with
  her watch.
- **Turn as a choice costing the want:** the movement winds down and the iris starts to close with
  Cole's arm through the hole. She jams her own watch into the gears. It stops, crushed, and Cole pulls
  free. The vault stays shut.
- **End card:** dawn, empty-handed. Cole fastens his cheap watch, the one she fixed, on her wrist. It
  ticks.
- **World rules (R15's):** cold steel-teal, one gold accent for the movement only, 2.39:1, locked or
  slow camera.

The plan's original proof, a 40-45 s short with a new original plot, is weaker than this: a new plot
changes the theme and the plot at once, and R18 changes one.

## What the plan got wrong

1. "No story step before hero" is wrong: an operator door on outlines exists and passed 28 plots. The
   casting half stands: a role brief is written after `proven`, with no stated want or fear to cast
   against, because none exists upstream.
2. "The transcript opening stops near 8:00" describes the plan's excerpt, which `shift-plan.mjs` cuts
   at its opening word budget. The cached transcript was whole.
3. "What each of the five versions fixed" is not in the source. It names one fix, a host moderation
   workaround (row 9); the rest is "creative changes".

## Leads and untriaged tail

- **Lead: row 1** (above), with its spec and return condition.
- **Untriaged, not declined:** rows 7 ("leave it a day" before the edit list; returns when a second
  voice measures a delayed review against an immediate one), 8 (a checker against the locked rules;
  returns on a read of `review-iteration-loops` against it), 9 and 10 (host behaviour and a sponsor
  claim; return only if a project adopts the host).
