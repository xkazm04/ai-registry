---
layer: golden-path
type: golden-path
subject: markdown-vault
status: forged
techniques:
  - vault-as-database
  - link-graph-extraction
  - knowledge-integrity-lint
  - vault-walking
  - mirror-indexes
  - read-triggered-reconciliation
  - editor-interop
  - replicated-substrate
---

# Markdown knowledge vault

A directory of markdown notes can be treated as a database: files are records,
frontmatter is the schema, links between notes are the relations, and queries
are walks. This is a real and load-bearing architecture, not a shortcut — it
buys durability (plain text outlives every application), inspectability (any
tool can read it), and above all **shared custody**: the human opens the same
store in their own editor and works it directly, with no API between them and
the data.

That last property is the physics of the whole subject. A conventional
database assumes it is the only writer and builds everything — transactions,
indexes, integrity — on that assumption. A vault *starts* by surrendering it.
The engine is the filesystem; the concurrent writers include a human with a
text editor and root privileges; the schema is advisory because no engine
rejects a malformed row. Every technique below is a consequence of designing
honestly under those conditions instead of pretending they away.

## Files as records, schema as convention

A record is a file whose frontmatter carries the typed fields and whose body
carries the document. This mapping works only when the write side is
disciplined and the read side is tolerant — the inverse of a real database,
where the engine enforces and clients can be sloppy:

- **The emitter escapes everything user-controlled.** A title containing a
  quote, a colon, or a newline must survive the trip into frontmatter and
  back byte-identically. The test that matters is the **round trip** —
  emit-then-parse equals the original — not the emitter and parser tested
  separately, because each can be individually plausible and jointly wrong.
- **The parser accepts what it did not write.** Hand-authored notes, older
  emitters, and other tools all produce legitimate records. Bare scalars,
  alternate quoting, missing optional keys — a reader that chokes on them has
  misunderstood whose store this is.
- **Identity lives in frontmatter, not the filename.** Humans rename files;
  titles collide; filename sanitization is lossy and one-way. A record that
  must be found again after a rename carries a minted id in its fields
  ([vault-as-database](./techniques/vault-as-database.md)). That governs the
  references the machine writes. The links the *human* writes cannot carry an
  opaque id and stay readable, so they name their targets and need the other
  mechanism — rename observed as a first-class operation, rewriting every
  referring link — which works exactly as well as the application's ability to
  see renames it did not perform.

The vault root is also a **trust boundary**: paths supplied by callers resolve
through one canonical funnel that rejects escape attempts and verifies
containment after full resolution — because a store made of files inherits
every filesystem attack the moment paths become inputs.

## The link graph is data, not decoration

Notes reference each other with inline links, and those references are worth
extracting into a first-class structure: an edge list, a backlink index, an
in/out-degree profile per note. The graph serves two masters at once
([link-graph-extraction](./techniques/link-graph-extraction.md)):

- **Navigation.** Backlinks answer "what points here"; high out-degree notes
  are de facto tables of contents; unresolved links are invitations — edges
  to nodes that do not exist yet.
- **Integrity.** A link whose target resolves nowhere is a broken reference.
  A note nothing points to is unreachable except by search. Both are
  measurable, and both are meaningless unless every consumer resolves links
  by the **same rules** — one shared extractor and normalizer, or the linter
  and the navigation will disagree about which links are broken.

The extracted graph is a derived value over a store other programs mutate.
It must name its recomputation (a fresh walk) and bound its staleness
(invalidation on observed change, plus a time floor for changes nobody
observed).

## Integrity is lint, because rot is silent

A knowledge store fails differently from code: nothing crashes, no test
reddens. A broken link waits until someone follows it; a stale note waits
until someone trusts it; an orphan simply stops existing for every reader who
navigates instead of searching. The failure mode is **invisible erosion of
trust**, and the countermeasure is the same one code uses for its silent
defect classes: lint —
[knowledge-integrity-lint](./techniques/knowledge-integrity-lint.md).

Three defect classes with detectors: broken links (reference integrity),
orphans (reachability), staleness (temporal integrity — a proxy predicate,
declared as such). Two tiers of detector: a deterministic syntactic pass
cheap enough to run always, and a judgment pass (contradictions between
notes, missing hub pages, missing cross-links) that is expensive, bounded,
and **propose-only**. And one structural rule inherited from every gate that
matters: the lint walk fails loudly on an unreadable corner, because a
partially-scanned vault reporting clean is the most expensive lie the store
can tell.

Detection and repair are separate passes with separate authority. Lint never
mutates. Repair is bounded, goal-declared, and measured before/after — and
"repair" that deletes a note without preserving its distinct facts is not
repair.

## Every operation begins with a walk

Enumerate the records: the query planner of a filesystem database is a
directory walk, and it shares physics with directory listing everywhere —
[file-browsing](../../ui-surfaces/data-display/file-browsing/file-browsing.md) owns the general subject.
What the vault adds is that *many* features walk the same tree, and each walk
makes three decisions that drift silently when hand-rolled per caller: depth
policy, exclusion policy (the editor's own metadata directories, trash,
hidden entries), and error policy — abort or skip, chosen by what the
consumer means by "done" ([vault-walking](./techniques/vault-walking.md)). One
shared walker with those decisions as explicit, per-caller options is the
cure; unifying them while silently changing any caller's semantics is a new
defect wearing a refactor's clothes.

## Mirrors are derivations, and they say so

The filesystem engine has no indexes. The moment queries outgrow the walk —
relational filters, full-text ranking, incremental change feeds — a second
store appears beside the vault, and every such store is a **derivation** of
it ([mirror-indexes](./techniques/mirror-indexes.md)). The vault is
authoritative; the mirror names how it is rebuilt from a full walk, gates its
writes on recorded state so re-runs are cheap and idempotent, and never lets
its own failure break the primary write path.

*When* it is rebuilt is a separate decision from *how*, and it has a third
answer beyond the watcher and the time bound below: bind the reconcile to the
read, so the derivation is swept immediately before the query it exists to serve
and the staleness window closes entirely
([read-triggered-reconciliation](./techniques/read-triggered-reconciliation.md)).
That trades a per-read enumeration for the entire class of invalidation bugs,
and it also disposes of the ledger — the mirror carries each source record's own
change-stamp, so the gate stats the file it is making a claim about instead of
consulting a third store about it. It is affordable while the corpus is small
and reads are human-paced, and the trigger moves when either stops holding.

Direction is the contract. A one-way projection (application data rendered
*into* the vault for the human to read and link) declares that human edits to
projected notes are overwritten — or it upgrades to two-way sync, which
requires remembering the content at last sync and running a three-way
comparison per record. Both-sides-changed is a conflict escalated to the
human; the comparison discipline is
[sync-replication](../../backend-platform/data-layer/sync-replication/sync-replication.md)'s ground,
consumed here rather than re-derived. Long-lived agents storing their memory
as markdown under a relational mirror are the same pattern with higher
stakes — [agent-memory](../../llm-agent/prompt-and-context/agent-memory/agent-memory.md) holds that evidence.

## The human's editor is a peer, not a client

The defining constraint, elevated to a design principle: another program —
the human's own editor — reads and writes these files whenever it likes, and
**it wins ties** ([editor-interop](./techniques/editor-interop.md)). So the
application never holds a file open, writes atomically so no reader ever
sees a torn note, watches for external changes instead of assuming quiescence,
emits the link and metadata syntax the editor renders natively, and hands
navigation *back* across the boundary with deep links addressed by full path,
not ambiguous basename. Overwriting a human edit because the application
wrote last is not a race lost; it is data loss with the application's
fingerprints on it.

## The editor is not the only peer, and the disk is not always a disk

The peer writer that gets designed for is a person. The one that gets forgotten
writes far more often: the replication agent underneath the store — a sync
client, a peer-to-peer syncer, a mobile companion, a version-control checkout —
because a store whose whole selling point is durable plain text is a store
people put somewhere it will be backed up and reach their other machines
([replicated-substrate](./techniques/replicated-substrate.md)).

It is a peer with none of the human's properties. Its writes carry no intent.
When replicas diverge it does not ask: it drops the losing version into the
store as a new file with a decorated name and the same extension, which every
walk enumerates as a note, every index doubles, and every orphan count charges
to the human. It rewrites modification times wholesale on copy and checkout,
which is the signal the staleness detector reads. And it can present the tree in
states a local disk never reaches — records whose metadata is present while
their content is still on a server, and trees that are simply incomplete because
replication has not finished. Both defeat the false-clean guard, because the
guard fires on unreadable and these are *absent*: a lint pass over them reports
a confident verdict and a crop of broken links pointing at notes that exist.

The correction is small and does not require knowing which agent is underneath:
exclude replication artifacts by name and say that you did, prefer an in-band
review date to a timestamp the substrate owns, treat a non-local record as
unknown rather than as empty, and let any whole-corpus verdict say it was
computed over what was present at the time.

## Failure modes this standard exists to prevent

- **The silent rot** — no integrity lint, so broken links, orphans, and stale
  claims accumulate until the humans quietly stop trusting the store.
- **The false-clean scan** — a walker that skips what it cannot read and
  reports the remainder as the whole vault.
- **The emitter/parser schism** — escaping bugs that corrupt round-trips, so
  records with quotes or colons in their fields silently stop matching.
- **Filename-as-identity** — a rename or title collision severs every
  reference that used the name as the key.
- **The drifted walkers** — five hand-rolled walks with five accidental
  policies, disagreeing about depth, hidden files, and errors.
- **The lying mirror** — a derived index with no named recomputation,
  trusted long after it diverged from the files.
- **The stamp nobody resolves** — a record of what the derivation was last
  reconciled to, written on every reconcile and read back by no gate, so it can
  hold a value that resolves to nothing while the store reports clean.
- **Fighting the user for the file** — locks, torn writes, or last-writer-
  wins against the human's editor.
- **The predicate-free count** — "12 orphans" from one feature and "31
  orphans" from another, because nobody wrote down which exemptions each
  count applies.
- **The corpus that is not all there** — a verdict over a partially replicated
  tree, or one that counts the sync agent's conflict copies as notes the human
  wrote.
- **The unreachable tier** — a judgment pass shipped without the affordance
  that invokes it, which drifts until someone deletes it as dead code.

## The techniques

- [vault-as-database](./techniques/vault-as-database.md) — the record contract:
  frontmatter schema, escaped emit / tolerant parse / round-trip tests,
  minted identity, sanitized filenames, atomic writes, and the one path
  funnel at the trust boundary.
- [link-graph-extraction](./techniques/link-graph-extraction.md) — links as
  edges: one shared extractor, normalization and resolution rules, backlink
  indexes, hubs and unresolved edges, and the cache honesty of a derived
  graph.
- [knowledge-integrity-lint](./techniques/knowledge-integrity-lint.md) —
  staleness, orphans, and broken links as defects with detectors; syntactic
  and semantic tiers; exemptions declared, not smuggled; repair as a
  separate, bounded, measured pass.
- [vault-walking](./techniques/vault-walking.md) — depth caps, declared
  exclusions, and error policies as explicit options on one shared walker;
  behavior-preserving unification.
- [mirror-indexes](./techniques/mirror-indexes.md) — secondary stores as named
  derivations: hash-gated incremental writes, projection vs two-way sync,
  and the ledger-vs-disk gap a skip-gate must confess.
- [read-triggered-reconciliation](./techniques/read-triggered-reconciliation.md) —
  the reconcile's trigger rather than its mechanism: the read as the staleness
  bound, the source's change-stamp stored in the mirror so the gate needs no
  ledger, inequality rather than ordering against a stamp the substrate owns,
  schema version as the derivation's name, and contention that degrades the
  answer instead of failing it.
- [editor-interop](./techniques/editor-interop.md) — coexisting with a peer
  writer: atomic writes and what replacing a file costs, change watching and
  what a watcher cannot see, deep links, native syntax, and conflicts escalated
  instead of raced.
- [replicated-substrate](./techniques/replicated-substrate.md) — the second peer
  writer: conflict artifacts entering the corpus as records, substrate-owned
  timestamps defeating the staleness proxy, dematerialized records and partial
  trees defeating the false-clean guard.
