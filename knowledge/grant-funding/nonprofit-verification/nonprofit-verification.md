---
layer: golden-path
type: golden-path
subject: nonprofit-verification
status: forged
use_when: [proving an applicant organization is real and in good standing before grant work begins, wiring a public registry or sanctions list into an eligibility pipeline, deciding whether a missing record should block an applicant, aggregating several registry checks into one verdict a funder can trust]
techniques:
  - registry-adapter-contract
  - determinate-vs-inconclusive-outcomes
  - identifier-checksum-prevalidation
  - registry-name-binding
  - graceful-source-degradation
  - verification-passport
---

# Nonprofit verification

Nonprofit verification answers a question that precedes every other question in
grants work: **is this applicant a real organization, in good standing, that is
who it says it is?** Everything downstream — eligibility gates, fit scores,
proposal drafting, the funder's own due diligence — assumes an answer. Get it
wrong in one direction and money flows to a dissolved shell or a sanctioned
name; get it wrong in the other and a legitimate young charity is silently
locked out of the funding it exists to receive. The craft of the subject is
holding both error costs in view at once, because almost every design shortcut
optimizes one at the expense of the other.

The naive reading treats verification as a lookup: query a registry by
identifier, get back "found" or "not found", map found to verified. Every part
of that sentence hides a failure mode. There is never one registry — a real
verification runs the national business register, the tax authority's
exempt-organization list, the annual-filing index, the sanctions list, and
sometimes a federal-contractor registration, and these sources answer
*different questions* with *different polarities*. "Found" is not one state —
an organization can exist but be dissolved, exist but be the wrong legal form,
exist under a name that does not match the one the user typed. And "not found"
is the most treacherous state of all, because for some sources absence is a
disqualifier and for others absence is the normal condition of a perfectly
legitimate applicant.

## The three-valued verdict is the foundation

Every check must return one of exactly three outcomes, and the middle one is
the load-bearing invention:

- **Pass** — the source affirmatively confirmed good standing. A positive
  signal, earned by evidence.
- **Fail** — the source returned a *determinate disqualifier*: the identifier
  belongs to no registered entity, the entity is dissolved, the entity is the
  wrong kind for charitable funding, or the name hits the sanctions list.
  A fail blocks, and it blocks on evidence.
- **Inconclusive** — the source ran but could not decide (network failure,
  unparseable response, source not configured or not yet built), *or* the
  negative it found is not actually a disqualifier. Inconclusive never blocks
  and never helps.

The second half of the inconclusive definition is where principal judgement
lives, because it encodes domain knowledge no generic error-handling pattern
supplies: **absence of a record is only a disqualifier when the record is one
every legitimate applicant would have.** A foundation-funded organization has
no federal-contractor registration, because that registration exists only for
entities receiving government awards — its absence says nothing. A charity
recognized as exempt last year has filed no annual return yet, because the
first filing is not due — its absence says nothing. Collapse either of those
absences into "fail" and the pipeline structurally discriminates against
exactly the organizations — young, small, foundation-funded — that grant
programs most often exist to reach. Each source's polarity (what its positive
means, and whether its negative disqualifies) is a per-source editorial
decision made once, in the adapter, by someone who understands what the
source is *for*.

## Identity is a binding, not a lookup

A registry confirms that an *identifier* is real. The user types a *name*
freely. If the two are never bound together, a bad actor pairs a valid
identifier belonging to one real nonprofit with any name they like and mints
a verified credential impersonating it — the check passes on every axis while
certifying a lie. Verification is therefore always a three-way binding:
the claimed identifier resolves in the registry, the registry returns its
canonical name, and the claimed name matches that canonical name after
normalizing away everything that carries no identity (case, diacritics,
punctuation, and the legal-form suffix words that make "Foundation X, Inc."
and "X" the same organization). A name mismatch is not a soft warning to
decorate the result with — it must veto the verdict even when every
registry check individually passed, because it is precisely the signature of
impersonation. The same binding discipline extends to legal form: when the
registry reports the entity's registered form, reconcile it against what the
applicant self-declared, and surface disagreement rather than silently
preferring either.

## Determinate evidence only, aggregated honestly

Many sources produce many partial answers; the subject's second half is
turning them into one defensible verdict. The aggregation rule that survives
adversarial review is austere: **eligible when at least one source
affirmatively confirmed good standing, no source returned a determinate
disqualifier, and the claimed name is not a registry mismatch.** Each clause
closes a distinct hole. Requiring at least one pass means a run where every
source errored out cannot certify anyone — zero findings is not a clean bill
when zero checks decided. Requiring zero fails means no accumulation of
passes can outvote a sanctions hit or a dissolution record; determinate
disqualifiers are gates, not score components. And the name clause means the
impersonation guard cannot be averaged away.

Any confidence score published alongside the verdict is computed over
*determinate* results only. Dividing passes by all sources run lets a
transient network error or an unbuilt source dilute a legitimate
organization's score — punishing the applicant for the pipeline's weather.
Dividing passes by decided results keeps the score an honest statement about
evidence.

Sanctions screening deserves its own sentence of respect: it is the one
source whose *hit* is not a verdict but a tripwire. A potential match on the
sanctions list is a determinate block — funds must not move — but it resolves
to *manual review*, not to an automated "this organization is a sanctioned
entity" claim, because list screening matches names, names collide, and a
false accusation published by software is its own category of harm.

## Degrade visibly, never silently

Registry coverage is permanently uneven. Some jurisdictions expose a free,
key-free national API; some require credentials; some have no machine
interface at all. Some sources in the roster are built; others are declared
on the jurisdiction's profile but not yet implemented. The discipline is that
every declared source appears in every result — the built ones with real
outcomes, the unbuilt or unconfigured ones as explicit inconclusives that say
so. "Coming soon" must never be rendered as a pass, and must never be
silently omitted so the verdict *looks* complete over a thinner check set
than the jurisdiction demands. The consumer of a verification can always see
which checks ran, which decided, and which are structurally absent — coverage
is part of the verdict.

The same visibility rule governs upstream misbehavior. Public registries
return partial payloads, and a partial payload is indistinguishable from a
sparse-but-genuine record unless the adapter refuses to guess: a response
that carries neither a name nor any registration status is a retryable
error, not a cached negative. Caching a guess converts a five-second upstream
hiccup into an hour of a legitimate organization being told it is dissolved.
And the promotion rules are asymmetric on purpose — an empty or unclear
registration status degrades toward "not confirmed active", never upward to
active, because a false verified badge is the costlier lie.

## Cheap checks first, portable proof last

Two bookends complete the pipeline. Before any network call, validate the
identifier's structure: most national organization identifiers carry an
algorithmic check digit, and a checksum failure proves — without touching the
registry — that the string is a typo, not an organization. That verdict is
"invalid input, please re-check", never "no such organization": the user
mistyped, and telling them their charity does not exist sends them down the
wrong repair path.

At the far end, the aggregated result becomes a *portable, signed,
time-boxed credential* — a verification passport the organization can present
to any funder or intermediary instead of re-proving its legitimacy from
scratch for each one. The passport carries every source's outcome and
timestamp (provenance per field, so a verifier can re-derive the verdict
rather than trust a boolean), an integrity signature so tampering is
detectable offline, and an expiry measured in months, because good standing
is a perishable fact: organizations dissolve, exemptions are revoked, and
sanctions lists change weekly. A verification with no expiry is not a
credential; it is a rumor with a timestamp.

## Failure modes of the naive reading

- **Absence read as disqualification.** The single most common defect: one
  source's "no record" blocking applicants for whom no record is normal.
  Polarity is per-source domain knowledge, not a generic mapping.
- **Verified-name decoupling.** Identifier checked, name never bound —
  the impersonation hole. The name match must be able to veto.
- **Error cached as fact.** A transient upstream failure stored as a
  negative verdict, then served confidently for the cache lifetime.
- **The optimistic default.** An unknown or empty registration status
  promoted to active "because it was found". Unknown degrades down.
- **Silent roster shrinkage.** Unconfigured sources dropped from the result
  instead of reported, so a two-check verdict masquerades as a five-check
  one.
- **Score dilution by weather.** Confidence computed over sources *run*
  rather than sources *decided*, so infrastructure noise reads as applicant
  risk.
- **The immortal credential.** A verification treated as permanent, drifting
  arbitrarily far from the registries it once summarized.
