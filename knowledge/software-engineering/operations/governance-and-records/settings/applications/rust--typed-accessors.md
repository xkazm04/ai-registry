---
layer: application
type: application
subject: settings
technique: typed-accessors
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1
applied: code
ab_verdict: better
proof: ab-paired
---

# Rust — the write door that types 58 keys out of 90

A settings store that has adopted most of
[typed-accessors](../techniques/typed-accessors.md) deliberately and well, and
whose remaining gap is the shape the technique's audit paragraph predicts: not a
missing design, but a *per-key* enforcement surface that grew one key at a time
and was never counted.

## What this tree already does right

The store is a key-value table over an embedded database, and it carries both
halves the technique asks for. Keys are a closed registry
([key-registry](../techniques/key-registry.md)) with a `validate_key` allow-list;
every key is paired with a `_DEFAULT` constant so "what does unset mean" has one
answer; units are encoded in the key name. Values pass `validate_value` at the
write door, enforced in the repository layer rather than only at the command
layer, "so internal callers cannot bypass the validation that the command layer
also applies" — the single-door rule, stated in the tree's own comment.

The strongest form the technique describes is here too. Structured blobs are
validated **against the exact type the consumer will parse**, with the reasoning
written down: any value rejected at the door would also fail to load, so no valid
write is newly blocked. Where the consumer's type lives in a crate the data layer
cannot import, the code falls back to well-formedness checking and says so. That
is the technique's honest floor, chosen for the technique's stated reason.

## The gap is a count, and the count is the finding

The technique's premise is that the type is declared per key. Here it is declared
per key *for the keys someone thought about*. Counting the registry's exact key
constants against the identifiers reachable inside `validate_value`:

| | count |
| --- | --- |
| exact key constants in the registry | 90 |
| type-enforced at the write door | **58** |
| unenforced | **32** |

Predicate for that count: a key constant is "enforced" when its identifier
appears within the body of `validate_value`; the body was delimited from the
function header to the next top-level item, and prefix keys were excluded.

The 32 are not uniformly harmless — most are opaque strings (model names, base
URLs, cursors) where a string is genuinely the type. But the interesting ones are
the keys whose *name* declares a type nobody enforced, and the sharpest is a
spend ceiling.

## The asymmetry the tree draws for you

The store has a `audit_category` function that files each key under a kind, and
one of the kinds is `"limits"` — "numeric ceilings / rate limits". It has four
members. Three of them are validated at the write door; the fourth, a weekly
experiment budget in dollars, is not. Its sibling in the same category — a
monthly cost ceiling — is validated *and* carries six negative test cases
asserting that `-5`, `nan`, `inf`, `abc`, empty and a space-padded number are all
rejected. Two ceilings, one category, one enforced to six cases and one to none,
and nothing anywhere records the difference as a decision.

This is what the technique means by a gap that opens one key at a time. Nobody
chose to leave the budget unvalidated; it was added after the validator's shape
was set, and per-key enforcement has no mechanism that notices an omission.

## The paired comparison

The same test, unchanged, against both arms. It asserts the whole category
rather than the one key — the technique's point is that per-key enforcement needs
a check that spans the category, so the test is written the way the fix should be
maintained, and it cross-checks its own list against `audit_category` so it
cannot drift.

| Arm | Change | `cargo test -p <db crate> --lib every_limits_key` |
| --- | --- | --- |
| **A** | tree as it stands | **FAILED** — `limits key 'director_weekly_experiment_budget_usd' accepts a non-numeric value at the write door` |
| **B** | the key added to the existing non-negative-decimal arm | **ok** — 1 passed |

Verdict **better**. The measurable is the technique's own: within the `"limits"`
category, keys whose invalid write is rejected at the door go from **3 of 4** to
**4 of 4**, and the regression that would reopen it now fails a test instead of
shipping.

Arm B is a one-line change — the key joins two existing ceilings on a match arm
that already parses a non-negative finite decimal — which is worth stating
because it is the technique's argument in miniature: the gap was not a hard
problem anybody had deferred, it was a gap nobody had a count for.

## What the fix does not do

The reader for that key was already defensive: it parses, filters for finite and
non-negative, and falls back to a conservative default. So arm A was not
returning a wrong ceiling — it was accepting a wrong *write*, silently, and then
quietly ignoring it. The user-visible consequence of arm A is not an unbounded
budget; it is an operator who types a malformed value into a spend cap, receives
no error, and believes the value took effect while the system runs on the
default. That is the subject's own thesis — misconfiguration indistinguishable
from configuration — and it is worth naming precisely, because a reader deciding
whether to copy this fix should know it buys an honest error message at the door
rather than a safety property the reader already had.

Nor does this address the technique's harder case. This store has a **closed** key
space, so binding the type to the key in the registry is available and is the
right answer; the 32 unenforced keys are a backlog, not a design problem. A store
with an open key space would need the record tagged instead, and nothing here
exercises that.
