---
layer: technique
type: technique
subject: web-scraping
technique: negotiated-representation-probe
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [about to author extraction rules against a page, the target has no API but might publish an alternate representation, deciding whether a machine-readable variant of a page replaces scraping or merely cheapens it, a long-stable rule set collapses after a redesign]
---

# Negotiated-representation probe

The acquire stage of a scraper has, in most implementations, exactly two
modes: fetch the markup, or drive a rendering engine when the markup is
assembled by script. Both begin from the same unexamined premise — that the
document painted for a browser is the only thing this server will hand out.
That premise is a *default*, not a finding, and the protocol has carried the
means to test it since long before anyone wanted to feed a page to a machine.

This technique is the test. Before a single rule is authored, **ask the
server for the representation you actually want, and classify the answer** —
because the three answers it can give are three different projects with
three different cost structures, and choosing rules infrastructure without
asking is choosing the most expensive of them by accident.

## The probe

One request, before the rule editor opens:

- Send a preference on the request, weighted, with the browser
  representation retained as an acceptable fallback rather than excluded.
  Excluding it converts "no alternate here" from a cheap negative into a
  refusal you then have to special-case.
- Read the **response's** declared type. Not the body, not the file
  extension, not the fact that you asked.
- Ask separately for the resource's advertised alternates — the link
  relation for an alternate representation carries a type attribute, which
  is the server telling you what else exists at a cost of one round trip and
  no parsing.
- Note whether the response declares that the selection varied on your
  preference. A negotiated response that does not say so is a caching
  hazard before it is anything else, and it is also weak evidence that the
  variation was deliberate.

The probe is cheap enough that its result belongs in the target's record
beside the rules, dated, so the next author does not re-derive it.

## Three answers, three different projects

The distinction that decides everything is **where the alternate
representation was authored**, and it is invisible in the body. Two
responses can be byte-similar and belong to different projects.

**Authored at the origin.** The publisher writes and maintains the
machine-readable representation as its own artifact. This is not scraping
and should not be built as scraping: it is the *feed* branch of this
subject's alternatives ladder. Someone committed to a shape, and a change to
it is a change someone made on purpose and can be told about. Rules
infrastructure here is overhead — parse the representation and validate it.

**Derived from the same markup, on the fly.** An intermediary or the origin
converts the browser document into the requested type per request. This is
the common case in managed offerings, and it is the one that is routinely
misread as the first. It is a **derived value**, and the law applies without
softening: its recomputation path is "convert today's markup", so it
inherits every property of today's markup, including the one this subject
exists to survive. A redesign changes it exactly as much as it changes the
markup. What you have bought is real but narrow — the parse stage gets
cheaper and the extracted text stops carrying navigation chrome — and what
you have bought nothing against is the shape-change adversary.

> A derived representation relieves the parse stage. It does not create a
> contract, because nobody wrote one.

**Ignored.** The server disregards the preference and sends the browser
representation. This is not a malfunction and must not be handled as one:
the standard explicitly permits an origin either to honour an unsatisfiable
preference with a refusal status or to disregard it and answer as though no
negotiation had been requested. A client cannot rely on its preference being
honoured, and a probe that reads its own request instead of the response
will report an alternate that never arrived — unknown-is-not-a-value, at the
boundary where "what I asked for" is laundered into "what I have".

## The trap this technique exists to close

The failure is not "the probe was never run". It is the probe being run,
returning the derived case, and the pipeline being *relaxed* on the strength
of it — required-field tripwires loosened because the text looks clean now,
hit-rate baselines abandoned because there are no selectors left to count.
That converts a shape-change detector into a shape-change blindfold, and it
does so at the moment the input format looks most trustworthy.

Classify first, then decide what may be relaxed:

| Answer | Rules infrastructure | Shape-change instruments |
| --- | --- | --- |
| authored at origin | not needed — validate a stated shape | required-field validation, on a stated schema |
| derived on the fly | reduced: address structure, not markup | **unchanged — all of them** |
| ignored | full | full |

The middle row is the whole technique. Everything about this subject's
honesty law survives into it: an extraction that yields nothing from a
converted document is still indistinguishable from a page that genuinely
lists nothing, and it is still the most expensive lie the pipeline can tell.

## Probe again on the alarm

Representations appear over time, and the moment they are most likely to
have appeared is the moment the rules break — a redesign is a publishing
change, and publishing changes are when an owner adds machine-readable
output. So the probe is not only an authoring-time step: it belongs in the
response loop beside re-authoring, as the first question asked of a
quarantined target. A rule set rebuilt against markup that now has an
authored alternate is a month of maintenance nobody needed to sign up for.

## Two smaller consequences worth engineering

**Your own cache keys.** A fetch cache keyed on the address alone will
serve one representation to a consumer expecting the other, and the
collision is silent in both directions. If the acquire stage can request
more than one type, the requested type is part of the key.

**The type parameters are not decoration.** The registered media type for
the format most of these representations use requires a character-set
parameter and has no default, and it carries an optional variant hint whose
whole purpose is to say which dialect was intended — a receiver is under no
obligation to honour the hint, and dialects degrade against each other in
the direction of silently losing structure. A response that omits both is
telling you less than it appears to, and a table that arrives as prose is a
required-field miss with a plausible-looking cause.
