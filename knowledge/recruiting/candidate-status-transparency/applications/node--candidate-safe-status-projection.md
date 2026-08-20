---
layer: application
type: application
subject: candidate-status-transparency
technique: candidate-safe-status-projection
stack: node
---

# The candidate-safe projection and its token-gated route (Node / Next route handlers)

The whole boundary is two files: a pure mapping module (`app/_lib/application-status.ts`)
and the public route that is the only thing allowed to emit it
(`app/api/status/[token]/route.ts`).

## The projection is a closed enum, not a filtered record

`application-status.ts:8-16` declares `CandidateStatus` as seven literals —
`received | under_review | interview | offer | hired | not_selected | withdrawn`
— and the module header states the rule the standard asks for verbatim: the
internal `(entryStatus, stage)` pair "is projected here into a small, friendly
enum … NO internal ids, names, or scores ever cross to the candidate" (`:1-6`).
Construction, not omission: `candidateStatusFor` (`:66`) takes the internal
values as arguments and *returns a literal*, so an internal record growing a
column cannot leak through it.

The module is deliberately dependency-free — the stage-role strings are inlined
rather than imported (`:23-25`, `:41-43`) "so this module stays dependency-free
and the mapping is exercisable by bare `node --test`". A boundary rule that can
only be tested by booting the app is a boundary rule that stops being tested.

## The route emits the projection and four other facts

`route.ts:47-56` returns exactly `{ status, jobTitle, company, updatedAt,
relayConfigured }`. Its header (`:26-29`) names the refusals: "Never the
internal entry id, candidate name, score, archetype, or reasoning." Note what
is *not* in the payload despite being one property access away on the entry —
this is the standard's positive-permission list realized as a literal object.

`relayConfigured` (`:52-55`) is the interesting addition and a genuine
extension of the technique: a capability bit, not a secret, that lets the page
suppress "watch your email" copy when no delivery relay exists. It is the
delivery-truth sibling's rule (`app/_lib/comms-truth.ts`) reaching across into
this surface — the status page must not promise a channel that does not exist.

## Stage ROLE, and the incident that forced it

Two maps sit side by side. `STAGE_TO_STATUS` (`:29-35`) keys on the shipped
stage names and is explicitly marked as "only correct for a workspace on the
SHIPPED axis". `STAGE_ROLE_TO_STATUS` (`:45-52`) keys on role. The comment
between them is the incident: "A renamed column falls through to `received`,
which would tell a candidate at the offer stage that we have merely received
their CV" (`:26-28`). The route always resolves the role —
`roleOf(entry.stage, getPipelineAxis(workspaceId).stages)` (`:48`) — so the
name map survives only as a legacy fallback.

The `custom` role maps to `under_review`, not `received` (`:51`), with the
reason stated: the candidate "is somewhere in the middle of a process whose
internal name is none of their business, and `received` would understate where
they actually stand." That is the standard's unmappable-stage rule, and its
direction-of-error test, implemented as a single map entry.

## Terminal causes collapse — a deviation worth naming

`candidateStatusFor` (`:66-71`) maps `rejected`, `rematched` **and**
`role_closed` all to `not_selected`, and `declined` (candidate-side) to
`withdrawn`. The reasoning is recorded at `:60-62`: a closed role "is no longer
open to them, which is honest without implying a merit rejection."

The status enum is right; the *copy* is where this falls short of the standard.
`StatusClient.tsx:222-227` renders one `notSelectedTitle`/`notSelectedBody`
pair for every cause, so a candidate whose requisition was cancelled reads the
same sentence as one who was reviewed and declined. The standard asks for one
copy variant per terminal cause; this is a single shared variant, and the
merit implication rides on the wording rather than on the state. The standard
stays as written.

## Tenancy is derived from the record, because there is no session

`route.ts:39-45` resolves the workspace from the entry the token names, with
the bug recorded: "Without it this read fell through to DEFAULT_WORKSPACE_ID,
so a candidate of any other team got a 404 on their own status link." A
data-scoping default turned a valid link into *your application does not
exist* — the same harm the failure-classification technique guards against,
arriving through the tenant resolver rather than through copy.

Rate limiting (`:12-23`, 60/min keyed by token *and* client) and
`safeJsonError` (`:57-59`, which exists because "Raw err.message would surface
SQLite internals on a public token route") are the software-engineering half of
the same boundary — general practice, correctly applied here.
