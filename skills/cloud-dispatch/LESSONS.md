# Lessons - cloud-dispatch

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-10-07 - ai-registry
- First three launches (a smoke brief, then upstream deltas of microsoft/mcp and deer-flow): every launcher exited 0 within 8 s, and each cloud session opened its PR in 1, 19 and 18 minutes. The landing contract held in all three: own `claude/cloud-<id>` branch, RESULT.md, one PR, nothing on main. The deer-flow session's harness also named its own development branch; the contract's branch name won, as written.
- Cost: $33 for the two delta runs together, about $16-17 each; the one-minute smoke run did not visibly charge. Delta size (194 vs 740 upstream commits) barely moved the price - both sessions spent their reading budget fanning out four read-only workers. Budget by brief type, not by source size.
- The sessions regenerated the index BEFORE committing their content, so `revision`/`changedAt` were stamped from history that lacked their own commit: main failed `build-index --check` after the first merge. Fixed in 1.1.0 (both briefs: commit content, then regenerate, then commit generated files). Two PRs on one bundle then conflict only on generated files - merge the default branch in, commit, regenerate.
- The cloud sessions handed back exactly what the brief asked for and nothing more: verbatim ledger rows, a Handoff section, proposed lessons. Lifting the rows with a script from the fenced blocks, not retyping them, kept them verbatim. One session also diagnosed a registry bug it was only asked to report (upstream-check's same-day pin tie-break), with file, line and a fix - a cloud worker is a fair place to send "explain why the instrument said X".
- GitHub kept a PR's old head for about a minute after a push and refused the merge as conflicting; re-read `.head.sha` before merging.

## 1.2.0 - 2026-10-29 - paypal
- First Managed Agents night-sweep instance, applied from an agent's shell with ant 2.4.0. Three README steps failed as written:
  - `ant apply` refuses to prompt without a terminal; it needs `--yes`.
  - `memories create` ignored the piped body, and `--content @path` stored the literal string `@./agents/...`.
  - `apply --dry-run -v` on the deployment would print `authorization_token`.
  Fixed in 1.2.1. The checks caught the bad seed: the README's "must show the schema line, not a path" line made the literal-path seed visible at once.
- Manual smoke run on the paused deployment:
  - About 20 active minutes and $2.20 of the $15 cap.
  - The toolchain installed from the default hosts plus `allow_package_managers`: rustup, crates, npm/pnpm and apt.
  - The run opened paypal #3 (an MCP notification protocol fix, with the test failing on the test-only commit and passing on the fix) and appended one ledger line. It listed eight further findings with `path:line`.
  - The outcome grader reproduced both test runs and returned `satisfied` at iteration 0.
  - The session ends `idle`, not `terminated`. The verdict lives in `outcome_evaluations[].result`.
- The vault stored the MCP URL without its trailing slash. The agent's `.../mcp/` still matched it, and `create_pull_request` authenticated with a classic PAT as `static_bearer`. That settles the 1.2.0 "PAT as bearer" and "GitHub MCP tool names" unknowns.
