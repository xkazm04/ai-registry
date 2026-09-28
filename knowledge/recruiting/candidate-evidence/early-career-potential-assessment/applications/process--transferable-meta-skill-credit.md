---
layer: application
type: application
subject: early-career-potential-assessment
technique: transferable-meta-skill-credit
stack: process
verified_on: 2026-09-26
---

# Prior-role meta-skills in a bilingual Python mapper

`pipeline/jobfit/transferable.py` is the whole technique in about a hundred and sixty
lines. Its
module docstring states the thesis the standard argues for: a switcher's prior-domain
experience "is genuine professional maturity even if the target domain is new", mapped
to domain-agnostic meta-skills "so they can be credited at PROFESSIONAL provenance — the
key difference from a true beginner", while target-domain hard skills stay
provenance-discounted like a graduate's.

## The map is a table, not a prompt

`_AUTHORED_TRANSFERABLE_MAP` (`transferable.py:41-66`) is a tuple of (surface signals →
meta-skills) pairs, twelve entries, reviewable in one screen. The map actually read is
derived from it (`:93`, `with_feminine_forms`); see below.

- teacher / lecturer / tutor / educator / *učitel* / *lektor* / *pedagog* / *trenér* → mentoring,
  communication, curriculum design, public speaking
- nurse / doctor / *zdravot* / *lékař* / *sestra* → attention to detail, stress
  management, communication
- manager / lead / head of / supervisor / *vedoucí* / *ředitel* → leadership, delivery, stakeholder
  management, prioritization
- military / police / *voják* / *policie* / *hasič* → discipline, stress management, teamwork,
  ownership

Two properties matter more than the contents. It is **bilingual at the signal level** —
nearly every entry carries Czech and English surface forms (the marketing entry,
`:54`, is English-only), so a candidate who wrote *učitel* gets the same credit as one
who wrote *teacher*; a single-language map would have silently under-scored a whole
population of local applicants. Until 2026-08-21 the same was not true of *učitelka*:
the signals were masculine, and a woman's identical career transferred fewer skills
(`a5b961444`). The map is now derived, `_TRANSFERABLE_MAP =
with_feminine_forms(_AUTHORED_TRANSFERABLE_MAP)` (`:69-93`), and a build check fails on
any masculine-only signal. Bilingual was the half of label independence the first
version saw; grammatical gender was the half it did not. And it is **data a human
can argue with**: every row is a statement about what an occupation implies, sitting
where a policy reviewer can read it, rather than an inference a model makes fresh on
each run.

`_GENERIC_PROFESSIONAL` (`:96`) grants teamwork, communication, ownership and delivery
to *any* prior professional role, mapped or not — so an unrecognized occupation still
earns what having held a job demonstrates. `map_transferable` (`:99-120`) reads only
`job` and `internship` evidence and records the first source per skill, "so the
reasoning can cite where it came from" — the basis travels with the credit.

## Credited at professional, gated on the scoring model

`transform.py:209-221` calls `consider(skill, "professional")` for each mapped skill —
the same tier a direct professional demonstration earns, not a weaker "transferable"
tier. The gate is the upward lesson worth copying:

> Deliberately gated on the SCORING MODEL, not the `career_switcher` id: a switcher
> misread as a student — or a student whose *brigáda* was in another field — still earns
> the meta-skill credit their real prior role implies.

Gating on the classifier's label would compound a routing error into a scoring loss.
Gating on the rubric path cannot, and it needs no extra safety check, because
`map_transferable` yields nothing without prior-role evidence: a true beginner gains
nothing from the wider gate. The experienced path is excluded for a symmetry reason
rather than a generosity one — their job evidence already carries professional
provenance for the actual skills, so including them would double-count the same
employment.

## Domain distance as the honest coarse grade

`domain_distance` (`transferable.py:139-164`) returns `(distance, reason)` over three
bands, and its docstring is the technique's own argument:

> Deterministic and surface-level by design — the honest alternative to pretending we
> can measure semantic domain similarity we have no data for.

- **adjacent** — prior-role text carries a signal neighbouring the target role family
  (a finance analyst moving to data work), from `taxonomy.ADJACENT_DOMAIN_SIGNALS`,
  which now covers all 16 role families "so a switch INTO a non-tech family is graded,
  not defaulted FAR";
- **moderate** — a recognized professional background whose meta-skills map but whose
  domain does not neighbour the target;
- **far** — no prior role at all, or a field sharing no surface signals.

Every band returns a prose reason alongside the grade, and the consumer renders the
band: `transform.py:224` threads it to the reasoning layer as `domain_distance`, and the
score effect (`transform.py:91-100`) is upward-only — adjacent floors the foundation
dimension at 0.5 and shortens the narrated ramp, far adds a signal line and changes no
number, because "the meta-skill credit already prices it". No decimals reach a reader:
the recruiter sees "adjacent field, shorter bridge", "moderate distance" or "far field,
longer ramp" (`messages/en.json`, `potential.bridgeValues`). Both the grading and its
threading sit under `profile.archetype == "career_switcher"` (`transform.py:83`,
`:224`), not under the scoring model the credit itself is gated on, so a switcher
misread as a student gets the credit without the grade.

## Deviations worth naming

Two, and the standard does not move for either:

- **There is no unknown state.** An unclassifiable pair falls into `far`, which the
  function documents as deliberate ("nothing to bridge FROM is the farthest case"),
still true on 2026-09-26: only three bands exist (`:134-136`) and an unrecognized pair
falls through to `:164`. It
  is defensible for the no-prior-role case and less so for an occupation the token
  lists simply do not recognize — the standard's distinct unknown band, routed to
  review, would separate the two.
- **Matching is substring-based over titles and free text.** Cheap, deterministic and
  auditable, but it will miss any occupation whose local title shares no token with the
  list, and the miss is silent. The `_GENERIC_PROFESSIONAL` baseline is what keeps that
  miss from costing the candidate everything.
