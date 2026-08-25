---
layer: application
type: application
subject: korean
technique: register-and-honorifics
stack: process
status: forged
verified_on: 2026-08-24
---

# Process: register calibration by counting the shipped catalog

How Personas (`C:\Users\kazda\kiro\personas`) settled its Korean register mix
in `docs/i18n/style-ko.md` — a worked example of KO-REGISTER and KO-NOUNFORM
being *calibrated against a shipped catalog* rather than legislated from a
style authority, i.e. the authority-is-a-hypothesis law applied to register.

## The counted ruling

The guide's register section does not argue from taste; it counts the
shipped `ko.json` (~14,500 lines): **142 occurrences of `-습니다` endings,
93 of `-세요` endings, zero `-십시오`, and 7 stray `당신`** (all in
long-form release notes, none in UI microcopy). The ruling codified from
those counts is exactly this subject's two-register mix:

- 합쇼체 (`-습니다`/`-입니다`) for status, confirmations, descriptions —
  e.g. `"언어가 변경되었습니다"`.
- 해요체 (`-세요`/`-하세요`) for instructions and CTAs phrased as
  sentences — e.g. `"확인하려면 {name}을(를) 입력하세요"`.
- Bare noun/verb-stem for buttons and menu items — `저장`, `취소`, `닫기`;
  the guide explicitly marks `저장합니다` as wrong *for a button*.
- 반말 and `-십시오` both banned, with the guide's characterization worth
  preserving: `-십시오` reads as "a military manual", 반말 as "a casual
  chat assistant" — neither is a competent operator tool. Its Pitfall #4
  gives the triple: `"지금 저장해"` (wrong, 반말) / `"지금 저장하십시오"`
  (wrong, parade-ground) / `"지금 저장하세요"` (right).

The zero-`-십시오` count is the interesting datum: it settles, for this
product, the live divergence between older vendor style guidance (which
prescribed `-십시오` for software instructions) and modern usage — settled
by measurement, recorded where the rule lives, never re-litigated per
string.

## The 당신 discipline

The guide operationalizes KO-PRONOUN as a hard microcopy ban with a
tolerated long-form residue (those 7 release-note occurrences), plus the
constructive instruction: restructure to drop the subject rather than
inserting 당신 to satisfy an English sentence's shape. This is the
per-surface scoping this subject teaches — the rule is absolute for
tooltips/errors/buttons, relaxed only in a named surface class.

## Length interaction

The guide's length section ties register to width budget: buttons target
2–4 Hangul syllables, which the noun-form rule makes achievable (저장 vs
저장하겠습니다); table headers drop particles entirely (`상태`, not
`상태는`). Register form and length discipline are one decision in
practice, not two.

## What generalized upward and what stayed downstairs

Upward: the count-then-rule method (occurrence counts as the register
ruling's evidence), the function-dispatched two-register mix, the
noun-form button rule with its wrong-example, and the surface-scoped 당신
ban. Downstairs: the specific counts, the product's operator-tool voice
positioning, and every product-named example string.

## Verification

Verified 2026-08-24 against the personas tree: `docs/i18n/style-ko.md`
sections "Register & address" (counts and forms), "Length discipline"
(syllable budgets), and "Pitfalls" #4.
