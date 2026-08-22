---
layer: application
type: application
subject: versioning-snapshots
technique: retention-and-pruning
stack: go
verified_on: 2026-08-22
---

# Retention & pruning in restic

How restic — the content-addressed backup tool — realizes the reaper half of
this subject. Citations are against restic `0.19.1-dev` (the tree's `VERSION`
file), `restic/restic` commit `a80be14` (2026-08-01). This is a reconciliation
against an external tree rather than the consumer repo the sibling applications
cite, so the pin lives here in prose rather than in `verified_against`, whose
contract is a stack runtime version.

## 1. Two operations, two blast radii

The technique treats pruning as one act; restic splits it into two commands
with different authority, and the split is the most transplantable thing here.
`forget` **unlinks snapshots only** (`cmd/restic/cmd_forget.go:320`; its help
text: the command "really only deletes the snapshot object in the repository",
`:35-37`). `prune` is the only act that touches data: it recomputes
reachability across every surviving snapshot (`getUsedBlobs`,
`cmd/restic/cmd_prune.go:285-297`) and removes what nothing points at. The
cheap, recoverable decision is thereby separated from the expensive
irreversible one — a bad forget is survivable until prune runs; chaining is
opt-in (`--prune`, `cmd_forget.go:157`, `:349-357`). A versioning feature that
fuses "drop the version row" with "reclaim its bytes" has thrown that
recovery window away.

## 2. Thinning is buckets, and every keep is explained

`ApplyPolicy` (`internal/data/snapshot_policy.go:189`) sorts newest-first
(`:191`) and walks six count-buckets — last / hourly / daily / weekly / monthly
/ yearly — each with a bucketer mapping a timestamp to a period key (`always`,
`ymdh`, `ymd`, `yw`, `ym`, `y`; `:198-210`). A snapshot is kept when its key
differs from the bucket's previous key and the bucket has count left
(`:250-268`): "recent at full density, sparser going back", in one pass. Two
refinements worth stealing:

- **The oldest snapshot is kept additionally** (`val != b.Last || nr ==
  len(list)-1`, `:256`), relabelled "oldest daily snapshot" (`:259-261`) — so
  thinning never silently drops the historical anchor off a bucket end.
- **Every keep carries its reason and the counter state.** `KeepReason`
  (`:169-184`) records the matches plus the six counters at decision time,
  printed to the operator (`cmd_forget.go:283-289`) and emitted as JSON
  (`:386-405`). The technique wants the policy visible; restic makes each
  decision explainable. Keep-all is spelled `unlimited` on the command line
  (`:70-86`), so no operator types a negative count.

## 3. Guards, not an age cutoff

- **Tag exemption** — `p.Tags` is checked first and is *not counted against any
  bucket* (`snapshot_policy.go:232-238`). This is the pin.
- **Relative-to-newest window** — `--keep-within` measures from the newest
  snapshot, not `now` (`findLatestTimestamp`, `:149-165`, applied at
  `:241-247`), and ignores future-dated snapshots (`:159`). A wall-clock cutoff
  would empty a repository the day backups stopped.
- **Empty policy refuses to run** — fatal, not a no-op that deletes everything
  (`cmd_forget.go:243-252`); the override is named `--unsafe-allow-remove-all`
  and additionally demands a snapshot filter.
- **Never empty a group** — `refusing to delete last snapshot of snapshot
  group` (`cmd_forget.go:280-282`). This is the active-version exemption in a
  system with no promotion lifecycle: each group's newest survivor is the
  restore target, and policy may not evict it.

**Deviation: the pin lives in the invocation, not in the store.**
`--keep-tag` is a flag on one run (`cmd_forget.go:141`). Tags are durable
snapshot state (`internal/data/snapshot.go:27`), but nothing marks a snapshot
*protected*; a forget that omits `--keep-tag` deletes tagged snapshots
happily. The technique's rule is that a pin binds the reaper unconditionally;
here it binds only when the operator remembers to restate it.

## 4. Prune fails closed, and the ordering is the safety property

Before deleting anything, prune verifies every blob reachable from a surviving
snapshot is present in the index; any miss aborts with `ErrIndexIncomplete`
and "Will not start prune to prevent (additional) data loss!"
(`internal/repository/prune.go:200-216`; error declared at `:18`).

`Execute` documents its ordering in a comment and obeys it (`prune.go:588-593`):
delete unreferenced packs → repack partly-used packs → **rewrite the index
ignoring what is about to go** (`:662-667`) → only then delete the packs
(`:669-673`). Index-before-delete means a crash leaves extra unreferenced
data, never a dangling reference — "keeping too many packs cannot damage the
repository", stated in-line twice (`:613`, `:671`); a repack that failed to
carry a kept blob escalates to fatal (`:637-643`). Both commands take an
exclusive lock and refuse `--no-lock` outside `--dry-run`
(`cmd_forget.go:189-194`, `cmd_prune.go:174-179`); dry-run returns before the
first mutation (`prune.go:595-604`).

## 5. The arithmetic is a declared tolerance for *not* reclaiming

`--max-unused` defaults to `5%` (`cmd_prune.go:81`, allowance computed at
`:136-138`, applied `prune.go:542-566`): reclaiming the last few percent means
rewriting pack files, so the default posture is to leave 5% garbage and skip
the I/O. `--max-repack-size` caps the work absolutely (`:548`); the
no-free-space hatch demands the repository ID be typed (`cmd_prune.go:104-107`,
`:185-191`). Content-addressing also inverts the technique's cost model: blobs
are shared, so forgetting a snapshot may free *nothing* — "storage freed" is
computable only by the reachability walk, which is why prune reports it as its
own stats block (`printPruneStats`, `:249-283`) instead of forget claiming a
number it cannot know.

## 6. Two more deviations, on the record-keeping side

- **No durable pruning log.** Everything a forget/prune run emits goes to the
  terminal printer or stdout JSON; no audit-record writer exists anywhere in
  `internal/` or `cmd/`. Redirect the output or you hold no record that a
  snapshot ever existed.
- **Lineage holes are left dangling.** A snapshot carries `Parent *restic.ID`
  (`internal/data/snapshot.go:19`), set at backup time
  (`internal/archiver/archiver.go:962`). Forget deletes snapshot files without
  re-parenting survivors or leaving a tombstone. Defensible by scope — restic's
  parent is a rescan optimisation, not an audit edge, and `copy` explicitly
  drops it (`cmd/restic/cmd_copy.go:352`) — but a system whose parent edge *is*
  the history owes the splice-or-tombstone decision this tree never makes.

## 7. Upward lesson: thinning is adversary-manipulable

restic's own documentation (`doc/060_forget.rst:421-445`) records an attack the
technique does not anticipate. Because bucket policies keep *the most recent
snapshot within each period*, an attacker who can write snapshots with chosen
timestamps (`backup --time`) injects one empty snapshot per week, slightly
newer than the real one, and the next scheduled `forget --keep-weekly 3`
deletes every legitimate snapshot while keeping the garbage. The documented
mitigation is `--keep-within`, which is additive rather than winner-take-all.
Generalized: **any thinning rule electing one survivor per bucket hands the
eviction decision to whoever controls the sort key.** Where timestamps are not
fully trusted, retention needs at least one additive, duration-based clause.

## Reconciliation summary

Confirmed: thinning by period buckets with the oldest anchor retained;
per-decision keep-reasons surfaced to operator and JSON; exemption guards
rather than an age cutoff; refusal to empty a group; empty policy fatal rather
than permissive; fail-closed integrity check before any deletion;
index-rewrite-before-delete ordering; dry-run and exclusive locking on both
commands; an explicit tunable tolerance for leftover garbage. Deviations: the
pin is an invocation flag rather than durable protected state; no durable log
of what was reaped; parent edges left dangling after forget. Not present by
scope: promotion lifecycle, per-version measurements, and the entity-deletion
contract — a backup repository has no entity above the snapshot, so
cascade-vs-survive never arises.
