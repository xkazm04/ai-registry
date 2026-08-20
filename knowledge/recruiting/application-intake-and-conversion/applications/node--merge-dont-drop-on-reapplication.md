---
layer: application
type: application
subject: application-intake-and-conversion
technique: merge-dont-drop-on-reapplication
stack: node
status: forged
---

# Merge-don't-drop across two intake doors (Node route handlers)

Repeat submissions are handled in two places that deliberately share one
contract: the conversational apply endpoint
(`app/api/apply/[id]/route.ts`) and the shared lead core
(`app/_lib/lead-intake.ts`) behind the quick form and the inbound channel
webhooks.

## The stated rule

`route.ts:61-76` carries the policy in full:

> Duplicate-application policy (primary check): if this named applicant has
> already applied to this role, surface the repeat on the original entry and
> acknowledge it — don't create a second pipeline row. … **merge, don't drop.
> Re-applying is the only self-service "update my info" path an applicant
> has**, so a detected repeat folds its fresh signals onto the original entry
> before acknowledging.

`lead-intake.ts:1-16` states the same contract for the minimal-field surfaces,
plus what each caller is allowed to differ on: "input validation, the KO
verdict semantics (strict for our own form, provided-only for third-party
payloads), and the localized human-facing response copy". One core, many
doors.

## Identity precedence: token, then address, then name, then nothing

`route.ts:273-282` resolves an enrichment token first — "a valid token
resolves DIRECTLY to the lead's own entry, so the merge below targets it even
when the typed email differs from the one on file — re-typing the EXACT same
address is no longer what keeps one person on one pipeline row". The token is
shape-validated (`coerceLeadTokenParam`, "never a cast"), must belong to this
job, and "anything invalid/stale/mismatched degrades silently to the
email/name identity fallback below, never an error".

Below it, `applyDedupeKey` (`app/_lib/apply-intake.ts:106`) prefers the
normalized email over the normalized name, because "two same-named applicants
with different addresses are different people and must get DISTINCT keys,
which a name-only key collapsed onto one entry" — and returns `""` for a
nameless, contactless applicant, which the caller reads as *don't dedupe*
("we can't tell two anonymous applicants apart"). `route.ts:218-220` restates
it: "We never dedup on the fallback — two anonymous applicants must not be
merged into one entry".

## Fill-only fields, wholesale rebuild, and a failure that touches nothing

The merge at `route.ts:320-347` is field-typed:

- contact address backfills only a contactless entry (`:325-328`) — "the
  applicant becoming reachable is the point of re-applying for most";
- a public-profile handle backfills only a handle-less entry (`:329-335`,
  "fill-only, see `mergeReapplication`") — one already on file is kept;
- the derived profile *rebuilds wholesale* when the repeat carries a document,
  or unconditionally when the original was a degraded stub (`:336-346`).

The rebuild's failure semantics are the load-bearing part, stated at
`:73-76`: "in place for a healthy original, a fresh save + re-point for the
stub. **A FAILED rebuild touches nothing**: a junk repeat can never degrade a
healthy entry, and a stub just stays a stub." The code matches — `updates` is
populated only inside `if (rebuilt.ok)`, so a failed build leaves the existing
`candidateId` and archetype in place and the merge simply has less to write.

Process state is preserved throughout: the merge writes fields onto the
original entry rather than creating one, and a `re_applied` automation event
records what changed (`lead-intake.ts:196-202`, `route.ts:374-381`).

## The repeat re-consents and re-verifies

`route.ts:366-372` refreshes data-processing consent and its expiry on every
repeat, wrapped in a `try/catch` because "a consent-record failure must never
block the apply ack" — the same best-effort posture `lead-intake.ts:26-33`
takes ("the consent bookkeeping must never undo a filed lead"). What that
record contains is the consent-and-retention subject's business; the trigger
is intake's.

`lead-intake.ts:188-191` refreshes the recorded knockout pass-state on the
original entry alongside the token, since "this repeat just re-verified its
gates" — and the `passedKoIds` contract (`:59-62`) is why that matters: the
enrichment chat "skips exactly those gates and no others (an unrecorded gate
is asked again, never assumed)".

## Newly reachable means the acknowledgement gets a second chance

Both doors handle the same case explicitly. `route.ts:349-364`: "Newly
reachable: the original acknowledgment dead-lettered (no recipient existed),
so send it to the address just captured" — dispatched via
`afterResponse("apply-reack", …)`, off the candidate's response path, matching
the first-apply acknowledgement at `:469`. `lead-intake.ts:190-195` does the
same through the single `sendAck` seam, deliberately shared "so BOTH ack sites
… can never drift apart", and re-sends the enrichment link only while the
entry is still a degraded stub.

The candidate is also told which record they touched: the repeat response
carries `t("enrichedMessage")` when a rebuild happened and `t("alreadyMessage")`
when it did not (`route.ts:374-380`), rather than rendering a repeat as either
a fresh application or a silent no-op.
