---
layer: technique
type: technique
subject: japanese
technique: de-anglicization-constructions
status: forged
laws: [format-skeleton-is-inviolable, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing Japanese strings for translationese, rewriting a machine-translation pass into natural Japanese, placing placeholders correctly in Japanese sentences]
---

# De-anglicization constructions

The constructions here are the grammar of English showing through a Japanese
surface. Each is individually small and grammatically legal, which is exactly
why machine passes and hurried translators ship them: nothing is *wrong*, and
yet a native reader identifies the string as translated within a clause. Each
rule is written trigger-first so an audit can find the pattern mechanically —
and because these are refinement rules, they operate under the refine
discipline: rewrite only what a rule flags, never "improve" a clean string in
passing ([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)).

## JA-DROP-PRONOUN · omission is the default, あなた is the exception

**Trigger:** あなた, あなたの, 私, 我々 in UI text; more subtly, a subject or
possessor stated where context already supplies it.

**Rule:** Japanese omits the subject and the possessor whenever discourse
context recovers them, and in second-person UI text it always does — the
reader knows the interface is talking to them. English *requires* "you" and
"your", so a translation that keeps them per-sentence（あなたのファイルが
保存されました）is marked as translated by its pronouns alone. Drop them:
ファイルを保存しました. The possessive usually vanishes without replacement;
where disambiguation is genuinely needed (my items vs shared items), Japanese
prefers a role noun（自分の, 共有）over the pronoun.

**Exception:** contrastive contexts where the pronoun does real work —
account-deletion confirmations addressing the person as distinct from their
data, legal consent text, settings that distinguish *your* view from the
team's. The test: remove the pronoun and read it back; if nothing became
ambiguous, the pronoun was English residue.

## JA-DEKIMASU · say できます, not することができます

**Trigger:** 〜することができます, and its family（〜することが可能です）.

**Rule:** the long potential construction is the word-for-word image of
English "it is possible to ..." and is the single most recognizable
machine-translation cadence in Japanese. Use the direct potential form:
保存することができます → 保存できます. Same meaning, half the length, native
rhythm. The long form survives legitimately only where the nominalized clause
is doing structural work (a contrasted pair of clauses, a formal document
register) — in UI strings, effectively never.

**The wider family:** the same nominalization reflex produces 〜することが
必要です (→ 〜する必要があります or 〜してください) and 〜を行うことが
できます (→ 〜を行えます／〜できます). Flag the pattern, not just the one
phrasing.

## JA-PLEASE · courtesy lives in the verb form, not in stacked softeners

**Trigger:** every English "please" rendered as an extra word; どうぞ or
お願いします bolted onto a してください sentence.

**Rule:** 〜してください already carries the full courtesy of English
"please do X" — the politeness is morphological, not lexical. Stacking
どうぞ／お願いします on top produces over-polite wobble, the mirror image of
rudeness and just as marked. Conversely, an English imperative ("Try again")
must gain the request form（もう一度お試しください）— carrying the bare
imperative over is a register defect (see the register technique's
JA-NO-IMPERATIVE).

**Related residue:** "Please note that ..." is a set English hedge; its
Japanese is ご注意ください appended, or nothing — not 注意してください
prefixed as a command. "Sorry, ..." in error text usually disappears:
Japanese error convention states the situation, and a per-error apology reads
as either insincere or alarming.

## JA-PARTICLE-PLACEHOLDER · placeholders sit inside Japanese grammar

**Trigger:** a placeholder in a Japanese sentence — especially one still in
its English source position, or one whose surrounding particle assumes a
value class the runtime will not deliver.

**Rule:** particles, not word order, assign roles in Japanese, so a
placeholder must (a) move to where Japanese wants its role stated —
[position is not part of the skeleton](../../../_laws.md#format-skeleton-is-inviolable),
moving it is required, not permitted — and (b) receive the particle its
runtime value can actually wear. The failure modes:

- *Frozen English order:* {user} が {file} を削除しました is fine — but a
  translation that keeps "Deleted {file} by {user}" order produces a sentence
  no particle assignment can save.
- *Particle–value mismatch:* a placeholder that interpolates a full phrase or
  an English word must not be wrapped in particles that assume a bare noun of
  a particular class; and a placeholder interpolating a *verb phrase* into a
  noun slot（{action}を実行）breaks when the source feeds it a sentence.
  When the value class is unknowable, restructure so the placeholder stands
  in apposition — 「{name}」を削除します — the kagi brackets neutralize its
  grammar.
- *Counter assumptions:* {count} 件 assumes the runtime formats a bare
  number. If the source sometimes feeds "many" or a range, the counter
  construction breaks — that is a source defect to report upstream, not a
  reason to drop the counter.

## JA-TENSE-ASPECT · English tense mapped, not copied

**Trigger:** completed actions reported with ます (non-past) or progressive
〜しています where the event is already done; "was/were ..." rendered
mechanically as past passive.

**Rule:** Japanese UI reports a completed action with 〜しました
（保存しました）, an in-progress one with 〜しています（保存しています or
保存中）, and a state with 〜されています. English present perfect ("has been
saved") maps to plain 〜しました, not to a constructed 〜されてしまいました;
English passive is usually rewritten as active-with-omitted-subject, because
Japanese passive carries an adversative shading（削除されました can read as
"was deleted, to my detriment"）that neutral status text does not want.

## When not to apply this technique

These rules calibrate *UI prose*. Marketing copy deliberately breaks several
(pronouns for intimacy, rhetorical repetition); literary and conversational
content follows its own register. And never apply any of these rewrites in
bulk from pattern-match alone: each trigger earns a look, and the string is
rewritten only when the flagged construction is actually English residue —
the patterns have legitimate uses, which is why they survive review so well.
