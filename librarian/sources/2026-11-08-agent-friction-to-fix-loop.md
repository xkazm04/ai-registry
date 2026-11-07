---
source: batch
kind: batch
url: "youtube:OqNWvYsQXzE, youtube:lDRjsHjkbjI, youtube:hO4ft4tGOJI"
title: "Agent friction to fix loop, /shift batch of 3 videos from 3 channels"
author: "3 channels: The AI Automators; Kent C. Dodds; Prompt Engineering"
words: 8605
extracted: 38
accepted: 2
declined: 0
leads: 7
already_covered: 15
untriaged: 10
dispatched: 0
applied: 1
shipped: 0
run_id: agent-friction-1108
siblings: 2
fetches: 15
---

# Agent friction to fix loop, mined under /shift, 2026-11-08

Plan `plan-20261107-120659`, cluster `agent-friction-to-fix-loop`. Decision asked: what agents
must report at the end of a job, who checks a change independently, and how far a self-improving
loop may edit itself. Phase 7.7: gate=skipped (unattended shift); nothing was asked. No project
tree was changed. No GPU, render or project test suite ran.

**Voices.** A = The AI Automators (2,013 words; first half a second-hand paper review, second half
the author's own friction log). K = Kent C. Dodds (3,948 words, with his public repository read at
`c266fb28`). P = Prompt Engineering (2,644 words, with its MIT repository read at `f73ad8ab`). A
also names a public `retro` skill from a fourth author; a miner fetched it and the lander re-read it
raw. **A cites that skill, so A and retro are one line of descent. The independent channels on the
friction report are two (K; A with retro). P is silent on it.** Our own `/perfect` LESSONS 2.9.0,
which K's miner counted as a second author, is a fleet record and corroborates without being a
channel, as in the 2026-11-06 batch.

**Expected yield,** stated by the miners: one decision rule with catches (A), one technique or
amendment and catches (K), catches and a dated fact (P). The plan expected one technique or
amendment on friction reporting. Miners accepted 4 rows (two of them the same change). Two landed.

**Accept bar.** Every Phase 5 score below ran at **GAIN - RISK >= 3**, the shift's raised threshold
(Step 4, fp=1, 1, 1, 2 and 4 on the day's scorecard rows). The skill row is formally "judgment, no
gate" in the corroboration table; the dispatch asked for it to clear the same bar, and it was scored
the same way.

## Triage

Row ids carry the video letter. Merged rows name both. Rows not admitted keep the miner's score and
were not re-read unless the promotion read below says so.

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| A1+K2 | Builders report friction; the wrap drains it by cause | A [00:06:17]-[00:07:37]; K `friction-log.md` "When to file"; `builder-brief.md` final report | 2 independent (K; A+retro) + fleet record | skill, Phase 5 at +3 by dispatch | real gap | 3/0/1 | **accept, landed as perfect 2.11.0** |
| A2+K1 | Friction on a passing run: ask at the end, admit by recurrence, separate channel, drain by cause | as above; retro `SKILL.md` | 2 independent + fleet record | technique, Phase 5 | real gap | 3/0/2 | **accept, landed in `agent-instruction-files`** |
| P1 | The Director's landing costs join the same grouping | P README results table; `recorded-run.json` filesChanged; `SKILL.md` Phase B step 8 | 1 tree (P) + A's weekly pass groups failed jobs too (prose) | amendment to the skill row, Phase 5 | partial | 2/0/1 | untriaged, was accept. Proposal 1 |
| A3+K3 | Personas harness: unfiltered learnings fed whole into every prompt | `executor.ts` `appendAgentsMd`, Accumulated Learnings section; `docs/harness/harness-learnings.md` 523 lines, last entry 2026-07-10 | 2 miners, 1 tree | catch, counter-specimen | catch | n/a | covered by `write-back-sink-class` and `line-earning`; cited as the counter-case in the new technique. K's code accept not taken: dormant loop, operator ruled it out |
| A4 | A self-improving loop edits by blast radius; guardrails human-gated | A [00:07:37]-[00:08:56] | 1 | catch | catch | n/a | covered: `memory-governance` § write lanes tiered by stakes |
| A5 | Optimise only recurring flows | A [00:09:23] | 1 | technique, Phase 5 | thin | 2/2/1 | untriaged; open `procedure-promotion` first |
| A6+K7 | A different family reviews every commit | A [00:06:47]; K [00:10:09] | 2 (A, K); P opposite (same family caught the one real defect) | catch | catch | n/a | covered: `family-diversity-as-a-control`; uzi lead 13 now has three voices, one opposite |
| A7 | Weekly drift pass over the harness | A [00:07:12] | 1 | catch | likely catch | n/a | untriaged, homes read at use_when only |
| A8 | 654 weekly signals into at most 3 proposals | A [00:07:37] | 1, promotional segment | lead, table | thin | n/a | lead |
| A9 | Weekly reflection costs less than per task | A [00:06:47] | 1 | lead, table | thin | n/a | lead |
| A10 | The paper half: propose, probe, compose | A [00:01:42]-[00:04:41] | 1 | catch | catch | n/a | covered: self-evolving-harness run rows 1-3, 9-12 |
| K4 | A filing path that drops the marker is never drained | `friction-log.md` "File an entry" | 1 tree | catch | catch | n/a | covered: `write-back-sink-class` absent state; cited in the new technique |
| K5 | Grow the verification CLI from friction | K [00:07:38] | 1 | catch | catch | n/a | covered: `capability-before-steering` step 1 |
| K6 | A deterministic ship procedure beats a skill | K [00:09:19] | 1 | catch | partly unverified | n/a | covered: `procedure-promotion` |
| K8 | A self-picked risk tier gates auto-merge | K `ship-pr/SKILL.md` | 1 tree | correction, Phase 5 | partial | 1/2/1 | untriaged; open both homes first |
| K9 | Product calls park with a recommended fix | K [00:15:40]; `friction-log.md` "Daily sweep" | 1 tree | catch | catch | n/a | folded into the new technique's discriminator table |
| K10 | Every change names its cleanup | K [00:14:24] | 1 | catch | catch | n/a | covered: `human-performed-steps`, law `creation-names-reaper` |
| K11 | Instrument unknown-use code, delete next week | K [00:18:14] | 1 | catch | catch | n/a | covered: `dead-code/deletion-protocols` |
| K12 | Agent-created feature flags with metrics | K [00:12:43] | 1 | lead, table | thin | n/a | lead |
| K13 | Error webhook straight to an agent fix | K [00:16:32] | 1 | lead, table | thin | n/a | lead |
| K14 | A PR recap of primitives touched | K [00:08:28] | 1 | untriaged | not mapped | n/a | untriaged |
| K15 | Restore drills as the last guard | K [00:13:34] | 1 | untriaged | generic | n/a | untriaged |
| P2 | Isolated branches appending to one shared file conflict; price it | P README "7 of 9 conflicted ... $6.37" vs "$3.67"; filesChanged | 1 tree + README prose | amendment, Phase 5 | partial | 1/1/1 | untriaged, was 2/1/1. Stays banked |
| P3 | A producer's test claim never gates | P [00:02:34]; `factory.ts` gate | 1 tree | catch | catch, corrected premise | n/a | covered: `claims-never-decide`, `verified-vs-self-reported-pass-rate`. The video's "once" is not in the record: 0 of 9 discrepancies in the recorded run (lander's count) |
| P4 | The diff reviewer caught what three test layers missed | P [00:12:15]; rehearsal issue 8 | 1 tree | catch | catch | n/a | covered: `unreached-decisions-pin-nothing` |
| P5 | Ticket-keyed claims let two lanes make one fix | `recorded-run.json`, `rehearsal-run.json` issues 3 and 7 | 1 tree | catch | catch | n/a | covered: `concurrent-vcs` golden path, `integration-door` |
| P6 | Integrator re-verifies after each merge | `integrate.ts` | 1 tree | catch | catch | n/a | covered: `integration-door`, `evidence-binds-to-the-measured-change` |
| P7 | One sandbox per agent | P [00:01:43] | 1 | catch | catch | n/a | covered: `physical-isolation` |
| P8 | Secret attached outside the sandbox on egress | P [00:10:29] | 1 | catch | likely catch | n/a | untriaged |
| P9 | Per-sandbox egress allowlist | P [00:06:04] | 1 | catch | likely catch | n/a | untriaged |
| P10 | Typed handoffs between stages | `factory.ts` | 1 tree | catch | likely catch | n/a | untriaged |
| P11 | A triage seat walks away from a vague ticket | P [00:07:22] | 1 | lead, table | thin | n/a | lead |
| P12 | A docs tool offered is rarely used: 2 of 9, 3 of 9 | `docsQueries` in both records | 1 tree | lead, table | measured, no outcome | n/a | lead |
| P13 | Sandbox platform price and boot time | P README | 1, sponsored | currency, table | dated fact | n/a | lead: no consumer, our loops run local |

Admission: auto=2/10/0, fp=2 (K3's code accept, and P1, which fell to +3).

## Scores, with what the promotion read changed

**A1+K2, perfect 2.11.0: 3/0/1, net 3.** GAIN 2 (a new step in a shared method, scored like a
technique outside the top 15) +1 convergence (K's tree and A, which reached the same end-of-job ask
without each other). RISK 0: the lander opened `builder-brief.md`, `SKILL.md` Phase W and step 8,
bp's overlay, the symlink, and both primaries. Both edits append: no standing sentence becomes
false. COST S.

**A2+K1, `friction-on-a-passing-run`: 3/0/2, net 3, GAIN 3 >= COST 2.** GAIN 2 (new technique;
`agent-instruction-files` is not in today's `librarian-scan` top 15, `agent-memory` is) +1
convergence. RISK 0: K's `friction-log.md` and `file-friction/SKILL.md` read raw at the pinned
commit, retro `SKILL.md` read raw, homes opened in full (`write-back-sink-class`,
`capability-before-steering`). A new file, so an append. Home not contested:
`write-back-sink-class` names this gap in its own words ("that is the collector's problem"), and
`agent-memory` owns who approves a rule change, which the technique links rather than restates.
A's miner had R = 1 because the retro file came through a summariser; the raw read removes it.

**P1, landing costs: 2/0/1, net 2.** GAIN 1 (a boundary case on the accepted step) +1 convergence
(P's tree shows the cost; A's weekly pass groups failed jobs with friction notes, so it too drains
signals no producer self-reported). The tree half is confirmed (below). Net 2 is under +3. It stays
a proposal with its wording, though it is cheap and the measure would test it in the same week.

**P2, physical-isolation price: 1/1/1, net 0.** The miner's +1 convergence was the home's own
replay, which already states the rule for ledgers, so it is not an independent reader of the new
half. The price rests on README prose: no integrator log is published. Stays banked. Return when the
integrator's log shows whether the conflicts sit only in the test file and the router.

| Claim | Result |
|---|---|
| K: the filing bar is durable, recurring, owned, reproducible; search before filing; park label; daily sweep eligibility | **Confirmed** in `friction-log.md` at `c266fb28`, read raw |
| A's miner: the recurrence filter rests on one voice | **Contradicted.** K's policy sets it too ("durable, recurring ... the next agent should be able to act without your session"). Two voices |
| A's miner: retro reviews seven environment categories, severity first, suggests only | **Confirmed** raw. Also `disable-model-invocation: true`: a person starts it, which is why it needs no recurrence bar (recorded as the discriminator) |
| K's miner: LESSONS 2.9.0 is an independent second author | **Narrowed.** gtai's lanes' "what blocked" sections were the loop's evidence, 12 of 12 accepted shipped. That shows the reports are worth reading, not that an end-of-job ask on a passing run works. Counted as fleet corroboration, not a channel. The score does not move, because K and A already converge |
| bp consumes the shared method | **Confirmed**: `bp/.claude/skills/perfect` is a symlink into this registry |
| bp has no vault | **Confirmed**: `bp/.perfect` absent, overlay `vault: []`, and `.perfect/` is in bp's ignore file, so the next run's `friction.md` is per-checkout |
| P: all 9 work reports list `test/basic.test.ts`, 8 list `src/server.ts`; the worker prompt says only "Add or update tests under test/" | **Confirmed** in `recorded-run.json` and `factory.ts` line 115 |
| P: 7 of 9 conflicted; integrator $6.37 against $3.67 | README prose only, first-party. Not checkable |
| P's miner: 0 discrepancies between worker and verifier test claims | **Confirmed** for the recorded run, 0 of 9. Rehearsal not re-counted |
| Fetches | Miners 2, 4 and 3. Lander 6 raw reads, retro `SKILL.md` at its default branch on 2026-11-08 and the rest at the pinned commits: K's `friction-log.md` and `file-friction/SKILL.md`, P's README, `recorded-run.json` and `factory.ts` |
| Personas: about 47 of 523 lines are tool gotchas | Lander's keyword count: 45 of 523. Last dated entry 2026-07-10. `appendAgentsMd` appends every learning, and the file is injected as "Accumulated Learnings" |

## Where the voices chose opposite defaults

| Question | A | K | retro | P | Discriminator |
|---|---|---|---|---|---|
| What is admitted | only what the next agent would hit | durable, recurring, owned, reproducible | everything, by severity | nothing collected | Whether an automatic drain exists. A person reading one retrospective can take everything; a drain needs the bar |
| Who acts | clear-cut file types fixed automatically; code and guardrails become human tickets | a fixer agent fixes dev contracts, parks product calls | the person | the person merges every PR | What the fix changes: dev tooling through normal review may be fixed by an agent; rules, gates and guardrails take a person (`memory-governance`); product calls park |
| Cadence | weekly batch, said to be cheaper | per job | on demand | n/a | Report volume. Neither cost measured |
| Reviewer family | a different family | three vendors | n/a | same family, and it caught the only real defect | One case does not refute family diversity. Not resolved |
| Merge authority | n/a | auto-merge low and medium on a self-picked tier | n/a | human merges, 9 PRs | Review volume against human gate capacity |

## What landed

1. **Technique `friction-on-a-passing-run`** in `agent-instruction-files`, linked from the golden
   path's prose and technique list. No proper nouns; the discriminator table carries the split.
2. **`skills/perfect` 2.10.0 to 2.11.0** (minor: a report field and a wrap step). The builder brief
   gains a lot-level `FRICTION` block, at most three lines or `none`. Phase W gains step 4: fold the
   lines into the vault's `friction.md` by cause, two sightings make a fix proposal, at most three per
   session; toolchain fixes become candidate directions through the normal gate; changes to the
   overlay's law, gates or vetoes, or to the skill, wait for `/perfect reflect` and the user, even
   unattended; product calls park. The vault tree and the brief-contents line name both.

## Phase 7.5

`friction-on-a-passing-run`, seam: `skills/perfect` 2.11.0, consumed by bp through the symlink.
Mode `experiment`, designed, **not run: verdict `unmeasurable`, owed against 2.11.0, not a result.**
The seam was chosen because it can falsify: bp's nights are long and unattended, so a bar that is
too loose (many lines, no repeats) or a brief that does not elicit (`none` on nights the Director's
own bullets call painful) would both show.

- **Before**, from what exists today: structured builder friction lines 0 (no field); recurring
  causes on record 1 (the engine-file contention, fixed in 2.8.0); single-builder friction that
  reached the method only because a Director saw it: the `add -p` stall, and in 2.9.0's gtai run
  the whole-tree hook failing builders about five times and an 850-commit base move. This is a floor
  from prose, not a recount: bp's past builder reports are gone with its vault.
- **Target**, over the next three or more `/perfect unattended` sessions in bp: (a) friction lines,
  (b) distinct causes, (c) causes seen twice or more, (d) of (c), how many reached `fixed <sha>`
  inside the window, (e) re-reports of a fixed cause. Earns its place if (c) >= 1, (d)/(c) >= 0.5
  and (e) = 0. Lines high and (c) = 0 means the bar is too loose.
- **Floor**: directions shipped per session and builder report length must not move by more than
  the session-to-session spread; a three-line cap should leave report tokens flat.
- **Where the counts live.** Entries in `bp/.perfect/Perfect/friction.md`, created by the next run,
  ignored, so per-checkout. The durable copy is the session's counts bullet in bp's tracked overlay
  `## Skill improvement log`, which step 4 now requires. **Open question for the operator:** whether
  bp should get a persistent vault root instead, so the entries themselves survive the checkout.
- **Application document:** not written. It carries the measurement, and there is none yet.

## Proposals, not landed

1. **P1, landing costs in the same grouping** (2/0/1, under the bar). Banked wording for Phase W
   step 4: "Add the Director's own landing rows to the same grouping, keyed the same way: each
   Phase B step 8 cost (a conflict, a base that moved under the wave, a full gate re-run after
   merging the base in, a generated file regenerated) as one line with its minutes. No builder can
   report these, because every builder's run ended before the wave landed." Re-enter when the
   2.11.0 nights show whether builder lines alone miss what the Director's bullets record.
2. **P2, physical-isolation price** (1/1/1). Banked wording in P's miner report. A brief-level
   consequence is worth noting even unlanded: a parallel brief should name one test file per task,
   or put the shared test file in one lot.
3. **Personas harness** (K3): split `learnings` into facts and friction and stop injecting friction.
   Not proposed for action: the loop is dormant and is the counter-example here.
4. **K8, a self-picked risk tier** gating auto-merge, against `self-reported-confidence-is-not-a-measurement`
   and `proof-class-bound-to-action-class`. A second voice for uzi lead 10. Open both homes.
5. **A6+K7 against P's reviewer**: the family-diversity lead now has an opposite default with one
   measured catch by a same-family reviewer. Worth a re-read by whoever next touches uzi lead 13.

No law, direction, XL row or taxonomy change was made.

## Overlap with earlier runs

- **self-evolving-harness:** A's paper half adds nothing; its "a smaller model with a better harness
  wins" holds on 1 of 3 benchmarks there. A says "Opus 5" where that run read Opus 4.8; not settled,
  no number quoted from A.
- **agent-factories, uzi `off-task-finding-lane`** (accepted there, not landed): a sibling lane, not
  this one. That lane is product defects seen beside the task, captured mid-run, filed by a person.
  This one is the agent's own working environment, captured at the end, drained under a bar. The
  discriminator is what the finding is about. If it lands, the two should link and stay apart.
- **memory-governance:** answers the plan's third question; the technique links it.
- **family-diversity-as-a-control:** A6+K7 above.
- **physical-isolation:** P2 above. The 7-of-9 row stays a banked amendment, not promoted.

## Held rows

None banked. Nothing here needs a GPU, and the owed measure is not a proof a shift can run: it is a
count over bp's own unattended `/perfect` sessions, which the operator schedules and which change
bp's tree. What it lacks to become a row: a session the shift may start in bp.

## Leads: return conditions

- **A8, A9:** the 2.11.0 nights give our own ratio of lines to proposals, and the cost of a per-session drain.
- **K12, K13:** a wired project ships flags, or routes production errors to an agent.
- **P11:** a wired loop with an intake stage and real ambiguous tickets.
- **P12:** a wired loop that A/Bs a docs tool against an outcome.
- **P13:** a fleet loop that runs in a hosted sandbox.

## Could not verify, and what was not done

- A's 654 signals, its auto-fixed file types, and whether its cross-family review blocks.
- K's `@kentcdodds/friction-log` package (its qualify rule and the sweep's prompt live off-repo), and
  any count of friction issues that reached a fix.
- P's conflicted files and the integrator's result; the rehearsal run's discrepancy count.
- No project tree changed; no project test suite, render, engine or ComfyUI call. `simulation`
  substituted for nothing. The board claim stays with the supervisor; the queue and the shift skill
  were not edited.
