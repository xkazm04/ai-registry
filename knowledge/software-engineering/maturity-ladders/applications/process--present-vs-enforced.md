---
layer: application
type: application
subject: maturity-ladders
technique: present-vs-enforced
stack: process
status: forged
---

# Present vs enforced as a written doctrine, not a convention

This repo states the distinction as doctrine in a design document and then holds
every ladder to it. `APP_READINESS_PASSPORT.md` §2b defines five ordinal
sub-scales and, in a block quote, names the line explicitly:

> The key distinction baked into every scale is **"present" vs "enforced."**
> `checks` means CI runs the tests; `gated` means a failing test actually
> *blocks the merge*. `scanning` means a SAST tool exists; `gated` means it stops
> a release. That present-vs-enforced line is where most "looks ready, isn't"
> surprises live; these enums make it explicit.

The enums carry it structurally rather than by convention. `ci.level` runs
`none → build → checks → gated → delivery → progressive` and `security.level`
runs `none → policy → scanning → gated → supply-chain`: in both, an *enforced*
rung sits above the *present* rung, and the same word — `gated` — names it in
both ladders, so a reader who learns the distinction once carries it across
scales. That is the technique's "existence and enforcement are never the same
rung", implemented as vocabulary rather than as a reviewer's judgment.

## The honesty rules travel with the ladder text

§2c defines the four-rung artifact ladder (`none → adhoc → curated → governed`)
and closes with two rules stated as inherited from the enforcement cap:

> 1. **Only fetched content can prove `governed`.** A snapshot that *lists* a
>    memory tree but whose files weren't fetched within the byte budget caps at
>    `curated`. We never claim a rung the evidence can't support.
> 2. **When two rungs are arguable, score the lower one.** The ladder is a floor,
>    not a guess.

Rule 1 is the evidence-class rule made operational: reference-level evidence
(a path appears in a listing) can reach `curated`; only inspected content reaches
the top rung. The cap is budget-driven and therefore *routine* rather than
exceptional — the byte budget will always run out on some subject — which is
exactly why it is written as a standing rule instead of a special case. Rule 2 is
the score-down tie-break, written into the doctrine so it is not left to the
assessor's mood.

The same doctrine reappears verbatim at the implementation sites, which is how it
stays true: the header of `src/lib/analyze/passport-grades.ts:12-16` repeats both
rules ("only file CONTENT we actually fetched can prove the `governed` rung …
When two rungs are arguable, score the LOWER one"), and
`src/lib/analyze/passport-autonomy.ts:15-18` applies the enforcement half to a
different ladder entirely:

> "gated" is an ENFORCED rung that needs branch protection, which a tokenless
> scan cannot observe. governance == null therefore caps the grant at T1 and says
> so in `missing` — never claim a delegation level the scan couldn't verify.

This is an honesty cap in the strict sense: the computed tier may satisfy every
T2 predicate, and the tier is still held at T1 because the *observation channel*
for enforcement was unavailable. `TOKENLESS_MISSING`
(`passport-autonomy.ts:33-34`) is the cap's required explanation — it leads every
checklist above T1 (`passport-autonomy.ts:133`), so the subject reads "re-scan
with a token" rather than an unexplained ceiling.

## The declinable allow-list, and the caveat that is not on it

§2d adds owner-declared declines, and the rule set matches the technique's four
constraints almost line for line: a decline "never moves a score", it "re-renders,
it doesn't hide" (the item is re-emitted under a `declined[]` list with the
original blocker text preserved), and "a re-scan cannot clear it" because
declines live in a separate overrides column applied as a read-time overlay, so
a scan writes the verdict and never touches the decision.

The fourth constraint is the one worth transplanting, and the document states it
sharply:

> Deliberately **not** declinable: the tokenless "enforcement not observable"
> caveat. That is a limitation of the *evidence*, and letting an owner silence it
> would let a trade-off annotation launder a blind spot.

The allow-list (`DECLINABLE_PATHS`, `src/lib/analyze/passport-overlay.ts`) is
what makes the exclusion enforceable rather than aspirational — an owner may
accept a real gap in monitoring or delivery, and cannot dismiss the sentence
saying the assessment could not see enforcement.

## The rung/posture split, with the constants deliberately misaligned

`src/lib/maturity/model.ts:451` sets the posture threshold at 50 while the
matching level band floor is 45, and the comment above it (`:441-450`) exists to
stop a future reader from "fixing" the gap:

> That pairing is a design choice, not an accident of two independently-picked
> constants: the LEVEL is a weighted average (partial strength on a few
> dimensions can legitimately carry it into L3), while the POSTURE asserts each
> axis independently — and a quadrant claim like "AI-Native" off a sub-half axis
> would overstate more than the mixed headline understates.

A repo at 45-49 on both axes therefore reads at the third rung with a
"Getting Started" posture on the same page. The comment also volunteers the
resulting weakness — the 45-55 corridor is borderline and `postureFor` has no
hysteresis — and that admission is what led to the announcement-level fix in
`src/lib/maturity/noise.ts:35-56`, where entry requires clearing 52 and exit
requires falling below 48. Classification stayed pure; only the decision to
*tell someone* became hysteretic.
