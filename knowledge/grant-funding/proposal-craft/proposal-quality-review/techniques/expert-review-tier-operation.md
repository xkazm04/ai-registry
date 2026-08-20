---
layer: technique
type: technique
subject: proposal-quality-review
technique: expert-review-tier-operation
status: forged
laws: [clean-is-not-ready]
shared_with: []
use_when: [adding a paid human review tier above automated checks, designing claim and refund semantics for an expert queue, deciding whether a human service should be visible when unstaffed]
---

# Expert-review tier operation

Automated gates bound the shape of a draft; whether the argument persuades a
program officer is a judgment no deterministic check reaches — a fully green
report still ends with "give it a human read before filing", which is
[clean-is-not-ready](../../../_laws.md#clean-is-not-ready) applied to the limits
of the machinery itself. The expert tier makes that human read a product: a
seasoned grant editor reviews the draft and returns written feedback. The
editorial value is obvious; the technique is the *operations* — a paid queue
touching a shared wallet, scarce human time, and a promise the product must
be structurally unable to break.

## Dormant when unstaffed — never sell what you cannot deliver

The tier's availability derives from a live roster of qualified reviewers,
read at call time. **Zero reviewers configured means the feature is dormant:
presented as "coming soon", never requestable, never billed.** This is the
foundational rule because its violation is the worst failure the tier has —
taking payment for expert attention that does not exist. The check sits at
the top of the request path, before any charge, and reads the roster fresh
so staffing changes take effect without redeployment. The same allowlist
answers "may this person act as a reviewer", keeping availability and
authorization from drifting apart.

## The request lifecycle is a small, strict state machine

`requested → in_review → completed`, with `cancelled` reachable only from
`requested`. Each transition has an owner and a guard:

- **Request** (the applicant): refuse if the tier is dormant; refuse if the
  draft already has any non-cancelled review — one active review per draft,
  so a user can neither pay twice nor re-queue a draft an editor already
  handled (a cancelled request may be re-requested). Charge the shared
  workspace wallet up front, with a reference tying the debit to this
  specific review.
- **Claim** (a reviewer): `requested → in_review`, recording who and when.
  Claiming is the commitment point — after it, the editor's time is spent.
- **Complete** (the claiming reviewer): `in_review → completed`, and only
  with non-empty feedback. Empty feedback is a refused transition, not a
  completed review with nothing in it.
- **Cancel** (the requester): allowed only *before* claim, and it refunds.
  Once claimed, the fee is earned whether or not the requester still wants
  the review.

Every guard checks the *current stored status*, making double-claims,
completing an unclaimed review, and cancel-after-claim structurally
impossible rather than merely discouraged.

## Money rules the state machine must keep

- **Refund what was actually debited, not the list price.** Record the fee
  charged on the request itself and refund exactly that on cancel. The trap
  this closes: any bypass or promotional path that made the request free
  turns a request-then-cancel round-trip into minted balance if the refund
  reads the price list instead of the receipt.
- **Charge and refund idempotently, by reference.** The review's id ties
  debit to credit; a retried cancel must not refund twice.
- **The tier obeys the product's global metering rules.** If other paid
  operations honor a bypass or an allowance, this one does too — a paid
  feature that uniquely ignores the bypass is a bug discovered by the first
  internal tester, in the embarrassing direction.
- **Charge before enqueue, refund on failure to enqueue** — never the
  reverse, which creates reviews the wallet never paid for.

## Operational surface

Reviewers work from a queue of open requests across the whole customer base;
requesters see only their own draft's review. Attach enough context to the
request for the editor to be effective — the proposal, the funder, the
applicant's note — and deliver feedback back into the same surface where the
automated review already lives, so the writer meets machine findings and
human judgment in one place, clearly attributed.

## When not to use it

Do not gate submission on expert review — it is a paid judgment layer, not a
compliance step, and making it mandatory converts scarce editor time into a
bottleneck on every filing. Do not simulate it: a model's prose critique
presented under a human-review label is misrepresentation, whatever the
disclaimer says. If the roster is empty and demand exists, the honest moves
are staffing or the dormant state — never a silent downgrade to machine
feedback.
