# Lessons - architect

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Re-seated onto the lane's overlay contract (1.0.0 -> 1.1.0).** The body declared itself "personas-specific", hardcoded `C:/Users/kazda/Documents/Obsidian/personas` in four places, and made Phase 0 `exit 1` when that vault was absent. On a second machine the vault is at a different root, so the skill did not degrade — it aborted before Phase 1. That is the failure mode the lane doctrine's "the body is generic" rule exists to prevent: a body that cannot run is not a shared library item, it is one machine's script.
- **The overlays already existed; nothing read them.** `.claude/perfect/config.md` had been carrying personas' gates, repo law and context-source provenance for rounds, and `/perfect` resolved a vault from a candidate list. `/architect` sat beside it in the same repo reading none of that and holding its own frozen copy of the same facts. The gap was not missing configuration — it was a body that never asked.
- **Phase 0 now creates rather than aborts.** `VAULT` resolves from an overlay candidate list, first existing wins, and falls back to `<repo>/.architect/` which it creates. Every other project-specific value moved to `.claude/architect/config.md` with a default: context sources (default `context-map.json`, else `CLAUDE.md`), area menu, gates, repo law, docs/lint/test-guard codification vehicles, smoke, the coverage name set.
- **What stayed in the body is the craft.** The nine themes, the five scan angles, the four-way triage, the ADR contract, the aging-strong-pattern review, the commit-on-top discipline and the staged-index verification are all method, not project. Re-seating touched where the run gets its facts, never how it thinks.

## 1.1.0 - 2026-08-28 - ascent

- **Removed the one-execute-now-per-session recommendation (1.1.0 -> 1.2.0).** Phase 6 told the run to
  push back when a user marked more than one finding `execute now` ("doing N changes in one session is
  high-risk - pick the highest priority and queue the rest?"). On ascent's first run the owner answered
  `All=1` and the step turned into a turn spent negotiating scope the owner had already chosen. The
  triage menu IS the scope decision; re-litigating it after the user has answered is the skill second-
  guessing an explicit instruction.
- **What replaced it is the part that was actually load-bearing: sequencing.** Multiple execute-nows now
  run as one session ordered by ASCENDING RISK with the gate re-run between findings, and the sequence
  stated before work starts. That preserves the real value the warning was groping at - attribution when
  something regresses - without making the user defend their triage. The warning was solving a
  correctness problem with a permission prompt.
- **First-run vaults make Phase 4 a no-op, and the run should say so.** Phase 4 (surface against existing
  memory) reads four vault files that are all empty on run #1. The method has no first-run branch, so the
  honest move was to state "vault empty, no cross-check, no aging patterns" and move on. Worth an
  explicit line in the method rather than leaving each run to improvise it.
- **The five-angle fan-out earned its cost, and the conflict lane is where the value showed up.** Angle 1
  (usage map) read three coexisting org-auth mechanisms as competing drift; angle 4 (auth), which
  individually read all 34 routes the grep flagged, established they are a composition hierarchy
  bottoming out in one resolver. A single-angle scan would have shipped angle 1's wrong read as a
  finding. The Phase 3c "Conflict" instruction is the guardrail that caught it - keep it prominent.
