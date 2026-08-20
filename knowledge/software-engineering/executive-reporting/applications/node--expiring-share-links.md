---
layer: application
type: application
subject: executive-reporting
technique: expiring-share-links
stack: node
status: forged
---

# A stateless HMAC capability that carries its own window

`src/lib/briefing-share.ts` in `C:\Users\kazda\kiro\ascent` mints read-only
share tokens for the executive briefing *"so an owner can send a board member a
briefing without giving them an account"* (`:1-6`). The framing is deliberately
minimal: `<base64url(JSON payload)>.<HMAC-SHA256 sig>`, with the codec factored
into `src/lib/signed-share.ts:1-9` and shared with a second sharing surface so
*"the framing can never drift apart."* The shared page verifies the token and
re-runs the briefing builder read-only. Without a signing secret the whole
feature is inert (`briefingShareEnabled`, `:19-21`).

## The payload states the grant

`signBriefingShareToken` (`:52-69`) signs
`{ org, range, from, to, winStart, winEnd, segment, stack, mintedBy, exp }`.
Three of those fields are the interesting ones.

**Scope travels.** `segment` and `stack` are in the payload because a briefing
narrowed to one client or one technology group must be re-rendered *at that
narrowing* on the recipient's side — a "Frontend briefing" share that widens to
the whole organization when opened is a scope leak dressed as a convenience.

**The window is frozen at mint time.** The comment at `:41-49` records the
defect: carrying only the range key (`30d`, `90d`, `quarter`) let the
recipient's page re-resolve `start` against *their* clock, so *"a board member
opening a 'Last 90 days' link days later saw a different 90-day window
(different numbers) than the owner shared."* The signer now resolves the window
and stores absolute ISO instants, pinning an open-ended end to the mint instant
*"so post-share scans don't leak in either"*, and ignores any caller-supplied
value for those fields. On verify (`:71-100`) they are echoed back;
`winEnd`'s presence as a string is the marker that a token froze its window,
and its absence identifies a legacy token whose reader falls back to
recomputing — a compatibility seam, not a design choice.

**Expiry is sized to the reporting cadence.** `DEFAULT_TTL_MS` (`:11`) is seven
days, annotated *"a board cycle; shortened from 14d to bound a leaked link's
exposure window."* The lifetime is derived from how often the document is
reissued, not from a session-token default.

## Revocation without a revocation table

A signed stateless token is inherently un-revocable: it is valid until its `exp`
passes, wherever it has been forwarded. Rather than accept that, the payload
carries `mintedBy` — the issuing owner's identity — and the shared page honours
the link *"only while `mintedBy` still holds owner access, so removing/demoting
them kills their shared links"* (`:35-39`). It is not general revocation, but it
closes the case that actually happens: a person leaves, and every capability
they minted dies with their authority. The binding is applied only under the
enforced membership wall where the authority check has a source of truth; other
auth modes leave the field undefined and keep the prior stateless behaviour.

Verification (`:71-96`) is server-side and total: signature timing-safe,
framing well-formed, `exp` in the future, and every field re-typechecked after
decode rather than trusted because the signature passed. The signature proves
the payload was minted here; it says nothing about whether the payload is the
shape this version of the reader expects.

## Deviations from the technique

Two, both worth naming rather than smoothing over.

- **No per-grant identifier.** The token is not listed, audited, or revoked
  individually — `mintedBy` revokes an issuer's whole set, and there is no
  record that grant *n* was opened four times. The technique asks for a minted
  identity per grant; this implementation trades it for statelessness.
- **The link re-runs the builder rather than serving a frozen snapshot.** The
  frozen window removes the largest source of drift, but a re-scan inside the
  shared window still changes the recipient's numbers. The technique's
  preference — a shared *report* is an artifact, a shared *dashboard* is a
  different product — is only half-implemented here.

Neither deviation lowers the standard. Both are the predictable cost of
choosing a stateless capability, and both are visible in the code rather than
discovered by a recipient.
