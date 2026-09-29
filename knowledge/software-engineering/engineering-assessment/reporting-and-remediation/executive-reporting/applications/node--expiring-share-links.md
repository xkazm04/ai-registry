---
layer: application
type: application
subject: executive-reporting
technique: expiring-share-links
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# A stateless HMAC capability that carries its window, its grant id and a figure fingerprint

`src/lib/briefing-share.ts` in `ascent` mints read-only
share tokens for the executive briefing *"so an owner can send a board member a
briefing without giving them an account"* (`:1-6`). The framing is deliberately
minimal: `<base64url(JSON payload)>.<HMAC-SHA256 sig>`, with the codec factored
into `src/lib/signed-share.ts:1-9` and shared with a second sharing surface so
*"the framing can never drift apart."* The shared page verifies the token and
re-runs the briefing builder read-only. Without a signing secret the whole
feature is inert (`briefingShareEnabled`, `:36`).

This application was first written on 2026-08-20 with two recorded deviations
from the technique: no per-grant identifier, and a live re-render rather than a
frozen snapshot. Both were addressed in the following five weeks, and the way
they were addressed is the useful part — one closed outright, the other
answered with a third design the technique had not considered.

## The payload states the grant

`signBriefingShareToken` (`:237`) signs
`{ org, range, from, to, winStart, winEnd, winEndX, segment, stack, mintedBy, jti, fig, exp }`.
Five of those fields are the interesting ones.

**Scope travels.** `segment` and `stack` are in the payload because a briefing
narrowed to one client or one technology group must be re-rendered *at that
narrowing* on the recipient's side — a "Frontend briefing" share that widens to
the whole organization when opened is a scope leak dressed as a convenience.

**The window is frozen at mint time.** `freezeShareWindow` (`:108`) records the
defect: carrying only the range key (`30d`, `90d`, `quarter`) let the
recipient's page re-resolve `start` against *their* clock, so *"a board member
opening a 'Last 90 days' link days later saw a different 90-day window
(different numbers) than the owner shared."* The signer resolves the window
and stores absolute ISO instants, pinning an open-ended end to the mint instant
*"so post-share scans don't leak in either"*. `winEnd`'s presence as a string
is the marker that a token froze its window, and its absence identifies a
legacy token whose reader falls back to recomputing — a compatibility seam,
not a design choice.

**A window bound changed dialect without breaking links in inboxes.** When the
rest of the app moved to half-open windows, the share path was the last
inclusive one — and the one whose window leaves the process in a signed token
and comes back days later. The fix *adds* a field rather than re-meaning one:
`winEndX`, the half-open upper bound the reader queries with, is derived from
the same instant as the inclusive `winEnd` (`winEndX === winEnd + 1ms`) so the
two cannot drift, and `winEnd` is kept unchanged so the HMAC covers exactly
what it covered at mint time. A token with no `winEndX` renders with the
inclusive bound it was minted for, because the two dialects are *not*
interchangeable at millisecond resolution and a changed number on a link
already forwarded is a defect however unlikely. The lesson generalises to any
signed payload with readers in the wild: evolve by superset.

**The grant has an identity.** `jti`, a random UUID per mint, was added
because `mintedBy` was the only handle on a link, so the only kill switch was
demoting the person who minted it — which killed every other link they had ever
issued, and nobody could answer *"does grant n exist, and was it opened."* The
token stays stateless: the reader injects a revocation predicate into
`verifyBriefingShareToken` (`:272`), so the token module does no I/O.
`briefingShareRevocationKey` (`:148`) names the grant's row in a permanent
revocation ledger — chosen over the audit log precisely because the audit log
is swept by retention, and *a purged revocation row would silently un-revoke a
link*. An owner-gated endpoint revokes one `jti`; the mint route and the shared
page log `briefing.share.minted` / `briefing.share.opened` against it. A token
minted before `jti` existed keeps working, governed by its TTL and `mintedBy`
alone.

**Expiry is sized to the reporting cadence.** `DEFAULT_TTL_MS` (`:29`) is seven
days, annotated *"a board cycle; shortened from 14d to bound a leaked link's
exposure window"*. The lifetime is derived from how often the document is
reissued, not from a session-token default.

## Revocation: two levers, one stateless token

`mintedBy` survives as the coarse lever: the shared page honours the link
*"only while `mintedBy` still holds owner access, so removing/demoting them
kills their shared links"*, so a person leaving takes every capability they
minted with them. It is applied only under the enforced membership wall where
the authority check has a source of truth. The `jti` ledger is the fine
lever, for "that one went to the wrong address". Together they cover both
cases that actually happen without turning the token into a stored record.

Verification is server-side and total: signature timing-safe, framing
well-formed, `exp` in the future, revocation predicate consulted when a `jti`
is present, and every field re-typechecked after decode rather than trusted
because the signature passed. The signature proves the payload was minted
here; it says nothing about whether the payload is the shape this version of
the reader expects.

## Live re-render plus a fingerprint, instead of a snapshot

The technique prefers a frozen snapshot behind the link over a live re-render.
This implementation first kept the re-render, and recorded that as the half-
implemented part. The later fix declines *both* of the two obvious designs, and
the code comment (`:150-185`) gives the reasoning:

- **A stored snapshot** is immutable and cheap to serve, but it is a new stored
  artifact holding fleet-wide security posture in a system with a retention
  floor and an on-demand erasure path that every such artifact must be
  reachable by. An un-purged copy surviving an erasure request is a worse
  defect than the drift being fixed, and a forwarded months-old artifact
  *"goes stale invisibly"*.
- **Re-running against a pinned scan set** pins only one of the drift sources.
  With the window frozen, a later scan is already excluded; what still moves
  under a recipient is the benchmark corpus (other orgs scanning), goals,
  recommendations, the repo set itself, and retention deleting scans inside
  the frozen window. A pinned set catches none of those.

The third line: keep the re-render and carry, inside the already-signed token,
a fingerprint of the quantities the sender saw. `briefingFigureDigest`
(`:186`) hashes a projection of every figure a board reader could quote —
scores, coverage, movement, benchmark, goals, forecast basis, recommendation
titles — and ignores presentation (titles, dates, repo names). The digest
includes the **denominator** (`realScoredCount`, `mockCount`) on purpose: a
fleet that gains a live score where it had only a placeholder reports the same
coverage and a different average basis, and *"figures unchanged since this link
was created"* over a re-based average would be a falsehood told by the one
mechanism that exists to prevent it. It is truncated to 16 hex characters
because it detects accidental drift and is not a security boundary.

`shareIntegrity` (`:228`) returns a three-valued answer, `unverifiable` /
`unchanged` / `changed`, and the doc comment is explicit that the first must
stay distinct from the second: a legacy token carries no fingerprint, and
*claiming the figures match when nothing was compared* is the silent falsehood
the feature removes. On `changed` the page says the figures moved and asks the
reader to request a fresh link. The accepted cost is stated in the code:
strictly worse than a snapshot for reproducibility, strictly better for
staleness and erasability, and never silent.

## Deviations from the technique

One remains, and it is now a documented choice rather than an omission.

- **The recipient cannot reproduce the sender's exact numbers.** The technique's
  "prefer a frozen snapshot" rule is answered by disclosure rather than
  storage. Where the retention and erasure constraint does not bind — a system
  with no erasure obligation on the rendered artifact — the technique's
  preference is still the simpler design, and this implementation should not be
  read as evidence against it.
