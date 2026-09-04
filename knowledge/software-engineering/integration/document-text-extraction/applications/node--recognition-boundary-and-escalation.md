---
layer: application
type: application
subject: document-text-extraction
technique: recognition-boundary-and-escalation
stack: node
verified_on: 2026-09-04
verified_against: node@20
proof: structural-only
---

# The list of places the router already knows it is blind

The witness for `node@20` is the pinned toolchain in the project's own
continuous-integration workflow, not a declared floor: the package manifest
says only `>=20`, and a floor is a claim about what might work rather than a
record of what was exercised. The matrix that actually runs the suite pins 20,
and one adjacent job pins 22.

The tree is a document-retrieval engine whose cheap path is a plain HTTP fetch
and whose expensive paths are, in order, a fingerprint-matching transport and a
full rendering engine. It routes between them exactly the way this technique
prescribes: the cheap path runs first, and its *refusal* — an emptiness check on
what came back, plus a set of predicates over the response — is what triggers
the expensive one. Nothing routes on the address's shape, its publisher, or a
guess about how the page was built.

That is the technique working as written, and it is worth saying so before the
interesting part: the engine did not arrive at refusal-routing and then discover
an exception. It arrived at refusal-routing, ran it against real targets, and
found a population where the refusal never fires.

## What the tree has that the technique did not predict

Two constant sets sit above the router, and each is a list of addresses sent
straight to a more expensive tier on first sight, with no cheap attempt at all.
Both carry their justification in the source beside them, and the two
justifications are different failures.

The first set exists because a class of counterparty **closes the connection
instead of answering**. There is no status, no body, and therefore no predicate
to evaluate: the cheap attempt burns the entire per-request budget on a call
that was never going to return, and the caller then receives whatever thin
fallback the engine can assemble. The refusal that was supposed to trigger the
escalation is not late — it does not exist.

The second is the one worth reading twice, because it fails in the opposite
direction and is much harder to see. Those addresses **do** answer, promptly and
successfully, with enough navigational furniture to clear the emptiness
threshold that guards the refusal — while the part anyone actually wanted is
assembled by script after the fact and is not in the response. The cheap path
does not merely fail to trigger the escalation here; it reports a success. The
comment in the source names one such address explicitly and says the router
"keeps mis-classifying these", which is the honest form of the admission: the
detection is not weak, it is measuring something that genuinely is present.

## Why this is a pre-route and not the category routing the technique rejects

Read at a distance the two look identical — a hard-coded list that skips the
cheap path. The distinction is in how membership is decided, and the tree makes
it visible in three places.

Membership is **enumerated, never predicted**. Each entry is an address someone
watched fail, and the comment records which of the two failures it was. A
property-based rule — this publisher, this document type, this size — is exactly
what the technique rejects, and nothing here derives membership from a property.

The set is **extensible at run time by the operator**, via an environment
variable read alongside the built-in constants and matched on the same
host-or-subdomain rule. That is not a convenience. The population is discovered
rather than designed: a counterparty changes how it answers and joins the list
without telling anyone, so a version of this list that could only change at
release time would pin every installation to whatever was known when it shipped.

And it stays a **bypass rather than a policy**: everything not on the list still
goes through refusal-routing, and the list is consulted only to choose a
starting tier, never to skip the checks that follow.

## The structural fact

The engine could have been built to prove that refusal-routing is sufficient. It
is a retrieval product, its whole tier ladder is refusal-driven, and a curated
address list is the least fashionable thing in it — the kind of constant a
reviewer asks to delete. It survived anyway, in two independently justified
copies, with the failing addresses named in comments.

That is better evidence than an endorsement would have been. Nobody set out to
demonstrate the limit of the rule they had just implemented; the limit
accumulated in a constant nobody wanted, which is where a real boundary usually
shows up first.

## What this realization cannot tell you

There is no measurement here of how large the blind population is, or of how
fast it changes. The list is a record of the addresses somebody happened to hit
and diagnose, so its size reflects usage rather than prevalence, and a reader
copying this should not read the entry count as a signal about their own
targets. The tree also has no instrument that would notice an entry becoming
unnecessary — a counterparty that starts answering normally keeps its bypass
forever, paying the expensive tier for nothing, and nothing in the tree would
report it.
