---
layer: application
type: application
subject: contested-acquisition
technique: classify-before-you-respond
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@20
---

# Node application: a pure classifier, an injected ladder, and a refusal that is a value

`wigolo` is a local-first web-intelligence MCP server for coding agents — a
TypeScript/Node package (`wigolo@0.2.1`) whose fetch subsystem escalates a
single retrieval across a plain HTTP client, a TLS-impersonation tier and a
Playwright browser tier. Its anti-bot path is where this subject's whole shape
is realized. Citations are against the repository root at commit
`c6ad4479da7706945b479786df0121e3cce1ece6`. The version witness is
`package.json:96-98` — `"engines": { "node": ">=20" }` — corroborated by the CI
pin `.github/workflows/ci.yml:27,54` (`node-version: 20`), so
`verified_against: node@20`; the matrix job at `ci.yml:108` also exercises a
`22` leg, and the packaging workflow pins `22` at
`.github/workflows/binary-build.yml:103`.

## The closed vocabulary, and it classifies shape only

`src/fetch/challenge-classify.ts` is the classifier, and its module docstring
(`:5-40`) declares the closed set in four members — `interactive`, `image`,
`behavioral`, `none` — with what each means for *what could be run against it*
rather than for what it is made of: "a trusted gesture can pass it", "pixels an
in-band vision model can reason about", "not 'solvable', only avoidable".

The technique's "classify shape, never whether" rule is stated in the source as
a design constraint with a named reason (`:35-39`): the marker vocabulary is
"REUSED from the shipped detector (`tls-tier.ts`)" so this classifier "never
disagrees with the shipped `isChallengeResponse` / `hasBrowserChallengeBody`
about WHETHER a page is a challenge — it only refines the SHAPE." That is one
authority for the vocabulary, chosen deliberately over a second implementation.

The module is pure by construction and says so in the same block ("Pure; fully
unit-testable on HTML"). `classifyChallenge(html)` (`:88-144`) takes a string
and returns an enum; there is no clock, no config, no network. The precedence
rules are consequently tested as rules — `tests/unit/fetch/challenge-classify.test.ts`
carries a `describe('ambiguity precedence — under-claim solvability')` block
(`:157-177`) whose two cases assert the classifier *declines* to promote.

## The election is a table in a comment and a switch in code

`src/fetch/solve-ladder.ts` is the sequencer, and its header (`:13-19`) writes
the election out per class before any code runs:

```
//   - interactive → auto-pass (trusted gesture), then human (last).
//   - image       → ai-vision (in-band vision), then human (last).
//   - behavioral / none → nothing.
```

`runSolveLadder` (`:89-132`) implements exactly that, and the empty election is
its first branch (`:94-97`): `behavioral` and `none` return the `UNSOLVED`
constant (`:81`) having entered no rung. The header names the cost that branch
avoids in the technique's own terms (`:8-11`) — "burning an LLM call or a
gesture would be dishonest work" — and ties the return to the caller's refused
path: it returns "the honest `{solved:false, solveMethod:null}` the
`blocked_by_challenge` path depends on."

The sequencer imports none of the engines. `SolveLadderOptions` (`:50-67`)
takes `tryAutoPass`, `tryAiSolve` and `tryHuman` as injected functions, with
the module header stating the constraint outright (`:4-6`): "no Playwright /
CDP / LLM import here — every rung is injected as a function, so this module
unit-tests against mocks." `tests/unit/fetch/solve-ladder.test.ts` then tests
the ordering policy with no browser and no provider, including the
must-not-fire cases (`:33-52`: "behavioral → no rung runs", "none → no rung
runs (never burn an LLM call or a gesture)") and the never-tried assertions
(`:54,116`: "ai-solve NEVER tried", "auto-pass NEVER tried").

## The wrapping rungs are named as absent, twice

The golden path's "a wrapper is not a rung" section has its best statement here
rather than in any standard. The ladder header (`:21-25`) and a comment inside
the function body (`:117-120`) both say the same thing, which reads as
redundancy until you notice it is a defence against a future reader closing
what looks like a gap: the raw control-plane rung and the hosted
scraping-browser rung "are both wired, but at the BROWSER POOL level —
cdp-direct runs before the pool ever navigates, and the hosted rung replaces
the local launch. Neither is a slot in this sequence, so nothing is called for
them here."

## The declared refusal is a typed error carrying provenance

`ChallengeBlockedError` (`src/fetch/browser-pool.ts:108-143`) is the refusal as
a value: `readonly code = 'blocked_by_challenge'` (`:109`), plus the two
provenance fields the ladder threads onto it (`:119-127`) — `challengeClass`
and `solveMethod`, the latter "always `null` on a block — no rung cleared it".
The throw site (`:1118-1122`) passes the classifier's verdict through:
`{ challengeClass: detectedChallengeClass, solveMethod: null }`.

The technique's "omit the status you cannot name" rule is implemented and
justified at the field's own docstring (`:111-118`): the underlying anti-bot
status is threaded when known and "Undefined when no reliable status exists
(e.g. a goto-timeout, or a 2xx interstitial shell) — **never invented**." The
throw site enforces it with `isAntiBotStatus(statusCode) ? statusCode :
undefined` (`:1120`).

The verdict then survives its boundaries. `src/fetch/router.ts:687-693` is the
single mapping point ("Every browser-tier call site routes through here so the
mapping is uniform") from the thrown error to a structured stage error, and
`:745-760` closes the other direction — a browser *success* that is still a
refusal is guarded into the same `blocked_by_challenge` value rather than
returned as content ("never leak the shell as content"). The code reaches the
REST layer as a member of a named set (`src/daemon/rest/errors.ts:116`), and
`src/repl/commands/fetch.ts:82` exists to "preserve solve-ladder provenance on
a `blocked_by_challenge` stage error" at the last surface.

## Where the tree taught the standard something

Two things in this tree are better than the draft they were reconciled against.

**Presence of the mechanism is not evidence of refusal, and the fix is a
measured constant.** `challenge-classify.ts:95-121` is a guard that runs before
any precedence: a body carrying real readable text is a real page whatever
rides along in it. Its comment carries the measurement that produced it — a
retailer's successfully-served page, 405KB, a genuine title, 2,777 characters
of visible text, classified `behavioral` purely because its vendor sensor
markers were present (measured 2026-07-28) — and the failure it names is the
important one: keying off markers alone "rejects genuine content across a large
slice of the protected web." The constant is `REAL_CONTENT_MIN_TEXT = 600`
(`:41-44`), derived rather than chosen: "Measured bot-wall pages carry 35-330
visible chars; an ordinary page carries thousands." The guard's exception is
equally precise (`:46-71`): a *template* signature or an interstitial title is
emitted only by the refusal page itself and therefore outranks length, while a
*sensor* script rides along on served pages and must lose to content. And the
length measurement is deliberately taken over the whole document rather than
the 32KB marker slice (`:111-114`), because a large real page's first 32KB is
head scripts and would defeat the guard.

**A corroboration guard can be vacuous against itself.** `hasSliderMarker`
(`:280-291`) carries the incident: "The corroborating hint must be a SEPARATE
signal from the token that triggered the check. `'slider'.includes('slide')`
made the old guard vacuous: every carousel, range input and `class="slider"`
satisfied its own corroboration and classified as a drag puzzle, so the vision
rung would attempt a drag on ordinary UI." That is an optimistic
misclassification spending a model call on ordinary page furniture — the exact
cost this subject's classification-first rule exists to avoid, arriving through
a guard written to prevent it.

## Where it falls short of the standard

The declared refusal carries the class and the solve method, but not the
*election* — which responses were applicable for that class, and which of them
actually ran. A caller receiving `blocked_by_challenge` with
`challengeClass: 'behavioral'` can infer the empty election only by knowing the
ladder's table; a caller receiving `challengeClass: 'image'` with
`solveMethod: null` cannot distinguish "the vision rung ran and failed" from
"no vision provider was configured, so it was skipped cleanly"
(`solve-ladder.ts:109`, `visionAvailable`). Both are honest negatives and they
route differently: one is a capability gap an operator can close, the other is
a genuine attempt. The standard asks for the elected set on the value; this
tree stops one field short of it.
