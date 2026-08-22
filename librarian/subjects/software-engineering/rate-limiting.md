---
domain: software-engineering
subject: rate-limiting
last_touched: 2026-08-22
touched_by: research
dry_streak: 0
---

# rate-limiting

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

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

- **`usage-limit-governance` (llm-observability) is the sibling case.** It meters spend
  by dimension and has the same blind spot from the other side. Cross-bundle links are
  forbidden, so if that subject ever needs this rule it needs its own copy - check
  whether that is duplication worth paying before writing it.

## Standing debt

- **Never swept by `/librarian`.**

## Declines

None.
