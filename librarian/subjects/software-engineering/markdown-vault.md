---
subject: markdown-vault
domain: software-engineering
last_touched: 2026-09-06
touched_by: intake
dry_streak: 0
---

# markdown-vault

First touch by `/intake`: 2026-09-04, from a self-hosted markdown note-taking
service handed over by the operator with no framing. The subject was already
mature — 7 techniques, 6 applications, a golden path that states its own physics
("the engine is the filesystem; the concurrent writers include a human with a
text editor") — and sat at 44 attention points on the librarian worklist, third
in the software-engineering domain.

## State

7 → 8 techniques, 6 → 8 applications (first `python` application; the subject was
`rust`-heavy with one `node`).

Landed: **`read-triggered-reconciliation`** — the reconcile's *trigger* rather
than its mechanism, which is the axis `mirror-indexes` and `editor-interop`
between them left unowned.

## How it was found, because the shape is reusable

By the **enumeration hunt** (Phase 6 step 3), on a document that had already
done the hard thinking. `editor-interop:78-94` is an unusually good passage: it
lists the watcher's silent failure modes one by one, concludes that they "turn
the time bound above from prudence into the load-bearing mechanism", and
explicitly demotes the watcher to "an optimization that usually fires first".
That is a two-member enumeration stated with real confidence — a watcher, and a
time-based staleness bound — and confidence is exactly what makes an enumeration
worth one question.

The source contained the third member. Bind the rescan to the *read* and neither
is needed: the staleness window collapses to the query itself, so there is no
window left to bound and no watcher left to fail silently. The subject had
modelled *how* a mirror is rebuilt in depth and *when* almost not at all.

Two things came with it that make the technique more than a trigger swap:

- **The stamp lives in the mirror, so there is no ledger.** `mirror-indexes`
  models the hash-ledger gate honestly, including the confession it owes under
  `gate-sees-target` — the gate reads the ledger and believes it read the disk.
  Storing the source record's own change-stamp *as a field of the mirrored
  record* removes the third store, and with it the gap that needed confessing.
- **The comparison is inequality, not ordering.** Justified from
  `replicated-substrate`, which the subject already owns: a sync client, a
  checkout or a timestamp-preserving copy writes modification times wholesale
  and can install an *older* file. A `<` gate reads that as "the mirror is
  ahead" and serves the superseded derivation forever. The source uses `!=`
  without explaining why; the corpus supplied the reason, which is the run's
  clearest case of the registry being stronger than the tree it read.

One new failure mode was added to the golden path — **the stamp nobody
resolves** — and it is not hypothetical; see below.

## What it cost

Nothing in fetches. Corroboration was training-data convergence (validate-on-use
cache revalidation; mtime-comparison-on-demand as the oldest build-tool
reconciler), and the non-obvious half was corroborated *by the corpus itself*
rather than by the web. Fourth consecutive practitioner-codebase run to spend
zero of three.

## The apply, which found a defect

`personas`, mode `code`, verdict `better`, `ab-paired`, shipped `43988bd6d`.

The project keeps a context index whose records carry a `reconciledToSha`. The
pre-push gate maintaining it computed staleness **entirely from the uncommitted
working diff** and never resolved the stamp — both of the technique's first two
failure modes, live, in the first tree tried. The recorded stamp turns out not
to resolve to a commit in the repository at all, and the root module's context
document was last committed 2026-06-11 with 4,215 commits since. Arm A saw none
of it and had seen none of it for three months.

Fleet reach: 1 of 8 projects carries this seam.

## Leads and open ground

- The subject still has no application from a tree that reconciles on a
  **timer or an explicit refresh** — the two places the technique says the
  trigger moves to when the corpus outgrows the read path. Both branches of that
  boundary are asserted and neither is witnessed.
- Untriaged from the same source, adjacent but not landed: the derived index
  storing no content at all, so a search highlight re-reads the source file
  (`mirror-indexes`' "the vault is authoritative", as a storage consequence).
  Recorded with anchors in the source note.

- `file-browsing` — dematerialized/on-demand files and partial trees are general to any
  directory walker, not vault-specific.
- `sync-replication` — conflict artifacts re-entering a scanned corpus as records; atomic
  rename reading as delete-plus-create to a replication agent.
- [[agent-memory]] — the unwired-optional-tier deletion incident, and in-band review
  dates over substrate-owned timestamps.
- **Home-ambiguous:** the debounce split (recompute vs diff consumers) is general to any
  change-event subject; it currently sits in two techniques here and may belong upstream.

Source note: [[2026-09-04-flatnotes]]

## 2026-09-06 — `/intake` (flatnotes), run `intake-flatnotes-0906`

Source: `github:dullage/flatnotes` @ `7f5b773c` — a Python/Whoosh note app over
a flat markdown folder. Topped the librarian worklist that morning at **44
attention points**, the highest in the fleet, which is what routed the run here.

Landed **`projection-covers-the-record`** (new technique, 7 -> 8) plus a
`python` application — the subject's first Python stack; it was `node,rust`.

**The finding is an asymmetry, not a hole in coverage.** The subject models a
mirror's *freshness* with five separate mechanisms in `mirror-indexes` — the
rebuild path exists, incremental writes are hash-gated, mirror failure never
breaks the primary path, the skip-gate confesses its proxy, direction is the
contract — and models its *fidelity* with nothing. A mirror is written from a
**projection** of the record into the mirror's fields, and that stage had no
owner: the golden path's pipeline assigns the walk to `vault-walking`, the
record contract to `vault-as-database`, and the write and its gating to
`mirror-indexes`, and then the field projection simply happens.

The two properties are independent, and the source proves it in the cheapest
possible way: its index is reconciled **on every single query**, so it is never
stale by more than one search, and it still cannot find the token. Re-running
the rebuild reproduces the loss exactly, because the loss is inside the rebuild.

Measured on the source's own functions (known positive and known negative
asserted first): a `#tag` inside a code span is excluded from the tag set by
the extractor — correctly — and removed from the indexed body by the stripper,
which never heard about the exclusion. The token is in the file, on the user's
screen, and in **no field of the index**. Two adjacent lines,
`file_system.py:200-202`, each individually correct.

Also recorded in the application, as agreement rather than as a finding: the
tree compares mtimes with `!=` and not `>`, which is the predicate
`replicated-substrate` implies and does not state — the peer writers here set
timestamps *backwards*, so a `>` comparison would never re-index a note
restored from backup.

Folded in rather than banked separately: the source stores terms and no
content, which is the strong position on fidelity's other axis (the mirror
holds nothing with which to contradict the vault) and carries the consequence
that makes the defect expensive — with no stored document there is nothing to
dump, so the projection can only be re-executed, never read back.

**Untriaged with anchors**, held back on score and not on doubt:
`INDEX_SCHEMA_VERSION` is passed as the index's *name*, so a stale-schema index
is unopenable rather than detectably stale and no migration code exists. A
genuine mechanism, but honestly a boundary case of `mirror-indexes`' existing
rebuild rule, and as an amendment it scores G1 against a threshold of 2.

**Applied `experiment`, verdict `better`, shipped.** The seam is this registry:
`index.json` projects each document into slug, `use_when` and law statements and
drops the body, and `research-map.mjs` reads that projection — so the corpus's
own instrument carries the technique's defect, and the ledger has recorded false
absences from it twice without naming the mechanism. Paired: `shared custody`
(present in two document bodies, in no slug or `use_when` anywhere) returns
**0 owning rows out of 40** through the index and 2 under `--prose`. The failure
is not an empty result, it is a full one. Corrected the instrument's own
guidance, which had keyed the habit on emptiness while neither recorded failure
was ever empty.