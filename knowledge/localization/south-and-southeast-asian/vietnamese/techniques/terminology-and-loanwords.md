---
layer: technique
type: technique
subject: vietnamese
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [choosing Vietnamese renderings for technical terms, deciding whether a term stays borrowed or gets translated, consolidating term drift in a vi catalog]
---

# Terminology & loanwords

Vietnamese builds its technical vocabulary from three strata, and every term
decision is a choice among them: **Sino-Vietnamese** compounds (the Chinese-derived
formal stratum — productive, precise, register-raising), **native** vocabulary
(shorter, concrete, warmer), and **English loans** kept as-is. French loans (a
fourth, older stratum: ê-tô, ăng-ten) matter mostly as precedent — they show
Vietnamese assimilates loans as invariant nouns, which is exactly how English tech
loans behave now. The craft is not knowing the strata; it is making the choice
*once per concept*, recording it, and knowing which failure each stratum invites.

## VI-STRATUM · choose the stratum by abstraction and audience

**Trigger:** a technical concept needs its Vietnamese rendering decided.
**Rule:** default ladder —
1. An established Sino-Vietnamese term exists and is current → use it
   (authentication → xác thực, deploy → triển khai, administrator → quản trị
   viên). This is the backbone of software Vietnamese; it reads professional
   without reading bureaucratic.
2. A native word covers the concept at the right abstraction → prefer it where
   the Sino term would over-formalize a everyday action (run → chạy, save → lưu,
   delete → xóa — the high-frequency verbs are native and short).
3. Neither fits → keep the English loan (VI-LOAN).
The register failure modes are symmetric: an all-Sino string reads like a
government circular (and Sino compounds are the *long* rendering — see
ui-conventions-and-length); an all-native paraphrase of a precise concept reads
folksy and loses the term's identity; an all-loan string reads like developer
chat and excludes non-technical users. B2B admin surfaces tolerate — expect —
more Sino and more loans; consumer surfaces pull toward native and fewer loans.
**The drift hazard:** Sino-Vietnamese near-synonyms sharing a syllable (năng lực
/ khả năng, tác nhân / tác tử) are the characteristic split when independent
translators work disjoint sections — both defensible, one catalog. That is
[one concept, one rendering](../../../_laws.md#one-concept-one-rendering) in its
Vietnamese-specific costume, and the consolidation scan must match on the shared
syllable stem, not the whole compound.

## VI-LOAN · when a term stays English

**Trigger:** deciding borrow vs. translate.
**Rule:** keep the English term when it meets any of the motivations Microsoft's
Vietnamese guide sanctions: translation would be ambiguous or unclear for a new
concept; the loan is already the familiar form for Vietnamese users (file may
translate, cache mostly does not; API, USB, PC always stay); the term is a
proper noun or a name; or the translation is unusably long for its UI slot.
The productive test to teach a termbase: **is it a name or a concept?** Product
names, feature names with exactly one referent, model and plan names are names —
they never translate, and translating a plan's *brand* name into a descriptive
adjective is a real and recurring defect (the plan stops being findable in
billing). Concepts translate unless a motivation above fires.
**Source:** Microsoft Vietnamese style guide, borrowed-terms section.

## VI-LOAN-INVARIANT · a loan is a Vietnamese noun the moment it lands

**Trigger:** any borrowed term in running Vietnamese text.
**Rule:** the loan inflects for nothing: no English plural -s (3 workflow, not
3 workflows), no possessive morphology, and it takes Vietnamese syntax around
it — classifiers when counted, các/những when marked plural, modifiers *after*
it per VI-WORDORDER. Casing: a loan kept as a common noun is lowercase
mid-sentence (the user can have many of them); a loan kept as a proper name
keeps its source casing everywhere. The boundary case that trips catalogs: one
word used both as a feature's proper name and as a common noun for its
instances — the name is capitalized, the instances are not, and the termbase
must carry both rows or translators will unify them the wrong way.

## VI-TERM-AUTHORITY · the published glossary is a hypothesis

**Trigger:** enforcing a vendor glossary row or house termbase row against a
living catalog.
**Rule:** count before enforcing. Vietnamese tech terminology is still moving —
public glossaries carry renderings that shipped software has since abandoned,
and a coherent catalog beats a stale authority row per
[the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis).
Two Vietnamese-specific reasons the count matters more here than in European
locales: the Sino stratum generates plausible near-synonyms freely, so an
authority row and a catalog's settled term can both look right; and calque
hazards hide in semantics, not form — a rendering can be a correct literal
translation and still import a wrong metaphor (a "healing" feature rendered
with the medical cure verb tells users the software is sick; the recovery-frame
compound says what the feature does). When the catalog wins, correct the row in
place and record the ruling so no later pass re-litigates it.

## What stays downstairs

The actual termbase — which rendering THIS product chose for agent, vault,
credential — is the consuming repo's artifact, as are its do-not-translate brand
list and every recorded overruling. This technique supplies the decision ladder,
the invariance grammar, and the failure taxonomy those artifacts instantiate.
