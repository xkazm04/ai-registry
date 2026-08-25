---
layer: technique
type: technique
subject: czech
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether to borrow naturalize or translate a term into Czech, pinning grammatical gender for a loanword, auditing a Czech catalog for term drift and false friends]
---

# Terminology and loanwords

Czech tech vocabulary is a negotiation between a borrowing-happy professional
register and a fully inflecting grammar that makes every borrowed word answer
questions English never asked it: what gender is it, how does it decline, and
does an established Czech word already own the concept. Loanword decisions
are the number-one source of translator-to-translator drift, so the technique
is mostly about *deciding once, recording the decision, and enforcing it* —
the per-word calls themselves are usually easy.

## The three-tier decision

Every English term entering the catalog lands in exactly one tier, recorded
in the product's termbase (the termbase itself is the consuming product's
artifact; the tiers and tests are the transplantable part):

1. **Borrow as-is** — raw English spelling, usually undeclined: terms whose
   Czech professional community uses the English word (*pipeline*,
   *screening*, *onboarding*, *dashboard*), industry abbreviations (AI, CV,
   API, HR), and short labels where the loan fits a space the native word
   cannot. Test: would a Czech practitioner say this word aloud in a Czech
   sentence at work? If yes, forcing a native coinage (*pracovní postup* for
   a term of art) reads bureaucratic and breaks the register the users
   actually speak.
2. **Naturalize** — Czech spelling, full declension, ordinary Czech noun:
   loans Czech absorbed long ago (*konektor*, *kokpit*, *agent*, *flotila*,
   *monitor*). Writing these in English spelling, or leaving them
   undeclined, reads as an error, not as branding. The tell that a word
   belongs here is an established Czech spelling in general dictionaries.
3. **Translate** — the default for everything with a living Czech word:
   *rozhodnutí* (decision), *nabídka* (offer), *šablona* (template),
   *spouštěč* (trigger), *upozornění* (alert). When in doubt, translate —
   tier 1 is earned by usage evidence, not by translator fatigue.

The tiers are per-*sense*, not per-word: one English word may borrow in a tab
label and translate in body copy (a short loan that fits a tab, spelled out
natively in sentences) — legitimate exactly when the split is recorded as a
rule, because unrecorded it is indistinguishable from drift.

## CS-LOANGENDER · One grammatical gender per loanword, catalog-wide

> **Rule** — a borrowed noun cannot appear in a Czech sentence until it has a
> gender; pin it in the termbase and make every adjective and predicate
> agree. Default: masculine inanimate for a consonant-final loan (*ten
> dashboard*), feminine for *-a* finals — unless Czech usage has settled
> otherwise (*ta pipeline* is the majority Czech form despite the
> consonant). Alternatively pin a Czech head noun and agree with that.
> A catalog with *"strukturovaný dashboard"* beside *"dashboard je hotová"*
> audits clean under every grammar rule and is still a terminology error.
> **Source** — agreement per standard Czech grammar; the pinning discipline
> is craft, minted from repeated audit findings.

Where real usage is split (as with *pipeline*), the pin is a judgment call —
but an *unmade* pin is a defect factory, because each translator resolves it
independently and agreement rides on the resolution.

## CS-ONE-WORD · One concept, one word

> **Rule** — before inventing a rendering, check the termbase. If the concept
> is not there and you decide it, **add the row** — the decision is the
> deliverable, not the string. Two renderings of one concept across a product
> is a terminology error even when both are good Czech.
> **Source** — MS §5.3 (terminology); the law
> [one concept, one rendering](../../../_laws.md#one-concept-one-rendering).

Czech makes consolidation harder than most languages: inflection means the
same rendering surfaces in a dozen forms, so drift detection must match on
stems with diacritics folded, and the ruling on each candidate is judgment —
most candidates are legitimate different senses. Expect drift as a certainty
between independently translated sections and budget a consolidation pass.

## CS-HOMONYM · Don't reuse a settled word for a second concept

> **Rule** — the inverse of CS-ONE-WORD, and invisible to it. Once *shoda*
> is the settled rendering for one concept (a match), reusing it for a
> second (a tie) is a defect even though the second use is fine Czech in
> isolation. Czech's compact core vocabulary makes these collisions common:
> *pole* (a form field / a field of candidates), *nabídka* (an offer / a
> menu). When the second concept arrives, it — not the incumbent — finds a
> new word.

## False friends and near-misses

The Czech/English false friends that recur in product catalogs, worth a
standing reviewer checklist: *evidence* (Czech = record-keeping/registry,
not proof — proof is *důkaz*); *aktuální* (= current, not actual);
*eventuálně* (= possibly, not eventually); *kontrola* (= a check/inspection —
fine for review, but *kontrolovat* ≠ to control); *rubrika* (= a newspaper
column in ordinary Czech; the assessment-rubric sense is niche jargon);
*certifikát/kredence* traps around "credential" (the settled UI phrase is
*přihlašovací údaje*); *metered* mistranslated via *metr* (metre) rather
than measured usage. A false friend passes every mechanical check — it is
correctly spelled, declined, and gendered — so it is caught only by reading
for sense or by a listed trap.

## Enforcing against a live catalog

The termbase is a hypothesis until counted. Before enforcing any row — or
adopting an authority's preferred token — count occurrences in the live
catalog: when the catalog is coherent on one form and the termbase says
another, four independent reviewers flagging the termbase row as stale is
the signal to fix the row, not the catalog. Sweep-once discipline: a settled
term decision is applied in one coordinated pass across every namespace,
because a half-swept rename is worse than either consistent state.

## When NOT to apply this technique

Proper nouns and third-party product names are do-not-translate by default —
including their official localized brandings, which are *their* owner's
decision to make, not the localizer's; when the third party publishes a
Czech branding, use exactly theirs, never a word-order calque of the English.
And do not consolidate across register boundaries the product runs
deliberately (a marketing surface keeping a loanword the working UI
translates) when — and only when — that split is recorded as a ruling.
