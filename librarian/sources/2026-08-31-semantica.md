---
source: github:semantica-agi/semantica
kind: vendor repository (hybrid — marketing README, first-party engineering changelog)
url: https://github.com/semantica-agi/semantica
title: "Semantica — Graph-Native Infrastructure for Context and Accountable AI Systems"
author: semantica-agi (multi-contributor OSS)
commit: f3c540cfd25321348c39acdbfa0e448d0bc1fe9f
words: 9060 rendered landing page / ~1.0 MB in-tree operating documents (317 KB CHANGELOG, ~700 KB docs/)
extracted: 18
accepted: 6
declined: 0
leads: 5
already_covered: 3
untriaged: 9
dispatched: 0
applied: 6
shipped: 0
run_id: intake-semantica-0831
siblings: 4
---

# Semantica — a knowledge-graph framework whose changelog is the source

## Class reading, stated before triage

**Vendor repository, hybrid.** The README half (78 KB in tree, 9,060 words
rendered) is marketing. The `CHANGELOG.md` half is something else entirely: a
hand-curated, 317 KB first-party practitioner account that records **root
causes**, not release notes — and `GROWTH.md` says why, in a checklist item
marked *considered and deliberately skipped*: "this repo hand-curates
`CHANGELOG.md` with far more detail (PR numbers, contributors, phase-1
limitations) than a bot would produce."

Expected yield declared before the table: **high, 3-6 landings**, corroborating
corpus-internally. Both halves held — six landings, and the run spent **0 of 3
fetches**, the fourth consecutive run to do so on a first-party codebase.

## What was swept (Phase 2b), in yield order

`ARCHITECTURE.md` · `docs_check.py` (the docs integrity instrument) ·
`.github/scripts/verify-action-pins.sh` · `.github/scripts/filter_checkov_skipped.py` ·
`.github/requirements/README.md` (the densest document in the tree) ·
`ci.yml` · `benchmark.yml` · `GROWTH.md` · `SECURITY.md` · `CHANGELOG.md` ·
`.claude/skills/semantica/SKILL.md` · `explorer/tests/` · README **last**.

The requirements README and the CI comments are where this repository keeps its
paid-for failures. They state mechanisms, not rules — the difference between "pin
your dependencies" and "`--no-deps` only skips *runtime* dependency resolution;
`-e .` still does a build which by default creates an isolated build env and
fetches `[build-system] requires` completely outside any hash checking."

## Landed (6)

**1. `refusal-is-not-failure`** → `resilience/optional-dependency-degradation`.
Source: a fix applied across **58 call sites** — every module wrapped a registered
custom method in a `try`/`except` that logged a warning and ran the built-in
default on *any* exception, "including one a validator or policy gate raised on
purpose to say 'do not produce this output.' That made every registered gate
advisory rather than authoritative."
**The corpus named this gap and declined it in one line.** The sibling technique
`absent-degrades-malformed-fails-fast` says: *"Malformed is not 'the dependency
rejected it' — that is a runtime fact and a different technique."* That technique
did not exist. Phase 6's enumeration hunt found it by reading the denial.

**2. `destination-guard-integrity`** → `platform-observability/outbound-notifications`.
Source: a DNS-rebinding TOCTOU in a shared guard that "validated a hostname's
resolved IPs, then let the underlying HTTP client re-resolve the same hostname
independently at connect time," plus three defects found *while reviewing the
fix* (a pooled-connection leak per redirect hop, a thread race on a shared
session, and a restore that clobbered the caller's own header).
Home chosen on an asymmetry: the corpus **names** an SSRF-safe client in an
application and **specifies** one nowhere. Three subjects touch the concern
(`web-scraping`, `mcp-tools`, this one) and none owned it.

**3. `transport-selection` amendment** → `llm-agent/runtime-and-io/mcp-tools`.
Honestly downgraded from the triage row's "new technique": the technique already
says *"The output channel is sacred... a stray print statement into the framed
channel corrupts the conversation."* The amendment supplies the half author
discipline cannot reach — a **library** you did not write printing to stdout —
and two properties the corpus did not carry: the failure presents as a **hang**
that expires on a timeout (300 s on an empty graph in the source), not as a parse
error, and it is **load-dependent**, so it passes every small test.

**4. `vacuous-by-evaluation`** → `standards-and-gates/quality-gates`.
Source: a shape-constraint rule made unfalsifiable by the entailment regime
beneath it — "with entailment on, [the engine] infers the declared range class
onto every object, so a `sh:class` constraint can never fail and reports
`conforms: True` on non-conforming data."
The golden path enumerates **three** ways a check cannot fire, all defects of
plumbing found by tracing the exit-code path. This is a fourth, of a different
kind: the plumbing is correct and the *evaluator supplies the condition the rule
tests*. Landed as a technique, linked from that enumeration.

**5. `verification-scope`** → `security/supply-chain`.
Source: the PEP 517 build-isolation hole, stated independently three times in the
tree, plus the model-download subcommand that "fetches an unpinned, unhashed
wheel from [a] GitHub releases" outside the lockfile.
Distinguished from `dependency-policy-gates`, which finds *missing* ecosystems by
inventory. This one cannot be found by inventory: nothing is missing, and the
flag's scope is simply narrower than the command it decorates.

**6. `lockfile-freshness-oracle`** → `security/supply-chain`.
Source: `ci.yml`'s freshness step and its comment — "upstream package releases
must NOT fail CI (deps only change when `pyproject.toml` changes intentionally)"
— re-resolving with the committed file as a *constraint*. Folds in the
per-interpreter lockfile split (a stdlib removal forks the hash set) with the
exact diagnostic the source recorded.

## Already covered — catches, recorded so nobody re-proposes them

- **Unimplemented path returns empty instead of raising.** A query method
  "claimed to run a query but always returned an empty result… a caller trusting
  'no matches' (e.g. a compliance check) could draw a false-negative conclusion."
  Owned by `_laws.md#failure-not-empty-success`, which says it better: "exit 0
  with zero findings is the most expensive lie in automation."
- **Wall-clock export identity.** A document `@id` "minted from the wall clock, so
  re-exporting an unchanged graph produced a new subject every time." Owned by
  `_laws.md#identity-survives-reuse`, which names timestamps-as-ids explicitly.
- **A benchmark job that cannot run.** `benchmark.yml` references a `benchmarks/`
  directory that does not exist; the comment says so and the job is
  `workflow_dispatch`-only, so nothing notices. Owned by `quality-gates/gate-liveness`
  and by `dependency-policy-gates`' "demand at least one rendered verdict".

## Leads (return conditions attached)

- **Repairing a crash can arm a latent vulnerability.** A missing import made an
  injectable query method non-functional — "fixing the import alone (without also
  fixing the injection) would have silently armed it." Return: a second
  independent sighting, or a subject that owns repair sequencing. This is the
  strongest unbanked finding in the tree.
- **A blocklist that states its own residual hole.** "This is a blocklist, not a
  grammar — a boolean-blind subquery using none of the blocked keywords could
  still get through." Corroborates `mcp-tools/egress-argument-gating`'s existing
  "write the residual hole down" rule from a second domain. Return: fold into that
  technique on a third sighting.
- **A scheduled install test of the *published* artifact** catches breakage no
  commit caused. Return: when `build-and-release/packaging` is next opened.
- **A roadmap checklist needs a third state — declined, with reason.** `GROWTH.md`
  records *considered and deliberately skipped* items with rationale. Converges
  with this skill's own decline-ledger doctrine from an unrelated domain. Return:
  a second sighting outside our own method.
- **Name the metric-gaming moves you refuse.** `GROWTH.md` enumerates the specific
  gaming techniques it declines (looping CI installs to inflate counts,
  package-splitting to multiply installs) rather than only stating the north star.
  Return: a measurement subject that owns Goodharting.

## Untriaged — extracted, reached the table, nobody verified (9)

Recorded with anchors so a later run does not re-derive them. **Nobody looked at
these; they are not declines.**

| # | Claim | Anchor |
|---|---|---|
| 1 | A mismatch must veto, not merely fail to boost — a scorer that only adds evidence for agreement merges on absence of evidence | `#1137` |
| 2 | Widening what a call forwards widens what its cache must key on | `#1213`/`#925` |
| 3 | A metric with two possible outputs across all inputs is a placeholder — assert variance | `#1142` |
| 4 | A `**kwargs` catch-all silently downgraded a persistent store to in-memory | `#970` |
| 5 | A store with background flush needs an explicit flush before a reopen-based read | `#970` |
| 6 | Per-file denylist of known-wrong API names in docs, with negative lookbehind so a real neighbour does not trip it | `docs_check.py` §6 |
| 7 | A rename leaves debris — denylist the retired org slugs | `docs_check.py` §4 |
| 8 | Docs code blocks validated against the support floor, not the dev runtime | `docs_check.py` §7 |
| 9 | A platform exemption narrowed by a positive failure marker (skip the noise, not a real failure) | `docs_check.py` §10 |

## Run conditions

Board: **4 siblings live** at Phase 5 — `intake-pgrust-0831`, `intake-ripgrep-0831`,
`intake-agentic-patterns-0831`, `intake-pgsql-ship-0831`. None held any of the four
subjects this run claimed; `check` returned clear on all five target files
immediately before the first write. Technique count moved +6 against this run's +5
during the run, confirming siblings were landing concurrently — the commit is
pathspec-scoped and the index was **not** regenerated for that reason.

Fetches spent: **0 of 3.**
