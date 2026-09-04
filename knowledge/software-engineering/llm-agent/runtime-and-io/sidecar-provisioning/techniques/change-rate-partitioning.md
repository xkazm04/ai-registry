---
layer: technique
type: technique
subject: sidecar-provisioning
technique: change-rate-partitioning
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [one payload re-downloads gigabytes on every routine release, deciding where to cut a downloadable artifact into pieces, two halves of a provisioned dependency move on different clocks]
---

# Change-rate partitioning

A provisioned payload arrives as one archive because that is how it was
built, not because anything about it is indivisible. Inside it are parts
that move on completely different clocks: a server core that is rebuilt
with every application release, and an accelerator-library set — often the
larger half by a wide margin — that changes only when the vendor toolchain
underneath it moves, perhaps twice a year. Shipping them as one unit means
every routine patch release recharges the whole thing, and the user pays a
multi-gigabyte transfer for a few megabytes of actual change.

The technique is to **cut the payload along the seam where its parts change
at different rates, and give each part its own version identity and its own
staleness predicate**, so a release recharges only what actually moved.

## The cut rule

The seam is not a size seam, not a directory seam, and not a "what feels
like a module" seam. It is a **change-frequency** seam, and it is the same
cut rule that
[compilation-unit-splitting](../../../../engineering-process/build-and-release/build-economics/techniques/compilation-unit-splitting.md)
applies on the build-invalidation frontier: code that changes daily sits
downstream of code that changes monthly, so an edit invalidates the small
thing and not the large one. This technique is that rule's sibling on the
**distribution** frontier — the frontier is a network transfer instead of a
compiler run, and the invalidation event is a release instead of an edit,
but the question and the answer are identical.

A cut is worth making when all three hold:

1. **The rates genuinely differ.** One part rebuilds every release; the
   other rebuilds on an external cadence you do not control. If both move
   together, you have added two version identities and bought nothing.
2. **The large part is on the slow clock.** Cutting a 50 MB slow part out
   of a 1 GB fast one saves nothing. The win is proportional to
   *size × avoided recharges*, and the whole point is to keep the biggest
   bytes on the slowest clock.
3. **The parts compose deterministically at rest.** Both halves extract
   into one managed directory and the runtime loader finds a single tree.
   A partition that requires the consumer to reason about which half a file
   came from has moved the complexity rather than removed it.

## Each part carries its own identity and its own predicate

This is the load-bearing half of the technique, and the half most
partitions get wrong by keeping one version number and hoping.

- **Two version identities.** The fast part is versioned with the
  application. The slow part is versioned on its own axis — a marker
  naming the upstream toolchain generation it was built against, bumped by
  hand when that generation changes, and stored beside the extracted files
  so it survives restarts.
- **Two staleness predicates, computed independently.** "Do I need the
  core?" compares the installed core's recorded version against the
  expected application version. "Do I need the libraries?" compares the
  installed library marker against the expected marker constant. Neither
  predicate may consult the other's answer; the moment one is derived from
  the other, the partition has collapsed back into one artifact with extra
  steps.
- **One acquisition path, per-part readiness.** The provisioning flow asks
  both predicates, fetches only the parts that answer yes, and reports
  readiness as *all parts present and verified* — never as "the last
  download succeeded". A machine holding a current core beside a stale
  library set is a real, reachable, and completely silent state unless the
  readiness verdict is the conjunction.

Each part still arrives under the full discipline of
[atomic-downloads](./atomic-downloads.md): its own staged partial file, its
own verification before rename, its own in-flight guard. Partitioning
multiplies the number of atomic arrivals; it does not weaken any of them.
One consequence is easy to miss: with two acquisition paths, a single
downloader can now be entered twice concurrently — a background
auto-update task and an operator-triggered endpoint reaching for the same
part — so the in-flight guard becomes a *named mutual-exclusion primitive*
rather than an incidental flag. Without it the progress-manager status
check is a check-then-act race on a shared staging name.

## Two facts, not two replicas — why this is not a version conflict

The neighbouring standard
[version-single-truth](../../../../engineering-process/build-and-release/release-pipeline/techniques/version-single-truth.md)
says the version is **one fact** recorded in many places, and that any
replica accepting an independent hand edit gives the version two
authorities. Read carelessly, a payload with two version numbers looks
like exactly the violation that standard exists to prevent.

It is not, and the distinction must be stated or the next reader files a
defect. That standard's jurisdiction is **replicas of one fact**: the
package descriptor, the build manifest, the installer metadata and the
binary's self-report all answer the same question — *what release is
this?* — and must therefore answer it identically. A change-rate partition
asserts **two facts about two different questions**: *what release is the
application?* and *what upstream toolchain generation are these libraries
built for?* Those are separate vocabularies with separate authorities and
separate propagation paths, which is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
honoured, not broken. The test is mechanical: if bumping one number should
ever force the other to change, they were replicas and you have a drift
bug. If they can move independently and correctly, they are two facts and
the second authority is legitimate.

## The allowlist: not everything that matches the pattern goes

The split is implemented by a classifier over the built tree — a name and
path pattern that decides, per file, which archive a file belongs to. Every
such classifier acquires an **explicit hold-back list**: files that match
the pattern by name but must stay in the fast part anyway. The usual
occupants are small source stubs and mock modules that share a naming
prefix with the heavy runtime libraries but are neither heavy nor
runtime — they are import-time scaffolding the core needs in order to load
at all, and moving them to the slow archive makes the core unloadable when
the slow archive is absent.

Keep the hold-back list **enumerated and commented**, one entry per reason.
It is a manifest decision in exactly the sense
[native-payload-verification](../../../../engineering-process/build-and-release/packaging/techniques/native-payload-verification.md)
means: what is deliberately absent from a partition is as much a declared
fact as what is present, and a classifier with an unexplained exception is
a landmine for whoever next tunes the pattern. Verify the classification on
the produced archives, not on the classifier's own report — the archives
are the target ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## This axis is not a grade

The partition axis and the [grade-selection](./grade-selection.md) axis are
easy to conflate and behave nothing alike. Grades are **interchangeable**:
a reduced-precision variant and a full-precision one both answer the same
request, unequally, and choosing between them is a quality decision. The
halves of a change-rate partition **do not substitute for each other** —
neither half is a degraded version of the whole, and there is no
circumstance under which having only the core is "running at a reduced
grade". It is simply not provisioned. Keep the verdicts separate: a
partially-arrived partition reports *absent*, not *degraded*.

Residency accounting inherits the split too. Both parts live in one
managed directory under
[model-storage-lifecycle](./model-storage-lifecycle.md), but each carries
its own accountable identity and its own reaper — evicting the slow part
must return the capability to an honest not-installed state rather than
leaving a core that will fail at load with an opaque symbol error.

## When not to partition

- **When the parts move together.** Two version identities on one clock is
  pure overhead and a guaranteed future drift bug.
- **When the payload is small enough that a full recharge is not felt.**
  The technique buys transfer volume; below the threshold where users
  notice, it costs complexity and buys nothing.
- **When the seam cannot be computed from the built tree.** If deciding
  which archive a file belongs to requires knowledge that only exists in
  someone's head, the classifier will silently misfile a file on the next
  upstream layout change, and the failure surfaces as a missing symbol on
  a user's machine rather than as a build error.
- **When the parts have a compatibility matrix rather than a seam.** If
  core version N works only with library marker M, and the pairing is
  non-trivial, you have not partitioned a payload — you have created a
  distributed version-compatibility problem, and the honest move is either
  one archive or an explicit declared compatibility range checked before
  the parts are allowed to compose.
