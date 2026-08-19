# The `usage/` lane

Which skills actually get used, contributed by the installations that use them.

A registry can tell you what skills exist and what they claim to do. It cannot tell you
which ones anyone reaches for — and that is the signal that separates a library from a
graveyard. The usage lane carries it, contributed by every installation that runs skills
from this registry.

## The shape

One file per contributing installation:

```
usage/<contributor>.json
```

```json
{
  "schema": "rkb-usage/1",
  "contributor": "personas-dev-box",
  "app": "personas",
  "generatedAt": "2026-08-19T12:00:00Z",
  "windowDays": 30,
  "skills": {
    "ci-gate-check": { "invokes": 41, "lastUsed": "2026-08-18T09:14:00Z" },
    "test-before-commit": { "invokes": 7 }
  }
}
```

| field | required | meaning |
| --- | --- | --- |
| `schema` | yes | `rkb-usage/1`. |
| `contributor` | yes | Stable id for the installation. Must match the filename stem, so two installations cannot claim one file. `[a-z0-9-]`. |
| `app` | yes | Which tool wrote it (`personas`, `ascent`, …). |
| `generatedAt` | yes | ISO-8601 UTC. |
| `windowDays` | yes | The counting window the numbers cover. |
| `skills` | yes | Skill name → `{ invokes, lastUsed? }`. `invokes` is a non-negative integer. |

## One file per contributor, and why it is not one shared field

Counts are contributed by many installations to a repo they all write to. Two writers on
one value is the failure this registry exists to avoid — and in git it has a second,
duller form: two contributors editing the same line is a merge conflict on every sync.

So each contributor owns exactly one file and never touches another's. Aggregation happens
at generation time: `scripts/build-catalog.mjs` sums the lane into each skill's
`invokes30d` and lists the contributors that reported it. **`catalog.json` is generated —
never hand-edit its counts.** The usage files are the source of truth; the catalog is a
view over them.

That also means an installation can be removed by deleting its file, and its contribution
disappears from the aggregate on the next generation. No back-out migration.

## What must NOT go in a usage file

This repository is public. A usage file carries **counts and nothing else**:

- ✗ No filesystem paths, no repository or project names, no URLs.
- ✗ No email addresses or usernames.
- ✗ No per-project breakdown. "Which of my repos ran this" is a fact about one
  organization's fleet; the registry only needs "how often was this skill reached for".

`scripts/check-usage.mjs` **enforces** this rather than trusting it — a path-shaped or
email-shaped value fails the gate. The privacy guarantee of a public registry cannot rest
on every contributor remembering the rule.

`contributor` is chosen by the operator and is the one string a human picks. Keep it
non-identifying (`personas-dev-box`, `team-a`), not a person's name.

## Counting discipline

Counts accumulate **locally first**. An installation counts invocations in its own store
and writes this file only when it is already committing something else — a skill share, a
version bump, a sync. A commit whose only content is a count is noise in a repo people
read, and it turns every skill run into a git write.

Stale is fine: `generatedAt` says how stale, and the aggregate is a signal, not an
accounting ledger.
