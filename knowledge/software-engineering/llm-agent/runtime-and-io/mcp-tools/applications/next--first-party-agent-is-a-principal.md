---
layer: application
type: application
subject: mcp-tools
technique: first-party-agent-is-a-principal
stack: next
verified_on: 2026-09-25
verified_against: next@16.3.3
applied: code
ab_verdict: better
proof: ab-paired
---

# A companion admitted by exclusion, and the scoped read it would have been handed

## The seam

The version witnessed is the framework the repository installs - its
`package.json` declares `next ^16.3.3` and the installed package reports
`16.3.3`; the engine pin is `node 24.x`.

A server-rendered application publishes one tool catalog through two doors.
The protocol door is a single POST route: a bearer token names the caller
and its organization, the route filters the catalog to the token's scopes,
then to the workspace's plan gates, then runs a write gate on tools marked
as writes. The second door is the product's own companion agent, which runs
server-side inside a member's session and dispatches the same handlers
in-process, with the same result serializer, so both doors show the model
byte-identical text. The companion has no bearer credential; it has a
session. Its door re-checks tenancy itself, because the handlers perform
none.

What differed was admission. The protocol door admitted by grant - every
scope the tool declares must be held. The companion admitted by exclusion -
the whole catalog minus tools marked as writes, minus tools needing the
work-queue holder scope, then the plan gates. On the eleven read tools that
existed the two agreed exactly.

## The arms

- **A**, as it was.
- **B1**, the source rule literally - the companion reaches the core only
  through the protocol route. Not constructed: it needs a bearer credential
  minted for a session principal, and it would replace the companion's
  member-owed refusal reasons with the protocol door's deliberately opaque
  ones. Recorded as the reason the technique's strong form carries a
  precondition.
- **B2**, one admission: a pure `admitTools(granted, plan)` beside the
  catalog (scopes, then plan gate), called by the route for the token's
  scopes and by the companion for an explicit, typed grant of the door
  scope plus the two read-resource scopes. The companion keeps its write
  refusal as subtraction after admission. Three source files, 42 lines
  added, 19 removed.

## What was read

Five probes in one new test file, identical in both arms, pushing synthetic
tools onto the live catalog array and removing them after each test. Target
and floor were written down before either arm ran.

| probe | A | B2 |
| --- | --- | --- |
| P1 drift: read tool behind an ungranted scope is not offered | **fail** | pass |
| P2 over-correction: read tool behind the door scope alone is offered | pass | pass |
| P3 subtraction: a mis-scoped write is not offered | pass | pass |
| P4 agreement on the real catalog, all four plan combinations | pass | pass |
| P5 agreement after the drift tool lands | **fail** | pass |

Floor, the project's own test runner over both doors, the catalog, the
handlers and the write gate: A 426 of 426 pre-existing tests green, B2 the
same 426 plus the five probes (431 of 431). Typecheck clean, lint clean on
the touched files. The typecheck was shown able to fail: a misspelled scope
in the grant is a type error against the scope vocabulary.

## Negative controls on the floor

- Dropping the skills read scope from the companion's grant: five red - the
  existing "the catalog is the read half" test, both untrusted-wrapping
  tests for skill text, and the two agreement probes.
- Dropping the companion's write subtraction: one red, P3 only. The write
  scope makes it redundant on today's catalog; it is kept as defence in
  depth, and only the probe can see it go.
- Dropping the plan filter inside the shared admission: six red across both
  doors - the protocol door's own "withholds a plan-closed tool" test and
  the companion's plan-gate tests. One regression, both doors' guards.

## What the seam taught the technique

The rule arrived as "no other door". The seam could not have one: the
companion's principal is a session and the protocol door's is a token, so
the door that must be single is the admission, not the route. The same
seam's own history carried the one-layer-down case - the plan predicate is
still resolved by two functions, one per door, and an earlier incident had
the protocol door missing a plan gate that the request API and the companion
both enforced.
