# The `signals/` lane

Whether what this registry claims is still true where it is used — contributed by the
installations that use it.

The [`usage/`](usage-lane.md) lane answers "is this skill reached for". This one answers
the harder question the registry could not previously ask at all: **has the world these
documents describe moved?** An application document cites real code in a real tree. That
tree gets a runtime bump, a rename, a replaced library — and the citation does not change,
because nothing here can see the tree it points into.

## The split, and why it is the same split as evidence

The registry cannot resolve a citation. It does not have the consumer's checkout, and it
never will. That is the same constraint that put the evidence layer in a gitignored
consumer overlay ([`rkb-profile.md` §5](rkb-profile.md)), and this lane takes the same
shape:

> **The consumer computes. The registry receives verdicts, never pointers.**

An installation already resolves its own `<subject>/.evidence.local.md` overlay against
its own tree — that check keeps its teeth where the code is. It already knows which
citations still land. It just never said so out loud. This lane is where it says so, in
counts.

## The shape

One file per contributing installation, exactly like `usage/`:

```
signals/<contributor>.json
```

```json
{
  "schema": "rkb-signals/1",
  "contributor": "personas-dev-box",
  "app": "personas",
  "generatedAt": "2026-08-20T12:00:00Z",
  "windowDays": 30,
  "stack": { "react": 19, "node": 22, "rust": "1.79" },
  "bundles": {
    "software-engineering": {
      "consults": { "table": 12, "agent-memory": 4 },
      "deviations": { "quality-gates": 2 },
      "citations": {
        "table/react--pagination": { "resolved": 4, "moved": 1, "gone": 2 }
      },
      "councils": { "table": { "approved": 2, "rejected": 1 } }
    }
  },
  "meta": { "councils_projects_read": 7 }
}
```

| field | required | meaning |
| --- | --- | --- |
| `schema` | yes | `rkb-signals/1`. |
| `contributor` | yes | Stable id for the installation. Must match the filename stem, so two installations cannot claim one file. `[a-z0-9-]`. |
| `app` | yes | Which tool wrote it. |
| `generatedAt` | yes | ISO-8601 UTC. |
| `windowDays` | yes | The window `consults` covers. |
| `stack` | yes | Capability → version this installation runs. Lifted from the repo's own `.ai/manifest.yaml`; a bare major is enough. |
| `bundles` | yes | Bundle name → what this installation observed about it. |
| `meta` | no | A closed set of **denominators**, never a notes field. Two keys: `councils_projects_read`, and `deviation_lines_unattributed` - consult lines whose single deviation figure spans several subjects, so it could not be credited to any one. |

Inside a bundle, all four keys are optional — an installation reports what it can measure:

| field | meaning |
| --- | --- |
| `consults` | Subject slug → how often an agent read it in the window. The knowledge analogue of `invokes30d`. |
| `deviations` | Subject slug → how many places this repo knowingly falls short of the standard. A deviation is not a defect in the standard; it is demand pointing at it. It is a **state**: per project, only the latest consult line naming that one subject counts, and projects add. Summing every line credited one line's figure to each subject it named and re-counted a standing deviation on every consult. |
| `citations` | `<subject>/<application-stem>` → `{ resolved, moved, gone }`. How many of that document's cited anchors still land in this tree. |
| `councils` | Subject slug → `{ approved, rejected }`. How often a **person** accepted or rejected work that cited the subject, at a review gate. Every other key here counts reading; this one counts an outcome. |

### `councils` and its denominator

A consult says the corpus was read. A council says the work it shaped went in front of a
human and survived, or did not — which is the only signal in this lane with a verdict
attached, and the reason a rejection count is as valuable as an approval count.

The contributor-side log is `<repo>/.ai/councils.jsonl`, appended when a decision is
recorded. A line names subject slugs but no bundle, so the collector resolves the bundle
from the registry's own `knowledge/<domain>/index.json`; **a slug that resolves nowhere is
dropped, never filed under a default bundle.**

`meta.councils_projects_read` is the denominator, and it is why `meta` exists at all. A
bundle with no `councils` key could mean "nobody councilled anything here" or "no council
log was readable on that machine". The count separates them: `0` means no project carried
a log, and an absent `meta` means an older collector that did not look. **Absent is not
read; it is never zero.**

What still stays on the machine: which feature, in which repository, at which round, for
which reason. The reason a person gave for a rejection is the most useful sentence a
council produces and the least publishable — it lives in the consumer's own vault.

### Subjects are named by slug, never by path

`consults`, `deviations` and the first half of a `citations` key are **bare subject
slugs** — `table`, never `ui-surfaces/data-display/table`. A subject's slug is its
identity; its folder is only where the bytes sit, and that can be reorganized by
`apply-taxonomy.mjs` without a single contributor file becoming wrong. A signals file that
encoded a category would break the next time the taxonomy moved.

## What must NOT go in a signals file

This repository is public, and the whole point of the lane is that an installation can
report honestly without disclosing anything about its own codebase:

- ✗ No filesystem paths, no repository or project names, no URLs.
- ✗ No email addresses or usernames.
- ✗ No citation *pointers* — `{ "gone": 2 }` is the finding; **which** two files vanished
  is a fact about one tree and stays there.
- ✗ No per-repo breakdown inside one contributor file.

`scripts/check-signals.mjs` **enforces** this rather than trusting it. Every key name is
closed, and the raw text is scanned for path-, URL- and email-shaped values before
anything else is checked — the same discipline as the usage lane, for the same reason: a
leak in a public repo's git history is permanent.

## What the registry does with it

[`scripts/check-currency.mjs`](../scripts/check-currency.mjs) reads this lane alongside
each application's `verified_on` clock and reports four things: **expired**, **at risk**,
**stack drift** (an installation is on a newer major than a document was verified
against), and **unwitnessed** — a bundle nobody reports on.

That last one is the load-bearing honesty in the design. A bundle with no contributors
reads as **unknown**, never as **current**. It is the same distinction `catalog.json`
already draws with `invokes30d: 0` and an empty `usageContributors`: zero with no witness
means nobody is looking, not that everything is fine.

## Counting discipline

Identical to the usage lane, and for the same reason. Counts accumulate **locally first**;
the file is written when the installation is already committing something else. A commit
whose only content is a freshness report is noise in a repository people read.

Stale is fine — `generatedAt` says how stale. This is a signal, not an accounting ledger.

## What this lane cannot do

The [identity and freshness contract](telemetry-identity.md) defines migration aliases,
retained unresolved observations and conservative state aggregation. The report is
repeatable with an explicit `--as-of` date; source timestamps are never refreshed by it.

**It is not enforceable from here.** The registry cannot verify that an installation
reports, or that it reports honestly — the same limit that makes the skills-lane
resolution rule a declared contract rather than a gate. So the design does not try to
enforce. It makes the signal cheap to produce, makes its absence visible, and lets
[`/librarian`](../librarian/index.md) rank on what does arrive.
