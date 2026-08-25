---
layer: technique
type: technique
subject: korean
technique: register-and-honorifics
status: forged
laws: [the-authority-is-a-hypothesis, every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing the register mix for a new Korean product surface, auditing register consistency across a catalog, reviewing button and label endings]
---

# Register and honorifics

Every Korean sentence ends in a register. The localization decision is not
whether to be polite — that floor is fixed — but which polite registers serve
which sentence functions, and the decision must be recorded before bulk
translation begins because it is embedded in every sentence's final syllables
and cannot be regexed in later.

## KO-REGISTER · the two-register product mix

**Rule.** Product UI uses exactly two sentence registers, dispatched by
sentence function:

- Declaratives — status, confirmations, results, descriptions, errors →
  **합쇼체**: `-습니다`/`-입니다`/`-됩니다`. ("언어가 변경되었습니다")
- Directives — instructions, hints, empty-state guidance, CTAs written as
  sentences → **해요체**: `-세요`/`-하세요`. ("계속하려면 이름을 입력하세요")

**Never:** 반말 (`-해`, `-야`, `-줘`) in any product surface — it reads as a
toy or an insult. **Never:** the formal command `-십시오` in new translation —
it reads dated and institutional. Published vendor style guides of the 2000s
prescribed `-십시오` for software instructions, and current consumer-facing
guidance from the same vendors has moved to warmer registers; this is a live
authority-versus-usage divergence, so the product records its choice once
(the modern default: `-세요`) and reviewers cite the recorded ruling, not
their personal ear. A B2B product wanting more gravity shifts *more sentences
into 합쇼체 declaratives*; it does not resurrect `-십시오`.

**Consistency scope is the surface, not the string.** One dialog, one
notification channel, one settings page holds one mix. The audit signal is
mechanical: grep the ending classes and eyeball surfaces where both `-습니다`
and `-어요`-family declaratives appear for the *same* function — mixed
declarative registers on one screen is a defect; 합쇼체 declarative next to
해요체 instruction is the intended design.

## KO-NOUNFORM · chrome takes noun forms, messages take sentences

**Rule.** Buttons, menu items, tabs, column headers, badges, and short labels
take a **bare noun or nominalized verb stem with no sentence ending**: 저장,
취소, 닫기, 편집, 삭제, 다시 시도. Messages, tooltips of sentence length,
and any string with a subject take full conjugated sentences per KO-REGISTER.

A conjugated button (저장합니다, 저장하세요 on a plain button) is a register
error even though each form is individually polite: the button is a label
naming an action, not an utterance addressed to anyone. The `-기`
nominalization (닫기, 되돌리기) and the bare Sino-Korean action noun (저장,
취소) are both standard; pick per term in the termbase and keep it stable —
one concept, one rendering applies to the *form*, not just the word.

**Exception, found by over-application:** a CTA that is rhetorically a
promise or invitation ("시작하기" vs "시작하세요" on an onboarding primary
button) legitimately varies by product voice. The rule fixes the *default*
(noun form); a product's recorded voice ruling may promote specific hero CTAs
to sentence form. Unrecorded sentence-form buttons remain defects.

## KO-PRONOUN · recover subjects by omission, never by 당신

**Rule.** Do not translate English subject pronouns. Korean omits the subject
when context supplies it, and UI context almost always does. 당신 ("you") is
banned from microcopy — in modern usage it is intimate, confrontational, or
ad-copy-toned, never neutral. When a sentence seems to need its subject,
restructure: passive-to-active inversion, topic fronting, or naming the
object instead ("당신의 파일이 저장되었습니다" → "파일이 저장되었습니다").

Possessive "your" drops the same way: "your settings" is 설정, not 당신의
설정 or 귀하의 설정. 귀하 belongs to contracts and formal letters, not UI.
A tolerated residue: long-form prose (release notes, onboarding essays) may
use 여러분 for a collective audience; tooltips, errors, and buttons may not
use any second-person form at all.

## KO-HONORIFIC-VERB · subject honorifics point at the user, not the system

**Rule.** The honorific infix `-시-` and honorific verb substitutions
(드리다 for 주다, 말씀 for 말) elevate the *user's* actions, never the
product's own. "선택하신 항목" (the item you [honored] selected) is correct
deference; the system describing its own acts honorifically
("저장하셨습니다" for an autosave the system performed) is a comedy error
machine translation produces by pattern-matching politeness. The system's
own actions take plain polite forms (저장했습니다/저장되었습니다); offering
something to the user may take 드리다 ("알려 드립니다"). When in doubt, ask
who the verb's subject is: user → `-시-` permitted; product → never.

## When not to apply

Marketing landing copy, community content, and in-app character voices run
warmer mixes (해요체 declaratives, occasional exclamations) by design; those
surfaces get their own recorded register ruling rather than inheriting the
UI mix. The technique governs product chrome and messages — the surfaces an
audit sweeps in bulk.
