---
layer: application
type: application
subject: application-intake-and-conversion
technique: merge-dont-drop-on-reapplication
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# Merge behind proof across four intake doors (Node route handlers)

Repeat submissions are filed through one core, `app/_lib/application-filing.ts`,
which every door calls with a stated **proof**:

- the conversational apply (`app/api/apply/[id]/route.ts`);
- the lead core behind the quick form and the channel webhooks
  (`app/_lib/lead-intake.ts`);
- the headless CV intake;
- the operator's ATS import.

The first version of this application (2026-08-20) described a merge that
wrote on any match. The tree has since split the technique's two questions,
*which record* and *may this change it*, and this application now records
that split. It also records the one door that still merged on the old trust
until this pass fixed it.

## The proof table

`application-filing.ts:20-37` states it in one place ("what a match may do is
the door's stated proof, not scattered code"), typed at `:77`
(`FilingProof = "token" | "channel" | "none"`):

- **token** — the `?lead=` capability emailed in the acknowledgement. The only
  proof that rebuilds the stored profile.
- **channel** — an integration that vouches for its payload. It may fill a
  missing contact, refresh consent and record the repeat, and never rebuilds.
- **none** — "the match came from a typed name/email, which is not a secret.
  Nothing on the matched entry moves".

The route restates it at `route.ts:347-359`: knowing that a person applied, "a
LinkedIn post is enough — must not make you their contact of record or
overwrite the profile a recruiter scores".

The incident that produced this is pinned at the top of
`app/api/apply/[id]/reapply-capability-gate.test.ts` (2026-09-04). The old
branch matched on a bare name and then merged unconditionally. It backfilled
the contact, rebuilt the profile "from attacker-supplied CV text over the
victim's candidate id", wrote into the recruiter's feed and "refreshed the
data-processing consent (which re-extends the GDPR retention clock)".

## Identity precedence is unchanged; authority is new

`route.ts:319-328` resolves the enrichment token first, and the token "resolves
DIRECTLY to the lead's own entry". Anything invalid, stale or mismatched
"degrades silently to the email/name identity fallback below, never an error".
Below the token, `applicantKey` (`app/_lib/applicant-key.ts:12`) keys on the
normalized email, else the name. It is a hashed key that "replaced
applyDedupeKey, which put the email IN CLEAR into" the entry's primary key
(`:5`). `route.ts:217` keeps the anonymous rule: "We never dedup on the
fallback".

What a match may *do* is now the proof, not the match.

## Fill-only fields, a proven rebuild, and a failure that touches nothing

The repeat branch is `application-filing.ts:218-267`:

- a contact backfills only a contactless entry (`:227`);
- a GitHub handle backfills only a handle-less one (`:231`);
- the profile rebuilds only under `proof === "token"`, when the repeat carries a
  CV or the entry is a degraded stub (`:239`);
- `updates` is populated only inside `if (rebuilt.ok)` (`:241`), so "a failed
  rebuild moves nothing" (`:237`).

A proven repeat refreshes consent best-effort (`:257`, the helper at `:159`:
"the consent bookkeeping must never undo a filed application"). It records
`re_applied` (`:258-265`) and re-acks a newly reachable entry through the one
ack seam (`:201`, "so the first ack and the newly-reachable re-ack cannot
drift"; `:252`). The conversational door defers that dispatch off the response
path (`route.ts:397`).

## The unproven repeat gets link recovery, not a write

A `none` repeat returns before any write (`application-filing.ts:221`). The
real returning candidate is then served by `app/_lib/apply-link-recovery.ts`,
which "delivers the capability to the one party who can prove ownership: the
inbox already on the entry" (`:16`):

- it sends to `entry.contact`, never the typed address;
- it picks its copy without reading whether an address exists, so the answer
  cannot be used as a probe;
- it sends at most once per entry per 24 h (`:30`), so "a griefer can cause at
  most one email a day, to the real candidate".

## Applied: the quick door merged on a name (fixed, `code`, better)

The lead core filed every repeat under `channel`. Behind it, the identity
lookup falls back to a **contactless entry found by name** when the typed
address is not on file. The quick form is public, so the conversational
door's impostor POST, sent to `/quick`, did what the capability gate refuses.
Measured on the real handler at the pre-fix commit:

- the typed address became the entry's contact;
- one outbox row went to it, carrying the entry's status link (live stage and
  decision history).

The fix (kp `327e40e00`) threads the proof into the lead core
(`lead-intake.ts:204`, default `channel`, so the webhooks are unchanged). The
quick route passes `proof: addressOnFile ? "channel" : "none"`
(`quick/route.ts:154`): with the address on file the match *is* that address,
and without it the only possible match is the name. After the fix, nothing
moves and nothing is sent (`reapply-capability-gate.test.ts:291`). The test
that had pinned the old backfill as intended is reversed (`:271`). Apply, lead
and channel suites: 66/66, and tsc clean.

The cost is the one the technique names. A contactless conversational
applicant can no longer make themselves reachable by quick-applying with an
address. The token walk or a recruiter does it.

## Deviations still open

- `route.ts:139-145`'s file header still says a repeat's "fresh signals MERGE
  onto the original" and names `applyDedupeKey`. The code below it
  (`:347-359`) and the applicant-key module say otherwise.
- The newly reachable merge is now reachable only under proof. On the
  conversational door that path runs through the token. A contactless entry
  from a webhook becomes reachable only through a later webhook repeat
  (`channel`), which is an authenticated integration's claim, not the
  candidate's.
