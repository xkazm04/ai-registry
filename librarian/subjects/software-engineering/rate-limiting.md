---
domain: software-engineering
subject: rate-limiting
last_touched: 2026-11-11
touched_by: shift
dry_streak: 0
---

# rate-limiting

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - harvest wave (run 4)

Gained `untrusted-key-derivation` and `unattributable-client-bucketing` (8 -> 10
techniques) and a fifth application, `node--untrusted-key-derivation`. See
[[2026-08-22-4]].

Held deliberately to two techniques rather than three: the subject was already the
second-largest in its subcategory. Both sit *upstream* of `key-design`, which assumes you
have a key. The first is how you obtain one from a request whose every identifying header
the caller wrote - an ordered trust ladder, a platform's forwarding header trusted only
when you are actually running on that platform, and conventional proxy headers honoured
only under an explicit operator opt-in. The second is what to key on when the ladder runs
out, and why the obvious answer is the worst: pooling every unattributable caller into one
bucket makes ordinary traffic exhaust one shared allowance, a denial of service delivered
by the control meant to prevent one.

The discipline that makes the fallback safe is a labelling rule, not a cryptographic one:
call it entropy, not identity, at the site, so no later reader promotes a spoofable value
into a trust decision.

### 2026-08-22 - `/research`, from an external source

Gained `metered-step-selection` (7 -> 8 techniques). Source:
[[2026-08-22-ai-agent-race-exploded]].

`limit-derivation` computed a limit's number and nothing owned its subject - which step
the counter increments on. The corpus's two metering subjects both meter admission or
spend, so the case where producing is cheap and the harm is in distribution had no
answer. The new technique sits *before* derivation, key-design and refusal-contract, all
of which presuppose the step was chosen.

`gate-sees-target` turned out to apply to counters as cleanly as to checks: a limiter on
a proxy step fires exactly when the proxy diverges, and an abuser is the person most
motivated to make it diverge.

## Open leads

- ~~**This subject is now at ten techniques, and nothing enforces a ceiling.**~~ **Decided
  2026-11-11 (librarian-1111): nine was an observation and has been overtaken; no split.**
  See the dated section at the end. Two
  concurrent waves each respected the observed house maximum of nine in isolation; the
  union is ten. Note the ordering that emerged by accident and is
  worth keeping: `metered-step-selection` (which step) -> `untrusted-key-derivation`
  (what identifies the caller) -> `unattributable-client-bucketing` (when nothing does)
  -> `key-design` (what the key composes) -> `limit-derivation` (the number).
- **`usage-limit-governance` (llm-observability) is the sibling case.** It meters spend
  by dimension and has the same blind spot from the other side. Cross-bundle links are
  forbidden, so if that subject ever needs this rule it needs its own copy - check
  whether that is duplication worth paying before writing it.
- **`a predicate's name states its direction, or the negation site decides it`** (proposed
  law, not added). Two sightings, both inside this subject, both in the tree it was
  reconciled against. The worker asked for a third before promotion.

## Standing debt

- **Never swept by `/librarian`.**

## Declines

None.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

`cpp--algorithm-selection` application only (a catch): a desktop chat client's egress
token bucket sized below the provider's published per-connection ceiling on both axes,
with a per-spend refill that makes it the technique's degenerate sliding-window case.
Negative finding: the bucket can never say no - the queue is unbounded and the provider
sends no refusal for the operation, so conservative provisioning is the whole defence.
The tree calls it a leaky bucket; by this subject's vocabulary it is a token bucket with
a queue.

## 2026-11-10 - /harvest backlog 5-016 ([[2026-08-26-dhh-lex-fridman]], /shift filler)

New technique `unpublished-behaviour-limit`, better, blind-ab, plus a one-sentence
correction to `limiter-topology`: an egress limiter that cannot count fails open only while
the remote answers with a refusal, and visible creation fails closed where it answers with a
sanction on the identity. Probes from three real sites in this registry's own fleet history
(a worker brief that files one issue per branch family, a thirteen-worker sweep refused while
the published quota read full, a review agent asked to file its findings publicly); 2 runs per
arm per probe, rubric, target and floor written first, one blind judge per pair, labels
randomized. Draft in context 6.00 of 6 against 2.17 without; 6 of 6 pairs won; the
over-correction criterion held (1.00 against 0.83). Positive controls: a reference answer 6 of
6, a backoff-only answer 1 of 6, an over-corrected answer scored 0 on the counter-check.
Weakest points: rubric wording grew from the draft, so part of the lift may be vocabulary; the
source's "ban" is unverified, and local history shows only temporary blocks. Not applied at a
seam: the hygiene worker brief's per-family filing step lacks a count cap and an account-wide
budget, and that is the return. The subject is now at eleven techniques; the ceiling lead
above still stands undecided.

## 2026-11-11 - /shift `shift-backend-platform` ([[2026-11-11-backend-platform]])

New technique `failure-reserved-counting` (11 -> 12 techniques), from a backend platform's abuse-limit
design (first-party code comments, re-read at the mined commit) with an independent web-security
vendor reaching the two load-bearing rules: a counter reset by a successful login is a known bypass,
and an anti-brute-force limit is the textbook limit-overrun race. On a door that bounds guessing the
counter's subject is the wrong answer; reserve on arrival, give back one hit on success, never reset;
any limit's refusal releases the others' reservations (the atomic form of `limiter-topology`'s
evaluate-all-then-commit-all); secret-guarding limits count trusted callers too; caller-chosen key parts
are tenant-qualified. Applied read-only at a fleet pairing-code confirm chosen to falsify: it compares
and counts under one lock and needs no reservation, which became the technique's stated boundary
(reservation is the price of deciding the outcome after admission). COVERED there. The `key-design`
amendment (tenant meaning of a key part) banked untriaged. The ceiling lead above is now at twelve.

## 2026-11-11 - /librarian run `librarian-1111` (operator-approved placement pass)

**Decision: no split. Nine techniques is not a bar in this registry and never was one; twelve is
recorded as a fact, not a debt.** The ceiling lead above is closed.

Why, by the librarian's own rules rather than by taste:

- **No rule sets a technique ceiling.** The only cap the structure gate enforces is ten child
  directories per folder (`scripts/lib/taxonomy.mjs`), and that module says in terms that files are
  not counted and that a subject needs splitting for reasons "that have nothing to do with
  browsing". The standard's floor clause runs the other way (fewer than four). "The house ceiling of
  nine" exists only as a sentence in the forge skill's harvest guidance, and that is advice to a
  wave about one subject absorbing three new techniques at once.
- **The corpus overtook nine long ago.** Scan of 2026-11-11 (567 subjects): 70 hold more than nine
  techniques, 38 hold twelve or more, the largest holds 33. Spot-checked: the scan's 12 here matches
  the 12 files in `techniques/`. Rate-limiting is one of ten subjects tied at twelve, ranked 29th to 38th by size.
- **The consult still costs one subject.** The golden path is about 14 KB, under half of `prompt-assembly`'s
  (34 KB) in the same bundle. Routing holds at twelve: a `use_when`-phrased query for each of the two
  newest techniques (`failure-reserved-counting`, `unpublished-behaviour-limit`) ranks that technique
  first on the default path.
- **Demand says do not move it.** 86 consults and 1 deviation in the current reading (one current
  contributor, 2026-10-14). A split mints a new slug, and every consumer verdict against a technique
  that moved would point at the wrong identity. Churn on the third most-consulted subject of ten in its
  subcategory, for a cap that does not exist, is cost with no buyer.
- **The techniques are one decision chain**, which is what a subject is. Every one answers some step
  of "bound how much work an outside actor can cause at a door": which step is metered, who the
  caller is, what the key composes, the number, the algorithm, where limiters sit, what a refusal
  says, the refusal branch's cost, its evidence, and the two special doors (guess-bounding, and our own
  writes into someone else's service).

**When to revisit (the split trigger, stated so the next run does not re-derive it).** Not a count.
Split when a technique can no longer be written against this golden path's actor model. The seam
already visible is direction: ingress (we bound callers at our door) against egress (we bound
ourselves at someone else's: `unpublished-behaviour-limit`, the provider-quota half of
`limit-derivation`, the egress paragraph of `limiter-topology`). A split there would cut
`limiter-topology` in half, so today it would cost more than it buys. Return when a third egress-only
technique is proposed, or when an egress technique needs a section of the golden path the ingress
reader would have to skip.

Proposal for the operator (not acted on): the forge skill's "house ceiling of nine techniques" line
reads as a cap that the corpus does not hold. Rewording it to the split trigger above is a skill
content change and needs a version bump, so it is left as a proposal in the run note.
