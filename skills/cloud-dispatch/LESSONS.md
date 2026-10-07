# Lessons - cloud-dispatch

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-10-07 - ai-registry
- First three launches (a smoke brief, then upstream deltas of microsoft/mcp and deer-flow): every launcher exited 0 within 8 s, and each cloud session opened its PR in 1, 19 and 18 minutes. The landing contract held in all three: own `claude/cloud-<id>` branch, RESULT.md, one PR, nothing on main. The deer-flow session's harness also named its own development branch; the contract's branch name won, as written.
- Cost: $33 for the two delta runs together, about $16-17 each; the one-minute smoke run did not visibly charge. Delta size (194 vs 740 upstream commits) barely moved the price - both sessions spent their reading budget fanning out four read-only workers. Budget by brief type, not by source size.
- The sessions regenerated the index BEFORE committing their content, so `revision`/`changedAt` were stamped from history that lacked their own commit: main failed `build-index --check` after the first merge. Fixed in 1.1.0 (both briefs: commit content, then regenerate, then commit generated files). Two PRs on one bundle then conflict only on generated files - merge the default branch in, commit, regenerate.
- The cloud sessions handed back exactly what the brief asked for and nothing more: verbatim ledger rows, a Handoff section, proposed lessons. Lifting the rows with a script from the fenced blocks, not retyping them, kept them verbatim. One session also diagnosed a registry bug it was only asked to report (upstream-check's same-day pin tie-break), with file, line and a fix - a cloud worker is a fair place to send "explain why the instrument said X".
- GitHub kept a PR's old head for about a minute after a push and refused the merge as conflicting; re-read `.head.sha` before merging.
