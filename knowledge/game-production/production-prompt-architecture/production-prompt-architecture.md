---
layer: golden-path
type: golden-path
subject: production-prompt-architecture
status: forged
use_when: [assembling a generation prompt for an automated producer, output passes review but does not integrate with the project, an agent keeps re-inventing systems that already exist, deciding what knowledge a task prompt should carry]
techniques:
  - fixed-section-order
  - scanned-project-state-do-not-recreate
  - wiring-requirements-section
  - acceptance-criteria-appended-not-replaced
  - version-keyed-engine-facts
  - domain-scoped-knowledge-injection
---

# Production prompt architecture

This subject is about one narrow, load-bearing kind of prompt: the one handed to an
automated producer that must author an artifact **into a project that already exists**.
There is a real-time 3D engine at a specific version, with conventions someone chose two
years ago, with systems already built under names the producer has never seen, and with a
grader waiting on the other side. The artifact is not judged as a piece of writing. It is
judged on whether it fits.

That framing is the whole boundary. Composing a generative prompt in general — narrative
shape, reference imagery, style locking, provider choice — belongs to the generative-media
discipline; *operating* model traffic in production — telemetry, spend, judging live traces
— is a separate concern again. What follows is only the architecture of assembly: which
parts a production prompt must carry, in what order, and how they are sourced so an auditor
can check them.

## A production prompt is an assembled artifact, not a written one

The naive reading is that a prompt is text you write well. Under that reading sections
drift, two prompts for adjacent tasks diverge without anyone deciding they should, and
nobody can answer what a given prompt actually told the producer last Tuesday. The
practitioner reading is that a production prompt is **built by a builder from typed parts**,
and the builder is the only sanctioned way to produce one.

Around half a dozen parts recur, and the useful claim is not the count — it is that the set
is *closed and ordered*. Closed means adding a new kind of content is a decision someone
makes to the builder, not a paragraph someone appends at 2am. Ordered means two prompts can
be diffed section against section, an auditor can assert each section is present, and a
fitness measurement can attribute a quality change to one section rather than to "the prompt
got edited".

The order is argued from function, not from taste (fixed-section-order): context frames
every instruction read after it, project state changes what the task means, a constraint is
only interpretable once the reader knows what it constrains, and output shape sits closest
to generation because it is what the producer holds in mind as it starts writing.

Two refinements that only show up once a skeleton is real. First, a small subset of
sections is **required** and the rest are conditional: an assembler that cannot produce
project context or a task statement must fail loudly at assembly time rather than emit a
prompt with a hole in it, while a section with nothing concrete to say is omitted rather
than filled with generic boilerplate — boilerplate teaches the producer to skim sections,
which costs more than the section was worth. Second, the standing craft bar and the
per-task definition of done are not the same section and do not sit in the same place. The
standing bar — the dimensions a judge will score on — belongs immediately after the context,
where it frames the role the producer is playing. The per-task criteria belong at the end,
where they describe this artifact's finish line.

## An architecture nobody can verify adherence to is a style guide

This is the point at which most attempts fail, and it fails quietly. A team agrees on the
section skeleton, writes it down, and for a while every prompt follows it. Then a new task
arrives on a deadline, someone concatenates a prompt by hand because the builder does not
quite cover the case, and it works. Six months later a third of the production prompts are
hand-rolled, share no structure, and the skeleton document is a description of the past.

The correction is an **auditor that reads the assembled prompt text**, not the assembler. It
scans the finished string for the characteristic cues of each canonical section — heading
text, header keys, content signatures — and reports which are covered. The design detail
that decides whether this works: an audit implemented as a method on the builder can only
grade prompts that already used the builder, which is exactly the population that does not
need grading. It must run on a raw string of unknown provenance, matched by cue rather than
by exact section name, because a hand-rolled prompt phrases its headings differently and
still deserves a verdict.

The output is coverage, not a binary — *this many canonical sections populated, all required
present* — because a pass/fail check on a skeleton with legitimate exceptions gets disabled
the first time it blocks something real, while a coverage number survives. Pair it with the
rule that every required section has a corresponding **required field in the output**: a
producer told to state its wiring in a structured field can be checked downstream for having
done so, which is what makes adherence observable after generation and not only before it.

## The producer that cannot see the project will re-invent it

The single highest-value section carries the scanned current state of the project
(scanned-project-state-do-not-recreate). An automated producer with no view of what exists
is not conservative about it; it is confidently generative, and will author a perfectly
reasonable version of a system that is already there under a different name and a different
shape — after which both exist and both half-work. The failure presents not as a bad
artifact but as a good artifact the project cannot absorb, found weeks later by whoever
trips over two mechanisms doing one job.

Handing over state is therefore the mechanism that makes extension possible. Three things
travel together and none works alone: a **bounded inventory** of what exists in the relevant
scope, the **naming and structural conventions** in use as observed rather than as
documented, and an **explicit instruction** that the state is there to be extended, not
reproduced. The inventory without the instruction is ambiguous — a producer reads a list of
existing systems as context, not as a prohibition, and duplicates one anyway. The
instruction without the inventory is a wish.

The bound matters as much as the content: unbounded state is a budget spent on irrelevance,
and what goes in is what the task could plausibly collide with or must attach to. An **empty
scan is rendered explicitly**, as "nothing of this kind exists in this scope yet", never by
omitting the section — an absent section reads to a producer as unknown territory, and
unknown territory is exactly where it invents.

## Any fact about the target environment will go stale

A prompt that states a version, a subsystem's capabilities, or the presence of a feature is
stating a fact about a moving target. Typed into the prompt body, that fact is correct the
day it is written and wrong the day the project upgrades — wrong in the worst way, because
nothing fails: the producer authors against the stated environment, the artifact is
coherent, and the mismatch surfaces at integration.

So the rule is unconditional: **any claim a prompt makes about the target environment is
read from a versioned source of facts, never typed into the prompt body**
(version-keyed-engine-facts). Raise the version in the facts source and every prompt that
framed a role in terms of that environment reframes itself. The lookup fails loudly on a
version it has no entry for rather than bucketing it into the nearest known one; a silent
fall-back to the oldest supported environment is how a prompt ends up describing an
environment nobody is running.

## The producer must be shown the bar it will be graded against

A production prompt whose output goes to a grader must carry the grader's criteria, read
from the source the grader reads. Otherwise the pipeline asks the producer to guess a
standard that already exists in written form and then penalises it for guessing wrong, while
the two statements of the standard drift with neither side able to see the drift — the
authoring-time face of [`the law and the check share one
source`](../_laws.md#law-and-check-share-one-source).

So the acceptance criteria are appended to the prompt from the same source the grader reads,
and — the discipline that carries the weight — they are **appended, not replaced**
(acceptance-criteria-appended-not-replaced). A per-step or per-task criterion adds to the
standing baseline; it never overwrites it. The moment a step can supply its own criteria
wholesale, a step can quietly opt out of the baseline, and the baseline stops being a
baseline. Additive composition is what makes the standing contract enforceable at every step
without anyone auditing every step.

Two properties keep this honest. The injection path is **strictly non-authoritative**: it
renders criteria and nothing more — no re-deriving, no re-validating, no grading — so that
no verdict can move because a prompt was assembled differently. Otherwise showing the
producer the bar becomes a way of changing the bar, which is
[`no gate self-certifies`](../_laws.md#no-gate-self-certifies) wearing a different hat. And
the block is **size-capped with honest elision**: over the cap, whole items are dropped
rather than a claim truncated mid-sentence, and the prompt states how many were dropped and
why — a producer that cannot tell it is aiming at a fragment aims at it anyway.

Wiring belongs to this same closing region of the prompt. The rule that an artifact which
compiles but is never granted, registered, activated or reachable is not done is doctrine in
its own right and is owned elsewhere; what this subject owns is its **place in the
skeleton** — that every production prompt carries a wiring requirements section naming how
the output is granted, how it is activated, what it depends on, and one observable
verification that is not "it compiles" (wiring-requirements-section). A producer told only
what to build builds only that.

## Knowledge is routed by scope, and the unknown scope gets the superset

The last section is domain knowledge — the accumulated pitfalls, conventions and canon that
apply to this kind of work. Two failure modes bracket it. Inject everything and the prompt
is long, expensive, and diluted; the constraint that mattered sits at position 40 among
constraints that do not apply, and gets weighted accordingly. Inject only the obviously
relevant subset and something that genuinely applied has been dropped, silently, and the
producer cannot know it was dropped.

The resolution is three-tiered routing, and the middle tier is the one usually missing
(domain-scoped-knowledge-injection). Items carrying **no scope tag are universal** and go
into every prompt regardless of routing — this tier is what makes scoping safe to do at all,
because the items that matter everywhere are structurally exempt from being routed away.
Items tagged with domains are included when their tags intersect the task's declared scope.
And when the task's scope is **unknown or unclassifiable, the prompt receives the superset**,
not the empty set: absent classification is not evidence of irrelevance, which is the
authoring-time reading of [`unmeasured is not a
pass`](../_laws.md#unmeasured-is-not-a-pass).

That last rule carries a trap: the conservative fallback is correct and it also *hides* that
routing never happened — a whole family of builders can sit on the superset for a year, safe
and diluted, with nothing failing. Count how many assembled prompts took the fallback; a
fallback rate that is not near zero on classified work is a routing gap, not a safety
margin. The corpus of pitfalls itself is a separate subject; routing it into a prompt is the
assembly concern owned here.

The honest test for any scoping change is two-sided: it must make the prompt both **shorter
and more relevant**, because shorter alone is a regression dressed as an optimisation.
Measure both halves or you have measured neither — and whether a prompt revision actually
paid is its own adjacent subject: this one owns the structure, that one owns the
measurement.

## Failure modes worth naming

- **The prompt that reads well and integrates badly.** Excellent as prose. No project state,
  so it invents; no wiring section, so it stops at compiling; no criteria, so it aims at a
  bar it inferred — and every part of that is invisible to a reader grading the text.
- **Section creep.** Content belonging in the state section is pasted into the task section
  by whoever needed it there once. The sections still exist by name and no longer mean
  anything, and the diff between two prompt versions stops being readable.
- **The prompt nobody can reproduce.** Assembled at request time from live state and never
  recorded. When output quality moves, there is nothing to compare — record the assembled
  prompt with its inputs, or accept that no revision can ever be evaluated.
- **Criteria as encouragement.** The bar is present but phrased as aspiration rather than as
  a checkable statement addressed to the producer. A criterion the producer cannot self-check
  against before it stops writing is decoration.
