---
layer: application
type: application
subject: agent-memory
technique: coverage-instrumentation
stack: bun
status: forged
verified_on: 2026-09-07
verified_against: bun@1.3.13
---

# Three instruments that certify a supersedence path which cannot run (gbrain)

The realization is the fact layer of gbrain, a markdown-backed personal memory store
with a hot tier written automatically from conversation and a cold tier of attributed
beliefs. `verified_against` names the runtime the tree witnesses: CI pins
`bun-version: 1.3.13` (`.github/workflows/e2e.yml:52`), above the `engines.bun
>=1.3.10` floor in `package.json`. Read at `2efaaf8f`, version `0.48.4.0`.

This tree is worth the application because it is unusually well instrumented — a
doctor with roughly 150 named checks whose roster is itself drift-tested — and its
hot-tier supersedence path still cannot execute, with three separate instruments
reporting healthy.

## The decision procedure with no production caller

`classifyAgainstCandidates` (`src/core/facts/classify.ts:69`) decides whether an
incoming fact is a duplicate, a supersedence, or independent. It is exported, and
`test/facts-classify.test.ts` exercises it at five call sites. A repository-wide
search for the symbol returns exactly those two files.

The mechanism by which this stayed invisible is the one the technique now names.
The module *is* imported by production code — `src/core/cycle/phases/consolidate.ts:27`
imports `cosineSimilarity` from it, the arithmetic helper that sits beside the
decision. Every check that asks whether the module is reachable answers yes: the
dependency graph is connected, the file is not orphaned, coverage over it is
non-zero, and the tests pass, because a test is a caller. Only a trace of the
exported symbol that produces the verdict finds the gap.

## The counter that certifies by reporting zero

The automatic ingestion path is the choke point for page writes, sync, imports and
the batch fact extractor. On a near-duplicate above its threshold it takes
`duplicate += 1` and `continue`s, discarding the incoming fact
(`src/core/facts/backstop.ts:637-646`) — there is no supersede branch on that route.

Downstream of it sit three `superseded += 1` sites (`:722`, `:807`, `:839`), each
following an insert that passes no supersede reference. The storage layer returns
that status only when one is present (`src/core/postgres-engine/facts.ts:65-69`) and
otherwise returns `{ id, status: 'inserted' }` (`:115-117`). The counter is therefore
structurally pinned at zero, and a reader of the pipeline's own summary sees a
supersedence feature reporting no work to do.

This is the fourth honest zero the technique describes, in its purest form: not an
empty population, not an unreadable source, but a numerator no execution can raise.

## The health check that cannot fail

The hot tier's doctor line reads
`const status: 'ok' | 'warn' = health.total_active >= 0 ? 'ok' : 'warn'`
(`src/commands/doctor.ts:3791`). `total_active` is a `COUNT`. No state of the store
fails that predicate — not zero consolidation, not an extraction pipeline that
stopped, not unbounded growth. The block goes on to print active, daily, weekly and
consolidated counts and the top entities, and grades none of them.

The surrounding comment is what makes this instructive rather than sloppy: the check
was scoped as a *display* — surfacing counters so an operator can see the pipeline's
pulse without raw SQL — and was then wired into a harness whose contract is pass or
fail. A reporting surface asked for a severity will be given the cheapest expression
that typechecks, and the cheapest expression that typechecks over a count is always
green.

## What this realization cannot do

Two limits, both of which the tree is candid about.

**Its one live automatic retirement is a side effect of clustering, so its coverage is
the clusterer's coverage.** A chronological validity chain is written inside the
consolidate phase (`src/core/cycle/phases/consolidate.ts:246-275`) and it has a real
caller. But it only reaches rows that carry an entity, sit in a bucket of at least
three, cluster with a neighbour above a similarity floor, and have a live page behind
them. Every row outside those gates is never considered by anything. Coverage of a
retirement mechanism is not "does it run" but "over what population" — and here the
population is defined by a different feature's eligibility rules.

**Decay exists and retires nothing.** `effectiveConfidence`
(`src/core/facts/decay.ts:46`) is pure by design, and its production callers use it to
sort and to render. Nothing compares it against a floor and writes an expiry, so an
event-kind fact whose effective confidence has decayed to approximately zero remains
fully eligible for recall. The module's own header names four callers; two of them do
not call it. A header comment enumerating consumers is an assertion nobody runs, and
it decays toward overstating integration — which is the same failure this technique
exists to prevent, one layer up.

The structural fact the tree did not intend to produce: it ships the *inverse* defect
deliberately and says so. Its guardrail seam has five real call sites and is
contractually forbidden from governing — `runGuardrails()` returns `void`, callers
cannot branch on a verdict, and the documentation states that enforcement will get its
own named seam rather than silently reusing this one (`docs/guardrails.md:15-21`). A
governance path with callers and no authority, sitting a directory away from a
decision procedure with authority and no callers, is the clearest available argument
that "is it wired up" and "does it govern" are two questions.
