---
layer: technique
type: technique
subject: quality-verdict-integrity
technique: stale-superseded-unknown-classification
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [reading a stored verdict back, rendering quality state to a reviewer, migrating a fingerprinting scheme]
---

# Stale / superseded / unknown classification

A recorded verdict read back is not valid-or-invalid. It occupies one of a small
closed set of standings that say *how much of the present it still speaks for*,
and every consumer — a gate, a dashboard, a batch grader, a reviewer's banner —
resolves the same standing from the same rule. This technique is that vocabulary
and the order the rule evaluates it in.

## The vocabulary

| Standing | Established by | Speaks for the present? |
| --- | --- | --- |
| `superseded` | the standard it was issued under is no longer in force | no |
| `current` | fingerprint present, comparable, and equal to the content's | yes, fully |
| `stale` | a *proven* mismatch — comparable fingerprint that differs, or a dateable verdict older than the content's last write | no |
| `unknown` | provenance cannot be established: no fingerprint recorded, or one recorded under a superseded scheme | not confirmable, and not refutable |

Four values, not three and not five. Merging `stale` into `unknown` throws away
the distinction between *we checked and it changed* and *we cannot check* —
which is exactly the distinction the asymmetric handling downstream depends on.

## The evaluation order

Order matters; these are not independent predicates.

1. **Standard first.** If the verdict was issued under a superseded standard,
   it is `superseded` and the content comparison is not even attempted. A
   verdict from an obsolete instrument bound perfectly to unchanged content is
   still not a statement about current quality.
2. **Comparability second.** If a fingerprint is recorded but was computed under
   a superseded scheme, stop: `unknown`. Do not compare. This step exists
   entirely to prevent step 3 from producing a false `stale`.
3. **Comparison third.** Fingerprint present on both sides and comparable:
   equal is `current`, different is `stale`.
4. **Dating fallback fourth.** No fingerprint recorded, but the verdict is dated
   and the content records its last write: a verdict predating the write is
   `stale`. Parse both timestamps tolerantly — records written by different
   layers over a system's life carry different formats, and comparing them as
   strings is a silent wrong answer. An unparseable date is not a date.
5. **Otherwise `unknown`.**

## The migration rule — the expensive one

When the fingerprinting scheme changes, every stored fingerprint becomes
incomparable *at once*. What that degrades to decides whether the quality layer
survives its own maintenance:

- Degrade to `stale` and every standing condemnation in the system retires in a
  single deployment. No alert fires. Quality appears to improve. Nobody
  reviews the content that was being held.
- Degrade to `unknown` and the condemnations survive, labelled as unconfirmable,
  with a queue of re-judging to do that is visible rather than silent.

The second is the only defensible choice, and it must be *designed in* — the
comparability check has to run before the comparison, which is not the order
anyone writes by accident.

## State the reason

`unknown` carries a sentence saying which of its two causes applies: no binding
was ever recorded, or the binding was recorded under a named superseded scheme.
Without it, a fingerprinting migration reads to every reviewer as an era in
which nobody bothered to record bindings, and the natural response — "clean up
the unbound rows" — destroys real evidence.

Render the standing as a word and a glyph, never as a colour alone, and pair it
with a one-line statement of what it means for this artifact. A standing that
only a colour distinguishes is a standing half the readers cannot see.

## Decision rules

- **When the standing is anything but `current`, the artifact is not counted as
  having current quality.** This includes `unknown`, which condemns without
  counting as measured — [unmeasured is not a
  pass](../../../_laws.md#unmeasured-is-not-a-pass).
- **When a verdict loses standing, retire it from the score, never from the
  record.** Superseded and stale verdicts stay visible as evidence; they are the
  only way to audit what was believed and when. The store is append-only; the
  filter lives on read.
- **When two consumers need "current quality", they call the same predicate.**
  A second implementation of "which verdicts count" is a second answer.
- **When a standing is computed on a server that holds the content and rendered
  by a client that does not, send the standing.** A client that re-derives it
  from partial data will fabricate it.

## When not to use this

- **When there is exactly one consumer and it re-grades on every read**, the
  vocabulary is overhead — nothing is ever stored long enough to have a
  standing. Adopt it at the moment verdicts start being reused, which is the
  moment grading gets expensive.
- **When the artifact has no meaningful "now"** — a one-shot evaluation of a
  frozen benchmark set — the standing is always `current` by construction, and
  the version dimension is the only live one.
- **Do not extend the vocabulary casually.** Every added value is a value every
  consumer must decide how to treat, and consumers that do not know a value
  will treat it as the default. If a fifth standing seems necessary, check
  first whether it is a *reason* attached to an existing standing rather than a
  new standing.
