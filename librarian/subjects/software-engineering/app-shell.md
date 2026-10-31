---
domain: software-engineering
subject: app-shell
last_touched: 2026-09-23
touched_by: deepen
dry_streak: 0
---

# app-shell

First touch: [[2026-08-30-1]], scoped `/deepen` under the librarian sweep, then a
follow-up round once the Director unblocked the `spec` stack. Ranked #8 (37 points) on
the corrected worklist; it had read 61 under the double-counted demand. Applications
2 → 8, technique coverage 2/6 → 5/6 (`entitlement-gating` still has none).

## The transplant defect, which is why single-stack is a scored clause

**"The shell never unmounts" was one implementation, not the property.** The real
property is *frame continuity*, and never unmounting is one way to buy it. Where each
navigation replaces the document, the frame unmounts every time and the platform
supplies continuity instead.

Most of the standard survives that — the nav is still one owned vocabulary, badges still
need clearing rules, depth is still earned. **The hosting privilege does not**: with no
surviving mount point, session-lifetime machinery has to live outside the frame
entirely. The golden path now says to establish which architecture you are in before
inheriting the hosting rules, because they were conditional on the first property being
literally true and never said so.

This is exactly the defect the single-stack clause exists to catch: upper layers
encoding a stack-specific assumption as a universal. It took a second stack to surface
it, and no amount of re-reading would have.

## Two rounds, two kinds of second origin

**Round 1 — a second framework (`next`).** Five applications against a real tree at
`next@16`. The worker was straight that this is a second stack by the bundle's declared
list but **not a second paradigm** — still a JS component tree. It still produced three
corrections, which is the evidence the upper layers were framework-shaped in places.

**Round 2 — a second *origin* (`spec`).** Two public standards, which found what a
second framework could not. Recorded below.

## Six corrections

- A name reveal is only a reveal if it fires on **keyboard focus**, holds while the
  pointer travels onto it, persists, and dismisses without moving pointer or focus. The
  platform's built-in hover text satisfies none and never fires for keyboard users — it
  delivers a name and no reveal, and both are owed.
- Posture that reacts to navigation derives from **the location value changing**, not
  from per-entry handlers; wired per door it covers one door and misses the badge, the
  palette and the chord.
- **A count is data and a badge is a disclosure** — the viewer gate belongs on the row,
  not only at the source, and suppression is total including the reserved gutter.
- For an address arriving into an **established** session, doing nothing beats falling
  back: bouncing destroys a real location to service an unreal one. Pick per arrival
  class.
- The enumerable host must sit **above the swap point**; a host re-keyed per location is
  a silent teardown instruction, not a permanent frame.
- The placeholder rule was too prescriptive: the section's shape **or nothing at all**. A
  generic silhouette matching no section is a second wrong outline in front of the right
  one. The consuming tree had shipped the old prescription, measured the two-skeleton
  flicker, and deleted it with the reasoning in the file.

## What the standards found (round 2)

**Two real gaps in our upper layers:**

- **SC 2.4.5 Multiple Ways (AA) requires a second route to a destination, and
  nav-hierarchy never says so.** The depth budget was written as space economics and
  never paid its findability debt: past two levels a nav-only product is non-conforming
  at AA unless a search or site map exists. The command surface `shell-hosted-services`
  treats as a convenience is, at depth, a conformance requirement. The most actionable
  finding of the round.
- **SC 1.4.10 Reflow (AA) inverts our framing of the width floor.** We call automatic
  collapse below a floor "legitimate"; at 320 CSS pixels it is not a concession the
  product may make, it is one it must.
- Still unnamed by the technique: **SC 2.5.3 is vacuous while an entry is icon-only and
  becomes binding the moment the posture expands**, so a rail whose collapsed tooltip and
  expanded label come from different sources conforms in one posture and fails in the
  other — invisibly to any single-posture test.

**Where we are stricter, argued rather than asserted:** prohibition 1 beats SC 3.2.3 on
three axes — the criterion governs *order*, not presence; its "user-initiated" exception
would permit a collapse toggle to reorder the rail, which we forbid because *a map whose
order changes with its zoom is two maps*; and its "set of web pages" scope arguably
excludes a shell that never replaces the document, while ours binds regardless. Our
reduced-motion clause sits at baseline where the standards put it at AAA, and asks for
more (endpoints correct with motion off, not merely disableable). ARIA's one-active rule
is a SHOULD; `navigation-model` makes it a structural invariant enforced by derivation.

**The restraint is why the document is trustworthy.** Two of the six prohibitions have no
counterpart in either standard, and rather than manufacturing one it records that they
stand on this corpus's own evidence and *must not be dressed up as accessibility
claims*. It separates the skip link (a chosen mechanism) from SC 2.4.1's required
outcome, and flags that "navigation moves focus" is **craft, not conformance**.

## Declines

- **No new technique in either round.** Both converged findings were correction-sized,
  and with two applications on the books an application was worth more. Recorded so the
  next run does not read this as unexamined.
- **No `verified_against` on the spec application**, deliberately, and the file says why:
  a Recommendation date is not a runtime version, and forcing it into `<stack>@<major>`
  would produce a currency check that means nothing. `refresh_by` at a six-month
  standards window instead.
- Dry probes: the placeholder delay (published guidance brackets our hedged range), the
  third shell level (the apparent counterexample is selection state, already excluded by
  the technique's own test), and **a search for a non-JS shell tree anywhere in the local
  fleet — there is none**. That last one is why `spec` was the right second origin here.

## Open leads

- `entitlement-gating` is the one technique still with no application.
- **Cross-subject:** a modal/overlay subject owns "mounting on open is what fits a
  mount-lifecycle hook to a persistent element".
- **Cross-subject, possibly law-adjacent:** the deliberate *omission* from a redirect
  table — renamed ids map forward, **removed** ids fall through, because pointing a
  removed feature at a neighbour reads as a bug. Generalizes past navigation to any
  identity-migration table; may sit under `identity-survives-reuse`.
- One unplanned convergence worth keeping: SC 2.4.5's exception carves out "a step in a
  process" using the same word our sub-nav admission test uses to reject a setup
  destination — two documents written for unrelated reasons drawing the same place/step
  line.

## 2026-09-23 - `/deepen` batch ([[2026-09-23-2]])

Chosen on the only fresh verdicts outside the companion subjects: 2 in kp that opened
"architecture check first: a single-mount client-state shell". Read in full, they
confirmed the subject's fit rather than disputing it - but the question was worth asking.
The subject had one hidden fork: a frame that never unmounts can hold its location **in the
address or in its own state**, and three obligations depend on which (Back, what a switch
announces, warm return), because the framework's machinery for each fires on address
changes. Written in.

**No new technique; corrections.** The back gesture **belongs to whoever draws it** (a
browser tab feeds the browser's history, possibly with the location in entry state; no
chrome means the shell owns an engine; some mobile platforms say Back never moves between
top-level destinations). Keep-alive is an **optimization over restore, bounded**, with
named resets. Route announcers speak only on router navigations. One application claim was
wrong at its first read (a key was said to scope an error boundary; it only replays an
entrance).

**Apply (two rows, [[applied]]):** both `better`, both returning a correction. The Back row
ran the installed router's own restore reducer: a same-URL entry costs no server request,
but every null-state replace erases the recorded location, so an entry-state location
survives only writers that carry it forward (written in). The keep-alive row caught the
technique's lifecycle bullet backwards for the suspend-effects primitive: mount-keyed
effects re-run on every reveal and unmount cleanups fire on every hide, so a voice call's
teardown would fire on a mere hide (corrected).

### Impact (registry map, regenerated 2026-09-23 after this landing)

kp: 2 stale `deviation`; personas: 1 stale `deviation` (still valid on substance).

### Leads

- A companion sub-nav comment in the project's sidebar data conflicts with nav-hierarchy's
  L3 rule. Return: when the companion area is no longer under another session's work.
- `next--shell-hosted-services` anchors have drifted. Return: next touch of that application.

### 2026-09-23 - `/conform --stale` on personas (shared-chrome re-judged)

Still `deviation`: eleven hand-maintained sub-nav vocabularies, inline gate checks in the
rail beside a single gate authority, Level 2 lost when collapsed. Proposals from the judge,
unplaced: `nav-hierarchy` should count depth in *destinations*, not panes (a grouped-row
rewrite of a third pane is still a third level when the group header is also a
destination); `entitlement-gating` should say a re-implemented predicate over the same data
is a second policy authority. **Coverage:** `lazy-section-loading` has no home in the shell
chrome context - it belongs with the section router's context.

## Architecture review - 2026-10-31

First architecture review, against `a2ac51c1c`. All 17 documents read in full. The
standards findings recorded under round 2 above never reached `nav-hierarchy`: it
still calls the width floor "legitimate" and says nothing about a second route past
two levels or about one name string across postures. Two applications contradict
siblings or themselves: `next--shell-hosted-services` still gives error scoping as a
reason for the per-destination key, which `next--lazy-section-loading` corrected on
2026-09-23, and `next--navigation-model` calls two questions "untested" that its own
2026-09-23 experiment answered. `screen-contributed-second-level` assumes the
keep-alive primitive suspends effects, which `lazy-section-loading` says depends on
the primitive. The mobile Back claim in `navigation-model` could not be matched to
platform guidance text this run: Android's multiple-back-stack guide pops tab
switches to the start destination, which is one top-level move before leaving.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/app-shell",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:b55c5172e3d9fac0",
  "disposition": "clarify",
  "coverage": "All 17 documents read in full. Primary sources opened this run: WCAG 2.2 (five success criteria), the Next.js preserving-UI-state guide, the Next.js accessibility page, React's Activity reference, Android's multiple-back-stacks guide. The two react applications' consuming tree was spot-checked: files exist and substance holds, line anchors have drifted. No private next tree, no afterlife checkout, no runtime was re-run. No verification date refreshed.",
  "counterexamples": [
    "A shell where the frame is replaced per document (multi-page app) has no surviving mount point; the hosting rules do not transfer and session machinery must live in a worker or shared store.",
    "A keep-alive primitive that keeps effects running never unregisters a hidden screen's sections by itself, so the sidebar shows a screen nobody is looking at.",
    "Next.js's route announcer falls back to the first h1 and then the pathname when document.title is absent, so an unchanged title is not the same as nothing to say on a router navigation.",
    "On Android with the Navigation component's multiple back stacks, Back from a non-start tab goes to the start destination before leaving, which is a move between top-level destinations.",
    "A nav-only product at three levels of real structure is non-conforming at WCAG 2.2 AA (SC 2.4.5) even when the depth budget is obeyed, unless a search, site map or palette exists."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/WCAG22/",
      "result": "Re-read. SC 2.4.5 (AA) 'More than one way is available to locate a web page within a set of web pages except where the web page is the result of, or a step in, a process.' SC 1.4.10 (AA) 'without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels'. SC 2.5.3 (A) 'the name contains the text that is presented visually.' SC 2.4.1 (A) 'A mechanism is available to bypass blocks of content'. SC 1.4.13 (AA) Dismissible, Hoverable, Persistent. Confirms the spec application's quotes and the three nav-hierarchy gaps."
    },
    {
      "url": "https://nextjs.org/docs/app/guides/preserving-ui-state",
      "result": "lastUpdated 2026-10-15. 'Next.js preserves up to 3 routes. Beyond that, the oldest route is evicted and will re-render fresh.' Pages are hidden with Activity under cacheComponents. Confirms the next lazy-section-loading application's quote; the docs date it cites is older but the sentence is unchanged."
    },
    {
      "url": "https://react.dev/reference/react/Activity",
      "result": "Hidden: 'all its children's Effects are cleaned up'; visible again: 're-create their Effects'; DOM kept with display none. Confirms lazy-section-loading's suspend-effects bullet and the afterlife application; shows screen-contributed-second-level's 'has its effects cleaned up' is primitive-specific."
    },
    {
      "url": "https://nextjs.org/docs/architecture/accessibility",
      "result": "'The Next.js route announcer looks for the page name to announce by first inspecting document.title, then the <h1> element, and finally the URL pathname.' The golden path's 'speak the document title' omits the fallbacks."
    },
    {
      "url": "https://developer.android.com/guide/navigation/backstack/multi-back-stacks",
      "result": "Per-tab state is saved and restored; the documented tab switch pops up to the start destination with saveState. Does not state that Back never moves between top-level destinations; the technique's mobile bullet needs a quotable platform source."
    }
  ],
  "documents": {
    "app-shell.md": {
      "disposition": "clarify",
      "reason": "Sound and architecture-aware. Three precision fixes: the route-announcer sentence should name the h1 and pathname fallbacks; the skip link should read as one mechanism for SC 2.4.1's required bypass outcome; 'navigation moves focus' should be labelled craft, not a conformance requirement (the spec application's own finding)."
    },
    "techniques/navigation-model.md": {
      "disposition": "clarify",
      "reason": "(1) The next application records that renamed ids map forward while removed ids fall through and must never point at a neighbour; prohibition 6 treats them as one fallback. Add the distinction. (2) The mobile Back bullet ('some platforms' guidance says outright...') has no quotable source this run; Android's multiple back stacks return to the start destination first. Owed: a platform guidance quote, or soften."
    },
    "techniques/nav-hierarchy.md": {
      "disposition": "clarify",
      "reason": "The 2026-08-30 standards round was never written in: past two levels a second route is required (SC 2.4.5 AA); the width floor at 320 CSS px is an obligation, not a concession (SC 1.4.10 AA); both postures draw the entry's name from one string (SC 2.5.3 switches on when labels appear). The conform proposal to count depth in destinations, not panes, stays unplaced."
    },
    "techniques/entitlement-gating.md": {
      "disposition": "keep",
      "reason": "Single authority, hidden/locked/enabled by knowledge, mid-session revocation and the trust boundary are coherent. The conform proposal (a re-implemented predicate is a second authority) is already covered by the hand-copied-constant sentence. Still no application."
    },
    "techniques/badge-and-attention.md": {
      "disposition": "keep",
      "reason": "Predicate, derivation, clearing by kind, routing and the disclosure gate are consistent with the next application that sourced prohibition 7."
    },
    "techniques/shell-hosted-services.md": {
      "disposition": "keep",
      "reason": "Admission test, above-the-swap-point rule, declared order, reapers per ending class and visible worker death are coherent."
    },
    "techniques/lazy-section-loading.md": {
      "disposition": "keep",
      "reason": "Placeholder contract (shape or nothing), delay, prefetch, restore versus bounded keep-alive and the per-primitive lifecycle bullet match the Activity reference and the Next guide read this run."
    },
    "techniques/screen-contributed-second-level.md": {
      "disposition": "clarify",
      "reason": "'a hidden screen keeps its tree but has its effects cleaned up, so it unregisters by itself' holds only for an effect-suspending keep-alive (React Activity cleans up effects when hidden). lazy-section-loading says other primitives keep effects running; there the screen must unregister on hide explicitly. Qualify."
    },
    "applications/spec--nav-hierarchy.md": {
      "disposition": "keep",
      "reason": "WCAG 2.2 quotes re-confirmed this run. Its recommendations to nav-hierarchy and the golden path are what this record carries as clarify items. ARIA 1.2 quotes not re-opened; verified_on left."
    },
    "applications/next--navigation-model.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency: the 'Re-read 2026-09-23' paragraph calls the same-URL traversal cost and the null-state cleanup 'untested', and the Applied 2026-09-23 section below answers both (0 server requests; a null replace erases the tab). Point the paragraph at the result. Private-tree anchors not reopened."
    },
    "applications/next--lazy-section-loading.md": {
      "disposition": "keep",
      "reason": "Public citations re-confirmed (the Next guide's three-route sentence, React Activity). Private-tree anchors were re-resolved 2026-09-23 and not reopened; its correction of the key's purpose is the reference the shell-hosted-services application contradicts."
    },
    "applications/next--badge-and-attention.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and the source of prohibition 7. Anchors at 40363b7 not reopened; the 2026-09-23 navigation application shows tabs.ts line numbers have moved since."
    },
    "applications/next--nav-hierarchy.md": {
      "disposition": "reverify",
      "reason": "WCAG claims re-confirmed. Private-tree anchors at 40363b7 not reopened; '~21 destinations' predates the 24 chunks recorded 2026-09-23."
    },
    "applications/next--shell-hosted-services.md": {
      "disposition": "clarify",
      "reason": "Says the panel is re-keyed 'so that a destination's render crash is contained to the panel and so the entrance animation replays'. The sibling lazy application corrected this on 2026-09-23 (true at 40363b7 too): the boundary resets through its own resetKey and the key only replays the entrance. Fix the reason; the residency finding stands. Remaining anchors drifted per the 2026-09-23 lead and are not reopened."
    },
    "applications/react--lazy-section-loading.md": {
      "disposition": "reverify",
      "reason": "Spot-checked in the consuming tree this run: the 150ms animation delay, idlePrefetch with initialDelayMs 2000, BASE_SECTIONS and lazyRetry exist; App.tsx anchors moved (251 to 295). Not every claim rechecked, so verified_on stays."
    },
    "applications/react--navigation-model.md": {
      "disposition": "reverify",
      "reason": "Spot-checked: NAV_SECTIONS, the _AssertAllRegistered exhaustiveness check and the 'goals' rehydrate migration exist, at moved lines (registry 105-108 to 111-113, systemStore 138 to 195). The 11-of-~156 coverage figure was not re-measured."
    },
    "applications/react--screen-contributed-second-level.md": {
      "disposition": "keep",
      "reason": "Read 2026-10-27 against a pinned public commit; consistent with the technique and with React's Activity semantics confirmed this run. Not re-cloned."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied six of the seven clarify items from the record above. The WCAG 2.2 text and the
Next.js accessibility page were opened this run; the other three are internal
inconsistencies checked against sibling documents. The mobile Back bullet in
`navigation-model` is still owed: no platform guidance text was found to quote.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/app-shell",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:1221778e9c5ba863",
  "disposition": "clarify",
  "coverage": "All 17 documents decided. Six clarify items applied and the edited passages re-read: three from WCAG 2.2 and the Next.js accessibility page opened this run, three internal inconsistencies verified against sibling documents. The mobile Back bullet in navigation-model stays owed. Other documents are byte-unchanged and keep their dispositions. No private tree or runtime re-run; no verification date refreshed.",
  "counterexamples": [
    "A shell where the frame is replaced per document (multi-page app) has no surviving mount point; the hosting rules do not transfer and session machinery must live in a worker or shared store.",
    "A keep-alive primitive that keeps effects running never unregisters a hidden screen's sections by itself, so the sidebar shows a screen nobody is looking at.",
    "Next.js's route announcer falls back to the first h1 and then the pathname when document.title is absent, so an unchanged title is not the same as nothing to say on a router navigation.",
    "On Android with the Navigation component's multiple back stacks, Back from a non-start tab goes to the start destination before leaving, which is a move between top-level destinations.",
    "A nav-only product at three levels of real structure is non-conforming at WCAG 2.2 AA (SC 2.4.5) even when the depth budget is obeyed, unless a search, site map or palette exists."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/WCAG22/",
      "result": "Re-read. SC 2.4.5 (AA) 'More than one way is available to locate a web page within a set of web pages except where the web page is the result of, or a step in, a process.' SC 1.4.10 (AA) 'without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels'. SC 2.5.3 (A) 'the name contains the text that is presented visually.' SC 2.4.1 (A) 'A mechanism is available to bypass blocks of content'. SC 1.4.13 (AA) Dismissible, Hoverable, Persistent. Confirms the spec application's quotes and the three nav-hierarchy gaps."
    },
    {
      "url": "https://nextjs.org/docs/app/guides/preserving-ui-state",
      "result": "lastUpdated 2026-10-15. 'Next.js preserves up to 3 routes. Beyond that, the oldest route is evicted and will re-render fresh.' Pages are hidden with Activity under cacheComponents. Confirms the next lazy-section-loading application's quote; the docs date it cites is older but the sentence is unchanged."
    },
    {
      "url": "https://react.dev/reference/react/Activity",
      "result": "Hidden: 'all its children's Effects are cleaned up'; visible again: 're-create their Effects'; DOM kept with display none. Confirms lazy-section-loading's suspend-effects bullet and the afterlife application; shows screen-contributed-second-level's 'has its effects cleaned up' is primitive-specific."
    },
    {
      "url": "https://nextjs.org/docs/architecture/accessibility",
      "result": "'The Next.js route announcer looks for the page name to announce by first inspecting document.title, then the <h1> element, and finally the URL pathname.' The golden path's 'speak the document title' omits the fallbacks."
    },
    {
      "url": "https://developer.android.com/guide/navigation/backstack/multi-back-stacks",
      "result": "Per-tab state is saved and restored; the documented tab switch pops up to the start destination with saveState. Does not state that Back never moves between top-level destinations; the technique's mobile bullet needs a quotable platform source."
    }
  ],
  "documents": {
    "app-shell.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the route-announcer sentence names the heading and path fallbacks; the skip link reads as the chosen mechanism for a required bypass outcome; moving focus is labelled craft rather than conformance."
    },
    "techniques/navigation-model.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: prohibition 6 now separates a renamed id (maps forward) from a removed id (falls through, never to a neighbour). Still owed: the mobile Back bullet ('some platforms' guidance says outright that Back does not move between top-level destinations') needs a quotable platform source; Android's multiple-back-stacks guide returns to the start destination first."
    },
    "techniques/nav-hierarchy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the second-route obligation past two levels (SC 2.4.5 AA), the 320 CSS px reflow obligation on the width floor (SC 1.4.10 AA), and one name string across postures (SC 2.5.3 A). The destinations-not-panes proposal remains an unplaced lead."
    },
    "techniques/entitlement-gating.md": {
      "disposition": "keep",
      "reason": "Single authority, hidden/locked/enabled by knowledge, mid-session revocation and the trust boundary are coherent. The conform proposal (a re-implemented predicate is a second authority) is already covered by the hand-copied-constant sentence. Still no application."
    },
    "techniques/badge-and-attention.md": {
      "disposition": "keep",
      "reason": "Predicate, derivation, clearing by kind, routing and the disclosure gate are consistent with the next application that sourced prohibition 7."
    },
    "techniques/shell-hosted-services.md": {
      "disposition": "keep",
      "reason": "Admission test, above-the-swap-point rule, declared order, reapers per ending class and visible worker death are coherent."
    },
    "techniques/lazy-section-loading.md": {
      "disposition": "keep",
      "reason": "Placeholder contract (shape or nothing), delay, prefetch, restore versus bounded keep-alive and the per-primitive lifecycle bullet match the Activity reference and the Next guide read this run."
    },
    "techniques/screen-contributed-second-level.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: self-unregistration on hide is now conditioned on an effect-suspending keep-alive; a primitive that keeps effects running must unregister on hide explicitly."
    },
    "applications/spec--nav-hierarchy.md": {
      "disposition": "keep",
      "reason": "WCAG 2.2 quotes re-confirmed this run. Its recommendations to nav-hierarchy and the golden path are what this record carries as clarify items. ARIA 1.2 quotes not re-opened; verified_on left."
    },
    "applications/next--navigation-model.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the re-read paragraph now points at the experiment's answers (no server round-trip; a null replace erases the tab) instead of calling them untested. Private-tree anchors not reopened."
    },
    "applications/next--lazy-section-loading.md": {
      "disposition": "keep",
      "reason": "Public citations re-confirmed (the Next guide's three-route sentence, React Activity). Private-tree anchors were re-resolved 2026-09-23 and not reopened; its correction of the key's purpose is the reference the shell-hosted-services application contradicts."
    },
    "applications/next--badge-and-attention.md": {
      "disposition": "reverify",
      "reason": "Internally consistent and the source of prohibition 7. Anchors at 40363b7 not reopened; the 2026-09-23 navigation application shows tabs.ts line numbers have moved since."
    },
    "applications/next--nav-hierarchy.md": {
      "disposition": "reverify",
      "reason": "WCAG claims re-confirmed. Private-tree anchors at 40363b7 not reopened; '~21 destinations' predates the 24 chunks recorded 2026-09-23."
    },
    "applications/next--shell-hosted-services.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the per-destination key is now said to replay the entrance only, with crash containment from the boundary's own reset key. Remaining anchors drifted (2026-09-23 lead) and were not reopened."
    },
    "applications/react--lazy-section-loading.md": {
      "disposition": "reverify",
      "reason": "Spot-checked in the consuming tree this run: the 150ms animation delay, idlePrefetch with initialDelayMs 2000, BASE_SECTIONS and lazyRetry exist; App.tsx anchors moved (251 to 295). Not every claim rechecked, so verified_on stays."
    },
    "applications/react--navigation-model.md": {
      "disposition": "reverify",
      "reason": "Spot-checked: NAV_SECTIONS, the _AssertAllRegistered exhaustiveness check and the 'goals' rehydrate migration exist, at moved lines (registry 105-108 to 111-113, systemStore 138 to 195). The 11-of-~156 coverage figure was not re-measured."
    },
    "applications/react--screen-contributed-second-level.md": {
      "disposition": "keep",
      "reason": "Read 2026-10-27 against a pinned public commit; consistent with the technique and with React's Activity semantics confirmed this run. Not re-cloned."
    }
  }
}
```

## Architecture review - 2026-10-31 (re-verification)

This record follows re-verification of the five applications the record above left at `reverify`. Two react applications now need their bodies folded, and two next applications moved their `verified_on`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/app-shell",
  "date": "2026-10-31",
  "baseline": "1212e28aa",
  "digest": "sha256-b2:9db566452b019291",
  "disposition": "clarify",
  "coverage": "All 17 documents decided. Five applications that the record above left at reverify were re-verified. The three next ones were read at their pin 40363b7 with git show and at the kp checkout's HEAD 936588503; the navigation-model pin 1401bb25 is absent from that history. The two react ones were read at the personas HEAD 61029d7ae0. Each now carries a dated re-check note. Primary sources re-read: WCAG 2.2 and WAI-ARIA 1.2 Recommendations, and the published next@16.3.0 app-router.js. The other twelve documents are byte-unchanged and carry their dispositions, including the navigation-model technique's owed mobile Back source and the shell-hosted-services application's reverify. Not evaluated: any runtime, the navigation-model experiment on 16.4.2, the personas legacy sweeps.",
  "counterexamples": [
    "A shell where the frame is replaced per document (multi-page app) has no surviving mount point; the hosting rules do not transfer and session machinery must live in a worker or shared store.",
    "A keep-alive primitive that keeps effects running never unregisters a hidden screen's sections by itself, so the sidebar shows a screen nobody is looking at.",
    "Next.js's route announcer falls back to the first h1 and then the pathname when document.title is absent, so an unchanged title is not the same as nothing to say on a router navigation.",
    "On Android with the Navigation component's multiple back stacks, Back from a non-start tab goes to the start destination before leaving, which is a move between top-level destinations.",
    "A nav-only product at three levels of real structure is non-conforming at WCAG 2.2 AA (SC 2.4.5) even when the depth budget is obeyed, unless a search, site map or palette exists.",
    "A rail whose sections are announced as tabs (role=tab, aria-selected) but whose panel carries no tabpanel role, aria-controls or arrow-key model gives assistive technology the tab vocabulary without the tab pattern, even though it never marks a previewed section as current."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/",
      "result": "Read 2026-10-31, aria-current state: 'Authors SHOULD only mark one element in a set of elements as current with aria-current.' 'Authors SHOULD NOT use the aria-current attribute as a substitute for aria-selected in widgets where aria-selected has the same meaning. For example, in a tablist, aria-selected is used on a tab to indicate the currently-displayed tabpanel.' The note adds that current and selected 'can have different meanings and can both be used within the same set of elements'. The next nav-hierarchy application's quote was not verbatim and was corrected."
    },
    {
      "url": "https://www.w3.org/TR/2024/REC-WCAG22-20241212/",
      "result": "Read 2026-10-31. SC 3.2.3 '... occur in the same relative order each time they are repeated, unless a change is initiated by the user.' SC 4.1.2 'the name and role can be programmatically determined'. SC 1.4.10 '320 CSS pixels'. SC 1.4.13 Dismissible / Hoverable / Persistent. All quotes in the nav-hierarchy application match."
    },
    {
      "source": "next@16.3.0 published package, dist/client/components/app-router.js (npm pack, read only)",
      "result": "copyNextJsInternalHistoryState :84-96, pushState patch applying it :252-263, onPopState dispatchTraverseAction with the stored tree :284-298, as the navigation-model application cites. In the installed 16.4.2 the copy function is unchanged at :128-140 (applied :292, :308) and traversal is handlePopState :61-71 with missed-traversal replay."
    },
    {
      "source": "kp checkout: 40363b7 via git show, and HEAD 936588503, read-only",
      "result": "Badge, nav-hierarchy and navigation-model citations hold at 40363b7. At HEAD: five badgeKeys and one badgeParams over 26 entries; useAttention backs off (attentionPoll.ts) and reads on visibilitychange; NavSectionRail announces all badges in a live region, renders the rail as role=tablist/tab with aria-selected, and persists the previewed section in sessionStorage; capability-locked ?tab= arrivals are adopted to a locked-door panel; 1401bb25 is not in the history."
    },
    {
      "source": "personas checkout at 61029d7ae0, read-only",
      "result": "RouteChunkSkeleton gained variant body (2026-10-20); navPrefetch.ts with SECTION_CHUNKS and rail intent prefetch (2026-09-24); FIRST_PAINT_PARTIAL_SECTIONS (2026-10-25); registry with 12 sections; deep_link.rs routes persona and execution ids (2026-10-07)."
    }
  ],
  "documents": {
    "app-shell.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the route-announcer sentence names the heading and path fallbacks; the skip link reads as the chosen mechanism for a required bypass outcome; moving focus is labelled craft rather than conformance. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/navigation-model.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: prohibition 6 now separates a renamed id (maps forward) from a removed id (falls through, never to a neighbour). Still owed: the mobile Back bullet ('some platforms' guidance says outright that Back does not move between top-level destinations') needs a quotable platform source; Android's multiple-back-stacks guide returns to the start destination first. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/nav-hierarchy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the second-route obligation past two levels (SC 2.4.5 AA), the 320 CSS px reflow obligation on the width floor (SC 1.4.10 AA), and one name string across postures (SC 2.5.3 A). The destinations-not-panes proposal remains an unplaced lead. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/entitlement-gating.md": {
      "disposition": "keep",
      "reason": "Single authority, hidden/locked/enabled by knowledge, mid-session revocation and the trust boundary are coherent. The conform proposal (a re-implemented predicate is a second authority) is already covered by the hand-copied-constant sentence. Still no application. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/badge-and-attention.md": {
      "disposition": "keep",
      "reason": "Predicate, derivation, clearing by kind, routing and the disclosure gate are consistent with the next application that sourced prohibition 7. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/shell-hosted-services.md": {
      "disposition": "keep",
      "reason": "Admission test, above-the-swap-point rule, declared order, reapers per ending class and visible worker death are coherent. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/lazy-section-loading.md": {
      "disposition": "keep",
      "reason": "Placeholder contract (shape or nothing), delay, prefetch, restore versus bounded keep-alive and the per-primitive lifecycle bullet match the Activity reference and the Next guide read this run. Byte-unchanged since the record above; disposition carried."
    },
    "techniques/screen-contributed-second-level.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: self-unregistration on hide is now conditioned on an effect-suspending keep-alive; a primitive that keeps effects running must unregister on hide explicitly. Byte-unchanged since the record above; disposition carried."
    },
    "applications/spec--nav-hierarchy.md": {
      "disposition": "keep",
      "reason": "WCAG 2.2 quotes re-confirmed this run. Its recommendations to nav-hierarchy and the golden path are what this record carries as clarify items. ARIA 1.2 quotes not re-opened; verified_on left. Byte-unchanged since the record above; disposition carried."
    },
    "applications/next--navigation-model.md": {
      "disposition": "keep",
      "reason": "Re-verified at HEAD 936588503: the re-resolution pin 1401bb25 is not in this checkout's history, so it could not be read. Every tree citation resolves at HEAD (moved tabs.ts and Workspace.tsx anchors listed in the dated note; useUrlInboxState.ts and shallow-nav.ts predate the pin and hold verbatim). The installed-router citations were checked in the published next@16.3.0 package and hold; the tree now installs 16.4.2, where traversal moved into handlePopState. The note narrows 'a forbidden address does nothing' to the flag gate (capability-locked arrivals now land on a locked-door panel). The pinned body does not contradict it. The deviation stands. The experiment's history-writer counts were not re-taken, so verified_on stays 2026-09-23."
    },
    "applications/next--lazy-section-loading.md": {
      "disposition": "keep",
      "reason": "Public citations re-confirmed (the Next guide's three-route sentence, React Activity). Private-tree anchors were re-resolved 2026-09-23 and not reopened; its correction of the key's purpose is the reference the shell-hosted-services application contradicts. Byte-unchanged since the record above; disposition carried."
    },
    "applications/next--badge-and-attention.md": {
      "disposition": "keep",
      "reason": "Re-verified: every citation re-resolved at the pin 40363b7 with git show and held; Next 16.3.0 confirmed in that tree's package.json. The body is explicitly pinned there, so its anchors stay and a dated note gives the HEAD (936588503) anchors. Two changes are recorded, not contradictions of a pinned body: the poll now backs off and reads on return to the tab (four recomputation triggers, not three), and a polite live region announces every badge across sections, which answers the 'invisible badge' shortfall for the non-visual channel only. verified_on moves to 2026-10-31; verified_against next@16 holds (16.4.2)."
    },
    "applications/next--nav-hierarchy.md": {
      "disposition": "keep",
      "reason": "Re-verified: every tree citation held at the pin 40363b7 and resolves at HEAD 936588503 (HEAD anchors in the dated note). WCAG 2.2 SC 1.4.10, 1.4.13, 2.4.5, 3.2.3 and 4.1.2 re-read and match. The ARIA 1.2 quote was not verbatim and was corrected in place to the Recommendation's 'Authors SHOULD only mark one element in a set of elements as current with aria-current'. At HEAD the rail button is role=tab with aria-selected (no aria-controls, tabpanel or arrow keys), which keeps the finding (preview is never aria-current) and is recorded in the note. verified_on moves to 2026-10-31."
    },
    "applications/next--shell-hosted-services.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the per-destination key is now said to replay the entrance only, with crash containment from the boundary's own reset key. Remaining anchors drifted (2026-09-23 lead) and were not reopened. Byte-unchanged since the record above; disposition carried."
    },
    "applications/react--lazy-section-loading.md": {
      "disposition": "clarify",
      "reason": "Re-verified at personas@61029d7ae0; anchors updated in place (RouteChunkSkeleton 52-56, DevToolsPage 40-48, App.tsx 289-295, routeSections 24-77). The body now contradicts its own dated note: its last shortfall says hover intent warms language chunks only, but navPrefetch.ts (2026-09-24) has the rail prefetch section code on pointer-enter and focus from the same map the router uses, so that bullet is resolved and should be removed or recast. 'Never fake the incoming body' should name the default variant, since a body variant now paints row ghosts. The warm-return claim was not re-measured, so verified_on stays 2026-08-18."
    },
    "applications/react--navigation-model.md": {
      "disposition": "clarify",
      "reason": "Re-verified at personas@61029d7ae0; registry, assertion, railSection, passesGates, history pruning, palette filter and the goals migration resolve, anchors updated in place. The registry now holds 12 sections (companions added). The body's 'the OS-level URL scheme cannot name a destination' is contradicted by its dated note: since 2026-10-07 personas://persona/<id> and personas://execution/<id> route through a validating parser. Recast that shortfall as 'no prefix names a section or tab'. The 11-of-~156 and three-invalid-writer figures come from legacy sweeps not re-run, so verified_on stays 2026-08-18."
    },
    "applications/react--screen-contributed-second-level.md": {
      "disposition": "keep",
      "reason": "Read 2026-10-27 against a pinned public commit; consistent with the technique and with React's Activity semantics confirmed this run. Not re-cloned. Byte-unchanged since the record above; disposition carried."
    }
  }
}
```
