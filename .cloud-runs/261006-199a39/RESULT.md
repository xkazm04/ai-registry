# Cloud-dispatch run 261006-199a39 — smoke: subject count per bundle

## What was done

Read `AGENTS.md`, then counted the entries under the `subjects` key in every
`knowledge/<bundle>/index.json` at `origin/main` (`7973370`). Each count was
also checked against the index's own `meta.subjects` field, and every bundle
matched.

| bundle | subjects |
| --- | ---: |
| agent-operations | 9 |
| civic-intelligence | 15 |
| game-production | 78 |
| grant-funding | 17 |
| llm-observability | 18 |
| localization | 17 |
| marketing | 30 |
| media-generation | 26 |
| recruiting | 64 |
| software-engineering | 233 |
| technical-writing | 6 |
| **Total (11 bundles)** | **513** |

Method: `Object.keys(index.subjects).length` per file (in these indexes,
`subjects` is an object keyed by subject slug).

## Files changed

- `.cloud-runs/261006-199a39/RESULT.md` (new; the only file added). No existing file was edited.

## Checks

- No gate was run. The task is read-only apart from this report, and no lane content changed.

## Open questions

- The session harness named the branch `claude/cloud-261006-199a39-g5buyq`, but the
  landing contract asks for `claude/cloud-261006-199a39`. I followed the contract. That
  harness branch was checked out at `72f0152`, not at `origin/main`, so the branch for
  this run was cut fresh from `origin/main` (`7973370`), as step 1 asks.

## Handoff

- Nothing is left for a local session. Review the PR and merge or close it.
