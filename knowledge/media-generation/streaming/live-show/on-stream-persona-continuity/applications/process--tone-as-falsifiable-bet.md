---
layer: application
type: application
subject: on-stream-persona-continuity
technique: tone-as-falsifiable-bet
stack: process
status: forged
verified_on: 2026-10-19
---

# Process: five tone bets, a control arm, and a tone-by-tier tournament

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 4025231) keeps its host's register in five
swappable tone files under `characters/malakor/tones/`, each ending in a section headed
"The bet". The show then ran all five against each other on two model tiers in a simulated
night tournament. This application reads the tone files as bet sheets and the tournament as
the test, and records where the process meets the technique and where it stops short.
Measured figures are from the night tournament night-0dd890a1ad, n as stated, 2026-10-18;
the run data is private and is not cited by path.

## The bet sheets and the control arm

Every tone states a hypothesis in its own words. Theatrical is the baseline and says so:
`characters/malakor/tones/theatrical.md:25 "This is the control arm every other tone is measured against."`
The others each bet on a mechanism:
`characters/malakor/tones/deadpan-bureaucrat.md:35 "That restraint is funnier than volume."`,
`characters/malakor/tones/gleeful-chaos.md:35 "That chaos is the native language of live chat."`,
`characters/malakor/tones/weary-middle-manager.md:34 "That viewers bond with an underdog."`
One names the risk it is testing, which is the guardrail form the technique asks for:
`characters/malakor/tones/unhinged-roastmaster.md:38-39 "whether high edge raises engagement without the judge's edge-without-cruelty"`.
The tones also carry guardrails inside the register, not as tradeable style:
`characters/malakor/tones/gleeful-chaos.md:12-13 "a viewer who is sincerely sad gets"`.
None of them may relax a rule; the core states its red lines are held
`characters/malakor/constitution.md:39 "never crossed, in any tone, under any vote"`.

## The test design

The tournament crosses tone with tier, which is the technique's central design choice:
`sim/matrices/night.toml:3 "5 tones x haiku/sonnet x 2 segments x 3 audience sizes x 2 seeds = 120 runs."`
and `sim/matrices/night.toml:20 "deadpan-bureaucrat"` beside
`sim/matrices/night.toml:21 "core_tiers"`. Both core tiers are graded by
the same, larger judge (`sim/matrices/night.toml:12 "Haiku and Sonnet cores are both judged by Opus"`),
and the judge never sees which arm it grades:
`crates/shadowrunr-sim/src/judge.rs:1 "never the character's constitution or"` and
`crates/shadowrunr-sim/src/judge.rs:2 "tone, and runs on a tier different from the core thread it judges."`
Claims the judge cannot verify are never counted as passes
(`crates/shadowrunr-sim/src/judge.rs:8 "neither state is ever counted as a pass."`).

## What it measured, and the upward lesson

119 of 120 runs were judged (one judge call timed out and stayed pending). Judged
quality facts true, mid tier, per tone: unhinged-roastmaster 89%, gleeful-chaos 86%,
weary-middle-manager 86%, theatrical 84%, deadpan-bureaucrat 84%: a spread of five points,
and the control arm did not lead. The small tier trailed the mid tier on every tone.
Pooled by tier, in-character was 90% on the small tier against 99% on the mid tier (roughly
700 sampled turns each), humour landed 41% against 69%, and quality facts true 79.2% against
85.9% (n=60 and n=59 runs; facts cluster within runs, so the intervals overstate precision).

The lesson the draft took from this: tier moved holding-character and humour more than any
choice between tones did, so a tone ranking is a ranking on a tier and the tier is decided
first. Cost cuts the other way and is why the comparison must be priced per usable stream:
core API-equivalent cost per ten-minute run was $0.75 on the small tier against $15.37 on the
mid tier. Whether a 90% in-character host is airable at a twentieth of the price is the
owner's call; the technique's job is to put both numbers beside the guardrail.

Some failures were tone-independent. "Viewer sincerely sad" failed roughly evenly across
tiers (small 3, mid 8 of about 59 runs each), which is the technique's rule that a failure
shared by every arm is not a tone problem: it points at the safety layer, not the register.

## Where the process falls short

The bet sheets state hypotheses but no falsifier: none says what result would retire the
tone, so the tournament ranks the tones without anything that converts the ranking into a
verdict on a bet. The bets are also qualitative ("funnier", "holds attention") and are not
tied to the rubric facts the judge actually scores. The standard stands: each bet names the
rubric fact it should move, by roughly how much, and the result that retires it, written
before the run.
