# Lessons - ci-gate-check

## 1.4.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.5.0 - 2026-09-17 - skillbench

- Measured on a Rust workspace: 4 of 5 GPT runs at high effort ran only the five table stages,
  reported all green and "safe to push" while the repo's REQUIRED gitleaks CI job was red. The one
  run that found the repo's own `scripts/gates.sh` ran all eleven stages, saw `audit-secrets FAIL`
  and said "do not push". The table outranked the repo's declared gate even for runs that had read
  the guidance file naming it. 1.6.0 puts the repo's own gate script first, makes every declared
  capability and every CI-required job a stage, and calls the table a default for a repo that
  declares nothing.
- Measured on a Python/uv repo: the manifest's `build` is `uv sync --extra dev`, the environment
  every other stage needs. Running `build` last per the table's order made typecheck fail in a
  fresh checkout; 6 of 6 runs reported "do not push" while CI (which syncs first) was green.
  1.6.0 adds an environment-step-first rule and restricts "build is an artifact stage" to commands
  that actually produce artifacts.
- ~20 judge verdicts faulted runs that reported environmental breakage as code failure; this was
  the corpus's largest judge disagreement (mean spread 3.1 vs 0.5 for real code failures). 1.6.0
  adds a third stage outcome, "could not run", with a retry after the repo's setup step and the
  verdict `not yet - <stage> unverified`.
- ~26 verdicts docked runs for skipped stages while naming the skill's own stop-at-first-failure
  rule. 1.6.0 requires the verdict to name what was not run and reserves "safe to push" for a run
  where every stage was `ok`.
- One run lost its hard pass for writing the verdict as prose - it had only ever appeared inside a
  fenced example. 1.6.0 states the `VERDICT:` line as a required unadorned literal.
- ~11 verdicts split 5 defect / 6 credit over gate runs that left regenerated files and line-ending
  churn in the tree - the split itself being the evidence the rule was missing. 1.6.0 makes a gate
  run a read: `git status` first, restore what the gates wrote, or name the touched files.
