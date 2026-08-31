---
layer: technique
type: technique
subject: error-handling
technique: taxonomy-design
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [deciding whether timeout and unreachable are one kind or two, retry loop hammers a dependency that can never succeed, a new category degrades to unknown across the wire, a component recovers by default and you must say what it may never recover from]
---

# Taxonomy design

The taxonomy is the closed vocabulary of failure kinds that every consumer —
retry policy, automated recovery, user copy, dashboards — branches on. Its
design determines whether classification happens once or is re-improvised at
every consumer.

## Closed, small, consumer-driven

- **The set is closed.** An enumerated type, not an open string field. Open
  vocabularies grow one ad-hoc value per contributor until no consumer can
  branch on them; a closed set forces every new failure kind through a
  deliberate decision: which existing category does this belong to, or what
  does a new category let a consumer do differently?
- **A category earns its place only if some consumer branches on it.**
  "Timeout" and "unreachable" deserve separate categories only if retry
  policy, recovery, or user copy treat them differently; if every consumer
  handles them identically, they are one category with two causes. Taxonomies
  designed by enumerating everything that can go wrong grow to dozens of
  entries nobody branches on; taxonomies designed from the consumers'
  questions stay under about ten.
- **The catch-all is an explicit member.** There is always a failure the
  classifier does not recognize; "unknown" is a first-class category with the
  most conservative properties (not retryable without human judgment, generic
  honest copy) — never an accidental fall-through into whichever category
  happens to be the default branch.

## The axes every consumer asks about

Whatever the category names, each category must answer three questions,
because these are the questions consumers branch on:

- **Transience — can retrying possibly succeed?** Transient (timeout,
  unreachable, throttled) versus permanent (malformed request, not found,
  forbidden, invariant violation). This is the single most valuable bit in
  the taxonomy: it is the difference between a retry loop that heals a blip
  and one that hammers a dependency with requests that can never succeed.
- **Fault line — whose situation must change?** The system's (retry,
  failover), the user's (fix the input, choose a different name), or the
  relationship's (re-authenticate, grant access, pay). This axis drives user
  copy: it decides whether the next action offered is "wait", "edit", or
  "sign in".
- **Remediation hint — what would recovery do?** Categories that automated
  recovery acts on (refresh the credential, re-establish the connection,
  back off) carry that hint as data, so recovery logic switches on the
  category rather than re-inspecting the raw error.

## The fourth axis, where leniency is the design

The three axes above are the questions asked by consumers who sit *above* the
failure — retry policy, recovery, user copy — and they are the complete set
for a system that lets failures rise. A subsystem built to be **lenient**
asks a fourth question none of them cover, and asks it first:

- **Recoverability in place — may this failure be absorbed here and the work
  continued?** A recovering component (a parser over inputs from software
  you do not control, a renderer over half-valid content, a scanner over a
  tree with unreadable corners) is specified to skip what it cannot use and
  keep going. Its whole value is that a defect in one region does not cost
  the caller the other regions.

This axis is invisible in a system whose failures all rise, which is why
enumerations of the taxonomy's questions routinely stop at three. It becomes
load-bearing the moment absorption is the *default*, because then the
interesting membership is inverted: the vocabulary must name the categories
that may **never** be absorbed, and that set is a security boundary.

The reason is mechanical. A lenient component absorbs failures inside parts
it treats as optional. If the categories minted to stop resource exhaustion —
the decompression cap, the nesting cap, the expansion cap — are absorbable
like any other, then an adversary does not need to defeat the caps; they need
only place the payload in a part the component considers optional, where the
cap fires, is absorbed, and the component continues. **A limit that can be
swallowed is not a limit.** The same holds for any category whose purpose is
to *stop* rather than to *describe*.

So the axis is a predicate on the category, answered at the authority
alongside the other three, and consulted by the recovery machinery rather
than by a door:

- **Absorbable** — the ordinary producer quirk. Skipped, logged, work
  continues. The bulk of the vocabulary in a lenient component.
- **Never absorbable** — fires identically in every context, including
  optional ones, and terminates the operation. Small, deliberate, and
  enumerated in one place.

Two properties keep it honest. It is answered **per category, not per site**
— the per-site marker that governs an ordinary sanctioned drop does not scale
to a component whose every parse step is one, and the discipline that
replaces it is described in
[swallowed-error-prevention](./swallowed-error-prevention.md). And an
absorbable failure still owes a door: absorbed is not silent, it is
*not-user-facing*, which is the ordinary background routing and not an
exemption from it.

**Per category is not quite enough, and the residue is where a cap becomes an
outage.** Absorbability is a predicate on the category *and* on how the
triggering input arrives. The stop-categories above were argued from an input
that arrives **uncorrelated** — one payload, one caller, an attacker's
oversized region in one document — where absorbing defeats the limit and
refusing costs one request. The same category inverts when the input is a
**broadcast artifact**: one configuration file, one model bundle, one feature
list, pushed to every instance at once. There a non-absorbable refusal is
perfectly correlated, so a cap firing exactly as designed takes down every
instance in one propagation cycle, and the blast radius is the fleet rather
than the request. The rule is not that such caps should be swallowed — a limit
that can be swallowed is still not a limit. It is that a stop-category
reachable from a broadcast input owes a **second** decision the per-request
case never needed: what the instance runs on when the newest artifact is
refused. Continuing on the last artifact that passed, loudly and with the
staleness visible, is the usual answer, and it is a different mechanism from
absorption — the limit still fires, the operation still terminates, and the
process does not. Categories minted from a parser's threat model should
therefore be checked against the fleet's distribution paths before they are
declared never-absorbable, because the two arrival shapes give the same
category opposite correct answers.

Two details decide whether the fallback is a repair or a second outage. **The
staleness must be visible**, or the fleet quietly enforces last month's rules
while every instance reports healthy — the refusal is loud for one boot and the
consequence lasts until someone notices, so the stale state belongs on the
running artifact's own status, not only in the log line that announced it. And
**the fallback path must carry the artifact's identity itself.** A validator's
diagnostics name the field and the file because the validator knows what it was
validating; the *parse* that precedes it does not, so a truncated or corrupt
artifact typically fails with a decoder error naming nothing. A fallback that
inherits its diagnostics from the validator will handle five failure classes
informatively and the sixth — the partial write, which is the most likely
artifact-distribution failure of all — with an unattributed syntax error.

## Retry-interval extraction

Throttling deserves special handling: it is the one category where the
*failure itself states the remediation schedule*. When the raw error carries
a stated wait interval — a header, a structured field, a documented value —
extract it **at classification time** and carry it as a typed field on the
classified error. Consumers must never re-parse the raw error to find it;
half of them will forget, and those retry at their default cadence, which
against a throttling peer means retrying *into* the penalty window and
extending it. Absent a stated interval, the category's default backoff
applies — but the stated interval, when present, always wins.

## One authority, mirrored — never re-declared

The taxonomy is consumed everywhere failures flow: multiple layers, often
multiple languages, often across a process or wire boundary. The governing
law is [one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary):

- **Exactly one definition is authoritative** — declared once, in the layer
  closest to where classification happens.
- **Every other representation is generated from it**, not hand-maintained.
  A hand-copied mirror on the far side of a language boundary is a race with
  a delay fuse: the copies diverge exactly when someone adds a category and
  finds only one of them, and the far side's default branch silently absorbs
  the new category — the taxonomy's own catch-all defect, self-inflicted.
- **The wire format is part of the contract.** The serialized spelling of
  each category (its tag string, its casing) is fixed by the authority and
  round-trip tested, because a category that serializes on one side and
  fails to parse on the other degrades to "unknown" without any error —
  a misclassification that no gate sees.

## Evolving the taxonomy

- **Adding a category** is safe when every consumer has a total match
  (compilers enforce exhaustiveness) or a deliberate catch-all with
  conservative behavior. Add the category at the authority, regenerate
  mirrors, then teach consumers — in that order.
- **Splitting a category** (one kind becomes two) is the common real-world
  evolution: some consumer discovers it needs to treat two causes
  differently. Split at the authority and let exhaustiveness checking walk
  you through every consumer; the sites the compiler cannot reach (wire
  parsers, stored historical values) are the ones to audit by hand.
- **Never repurpose a tag.** A stored or logged category value is a
  historical record; reusing its spelling for a different meaning corrupts
  every dashboard and every stored failure retroactively.
