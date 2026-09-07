---
name: dependency-compromise-exposure-assessment
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/incident-response
---

# Dependency compromise exposure assessment

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A compromised release is announced somewhere upstream and the question arrives
as a yes or no that nobody can honestly answer. The search that gets run is a search of
the declarations, which says what somebody asked for and not what was fetched, so the
same evidence supports declaring the project clean and stopping all work. Then the
fastest available response, upgrade the version and reinstall, deletes the only material
that could have said whether anything ran, and leaves every credential that was
reachable during the window still valid.

**Input.** The advisory naming the affected releases and the window they were available,
the project's declared dependencies and whatever lock records exist, the installed trees
and the logs of when they were built, and an explicit statement of which machines,
checkouts and shared stores this assessment is permitted to look at.

**Core action.** Place every hit on the ladder from declared to locked to installed to
content matched, decide what each rung actually proves rather than what it suggests,
preserve the material before anything is removed, and convert the findings that survive
into the credentials that must be revoked rather than the versions that must be bumped.

**Output.** A verdict that names the ground it walked and the baseline it compared
against, each finding carrying the rung of evidence it rests on, a list of what could
not be examined and why, and a revocation list for the credentials the window put within
reach, produced with the evidence still intact and the removals still pending.

## Activities

1. Fix which checkouts, machines and shared stores this assessment may examine
*(decide)*
2. Read declarations, lock records, installed trees and install history across that
boundary *(observe)*
3. Place each hit on the ladder from declared to installed to content matched *(decide)*
4. Record hashes and take a reversible copy before anything is removed *(act)*
5. Decide what the surviving evidence proves about execution and about reachable
credentials *(decide)*
6. Hand over the verdict, the scope it covers, what could not be reached, and the
revocation list *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every claim about exposure is readable as the strength of the evidence behind it, so a
candidate is never reported as a compromise.**

- A version named in a declaration is reported as an exposure candidate and never as an
  installation, because a declaration records what was asked for and not what arrived.
- A version present under an installed tree is reported as content that may have been on
  the machine, and a matching content hash is what raises that to high confidence.
- A match on a filename alone is recorded as a lead to be triaged, since the names these
  artifacts use are also the names ordinary files use.
- No claim that credentials were taken rests on a lock record alone, because nothing in
  a resolution record says anything ever ran.
- A floating declaration is treated as no record at all of what was installed during the
  window, and the assessment says which historical version it could not establish rather
  than reading today's tree back into the past.
- A valid publication attestation is reported as proof of how a release was published
  and never as proof that the account or the source it came from was sound.

**A clean result is a claim about the ground that was actually walked, and about nothing
wider.**

- The verdict names the boundary it covered and the baseline of affected releases it
  compared against, so a reader can see what a clean line does and does not cover.
- Ground the assessment could not reach is listed as not examined, with the reason, and
  is never counted among what was found clean.
- A record that exists but could not be read is reported as unreadable rather than
  passed over, because an unparseable record and an absent one both arrive as silence.
- The assessment stays inside the boundary it was given and does not quietly widen into
  other working copies, shared caches, build systems or the operator's wider machine.
- A release withdrawn from where it was published is still looked for in installed
  trees, caches, images and pipeline artifacts, because withdrawal stops new copies
  being fetched and removes none of the ones already taken.
- A baseline older than the incident is named as a limit on the verdict, since an
  assessment is only as current as the list it compared against and a stale list reads
  as clean.

**The work ends in a set of credentials to revoke, with the evidence for it still
intact.**

- Hashes are recorded and a reversible copy is taken before anything is deleted,
  reinstalled or regenerated, because the fastest available fix is also the one that
  destroys the only proof of what happened.
- Replacing an affected release is never reported as remediation on its own, since
  anything that ran already had whatever it could reach and a newer version does not
  take it back.
- The credentials named for revocation are the ones the window actually put within
  reach, and each is named with the reason it is on the list rather than swept into a
  general rotation.
- Revocation is carried out from somewhere the assessment has not implicated, so the
  replacement is not created on a host that may still be holding the thing that took the
  first one.
- Deletion, reinstallation and revocation are put to a person as proposals naming the
  exact thing each would change, rather than performed on the assessment's own
  authority.

## Guidance

Start from what the evidence can carry. A name in a declaration says somebody asked for
a version, an installed tree says a copy was on the machine, a matching hash says which
copy, and a matching name alone says nothing yet. Publication provenance proves how
something was published, never that the account behind it was sound. Preserve before you
remove, keep to the ground you were given, and finish with credentials to revoke rather
than versions to bump.

## Where this is worth adopting

- A team that wakes to an advisory naming something they depend on, where the only
  answer available today is a search of the declarations and the choice between calling
  themselves clean and stopping everything.
- An operation whose first instinct is to upgrade and reinstall, which clears the alarm
  within the hour and removes the only record of whether the thing ever ran.
- A project whose versions float, where nobody can now say which release was on the
  machines during the window the advisory names, and the current tree answers a
  different question.
- A team that swapped the affected release, closed the incident, and has not revoked a
  single token, so everything reachable during the window is still valid and still in
  use.
- An engineer asked whether one repository was exposed, who can see the same artifacts
  would also sit in shared caches, prebuilt images and build runners, and needs the
  boundary settled before the search rather than argued after it.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[npm](examples/npm.md) for `package_registry`.

## Recommended trigger

`event`. An announcement of a compromised release is a real external event, and the
assessment is worth most in the hours before somebody reinstalls over the evidence. A
clock spends the same effort every week on a question that has no news behind it, and
arrives late on the one week it matters. A later revision to the affected list is a new
event rather than a question already answered, so the trigger has to be able to fire
again on the same incident.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which checkouts, machines, caches and build systems this assessment may examine,
  because the boundary is the claim the verdict makes and it cannot be settled halfway
  through a search.
- Where this adopter's record of what was actually installed lives, since a project with
  lock records and install history can be answered and one without them can only be
  bounded.
- How far this work may act on its own finding, from reporting only through to pausing
  installs and isolating a machine, because each of those steps changes the evidence it
  rests on.
- Which credentials the environments in scope hold and who is able to revoke them, since
  the output is a revocation list and a list naming things nobody present can revoke is
  not one.
- Which sources this adopter treats as authoritative for the set of affected releases,
  because a verdict inherits the currency of the baseline it compared against.

## Dependencies

- somewhere to hold a reversible evidence copy that is not the tree being assessed,
  since the first outcome depends on the material outliving the remediation
