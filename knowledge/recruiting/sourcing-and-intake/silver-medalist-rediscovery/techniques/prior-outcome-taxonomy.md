---
layer: technique
type: technique
subject: silver-medalist-rediscovery
technique: prior-outcome-taxonomy
status: forged
laws: [meaning-does-not-live-in-a-label, a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds]
shared_with: []
use_when: [deciding who is eligible for a re-approach, designing the outcome vocabulary a pipeline records, writing the sentence that names a prior interaction]
---

# Prior-outcome taxonomy

Every rediscovery decision rests on one stored fact: how the previous
interaction ended. Most hiring systems record that fact badly — a single
"rejected" flag, or a stage name plus a free-text note — and every downstream
judgment inherits the ambiguity. The taxonomy is the fix: a closed vocabulary
of prior outcomes, chosen so that the distinctions it draws are exactly the
ones rediscovery needs to act on.

## The distinctions that matter

Three questions must be answerable from the stored outcome alone, without
reading notes:

1. **Who ended it?** The organisation, the person, or neither.
2. **How far did it get?** Did anyone form a considered view, or did the record
   stop at a document?
3. **Is the ending about this role, or about this person?** A timing or
   location mismatch expires; a disqualifying fact does not.

A vocabulary that answers all three:

| Outcome | Ended by | Re-approach posture |
| --- | --- | --- |
| **Declined after assessment** | you | eligible; the strongest cohort, and the one that most requires an honest disclosure |
| **Lost to another offer** | them | eligible; time-sensitive, since the reason is usually a competing situation that may have changed |
| **Offer declined** | them | eligible; the reason they gave is the single most valuable field in the record |
| **Withdrew / went quiet** | them | eligible, with lower confidence about interest |
| **Requisition closed, cancelled or filled internally** | neither | eligible; nobody rejected them, and they are usually owed an approach |
| **Screened out before assessment** | you | not rediscovery — the record supports no considered view; treat as sourcing |
| **Currently in process** | nobody | ineligible; they are a live candidate, not a rediscovery target |
| **Hired** | — | ineligible for external rediscovery; internal mobility is a different discipline |
| **Terminal** | you | permanently ineligible |

The terminal class is a class, not a score. Documented do-not-approach
decisions, verified misrepresentation, a withdrawn right to work, a completed
erasure request: these are facts of a different kind from "was not the best
candidate", and expressing them on the same scale as fit guarantees that a
sufficiently good new match eventually outranks them. Terminal outcomes are
evaluated as a gate before ranking runs, and nothing in the ranking layer can
see, weight, or overcome them.

## The label is not the meaning

Two records carrying the same outcome value can mean different things, and the
taxonomy's job is to make the ambiguity small enough to act on — not to
pretend it is zero. "Withdrew" covers a person who took a competing offer, a
person whose partner got a job in another city, and a person who found your
interview process insulting. The stored label is a bucket; the reason, where
it was captured from the person in their own words, is the evidence
([meaning-does-not-live-in-a-label](../../../_laws.md#meaning-does-not-live-in-a-label)).

Two consequences:

- **Capture the reason at the moment the outcome is set**, in the person's
  words where you have them, and treat a reconstructed reason as an inference
  rather than a fact. A reason invented six months later to justify a
  re-approach is worse than none.
- **Do not let a recruiter re-derive the outcome from stage history.** "They
  were at final round and are not now" is compatible with a rejection, a
  withdrawal and a cancelled requisition, and a human under time pressure will
  guess. Store the outcome explicitly at the transition.

## A value nobody writes empties a cohort silently

The characteristic defect of a closed vocabulary is a reader that tests for a
value the writer never produces. An eligibility rule looking for "closed" in a
system whose pipeline only ever records "role closed" excludes that entire
cohort — and excludes it *quietly*, because a rediscovery sweep that returns
fewer people looks like a pool with fewer matches, not like a bug. The cohort
in question is usually the one most worth having: people nobody rejected,
whose process ended because a requisition was cancelled under them.

So the eligibility predicate is written against the enumerated vocabulary,
not against remembered strings, and it is tested by enumerating every value
the writer can emit and asserting where each one lands. Any value the test
cannot classify is a defect in the vocabulary or in the predicate — never a
default to "ineligible", which is exactly how the silence gets built.

## The lookup is scoped to the population that was ranked

The prior-outcome lookup reads across roles by design, and that breadth needs
one boundary: it must cover exactly the population the ranking covered — the
same organisation, the same tenant, the same catalogue. A lookup wider than
the ranking will label a person with a prior interaction that belongs to a
different organisation's history; a lookup narrower will silently drop priors
and downgrade real silver medalists to cold names. The isolation machinery
itself is an engineering concern, but the hiring consequence is not: a
mislabelled prior is a false statement to a candidate about how you know them.

## The outcome is bound to the role that produced it

A prior outcome is a verdict about a specific person against a specific
opening under a specific bar
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
It says something about the new role only to the extent the roles resemble
each other, and it says nothing at all about seniority in general. "Rejected
for a staff-level opening" is not evidence of unsuitability for a mid-level
one; frequently it is the opposite.

So the outcome lookup that feeds rediscovery is deliberately cross-role: it
gathers every prior outcome the person has, across every opening, and the
richest cohort in practice is the person who was declined for one role and
never considered for the adjacent ones that opened afterwards. Rank those
outcomes by recency and role similarity when deciding which one to *speak
about*, and never silently merge them — a system that surfaces only the most
recent row will mis-describe a person with a history.

## Internal vocabulary stays internal

The taxonomy is an operational instrument, not a candidate-facing one. Outcome
values are blunt by design — "declined after assessment" is honest in a
database and cold in an email — and some of them encode a judgment the person
was never told. The re-approach speaks in the vocabulary the person already
heard, derived from what the record actually holds
([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)),
and never exposes the raw value, the internal stage code, or the fact that a
terminal flag exists. A person carrying a terminal outcome is simply never
contacted; they are not told they are on a list.

## Decision rules

- Terminal outcome: exclude before ranking, unconditionally.
- Currently in process: exclude, and attribute no prior depth — they are being
  assessed right now.
- Stopped before any assessment: not rediscovery. They may be a fine sourcing
  target, but no disclosure about how far they got is available or implied.
- Ending was theirs with a recorded reason: lead with what changed about that
  reason, or do not re-approach at all.
- Ending was nobody's — a cancelled or internally-filled requisition — treat
  the approach as owed rather than opportunistic, and say so plainly.

## When not to use it

Do not build a taxonomy richer than your recorders will maintain. Fifteen
values that recruiters resolve by picking the first plausible one are worse
than six they pick accurately, because the extra distinctions look like signal
and are noise. Start with the ones that gate a decision — terminal,
ended-by-us, ended-by-them, ended-by-neither, never-assessed — and add a value
only when a real branch depends on it.

And do not retrofit the taxonomy onto historical rows by inference. Records
predating the vocabulary carry an honest *unknown*, which excludes them from
disclosure-dependent outreach and from prior-depth weighting. Guessing
backwards manufactures exactly the confident falsehood the second conversation
cannot survive.
