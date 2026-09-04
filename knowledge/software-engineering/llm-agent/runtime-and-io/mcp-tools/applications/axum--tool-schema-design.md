---
layer: application
type: application
subject: mcp-tools
technique: tool-schema-design
stack: axum
verified_on: 2026-09-04
verified_against: axum@0.8
applied: code
ab_verdict: better
proof: ab-paired
---

# The schema was published, and the door had never read it

A local scraping and data-product service exposes a tool server over an HTTP
router, seven tools in the shipped default. Every one of them publishes a full
input schema — `required` lists, `minLength` on strings, `minimum`/`maximum`
on integers, an `enum` on one ordering argument, and `additionalProperties:
false` on all seven. Twenty-eight constraint keywords across the published
catalog.

The dispatch function resolved the tool name and then handed the raw argument
object straight to the handler. **Nothing between the wire and the handler had
ever read the schema the server publishes.**

## Why this is not simply "missing validation"

The first reading was that the surface had no validation, and the tree
corrected it — which is the useful part of this record. The handlers *do*
validate, by hand, and they do it well: the search tool refuses an
out-of-enum sort value and a whitespace-only query, returns both **in band**
with the offending value quoted, and a refused request provably never reaches
the index. That is already the corrected error-channel rule from the
technique, implemented before anyone wrote it down here.

So the defect is not absence. It is that **the set of constraints enforced
lived in the handlers while the set published lived in the schema, and the two
had drifted.** `additionalProperties` and `required` were in the second set
and in no handler. That drift is invisible to every reviewer looking at one
side: the schema reads complete, and each handler reads reasonable.

This is the technique's third-authority problem — the published schema, the
enforcing code, and what the handler actually *uses* — appearing at the
argument door instead of inside one tool.

## The measurement

Measurable: **what a caller receives for an argument the published schema
forbids.** One test, both arms, same harness.

- **Arm A** (as shipped): `search` called with `{"q": "x", "srot": "newest"}`
  — a misspelled `sort`. Result `isError: false`. The call succeeded, the
  misspelled key was silently dropped, and the search ran without the ordering
  the caller asked for. `query_dataset` called without its declared-required
  `dataset` was likewise accepted.
- **Arm B** (after): both refused with `isError: true`, each violation named
  by JSON pointer, with an instruction to re-read the schema; the refused
  request never reaches the index; the valid call is unaffected.

Arm A is the outcome worth naming, because it is worse than an error: **the
caller is a model that guesses key names, and it received a confident answer
computed without the argument it supplied.** There is no signal anywhere — not
in the result, not in the logs, not in the caller's context — that the
ordering it requested was discarded. A protocol error would have been
recoverable; silence is not.

Gate: 506 + 9 tests pass, 0 failed; clippy with `-D warnings` clean.

## What the tree already had, and what that decided

The service already owned the exact rule one layer down. It has a shared
params validator with a written rationale for existing at all: three doors
(a job route, a schedule route, a trigger fire path) had each decided
separately whether to check an app's declared schema, "and the two silent ones
surfaced as a failed job with a message nobody connects back to the schedule
row." The fix there was one shared check every door calls.

The tool surface was the fourth door, and it had not been counted. So the
change is not a new idea in this tree — it is the tree's own rule applied to
the one caller it had missed, which is why it costs about twenty lines and no
argument.

## The choice worth recording: which channel

The refusal is in-band (`isError: true`), not a JSON-RPC protocol error, and
the door's doc comment previously said the opposite — that "unusable
arguments are protocol errors" — while the code beneath it already returned
handler-level argument failures in band. Doc and code disagreed, and the doc
was the half that matched the older understanding.

The channel follows **who can act on the answer**. An unknown tool stays a
protocol error: no rewording fixes it and the caller must re-list. A
misspelled key is precisely what the caller repairs on its next turn once it
is told, so it goes where the caller will read it.

## What this realization cannot do

The validator is compiled from the tool's schema **on every call**, because
the catalog is rebuilt per request to keep one authority for what exists. At
this service's scale that is free; a server with a large catalog or real
call volume would cache compiled validators keyed by tool name, and would
then own a cache-invalidation question this tree does not have.

A schema that fails to compile is warn-logged and validation is **skipped**,
matching the sibling validator's stance that a bad schema is the publisher's
bug and must never brick the surface. That is a deliberate fail-open on one
specific path, and it means a malformed schema degrades silently to Arm A for
that tool. The compensating control is that the schemas are literals in the
binary rather than operator input — a different tree, taking schemas from
config, could not make that trade.
