---
layer: technique
type: technique
subject: public-claim-provenance
technique: provenance-as-a-build-gate
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a provenance rule keeps being restated in review and keeps being violated, designing a lint rule that must not cry wolf across an existing surface, packaging one team's editorial doctrine so another team can adopt it]
---

# Provenance as a build gate

Every other technique in this subject states an invariant and asserts it where
the value lives — at the declaration, in the build that reduces the catalog,
at the render site that reads a load state. All of that is runtime, and all of
it presumes somebody wired it up. The move this technique adds is earlier and
blunter: **make the invariant statically unshippable**. A rendered figure with
no provenance marker anywhere near it is not a review comment, it is a failing
build, and the doctrine stops depending on whether the reviewer that morning
happened to be the one who cares about it.

The reason to reach for this is not that reviewers are unreliable. It is that
a provenance rule is the *easiest* rule in a codebase to violate in good
faith: the author is adding a number to a page, the number is correct, the
page renders, and nothing in the world objects. A rule that is only ever
restated — in a style guide, in a definition of done, in the last three pull
request threads — is being restated *because* it keeps being violated, and the
restatement is the thing that has already failed. Give it an observable
output.

## The rule fires on positive evidence, or it fires on everything

A gate must observe the thing it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and the thing this
gate must observe is *a formatted domain number rendered to a reader*. Nothing
in a syntax tree says that. What a static rule can see is a numeric literal, a
call, a JSX position — and the naive rule takes the first of those, flags
every number in the render tree, and dies within a week under array indices,
column counts, grid spans and animation durations.

The discipline is to trigger only where there is **positive evidence** that
the value is a claim, and to accept that everything without such evidence goes
unflagged. In practice this means the rule stands on a formatting chokepoint:
if all reader-facing number formatting goes through one module, then a call to
one of that module's formatters *is* the evidence, and the rule's trigger set
becomes enumerable — a formatter call in child position inside a component
that imports the chokepoint, a call to a formatter name imported from it,
a canonical display component that exists for exactly this purpose. Three
consequences follow, and each is a decision worth making explicitly:

- **A rule about claims needs a chokepoint to point at.** The provenance gate
  and the "formatting happens in one place" gate are a pair; the second is not
  a stylistic companion to the first, it is what makes the first decidable.
  Adopt them together or the trigger set collapses back to "any number".
- **Position is part of the trigger.** The same formatter call in a JSX
  attribute — an accessible label, a tooltip, a sort key — is not a rendered
  claim, and flagging it teaches contributors that the rule does not
  understand their code. Distinguish child position from attribute position in
  the rule itself.
- **Some formatting is context, not claim.** A date is the standard case: it
  runs through the same chokepoint and is not a number the reader is being
  asked to believe something about. Exclude it by name, at the trigger, with
  the reason written beside the exclusion.

Recall is deliberately sacrificed here, and the argument for that trade is the
false-positive economics of any rule that runs on every build: a rule with
one wrong flag per week is argued about, a rule with ten is disabled, and a
disabled rule protects nothing while looking like protection. A precise rule
that catches most of the class outperforms a complete rule that is switched
off, and the same reasoning governs how the rule is rolled out across an
existing surface — see quality-gates' treatment of false-positive economics
for the general form.

## Satisfiers are file-scoped, and the exception is annotated

The obvious implementation checks the JSX subtree: the figure and its
provenance marker must be siblings or ancestors. It flags exactly the correct
layouts. Real surfaces put the figure in a leaf and the source note in a
caption two branches over, or in a footer beneath the whole card, and a
subtree walk sees an uncited leaf every time.

So the satisfier is **file scope**: a provenance element anywhere in the same
module discharges every figure in it. That is coarser than the truth, and it
is the right coarseness — it flags the file that has no provenance anywhere,
which is the file that has the defect, and stays quiet about the layout.

Its real limit is a citation that lives in a *different* file, in a parent
component that composes the leaf. No file-scoped rule can see that, and this
is where the per-site annotation earns its place: a comment on the flagged
line carrying a **reason**, not a suppression. The distinction is the same one
the subject draws about labels — a bare disable directive is a status, an
annotation reading "the source note is rendered by the parent card" is a
claim that a reviewer can check and a later refactor can falsify.

## The escape hatch is disclosed to the reader, not to the linter

Every gate needs a legitimate exit, or contributors invent illegitimate ones.
The exit that matters here is for a value that genuinely has no source yet,
and the design rule is that taking it must **cost the same thing on the page
that it saves in the build**: the marker that satisfies lint is accepted on
the condition that the element renders a visible "no source" badge to the
reader. The waiver is disclosed at the surface, not filed against the tool.

An escape hatch that is silent on the page is the failure mode this rule was
built to prevent, arrived at through the rule's own door
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). It converts
an uncited number into an uncited number with a green build, and it will be
reached for exactly by the author in a hurry whose value most needed the
label. Where the reader-visible condition cannot itself be checked
statically — usually it cannot, since it is a claim about what a component
renders — say so at the rule, in the same breath as the escape hatch, so the
convention is written down where the person using it is looking.

## The doctrine travels as a package, and severity travels separately

A rule set written inline in one repository's configuration is one
repository's rule set. Extracting it into a dependency-free plugin with its
own tests and per-rule documentation is what makes the doctrine adoptable, and
the extraction changes what the rules have to say about themselves: each rule
doc must state **when it fires**, **what its escape hatches are**, and **which
project-specific constants an adopter has to remap** — the chokepoint module's
path, the names of the provenance components, the display component. A rule
that cannot name its remappable parts is not portable, it is just published.

Package the severities as a ladder of two, and split them by *portability
rather than strictness*: one preset carrying the discipline any project can
adopt unchanged, one adding the rules that only make sense against a
particular doctrine and a particular component vocabulary. That axis is worth
distinguishing from the more familiar ladder that varies one rule's severity
across environments or rungs of a maturity scale — this ladder holds severity
fixed and varies the *adopter*, so a project takes the second rung when it has
the shape the rules assume, not when it has matured into deserving them.

Inside the originating repository, consume the package rather than the
original files: leave the old rule paths in place as one-line re-exports so
existing configuration keeps working, and let the package be the single
implementation. Two copies of a rule is the ordinary drift hazard plus a
worse one, since the copy that keeps running is the one nobody is maintaining.

## Decision rules

- **When the rule lands on an existing surface, ladder the severity by zone
  and only downward in exemption.** Measure the violation inventory first,
  set the rule to a warning where the inventory lives, and set it to an error
  in the directories measured clean — so the clean part cannot regress while
  the rest burns down. Record the inventory count and the date beside the
  configuration; without them nobody can tell whether the burn-down is
  happening.
- **When an exemption zone is proposed, the answer is to fix the code.** An
  exemption written as temporary outlives the reason, and the measured cost is
  concrete: a carve-out kept "until the in-flight rework lands" hid a real
  defect of exactly the class the rule existed for. Zones shrink; they do not
  widen.
- **When the rule flags something correct, fix the trigger, not the file.**
  Adding an annotation to a correct site is how the rule's precision quietly
  becomes the annotation count, and the annotations then read as noise rather
  than as the few real cross-file cases they were built for.
- **When a rule has no test, it has no behaviour.** Trigger sets this specific
  are refactored blind otherwise. The rule set needs its own runner wired into
  the same composite gate as type-checking and tests, or a tightening pass
  silently changes what fires.

## When not to use it

Do not build this before the chokepoint exists. Without one module that owns
reader-facing formatting, there is no positive evidence to trigger on, and
the only rules available are the imprecise ones this technique exists to
avoid — the correct first move is then the chokepoint, and the provenance gate
follows it.

Do not point it at surfaces where numbers are not claims: internal consoles,
debugging views, fixtures, an archived art-direction zone. Provenance is owed
to a reader who cannot check, and a gate that fires where nobody is being
asked to believe anything spends the credibility the gate needs elsewhere.

And do not mistake a green board for a cited surface. The gate proves that
each file rendering a figure contains *something* claiming to be provenance;
it cannot prove that marker describes that figure, that the source it names is
the source the value came from, or that the number derives from anything at
all. It closes the class where nobody thought about provenance — which is most
of the class — and leaves the rest to the techniques that assert the invariant
at the value.
