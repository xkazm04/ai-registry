---
layer: application
type: application
subject: repository-landing-document
technique: landing-document-as-router
stack: process
status: forged
verified_on: 2026-09-01
---

# Routing a plugin repository's front page

`github.com/glukicov/slideops` @ `66af7de` is a two-skill agent plugin whose
`README.md` is published to three surfaces: the code host, a plugin
marketplace the repository itself declares (`.claude-plugin/`), and the
`skills.sh` registry it carries a badge for. It is the one project in the
2026-09-01 fleet survey that routes at all, and it is a useful worked example
of the population test precisely because it is not a clean pass on every rule
in this subject.

## The routing table

`README.md:139-149` is the router. Four rows, and the destination cells
enumerate rather than gesture:

```
| Page | What's in it |
|---|---|
| 📦 **[Install](docs/install.md)** | Every install path, all four agents, updating, requirements, what gets installed |
| 🔎 **[Freshness](docs/freshness.md)** | Citations, the status table, the cost model, where to automate, the accuracy contract, what never reaches a slide |
| 🛠️ **[Development](docs/development.md)** | Working on this repository: the gate, CI guards, generated artifacts, releasing |
| 📋 **[Changelog](CHANGELOG.md)** | What changed in each release |
```

The freshness row is the technique's rule executed exactly: six named
contents, in the reader's vocabulary, at a grain where a reader wondering
*does this cost tokens* can see "the cost model" and stop searching. The
changelog row is the counter-example on the same table — *what changed in each
release* restates the link text — and it is defensible only because the
destination's contents are unenumerable by nature.

## The population test, applied and visible in the diff of history

The front page keeps `## Install` (`README.md:38-67`) but holds only the three
shortest paths, with the fourth reader population routed out in a sentence
that names what is over there: *"For the symlink and snapshot installs, the
per-agent table and how updates reach you, see docs/install.md"*
(`README.md:60-62`). That is the population test resolved correctly in both
directions in one section — the universal question (*give me the line*) stays,
the some-readers question (*which of four agents, and how do updates arrive*)
moves.

`docs/development.md` is the cleanest case: the whole contributor population
is routed out, and the front page carries no gate, no lint invocation and no
release procedure. Compare `docs/development.md:20-30`, which lists eight
commands — every one of which would be furniture to the evaluator and the
adopter.

## The countable rule, measured

Counted with `wc -w` over the markdown source on 2026-09-01, one counter for
every file:

| file | words |
|---|---:|
| `README.md` | 1,058 |
| `docs/install.md` | 816 |
| `docs/freshness.md` | 1,065 |
| `docs/development.md` | 589 |
| `CHANGELOG.md` | 1,437 |

Front page 1,058; routed destinations 3,907 (2,470 excluding the changelog,
which is append-only and grows for reasons unrelated to composition). The
front page is the smaller half either way, which is the rule passing. The
fleet instrument's own count of the front page is 1,033 rather than 1,058
because it strips markup before counting — a reminder that the comparison is
only meaningful within one counter, and that quoting the two figures side by
side would be exactly the error the instrument was written to remove.

Every other project in the same survey routes to zero pages and therefore
fails the rule by construction, with front pages from 804 to 3,444 words.

## Where the exemplar diverges from the standard

Two sections on this front page fail the population test and stay anyway.

`## Features` (`README.md:106-137`) runs seven bullets deep and includes
implementation detail — the character budget of a code column, the count of
slide patterns, the mechanism by which themes are tokenized — which is a
some-readers question with no row of its own. The standard says it moves to a
capabilities page and leaves a routing row; the repository keeps it, and the
result is the longest single stretch of the document.

`## Credits` (`README.md:151-158`) serves no reader population's question at
all. It is a courtesy, and courtesies are legitimate — but they are the *proof
of life* exemption from the technique, not an exemption the population test
grants, and calling it one is how a front page acquires its fourth
unroutable section.

Neither divergence lowers the standard. They are recorded here because a
worked example that only shows the rule passing teaches nothing about where
the rule binds.
