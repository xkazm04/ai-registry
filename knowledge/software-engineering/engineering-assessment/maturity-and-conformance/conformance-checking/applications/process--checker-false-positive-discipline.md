---
layer: application
type: application
subject: conformance-checking
technique: checker-false-positive-discipline
stack: process
status: forged
verified_on: 2026-09-04
---

# An exemption list with no reaper, read twelve years later

This technique's decision rules end with a warning it does not evidence:
*"Provide an exemption path, and make exemptions expire. Permanent silent
suppressions recreate the false-pass problem with paperwork."* A public
curated index of development resources — one flat markdown file, 356 links,
495 commits, fifty-odd drive-by contributors, twelve years — is that warning
run to completion by people who were not trying to prove anything.

The witness for the version below is the repository's own head commit and its
CI configuration file; no packaged release exists to pin.

## The exemption path was built exactly as the technique prescribes, and then never re-read

The checker is a link validator invoked by the hosted CI configuration on
every change. Its two suppression surfaces are both command-line flags:

- an **accept list** of HTTP statuses to treat as alive — grown to six codes,
  one commit at a time;
- a **per-host exemption list** — nine hosts, each added in its own commit
  whose message names the host and the status that provoked it.

Every property this technique asks for is present. The exemptions are
declared in the repository. Each carries a stated reason, in the commit that
introduced it, reviewable in one place. They are narrow — host-scoped, not
check-scoped — which is the narrowing the technique prefers over deleting the
check ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

The one property absent is expiry. And the measurement is that **two of the
nine exempted hosts have no remaining link in the checked file at all.**

The clearer of the two: a host exempted in a 2020 commit, for a code-hosting
service that had been shut down since early 2016 — the exemption was created
four years after its targets became permanently dead, to stop the checker
saying so. Its last link left the file in a 2023 cleanup. The exemption
remains in the configuration today, three years after the last row it could
possibly match. The second follows the same arc from a 2016 commit.

That is the predicted harm, and it is worse than a stale line: an exemption
whose referent is gone is a standing instruction not to look, aimed at
nothing, and **indistinguishable from a live one by inspection.** A reviewer
reading the config sees nine considered decisions. Two of them are aimed at
empty space, and only a join against the checked population can tell which.

## The discriminating commit is the technique's own classification, made by hand

One 2016 commit does both halves of this technique's dispute procedure in a
single change: it *removes* a link that answered 500, and *exempts* two hosts
that answered 403. Same run, same author, opposite remediations, and the
status code is the whole discriminator — a true finding versus a narrowable
detector, classified correctly with no framework at all.

It is worth recording because it is the good case. The failure this
application documents is not that the maintainer could not tell the two
apart; they could, repeatedly, for years. It is that the artifact produced by
telling them apart had no clock on it.

## What this realization cannot do

The index has no way to measure its own misfire rate, which is the
technique's first decision rule ("measure before promoting"). There is no
ground-truth set, no advisory period, and no record of how many links the
checker flagged versus how many were genuinely dead — the only trace of any
of it is the exemption list itself, which is the residue of the misfires and
not a count of them. Nothing here should be read as evidence about the
detector's precision; it is evidence about what happens to a suppression
after the argument for it is won.

The join that produced the finding — exempted hosts against hosts still
present in the checked file — is one command over two files, and it is the
whole audit. Any project carrying an exemption list can run it today, and the
expected answer is not zero.
