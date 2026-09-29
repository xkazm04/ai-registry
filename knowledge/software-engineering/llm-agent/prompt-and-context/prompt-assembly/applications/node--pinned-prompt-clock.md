---
layer: application
type: application
subject: prompt-assembly
technique: pinned-prompt-clock
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A date pinned per session, a notice at the tail, and a probe that cannot refresh (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. This tree implements
the technique in full, and the comments above the code state its forces plainly, which
makes it a reference realization rather than a defect report. The code and its test were
read; neither was executed (the test needs the tree's dependencies, which were not
installed).

## The three parts, where they live

**Freeze, refresh only at a checkpoint.** The comment is the rule:
`src/context/DefaultContextRuntime.ts:181 "Only a new full-compaction checkpoint refreshes the system date."`
and the next sentence says why the lighter operation does not: "Cache resets also cover
micro-pruning and must not invalidate the system prefix." The stored timestamp is a
per-session field, read on first assembly and reused.

**A probe cannot refresh.** `src/context/DefaultContextRuntime.ts:192 "const refreshTime = !input.previewOnly && newCheckpoint;"`
— a budget assembly that only counts is a `previewOnly` call, so it observes a checkpoint
and consumes nothing, and the real request that follows is the one that refreshes.

**The change arrives at the tail, at a fixed position.** A rollover appends a
`<date-update>` message
(`src/context/DefaultContextRuntime.ts:211 "`<date-update>\ncurrent_date: ${currentDate} (UTC)\n` +"`)
that stays where it arrived so later requests extend the same prefix; when pruning
rewrites earlier messages, notices inside the unchanged prefix are kept and later ones are
replaced with the current date at the new tail, per the comment block above it.

## The test asserts the technique's property

`tests/context/cache-runtime.spec.ts:108 "session prompt date survives midnight, retries, and normal appends"`
fixes the clock at 23:59:59, crosses midnight, and asserts the system prompt is
byte-identical, exactly one date notice exists, the earlier messages are a prefix of the
later ones, a retry adds nothing, an ordinary appended turn keeps the system text, and a
**second session** created after midnight carries the new date. That is the technique's
test list nearly item for item.

## The boundary the tree found the hard way

A tail notice is a user-role message, so it became "the last user message" for a
consumer that classifies turns. The router's judge classified the date notice as the
task, and a test now pins the repair
(`tests/router/tokenSaver.spec.ts:9 "classifies the real task after context appends a midnight date update"`);
the notice carries a synthetic marker and a purpose so readers skip it
(`src/router/tokenSaver/extractLastUserMessage.ts:11 "if (message.metadata?.synthetic === true && message.metadata?.purpose === "date_update") {"`).
That is the boundary bullet in the technique, learned from a routing error on the first
request after midnight.

## What this realization does not do

The date has a day granularity and a UTC zone. A user in a zone far from UTC crosses
their local midnight at a different hour from the notice, so "today" in the prompt can
disagree with the user's calendar for up to half a day; the tree states the zone in the
notice ("UTC") and does not go further. Not checked: whether the provider actually
returned cache reads across the crossing on real traffic; the test asserts the property
the provider's cache reads, not the cache's behaviour.
