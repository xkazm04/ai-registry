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
      }
    }
  }
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

Inside a bundle, all three keys are optional — an installation reports what it can measure:

| field | meaning |
| --- | --- |
| `consults` | Subject slug → how often an agent read it in the window. The knowledge analogue of `invokes30d`. |
| `deviations` | Subject slug → how many places this repo knowingly falls short of the standard. A deviation is not a defect in the standard; it is demand pointing at it. |
| `citations` | `<subject>/<application-stem>` → `{ resolved, moved, gone }`. How many of that document's cited anchors still land in this tree. |

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

**It is not enforceable from here.** The registry cannot verify that an installation
reports, or that it reports honestly — the same limit that makes the skills-lane
resolution rule a declared contract rather than a gate. So the design does not try to
enforce. It makes the signal cheap to produce, makes its absence visible, and lets
[`/librarian`](../librarian/index.md) rank on what does arrive.
