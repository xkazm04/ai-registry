---
layer: application
type: application
subject: sidecar-provisioning
technique: atomic-downloads
stack: node
verified_on: 2026-09-02
verified_against: node@24.14.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The catalog size in hand, compared to nothing

A civic-data project harvests a public registry's monthly contract dumps —
several hundred megabytes each, a few gigabytes per range — in a script
that reads the registry's index first. The index is a catalog in the
technique's sense: for every month it states the dump's URL *and its size in
bytes*, and the script prints that size as it starts each month and records
it into its resume state as the month's `bytes`. The download itself is the
smallest possible shape: one `fetch` with a long timeout, an `ok` check on
the status, and the body piped straight to the month's final filename. A
month is marked done after the file parses. A failed month is recorded as
not done, so a resumed run retries it — the script's own comment says why,
and it is the right reason.

## The A/B

**A** is that loop as it stands. **B** is the same loop with the resume
contract's checks: stage to a partial name, pin the catalog size before the
first byte, reject a server whose advertised total contradicts it, resume
with a range and verify the partial-content offset, cut at the first excess
byte, compare received bytes to the catalog on completion, rename last.

Both arms ran against a local socket server replaying one failure per case
— the same protocol the source repository's own tests use — with the
predicate *did the arm mark the month done over a file that is not the
1000-byte artifact* (silent-wrong), versus any honest outcome. Six cases: a
clean transfer as the calibration control, a short body under a truthful
length header, a range request answered with the full content, a
partial-content answer at the wrong offset, a body exceeding the advertised
length, and a server that advertises and delivers 900 bytes against a
catalog of 1000.

| Case | A | B |
| --- | --- | --- |
| clean transfer (control) | correct, done | correct, done |
| short body, truthful header | failed — transport raised `terminated`; truncated file left at the **final** name | failed honestly, partial kept for resume |
| full content to a range request | correct (A never resumes) | correct — restarted from zero |
| partial content at the wrong offset | correct (A never resumes) | failed honestly, partial discarded |
| body exceeds advertised total | correct — transport stopped at the header's length | correct |
| advertised and delivered total < catalog | **silent-wrong: 900 bytes marked done** | rejected before writing |

Silent-wrong: A 1 of 6, B 0 of 6. Verdict **better**, on one case — and it
is the case the project's own data makes real, because the catalog size the
script prints and never compares is exactly the number that catches it.
Shipped the same day as a fourteen-line change on the project's default
branch: partial name, size pinned before the first byte, received count
compared to the index, rename last. The project's lint gate passed; its
typecheck carries pre-existing failures in unrelated files and none in this
one.

## What the tree's shape says about the standard

Two structural facts, one on each side of the technique.

**The transport already enforces the advertised length on this runtime.**
The technique's first non-negotiable assertion — transport success does not
prove completeness — was *weaker than stated* here: the runtime's HTTP client
failed the short body itself, before the script's code ran, and it stopped
reading at the header's length when the server sent more. That is a
runtime's contract, not the application's, and it is the reason the
check-by-check section now carries the caution that a short-body test may
pass for a reason the application did not build.

**The hole the runtime cannot close is the one the catalog closes, and the
catalog was in the loop's hands.** A server that advertises 900 and delivers
900 satisfies every transport check; only the index's own size says the
month is short. The script holds that size in the same iteration, prints it,
stores it, and compares it to nothing — the technique's "the catalog's own
expected size closes the hole" sentence, unbuilt while its input was already
on the line above. The truncated file left at the final name on a short body
is the smaller finding: harmless here because the retry opens the file for
writing from scratch and the month is not marked done, but it is the state
the partial-name rule exists to make impossible, and a crash between the
transport error and the retry would leave a full-looking file that no
status surface distinguishes from a harvested month.

## What this realization cannot do

The harvester has no digest for a dump — the registry publishes sizes, not
hashes — so check 4's "only a digest can bless a partial" has no arm here;
a range-not-satisfiable answer can only clear. And the A/B measures the
loop's *download* step against a replayed server, not a live month: it says
which arm would mark a short dump done, not how often the registry serves
one. The instrument that would say that is the state file's `bytes` field
compared to the on-disk size of each harvested dump, which the project can
run over every month it holds — attempted on 2026-09-02 and found nothing to
read, because the checkout on hand carries no harvest state, so the
frequency question stays open until a machine that has run the harvester
runs the comparison.
