---
layer: application
type: application
subject: arabic
technique: register-and-address
stack: process
status: forged
verified_on: 2026-08-24
---

# Register, address and terminology in Personas Desktop's Arabic

Personas Desktop (`C:\Users\kazda\kiro\personas`) settled its Arabic register
decisions in `docs/i18n/style-ar.md`, derived from the shipped,
voice-consistent portion of `src/i18n/locales/ar.json`. The guide is a clean
instance of the default posture the register technique describes, with the
corpus counts that justify it.

## The default posture, chosen and counted

The guide mandates formal MSA (فصحى), never dialect (AR-MSA), and
masculine-singular imperatives for full-sentence instructions — اختر, أدخل,
افتح, الصق — justified exactly the way the technique predicts: Arabic has no
gender-neutral second person, masculine singular is the unmarked professional
default ("100% of this corpus's existing imperatives" per the guide), and it
is the shortest form for buttons. The consistency claim is a count over the
shipped file, not an assertion — the authority-is-a-hypothesis discipline
applied at guide-writing time.

## AR-MASDAR, discovered from the corpus

The verbal-noun button convention was read *out of* the shipped file rather
than imposed: the guide observes the corpus's buttons are "almost entirely
masdar form" — حفظ, حذف, إلغاء, نسخ, تعديل, تحديث — and promotes that
observation to a rule, reserving imperatives for full-sentence hints
(اختر شخصية, أدخل مفتاح API). Likewise the article convention: sidebar/tab
labels are definite (الوكلاء, الإعدادات, القوالب), buttons drop الـ (حفظ not
الحفظ). Status copy uses the impersonal frames — تم النسخ, تم الحفظ,
جارٍ التحميل (AR-PASSIVE-STATUS), and length guidance follows the register:
buttons cut not wrapped (حفظ ومتابعة named as the practical two-word
ceiling), status cells single-word (جارٍ, مكتمل, فاشل, ملغى), sentences given
room because Arabic agreement runs full copy ~15–25% over English.

## The one-concept incident: persona vs agent

Pitfall §1 records a live drift of exactly the one-concept-one-rendering
defect: the English source distinguishes "Personas" (`…personas` keys) from
"Agents" (`sidebar.agents`), but the shipped `ar.json` translated both to
الوكلاء, erasing a glossary-mandated distinction. The recorded fix reserves
الوكلاء strictly for source strings literally saying "agent(s)" and restores
الشخصيات for personas — with the operational lesson attached: check the
English key/value before choosing a term, not the surrounding UI.

## Loanword policy, exercised

The guide's loanword table is a per-product instance of AR-LOAN-NATIVE done
decisively: الرمز not التوكن, التخزين المؤقت not الكاش, متصفح not براوزر,
مزامنة not سينك, لوحة المعلومات not الداشبورد — plus the frozen-list behavior
of AR-LOAN-FROZEN (API/CLI/JSON/MCP/OAuth verbatim, "ايه بي اي … must not
start now") and AR-LOAN-COMPOUND splits (مفتاح API, خادم MCP, مصادقة OAuth).
The 32-row termbase itself — شخصية, قالب, الخزنة, توأم and the rest — is the
product artifact that stays in the repo; what transplants is that every row
is a single recorded rendering an audit can cite by key.
