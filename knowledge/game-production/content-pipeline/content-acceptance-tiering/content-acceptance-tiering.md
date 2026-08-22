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

A piece of produced game content — an ability, a creature, an item, a room, a cutscene —
is *accepted* when a named body of evidence exists about it, at a named strength, and
that evidence can be re-derived by a machine from the artifact as it stands right now.
Nothing weaker counts. "The author says it's done", "it's in the build", "we reviewed it
in the Tuesday meeting" are statements about people, not about the artifact, and a
production line that runs on them cannot tell you what it has. The subject is the shape
of that evidence: how to build a **ladder** whose every rung proves strictly more than
the rung below it, and the discipline that keeps such a ladder from becoming a progress
bar.

## A tier is defined by the kind of evidence it consumes

Almost every team orders their tiers by **difficulty** or **cost** first, and
cost-ordered ladders reshuffle the moment tooling changes: a perceptual check that took a
human an hour in one quarter takes an automated critic ninety seconds in the next, and
the "hardest tier" is now cheaper than the "easy" one. Order instead by **what kind of
thing the evidence is**. Five kinds recur across content domains, and they nest:

- **Declared state, read back by a program.** A field is populated, a reference resolves,
  a count is within a stated band. The evidence is the artifact's own data, examined by
  code that did not author it.
- **A recorded human selection.** A person chose among alternatives — this silhouette,
  this voice take, this damage curve — and the choice is *stored as data*, not
  remembered. The evidence is the stored choice plus who made it and when.
- **Static rules evaluation.** The artifact is evaluated without being run:
  cross-references resolve to real targets, the declared grant path names something that
  exists, budgets hold. The evidence is a rules engine's verdict over a graph the
  artifact participates in.
- **Observed runtime behaviour.** The thing was made to actually run and an independent
  observer recorded what happened. The evidence is a trace, an event, a counter —
  produced by the running system, not by the thing that asked it to run.
- **Perceptual truth.** Someone or something looked at the rendered result and judged it
  against a standard. The evidence is an image or a sequence plus a verdict bound to it.

Each kind sees failures the kinds below it are structurally blind to, and that blindness
is not a matter of effort: no rigour at the declared-state tier will reveal that a
subject stood motionless when the game ran it, because motion is not present in the data
being read. That is what "strictly more" means, and why the ordering survives tooling
changes. **The strictly-more test** makes it operable: for each adjacent pair of rungs,
name a concrete defect that passes the lower and is caught by the higher. If you cannot
name one, the two rungs are one rung wearing two labels — merge them. A rung that catches
nothing new is decoration, and decoration is worse than absence, because it inflates the
denominator of every completion percentage you will ever quote.

Rung count is derived per domain, never imported: a team producing only static props
needs no behavioural rung and should not pretend to have one, while systemic abilities
need runtime split into *fires at all* and *fires with correct magnitude*, because those
consume different traces. The procedure is
[tier-ladder-design](./techniques/tier-ladder-design.md).

## Crossed with the tiers: who produced the evidence

The tier says how strong the evidence is. A second, independent axis — the one most
ladders omit — says **what kind of authority produced it**. **Data-derived**: a program
read artifact state and computed the verdict, and nobody can move it except by changing
the artifact. **Human selection**: a person made a call no program can make and it was
written down, an answer only as good as the moment it was made, which it must carry with
it. **Engine-verified**: the running system reported what it observed, so between runs
the verdict is a statement about the past.

The cross-product is what makes a ladder operable. It tells you *how a verdict becomes
stale* (data-derived when the artifact changes; human selections when the surrounding
design changes; engine-verified when either the content or the build changes), and *what
a red rung means* (a data-derived failure is a bug in the artifact; a missing human
selection is unstarted work; a missing engine verification is usually an unrun harness,
not a defect).

A human selection is evidence *because it was recorded as an artifact fact*, not because
a person felt satisfied — and because the record says a *human* made it. A pipeline that
auto-picks a default candidate to keep things moving satisfies a naive "a selection
exists" check on every artifact it produces, and the rung then measures nothing. That
distinction — stored choice versus sign-off checkbox, human choice versus machine default —
is [derived-vs-toggled-acceptance](./techniques/derived-vs-toggled-acceptance.md), the single
most common way these systems rot.

## Four statuses, and why the fourth is load-bearing

Most teams reach for three — **pass**, **fail**, **pending** — and the missing case is
the expensive one.

- **pass** — the check ran and the artifact satisfied it.
- **fail** — the check ran and the artifact did not. A defect; someone owes work.
- **pending** — the check has not run because the work it examines is not done yet.
  Unstarted work.
- **deferred** — the check *could not* run here, for a stated structural reason, and its
  absence is expected rather than alarming: the runtime harness is not attached to this
  workstation; the visual capture requires a built client and this is an authoring pass;
  the artifact is of a class this rung does not apply to.

Without the fourth, an unrunnable check must be encoded as one of the other three, each a
lie with its own cost: as *pass*, green manufactured from nothing; as *fail*, a board red
for a condition no author can fix, until within two sprints red stops meaning "act"; as
*pending*, a backlog of phantom tasks no author will ever perform.

The rule that gives *deferred* its teeth: **after a clean production run, every step of
every artifact is either `pass` or `deferred` — never `fail`, never `pending`.** A `fail`
after a clean run means the producer emitted something broken; a `pending` means a step
was silently skipped and nobody noticed. The two statuses meaning "work outstanding"
become assertions about the *producer*, and the two meaning "settled" assertions about
the *artifact* — the partition that makes a ladder auditable at a glance, worked out in
[deferred-as-honest-progress](./techniques/deferred-as-honest-progress.md). A deferral is
only honest if it says why: a `deferred` with no reason is indistinguishable from a
shrug, and shrugs accumulate.

## Two completion predicates, never one

The moment you have deferrals, "is this done?" splits into two questions, and collapsing
them back into one green dot is the lie this discipline exists to refuse.
**Configuration-complete** — every step passes or is deferred *at the behavioural and
perceptual rungs only* — governs whether an artifact may be handed to the next stage of
the line. **Verified** — configuration-complete, *and* those rungs actually run and
passed with no deferrals left there — governs whether it may be called shippable. Both
are derived on every read; neither is a field anybody sets.

The restricting clause is the entire seam: declared-state and static-rules rungs need no
special environment, so a deferral there is not slack but a free check skipped. Deferrals
are permitted exactly where the environment can legitimately be absent. See
[config-complete-vs-runtime-verified](./techniques/config-complete-vs-runtime-verified.md).

## Every non-pass states a reason

A verdict that is not a pass carries a human-readable reason string, always — a failure
says what was wrong, a deferral says what was missing, a pending says what has not been
authored yet. This looks like a nicety and is structural. It makes an unrun gate
self-describing: a deferral's reason is the only place the rung's *precondition* is
written where whoever reads the red-amber-green will see it. And it turns triage from an
investigation into a scan: two hundred artifacts with fourteen non-passes are triaged in
ninety seconds if each non-pass explains itself, and in an afternoon if they do not.

Written in a shared, parseable format that names the exact observation which would
resolve the rung, a deferral reason becomes a **work order** — the queue of outstanding
deferrals *is* the runner's input — but writer and reader must share one definition of
that format, or the queue silently empties of what the runner cannot parse. And no code
path may produce a non-pass without a reason: make it a required part of the verdict's
shape wherever the type system can enforce it, so a silent skip is not expressible. See
[never-fail-silently-reason-strings](./techniques/never-fail-silently-reason-strings.md).

## A ladder nobody can read is a ladder nobody uses

A rung labelled with a code name is invisible to the artists, designers and producers who
consume the ladder, and the failure that follows is not misreading but abandonment: they
go back to asking a person whether the thing is done. So every rung carries a second name
in their language — *data check*, *human pick*, *rules check*, *live test*, *looks-good
test* — two words, no jargon, every distinction preserved exactly. The plain name is not
a comment: it is generated from the same tier definition the evaluator uses, so the two
cannot drift. How to write names that survive that constraint is
[plain-language-tier-glossary](./techniques/plain-language-tier-glossary.md).

## Failure modes of the naive reading

**The ladder becomes a progress bar.** Rungs get treated as a sequence to walk rather
than as evidence kinds, so someone adds a "rung" for *asset imported* between two real
rungs because it feels like a step, diluting every completion percentage with
non-evidence. Re-run the strictly-more test over every rung annually, not just at design
time.

**Green derived from the cheap rungs.** All the low rungs pass, the high rungs are
deferred, and someone — under deadline, with good intentions — makes the summary dot
green because "everything we can check is fine". What you can check cheaply is never a
proxy for what you cannot.

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

**Failure absorbed into deferral.** The mirror image, and why `deferred` is dangerous as
well as necessary: if a rung can deferred-out for a reason the author controls, the
status becomes a mute button. Deferral reasons must name environmental or structural
preconditions — *the harness is not attached*, *this class has no visual representation*
— never judgments like *not important for this item*. Enumerate the legal deferral
reasons; do not accept free text alone.

**Verdicts that outlive their artifact.** A rung passed, the artifact was then edited, and
the pass is still displayed. Binding a verdict to a content fingerprint belongs to verdict
integrity, but the ladder must at minimum know which of its rungs are re-derived on every
read and which are stored — and must never display a stored one without its age.

**A rung that certifies itself.** The producer of an artifact reporting its own step as
passed is a self-report, not a verdict. Record it, label it as self-reported, and let a
separate observer reading real state render the verdict. A generator that grades its own
homework will pass every time.

## Where this subject ends

Merge order when several layers of evidence speak about one artifact, how a verdict
explains itself, and how gate dependencies are mapped belong to the acceptance-verdict
spine. That a static-rules rung may not accept an opaque node it cannot see inside
belongs to wiring-contract doctrine; whether a generated placeholder counts as an asset
is a gating question for generative artifacts; how long a verdict stands belongs to
verdict integrity; and the machinery that produces behavioural and perceptual evidence is
its own subject. This one owns only the ladder: what the rungs are, why they are ordered
as they are, what statuses they may take, and how a summary is derived without lying.
