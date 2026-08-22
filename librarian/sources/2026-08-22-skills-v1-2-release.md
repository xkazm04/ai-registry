---
source: youtube
url: https://www.youtube.com/watch?v=gaDdrDdczO4
title: "New Skills! v1.2 brings /wait-what, /writing-for-agents, and fixes /grill-me"
author: Matt Pocock
kind: practitioner-deep-dive (sub-class: skill-library release walkthrough)
mined_on: 2026-08-22
words: 2514
skill_version: 0.4.0
extracted: 10
picked: 7
accepted: 5
already_covered: 2
declined: 0
leads: 0
untriaged: 3
dispatched: 0
---

# Skills v1.2 release walkthrough, 2026-08-22 - three techniques, two amendments, two catches

Fourth run, second of the first-party practitioner class, and a sub-class worth naming
on its own: **a release walkthrough of a skill library** - a practitioner describing the
exact artifact type this registry's `skills/` lane holds, one version at a time, with
the reason for each change.

That shape has a property the DeepWiki talk did not. A release walkthrough is organised
around *changes*, and a change carries its own motivation: the author says what was
wrong before. Three of the five accepted findings came from that structure rather than
from the feature being described - the failure mode is stated out loud because it is the
reason the release exists.

## Accepted

### 6 - Frontier-batched elicitation -> `wizard-flows / frontier-batched-elicitation`

The strongest finding, and the one whose value is a **boundary**, not a rule.

`ai-driven-elicitation` owns what to ask and how coverage is measured inside a step; the
turn economics - how many questions a turn may carry and which - had no owner. Both
naive policies fail at opposite ends: one-per-turn is safe because every question is
asked with its prerequisites answered, and it fails at the tail where the contested
decisions are behind you and a long run of obvious confirmations is served one round
trip at a time. All-at-once removes the round trips and reintroduces exactly what the
ordering prevented.

The resolution is the graph the flow already holds: ask every question whose
dependencies are satisfied, in one turn, recompute the frontier, repeat. Batch size is
*derived*, not tuned, and varies by round on purpose.

The half doing most of the work is the second one, which the source demonstrates without
naming: each question ships the answer the system would choose. That converts the user's
job from **composition** to **adjudication** - eleven questions with no proposals is a
homework assignment, eleven with proposals is a review.

**And the tension is the finding.** Another bundle carries `one-question-per-turn-and-wait`
as a technique, argued well: a stacked turn is answered on one question, the others are
unasked-in-fact but asked-on-the-record, the instrument becomes self-selected, and the
most fluent respondents steer hardest to prepared ground. Those harms are real and none
of them transfer here, because they are harms of **measuring a person**. The
discriminator is one question - is the flow finding out what this person knows, or how
good they are? - and it is now written down on the elicitation side. Cross-bundle links
are forbidden, so it is stated as a boundary condition rather than a citation, which is
the correct handling and worth remembering the next time a rule inverts across bundles.

### 7 + 8b - Human-performed steps -> `hitl-approval / human-performed-steps`

`hitl-approval` explicitly enumerates **two** flows that are mirror images - review gates
output after it exists, consent gates action before it happens - and in both the human
decides while the machine acts. The source demonstrates a **third**: the machine must not
perform the step at all, so the human does. Credentials nobody should hand to a process,
an action bound to a person's identity, a physical act, terms that bind the human rather
than their tools.

A subject that names its own completeness ("two flows that are mirror images of each
other") is unusually good ground for a finding, because the third case is visible the
moment somebody demonstrates it.

The technique's argument: prose instructions are the wrong artifact, and "write clearer
instructions" is the wrong fix. Prose hands the person the *whole* task - position
tracking, retyping values the machine already holds, judging success - when the human was
needed for **authority**, not bookkeeping. The right artifact is an executable runbook,
and it must be **deterministic**: written by a model, never run by one. That is what makes
it reviewable before a production credential is pasted in, and what keeps the credential
off any inference path. The source states this property in one aside ("nothing's touching
an agent here") and it is the security half of the whole idea.

`8b` folded in as the closing section rather than becoming its own technique, since the
user picked the deprecation-condition and not the questionnaire export. A capability that
exists only to compensate for a tooling gap is created state whose reaper is a
**condition**, not a schedule: *this exists because X; when X is no longer true, delete
it* - written at creation, when the author still knows why. A workaround whose reason has
been forgotten is indistinguishable from a design decision, which is how a temporary
bridge becomes infrastructure nobody dares remove.

### 5 - House vocabulary layer -> `prompt-assembly / house-vocabulary-layer`

The source's sharpest single line, and it inverts the obvious reading: "the real cure for
verbosity is not to tell it to use simple language, it is to tell it to use *your*
language."

Verbose generic output is not a style defect, it is an **ungrounded** one. A model with
no name for the thing it is discussing falls back on general language, and general
language is verbose by construction - where a domain has a word, prose without that word
needs a clause. Instructing brevity while withholding the vocabulary asks it to compress a
description of something it has no name for.

Three consequences the technique adds: it compresses without dropping content, unlike a
length instruction which cannot know what mattered; it is *checkable* ("did it use our
term or invent one?" is nearly an assertion, where "was this concise?" is a judgment); and
a model that renames a concept has shown it is not reasoning about the same object the
team is, so **the verbosity was a diagnostic** and treating it as style suppresses the
signal.

Third sighting of the vocabulary/glossary thread (run 3's `canonical-terminology-glossary`
fragment, this source's linked dictionary, and this). It is now landed on the consumption
side; the production side remains in the subject proposal.

### 3 - A restrictive declaration inverts when ignored -> `repo-manifest-standard / must-ignore-unknown` (amended)

The subtlest finding of the four runs so far, and it sits inside a well-forged technique
rather than in a gap.

`must-ignore-unknown` is correct: a conforming reader ignores what it does not recognise,
and its three strictness exceptions (contract version, wrong type of a known field,
missing required field) are the right ones. What none of them covers is that ignoring is
safe for **descriptive** fields and inverting for **restrictive** ones. `do not load this
automatically` ignored does not make the reader do less - it makes it do the exact thing
the field existed to prevent. The declaration fails **open**, and the more conformant the
reader, the more completely.

The obligations therefore fall on the author, not the reader: know which readers honour a
restriction before relying on it, express it in each runtime's own vocabulary as a
per-consumer artifact beside the neutral one (`consumer-overlays`' split applied to
behaviour instead of configuration), and where the format allows a choice, design
restrictions so that an ignoring reader lands on the safer behaviour.

### 2 - The adoption rule, read in the pull direction -> `knowledge-registry / propose-then-adopt` (amended)

Picked as a `correction` and it was one. `propose-then-adopt` states the governance model
- tools propose, people adopt, merging is what adoption means - entirely as a constraint
on *writing into* a registry. The source demonstrates the same act performed from the
other end: a subscribed bundle that auto-updates moves the adoption decision to the
publisher, so a merge in the publisher's repository changes what a consumer's agent does
with nobody there to review it.

This registry already forbids that in its own declaration
(`version_breaks_ties_across_tiers: false`), with the reason stated. What was missing was
the *knowledge* half, so the technique now carries the read-side mirror and the
distinction that makes it tractable: **data may follow** (a catalog, an index - refreshing
changes what a consumer can see), **instructions are adopted** (a skill, a policy -
refreshing changes what a consumer does). Auto-pull is not forbidden; it is a declared
choice with a cost, and what must never happen is that choice arriving as a side effect of
how the artifact was installed.

## Already covered (catches)

### 4 - Always-loaded capability descriptions tax every turn

Picked against my read, and it confirmed as a catch. `mcp-tools` says it plainly - "every
tool listed is prompt space spent... selection quality degrades as the catalog grows" -
and answers it with progressive discovery, "load what the task plausibly needs, not
everything that exists". The source's distinctive half is the *declaration* side (an
author marking one capability as never-auto-loaded) rather than the discovery side, and
that half went into finding `3`, which is where it belongs.

### 1 - A skill library needs a flow view and a reference view

Rated thin at the table and not picked. Recorded because the dictionary half of it is
already folded into run 3's subject proposal as `canonical-terminology-glossary`, and a
future run should not re-derive it.

## Not done, and deliberately

- **Still no applications.** Four runs, eleven techniques, zero `<stack>--` documents. The
  cross-repo lane has now been available and unexercised in four consecutive runs. This is
  no longer a note; it is the method's defining gap.
- **No fetches.** Second consecutive run where the corroboration budget went entirely
  unused, for the same reason: a first-party account needs no lane to confirm what its
  author did.

## For the next run

- **A release walkthrough states its own failure modes.** The author explains what was
  wrong before each change, which is the most extractable structure any source has offered
  so far - better than a feature demo, because a feature demo shows the solution and hides
  the problem. Worth seeking out as a class.
- **A subject that declares its own completeness is a good hunting ground.** `hitl-approval`
  says it owns "two flows that are mirror images of each other". An enumeration invites
  exactly one question, and asking it found the third.
- **Two of five accepted findings were amendments, not new techniques.** Earlier runs
  landed almost only new techniques. Amending a well-forged technique with the case it
  does not cover may be the higher-yield move in a mature corpus, and it is cheaper.
