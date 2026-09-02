---
kind: semantic
confidence: 0.6
namespace: engineering
source: skill-bakeoff-2026-09-01
---

# When to run a lane skill on Fable 5.1 and when on Opus 5

Nine lane skills were run twice on 2026-09-01 with identical inputs, one subagent per model,
in isolated worktrees on four fleet projects (kp, pof, ascent, gravitone). The operator picked
the winner per skill after reading both reports. This note is the durable reading of that
evidence; the per-run record is
[the bake-off episode](../episodic/2026-09-01-fable-vs-opus-skill-bakeoff.md). One
run each, so every claim below is a tendency, not a law: `confidence: 0.6`.

## The shape of the difference

- **Fable ships more, faster, and deeper into the data layer.** On five of nine skills it
  landed more commits (explorer 7 vs 9 is the exception, perfect 6 vs 3, scan-sweep 12 vs 6,
  architect 4 vs 2 executed). Its unique finds were the ones that needed a reproduction:
  a publish path spanning two SQLite connections, a degradation reason lost across a Python
  boundary, role-keyed thresholds the registry technique named. Wall time was 25 to 45
  percent lower on prototype, research and architect, at a higher token count.
- **Opus is the more disciplined auditor.** It stayed inside its declared write boundary
  every time (no run wrote into the registry checkout; four Fable runs did), proved
  foreign test failures by rebuilding at the same SHA instead of by argument, refused to
  manufacture a gate it could not reproduce, recorded refuted hypotheses, and read the
  governing registry subject before designing. Its unique finds were the ones hidden in
  configuration and contracts: eslint selectors shadowed by later flat-config blocks and
  dead for their whole life, a self-heal re-verify running under a tenth of the gate's
  buffer, a prior session's output replayed as instruction into a permission-free session.
- **Both self-audited honestly.** Each model caught at least one false-green of its own
  (an exit code read through a pipe, a seed check satisfied by its own comment) and said so.
  Neither model's reports needed correction on the facts I could verify.

## Guidance by skill class

| Skill class | Prefer | Why |
| --- | --- | --- |
| Build loops with a proposal gate (`/friend`, `/spark`, `/perfect` director) | Fable | Wider slates, the pick that the knowledge lane names, faster cycles. Opus's slates were thinner and better argued; use its wave design (registry read before design, wire-contract pre-commit) as the method. |
| Visual prototyping (`/prototype`) | Fable for the surface, Opus when the data model is the point | Fable produced the more striking gauge in half the time; Opus read the scoring engine and surfaced facts the original hid. The operator picked Fable's surface. |
| Structural scans and gate audits (`/architect`) | Opus base, Fable extras | Opus found the dead gate that no defect-shaped search can find, and refuted two hypotheses; Fable executed more code fixes on disjoint files. Merge both when budget allows. |
| Quality sweeps (`/explorer`, `/scan-sweep`) | Run both | Item sets were nearly disjoint: Fable's defects were deeper (concurrency, data), Opus's broader (abuse, injection, hygiene). Two runs on one area beat one run at twice the depth. |
| Source mining (`/research`) | Run both, or Fable when time-boxed | Complementary findings (tool annotations vs tool groups). Fable read more of the source faster; Opus checked whether the composite gate covered the changed files. |
| Media training loops (`/dojo`) | See the episode note | Fable's cycle tripped the breaker under a foreign GPU process and reported a null result from partial readbacks; the Opus cycle is recorded in the episode. |

## Operating rules that both runs taught

- The harness's 20-concurrent-subagent cap counts nested builders. Eighteen top-level runs
  plus builders cannot all start; queue and relaunch on completion notifications.
- A skill that says "write to the registry" must be told explicitly when the registry is
  out of scope; Opus honoured the boundary from the brief alone, Fable followed the skill.
- A `commit-msg` hook that rejects the skill's prescribed subject prefix bit every kp run on
  both models. The skills now say: repo convention wins, attribution goes in the body.
- Foreign red tests in a junction worktree are a fixture of this fleet. The cheapest
  decisive check is a detached worktree at the same SHA, not a bisect.
