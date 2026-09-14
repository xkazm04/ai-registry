---
layer: technique
type: technique
subject: translation-quality-measurement
technique: language-scoped-check-exemptions
status: forged
laws: [every-finding-cites-an-anchor, the-authority-is-a-hypothesis]
shared_with: []
use_when: [a deterministic check fires on correct text in one language, adding a target language to an existing check suite, a check is about to be disabled for a whole project because one language fails it, deciding where a check suite's per-language behaviour is recorded]
---

# Language-scoped check exemptions

A deterministic check encodes a rule about text, and most such rules are quietly
rules about *some* languages. "The target ends with the source's terminal
punctuation" is right for most European targets and meaningless for a language
that does not close sentences with a full stop. Where the rule meets a language
it does not hold for, it raises findings on correct text — findings that are
unanchored in exactly the sense
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
forbids, because the rule they cite does not apply to the language they are about.

## The design two implementations converged on

Two independent implementations — a continuous-localization platform and an open
translation toolkit, each about twenty years in production — ship the same shape,
read in their code: **a generic check is skipped or adjusted by language, never
weakened globally.** Neither loosens the terminal-punctuation check for everyone
because some languages lack a full stop; both keep the check strict and attach
the language facts to it. Two designs arriving independently at one shape over
that span is what earns it a rule here.

The facts they carry teach well as language facts — not as a table to copy, and
not as an exhaustive one:

- Terminal-punctuation checks are meaningless for languages that do not end a
  sentence with a full stop — Thai among natural languages, Lojban among
  constructed ones.
- Text in the CJK scripts may use its own full-width stop and colon as the
  equivalent of the source's.
- The danda serves as the sentence end in several South Asian scripts; a check
  demanding a full stop there demands an error.
- Greek writes its question mark with a glyph that looks like a semicolon, so a
  check looking for the Latin question mark fails correct Greek.
- Armenian marks exclamation differently from the Latin convention, so a
  sentence-final exclamation check misreads it.
- Basque text may open an exclamation with an inverted mark, which a check
  expecting only the closing mark must accept.
- Khmer is exempt from zero-width-space rules: it writes words without spaces and
  relies on that character at word boundaries.
- Capitalization checks are meaningless for the ~28 languages one implementation
  lists whose scripts have no case.
- Doubled-word checks need per-language allowlists: in French *nous nous* and
  *vous vous* are grammatical reflexives, not typos.

## Two shapes of exemption, which must not merge

The list holds two different things. Some languages **skip** a check: Thai
terminal punctuation is not a check with a different answer, it is no check.
Others **accept an equivalent**: a Greek question still needs its question mark,
and only the glyph that satisfies the check changes. Record an equivalent as a
skip and real defects pass — a Greek question with no mark at all goes through.
Record a skip as an equivalent and the check keeps demanding something the
language does not have. Every exemption record states which shape it is.

## Rules

- **An exemption is data on the language, not a flag on the project.** Whether
  Thai ends sentences with a full stop does not vary between products. A project
  switch is re-decided by every project, usually by whoever is unblocking a
  build, and is lost when the next project starts. Key the exemption on the
  language — or on the script, where the fact belongs to the writing system, as
  case does.
- **It is recorded where the language's rules live, so every consumer inherits
  it.** In this bundle that is the language subjects: each holds its own block of
  check exemptions and equivalents beside its punctuation and typography rules,
  and a check suite reads those blocks rather than keeping a private copy.
- **A check with no exemption list has not been asked the question yet.** It is
  not universal; it is untested beyond the languages its author wrote in. Before
  a new check gates anything, run it once over correct text in every supported
  language and read what it flags — a count, as
  [the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis)
  requires, applied to a check instead of a style guide.
- **The absence of a check for a language is itself a claim, with its reason
  written beside it.** "Skipped for Thai: no sentence-final full stop" is a
  ruling. A check silently disabled for a locale is indistinguishable from one
  somebody switched off to make a build pass.
- **Never weaken globally to fix one language.** Loosening a check for everyone
  because one language fails it removes the check from every language it was
  right for, and nothing reports the loss.

This is the decidable-first lane of
[deterministic-checks-before-estimates](./deterministic-checks-before-estimates.md)
seen from the other side: a deterministic check is a verdict only in the
languages its rule holds for, and outside them it is a false positive carrying a
verdict's authority.

## When not to use it

- **To excuse a real defect.** An exemption is a fact about a language, never
  about a translation. When one is proposed because a batch fails, count the
  failures first: most such proposals are defects looking for a waiver.
- **For product style.** A product that drops terminal punctuation from its
  button labels has a style rule, and that belongs in the product's copy contract,
  not in the language's exemption block — where it would export one product's
  taste to every consumer of the language.
- **Copied from an implementation.** Neither implementation's list is complete,
  and their rule data is not ours to take. The language subjects derive their
  blocks from each language's own orthography and cite it.
