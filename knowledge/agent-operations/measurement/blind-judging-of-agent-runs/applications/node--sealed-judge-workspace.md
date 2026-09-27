---
layer: application
type: application
subject: blind-judging-of-agent-runs
technique: sealed-judge-workspace
stack: node
status: forged
verified_on: 2026-09-27
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Node: what a judge seat could reach, before and after the staging fix

The registry's design-contest skill (`skills/contest/scripts/contest.mjs`) runs a blind
panel of command-line agent seats. Every seat is launched without approvals - the Claude
seat with `--permission-mode bypassPermissions`, the Codex seat with
`--dangerously-bypass-approvals-and-sandbox`, the Grok seat with `--always-approve` - and
all seats of a panel run concurrently (`runSeats` maps them to promises). The only thing
between a judge and the unblinding key is where its working directory sits.

## Two incidents, one fix

The code records both in its own comments:

- a judge working in `<arena>/judging/` had the blind map one `..` away
  (`runs/blind-map.json`, `manifest.json`) - "do not look" was a request, not a wall;
- a second judge cited the host's screenshots, which had been written next to the entries.

Version 1.6.0 (2026-09-25) stages each judge in a copy outside the arena
(`<os tmpdir>/contest-judging/<contest>-<judge>-XXXXXX/`) holding only the redacted entries
and its brief; `aggregate` harvests the verdict and deletes the copy. The host's visual pass
now writes into `runs/`, which no workspace contains.

## The experiment

No model was run. A two-seat contest was initialised, two entries written with a model name
planted in the page text, then `collect` and `plan --kind judges` staged the seats exactly as
a live panel would. The probe ran from the first seat's working directory, with its own brief
as the known positive. A second seat's verdict was written into its workspace to stand for
the faster judge finishing first.

| Reachable from the seat | 1.5 layout (cwd `judging/`) | 1.6 layout (staged copy) |
|---|---|---|
| Blind map, manifest, unblinded gallery | one `..` | not within two levels; the arena shares only the user's home as an ancestor |
| Planted model name in the entries | redacted | redacted (2 leaks reported by `collect`) |
| Other seats' briefs (they name the model) | same directory | one `..`, and the folder names spell each seat's model |
| Other seats' verdicts | same directory | one `..`, readable while the slower seat still runs |
| Host's screenshots | beside the entries | not in the workspace |

Two levels up the probe matched 11 files named `manifest.json`; every one was a browser
extension's install folder in the temp directory, none a contest's.

## Verdict

**Better** on the defect the fix targeted: the key moved from adjacent to a home-directory
search away, and the host's material left the judges' reach. **Not sealed** on the second
leg of the technique. Seats sit side by side under one shared staging folder, named for
their judges, and run at the same time, so the panel's independence still rests on no judge
listing its parent. And because every engine runs unsandboxed, the key is out of the way,
not out of reach.

Owed, not fixed here - the skill's scripts carried another session's uncommitted work when
this was measured:

- one opaque temp root per seat (`mkdtemp` directly, no judge or contest id in the name);
- seat labels rotated per judge rather than one letter order for the whole panel, which
  today puts every entry in the same reading position for every judge;
- a leak grep over each harvested verdict for another seat's id or a host artefact's name.

Falsifier: a panel whose verdicts, grepped, never cite a peer or host artefact across a
contest where seats ran concurrently would say the residual leak is unexploited in practice
- not that it is closed.
