---
layer: technique
type: technique
subject: degrade-never-block-a-candidate
technique: never-cache-a-degraded-verdict
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, uncertainty-resolves-toward-the-candidate]
use_when: [adding a cache to a model-backed hiring surface, a fallback result is about to be persisted, a provider has just recovered from an outage]
---

# Never cache a degraded verdict

## The concern

Caching is how a short operational failure becomes a long factual one about a named
person.

The arithmetic is unforgiving. An incident lasts an hour. A reasoning cache is tuned
for a week, because rationales are expensive and stable. If the write path does not
distinguish grades, that hour of degraded output is frozen for seven days — and after
the first ten minutes, nothing about the system's state reveals it. The provider is
healthy, the dashboards are green, and every read of those candidates returns a
low-quality rationale with no way to notice or upgrade it. The people affected are
whoever happened to be processed inside the window.

The rule is one sentence: **only an authoritative result is cacheable, and
cacheability is decided at the write, by the code that knows how the result was
produced.**

## Why the decision must happen at the write

At read time the degradation is invisible: the cache entry looks like every other
entry, and the reader has no access to the conditions that produced it. Any policy
implemented at the read is really a policy implemented on a guess.

At write time the producing path knows exactly what happened — which provider
answered, whether validation repaired the output, whether the deterministic floor ran,
whether the evidence budget arrived intact. That is the only moment the question
"should this be frozen?" has a truthful answer. A cache API that accepts a value
without also accepting its grade is an API that will eventually freeze a fallback.

## The procedure

1. **Make the grade a required argument of the cache write.** Not a flag on the value,
   not something inferred from a field — a parameter the caller cannot omit. A
   producer that cannot state how it produced something must not be able to store it.
2. **Define cacheability as a function of grade, in one place.** Authoritative:
   cacheable at full lifetime. Repaired: cacheable only if the repair did not touch
   the conclusion, and at a reduced lifetime. Fallback, degraded grounding, or any
   result produced during a declared incident: not cacheable, or cacheable only for a
   window shorter than a typical outage so it cannot outlive the cause.
3. **Store the grade with the entry regardless.** Even a short-lived degraded entry
   must be readable as degraded, so that a surface can mark it and a recovery job can
   find it.
4. **Make the grade a cache-key axis, not merely a stored field.** This is the step
   teams get wrong even after adopting the rest, and it fails in both directions: an
   exhausted account's deterministic stubs keep serving for the full lifetime after
   the allowance resets, *and* a later exhaustion re-serves the earlier full result as
   though it were the degraded one. Recording the grade inside the payload does not
   help — the key decided which entry was found. Resolve the grade once, before the
   key is computed, and let the same value feed both the key and the execution, so the
   two can never disagree. The key also carries the rubric or prompt version and the
   producing path, so a fallback and a full reading never collide in one slot
   ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
   When adding the axis to an existing cache, fold it in *unconditionally* rather than
   only when degraded — the entries written before the axis existed are precisely the
   ones that may already be poisoned, and an unconditional fold retires them all.
5. **Invalidate on recovery.** When the model layer returns, degraded entries produced
   during the incident window are swept and recomputed — proactively for candidates
   still in flight, lazily for the rest. Without this step, "short TTL" only limits
   the damage; it does not repair it.
6. **Never promote a cached degraded value into the durable record.** A cache is a
   speed optimisation; the audit record is a claim about a person. A fallback may
   appear in the first and must be marked in the second.
7. **Count degraded writes.** A sustained rate of uncacheable results is the signal
   that the instrument has been weak for a week — an operational fact that never
   surfaces from individual records.

## Decision rules

- **When the result carries a conclusion about a person and was not produced
  authoritatively, do not freeze it.** Recomputing costs a call; a stale fallback
  costs a candidate their reading for as long as the entry lives.
- **When a degraded entry exists and a full run is now possible, recompute rather than
  serve** — and let the record show that the earlier reading was degraded rather than
  overwriting the history.
- **When cache pressure argues for keeping fallbacks, keep them for latency-shaped
  data and not for judgment-shaped data.** A cached parsed document is fine; a cached
  fallback rationale is not.
- **When you cannot determine the grade of an existing entry, treat it as degraded and
  recompute.** Uncertainty about an instrument resolves toward the candidate
  ([uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When an incident is declared, treat the whole window as suspect,** not just the
  requests that visibly failed. Partial degradation rarely announces itself
  per-record.

## When not to use it

- **On deterministic, model-free computation.** A cached count, a cached parse, a
  cached eligibility check derived only from stored facts has one grade; grading its
  cache is noise.
- **Where the fallback is the declared product for that tier.** If an account is
  entitled only to the deterministic reading, that reading is authoritative *for that
  entitlement* and may be cached — provided it is never compared against a full
  reading as though the instruments matched.
- **Where the cache is a within-request memo.** A value reused inside one execution
  cannot outlive its cause, which is the whole hazard. Memoise freely; persist
  carefully.
