---
layer: technique
type: technique
subject: multi-jurisdiction-hiring-compliance
technique: regime-catalog-with-four-axes
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [adding a jurisdiction to a hiring product, auditing what the product asserts about law, reviewing a regime map with counsel]
---

# Regime catalog with four axes

## The concern

Every surface that says anything about law — a candidate disclosure, a trust
page, a procurement answer, a retention job — needs the same small set of facts
about a jurisdiction. If each surface derives them independently, they diverge,
and the divergence is invisible because each surface renders successfully. The
catalog is a single declarative table that all of them read, and its columns are
chosen so that a lawyer reviewing one row sees the entire legal position for
that jurisdiction on one line.

## The four axes

Four columns, and no more, cover what a hiring product actually needs to
assert. More columns are a temptation and a trap: a catalog that tries to
encode the whole statute becomes a legal treatise nobody maintains.

1. **Data-protection law.** The instrument candidate information is processed
   under. This drives lawful basis, subject-access response, erasure handling,
   cross-border transfer language and sub-processor disclosure.
2. **Human-oversight hook.** The specific provision that makes the "a person
   decides, not the machine" guarantee legally binding here — a general
   automated-decision right, a sector rule, a bespoke AI statute's human-review
   pathway. This is the axis that turns a product principle into a duty, and it
   is what a candidate's representative will cite.
3. **Equal-opportunity framework.** The anti-discrimination regime the
   jurisdiction assesses hiring against — the source of protected
   characteristics, of the indirect-discrimination theory, and of the
   limitation period that sets your retention floor.
4. **Adverse-impact test.** The *named statutory* test, if one exists.
   Nullable, and null in most rows. See
   [codified-threshold-only-where-one-exists](./codified-threshold-only-where-one-exists.md).

The first three are almost always non-null: every jurisdiction that permits
hiring has a data law, an oversight hook of some kind, and an equality
framework. The fourth is the discriminator, and the fact that it is usually
empty is the catalog's most useful output.

## A worked catalog

As of mid-2026 — and **this date is part of the data**, not a footnote. Read
the shape, not the cells; the cells expire.

| Jurisdiction | Data-protection law | Human-oversight hook | Equal-opportunity framework | Codified adverse-impact test |
| --- | --- | --- | --- | --- |
| European Union | GDPR | GDPR Art. 22 + AI Act deployer oversight and Art. 86 explanation | Equal Treatment / Employment Equality Directives as transposed | *none* |
| United Kingdom | UK GDPR + Data Protection Act | UK GDPR Art. 22 as amended by the 2025 data act | Equality Act 2010 | *none* |
| United States (federal) | sectoral; no general federal law | Title VII / ADA duty on the employer, not a machine right | Title VII, ADA, ADEA | four-fifths ratio, Uniform Guidelines on Employee Selection Procedures (1978) |
| New York City | state and sectoral law | pre-use notice; independent annual bias audit | Title VII plus city human-rights law | *none codified* — the audit publishes impact ratios; the pass line is borrowed |
| California | state privacy statute + civil-rights regulations | automated-decision-system rules; anti-bias testing as evidence | state fair-employment act | *none* |
| Illinois | state biometric and privacy statutes | AI-video notice and consent; a 2026 prohibition on discriminatory AI effect plus notice | state human-rights act | *none* |
| Colorado | state privacy act | disclosure plus a human-review pathway for adverse decisions | state anti-discrimination act | *none* |
| Ontario | federal/provincial privacy law | job-posting disclosure of AI screening for larger employers | provincial human-rights code | *none* |
| *(neutral)* | applicable local data-protection law | a human decides; no solely-automated adverse decision | applicable equal-opportunity law | *none* |

The neutral row is not padding. It is the destination for a workspace that
spans jurisdictions or has not chosen one, and every value in it is true
everywhere — it names the guarantee instead of an instrument, which is the only
honest thing to say when you do not know where you are.

Two readings jump out of that table and neither survives an ad-hoc branch
structure. First, the codified-number column has one true entry and one
"borrowed" entry, and the borrowed entry is a jurisdiction that mandates the
*computation and publication* of ratios without setting a pass line — a
genuinely different obligation that a boolean `requiresBiasAudit` flag would
flatten into a lie. Second, the oversight hooks are heterogeneous: a general
data-protection right, a bespoke AI statute, a job-advertisement rule and a
consent rule are all "the hook", and only naming the actual provision lets a
disclosure cite something a reader can look up.

## Procedure

1. **Key by a stable regime identifier**, never by a display string, a
   user-typed country name or a locale tag. Renaming a workspace's region must
   not change what the product asserts about the law
   ([law](../../../_laws.md#meaning-does-not-live-in-a-label)). Display names hang
   off the identifier; nothing keys off them.
2. **One row per regime, all four fields present**, with the adverse-impact
   field explicitly null where none exists. A missing key and a null are
   different: a missing key means nobody has looked, which is the state the
   catalog exists to eliminate.
3. **Type the null.** The consumer must be forced to handle "no codified
   threshold" as a case, not receive a falsy value that flows into a
   comparison. A number-or-null field read by an unchecked comparison is how an
   uncodified jurisdiction acquires a threshold of zero.
4. **Keep the module pure and dependency-free.** Reference data plus
   normalisation, importing nothing — no data access, no server-only modules,
   no configuration. It has to be readable from a candidate-facing page, a
   recruiter surface, a background job and a test, and any of those it cannot
   reach will grow its own copy.
5. **Instrument names are proper nouns; do not translate them.** Store the
   names as plain strings in the catalog and localise only the connecting
   prose, interpolating the names in at the render site. A translated statute
   name cannot be looked up, and a translation table for legal instruments
   drifts silently.
6. **An unmapped jurisdiction is not a compliant one, and the fallback is
   neutral, not local.** Carry an explicit *spans jurisdictions or not yet
   chosen* row whose values name the guarantee rather than a country's
   instrument — the applicable local data-protection law, human review with no
   solely-automated adverse decision, applicable equal-opportunity law. Resolve
   unknown, stale or hand-edited input to that row, never to the home
   jurisdiction ([law](../../../_laws.md#absence-of-evidence-is-not-evidence)).
   Coercing unknown input to a *specific* regime is the exact bug that ships one
   region's legal framing to another region's candidates, and it is invisible
   because it renders perfectly.
7. **Stamp an as-of date and a review cadence on the catalog itself**, and set
   a review no longer than two quarters. Effective dates in this space move:
   employment provisions of comprehensive AI regimes have been deferred by more
   than a year, and at least one statute was repealed and replaced — converting
   an audit mandate into a disclosure-plus-human-review mandate — months before
   it was due to apply.
8. **Separate the framework axis from any guidance you track.** Withdrawn
   agency guidance changes what you can rely on for *interpretation*; it does
   not change the framework column, because the statute is untouched. Conflating
   the two is how a control gets deleted for a reason that was never about the
   duty.

## Decision rules

- When a surface needs a legal fact, read it from the catalog; when the catalog
  does not carry it, add a column deliberately or say nothing. Never derive it
  locally.
- When a jurisdiction's obligation does not fit a boolean, do not make it a
  boolean. "Requires publication of ratios" and "requires a ratio to meet a
  line" are different obligations; encode the obligation, not a summary of it.
- When two rows would need identical values across all four axes, they are the
  same regime with two display names — collapse them. When they differ on one
  axis, they are two rows, however geographically close.
- When a candidate and the hiring team sit in different jurisdictions, the
  catalog does not resolve the conflict — it surfaces both rows, and a human
  decides. A catalog that silently picks one has made a legal determination.

## When not to use this

Do not build a catalog for a single-jurisdiction product; a table of one row
adds indirection without adding a decision. The moment a second regime appears,
build it — the migration from scattered conditionals to a catalog is far more
expensive after the conditionals have spread than before the second regime
lands.

Do not extend the catalog into an obligations engine that *evaluates*
conformance. The catalog states what applies. Whether you meet it is the gap
register's job, and merging the two produces a table that quietly grades itself.
