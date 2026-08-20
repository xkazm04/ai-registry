---
layer: technique
type: technique
subject: maturity-ladders
technique: migrate-on-read
status: forged
laws: [failure-not-empty-success, derivation-names-recomputation, one-validation-door]
shared_with: []
use_when: [a ladder version was bumped with stored rungs in the wild, reading an old assessment, planning a rung rename]
---

# Migrate on read

Stored rungs outlive the ladder that produced them. The question is where the
translation happens. Rewriting the stored values in place — a backfill — destroys
the record of what was actually assessed and cannot be undone when the mapping
turns out to be wrong. The durable alternative: **stored values keep their
original version stamp forever, and a mapping is applied at read time**.

## The shape

Every stored assessment carries its rung *and* the ladder version that produced
it. On read:

1. Read the stored rung and its version.
2. If the version equals the current one, return it unchanged.
3. Otherwise apply the mapping chain from the stored version up to the current
   one, one step at a time, and return the mapped rung **flagged as migrated**,
   carrying the version it came from.
4. If any step has no honest mapping for that rung, return `unmappable` with the
   original value attached — not a guess, not the nearest neighbour.

Properties that make this the right default:

- **Nothing is rewritten**, so a bad mapping is a code fix, not a data-loss
  incident. This alone justifies the pattern.
- **The chain is composable.** Each bump contributes one step, so a record three
  versions old traverses three steps rather than needing an
  every-version-to-current matrix.
- **Migration is idempotent and pure.** Reading twice yields the same answer;
  reads never write.
- **One door.** The mapping lives in exactly one read path every consumer passes
  through ([one-validation-door](../../_laws.md#one-validation-door));
  migration sprinkled across call sites is migration minus the call site added
  next quarter, and the missed one reports old rungs as current.

The cost is real: reads are slightly more expensive and the chain accumulates.
Where it grows long enough to matter, *compact* it — collapse several steps into
one verified step — rather than backfilling; compaction changes code, not
history.

## Writing the mapping for a bump

For each rung of the old version, the mapping declares exactly one of:

- **identical** — the rung's criteria are unchanged; carry it forward.
- **renamed** — same criteria, new name. The most common case, and the reason
  stored rungs should be symbolic names with a rename map rather than positional
  integers that shift under insertion.
- **narrowed** — the new rung demands more. The old value cannot prove the new
  criteria, so map **down** to the highest new rung the old evidence provably
  satisfies. Never map up on a narrowing; that is inflation by migration, and it
  is invisible because it happens on read.
- **widened** — the new rung demands less. Mapping up is *still* usually wrong:
  the old assessment did not evaluate the new, weaker criteria. Map to the same
  or lower rung and let a re-assessment do the promoting.
- **unmappable** — the old rung has no honest correspondent (a dimension was
  split, a rung's meaning was reallocated). Say so.

A sixth case appears whenever the new ladder reads inputs the old one did not
collect: the criterion is **not unsatisfied, it is unknown**. Leave it absent —
never default it to false. A fabricated false is indistinguishable from a real
negative one read later, and it turns "we did not look" into "they do not have
it", which is the exact conflation the whole subject exists to prevent.

The governing asymmetry: **migration may demote, and may hold, but must not
promote.** Every promotion needs evidence, and a migration has none — it has only
an old verdict about different criteria.

## A migrated rung is a floor, not a measurement

The sharpest way to say what a mapped value is: **the highest rung the old shape
could possibly have supported**, which is usually well below what a fresh
assessment would find. When a boolean "present / absent" flag is replaced by a
four-rung ladder, `true` proves only that something existed — the second rung —
even for subjects that were in fact at the top rung all along. Mapping it to the
second rung is correct and it is also a systematic understatement.

Both halves must reach the reader, and the tag is what carries them: a migrated
value travels with its origin version and a plain-language note on what the
mapping could and could not know, so a low rung *on a migrated record* reads as a
floor implied by an old shape rather than as a verdict. Without the tag,
migration manufactures a fleet-wide false regression the first time the ladder
deepens.

The corollary for remediation text: when a criterion is unsatisfied because the
old assessment **never looked**, the recommended next action is "re-assess", not
"you are missing X". Telling a subject to install something it may already have
is the fastest way to lose the assessment's credibility, and the migration is the
only component that knows the difference.

## Unmappable is a first-class outcome

The temptation is to coerce: map the orphan to the nearest rung so the chart has
no holes. Resist it. A migrated value that cannot be interpreted must read as
uninterpretable — never as the floor rung, never as zero, never as absent. "We
could not translate this" and "this subject had nothing" are different facts, and
collapsing them is the empty-success failure applied to history
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)).

Distinguish two failures that both look like "bad version stamp". A stamp that is
**missing or unparseable** is best read as the *oldest* shape — the conservative
choice, since a record written before versioning existed genuinely is the oldest
shape, and running the full mapping chain over it lands on a floor rather than a
fabrication. A stamp that is **newer than the reader knows** is different: it
happens during rollout and rollback, and there is no conservative direction to
guess in, so it reads as unknown and the consumer is told to update, not shown a
rung.

Consumers therefore need a defined behaviour for `unmappable`, decided once:
trend lines break the series rather than interpolating; distributions report it
as its own bucket rather than dropping it (dropping silently shrinks the
denominator and flatters the remaining distribution); a subject's current status
shows "assessment out of date — re-run" instead of a rung.

## Re-assessment is the real repair

Migration keeps history readable; it does not produce a current answer. The
system's job is to schedule re-assessment, not to make the mapped value look
fresh. Two rules:

- Surfaces that drive decisions — gates, permissions, "can this be trusted"
  questions — should **refuse migrated values above a stated age** and demand a
  fresh assessment, rather than acting on a translated verdict.
- Surfaces that show history — trends, audit views — should show the migrated
  value *and* its provenance, because the historical claim is the point.

Any migrated value that is displayed names how it would be recomputed
([derivation-names-recomputation](../../_laws.md#derivation-names-recomputation)):
"mapped from v2 `curated`, assessed 2 quarters ago; re-run to refresh".

## Testing a mapping

The mapping is data over a tiny domain, so test it exhaustively:

- every rung of every historical version maps to something, including
  `unmappable`, with no silent default arm;
- no mapping step promotes;
- the chain from the oldest version to the current one is total and terminates;
- an unknown version stamp yields the unknown outcome, not a rung;
- a round-trip fixture per historical version: a stored record from that era
  reads today as the intended value.

## When not to use this

If no assessments are stored, or the stored population is tiny and fully
re-assessable within one cycle, a clean re-assessment beats a mapping — the fresh
verdict is strictly better evidence than a translated old one. Backfill remains
legitimate in exactly one case: a pure rename with no criteria change, where the
old and new values are provably the same claim — and even then the read-time
rename costs almost nothing and preserves the answer to "what did we literally
record".
