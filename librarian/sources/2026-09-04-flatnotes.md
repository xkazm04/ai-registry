---
source: flatnotes
kind: vendor-repository
url: https://github.com/dullage/flatnotes
title: "flatnotes — a self-hosted, database-less note-taking web app over a flat folder of markdown"
author: dullage
words: 523 (landing page) / 4222 (server tree, in-repo)
commit: 7f5b773c9cb37cc84978079ed4790e7de38d3970
extracted: 11
accepted: 1
declined: 0
leads: 1
already_covered: 0
untriaged: 7
applied: 1
shipped: 1
dispatched: 0
run_id: flatnotes-2026-09-04
siblings: 2
---

# flatnotes

Operator handed the URL with no framing. Board carried two live siblings at
Phase 0 (`duckdb-wasm`, `pi-2026-09-04`); neither held `integration/markdown-vault`
or `security/data-and-transport/browser-credential-boundary`, and the `check`
before the first write came back clear.

## Class and expected yield

**Vendor repository** — a small, mature, single-author self-hosted app. Cloned
per Phase 2b; the landing page is 523 words and the server tree is 4,222, so the
ingest would have returned 11% of the source and all of the marketing. No
`docs/`, no ADRs, no tests, no CHANGELOG in-tree. Swept in the method's order:
the abstract backends (`notes/base.py`, `auth/base.py`, `attachments/base.py`)
as the contract surface, `global_config.py` as the config schema, the models as
the type surface, `main.py` as the routing surface, `Dockerfile`/`entrypoint.sh`
as the deployment posture, README last.

Expected yield stated before triage: design decisions in code rather than
claims; 2–3 landings; no forge. Actual: 1 technique, 2 applications, 1 fleet
commit. Calibrated.

## Phase 2d — the design record and the routing count

Seven entries, grouped by system.

**System A — the note store and its search mirror**

- **A1.** The search index is reconciled at the start of every search and tag
  listing, by comparing each indexed record's stored mtime against the file's
  live mtime — never by a watcher, never on the write path.
  *forces:* the storage directory is a plain folder a human's editor, a checkout
  and a sync agent all write to; watch APIs are unavailable or silently
  unreliable on bind mounts, network shares and sync-backed volumes.
  *buys:* the staleness window is the read itself. *rejects:* filesystem
  watching, write-through indexing. *where:* `file_system.py:118,157,234-270`.
  *stage:* mirror reconciliation. *corpus:* **NONE** — `mirror-indexes` names a
  periodic reconcile as an option and models neither trigger nor gate;
  `editor-interop` models watching plus a time bound and explicitly enumerates
  those two. HOME IF NEW: `software-engineering/integration/markdown-vault`.
- **A2.** The mirror stores the source's own mtime and the gate compares for
  *inequality*, not ordering; there is no separate ledger.
  *forces:* a sync agent, checkout or archive extraction moves mtimes backwards.
  *buys:* `gate-sees-target` has no gap to confess. *rejects:* the hash-ledger
  gate `mirror-indexes` models. *where:* `file_system.py:35,217-223,250-253`.
  *corpus:* **NONE**, same home as A1.
- **A3.** The mirror's schema version is the index's *name*; a bump makes the
  old index not-found and the directory is cleared and rebuilt.
  *buys:* schema evolution of a derived store is a one-constant edit — the tree
  is at version 5 with no migration code. *where:* `file_system.py:28,173-192`.
  *corpus:* partial — `mirror-indexes` requires the rebuild exist, leaves its
  trigger to human judgment. Same home.
- **A4.** Index lock contention is absorbed by bounded retry and then degraded
  to a logged error; the search runs against a possibly stale index.
  *where:* `file_system.py:272-286`. *corpus:* `retry-backoff`,
  `optional-dependency-degradation/absent-degrades-malformed-fails-fast`.
- **A5.** The index stores no content; a highlight re-reads the source file.
  *where:* `file_system.py:39` vs `:343`. *corpus:* partial — the storage
  consequence of `mirror-indexes`' "the vault is authoritative".

**System B — the HTTP surface and deployment posture**

- **B1.** A read-only deployment is expressed by not registering the mutating
  routes; they do not exist rather than being refused, and the published OpenAPI
  schema is truthful for the deployment.
  *forces:* the mode is a boot-time, deployment-wide property with one operator.
  *rejects:* a request-time guard, a middleware. *where:* `main.py:87,227`.
  *corpus:* partial — `sql-console/safe-mode-guarding` and
  `agent-cli-transport/permission-stance-enforcement` both model *where the
  runtime guard stands*; neither models the capability's absence.
- **B2.** The storage layer raises only builtin OS exceptions; `main.py` holds
  the single mapping to status codes, so a second backend translates into a
  vocabulary it already raises. *where:* `main.py:79-84,99-107,116-128`.
- **B3.** The built SPA's `<base href>` is rewritten in place at process start
  from the path-prefix env var, so one image serves any reverse-proxy subpath
  with no rebuild; the client reads it back as its own authority on its base
  path. *where:* `main.py:27`, `helpers.py:63-76`, `tokenStorage.js:3-6`.

**System C — the credential path**

- **C1.** The session token is written to a cookie scoped to the base path with
  `SameSite=Strict`, to sessionStorage as the working copy, and to localStorage
  only on opt-in — because markdown-embedded attachments are browser-initiated
  subresource loads that carry no `Authorization` header while the attachment
  route stays guarded. *rejects:* signed attachment URLs, an unguarded route,
  HttpOnly (impossible, JS writes it). *where:* `tokenStorage.js:8-19`,
  `local.py:79-81`, `main.py:201-211`. *corpus:* **NONE** —
  `browser-credential-boundary` models regime one, regime two and the broker,
  but not credential transport for requests the browser issues rather than the
  app. HOME IF NEW:
  `software-engineering/security/data-and-transport/browser-credential-boundary`.
- **C2.** The TOTP code is concatenated onto the password rather than being a
  second field, so enabling 2FA changes no client code and no API shape;
  single-use is enforced by remembering the last accepted code in process
  memory — an auth invariant owned by `entrypoint.sh`'s single-worker launch.
  *where:* `local.py:40,50-70`, `entrypoint.sh:24-31`.

**System D — attachments**

- **D1.** An upload never overwrites: exclusive create, and on collision a
  UTC-timestamp suffix with the *actual* stored name returned, so an attachment
  URL written into a note always resolves to the bytes it resolved to then.
  *where:* `attachments/file_system/file_system.py:25-54`.

**Routing count, both v2.2 clauses.** Whole-tree `corpus: NONE` = **3** (A1, A2,
C1). Per system, max = **2** (System A). The three NONE entries do **not** share
one HOME IF NEW: two land inside the existing `markdown-vault` subject, one
inside the existing `browser-credential-boundary`. Neither clause fires.
**Decision: stay in intake, no forge handoff.**

The count changed what was extracted, not only where it routed: computing it at
Phase 2d re-aimed the sweep onto `notes/file_system/file_system.py` and away
from the client, which is where a README-led read would have gone — the README's
own "Features" list leads with the editor and the UI, and the reconcile loop
that turned out to be the run's whole yield is not mentioned in it at all.

## Triage

Table of 11 candidates presented. Operator picked **row 1 only**, with fleet-wide
ship authority ("any project where upgrade potential possible"). No row was
declined; the unpicked rows are **untriaged** and recorded below with anchors.

## Accepted

**Row 1 — read-triggered reconciliation** → new technique
`integration/markdown-vault/read-triggered-reconciliation`, with A3 folded in as
its schema-rebuild section (flagged on the table as folding into row 1).

The finding is an **enumeration** catch in the sense of Phase 6 step 3.
`editor-interop:78-94` enumerates exactly two answers to "how does the
application learn the human edited a file" — a watcher, precise and silently
unreliable, and a time-based staleness bound, "the honesty mechanism", with the
watcher explicitly "demoted to an optimization". The source contains the case
that enumeration does not: bind the rescan to the read and neither is needed,
because the window closes. The discriminator is honest and stated in the
technique — affordable only while the corpus is small enough that a full
enumeration is not itself the query, and reads are human-paced.

**Corroboration: training-data convergence, 0 of 3 fetches spent.** The rule is
reachable without the source in front of me — validate-on-use cache
revalidation, and mtime-comparison-on-demand as the oldest build-tool
reconciler, are both independent of this repository. The non-obvious half — that
the comparison must be inequality rather than ordering — is justified by
substrate behaviour the corpus already documents in `replicated-substrate`, and
that justification is where the technique is stronger than the source, which
uses `!=` without explaining why.

Golden path updated: frontmatter list, a paragraph in "Mirrors are derivations",
a technique-list entry, and one new failure mode ("the stamp nobody resolves").

## Applied — and the seam contained the defect

**Mode `code`, verdict `better`, proof `ab-paired`.** Project: `personas`.

The seam: the project keeps a context index whose records carry a
`reconciledToSha`, and a zero-dependency pre-push gate maintains it. The gate
computed staleness **entirely from the uncommitted working diff** and never
resolved the stamp at all — the technique's failure mode "the stamp nobody
resolves", plus "the gate that only sees the change in flight", both live.

| | A (working-diff gate) | B (stamp resolved against history) |
| --- | --- | --- |
| warnings | 1 | 2 |
| `--strict` exit | 0 | 1 |

Arm B's added warning: the recorded stamp does not resolve to a commit in the
repository at all. Behind it, the module's context document was last committed
2026-06-11 while **4,215 commits touching 8,788 files** have landed since — none
of it ever visible to arm A, because none of it was ever in a working tree at
the moment the gate ran. Second branch verified separately against a resolvable
stamp: reports 4,198 commits since, context untouched in any of them.

**Seam-defect find (scorecard focus 3).** The corpus predicted a defect in a
tree nobody was auditing, and the prediction landed on the first project tried.
Fleet reach: 1 of 8 projects carries this seam — `personas` is the only one with
a context index carrying a reconcile stamp; `politicas`, `pumper`, `tracklight`,
`goat`, `grant` and `kp` carry `registry-map.json` without one, and `gravity`
none. Stated even though it is small, per the focus.

Two defects were introduced and caught inside the change itself, both recorded
in the application: `git rev-parse <sha>^{commit}` is not portable through
`cmd.exe` (where `^` is the escape character) and would have reported every
*valid* stamp as unresolvable — caught only because the resolvable branch was
exercised deliberately rather than inferred from the failing one; and the git
helper inherited stderr, so a healthy run printed a bare `fatal:` line.

Applications written: `python--read-triggered-reconciliation` (the source tree,
per Phase 7 v2) and `node--read-triggered-reconciliation` (the fleet project).

## Directions not proposed — 0 of 4 candidates

Fleet map regenerated under the `index` lock. `markdown-vault` shows four
`candidate` absences and **none of them became a proposal**:

- **gravity, goat, grant** — untestable. Their manifests carry no `scope:` block,
  so Phase 7.6's admission question ("does `scope.does` admit the decision's
  *forces*?") has no input to run against. Not a decline; the instrument the test
  needs is missing. Third run in a week to report this, and it is now the single
  most common reason a direction pass produces nothing.
- **tracklight** — testable, and correctly declined **on forces rather than on
  domain**. Its `scope.does` is "ingest LLM telemetry, score with judges,
  benchmark providers, serve an operator API". It owns its telemetry store
  outright: no human editing the records beside it, no sync agent underneath, no
  peer writer of any kind, and therefore none of the conditions that make
  reconciliation a question at all. A project whose domain matches while its
  forces do not has no direction here, which is exactly the case the phase's rule
  is written for.

`librarian/fleet-map.json` is left uncommitted — it references a sibling's
`remote-capability-probing`, which is not in `HEAD`.

## Leads

- **One image, any subpath.** Patching the built SPA's `<base href>` at process
  start rather than at build time, with the client then reading the tag back as
  its authority on its own base path (`main.py:27`, `helpers.py:63-76`,
  `tokenStorage.js:3-6`). Plausible home `client-architecture/app-shell`.
  *Return condition:* when a second independent source shows the same
  boot-patch-the-artifact shape, or when a fleet project needs subpath hosting
  from a single build.

## Untriaged — extracted, reached the table, nobody picked them

Nobody verified these. They are **not** declines and carry no judgment.

| Row | Title | Anchor | My read at triage |
| --- | --- | --- | --- |
| 2 | A guarded subresource needs the token in a cookie | `tokenStorage.js:8-19`, `local.py:79-81` | real gap — `browser-credential-boundary` models no transport for browser-issued requests |
| 3 | A capability the deployment lacks has no route | `main.py:87,227` | partial — promoting question: does `authorization`'s golden path model boot-time capability absence, or only runtime guards? |
| 5 | A deprecated key read "only if the new one is falsy" conflates unset with explicit-false | `global_config.py:54-66` | real gap, small — a live defect in the source; boundary for `fallback-retirement-condition` |
| 6 | Single-use TOTP in process memory is an invariant owned by the entrypoint's worker count | `local.py:40,65-70` + `entrypoint.sh:24-31` | partial |
| 8 | Upload never overwrites: exclusive create, timestamp suffix, return the real name | `attachments/file_system.py:25-54` | partial |
| 10 | Lock-retry-then-degrade on the single-writer index | `file_system.py:272-286` | likely catch (`retry-backoff` + `absent-degrades-malformed-fails-fast`) |
| 11 | The backend contract is spelled in builtin OS exceptions; one mapping table | `main.py:79-84` | likely catch |

One source-tree defect worth recording though it lands nowhere in the corpus:
`_extract_tags` (`file_system.py:200-202`) detects tags on content with code
blocks removed but strips them from the *full* content, so a `#word` inside a
fenced block is correctly not indexed as a tag and is also deleted from the
indexed content — searchable text vanishes from code blocks.

## Notes on the class

A 4,222-word server tree with no ADRs, no tests and no design documents still
produced a full seven-entry design record, because the *contracts* were legible:
three abstract base classes, a config object whose every field validates and
exits, and a models module. Where a tree has no design documents, the abstract
surfaces are the design documents — and they cannot hedge, because something
compiles against them. The README named the design principle correctly and named
none of the mechanisms that implement it.
