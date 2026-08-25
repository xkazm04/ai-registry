---
layer: technique
type: technique
subject: chinese
technique: register-and-address
status: forged
laws: [the-authority-is-a-hypothesis, every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing 您 vs 你 for a product, auditing register consistency in a zh catalog, softening imperatives in Chinese UI copy]
---

# Register and address

Chinese verbs do not conjugate for formality, so the entire register system of
a product's Chinese voice lives in three places: the second-person pronoun
(您/你), the politeness marker 请, and how readily pronouns are dropped. That
concentration is the technique's leverage — register is decided once and
audited mechanically — and its danger: a single inconsistent translator
produces a product that audibly changes tone between screens.

## ZH-NIN · one "you", chosen once, everywhere

**Trigger:** any string addressing the user in the second person.
**Rule:** the product uses exactly one of 您 (formal) or 你 (informal), recorded
as a per-product ruling, applied in every string — body copy, tooltips, error
messages, empty states, onboarding. Derived forms follow (您的/你的, and the
plural 你们 only ever pairs with 你; 您 has no comfortable plural in UI copy —
recast to avoid needing one).
**Choosing:** professional, B2B, financial, or government-facing products take
您; a consumer product with a deliberately casual voice may take 你. Published
authorities split — traditional mainland software convention favors 您, while
some major consumer style guides moved to 你 for warmth — which is why the
choice is a recorded ruling, not a re-litigated preference. Microsoft's
Simplified Chinese style guide is the standard citation for the concise,
reader-respecting default register.
**Exception, found by over-applying:** marketing surfaces inside an otherwise-您
product (campaign banners, celebratory empty states) sometimes read stiff in
您; if the product wants 你 there, the split must itself be recorded as a
ruling with a surface boundary, or reviewers will "fix" both directions
forever.
**Audit:** grep both pronouns; every occurrence of the non-chosen pronoun is a
citable finding. In one real 11.5k-key catalog the count was 428 您 to 81 你 —
the catalog had a de facto ruling at 84% coherence, and the correct move was
to standardize the minority, not to reopen the question.

## ZH-QING · 请 marks consequence, not routine

**Trigger:** an imperative sentence or action label.
**Rule:** prefix 请 to requests where the action has weight or the sentence
addresses the user in prose — 请确认, 请重试, 请先保存更改 — because a bare
imperative in a full sentence reads as a command barked at a stranger. Do NOT
prefix 请 to routine control labels: buttons and menu items are bare verbs
(保存, 取消, 删除), and 请保存 on a button is over-politeness that also burns
the 2–4 character budget (see the length rules in ui-conventions-and-length).
**Decision rule:** if the string is a sentence, consider 请; if it is a
control label, never 请.

## ZH-PRONOUN-ONCE · address once, then drop

**Trigger:** a multi-clause sentence or short paragraph repeating 您/你.
**Rule:** Chinese drops subject pronouns wherever context carries them, far
more readily than English. Keep the pronoun for the first reference where
warmth or clarity needs it, then drop it: 点击头像即可查看设置, not
您可以随时点击您的头像来查看您的设置. Microsoft's Simplified Chinese guide
states this directly: pronouns need not be translated when meaning is
unaffected. Three pronouns in one UI sentence is a reliable
machine-translation tell — the de-anglicization side of this same rule is
treated in de-anglicization-constructions, but the rule lives here because
the *choice of what remains* is a register decision.
**When not to drop:** legal and consent language, where the explicit 您
carries the acknowledgment ("您同意…"), and disambiguation between the user
and a third party.

## When not to use this technique

Do not re-open a settled register ruling because a batch of new strings
"feels" like the other pronoun — the cost of a switch is a full-catalog sweep,
and mixed register during the transition is worse than either choice. And do
not apply UI register rules to translated documentation prose wholesale:
long-form docs tolerate (and often want) fuller pronoun use than microcopy.
