---
layer: technique
type: technique
subject: repository-landing-document
technique: style-rule-ships-its-detector
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [writing or reviewing a house style guide for a project's public prose, a style rule keeps being violated and re-explained at review, deciding whether a taste preference deserves to be a rule]
---

# A style rule ships with the command that finds its violations

A house style guide is a set of claims about a corpus, and an unenforceable
claim about a corpus is false within about two months of being written. The
mechanism is not carelessness. A rule that lives only in prose is checked only
by a reviewer who has read the prose, remembers the rule, and is willing to
spend social capital on it during a review of something else — and that
conjunction fails first under time pressure, which is exactly when prose gets
written fastest. The rule is then violated, the violation ships, and the next
author reads the shipped text as the standard, because shipped text is the
only standard anybody actually consults.

An unenforced style rule is therefore
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) in its
purest form: a guard that must be remembered rather than engaged is a guard
that protects the examples and not the corpus. Either it engages on its own,
or its absence is a visible decision — and "we have a style guide" is neither.

## The admission test

> **A rule may enter the house style only if a violation of it can be found by
> a command a reviewer can run.**

That is a test on the rule, not on the project's tooling maturity, and it is
severe on purpose. It rejects most of what people want to put in a style
guide, and what it rejects is worth looking at: *write clearly*, *be concise*,
*avoid marketing language*, *prefer active voice*. Each is good advice and
none is a rule, because no command distinguishes compliance from violation,
which means no reviewer can either. Advice of this kind belongs in the guide's
prose as advice, explicitly labelled as such, so nobody mistakes it for
something a contributor can be held to.

What survives the test is narrower and much more useful than it looks:
character-level bans, structural requirements, forbidden constructs outside
declared regions, required attributes on a class of element, closed
vocabularies. A ban on a particular dash character in prose is detectable. A
rule that every colour literal must appear inside one declared block is
detectable. A rule that every quoted snippet carries a source attribute is
detectable. Each of these was, before it acquired its detector, an opinion
somebody restated at review.

## The detector observes the artifact, not a proxy

A detector that reads something other than the shipped document passes exactly
when the two diverge, which is
[gate-sees-target](../../../../_laws.md#gate-sees-target) at its most
mundane. In practice this means the search runs over the **rendered or shipped
artifact** where the rule is about what a reader sees, and over the **source**
where the rule is about what an author wrote — and the choice between them is
part of the rule. A rule about a forbidden character in prose is a source
rule. A rule about how long an unbroken prose run may be is a rendered rule,
and running it over the source counts markup lines and reports nonsense.

The corresponding trap: a detector that reports *nothing found* on a document
it could not parse is indistinguishable from one that found nothing, and it
will read as compliance for as long as nobody checks. Give the detector a
known violation and confirm it fires before believing a clean run.

## The carve-outs are inside the detector

This is the clause that decides whether the technique survives its first
month, and it is the one most often left out.

Every real style rule has exceptions. A ban on a character in prose must
exempt that character where it appears inside a verbatim quotation of source,
because editing quoted code to satisfy a prose rule corrupts the quotation —
which is a much worse defect than the one being fixed. A rule confining colour
literals to a single declared block must exempt the values baked into a
rendered vector image and the values inside verbatim snippets, for the same
reason.

If those exceptions live in a reviewer's head, every run of the detector
produces a list of hits that must then be adjudicated by a conversation, and
detectors that provoke conversations stop being run within a quarter. So:
**the carve-out is expressed in the detector, and the rule's written form
states the carve-out as part of the rule rather than as a dispensation.** The
practical shape is a rule stated with its own verification sentence — *every
hit must be inside a verbatim quoted region; hits in prose are defects* —
which is simultaneously the rule, the exception, and the procedure for
applying both.

A carve-out that cannot be expressed mechanically is a signal about the rule,
not about the tooling. If the exception is *unless it reads better*, the rule
failed the admission test and was admitted anyway.

## Where the numbers live

A detector encoding a threshold that appears nowhere in the written rule has
made itself the standard, and a standard that exists only as a constant in a
script is one nobody agreed to, nobody can argue with, and nobody will
recognise as arguable when it starts producing wrong findings. **The written
rule states the number; the detector reads it.** When the number turns out to
be wrong, the argument happens over a sentence in the guide, which is where
arguments about standards belong, and the instrument follows.

The inverse — a rule stating a number the detector rounds differently, counts
on a different unit, or applies to a different region — is the same defect
seen from the other end, and it is caught the same way: the rule and the
detector are written and changed in the same edit, always, because the moment
they can drift apart one of them is lying and the reader cannot tell which.

## What to do with the rule that cannot be detected

Do not smuggle it in. The choices are: **weaken it** into something detectable
that captures most of the value — *no more than one adjective before a noun in
a heading* is a poor proxy for *no marketing language* but it is a real rule,
and a real narrow rule beats an unreal broad one; **move it** into an
explicitly-labelled advice section that carries no enforcement claim; or
**drop it**. What must not happen is a guide in which enforced and unenforced
rules sit in one undifferentiated list, because a reader cannot tell them
apart, discovers by experience that some are unenforced, and rationally begins
treating all of them that way — the same laundering a mixed badge row performs
on a landing document's claims.

## When the whole technique is overhead

A single-author project with no contributors has no enforcement problem: the
style guide and the person are the same entity, and building detectors for an
audience of oneself is tooling for a failure that has not happened. The
technique starts paying at the **second regular author**, and pays most where
the second author is not a person at all — an automated contributor applies a
written rule with perfect consistency and zero judgment, which means a rule it
can be handed as a command is followed exactly, and a rule stated only as
prose is followed approximately and confidently.
