---
layer: technique
type: technique
subject: chinese
technique: de-anglicization-constructions
status: forged
laws: [clean-strings-stay-untouched, every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing zh strings that smell machine-translated, refining MT output into idiomatic Chinese, writing audit rules for translationese]
---

# De-anglicization constructions

Machine-translated Chinese is almost never ungrammatical — it is *structurally
English*, wearing Chinese words over English syntax. Because the defects are
structural, they recur in enumerable patterns, and each pattern below is a
citable rule: a reviewer flags 触发器的条件 by anchor, not by taste. That
matters doubly here because unanchored "make it more natural" passes are how
already-idiomatic Chinese gets degraded — every rule states its trigger
narrowly so the clean strings stay untouched.

## ZH-DE-CHAIN · compounds drop 的

**Trigger:** 的 between a modifier and its head noun in a label, title, or
compound — especially two or more 的 in one noun phrase.
**Rule:** Chinese noun-noun compounds join directly: 触发条件, not
触发器的条件; 用户设置, not 用户的设置. English needs "of"/possessive
scaffolding for every relation; MT propagates it as 的, and stacked 的
(系统的默认的配置) is a certain MT tell. In UI labels and titles, default to
zero 的; in prose sentences, one 的 per clause is normal and a genuine
possessive keeps it (您的账户).
**Reversion boundary:** do not strip 的 where removal changes the parse —
新的用户界面 ("the new UI") vs 新用户界面 ("the new-user interface") differ in
meaning; over-stripping was tried and reverted in real catalogs. The rule
targets *relational* 的 between nouns, not adjectival 的 that disambiguates.

## ZH-BEI · the 被-passive is marked; English passive is not

**Trigger:** 被 rendering a neutral English passive.
**Rule:** English passive voice is neutral plumbing ("the file was saved");
Chinese 被 historically carries adversative color and, even in modern
technical usage, reads heavy when it merely mirrors English structure.
Prefer, in order: the notional passive (文件已保存 — topic + result, no
marker), an active recast (已保存文件 / 系统已保存文件), or 由 for agentive
attribution (由管理员审核). Reserve 被 for genuinely adversative or
agent-focused events where it earns its weight: 账户已被锁定 is fine — the
lock happened *to* the user.
**Decision rule:** if inserting "unfortunately" before the English passive
would be absurd, 被 is probably wrong; try 已 + verb first.

## ZH-CONNECTIVE · drop the scaffolding English requires

**Trigger:** clause connectives translated word-for-word.
**Rule:** Chinese coordinates by juxtaposition far more than English; every
dictionary-rendered connective is scaffolding to justify, not keep. The
recurring offenders: 如果…的话 (the …的话 is redundant with 如果 — keep one);
当…时 wrapping every English "when" (plain juxtaposition or 时 alone usually
suffices, and 当 opening every conditional is an MT signature); 以及 where a
plain 和 or an enumeration 、 belongs; 请注意，… transplanting "Please note
that…" (state the fact; Chinese does not announce it); 为了 fronting every
"in order to" (the bare verb purpose clause is idiomatic). Microsoft's
Simplified Chinese style guide's standing instruction — break long English
sentences into several short Chinese ones — is the same rule at sentence
scale: keep the propositions, drop the subordination.

## ZH-PRONOUN-DROP · pronouns beyond the first are English residue

**Trigger:** repeated 您/你/它/我们 across clauses of one string.
**Rule:** after first mention, Chinese drops subject and possessive pronouns
that context carries; MT keeps them because English must. 点击头像即可查看设置,
not 您可以随时点击您的头像来查看您的设置. The register side of this rule
(which pronoun, and where warmth wants one kept) lives in
register-and-address; here the audit signal is simply density — two or more
identical pronouns in one UI sentence is flaggable.

## ZH-CODE-SWITCH · translate the whole sentence or none of it

**Trigger:** an English content word left inline mid-Chinese-sentence.
**Rule:** a half-translated sentence (无 pending reviews) reads as broken,
not bilingual — measurably worse than falling back to the full English
string. Either the sentence is fully Chinese (with do-not-translate terms as
the *only* Latin islands: brands, acronyms, code identifiers), or it is left
untranslated and flagged for review. Not knowing the right word for one part
is a flag-for-review case, never a license for partial translation.
**Boundary:** this rule never fires on legitimate Latin islands — 使用 API
密钥登录 is correct Chinese containing a settled do-not-translate term.

## When not to use this technique

Never run these rules as a scripted rewrite: every one has a meaning-bearing
exception (的 disambiguation, adversative 被, legal pronouns), and the
refine discipline is per-finding, not per-file. And do not apply UI-microcopy
compression to documentation or legal prose, where fuller connectives and
explicit pronouns are often correct — the trigger contexts above say "label",
"UI sentence", "string" deliberately.
