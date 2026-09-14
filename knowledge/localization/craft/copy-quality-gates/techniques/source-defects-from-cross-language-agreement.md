---
layer: technique
type: technique
subject: copy-quality-gates
technique: source-defects-from-cross-language-agreement
status: forged
laws: [the-source-locale-is-the-source-of-truth, every-finding-cites-an-anchor]
shared_with: []
use_when: [a multi-locale catalog has target findings and no view of what caused them, deciding what goes into the source owner's defect register, choosing which untranslated strings deserve attention first]
stage: team
---

# Source defects from cross-language agreement

Every locale's translator works from one shared input. When translations of the
same source unit fail checks in **two or more languages**, the likeliest common
cause is the thing those languages share — the source — rather than two
independent translators making mistakes on the same string. One platform ships this
as a deterministic rule (code-verified, 2026-09): a unit whose targets fail checks
in at least two languages is raised as a **source** finding, and the finding names
which check failed in which language.

It is cheap because it computes nothing new. The per-target findings already exist;
the signal is a group-by over them, keyed by source unit. And it is new to a gate
that looks only at targets, because a target gate by construction files every one of
those failures against the locale that produced it.

## Why agreement points upstream

[The source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
says a source defect caps every locale at once and belongs to the source's owner.
The practical difficulty has always been *finding* one: an ambiguous string does not
look ambiguous in its own language, and the localizer who notices it can only work
around it in theirs. Cross-language agreement is the view nobody inside one locale
has. A placeholder of unstated type, a fragment with no sentence, a missing plural
or an idiom with no neutral reading surfaces as a placeholder, punctuation or
unchanged-from-source failure in several languages, each one looking like a local
slip.

The finding is only as good as the independence behind it. When every target came
from one engine run with one context payload, the languages share the engine and the
context as well as the source, and agreement points at all three. The source owner
triages; a finding the owner clears is recorded against the check or the pipeline,
so the register does not fill with defects nobody can fix. No measured precision for
this signal is in evidence — it enters the register as a triage item, and the
register's own verdicts are what count one.

## The threshold

Two languages is the cheapest useful floor. Raising it trades recall for precision:
each added language makes a shared cause more certain and lets through the defects
that only some languages' grammar exposes. The floor is an absolute count, not a
share of locales — a product with four locales and a threshold of half fires at the
same place as two, while a threshold of five can never fire at all. Count only
languages where the failing check actually applies; a check disabled for a language
is not a pass there.

## The handoff

These findings go to the **source owner's defect register**, and they are the
highest-yield entries in it: one fix is multiplied by every locale, including the
ones that have not been translated yet. Many resolve in the contract rather than the
string — a missing context note, a term with no termbase row, a surface with no
declared budget — which is why the register sits beside
[copy-contract-before-drafting](./copy-contract-before-drafting.md) and not beside a
translation queue. Each finding carries its anchors per
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor): the
check identifier and the language for every failure that made it.

## The relative-deficit signal

The same implementation ships a second source-routing signal: a string that has
stayed untranslated for a long time **relative to its own component's translation
rate**. A fixed staleness window flags everything in a slow component and nothing in
a fast one. A relative deficit isolates the unit its neighbours moved past, and a
unit translators keep skipping while clearing everything around it is a question to
put to the source before it is a staffing question. The sibling measurement subject's
multi-model disagreement signal is the probabilistic counterpart of both; this one
needs no model.

## Procedure

1. **Group the gate's target findings by source unit** after every run.
2. **Raise a source finding when failures span the threshold of languages**, listing
   each language with its failing check identifier.
3. **Exclude languages the check does not apply to, and any pseudo-locale**, from
   the count.
4. **File the finding in the source owner's register**, ranked by locales affected
   and by the surface's weight.
5. **Compute the relative deficit per component** and file the outliers beside the
   agreement findings.
6. **Record the owner's verdict** — source fixed, contract amended, check wrong,
   pipeline cause — so the signal's precision is counted rather than assumed.

## Decision rules

- **When a unit fails checks in two or more languages, file a source finding before
  fixing any target**, because a target fix made first hides the cause while the
  other locales keep paying for it.
- **When all targets came from one engine run, read agreement as a shared-input
  signal**, because the engine and its context are shared inputs too.
- **When a unit stays untranslated while its component moves, route it to the
  source first**, because a relative deficit is a property of the unit, and an
  absolute age is a property of the team.
- **When the owner clears a finding as a check or pipeline cause, fix that instead**,
  because the same false agreement will recur on every unit the cause touches.

## When not to use it

- **With fewer than two checked locales.** There is nothing to agree.
- **On transcreated units**, where each locale is expected to depart from the source
  and a failing unchanged-from-source or length check may be the design.
- **As a replacement for target findings.** A source finding explains the failures;
  it does not clear them, and each target still has to pass once the source is fixed.
