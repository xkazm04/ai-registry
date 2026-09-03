---
domain: software-engineering
subject: rate-limiting
last_touched: 2026-09-03
touched_by: harvest
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

- **This subject is now at ten techniques, and nothing enforces a ceiling.** Two
  concurrent waves each respected the observed house maximum of nine in isolation; the
  union is ten. The next structure pass should decide whether nine is a real bar or an
  observation that has been overtaken. Note the ordering that emerged by accident and is
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
