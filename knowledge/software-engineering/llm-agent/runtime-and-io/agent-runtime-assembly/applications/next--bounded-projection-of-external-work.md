---
layer: application
type: application
subject: agent-runtime-assembly
technique: bounded-projection-of-external-work
stack: next
verified_on: 2026-09-04
verified_against: next@16.3.3
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A completion channel that is one voice: grouping, and the payload rule a tray obeyed without being told

A Next.js studio whose long work is a local Claude Opus 5 process — research
runs, follow-ups, recalibrations, minutes each — reports back through a
notification bell and an announcement channel rather than by holding a screen.
The witness for the version is `package-lock.json` (lockfileVersion 3), which
pins `next` at **16.3.3**, `react` at **19.2.8** and `typescript` at **5.9.3**;
`package.json` declares `"next": "16.3.3"` unranged, so the lock and the
manifest agree. This document tests the technique's two newest clauses — group
co-arriving completions, keyed per item; and carry the payload unless a mutable
authority owns the truth — against that path. One clause was already obeyed
without being written down. The other is violated in a way the tree's own
serial-speech channel makes measurable, and silently drops completions.

## The seam

Three files, one path:

- **`lib/jobs.tsx:448` `finish()`** — the producer. A settled job becomes a
  `JobEvent` with `id: \`e-${job.id}\``, a title, and a `detail` string. The
  event id is **derived from the job id**: per item, stable across restarts and
  across tabs, and `mergeEvents` (`lib/jobs.tsx:279`) unions by that id with
  `read` sticky. The identity half of the technique is already right here.
- **`components/ui/NotificationBell.tsx:89-99`** — the carrier. One effect,
  `for (const e of unread) announce({ key: \`event:${e.id}\`, … })` at
  **`:90`**. `unread` is **cumulative**: every unread event, re-scanned on
  every commit.
- **`lib/announcer.tsx:122` `createAnnouncerQueue`** — the channel. Speech is
  one voice, so it drains **serially**, one region mutation per `DRAIN_MS =
  1400`, and sheds the oldest polite message beyond `MAX_QUEUE = 8`.

That last line is what prices the reader. Under per-item delivery, N
completions arriving together cost N utterances at 1400ms apart — and beyond
eight, cost some of them entirely.

## Mode, and why not `code`

`experiment`. The change is small enough to be a `code` arm — the diff is one
added entry point in `announcer.tsx` and a four-line rewrite of the bell's
effect — but two things rule it out. I may not modify a project's source here,
and, more decisively, **the project's own gate could not see the difference if
I did**: `tests/golden-path/announcement.probe.spec.ts` says so in its own
header — "The bell's own announce-on-transition effects need a DOM and are not
covered here either; what IS covered is the copy they hand over." A `code` arm
whose effect is invisible to the gate is a `simulation` wearing a diff. So the
policy was driven directly, as the probe drives it.

## The instrument, and its two assertions

`createAnnouncerQueue` was extracted out of the React provider precisely so it
could be driven headless — the file says so — and the probe drives it with a
recording sink and a fake clock. The harness here is a verbatim transcription
of that function into `.mjs` (types stripped, `MAX_QUEUE = 8` and
`DRAIN_MS = 1400` inlined from `lib/announcer.tsx:53,58`), plus one added
`announceGroup` for arm B.

**Rebuild recipe**, because the harness lived in a scratch directory and the
mutant certification is the reason the numbers below can be trusted. Three
files, no dependencies, `node` only:

1. `policy.mjs` — copy `createAnnouncerQueue` from `lib/announcer.tsx:122`
   verbatim, drop the TypeScript annotations, inline the two constants, change
   nothing else. Add `createGroupingQueue`: the same body with the
   unshift/push + `MAX_QUEUE` shed + `if (!draining)` tail lifted into a local
   `enqueue(item)`, and the `announceGroup` shown under *The diff* below.
2. `certify.mjs` — a `harnessOver(factory)` that builds a queue over a
   recording sink (`polite`/`assertive` push into a `writes` array) and a fake
   clock (`schedule` stores the callback, `tick()` runs it), exactly as the
   project's probe does at `tests/golden-path/announcement.probe.spec.ts`, at
   `drainMs = 1000`. Turn each of that file's seven `test(...)` bodies into a
   boolean predicate, then run all seven against three subjects: the faithful
   transcription and the two mutants described below. Print the 7×3 grid.
3. `ab.mjs` — the three arms, the four scenarios, and a `coverage(utterances,
   events)` counter. **Count items, not strings:** two successful research runs
   produce byte-identical sentences (see the identity finding below), so tag
   each event's detail with its own id in the measurement inputs or the counter
   will report phantom repeat deliveries.

**Known positive:** the seven policy properties the project's own probe asserts
— serial drain, clear-before-write, dedupe by event key, assertive jumps
without erasing, storm sheds the oldest polite, empty is not an utterance, stop
ends the drain — were replayed against the transcription. 7/7 PASS.

**Known negative:** two mutants of the same function, each breaking one thing.
Mutant-1 (the `spoken.has(key)` guard deleted) fails **dedupe only**, 1/7 FAIL.
Mutant-2 (the queue deleted, every announce writes the region at once) fails
**serial-drain, assertive-jump, storm-shed and stop**, 4/7 FAIL, and passes
clear-before-write and empty-is-not-an-utterance — which is correct, those two
do not depend on the queue. The instrument discriminates in both directions
before any number below was read.

## A, B, and the trap arm C

- **A** — shipped. `announce` per unread event, key `event:<id>`.
- **B** — the technique. One delivery run per commit over the unread items whose
  keys are unclaimed; claim exactly those; enqueue **one** utterance carrying no
  key of its own.
- **C** — the defect the technique names, written the way it would be written by
  someone who added batching without touching the key: one grouped announcement
  keyed `batch:<sorted ids joined>`.

Inputs are the tree's real copy, from the real `settle()` call sites, and the
tree's real arrival shapes. Fake clock at the file's own 1400ms.

### Mid-state, printed at every step

S2, ten unread events restored by `readStore()` on a page load and handed to the
bell's effect in **one commit** (a fresh load has an empty `spoken` set, so every
one of them is news):

| step | A: spoken / queue | B: spoken / queue |
| --- | --- | --- |
| commit | 1 / 8 | 1 / 0 |
| tick 1 | 2 / 7 | 1 / 0 |
| tick 2 | 3 / 6 | — |
| tick 3 | 4 / 5 | — |
| tick 4 | 5 / 4 | — |
| tick 5 | 6 / 3 | — |
| tick 6 | 7 / 2 | — |
| tick 7 | 8 / 1 | — |
| tick 8 | 9 / 0 | — |

Arm A's queue peaks at 8 on the commit itself and never holds the tenth event
at all: the eleventh `announce` overflows `MAX_QUEUE` and sheds the oldest
polite entry, so `e-j-2`'s completion is claimed in `spoken` and then never
voiced. The endpoints alone would have shown "9 utterances vs 1"; the middle
column is where the lost completion is visible.

### Results (2026-09-04, n=1 tree, 4 scenarios, fake clock at DRAIN_MS=1400)

| scenario | arm | utterances | time-to-last | items delivered | never spoken | repeat deliveries |
| --- | --- | --- | --- | --- | --- | --- |
| S1 three parallel research runs, one commit | A | 3 | 2800ms | 3/3 | 0 | 0 |
| | B | **1** | **0ms** | 3/3 | 0 | 0 |
| | C | 1 | 0ms | 3/3 | 0 | 0 |
| S2 rehydration, 10 unread, one commit | A | 9 | 11200ms | 9/10 | **1** | 0 |
| | B | **1** | **0ms** | **10/10** | **0** | 0 |
| S2 rehydration, 12 unread, one commit | A | 9 | 11200ms | 9/12 | **3** | 0 |
| | B | **1** | **0ms** | **12/12** | **0** | 0 |
| S3 staggered, four cumulative commits | A | 4 | 4200ms | 4/4 | 0 | 0 |
| | B | 4 | 4200ms | 4/4 | 0 | 0 |
| | C | 4 | 4200ms | 4/4 | 0 | **6** |
| S4 same arrivals, 1200ms collection window | A | 4 | 4200ms | 4/4 | 0 | 0 |
| | B | **2** | 1400ms (**2600ms** incl. window) | 4/4 | 0 | 0 |

Three readings, and the second is the one that must not be lost.

**Grouping is better where the arrivals co-arrive.** S1 and S2 are one commit
each, which is not a modelling convenience — it is how this tree actually
delivers: `readStore()` restores up to 50 persisted events and the effect runs
once over all the unread ones. 9 utterances become 1, 11.2s of serial speech
becomes 0, and 1 of 10 (3 of 12) completions that the shipped arm **never
speaks at all** are recovered.

**Grouping is not-better where the arrivals are merely near.** S3 stages four
completions in four separate commits, and arm B ties arm A exactly — same 4
utterances, same 4200ms. Grouping over "what is in this commit" groups nothing
when each commit holds one new item. S4 adds the half of the rule S3 omits — a
bounded collection window, with a lone completion flushed at once — and B
separates again, 4 → 2, and 4200ms → 2600ms **with the window's own 1200ms
latency charged against it**. The mechanism is the window plus the grouping;
the grouping alone is a tie.

**The set-key is a live defect here, not a hypothetical.** Arm C is
indistinguishable from B in S1, S2 and S4 and produces **6 repeat deliveries**
in S3. The reason is specific to this tree: the bell's effect reads `unread`,
which is *cumulative*, so consecutive commits hand overlapping sets, and a key
derived from the set is a different key every time an item is added — `batch:e1`,
then `batch:e1|e2`, then `batch:e1|e2|e3`. Every already-spoken sentence is
spoken again. Arm B, keyed per item, scores 0 on the same input. The technique's
warning that a set key "derives identity from delivery-time timing" is here
sharper: it derives identity from *how much has not yet been read*.

## The structural fact: enumerate the callers of the optional half

`settle(jobId, outcome, detail)` makes the payload mandatory in the signature
and optional in fact — `detail` is a free string, and the caller decides whether
it is the result or a pointer at one. Every non-test caller in the tree:

There are **seven non-test call sites** in the tree, and they produce **eight
branches**, because `FollowUpQueue.tsx:157` is one `settle(` call whose third
argument is a ternary with two distinct details. The count below is over
branches; the call-site column says which is which.

| call site (repo-relative) | branch | `detail` | carries the result? |
| --- | --- | --- | --- |
| `app/_phases/research/guided/useEducationalResearch.ts:71` | research done | "A notebook is ready for review." | no — pointer |
| `app/_phases/research/guided/useEducationalResearch.ts:75` | no-tension | "No tension in this topic — the run finished and says why. There is no notebook." | the verdict, not the reasons |
| `app/_phases/research/guided/useEducationalResearch.ts:77` | research failed | `final.error` | **yes** |
| `app/_phases/script/useVersions.ts:215` | recalibrate, response not ok | `Simulated instead — ${why}`, `why = detail \|\| "The model could not be reached."` | **yes** |
| `app/_phases/script/useVersions.ts:227` | recalibrate done | "A recalibrated set of scripts is staged — compare it, then accept or run again." | no — pointer |
| `app/_phases/script/useVersions.ts:236` | recalibrate, request threw | `Simulated instead — ${why}`, `why = "The recalibration request failed. Nothing was changed."` | **yes** |
| `app/_phases/research/_parts/FollowUpQueue.tsx:157` (ternary, arm 1) | all answered | "Results are staged against the notebook — nothing applied yet." | no — pointer |
| `app/_phases/research/_parts/FollowUpQueue.tsx:157` (ternary, arm 2) | partial | `${answered} of ${dispatched.length} came back…` | **yes** |

`useVersions.ts:215` and `:236` are the pair worth pausing on, because they are
the only branches that do both at once: each stages a simulated candidate — a
mutable store the reader must go and read — *and* carries a payload. There is no
contradiction, because the payload is not the scripts. It is the reason the run
degraded, which exists nowhere but in that string; the scripts are pointed at,
exactly as `:227` points at them. The discriminator is applied per *fact*, not
per notification, and these two are the tree's demonstration of it.

The split is exact and nobody wrote it down: **every branch that carries a
payload is one where the payload exists nowhere else** — an error string, a
degradation reason, a count of what came back — and **every branch that
withholds one points at a store that owns the result**. Apply the technique's
test question to each pointer: told only that something happened, would the
reader have to go somewhere else? Yes — and the somewhere else can move.
`jobs.tsx`'s own header says why the notebook is a mutable authority: "A
follow-up mutates the notebook it was launched from; two in flight would race to
revise the same document." A staged script set is replaced by the next
recalibration; staged follow-up results change when applied. **All 8 branches,
across all 7 call sites, match the discriminator — no exceptions found.** The
tree is a clean corroboration of the payload rule, arrived at independently, and
the rule's value here is that it explains a split that looked like copywriting.

A second, independent sighting of the per-item half sits in a sibling tree:
`pumper`'s `crates/server/src/triggers.rs:591` reasons its way to the same rule
from the other end — "a key that omits the dataset makes every hop after the
first look like a redelivery of the first — so exactly one arbitrary
(HashMap-ordered) dataset ever fired." Same law, different failure mode.

## What did not survive contact: the announcement drops the identity

One finding the technique did not ask for and the measurement produced anyway.
The bell's spoken text is `${e.title}. ${e.detail}` — and for three parallel
research runs, two of which succeed, that yields **2 distinct sentences from 3
completions**, because "Research returned. A notebook is ready for review." is
byte-identical for run 1 and run 3. The visual card beside it renders
`eventLabel(e.jobId, jobs)` — the topic the user typed — and the announcement
does not. A screen-reader user hears which *kind* of work finished and never
which *work*. This is the payload rule again at a finer grain: the signal
carries the outcome but drops the one field that says whose. Grouping makes it
worse before it makes it better — one utterance saying "3 runs finished" with
three indistinguishable sentences in it is less usable than three — so the
grouped render must carry each item's label. That is a condition on arm B, not
a reason against it, and it is stated here so a director applying the diff adds
the label rather than discovering the collision in production.

## The diff, for the director

`lib/announcer.tsx` — add beside `announce` in `createAnnouncerQueue`:

```js
/** One delivery run over individually-keyed items. Selects the items whose
 *  keys are UNCLAIMED, claims exactly those, and enqueues ONE utterance that
 *  carries no key of its own: the grouping is transport, the item key is the
 *  identity. A crash between selection and enqueue leaves every member
 *  unclaimed and regroups them next commit, beside different neighbours,
 *  which is harmless precisely because the grouping carries no identity. */
announceGroup(items, assertive = false) {
  if (stopped) return;
  const fresh = items.filter((i) => i.text && !spoken.has(i.key));
  if (fresh.length === 0) return;
  for (const i of fresh) spoken.add(i.key);
  const text = fresh.length === 1
    ? fresh[0].text
    : `${fresh.length} runs finished. ` + fresh.map((f) => f.text).join(" ");
  enqueue({ key: undefined, text, assertive });
},
```

(with the shared tail of `announce` — unshift/push, the `MAX_QUEUE` shed, the
`if (!draining)` kick — lifted into a local `enqueue(item)` that both call.
`AnnouncerApi`, `AnnouncerQueue` and `useAnnounce()`'s no-op fallback each gain
the same member; the fallback must stay a silent no-op, since a missing
announcer takes down no surface today and must not start.)

`components/ui/NotificationBell.tsx` — replace the per-event loop:

```diff
-  useEffect(() => {
-    for (const e of unread) {
-      announce({
-        key: `event:${e.id}`,
-        text: `${e.title}. ${e.detail}`,
-        assertive: politenessFor(e.ok ? "ok" : "failure"),
-      });
-    }
-  }, [unread, announce]);
+  useEffect(() => {
+    // Completions that arrive together are delivered together — one utterance,
+    // keys claimed PER EVENT. `unread` is cumulative, so a key over the set
+    // would change every time an item is added and re-speak everything already
+    // said. Each item carries its own label: two successful research runs
+    // otherwise produce byte-identical sentences.
+    const ok = unread.filter((e) => e.ok);
+    const bad = unread.filter((e) => !e.ok);
+    const item = (e) => ({
+      key: `event:${e.id}`,
+      text: `${e.title}. ${e.detail} (${eventLabel(e.jobId, jobs)})`,
+    });
+    announceGroup(ok.map(item), politenessFor("ok"));
+    announceGroup(bad.map(item), politenessFor("failure"));
+  }, [unread, jobs, announceGroup]);
```

The `ok`/`bad` split is required, not cosmetic: politeness is a property of the
utterance, and a group is one utterance. Two groups, not one, is the honest
shape. The bounded collection window that S4 measures is a further change and is
**not** in this diff — it needs a timer in the bell keyed on `running.length > 0`
("hold while other work is still in flight; flush at once when nothing else is
coming"), and it should land on its own.

## What this realization cannot do

It cannot claim a token or model-turn saving. The reader on this path is a
**human on a serial speech channel**, not a model reading a transcript, so the
technique's headline argument — that grouping removes model calls that were each
re-reading the whole conversation — does not transfer, and no number here should
be read as evidence for it. What transfers is the *wake* term: every delivery
interrupts the reader, and this channel makes that cost literal at 1400ms and
countable at `MAX_QUEUE`. Whether the same grouping pays in model turns is a
claim for a tree whose delivery target is a run.

It cannot certify arm B against a browser. The harness drives the announcement
*policy*, which is exactly what the project's own probe drives and exactly what
the project's own probe says is the limit — the bell's effect needs a DOM. The
commit shapes fed to it (one commit for a rehydration burst, cumulative `unread`
for staggered arrivals) are read off the source, not observed in React.

It cannot say the collection window is worth 1200ms. S4 charges the window
honestly and B still wins, but 1200ms is a chosen number, not a measured one; a
window long enough to catch two research runs and short enough not to feel
abandoned is a judgement this document did not make.

And it says nothing about the eight payload call sites beyond that they match.
A rule that a tree already obeys is corroborated by that tree, not tested by it.
The falsifying case — a completed, immutable result whose producer holds it and
still sends a pointer — was searched for across twelve project trees and not
found.
