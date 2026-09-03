---
layer: application
type: application
subject: authorization
technique: scope-design
stack: node
verified_on: 2026-09-02
verified_against: node@24.14
applied: experiment
ab_verdict: better
proof: ab-paired
---

# One identity per source on a shared run board (Node)

The registry's run board (`scripts/run-board.mjs`) is the coordination
instrument a dozen concurrent sessions read before writing into one
checkout. Its cheapest guard is SAME SOURCE: a claim on a source another
live run already holds exits 3, so two terminals never pay for one
transcript and then race to write one note. That guard is a *comparison of
identifiers*, and the technique's canonical-once section applies to it
exactly: the comparison is only as good as the fold both sides pass
through.

## The seam

`cmdClaim` compared `norm(s.source) === norm(source)`. `norm` trims, folds
backslashes, strips a leading `./` and trailing slashes, and lowercases. It
is the right fold for subject slugs and repository-relative paths, which is
what the rest of the board compares with it. It is the wrong fold for a URL.

## A/B, paired, n=4 spellings plus one control

The same four spellings of one repository address were claimed under a
scratch run id while this run held the canonical spelling, and the exit
code read each time:

| Spelling of the held source | Arm A (`norm`) | Arm B (`normSource`) |
| --- | --- | --- |
| `.git` suffix | 0 (missed) | 3 (contended) |
| upper-cased scheme and host, trailing slash | 3 | 3 |
| `www.` prefix | 0 (missed) | 3 |
| query string appended | 0 (missed) | 3 |
| **control:** a sibling repository under the same owner | 0 | 0 (distinct) |

Arm A caught 1 of 4; arm B caught 4 of 4 with no false collision on the
control. Arm B folds a URL to host + path with the scheme, `www.`, `.git`,
query and fragment removed, and falls back to `norm` for anything that is
not a URL, so subject and path claims are untouched.

## What the tree said about the technique

The board already obeyed the technique's *placement* rule — one fold,
applied to both sides at the comparison, no guard on the raw spelling. The
defect was the fold's **coverage**, which is the second half of the
amendment: two spellings the canonicalizer does not fold are two
identities, and a "same source" check built on it admits the second as new.
Three of the four misses are spellings a person pastes without thinking
(the clone URL, the browser URL with a tab parameter, a `www.` habit), so
the miss rate in practice is not a corner case.

## Shipped

`normSource` landed beside `norm` and replaced it at the SAME SOURCE
comparison only. The four spellings and the control are the calibration
set; re-running the claims after the change returns 3, 3, 3, 3 and 0.

## What this realization cannot do

It folds one address family. Two different hosts serving one repository (a
mirror, a fork) remain two sources, which is correct for the board's
purpose — a mirror is a different tree to clone — and wrong for the source
*ledger's* purpose, where the question is whether the document was already
mined. That check lives in the ledger, not the board, and is not changed
here.
