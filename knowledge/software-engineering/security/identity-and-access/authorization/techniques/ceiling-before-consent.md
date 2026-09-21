---
layer: technique
type: technique
subject: authorization
technique: ceiling-before-consent
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a client initiates pairing by naming the scopes it wants, an approval surface renders the requester's own list of capabilities, minting a grant from scope strings that arrived on a request, deciding what an unrecognised scope in a request means, an unattended path approves a grant nobody looked at]
applied: code
ab_verdict: better
---

# The ceiling is applied before consent

A delegation ceremony starts with the party that wants authority describing the
authority it wants: a client opens a pairing door, names a set of scopes, and a
surface asks a human to approve them. The design is sound and standard. The
defect that rides in with it is structural and easy to miss, because every
individual step looks like a check: **the set the approver is shown is the set
the requester wrote.**

A subtract-only approval surface — the requested scopes as pre-checked boxes,
Approve and Reject beneath them — can narrow *within* the request and cannot
narrow *below* it. So the widest outcome of one approving click is exactly what
the requester asked for, the default outcome is exactly what the requester asked
for, and the only thing standing between a caller-chosen capability and a minted
grant is a person reading truncated strings in a modal. The requester has not
bypassed the gate. It has authored the gate's option set.

## The rule

**A request may *name* capabilities; only the issuer may *bound* them.** Before
the request reaches a human, a persisted screen, or a mint, it is intersected
with the **ceiling of the lane it arrived on** — the set of capabilities this
door may ever issue — and the result is what the approver sees and what the mint
is allowed to write. The intersection happens twice, for different reasons:

- **Before display**, because a surface that renders an ungrantable capability
  has already told the human it is on offer, and the disclosure is the decision
  ([gate-sees-target](../../../../_laws.md#gate-sees-target): what is shown
  derives from the grant that will actually be written).
- **At the mint**, because the surface is not the only caller. The approval
  entry point takes a scope list as an argument, and a second surface, a
  replayed message, or a later refactor can hand it a list the first
  intersection never saw. The mint's own intersection is the enforcement; the
  pre-display one is the honesty.

Everything the issuer adds on its own authority — a marker scope identifying how
the grant was minted, a binding to the requesting origin, an expiry — is added
after the intersection and is not subject to it. That asymmetry is the whole
shape: **subtraction is the request's business, addition is the issuer's.**

## The ceiling is per lane, not per system

There is no single answer to "which capabilities may be granted", because the
same vocabulary is issued through doors of very different trust. An
operator minting a key inside an already-privileged surface may name anything
the vocabulary has. An unauthenticated door that any page can knock on may name
a small subset. The ceiling is therefore a property of the **issuance lane**,
written down beside the lane's own handler, and the two lanes share one
vocabulary registry and nothing else
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

Which capabilities a public lane must exclude is answered by reading the
enforcement table, not by intuition: any capability that (a) causes stored
secrets to be exercised, (b) authorizes minting further grants, or (c) exists to
mark grants the issuer minted itself, is outside every request-initiated lane by
construction. The third is the one that gets missed, and it fails with a
particular signature — the code asserts in a comment that "only the issuer's own
path holds this scope" while a request naming it is minted verbatim, so the
invariant is documented, believed, reviewed, and false.

## An unrecognised scope is dropped at the mint, not only at the check

The vocabulary rule says an unrecognised scope is a refusal at the enforcement
point. That leaves the issuance side open, and the issuance side is where the
damage is cheaper to prevent: a grant carrying a string no gate will ever match
is an orphan the moment it is written, and it teaches every later reader that
the string means something. So the mould drops what the registry does not know
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and the
drop is recorded rather than silent — the audit line carries *requested* and
*granted* as two fields, so a request that asked for more than it received is
visible afterwards, which is the only signal distinguishing a misconfigured
integration from one probing the door.

Dropping is not refusing the request. The door still answers success: a
pre-authentication entry point that returns an error listing what it would not
grant is a capability oracle for anyone who can reach it, and the flows that
legitimately ask for a scope this build does not have (an older client, a
feature-flagged capability) would break on an error where they degrade on a
drop. Refuse loudly at the *mint*, where the caller is already inside; mould
quietly at the *door*.

## Removing the human does not remove the ceiling

An unattended approval path — a mode that auto-approves so an automated driver
can pair without a person — is the case this technique exists for, and the one
most likely to be written around it. When the human step goes away, the
requester's list becomes the grant with nothing in between, so the mould is the
only remaining control and it must be the *same* function the attended path
calls. Two implementations of one ceiling is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
violated in the direction that fails open: the attended path is the one that
gets reviewed, and the unattended path is the one that runs unobserved.

## Where a caller-supplied set is legitimate

The failure above invites an over-correction — "a scope set must never come from
the caller" — and that rule is false, in a way worth stating so nobody enforces
it. A holder of broad authority narrowing itself is the good case: the party that
already holds a capability asks for a derived grant carrying less, names the
resource it wants the grant pinned to, and the issuer computes the pin from its
own record of that resource and intersects with the *minter's* authority. The
request is caller-supplied throughout, and nothing widens, because the ceiling —
what the caller itself holds — is server-held and the intersection is computed by
the issuer.

The discriminator is not the provenance of the list. It is whether a
**server-owned ceiling exists to intersect it with**:

| the caller's list is | and the ceiling is | verdict |
| --- | --- | --- |
| a set of scopes it wants | the lane's declared grantable set | fine - mould it |
| a set of scopes it wants | the list itself, ratified by a click | the defect |
| a narrowing of what it holds | its own current authority, re-read | fine - the standard delegation narrowing |
| a filter merged into a server predicate | a separate conjunct the caller cannot reach | fine - the mandatory-predicate rule |
| a filter merged into a server predicate | whatever the combination logic computes | the defect, and the combination logic is now the security control |

The last two rows are the same rule one layer down, and the read path states it
from its own side
([layering-rules](../../../../backend-platform/data-layer/data-access/techniques/layering-rules.md)
refuses a caller-supplied filter as a mandatory predicate's structural form): a
caller-supplied *predicate* is safe exactly when the server's own predicate is a
structurally separate conjunct — its own bound parameter, ANDed outside anything the caller
can spell — and unsafe the moment the two are merged into one expression, one
key-value map, or one policy list whose combination order decides the outcome.
Where the merge is unavoidable, the combination rule is written down and tested
as a security control, because that is what it has become.
