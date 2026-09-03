# Laws — game production

Cross-cutting invariants. Techniques cite them by anchor; a technique that rests on none
cites none. These are the rules that recurred in every territory of the extraction — they
are not a summary of the subjects, they are what the subjects have in common.

---

<a id="unmeasured-is-not-a-pass"></a>
## L1 — Unmeasured is not a pass

Absence of a measurement, a verdict, or a check must render as *not measured*, never as
compliance, and never as a neutral number standing in for one. A step nobody has evaluated
and a step evaluated as adequate are different epistemic states and must be different
values; collapsing them is the single most common way a production dashboard lies. There is
no neutral constant: an unmeasured thing is null, `unmeasured`, `ungauged`, `unknown` — a
label, not a score. The corollary is that silence must never propagate upward as green.

---

<a id="a-number-carries-its-unit-and-basis"></a>
## L2 — A number carries its unit and its basis

A quantity handed across a boundary without its unit and the assumption it was computed
under is not information. A budget is meaningless unless it says which primitive it counts.
A damage figure is meaningless without its type and its stacking bucket. A mitigation
percentage does not exist for a defence that is soft-capped against the size of the incoming
hit — only for a stated reference hit. A score is meaningless without the basis it was
scored on. Where a producer and a consumer of a number disagree about its unit, the failure
is silent, arrives late, and is expensive.

---

<a id="one-authority-per-quantity"></a>
## L3 — One authority per quantity

Two systems answering the same question with two models is worse than having one model, and
worse than having none: the disagreement is invisible until it is load-bearing. Each quantity
has exactly one owning implementation; everything else adapts into it. A simpler legacy model
may be retained for compatibility but must be barred from producing a verdict. The same rule
governs content: a value that appears in sibling artifacts is single-sourced, and a contradiction
between siblings is a defect in its own right.

---

<a id="law-and-check-share-one-source"></a>
## L4 — The law and the check that enforces it share one source

A rule written in prose for humans and a threshold typed into a linter will drift apart, and
the drift is undetectable from either side. The check reads its numbers from the canonical
statement of the law; a change to the prose propagates, and a failure to parse the prose is a
loud error, never a silent fallback to a hardcoded default. The corollary at authoring time:
the rule an artifact will be graded against is visible to whoever — or whatever — authors the
number.

---

<a id="compiling-is-not-wiring"></a>
## L5 — Compiling is not wiring

An artifact that builds, loads and validates but is never granted, registered, triggered or
reachable is not done. Every produced artifact declares how it is granted, how it is
activated, what it depends on, and how it is verified — and each of those must name something
real, not a placeholder. This is the rule that separates a demonstrably complete feature from
one that merely survives its own compiler.

---

<a id="a-verdict-is-bound-to-its-content"></a>
## L6 — A verdict is bound to the content it judged

A quality judgment speaks only for the exact artifact it examined. Bind it to a content
fingerprint; when the content changes, the verdict becomes evidence about the past, not a
statement about the present. Report it as such rather than dropping it — a gap that is visible
is survivable, and "unjudged since the last change" must never be readable as "judged and
passed". Where provenance is unprovable, the asymmetry is deliberate: an unverifiable
condemnation still condemns, an unverifiable pass does not elevate. Falling to the conservative
side is what keeps the whole layer honest.

---

<a id="no-gate-self-certifies"></a>
## L7 — No gate self-certifies

The party that produced an artifact may not be the authority that passes it. A producer's own
claim of success is an input to a verdict, never the verdict; a generator that reports its
output as valid gets that claim recorded and labelled as self-reported. The authority is a
separate observer reading real state. Under automation this hardens further: an unattended
process reports what it verified and what it merely asserted as two different numbers, and the
one that counts is the verified one.

---

<a id="grade-against-what-ships-not-on-a-curve"></a>
## L8 — Grade against what ships, not on a curve

Craft is judged in absolute terms against the standard of work that actually shipped, never
relative to the batch, never relative to the artifact's own ambition, and never assuming the
input was competent. Correctness is the floor, not a passing grade: a functional, generic
result that a lead would hand back is placeholder work and must score as such. A rubric earns
this by naming concrete reference standards per level and by stating each criterion as a bar
an examiner can check against the stored artifact.

---

<a id="structural-proof-is-never-sufficient"></a>
## L9 — Structural proof is necessary and never sufficient

That an artifact exists, parses, compiles and has its properties set says nothing about
whether it behaves correctly or looks right. Every ladder of evidence therefore has rungs
above the structural ones, and a claim of completion names the rung it was proven at. The
canonical failure is a subject that passed every existence, compile and wiring check and was
motionless on screen. Behavioural and perceptual evidence are separate rungs precisely because
nothing below them implies them.

---

<a id="refuse-rather-than-destroy"></a>
## L10 — Refuse rather than destroy

A tool that drives someone's live workspace refuses and reports rather than clearing the way.
It never terminates a process it did not itself spawn, never kills by name what it can only
identify by name, and takes an exclusive lease on a non-reentrant resource rather than racing
for it. When it cannot proceed, the honest outcome is a stated precondition failure — a
refusal is a result, and it is a better one than a destroyed session. The same instinct governs
teardown: drain what is in flight and count it, rather than cancelling and hiding the cost.

---

<a id="a-budget-shapes-the-output"></a>
## L11 — A budget shapes the output, it does not only cap it

A limit handed to a generative process is an instruction about the target, not merely a ceiling
it must stay under. An over-generous budget measurably degrades the result, because the process
spends what it is given. State budgets per class as the intended size of the thing, derive the
budget for a part from the budget for the whole rather than repeating the whole's allowance, and
grade what was delivered against what was requested — not only against the class ceiling. The
same holds for runtime budgets: a declared headroom that nothing checks is a wish.

---

<a id="an-instrument-proves-it-had-input"></a>
## L12 — An instrument proves it had input before it reports a verdict

A check that examined nothing and a check that examined everything and found nothing return the
same clean result, and from the outside the two are indistinguishable. So a gate, a walk, a scan
or a rubric states the size and identity of what it examined beside what it concluded, and an
empty scope is a loud failure rather than a quiet pass: no nodes, no declared entries, no files
in the scanned directory, no criterion covering the dimension. The corollary binds the guard as
well as the result — a structural check written to prove an exclusion carries a second assertion
that its own scope is non-empty, because the cheapest way to satisfy any check is to hand it
nothing. This is not the absence of a measurement, which is already forbidden; it is a
measurement taken over an empty set and reported as though it had been taken over the subject.

---

<a id="declaring-an-input-is-not-consuming-it"></a>
## L13 — Declaring an input is not consuming it

A field a producer fills and no consumer ever reads is, from the producing side, indistinguishable
from one that governs everything downstream: it validates, it round-trips, it appears in the schema,
and the artifact carrying it looks configured. From the consuming side it does not exist. So the
question a pipeline must be able to answer about every declared input is not whether something wrote
it but whether something *reads* it — a census of readers, never of writers — and an input with no
reader is reported as ignored at the moment it is declared, not discovered later by whoever trusted
it. A generator states which of its declared parameters the selected algorithm actually consumes; an
authored vocabulary is audited in both directions, for names referenced but never declared and for
names declared but never referenced; and a constraint stored as prose in a field no checker parses
is worse than an absent one, because absence is visible and prose reads as authored. This is the
mirror of the rule that compiling is not wiring: that one governs a produced artifact nothing can
reach, this one governs a declared input nothing consults, and they are the same disease at opposite
ends of the pipe.
