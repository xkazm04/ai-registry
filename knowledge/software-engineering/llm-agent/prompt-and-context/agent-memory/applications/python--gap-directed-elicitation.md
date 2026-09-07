---
layer: application
type: application
subject: agent-memory
technique: gap-directed-elicitation
stack: python
status: forged
verified_on: 2026-09-07
verified_against: python@3.12
proof: ab-paired
---

# A year-replay harness whose every fact is also an event, and the class it therefore cannot score

The realization is the world generator of a simulated-year memory benchmark: one
principal, a year of activity, five projects, and a ladder of memory designs replayed
against the same stream and scored by the same judge. The tree carries no interpreter
pin — no `requires-python`, no CI setup step, no lockfile — so the version above is the
witness that actually ran the generator during this run (3.12.1), not a version the
repository asserts.

It is a good harness, and the finding is not a defect in it. It is a boundary that
becomes visible only when you ask what the scenario is made of.

## Every fact is born as an event

The generator's shape is uniform across all seven of its construction passes: a fact is
minted and immediately spoken.

```python
f = self._new_fact(scope=p, key=key, value=rng.choice(pool), valid_from=day)
self._emit(day, "say", p, self._say("new", p, key, f.value), [f.id])
```

Project facts, user facts, preferences, taught rules, procedures, updates, expiries —
every one is `_new_fact(...)` followed by `_emit(...)`. There is no pass that creates a
fact without speaking it, and no check anywhere in the harness asserts the invariant,
because nothing has ever violated it.

The module docstring names the property as a virtue, and it is one:

> Probes are derived from the world, never from observed queries, so the fixture set
> cannot feed on itself.

Deriving probes from the world rather than from observed traffic is exactly right — it
is what stops a benchmark grading a store on the questions the store taught it to ask.
The consequence, though, runs further than the sentence claims. Because every fact is
also an event, **every probe asks about knowledge the store was told**, and the scenario
cannot express a question whose answer was never transacted.

## What that costs the ladder

Nine designs have rows here, from a no-memory floor to retrieval over the raw record.
They differ in what they store, what they distill, what they retire, and what they can
reach at read time. They do not differ in **how knowledge enters**: every one of them
acquires by capture, because the scenario offers nothing else to acquire from.

So no arm can lose a point for lacking an acquisition path, and the ladder's ceiling is
a ceiling on *witnessed* knowledge — sound as measured, and narrower than the word
"memory" suggests when the number is cited. This is the negative structural fact the
tree could not have been built to demonstrate and demonstrates anyway: the harness's own
most careful design decision, taken for an unrelated and correct reason, is what makes
the acquisition gap invisible to every design it ranks.

The nearest existing class makes the shape precise. The generator already emits eight
`distractor` probes — a key **never stated and not true**, graded `UNKNOWN`, so a store
is right to disclaim it and a store that invents an answer is penalized. That class
tests restraint, and it is the exact inverse of what is missing. Nothing tested a key
**never stated and true**, where `UNKNOWN` is the wrong answer.

## The instrument, and the paired check that it changes nothing else

A `held-out` fact class was added: facts true of the principal — the quarter's goal, the
constraint being worked under, the alternative that was rejected and why, the reason a
convention exists — minted with `_new_fact` and never emitted. These are the classes
that generate no event by nature; nobody transacts them, they are simply the case.

The change had to be provably inert when off, because nine published rows depend on the
scenario being the same scenario. Two design decisions carry that, and both are the kind
that are easy to get wrong by writing the obvious code:

- **A separate RNG.** Held-out generation draws from `random.Random(seed ^ ...)`, never
  from the main stream. Inserting a single `rng.choice` into the main sequence would
  have shifted every subsequent draw and silently produced a different world under the
  same seed — the same numbers, quietly measuring something else.
- **Appended last.** Facts and probes are minted after all other generation, so no
  existing `f0001`-style id shifts. Creating them where they belong logically — beside
  the other user facts — would have renumbered everything downstream.

Both arms were then generated at seed 7 and compared field by field against the
generator at the previous commit:

| | facts | events | probes | classes |
| --- | --- | --- | --- | --- |
| `held_out=0` | 176 | 3,571 | 194 | 10 |
| baseline (previous commit) | 176 | 3,571 | 194 | 10 |
| `held_out=8` | 184 | 3,571 | 202 | 11 |

Arm A is identical to the baseline on all three lists. Arm B adds eight facts and eight
probes, leaves the event list byte-identical, and leaves every non-held-out probe
identical. The predicate that carries the count: **0 of 8 held-out facts are referenced
by any event.** The class is unwitnessed by construction and by measurement.

## What this application does not show

No arm has been scored on the class. That takes a paid run — consumer and judge over 202
probes — and until it happens the technique's central claim is instrumented, not
measured. The prediction is recorded before the measurement rather than after, because a
prediction nobody wrote down cannot be wrong: every current arm should score at or near
zero on `held-out`, including the leader, since none has a way to acquire a fact nobody
said.

The first check on that run is not the score. It is whether the class **leaks** — whether
a held-out answer is inferable from the surrounding events a capture-only store did see.
A capture-only arm scoring well would mean the pool is guessable from context, not that
acquisition is solved, and reading it the other way would turn this instrument into the
kind of flattering measurement the subject's coverage technique exists to refuse.

One limit is structural and worth stating plainly: the class defaults to off. That is
what keeps the nine existing rows comparable, and it means the gap stays invisible unless
somebody asks for it — the failure the class was built to expose, preserved as the
default. A harness cannot resolve that; only a run can.
