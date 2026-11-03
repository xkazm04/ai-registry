---
subject: probe-confirmed-model-proposals
domain: software-engineering
last_touched: 2026-11-03
dry_streak: 0
---

# probe-confirmed-model-proposals

First note. The subject was forged on 2026-10-27 from one node tree, a CI-and-production
watcher's onboarding module (afterlife 009c7893). A Curator dispatch ranked it on
"single stack (node)".

## State

5 techniques and 3 applications:
- 2 `node`, from afterlife 009c7893 (found-not-hinted, isolated-proposer-call);
- 1 `python`, from kp 1c3a999fa (isolated-proposer-call): the repository dossier its
  App-master intake is composed from.

probe-per-proposed-line, deterministic-capped-fact-pack and cross-engine-agreement still
have only the node tree behind them.

## 2026-11-03 - deepen (pcmp-deepen-1103)

Landed in db9948536, with the catalog in 9c81454c8. Lanes:
- **`check-currency --volatile --subject`.** 1 dated fact in 8 documents: the node
  application's 25 KB pack cap, a project constant, not a vendor figure. Not re-sourced.
- **Field.** A per-repo git grep for propose and probe across non-node sources in 15
  fleet checkouts. personas' App-master adoption door was read and set aside (no model
  proposal is persisted). kp's `repo_scan.py` is the seam: a model refines a heuristic
  repo dossier that is persisted and composes a role. kp is public (checked with gh).
  Read at origin/main f3e3f243b, cited at the pushed 1c3a999fa. Anchors held 9/9 quoted,
  plus 3 unquoted, against a worktree at that sha.
- **Experiment (L3).** kp runs its proposer inside the target with read tools, plan mode,
  a write denylist and the CLI's default setting sources. On a scratch repo with hooks
  and an instruction file, CLI 2.1.317, kp's exact argv:
  - default sources: hooks executed 2/2, instruction steered 2/2;
  - user source only: 0/2 and 0/2;
  - empty cwd: 0/1 and 0/1.

  With the user source only, the tree stayed readable and the caller's `.env` deny held.
- **Counter-evidence (web, one research agent; the two landed doc quotes re-fetched raw
  and grepped verbatim).**
  - The vendor's headless page: a `-p` session runs a project's hooks and MCP servers
    "even in a folder you've never trusted".
  - The vendor's permissions page recommends `--setting-sources user`.
  - No page states that a permission mode leaves hooks running. That half rests on the
    measurement.
  - Not landed, agent-reported only: CVE-2025-59536 and CVE-2026-21852 (project files
    executing before trust), CVE-2025-61260 (Codex CLI), and Gemini CLI refusing
    untrusted workspaces in headless mode.
- **Training-data only (blind).** Run inline before the web lane returned. From memory: -p
  skips the trust prompt, and project hooks have a CVE history. Both converged with the
  web lane. As the method warns, this confirms no vendor-set fact on its own.

Verified and left untouched:
- **cross-engine-agreement.** "Correlated Errors in Large Language Models"
  (arXiv 2506.07962): models agree 60% of the time when both err, over 350+ models. Also
  arXiv 2502.04313: errors grow more similar with capability. The technique's unsourced
  "published audits" sentence stands.
- **The golden path's concession that an exploring agent may be more accurate.** EnvBench
  (arXiv 2503.14443): on JVM, an agent scored 29.47% and a zero-shot call 8.57%; on Python,
  6.69% and 5.47%. Those tasks are environment setup with execution feedback, which is
  the technique's existing "requires interaction" branch. No change.

Landed:
- **isolated-proposer-call (condition added).** A reading proposer sits between a sealed
  call and an interactive agent. Its cwd must be the target, so close the runtime's
  project-level configuration source; a read-only permission mode is not that closure.
  A new decision rule. The golden path gains one sentence.
- **python--isolated-proposer-call--kp.md.** `applied: code`, `ab_verdict: better`. It
  records:
  - field authority over counted facts;
  - hot-spot refs intersected with the walker's observed churn (found-not-hinted by
    intersection);
  - three unprobed judgment lines (risk refs, numeric baselines, named KPIs);
  - the measured fix.

Applied: kp 1c3a999fa `fix(repo-scan)`. The repo_scan argv gains `--setting-sources user`;
the argv pins and two docs were updated. 154 affected Python tests pass. Pushed to
origin/main through the pre-push gate. The scratch worktree was left in
place: the remover refused it because the gate regenerated 4 tracked files there, and
this run does not discard changes.

Declined:
- **A cited-baseline probe in kp.** A design change in the owner's domain. Whether `0` is
  a reading is the owner's call: `_number_or_none(0)` returns `0.0` against its own
  docstring.

## Impact

None. No fleet map joins this subject (0 pairs in all 12 maps after regeneration), so no
project carries a stale verdict against it. The 11 regenerated maps were committed
locally on each active branch, map-only through an isolated index, and not pushed.

## Banked leads

- **Unprobed judgment lines in kp's dossier.** Return when kp grows a cited-baseline
  probe or a risk-ref existence check. Then probe-per-proposed-line gets its second stack.
- **A non-node fact pack.** No fleet tree has a capped deterministic pack feeding a
  tool-less proposer outside afterlife. Return when one does.
- **Cross-engine agreement in a second tree.** Return when a fleet project compares two
  engine families over one input.
