---
domain: software-engineering
subject: markdown-vault
last_touched: 2026-09-06
touched_by: intake
dry_streak: 0
---

# markdown-vault

First touch: [[2026-08-30-1]], scoped `/deepen` under the librarian sweep that fixed the
demand instrument. Ranked #3 (49 points) on the corrected worklist; it had read 93 under
the double-counted demand. Both structural debts — single stack, never swept — closed in
one pass.

## New technique: `replicated-substrate` (7 techniques)

**Three-lane convergence, and the convergence is auditable.** The blind training-data
lane predicted it before any search ran; the web lane documented it per-vendor; the
atomic-write counter-evidence lane arrived at it sideways.

The doctrine named one peer writer — the human's editor — and missed a second: **the
replication agent under the store**. Its conflict copies and merge residue enter the
corpus as ordinary notes every walk enumerates. It rewrites the mtime the staleness
detector reads. And it produces dematerialized records and partial trees, both of which
defeat the abort-on-unreadable guard because nothing is unreadable — the files are
simply absent.

The worker checked its own overclaim and declined it: mtime rewriting is **not**
universal, several sync agents preserve it, and the technique says so.

## Single-stack debt: CLOSED

`node--link-graph-extraction` against a real external tree at `node@22`, filling the one
technique that had zero applications. Rust + node.

## Refuted

- **Basename resolution.** It is **path-suffix**, via a reversed-path trie —
  corroborated independently by the web lane across four tools.
- **Case-fold normalization.** It is a three-step pipeline with Unicode canonical form
  first. The reference implementation has no canonical normalization and uses a
  locale-sensitive lowercase, so the gap ships easily.
- **`vault-as-database`'s identity claim**, as stated. Landed as a **fork, not a
  preference**: minted ids govern only out-of-band references; human-authored in-band
  links need observed-rename; each fails exactly where the other succeeds — ids at the
  unobserved rename.

Also landed: **locate by structure, decompose by pattern** — AST-typed nodes rather than
a regex scan *deletes* the code-fence false-positive class instead of filtering it. And
**debounce is for recompute consumers, not diff consumers**.

## The deletion incident (behind `absent-guard-is-loud`)

All five rust applications re-verified at `rust@1.97`; roughly twenty citations had
drifted. The finding: the semantic-lint module no longer exists — 581 lines deleted three
days after the application documented it, in a commit titled *"delete 72 unreachable IPC
commands and everything they held up"*. Verified independently by the Director against
the tree's history.

**The judgment tier was written correctly and never wired to a surface, so a dead-code
sweep took it.** That is the second false-clean cause: *absent is not unreadable*. An
orphan is a link-graph predicate, not a reachability verdict — search, tags, folders and
name-mentions are parallel surfaces.

## Where the blind lane was wrong

Recorded because a lane that is never wrong is not being audited. It predicted
frontmatter links are false positives; at least one major convention treats them as real
edges. The technique carries the correction, not the error.

## Open leads

- **YAML type-coercion** (bare-scalar coercion) and **filesystem name constraints** —
  the blind lane raised both, neither got independent corroboration. Banked, not written.
- **No application for `replicated-substrate`** — no tree implements it, and one was not
  manufactured. Return when a connected project puts a vault under a sync agent.

## Cross-subject proposals

- `file-browsing` — dematerialized/on-demand files and partial trees are general to any
  directory walker, not vault-specific.
- `sync-replication` — conflict artifacts re-entering a scanned corpus as records; atomic
  rename reading as delete-plus-create to a replication agent.
- [[agent-memory]] — the unwired-optional-tier deletion incident, and in-band review
  dates over substrate-owned timestamps.
- **Home-ambiguous:** the debounce split (recompute vs diff consumers) is general to any
  change-event subject; it currently sits in two techniques here and may belong upstream.

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
