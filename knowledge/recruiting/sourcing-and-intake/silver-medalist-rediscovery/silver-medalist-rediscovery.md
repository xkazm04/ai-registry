---
layer: golden-path
type: golden-path
subject: silver-medalist-rediscovery
status: forged
use_when: [opening a role that resembles one you have filled before, building a talent-pool re-surfacing sweep, ranking previously-rejected people against a new opening, writing a re-approach message to someone you turned down]
techniques:
  - prior-outcome-taxonomy
  - fit-floor-for-readmission
  - band-limited-prior-depth-boost
  - person-level-consent-collapse
  - disclose-how-far-they-got-last-time
  - read-time-relevance-refilter
---

# Silver-medalist rediscovery

Every talent team already owns the cheapest pipeline available to it: the
people it has already sourced, already read, already interviewed, and already
turned down. They cost nothing to find, they have demonstrated interest, and
much of the assessment work has been done. Almost every organisation lets this
asset rot — not out of ignorance, but because the two things that make
rediscovery work are unglamorous and easy to get wrong: a lawful basis for
holding and re-contacting the person, and the discipline to re-approach them
as a person who was told no rather than as a row that matched a query.

The subject is that discipline. It covers who qualifies as re-approachable,
what the previous outcome is worth as evidence, how prior familiarity may and
may not influence a ranking, whose permission governs the contact, what the
first message must admit, and how a match computed on Monday is prevented from
being sent on Friday to someone who was hired on Wednesday.

## The naming is not decoration

"Silver medalist" is shorthand for a specific population, and getting the
population wrong is the first failure. It is not "everyone in the database".
It is people who reached a real assessment and did not convert, for a reason
that is not disqualifying:

- turned down after a substantive stage — the classic silver medalist, someone
  a hiring team formed a considered view about;
- lost to another offer, or declined yours — the organisation wanted them;
- withdrew or went quiet for a reason that was about that role, that timing, or
  that location;
- never got a decision because the requisition was cancelled, frozen or filled
  internally — nobody said no to them at all, and this cohort is both the most
  receptive and the most likely to have been abandoned mid-process.

Two populations are *not* in scope and must be excluded structurally rather
than by recruiter memory: people who never reached an assessment (they are
cold sourcing, not rediscovery, and their record supports no claim about them),
and people carrying a terminal outcome — a documented do-not-approach decision,
a withdrawn right to work, verified fraud in an application, a completed
erasure. Terminal is not "very low score"; it is a different kind of fact, and
a scoring system that expresses it as a number will eventually let a good
enough new match outrank it. See
[prior-outcome-taxonomy](./techniques/prior-outcome-taxonomy.md).

## A rejected candidate is a person who was told no

This is the load-bearing human fact of the subject, and it is the one
engineering treatments drop first.

Someone who reached a final round and lost it spent hours on you, arranged
their life around your calendar, and received a decision that in most cases
was delivered thinly. When they hear from you again, exactly one of three
readings is available to them. Either you remember them — in which case the
approach is flattering, and the second conversation starts with more context
than a first conversation ever could. Or you have forgotten them, and are
pitching them a job at a company that already rejected them, which reads as
institutional amnesia. Or you never knew them at all and a system matched a
keyword, which reads as a mail-merge and is worse than silence, because it
retroactively reframes the original process as machinery.

The remedy is not tone. It is content: name the role, name roughly when, name
how far they got, and say what changed. Disclosing prior depth is not a
courtesy applied to an otherwise generic message — it is the thing that makes
the second conversation credible, and it is also the fastest route to an
honest no, which is a good outcome you should want cheaply. The rules for
doing it without overclaiming, and without leaking internal vocabulary or
comparative information about other people, are in
[disclose-how-far-they-got-last-time](./techniques/disclose-how-far-they-got-last-time.md).

A second-order consequence: if the prior record has been lawfully minimised —
anonymised, scrubbed, its assessments aged out — you cannot make that
disclosure. And if you cannot say how you know them, you should not be
contacting them as someone you know. Retention policy therefore determines
outreach eligibility, not merely data hygiene.

## Rediscovery produces an approach, not a candidacy

The most consequential architectural distinction in the subject: a rediscovery
hit is a *suggestion that a recruiter consider reaching out*. It is not an
application, not a candidacy, and it must not create pipeline state on the
person's behalf. A system that auto-advances re-surfaced people into a stage
has manufactured an application the person never made, and every downstream
artefact — the funnel metrics, the adverse-impact figures, the eventual
rejection letter — is now describing a thing that did not happen.

Keep the boundary sharp in both directions. Rediscovery reads the record and
writes nothing to the person's status. The person's status, when they respond,
is created by their affirmative act of applying or agreeing to be put forward.
The sequencing, cadence and stop conditions of the approach itself belong to
the outreach discipline, not here: this subject decides *who is eligible and in
what order they surface*, and hands off at the moment a message is composed.

## The familiarity ratchet is the characteristic failure

Give prior familiarity an unbounded influence on ranking and the pool
converges, within two or three hiring cycles, onto the same few dozen people.
The mechanism is simple: known people rank higher, so they get contacted, so
they accrue more prior interaction, so they rank higher still. The pipeline
ends up systematically preferring people you have already seen — the exact
inverse of what a talent pool is for, and a distribution that is very hard to
defend if the population you saw first was not representative.

Two rules contain it, and they are separate rules:

1. **Admission is decided on the honest fit for the new role.** A candidate
   enters the sweep because they clear a fit floor computed against the current
   opening, and that floor is the same one the general pool uses — one
   expression, shared, so the two cannot drift apart and start disagreeing
   about who is worth a look. See
   [fit-floor-for-readmission](./techniques/fit-floor-for-readmission.md).
2. **Prior depth reorders, it never promotes.** Any boost for "we already know
   them, and they got far" is bounded to a fraction of a fit band — roughly
   half a tier — so it can change the order of comparable people and can never
   vault a weaker fit over a stronger one. See
   [band-limited-prior-depth-boost](./techniques/band-limited-prior-depth-boost.md).

Stated as one sentence: familiarity is a tie-breaker, not a qualification. If
your ranking cannot demonstrate that property arithmetically, it does not have
it, because nobody will notice the drift by reading result lists.

What the prior assessment is actually *worth* as evidence — how a nine-month-
old interview scorecard compares to a fresh reading, and how much to discount
an assessment produced under a different rubric — is the province of evidence
provenance weighting, and this subject defers to it. What it insists on is the
bound: however the prior evidence is weighted, its influence on ordering stays
inside a band.

## Consent lives on the person, not on the record

A talent database keyed by application produces several records for one human
being. Each carries its own consent fields, its own retention clock, and its
own state of anonymisation. Evaluate re-contact eligibility on the record that
matched and you will eventually contact someone who opted out — because their
opt-out is attached to a different application, and the record in front of you
is merely blank.

The correct evaluation collapses every record belonging to the same person
into a single decision, and the collapse is asymmetric:

- **Grants union.** An explicit permission recorded anywhere is a permission;
  a blank field elsewhere is silence, not refusal.
- **Prohibitions dominate.** A suppression, an opt-out, a do-not-contact set
  on any record governs all of them. This is what makes a new role's blank
  record unable to override a refusal the person expressed elsewhere.
- **Anonymisation is terminal.** Once any record for a person has been
  anonymised, that person is out of rediscovery permanently. There is no
  quorum, no recency rule, no override — anonymisation exists precisely to
  destroy the link back to a human, and treating it as one input among several
  reconstructs what it was designed to remove.

And the gate fails closed. If the consent state cannot be read — the store is
unavailable, the lookup errors — suppress the contact and log it. The
asymmetry that governs the uncertain-identity case governs the unavailable-
data case identically, and an outage is a particularly bad reason to send a
message you would not have been allowed to send.

The identity question underneath — whether two records are in fact one person —
is genuinely hard and belongs to the identity-and-staleness discipline. This
subject only needs its output plus one rule of its own: when the match is
uncertain, resolve toward suppression. The cost of not contacting someone who
would have been happy to hear from you is a missed opportunity; the cost of
contacting someone who told you to stop is a breach of a promise you made.
See [person-level-consent-collapse](./techniques/person-level-consent-collapse.md).

The lawful basis itself — which clock the record is held on, what the person
was told, when consent expires and what survives an erasure — is owned by the
consent-and-retention discipline. Rediscovery is its single largest consumer
and re-teaches none of it. What rediscovery adds is that the outreach
suppression gate must be consulted at the moment of contact, by every path
that can produce an unsolicited message, and not only by the one you happened
to build first.

## A match is a perishable claim

Rediscovery output is computed in a sweep and read later — sometimes days
later, in an alert, a digest, or a list someone left open. In that interval
the world moves: the person is hired somewhere, or by you; they exercise an
erasure request; they re-engage on another role and are now an active
candidate; the requisition closes; their consent lapses.

So the sweep's verdict is a claim with a timestamp, never a fact, and it is
re-evaluated at read time against live state before it is shown — not before
it is *sent*, which is too late, because by then a recruiter has already read
a name and formed an intention. Items that no longer qualify disappear from
the list rather than surfacing with a broken action. And the re-check runs the
same predicate as the sweep: two implementations of "is this person still
eligible" is a guarantee that one of them is wrong. See
[read-time-relevance-refilter](./techniques/read-time-relevance-refilter.md).

The sweep itself must be bounded. Scanning every open role against every
historical record is the kind of job that quietly becomes a database's
dominant workload, so it runs against a capped set of roles and candidates.
The bound is not the interesting part — the logging is. A sweep that truncates
silently produces a rediscovery programme whose coverage nobody can state:
roles that were never examined are indistinguishable from roles with no
matches. Log the truncation, with the bound and the count dropped, every time
it bites. An unexamined role is a fact about your process, not an absence of
candidates, and the two must never look the same in a report.

## What good looks like

A healthy rediscovery programme is measurable, and the informative metrics are
mostly the uncomfortable ones:

- **Reply rate against cold outreach.** Rediscovery should beat cold sourcing
  substantially. If it does not, the messages are almost certainly generic —
  the disclosure step has been dropped, and you are paying the cost of
  familiarity without collecting its benefit.
- **Share of the pipeline that is re-surfaced people.** This is a ceiling
  metric, not a growth metric. Rising steadily over quarters is the
  familiarity ratchet showing up in aggregate.
- **Suppression rate on re-approach.** People opting out in response to
  rediscovery is a signal about message quality, and a healthy programme
  treats a spike as an incident rather than as inventory attrition.
- **Truncated sweeps.** Should be visible and should trend to zero, or the
  bound should be raised deliberately.

None of this works without the unfashionable groundwork: outcomes recorded in
a vocabulary that distinguishes "we said no" from "they said no" from "nobody
said anything", consent captured at the moment it was actually given, and a
re-approach that starts by admitting what happened last time. The technology
is trivial; the reason most organisations do not have this is that the record
underneath it was never kept honestly.
