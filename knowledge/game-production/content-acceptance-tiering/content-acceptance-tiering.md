---
layer: golden-path
type: golden-path
subject: content-acceptance-tiering
status: forged
use_when: [defining what "done" means for produced content, designing an acceptance ladder, a dashboard is greener than the build, choosing statuses for a content gate]
techniques:
  - tier-ladder-design
  - derived-vs-toggled-acceptance
  - deferred-as-honest-progress
  - config-complete-vs-runtime-verified
  - never-fail-silently-reason-strings
  - plain-language-tier-glossary
---

# Content acceptance tiering

A piece of produced game content — an ability, a creature, an item, a room, a
cutscene — is *accepted* when a named body of evidence exists about it, at a named
strength, and that evidence can be re-derived by a machine from the artifact as it
stands right now. Nothing weaker counts. "The author says it's done", "it's in the
build", "we reviewed it in the Tuesday meeting" are all statements about people, not
about the artifact, and a production line that runs on them cannot tell you what it
has.

The subject is the shape of that evidence: how to build a **ladder** whose every rung
proves strictly more than the rung below it, and the discipline that keeps such a
ladder from quietly becoming a progress bar.

## A tier is defined by the kind of evidence it consumes

This is the load-bearing idea, and almost every team gets it wrong on the first
attempt by ordering their tiers by **difficulty** or by **cost**. Cost-ordered ladders
reshuffle the moment tooling changes: a perceptual check that took a human an hour in
one quarter takes an automated critic ninety seconds in the next, and now your "hardest
tier" is cheaper than your "easy" one and the ordering is nonsense.

Order by **what kind of thing the evidence is**. Five kinds recur across content
domains, and they nest:

- **Declared state, read back by a program.** The artifact says something about itself
  — a field is populated, a reference resolves, a count is within a stated band. The
  evidence is the artifact's own data, examined by code that did not author it.
- **A recorded human selection.** A person chose among alternatives — this silhouette,
  this voice take, this damage curve — and the choice is *stored as data*, not
  remembered. The evidence is the stored choice plus who made it and when.
- **Static rules evaluation.** The artifact is evaluated against a body of rules
  without being run: cross-references resolve to real targets, the declared grant path
  names something that exists, budgets hold, the naming law is obeyed. The evidence is
  a rules engine's verdict over a graph the artifact participates in.
- **Observed runtime behaviour.** The thing was made to actually run, and an
  independent observer recorded what happened. The evidence is a trace, an event, a
  counter — produced by the running system, not by the thing that asked it to run.
- **Perceptual truth.** Someone or something looked at the rendered result and judged
  it against a standard. The evidence is an image or a sequence plus a verdict bound to
  it.

Each kind can see failures the kinds below it are structurally blind to. That blindness
is not a matter of effort — no amount of rigour at the declared-state tier will reveal
that a subject stood motionless when the game ran it, because motion is simply not
present in the data being read. That is what "strictly more" means, and it is why the
ordering survives tooling changes.

**The strictly-more test.** For each adjacent pair of rungs, name a concrete defect
that passes the lower and is caught by the higher. If you cannot name one, the two
rungs are one rung wearing two labels, and you should merge them. Run this test in both
directions when you add a tier: a new rung that catches nothing new is decoration, and
decoration in an acceptance ladder is worse than absence, because it inflates the
denominator of every completion percentage you will ever quote.

You may need three rungs or seven. A team producing only static props needs no
behavioural rung and should not pretend to have one; a team producing systemic
abilities needs to split runtime into *fires at all* and *fires with correct magnitude*,
because those consume different traces. Derive the ladder for your own domain rather
than importing someone else's rung count — the procedure is
[tier-ladder-design](techniques/tier-ladder-design.md).

## Crossed with the tiers: who produced the evidence

The tier says how strong the evidence is. A second, independent axis says **what kind
of authority produced it**, and it is the axis most ladders omit:

- **Data-derived** — a program read artifact state and computed the verdict. Re-runs
  give the same answer. Nobody can move it except by changing the artifact.
- **Human selection** — a person made a call that no program can make, and the call was
  written down. Re-runs give the same answer because the answer is stored, but the
  answer is only as good as the moment it was made, and it must carry that moment with
  it.
- **Engine-verified** — the running system reported what it observed. Re-runs require
  re-running; between runs, the verdict is a statement about the past.

The cross-product is what makes a ladder operable. It tells you *how a verdict becomes
stale* (data-derived verdicts go stale when the artifact changes; human selections go
stale when the surrounding design changes; engine-verified verdicts go stale when
either the content or the build changes), and it tells you *what a red rung means*
(a data-derived failure is a bug in the artifact; a missing human selection is unstarted
work; a missing engine verification is usually an unrun harness, not a defect).

Critically, a human selection is evidence *because it was recorded as an artifact fact*,
not because a person felt satisfied — and because the record says a *human* made it. A
pipeline that auto-picks a default candidate to keep things moving will satisfy a naive
"a selection exists" check on every artifact it ever produces, and the rung then measures
nothing. The distinction between a stored choice and a sign-off checkbox, and between a
human choice and a machine's default, is the whole of
[derived-vs-toggled-acceptance](techniques/derived-vs-toggled-acceptance.md), and it is
the single most common way these systems rot.

## Four statuses, and why the fourth is load-bearing

Most teams reach for three: **pass**, **fail**, **pending**. Three is not enough, and
the missing case is the expensive one.

- **pass** — the check ran and the artifact satisfied it.
- **fail** — the check ran and the artifact did not satisfy it. This is a defect and
  someone owes work.
- **pending** — the check has not run because the work it examines has not been done
  yet. This is unstarted work.
- **deferred** — the check *could not* run here, for a stated structural reason, and its
  absence is expected rather than alarming. The runtime harness is not attached to this
  workstation. The visual capture requires a built client and this is an authoring pass.
  The artifact is of a class this rung does not apply to.

Without the fourth status, "we could not run the expensive gate" gets encoded as one of
the other three, and every encoding is a lie with a different cost. Encoded as *pass*,
you have manufactured green from nothing and the dashboard now claims evidence that does
not exist. Encoded as *fail*, the board is permanently red for a reason nobody can act
on, and within two sprints people stop reading red at all — you have destroyed the
signal you built the ladder to produce. Encoded as *pending*, you have made unrunnable
indistinguishable from unstarted, so your burndown counts work that will never be done
by an author.

The rule that gives *deferred* its teeth: **after a clean production run, every step of
every artifact is either `pass` or `deferred` — never `fail`, never `pending`.** A
`fail` after a clean run means the producer emitted something broken. A `pending` after
a clean run means a step was silently skipped and nobody noticed. So the two statuses
that mean "work outstanding" become assertions about the *producer*, and the two that
mean "settled" become assertions about the *artifact*. That partition is what makes a
ladder auditable at a glance, and it is worked out in
[deferred-as-honest-progress](techniques/deferred-as-honest-progress.md).

A deferral is only honest if it says why. A `deferred` with no reason is
indistinguishable from a shrug, and shrugs accumulate.

## Two completion predicates, never one

The moment you have deferrals, "is this done?" splits into two genuinely different
questions, and collapsing them back into one green dot is the lie this whole discipline
exists to refuse.

- **Configuration-complete.** Every step either passes, or is deferred *at the
  behavioural and perceptual rungs only*. Everything a machine could determine without
  running the game has been determined and is good. This is the predicate that governs
  whether an artifact may be handed to the next stage of the line.
- **Verified.** Configuration-complete, *and* the behavioural and perceptual rungs have
  actually been run and passed, with no deferrals remaining at those rungs. This is the
  predicate that governs whether the artifact may be called shippable.

The clause "deferred at the behavioural and perceptual rungs only" is the entire seam. A
deferral at a declared-state or static-rules rung is not acceptable slack — those rungs
need no special environment, so a deferral there means somebody skipped a check that was
free. Deferrals are permitted exactly where the environment can legitimately be absent.
The predicate design, and what happens when a team tries to derive the shippable dot
from the cheap rungs alone, is
[config-complete-vs-runtime-verified](techniques/config-complete-vs-runtime-verified.md).

Both predicates are *derived*. Neither is a field anybody sets.

## Every non-pass states a reason

A verdict that is not a pass carries a human-readable reason string, always, without
exception — a failure says what was wrong, a deferral says what was missing, a pending
says what has not been authored yet. This looks like a nicety and is structural, for
three reasons.

First, it makes an unrun gate self-describing: the reason text on a deferral is the
only place the *precondition* of the rung is written down where the person looking at
the red-amber-green will actually read it. Second, it forces the check's author to
articulate the failure at the moment they write the check, which is when they still
know it — a reason string written six months later is a guess. Third, and most
practically, it converts triage from an investigation into a scan: a producer that
emits two hundred artifacts with fourteen non-passes is triaged in ninety seconds if
each non-pass explains itself, and in an afternoon if they do not.

Fourth, and this is the one that pays for the discipline outright: a deferral reason
written in a shared, parseable format becomes a **work order**. If it names the exact
observation that would resolve the rung, the queue of outstanding deferrals *is* the
runner's input, and draining the gates becomes mechanical rather than a research
project. Writer and reader must then share one definition of that format, or the queue
silently empties of what the runner cannot parse.

The corresponding hard rule is that no code path may produce a non-pass without one.
Make the reason a required part of the verdict's shape wherever the type system can
enforce it, so that a silent skip is not expressible. See
[never-fail-silently-reason-strings](techniques/never-fail-silently-reason-strings.md).

## A ladder nobody can read is a ladder nobody uses

Acceptance tiering is built by engineers and consumed overwhelmingly by people who are
not: artists, designers, animators, producers, whoever is deciding what to work on this
afternoon. A rung labelled with a code name and defined in a type declaration is
invisible to all of them, and the resulting failure is not misreading — it is
abandonment. They stop consulting the board and go back to asking a person whether the
thing is done, at which point the ladder is an expensive internal detail.

So every rung carries a second name in the language of the people who make the content:
*data check*, *human pick*, *rules check*, *live test*, *looks-good test*. Two words,
no jargon, every distinction preserved exactly. The plain name is not a comment — it is
generated from the same tier definition the evaluator uses, so the two cannot drift.
That constraint, and how to write names that survive it, is
[plain-language-tier-glossary](techniques/plain-language-tier-glossary.md).

## Failure modes of the naive reading

**The ladder becomes a progress bar.** Rungs get treated as a sequence to walk rather
than as evidence kinds, so someone adds a "rung" for *asset imported* between two real
rungs because it feels like a step. Now completion percentages are diluted by
non-evidence and the ladder cannot answer what it was built to answer. Test every rung
against the strictly-more test annually, not just at design time.

**Green derived from the cheap rungs.** The most seductive failure. All the low rungs
pass, the high rungs are deferred, and someone — usually under deadline, usually with
good intentions — makes the summary dot green because "everything we can check is
fine". This is exactly the lie the two-predicate split refuses. What you can check
cheaply is never a proxy for what you cannot.

**A rung that examines nothing.** The quietest failure of all, and the one most worth
measuring for. A rung's check is written against a *proxy* for the evidence rather than
the evidence itself — it confirms that a selection index is present rather than grading
the thing the index points at, or that a field exists rather than what is in it. The
rung then returns pass for every artifact in the catalogue and is indistinguishable from
a rung that works. The measurement that finds these: mutate the content a rung claims to
grade and assert its verdict flips. Teams that run this probe for the first time
routinely find that most of a rung's instances were insensitive to their own content —
in one audit, forty-four of forty-seven instances of a selection rung could not be made
to fail by any change to what had been selected.

**Failure absorbed into deferral.** The mirror image, and the reason `deferred` is
dangerous as well as necessary. If a rung can deferred-out for a reason the author
controls, the status becomes a mute button. Deferral reasons must name environmental or
structural preconditions — *the harness is not attached*, *this class has no visual
representation* — never judgments like *not important for this item*. Enumerate the
legal deferral reasons; do not accept free text alone.

**Verdicts that outlive their artifact.** A rung passed, the artifact was then edited,
and the pass is still displayed. Binding a verdict to a content fingerprint so it
degrades to *unjudged since the last change* rather than silently persisting is a
neighbouring discipline (it belongs with verdict integrity), but the ladder must at
minimum know which of its rungs are re-derived on every read and which are stored — and
must never display a stored one without its age.

**A rung that certifies itself.** The producer of an artifact reporting its own step as
passed is a self-report, not a verdict. Record it, label it as self-reported, and let a
separate observer reading real state render the actual verdict. A generator that grades
its own homework will pass every time.

## Where this subject ends

The merge order when several layers of evidence speak about one artifact, how a verdict
explains itself, and how gate dependencies are mapped belong to the acceptance-verdict
spine, not here. The specific rule that a static-rules rung may not accept an opaque
node it cannot see inside belongs to wiring-contract doctrine. Whether a generated
placeholder counts as an asset at all is a gating question for generative artifacts. The
binding of a verdict to a content hash, and how long a verdict stands, belong to verdict
integrity. And the engine-side machinery that produces behavioural and perceptual
evidence — what a trace must contain to be trusted — is its own subject. This one owns
only the ladder: what the rungs are, why they are ordered as they are, what statuses they
may take, and how a summary is derived from them without lying.
