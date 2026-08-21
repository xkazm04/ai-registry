---
layer: technique
type: technique
subject: executive-reporting
technique: expiring-share-links
status: forged
laws: [creation-names-reaper, identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [a report must be readable by someone without an account, choosing an expiry for a shared document, revoking access to a distributed snapshot]
---

# Expiring share links

The moment a report is shareable, its access model becomes part of the
document's design. The naive implementation — a long random path that renders
the report to anyone who has it — is not a small shortcut; it creates an
immortal, unattributable, unrevocable copy of internal measurement, and it is
usually built in an afternoon by someone solving a legitimate problem (a
stakeholder without an account needs to read this).

The correct primitive is a **capability**: a signed token that states what it
grants, for how long, and is verified on every read. A capability differs from
a secret URL in the property that matters — the server can decide, at read
time, that this grant is no longer valid, without needing to have remembered
issuing it.

## Expiry is a correctness feature before it is a security one

The security argument for expiry is familiar and secondary. The stronger
argument is about the document itself: **reports age into lies.** A snapshot
of a period, forwarded eleven months later and opened by someone who was not
in the original thread, is read as current. Nothing on the page is wrong; the
reader's frame is. Expiry is the mechanism by which a document's as-of date
becomes enforceable rather than advisory — and it is the reason a share link's
lifetime should be tied to the *reporting cadence* (a weekly report's link
outliving a few weeks serves no one) rather than to a generic default lifted
from a session-token policy.

The corollary is that expiry must be **visible and recoverable**: an expired
link renders a page saying the report has expired and how to request a current
one, never a generic not-found. A not-found teaches the recipient that your
system is broken; an expiry notice teaches them that the report was a
snapshot, which is exactly the lesson.

## Anatomy of the capability

- **Payload states the grant explicitly** — which report, which scope, which
  period — so the verifier never infers authority from the token's existence.
  A token that means "you are authorized" without saying to what is a token
  whose blast radius grows with every feature added to the route.
- **Signed with a server-held key**, verified server-side on every read.
  Client-side validation of a share capability is not validation
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **Expiry inside the signed payload**, so it cannot be edited by the holder,
  and enforced by the verifier rather than by the link's absence from a UI.
- **A stable identifier for the grant itself**, minted at issue time, so it
  can be listed, audited, and revoked individually
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
  Identifying a grant by its recipient's email or by its creation timestamp
  fails the first time one recipient gets two links.
- **The window frozen as absolute instants**, not as a relative key. This is
  the defect a stateless capability invites and nobody predicts: a payload
  carrying "last 90 days" is re-resolved against the *recipient's* clock, so a
  board member opening the link three days later reads a different ninety-day
  window — different numbers — than the sender shared, with both parties
  certain they are looking at the same report. Resolve the window at mint time
  and carry the absolute start and end; pin an open-ended end ("now") to the
  mint instant so activity recorded after sharing cannot leak in. Keep the
  human-readable range label too, for the title, but never as the thing that
  gets recomputed.
- **A revocation check** consulted at read time. Signature plus expiry alone
  means a leaked link is live until its clock runs out; revocation is the only
  answer to "that went to the wrong address". Where a design is committed to
  stateless tokens, the practical form is to **carry the issuer's identity in
  the payload and honour the link only while that issuer still holds the
  authority they shared under** — so removing or demoting a person kills the
  links they minted, without a revocation table. It is not full revocation,
  but it closes the case that actually happens.
- **A named reaper.** Grants, and the rendered snapshots behind them, are
  created resources —
  [creation-names-reaper](../../../../_laws.md#creation-names-reaper) — and the code
  that issues one states what deletes it and when. Expired-but-retained grant
  rows are how a share table becomes an inventory of everything the company
  ever measured.

Distinct from all of this: signing a **build output** so its origin and
integrity can be verified downstream is the
[signed-artifacts](../../../../security/signed-artifacts/signed-artifacts.md) subject. A
share capability grants read access to a rendered document; it is not a
provenance attestation, and borrowing that vocabulary invites someone to treat
a share link as proof the numbers are authentic.

## Decision rules

- **When issuing a capability, its scope is never wider than the narrowest
  fact it renders.** A report containing one restricted dimension is a
  restricted report; scope is computed from contents, not chosen from a
  dropdown. Any narrowing the sender applied — a segment, a sub-population, a
  filtered view — travels *inside the signed payload*, so the recipient's read
  reproduces the sender's scope rather than widening to the default.
- **When the report's period is fixed, prefer a frozen snapshot behind the
  link over a live re-render.** A link that re-queries shows a recipient
  numbers that move between openings and, worse, may widen over time as data
  arrives. A shared *report* is an artifact; a shared *dashboard* is a
  different product with a different consent conversation.
- **When choosing a lifetime, derive it from the cadence** — a small multiple
  of the reporting period — and make it overridable downward, not upward,
  without an explicit approval.
- **When a link expires, render an expiry page, not a not-found.**
- **When a recipient needs ongoing access, that is an account, not a longer
  link.** Extending link lifetimes is the path by which capabilities become
  permanent credentials with no owner.
- **When access is logged, log the grant identifier and not merely the report
  identifier.** "Someone opened this report" is not an audit trail; "grant 47,
  issued to this address, opened four times from two networks" is.

## When not to use it

- **Internal readers with accounts** should read through normal
  authorization — a share link for someone who could just log in adds an
  unrevoked path to the same data.
- **Genuinely public reporting** (a status page, a published transparency
  report) needs no capability at all; a capability implies restriction, and
  wrapping public data in one only makes it harder to cite.
- **Highly sensitive contents** should not be shared by link at all. A
  capability is a convenience mechanism with a broad recipient surface —
  forwarded mail, chat archives, screenshots — and no expiry makes that
  surface acceptable for data that must be attributable per reader.

## Smells

- A share route that renders whenever the token parses, without a revocation
  lookup.
- Share grants with no expiry column, or an expiry column nothing reads.
- Expired links returning the generic not-found page.
- The share table growing monotonically with no reaper — every report ever
  shared, still resolvable.
- A "share" button whose scope does not change when the report contains a
  restricted dimension.
