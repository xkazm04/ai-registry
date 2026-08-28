---
subject: translation-pipeline-topology
domain: localization
last_touched: 2026-08-28
dry_streak: 0
---

# translation-pipeline-topology

Born: [[2026-08-26-ai-engineering-from-scratch]] - /intake run 17, forged same-run from the operator's "spec plus execution" pick. The first process subject in a bundle that was 13 language subjects; new category `craft` (the deferred category from the i18n waves, arrived via its named return condition: a non-skill consumer needed it).

## State

6 techniques (director-written golden path; three parallel workers, two techniques each, split by technique - language is the wrong partition axis for language-agnostic craft). No applications yet.

## Provenance

- Primary sighting: a public 511-lesson curriculum tree (derived-and-served topology: machine translations never on main, sha256-keyed cache published with the derived branch, shards sized to the CI limit, per-unit canonical fallback, one language registry, hand-authored committed exceptions).
- Second sighting, opposite topology: the fleet's desktop app (reviewed-and-committed catalogs). The golden path carries the discriminator - the human quality claim - rather than picking a winner.
- Both workers independently corrected the director's brief on law-link depth (three ups, not four), matching the sibling files. Link depth is per-file; the recurring lesson recurred.

## Open leads (banked, with return conditions)

- **No application yet.** The personas i18n programme is the reviewed-and-committed realization; the curriculum tree is the derived-and-served one. Write `process--canonical-and-derived-split` from whichever tree is next opened for real work.
- **Staleness check for hand-authored exceptions** (drift against canonical history) has a contract here but no instrument anywhere in the fleet. Return: personas-web's hand-authored locale landing pages, or a second sighting of an actual checker.

## 2026-08-26 - application landed (same day)

- `process--canonical-and-derived-split`: the fleet's desktop app read against the technique. Confirms the reviewed-and-committed shape WITH the floor-claim nuance (two strict gates make the commit a checkable mechanical claim; the review claim sits above it), finds three sibling techniques running inside the reviewed topology (runtime per-unit fallback; the untranslated allowlist as enumerated exception; derived section files committed beside source under a regenerate-with-every-edit contract), and lands the predicted structural gap: two trust classes (gate-only vs wave-reviewed, ~20%) indistinguishable in the artifact - review provenance is history, not state. Return condition recorded in the application.

## 2026-08-28 - deepen round 1 (first `/deepen` run in this bundle)

Chosen on demand, not on points: the bundle's worklist is a 13-way tie (see
[[localization]]), and the only live signal was that `personas-web` carries a
13-locale catalog nobody had read against this subject.

**Landed: `source-identical-value-audit`** + `process--source-identical-value-audit`.

The golden path had a section for what the *derived* topology owes its consumers
and none for the *reviewed-and-committed* one - which makes the stronger trust
claim and so carries the harder obligation. That asymmetry was the real hole; the
technique fills it, and the golden path gained the matching section.

- **Convergence, two independent trees.** The desktop app already runs the gate
  (`check-untranslated.mjs --strict` + an enumerated allowlist) - recorded in
  `process--canonical-and-derived-split` as "product names, format examples".
  `personas-web` has no gate at all, which is why it could be *measured*: the
  floor it reports is natural, not curated.
- **The claim the technique turns on** is one the existing application could not
  make: the check's floor is per-locale and is a **terminology ruling**. Measured
  over 1,506 leaves x 13 locales, all fully translated - non-Latin scripts 27-29
  identical, Latin scripts 43-116, **separating perfectly** (max 29 < min 43). A
  loanword gets transliterated out of byte-identity in a non-Latin script and
  keeps its spelling in a Latin one. A global threshold ranks the spread
  backwards.
- **The bootstrap procedure has evidence, not just logic.** The all-13
  intersection was 25 keys and every one was legitimate (12 proper nouns, 7
  platform names, 3 initialisms, 3 pure-skeleton). Intersect-first is cheap and
  it works.

## Counter-evidence, twice, and it changed the finding both times

- **It killed the opening hypothesis.** `docs/translation-handoff.md` says the
  dashboard surfaces ship English placeholders across 13 locales; the tree says
  otherwise. The doc is stale and reads as current. The finding survived only by
  being re-derived from a measurement - and got sharper, because "the floor is
  not zero and is script-dependent" is a better claim than "this catalog is
  untranslated".
- **The field is solving a different problem.** i18n-testing literature is about
  pseudo-localization and hardcoded-string detection - finding untranslat*able*
  strings in source. Identical-target-as-translatedness-signal, and its loanword
  false-positive floor, was not named in what surfaced.
- **A confirmation worth keeping:** the whole technique is a workaround for a
  format that cannot store translation state. Interchange standards carry a
  per-segment state; the same repository proves it, running per-unit source-hash
  drift on its guide corpus while the UI catalog has nowhere to put the fact.

## The sharpest single detail

`scripts/check-i18n-coverage.mjs` is named for coverage and checks shape. Its
`empty translation` clause forbids the empty string - the one value a plain
object catalog *could* have used to mean "not translated yet" - on top of a type
contract that already forbids omitting the key. Copying the English across is
left as the only legal move. Two gates, airtight about shape, silent about
translatedness, and green.

## Open leads (banked, with return conditions)

- **The allowlist artifact does not exist in `personas-web`.** The 25-key
  intersection is the seed and the per-locale class-4 rulings are unwritten.
  **Return:** when someone wires the gate there - and the technique's step 4 says
  not to wire it before the rulings exist.
- **`docs/translation-handoff.md` should be retired or dated.** Consumer-side;
  not this registry's commit to make.
- **Does the class-4 residue agree with each language subject's termbase
  technique?** The measurement produced ~200 keys identical in at least one
  locale. Ruling them against `terminology-and-loanwords` per language is the
  natural bridge from this craft subject into the language subjects, and would
  be real evidence for both. **Return:** a language-subject deepen round.
- Earlier leads unchanged: no `canonical-and-derived-split` application from a
  derived-and-served tree; hand-authored-exception staleness still uninstrumented
  for the UI catalog.

## Saturation

**Not saturated.** dry_streak 0 - this round earned a technique. The subject now
has 7 techniques and 2 applications, both `process`, both from the same fleet.
Its real debt is a second *tree*, which is `/reconcile` work.

## 2026-08-28 - rounds 2 and 3: the loop refuting itself, twice

Both rounds probed `source-identical-value-audit` rather than surveying. Neither
was dry, and neither found what it went looking for.

**Round 2 - the cognate.** Went to sort the French residue against the termbase
(the lead banked in round 1) and found the technique's own class 4 wrong. Of
French's 91 keys over the all-locale floor, roughly two thirds are cognates -
*Menu, Total, Agent, Incident, Urgent, Configuration, Performance, Source,
Volume* - ordinary French words, several borrowed by English in the other
direction. Round 1 had called every locale-specific match "a termbase ruling";
a cognate is not a ruling, it is a fact, and routing it to a reviewer wastes the
review and eventually gets a correct word "fixed".

The floor is now five classes cut two ways - locale-independent (1-3) vs
locale-specific (4-5), fact (1-4) vs decision (5) - and **the termbase owns
class 5 only**. The driver was restated with it: shared vocabulary stock first,
then borrowing policy, with script deciding only whether a borrowing survives as
byte-identical text. That explains what "script" alone could not - `vi` 43
against `fr` 116, same script, same translatedness, different shared stock.

`french/terminology-and-loanwords` gained **FR-COGNATE**, the anchor a reviewer
can cite to dismiss such a finding. The file already named the false friend
(same spelling, different meaning) and had no name for its twin.

**Round 3 - the skeleton class in RTL.** Class 2 was written as
locale-independent with identity as the *required* outcome. True in LTR only: a
string with no words can still carry directional work. Arabic's only
skeleton-class match is `"{label}: {pct}%"`, and `{label}` resolves sometimes to
a Latin platform name and sometimes to translated Arabic - the AR-BIDI-ISOLATE
case, with percent glue on AR-BIDI-REVIEW's rendered-pass checklist by name.

Deliberately **not** recorded as a shipped defect: it is an `aria-label`, so the
consequence is announcement order, and nothing was rendered. Recorded as a fact
about the instrument - it returns an affirmative *no finding* on the one Arabic
string its neighbour says needs a rendered pass. Third blind instrument after
the diff and the word-level review; the only one blind affirmatively.

**Arabic needed no edit.** AR-BIDI-REVIEW already owns the whole claim. The
round's correct output was to change the craft subject and leave the language
subject alone.

## Yield curve

Round 1 earned a technique; round 2 a structural correction plus a language-
subject rule; round 3 a scope correction plus a confirmation. High -> moderate ->
confirmation-heavy, the shape the loop design predicts. **dry_streak still 0** -
no round returned all-confirmed-with-nothing-earned.

Not saturated, but the cheap axes are spent: format capability, vocabulary
stock, and direction have each been probed once. CJK was checked in passing and
returned nothing new (`ja`/`zh` residues are Latin runs inside CJK text -
`Webhook`, `Web`, `ID`, `Persona` - which is normal and already covered).

**Next probe, when there is one:** the technique's claims are now all about
catalogs it was measured on. The honest next step is a second *tree*, not a
fourth round here - see [[localization]] under what is owed.
