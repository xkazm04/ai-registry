---
layer: technique
type: technique
subject: arabic
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding how a tech term renders in Arabic, auditing transliterations and Latin tokens in an ar catalog, building or reviewing an Arabic termbase]
---

# Terminology and loanwords

Every technical term entering an Arabic catalog takes one of exactly three
paths, and the defects in real catalogs are almost all a term on the wrong
path: **translate** (native MSA word), **keep in Latin** (frozen identifier),
or — rarely and only when settled by wide usage — **Arabize** (an assimilated
borrowing written in Arabic script). The paths are policy, not taste, so an
audit can cite them; the specific term-to-rendering rows belong to the
consuming product's termbase, never to this subject.

## AR-LOAN-NATIVE · Native MSA is the default for generic concepts

A generic tech concept gets its MSA word: متصفح (browser), مزامنة (sync),
إشعار (notification), تنزيل (download), خادم (server), إعدادات (settings),
التخزين المؤقت (cache). Spoken tech Arabic reaches for the transliterated
loan — الكاش, الداشبورد, سينك, براوزر — and models trained on forum Arabic
reproduce it, but in written MSA software copy the transliteration marks the
string as unedited machine output. The published Arabic style authorities
(Microsoft's Arabic style guide most explicitly) are aligned: prefer the
established Arabic term; borrow only where no established term exists.

The hard sub-rule: **never mint a new transliteration.** When a generic term
has no obvious MSA rendering, the answer is a descriptive native phrase
(قائمة الانتظار for queue, لوحة المعلومات for dashboard) decided once and
recorded in the product's termbase — not a phonetic respelling that splits the
difference. Minted transliterations are unsearchable, unpronounceable
consistently, and unrecoverable once shipped, because users learn them.

## AR-LOAN-FROZEN · Identifiers stay Latin, verbatim, uninflected

Brands, protocol and format names, acronyms, commands, and code-adjacent
identifiers stay in Latin script exactly as the source writes them: `API`,
`JSON`, `OAuth`, `URL`, `HTTP`. Three bans, each a real observed failure
class:

- **No phonetic respelling**: ايه بي آي for API is never correct in software
  copy — it destroys recognizability and searchability.
- **No re-casing**: acronyms keep source casing untouched; Arabic has no case
  to map onto, so any casing change is pure corruption.
- **No Arabic morphology bolted on**: no Latin plural `s`, no Arabic
  broken-plural applied to an acronym, no attached Arabic clitics that fuse
  the token (write واجهة الـ API or recast; when the genitive frame gets
  awkward, put the frozen token in a construct with a native head noun:
  مفتاح API, not APIالـ).

Which terms are frozen is the product's do-not-translate list — a termbase
artifact. What this rule owns is the *behavior* toward any frozen token:
byte-verbatim, uninflected, and stable.

## AR-LOAN-COMPOUND · Compounds split: translate the generic, freeze the identifier

A compound mixing a generic word with a frozen identifier translates the
generic half and freezes the other: مفتاح API (API key), خادم الوسائط (media
server), مصادقة OAuth (OAuth authentication), عنوان URL. The construct (iḍāfa)
with the native noun as head is the natural frame, and it also solves the
article problem — the Latin token never takes الـ directly. The failure modes
are translating the identifier half (rendering a protocol name into Arabic) or
freezing the whole compound in English because one word of it is frozen; both
are findings, and the second one quietly grows the untranslated surface of the
catalog over time.

Every such split renders as a bidi seam at runtime — a Latin run inside an RTL
sentence — so compounds are exactly where the bidirectional technique's
rendered-review rules apply hardest.

## AR-ARABIZED · Assimilated borrowings are legitimate — when usage settled them

Some borrowings are fully assimilated MSA with native morphology and universal
currency: تلفزيون, إنترنت, فيديو, بريد إلكتروني's الكتروني element, كمبيوتر
(competing with the purist حاسوب). These are words, not transliterations, and
insisting on the purist alternative everywhere is the over-applied extreme:
حاسوب vs كمبيوتر is a genuine per-product register choice, and academy-coined
purisms nobody uses (حاسوب's more obscure siblings) make copy read as
officialese. Decision rule: an Arabized form is acceptable when a major
published style authority or dominant real-world usage backs it; it is chosen
*per concept, once*, recorded in the termbase, and never mixed with its rival
([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)).
When authority and a coherent existing catalog disagree, count before
enforcing — the catalog's settled choice wins and the ruling is recorded, per
[the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis).

## Auditing terminology (what a finding cites)

- Transliterated generic (الكاش) → AR-LOAN-NATIVE; major, with the termbase
  row (or a minted one) as the replacement.
- Respelled / re-cased / inflected identifier → AR-LOAN-FROZEN; major, and
  critical when the token is machine-matched (a command, a protocol constant).
- Half-translated or over-frozen compound → AR-LOAN-COMPOUND.
- Two renderings of one concept across the catalog → the consolidation is
  mechanical to detect, but each candidate needs a judgment ruling — most
  doubles are legitimate sense distinctions (execution vs run as different
  source concepts), and a scripted merge destroys them.

## When NOT to apply

User-generated content, quoted material, and proper names of third parties
are not terminology — they render verbatim. And a product legitimately
overrules any default here (a brand voice that embraces a colloquial loan);
that is a house ruling that lives, recorded, in the product's termbase — the
technique's job is that the choice is *made once and cited*, not that a
particular column wins.
