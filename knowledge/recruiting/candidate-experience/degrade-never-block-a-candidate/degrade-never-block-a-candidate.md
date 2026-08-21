---
layer: golden-path
type: golden-path
subject: degrade-never-block-a-candidate
status: forged
use_when: [designing quota or billing enforcement in a hiring system, a model provider is down or rate-limited mid-pipeline, deciding what a paywall may refuse, a candidate action fails for an operator-side reason]
techniques:
  - a-candidate-action-is-debited-never-gated
  - hard-gate-only-on-newly-created-metered-work
  - degrade-to-the-deterministic-path-with-honest-provenance
  - never-cache-a-degraded-verdict
  - declare-degraded-grounding-rather-than-lowering-confidence-silently
  - an-outage-must-not-change-who-advances
---

# Degrade, never block a candidate

A hiring system has two populations inside it and they are not symmetric. One of them
is the customer: they signed a contract, they chose a plan, they can read an invoice,
and they can call someone when a limit bites. The other is a person applying for a
job. They did not choose your vendor, they cannot see your quota, they have no
relationship with your billing system, and when your system stalls they experience it
as *this employer is not interested*.

This subject is the discipline that keeps the second population out of the blast
radius of the first population's constraints — and out of the blast radius of your
own. A candidate's application must not stall, vanish, or be judged by a different
instrument because a provider was down, a monthly allowance was exhausted, a card
expired, or a rate limiter fired.

The naive framing is that this is availability engineering: add retries, add a
circuit breaker, degrade gracefully, ship. That framing misses the thing that makes
it a *hiring* problem rather than an uptime problem, and the miss is the reason this
subject exists.

## The central argument: an outage is a selection criterion

Selection criteria in hiring are supposed to be chosen, written down, defensible, and
applied to everyone in a cohort the same way. That is the whole basis on which an
adverse decision can be justified to the person it happened to.

Now consider a screening pipeline that enriches each candidate with a model-produced
reading, and a provider that is unavailable for ninety minutes on a Tuesday morning.
The applications that arrived at 09:00 got the full instrument. The applications that
arrived at 10:00 got a keyword fallback that scores conservatively. Both cohorts land
in the same ranked list, in front of the same recruiter, who reviews the top of the
list and stops.

Nobody decided that applying on Tuesday morning should lower your chance of a
callback. But that is now, materially, one of the criteria. It is undeclared,
unvalidated, invisible in the audit record, unmentioned in any policy, and — this is
the part that should end the argument — it correlates with things you do not control
and cannot defend. Application timing is not random with respect to timezone, shift
work, caring responsibilities, or which sourcing channel was pushed that week. An
outage-shaped criterion is a proxy criterion you did not know you had.

So the standard is not "the system should stay up". It is: **whatever your system's
operational state, the same candidate must receive the same treatment, or the
difference must be declared and must not touch who advances.** Everything below is
machinery for holding that line. This is
[a-candidates-process-never-stalls-on-your-constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
read at the level of the cohort rather than the individual.

## The asymmetry that organises everything: whose action is this?

The single most useful question at any enforcement point is not *how expensive is
this call* or *is this customer over their limit*. It is **who initiated this, and
who bears the cost of refusing it.**

- **A recruiter action** is the customer exercising the product. Publishing a role,
  launching a sourcing campaign, running a bulk re-score, commissioning an
  assessment. Refusing one of these is a conversation between two parties who both
  understand the terms. It is honest, it is recoverable, and the person who is
  refused is the person who can fix it.
- **A candidate action** is a person moving through a process that someone else is
  operating. Submitting an application, booking an interview slot, uploading a
  document, accepting an offer, exercising a data right. Refusing one of these
  charges an outsider for a dispute they are not party to. There is no recovery path
  that they control. In the offer case there is not even a second chance — a decline
  deadline does not pause because your meter is full.

So the enforcement rule is asymmetric by construction: **a metered candidate outcome
is debited, never gated.** The counter is incremented, the overage is billed, the
account is flagged for the account team — and the candidate's action completes. That
is [a-candidate-action-is-debited-never-gated](./techniques/a-candidate-action-is-debited-never-gated.md),
and the commercial objection to it ("then they can exceed their plan for free") is
answered by the word *debited*: nothing is free, it is simply not blocked at the
moment a third party is standing at the door.

The mirror rule is what makes the asymmetry credible rather than merely permissive.
There *are* things that must hard-fail, and refusing to name them produces a worse
system than blocking everything.

One structural choice makes the asymmetry visible instead of accidental: **meter
outcomes, not compute.** When the meters a customer sees are the things they got — a
role taken to market, a person hired, an interview conducted — every meter has an
obvious initiating actor, and the debit-or-gate question answers itself at the moment
the meter is defined. When the meters are units of internal cost, the actor is
invisible at every call site, and enforcement decays into "is this call expensive".
A compute-shaped meter still has a place, but as a safety net that bounds a runaway
behind the outcome meters, never as the customer-facing unit.

## What must hard-gate: the creation of new metered work

Degrading a read is honest. Silently degrading the *creation* of work is not,
because it manufactures an artefact the operator believes is complete and is not.

If publishing a role would exceed the plan, refuse the publish with an explicit
payment-required answer. Do not publish it to fewer channels, do not shorten its
run, do not quietly skip the enrichment step that the recruiter believes is part of
publishing. A role that is live but half-distributed is worse than a role that never
went live, because the recruiter will draw conclusions from its pipeline — *this
market is dry, this comp band is wrong, this title does not land* — from a
distribution they think happened and did not. The same holds for launching an
outreach sequence, commissioning a work sample, or starting a bulk re-score: these
create obligations, expectations and downstream records.

The rule, stated as a rule: **when an action creates new metered work whose partial
execution would be indistinguishable from full execution, block it with an honest
refusal; when an action reads, enriches, or presents work that already exists,
degrade it and declare the degradation.** See
[hard-gate-only-on-newly-created-metered-work](./techniques/hard-gate-only-on-newly-created-metered-work.md).

A hard gate is only honest if it reserves the *worst case*. A gate that checks the
typical cost of an action while the later debit charges the maximum lets an
un-funded overage through on precisely the accounts closest to their ceiling — and
the overage lands on whichever meter is most expensive. The gate's reservation and
the debit's ceiling must come from one definition, and the gate must also subtract
work already reserved but not yet debited, or a burst of concurrent requests will
each read the same pre-debit remainder, each pass, and collectively overrun the cap
nobody thought was soft.

The two halves are one policy, not a compromise between two camps. Blocking creation
protects the customer from believing in data that does not exist. Debiting outcomes
protects the candidate from paying for the customer's account state. A team that
adopts only the first half builds a paywall that strands applicants; a team that
adopts only the second half builds a product with no commercial floor and a
recruiter who cannot trust their own funnel numbers.

## The deterministic path is not a fallback, it is the floor

The word "fallback" invites teams to build the degraded path late, badly, and only
for the outage case. That produces a path nobody has read in a year, which
occasionally becomes the path every candidate goes through.

Invert it. The deterministic path — templates, rules, explicit thresholds, the
structured record itself — is the *floor of the product*, always present, always
exercised, and correct on its own terms. The model layer is a *garnish* on top of
that floor: it makes the rationale more specific, the summary more readable, the
phrasing warmer. When the model layer is unavailable, is unaffordable, or fails
validation, the floor is what remains, and nothing structural is missing.

Three consequences follow, and each is a design constraint rather than an aspiration:

1. **The degraded path must be the same code path that already runs.** A separate
   emergency branch is untested by definition. Exhausted allowance and provider
   outage should take the identical route, which means that route runs every day for
   free-tier accounts and is therefore never stale.
2. **The floor must be sufficient for the decision it supports.** If a stage cannot
   proceed without the model's contribution, the model is not a garnish — it is a
   dependency, and the correct behaviour is to *hold* the candidate for a human, not
   to invent a weaker verdict. The hold verdict itself and its fairness properties
   belong to the automated-screening sibling; what belongs here is knowing which of
   your steps have a real floor and which only appear to.
3. **The degraded output must say so.** Not in a log — in the artefact, travelling
   with it. See
   [degrade-to-the-deterministic-path-with-honest-provenance](./techniques/degrade-to-the-deterministic-path-with-honest-provenance.md).

## Degradation must be temporary, and caching is how it stops being temporary

An outage lasts ninety minutes. A cache entry lasts a week. If a degraded result is
written into a cache with the lifetime designed for authoritative results, a
ninety-minute incident becomes a seven-day misrepresentation of specific named
people — and the read path has no way to know it is holding the wrong grade, because
by then the provider is healthy and everything looks normal.

The rule is short: **cacheability is a property of provenance, decided at the moment
of production.** Only an authoritative result may be frozen. A degraded one is
either not cached at all, or cached with a lifetime shorter than the incident it
came from, and always marked so that a recovery can invalidate it. See
[never-cache-a-degraded-verdict](./techniques/never-cache-a-degraded-verdict.md).

## Declare the degradation; do not price it into the score

There is a tempting shortcut when grounding is thin — a document failed to parse, an
enrichment source was unreachable, half the evidence budget did not arrive. The
system still produces an answer, and it lowers the confidence number to reflect the
weaker basis. This feels responsible. It is the most dangerous move in the subject.

A confidence number is usually consumed as a *ranking input* or a *threshold input*.
Quietly reducing it does not communicate "we saw less this time" — it communicates
"this candidate is a weaker match", in exactly the grammar that decides who appears
at the top of the list. The system has converted an operator-side gap into a
candidate-side penalty, and it has done so invisibly, which means no reviewer will
ever attribute the lower position to the real cause.

The correct move is structural: **degraded grounding is a declared flag on the
result, not a discount on the number.** The surface renders lower confidence
*because the flag is set*, the candidate is not re-ranked beneath peers who happened
to be processed while the source was up, and a recovery can trigger recomputation
because the flag says what is missing. See
[declare-degraded-grounding-rather-than-lowering-confidence-silently](./techniques/declare-degraded-grounding-rather-than-lowering-confidence-silently.md)
and [absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence).

## Billing state is an operational fact, never an evaluation input

Two smaller disciplines, both learned the hard way.

**Grace before downgrade.** A payment failure is usually a transient fact about a
card, not a decision by a customer to stop hiring. Cutting entitlements the instant a
charge declines can strand candidates mid-process — an offer that cannot be accepted,
an interview that cannot be booked — for a reason that resolves itself in three days.
Hold the entitlement through a grace window, notify the account, and downgrade only
after the window closes. Never let the downgrade retroactively invalidate a candidate
commitment already made.

The grace must be *bounded*, though, and the direction of the default depends on
which fact is missing. Where the customer has demonstrably paid through a period,
ambiguous or unparseable billing data resolves in their favour — the common cause of
a missing period anchor is a malformed record on a still-paying account, and cutting
them produces stranded candidates for a data-quality bug. Where no paid-through
guarantee exists at all, the same ambiguity resolves to the floor tier, or a failed
payment entitles forever. Two more corollaries of the same discipline: a withdrawn
plan is *honoured, never deleted* — removing a tier from the catalogue silently drops
everyone on it to the floor at the next entitlement read, which is the one thing a
plan catalogue must never do; and an unidentifiable billing scope resolves to the
floor tier as *itself*, so an anonymous or demo session can neither spend nor pollute
a real customer's allowance.

**No evaluation may read the meter.** Nothing in a scoring, ranking, routing or
rejection path may consult plan tier, remaining quota, or billing status. The
temptation is real and it arrives disguised as efficiency: *skip the expensive
enrichment for candidates beyond the first fifty when the account is near its limit*.
That is a selection criterion made of the customer's invoice, applied to individual
people, and it is precisely the failure the whole subject exists to prevent. See
[an-outage-must-not-change-who-advances](./techniques/an-outage-must-not-change-who-advances.md).

## Where this subject stops

Four seams, named so nothing here duplicates a neighbour.

- **Provenance grammar and refusal.** How a verdict is tagged, what the tag
  vocabulary is, what "could not determine" means, and why a laundered fallback
  misleads — all of that is owned by the inference-labelling sibling. This subject
  cites that grammar and adds only what is specific to operator-side degradation:
  who may be blocked, what is debited, and the cohort-level fairness consequence of a
  degraded window.
- **The fallback verdict itself.** What a machine returns when it cannot decide —
  the hold, its routability, and why hold rather than reject — belongs to the
  automated-screening-fairness sibling. This subject stops at "the candidate goes to
  a human"; that one specifies what that means and audits it.
- **Delivery truth.** Whether a candidate was actually told something, and what a
  send failure means, belongs to the candidate-communication sibling. Degradation
  here must not silently swallow a notification; the honesty rules for that live
  there.
- **The acceptance path.** Offer deadlines, decline windows and the mechanics of
  accepting belong to the offer-lifecycle sibling. This subject is the guarantee that
  those mechanics never fail for an operator-side reason.

And one whole neighbouring domain is ceded explicitly: **provider routing, retries,
circuit breaking, timeouts, cost metering, price books, telemetry and cache
infrastructure are general engineering practice** and are not re-derived here. How
you detect an outage, how many times you retry, how you meter tokens and how you
store a cache entry — none of that is hiring craft. What is hiring craft, and what
this subject owns end to end, is the consequence: an outage that changes which
candidates advance has introduced a selection criterion nobody chose.

## Failure modes this standard exists to prevent

- **The paywalled applicant** — a person cannot submit, book or accept because the
  employer's account is over its limit, and receives silence or an error that reads
  as rejection.
- **The Tuesday-morning cohort** — a degraded window produces systematically weaker
  readings for everyone who happened to arrive inside it, and they compete in the
  same ranked list as everyone else.
- **The half-published role** — a creation action silently did less than it claimed,
  and the recruiter reasons about a market from a distribution that never happened.
- **The frozen fallback** — a ninety-minute incident cached into a week-long
  misstatement about a named person, invisible after recovery.
- **The silent discount** — degraded grounding expressed as a lower score, so an
  operator-side gap is charged to the candidate as a ranking penalty.
- **The untested floor** — a deterministic path that exists only for outages, has not
  been read in a year, and is discovered to be wrong at the worst possible moment.
- **The billing-aware ranker** — quota or plan state consulted inside an evaluation
  path, making the customer's invoice a criterion applied to people.
- **The instant cut-off** — an entitlement downgrade on the first declined charge,
  stranding candidates mid-process for a transient payment fact.

## The techniques

- [a-candidate-action-is-debited-never-gated](./techniques/a-candidate-action-is-debited-never-gated.md)
  — the enforcement asymmetry keyed on who initiated the action, and how to bill an
  overage without standing in a candidate's way.
- [hard-gate-only-on-newly-created-metered-work](./techniques/hard-gate-only-on-newly-created-metered-work.md)
  — the honest refusal, and the test for which actions earn one.
- [degrade-to-the-deterministic-path-with-honest-provenance](./techniques/degrade-to-the-deterministic-path-with-honest-provenance.md)
  — one route for quota exhaustion and outage alike, kept warm because it is the
  product's floor.
- [never-cache-a-degraded-verdict](./techniques/never-cache-a-degraded-verdict.md)
  — cacheability as a property of provenance, decided at the write.
- [declare-degraded-grounding-rather-than-lowering-confidence-silently](./techniques/declare-degraded-grounding-rather-than-lowering-confidence-silently.md)
  — a flag, not a discount, so a missing source never becomes a ranking penalty.
- [an-outage-must-not-change-who-advances](./techniques/an-outage-must-not-change-who-advances.md)
  — the cohort-level test that turns availability engineering into a fairness
  control.
