---
layer: technique
type: technique
subject: sourcing-campaign-honesty
technique: missing-fact-as-a-warning-code
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [generated campaign copy comes out thin and the team wants to know why, designing the output contract of a copy generator, deciding what to show a recruiter alongside a draft]
---

# Missing fact as a warning code

The concern: what a generator emits **instead of** the sentence it could not
honestly write. The answer is a structured, per-fact diagnostic naming the
absent fact and the angle it would have unlocked — never filler, and never a
generic quality warning.

## Why a code and not prose

A thin draft with no explanation is read as a defective tool. The recruiter's
options are to accept weak copy or to write it themselves, and the hand-written
version restores every claim the gate removed. So the diagnostic is not a nicety
— it is the mechanism that keeps the honesty constraint acceptable in daily use.

For it to work it has to be three things at once:

- **Per fact, not per draft.** "Copy quality may be limited" tells nobody
  anything. "No pay fact" names an action.
- **Attached to a consequence.** The recruiter is not filling in a form field;
  they are buying a sentence. Naming what the fact would have produced — the
  pay hook, the location line, the growth angle — converts a chore into a
  trade.
- **Machine-readable.** A closed set of codes, not free text, so that the
  surface can render them consistently, the completeness check can consume
  them, and their frequency can be counted across roles. The distribution of
  codes over a quarter is the highest-value output of this whole technique: it
  says which fact the organization systematically fails to capture, which is a
  process problem, not a copy problem.

## Procedure

1. **Define the code set from the fact slots**, one code per fact a format can
   consume, plus a small number of composite codes where an angle needs two
   facts together.
2. **Compute the codes from the fact set, not from the produced copy.** This is
   the detail that decides whether the technique works. A diagnostic derived by
   inspecting the output has to guess whether a beat is missing, disagrees with
   itself between a model-generated draft and a fallback draft of the same
   record, and can be silenced by copy that merely mentions the topic without
   stating the fact. Derived from the facts, the codes are identical on every
   generation path, stable across regenerations, and available *before* any
   copy exists — which means the recruiter can be warned at the point they
   press generate rather than after they read a disappointing draft.
3. **Name the consequence in the code's rendered text**, in the recruiter's
   language: *no stated pay — the compensation line was omitted from all three
   assets*.
4. **Rank the codes by what they cost.** Not all absences are equal; the pay
   fact and the work-mode fact carry most of the conversion weight, and a
   recruiter who is shown seven equal-weight warnings will act on none.
5. **Route each code to whoever can supply the fact.** Some are the
   recruiter's, some are the hiring manager's, and a warning aimed at the
   wrong person is noise. Where the fact is defaulted rather than absent, the
   route is a confirmation rather than a data-entry task.
6. **Never let a code become a block by default.** A campaign with three
   absences is worse than one with none and better than a hand-written one
   with three inventions. Blocking belongs only where a disclosure is legally
   required.

## Decision rules

- **Absence renders as absence.** Per [absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence), the copy omits
  the beat and the code states the omission. The forbidden alternative is
  filling the slot with genre language — "competitive package", "flexible
  working", "great team" — which is how a system that never invents a *value*
  still ships a false impression. Per [say only what the record
  holds](../../_laws.md#say-only-what-the-record-holds), silence plus a
  diagnostic beats a euphemism every time.
- **A code is a claim about the record, never about the candidate or the
  role's quality.** "No pay fact" is a statement about data. "This role is
  unattractive" is a judgment the generator has no standing to make and a
  recruiter will resent.
- **Thin copy ships.** The technique exists so that thin output is legible and
  therefore tolerable; a design that quietly refuses to generate until the
  record is complete gets abandoned in favour of a text editor.
- **One code per fact, stable over time.** Renaming or splitting codes destroys
  the cross-role frequency analysis that is the technique's compounding value.
- **Codes on the wire, words in the catalog.** The code is a stable identifier
  the generator emits; the sentence the recruiter reads is a localized string
  the surface resolves. A generator that emits a human sentence has hard-coded
  one audience's language into a contract, and the sentence then cannot be
  reworded without a change to the producer. It also lets the consuming surface
  ignore a code it does not recognise instead of rendering a raw token at
  someone.
- **Some facts collapse into one code.** Where two facts can each satisfy the
  same beat — a named place or a stated work mode both ground the location line
  — one code covers the pair and fires only when both are missing. Two codes
  for one omission double-counts the absence and over-weights it in the
  frequency analysis.
- **The code set is shared with the publication-readiness check.** The facts
  that make a role postable and the facts that make copy substantive are
  nearly the same set; two vocabularies for one absence produce two screens
  that disagree about whether the role is ready.

## When not to use it

- **Not where the fact is deliberately withheld.** Confidential roles,
  undisclosed pay by explicit policy, unannounced teams — a warning fires
  forever and trains the recruiter to ignore the panel. Mark the withholding
  on the record and suppress the code, which is different from suppressing it
  because it is annoying.
- **Not as a completeness score.** A percentage collapses exactly the
  information the codes carry — which fact, worth what — into a number that
  gets optimised.
- **Not as a substitute for an intake conversation.** A recurring code across
  many roles is evidence that the intake step never asks for that fact. Fixing
  it in the warning panel is treating the symptom at the most expensive point.
