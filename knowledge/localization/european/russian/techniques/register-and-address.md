---
layer: technique
type: technique
subject: russian
technique: register-and-address
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing or auditing the address register of a Russian catalog, reviewing imperatives and pronoun forms in UI strings, deciding verb form for a button versus an instruction]
---

# Register and address

Russian address register is decided once per product and then enforced
mechanically, because it is carried by verb morphology on nearly every actionable
string — which also means every string is a place to drift. The rules below are the
anchors an audit cites; each is checkable by grep-plus-morphology, no taste
required.

## RU-VY · formal вы, carried by the verb ending

**Trigger:** any string that addresses the user — imperative, question, statement
about their action.

**Rule:** address the user in the formal вы register, expressed by the verb form
itself: second-person plural imperative in `-ите` / `-ьте` («Выберите»,
«Сохраните», «Настройте»), second-person plural in statements («вы вошли»). Do not
insert the pronoun «вы» as an explicit subject before an imperative — «Вы выберите
папку» is not politer, it is broken. The pronoun appears only where grammar
requires it as object or possessive («нажмите Esc, чтобы закрыть», «ваших
агентов»).

**Source:** the published Russian localization style guides of the major OS vendors
prescribe вы-address for software; it is the unmarked register for business,
developer and professional products.

**Exception:** ты is a legitimate deliberate brand voice for youth-market consumer
products — but only as a recorded product-level decision applied to the whole
catalog. A single ты-form inside a вы catalog is always a defect, whichever
register the product chose («Настрой коннектор» inside a file of «Настройте…» is
the classic drift shape, usually imported from a chat-register machine-translation
suggestion).

## RU-VYCAP · no politeness capital in UI

**Trigger:** any occurrence of «Вы / Ваш / Вам / Вас» capitalized mid-sentence.

**Rule:** in software text, вы and all its forms are lowercase except where
ordinary capitalization rules apply — sentence-initial position, or a standalone
label that consists of the pronoun alone. The politeness capital «Вы» belongs to
personal correspondence addressed to one identified individual; UI text addresses
an anonymous plurality, so the capital is out of place, and it is doubly wrong when
it appears inconsistently (which it always eventually does, because translators
disagree about it string by string).

**Source:** a major OS vendor's published Russian style guide prescribes lowercase
вы for software; Russian orthographic authorities restrict the capital to direct
personal address.

**Exception:** none in UI. Marketing e-mail written to a named recipient may
legitimately capitalize; that is a different genre with a different contract, and
mixing the two conventions inside one catalog is itself a finding. Note also that
this is a per-language ruling: neighboring Slavic and Germanic locales *do*
capitalize the formal pronoun, so a reviewer working across locales must not
harmonize them — the German or Czech convention imported into Russian reads as a
foreign calque.

## RU-VERBFORM · infinitive on controls, imperative in instructions

**Trigger:** translating a verb-labeled control (button, menu item) or an
instructional sentence.

**Rule:** verb-labeled controls take the bare perfective infinitive: «Сохранить»,
«Отменить», «Удалить», «Продолжить». Instructional prose addressed to the user
takes the вы-imperative: «Выберите папку для сохранения», «Перетащите файл сюда».
The infinitive on a control names the *action the control performs*; the
imperative in prose *tells the user what to do* — Russian UI convention keeps
these distinct where English uses the same bare verb for both. Applying the
imperative to a button («Сохраните» as a button label) reads as the machine
pleading; applying the infinitive to an instruction reads as a checklist fragment.

**Source:** long-standing Russian software convention, codified in the major
vendors' Russian style guides.

**Exception:** short question-form dialogs may label buttons with response words
(«Да», «Нет», «Готово») rather than verbs — those are not covered by this rule.
Noun labels («Настройки», «Справка») are likewise outside it; do not verb a
control that English nouned.

## Choosing register for a product

The decision procedure, for the one moment it is actually open:

1. Professional, developer, B2B, financial, medical, government → вы. No survey
   needed; ты in these domains reads as either condescension or a children's
   product.
2. Consumer with a deliberately casual brand voice, young audience → ты is
   *possible*, and commits the whole catalog: every imperative, every possessive,
   every notification. The cost is ongoing — every future translator must be told,
   because their default is вы.
3. Mixed surfaces (a professional tool with a marketing site) may split register by
   surface, never within one.

Record the ruling where translators will find it. Register findings are only
enforceable against a recorded decision — an audit that flags ты against an
unstated preference is taste, and the fix for that is to write the decision down,
not to argue string by string.
