---
layer: technique
type: technique
subject: people-analytics-ethics
technique: risk-framing-anonymization
status: forged
laws: [deletion-is-not-repair]
shared_with: []
use_when: [a metric labels a person a risk or a gap, deciding whether a finding may carry a name, rewriting a person-shaped claim as an artifact-shaped one]
---

# Risk framing anonymization

Some findings may carry a human name and some may not, and the discriminator
is not the data — it is the **framing**. This technique is the test that
decides, and the rewrite that follows when the test fails: restate the claim
so its subject is an artifact, and drop the name entirely rather than
softening the label.

## The test

For a proposed output that would name a person, ask three questions in order.
A single no ends it.

1. **Does the name carry decision value the artifact phrasing cannot?** Write
   the same finding about the repository, component, service, or queue. If
   the reader's next action is unchanged, the name is decoration and the
   artifact phrasing wins. This is the question that resolves most cases:
   *this area has one maintainer and no second reviewer* prompts exactly the
   same response as naming the maintainer, and the naming adds only the
   ability to point at someone in a leadership review as a liability.
2. **Is the framing one a name survives?** Credit, participation, and
   authorship survive naming; **risk, deficit, gap, dependency, and
   under-performance do not.** A risk framing is where a name stops being
   descriptive and starts being an accusation — the reader receives it as a
   judgment about the person, not about the system, no matter how the caption
   is worded.
3. **Would the named person recognize the claim as fair with the evidence
   shown?** The metric's inputs are proxies — commits, reviews, tickets — and
   proxies carry the invisible work badly. If the finding could be explained
   by mentoring, on-call, incident work, parental leave, or an assignment the
   person did not choose, the finding is about the assignment, not the
   person.

Passing all three permits a name. It does not require one: the artifact
phrasing remains available and is usually the better product.

## The rewrite

When the test fails, move the subject of the sentence rather than obscuring
the object.

- **Change the subject to the artifact.** *This engineer is a key-person
  risk* becomes *this component depends on a single contributor*. The
  liability now attaches to a thing the organization owns and can fix by
  staffing, documentation, or review policy — which was always the intended
  action.
- **Do not substitute a pseudonym.** "Contributor A" in a group of eight is
  re-identified by the areas Contributor A touches. Pseudonymizing a blame
  claim preserves the blame and adds a puzzle.
- **Do not soften the label and keep the name.** Renaming *risk* to
  *opportunity* while the row still says who does not change what the reader
  writes down.
- **Withhold the proxy label too.** If the finding is suppressed but the
  surface still shows the sole owner, the top reviewer, or the only person
  on-call for that area, the name has been published by another route.
- **Keep the individual's own version.** A person may legitimately see *you
  are the only recent contributor to this area* in their private view, where
  it is actionable information rather than a report to their management
  chain.

## The deliberate asymmetry

A system may name people in one panel and refuse to name them in the panel
beside it, computed from the same rows: an attribution table that credits
authors, and a concentration-risk panel that speaks only of components. This
looks like an inconsistency to be tidied up, and it will be tidied up by
someone who does not know why it is there. Two defenses, both required: state
the asymmetry in a comment at the computation site, in the form *this is
phrased about the artifact deliberately, because a name here would add
liability without adding decision value*; and make the risk producer
structurally unable to return an identity, so the tidy-up cannot be
accomplished by editing a template.

## Decision rules

- **When a metric's name contains "risk", "gap", "debt", or "factor", assume
  no name until proven otherwise.** These words are the vocabulary of
  liability.
- **When leadership requests the named version explicitly, ask what they will
  do with the name.** If the answer is a staffing, documentation, or review
  change, the artifact phrasing serves it. If the answer is a conversation
  about a person's performance, that conversation belongs to a review process
  with representation and appeal, not to a dashboard export.
- **When the finding is celebratory, the floor still applies.** A name may
  appear, but only over a population and volume large enough that appearing
  means something ([contribution-eligibility-floors](./contribution-eligibility-floors.md)).
- **When in doubt, publish the artifact phrasing and the aggregate**, and let
  the reader who genuinely needs a person go find one by asking a human.

## When not to use it

- **Provenance of actions taken.** A record of who performed a privileged
  operation is not a risk framing to be anonymized; it is a deliberate,
  retained fact with a different purpose and a different governing subject.
  Applying this rewrite there destroys accountability rather than protecting
  a person.
- **Attribution and credit surfaces**, where naming is the point and the
  person benefits — subject to floors, not to this rewrite.
- **The person's own private view**, where a risk statement about their own
  concentration is useful to them and reaches nobody else.
- **As a way to avoid an uncomfortable true finding.** If a component really
  is undocumented and single-threaded, say so loudly about the component.
  The technique moves the subject of the sentence; it does not delete the
  sentence ([law: deletion is not repair](../../../../_laws.md#deletion-is-not-repair)).
