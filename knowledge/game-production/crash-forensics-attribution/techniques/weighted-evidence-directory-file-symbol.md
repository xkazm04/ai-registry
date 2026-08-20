---
layer: technique
type: technique
subject: crash-forensics-attribution
technique: weighted-evidence-directory-file-symbol
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [scoring a call stack against subsystem candidates, building the naming dictionary a triage tool matches against, a triage tool keeps blaming the wrong subsystem]
shared_with: []
---

# Weighted evidence: directory over file over symbol

The concern: a call stack frame carries several naming fragments, and they are not equally
informative about ownership. Scoring them equally is why naive triage blames whichever
subsystem has the most generic function names.

## The specificity ordering

Three fragment kinds, in strictly decreasing evidential value:

**Directory — the strongest.** A directory in a mature codebase is a deliberate
organisational statement. Somebody decided this code belongs beside that code, and that
decision is the closest thing to a declared subsystem boundary that exists in source form.
It is authored by a human with intent, it survives refactors of individual files, and it is
rarely coincidental.

**File name — middling.** Also authored, also intentional, but noisier. Files get split,
merged and renamed for reasons unrelated to ownership, and a concept name can legitimately
appear under two subsystems (a "component" file exists everywhere).

**Symbol name — the weakest, and the one that misleads.** Function, method and class names
are generic and shared across every subsystem ever written. `Update`, `Tick`, `Init`,
`Execute`, `Destroy`, `GetValue`, `Apply` are English, not evidence. A symbol match is often
a coincidence of vocabulary rather than a fact about ownership, and a scorer that weights it
like a directory will be steered by whichever subsystem happens to use the most common verbs.

## Calibration

Weights of **3 / 2 / 1** for directory / file / symbol work well and are what to start from.
What matters is not the exact values but two properties:

- The ordering is **strict** — never equal, never inverted.
- The gap is wide enough that a directory hit is not routinely outvoted by an accumulation of
  symbol hits on the same frame. With 3/2/1 a single directory hit needs three symbol hits to
  match it; that is roughly the right exchange rate given how often symbol hits are noise.

State the weights in one place with a comment justifying each from what the fragment *is*.
A weight you cannot justify in a sentence is a weight fitted to your historical corpus rather
than to the evidence, and it will not survive the codebase moving.

## The dictionary is per-project and you must build it

The fragments are matched against a mapping from naming substrings to subsystem names. There
is no universal mapping. A tool that ships one is asserting facts about a codebase it has not
read.

Procedure for building one:

1. **Enumerate the subsystems you are willing to name.** Six to twelve is the useful range.
   Fewer and the attribution is not actionable ("gameplay"); more and the margin gate can
   never be satisfied because adjacent candidates split each other's evidence.
2. **Walk the top-level source layout and record which directories map to which subsystem.**
   These become your highest-value entries. Prefer the directory names the codebase actually
   uses over the names people say in meetings.
3. **Add distinctive file-name stems** — concept words that appear almost exclusively under
   one subsystem.
4. **Add symbol fragments only where they are genuinely distinctive.** A subsystem-specific
   prefix or a class-name root qualifies. A bare verb never does. When in doubt, leave it out;
   a missing weak entry costs a little score, a wrong weak entry costs a wrong attribution.
5. **Test against known-diagnosed crashes you did not use to build the dictionary.** Held-out
   evaluation, or you are measuring how well you remembered the answers.

## Matching rules

- **Score every rule against every piece of evidence; never let rule order decide.** A
  first-match scan down an ordered list credits a crash to whichever pattern happens to sit
  earliest, and the result is systematically wrong in a way that looks arbitrary: a crash in
  the enemy-behaviour directory files under combat because the combat rule was tested first
  and the symbol contains the word "attack"; a save-archive crash files under inventory
  because the symbol is a deserialise-inventory method. Ordering is not evidence. Accumulate
  every match and let the score and the gates decide.
- **Match on tokenised text, never on raw substrings.** Split identifiers and paths into words
  first — on case humps, underscores and path separators — lowercase them, and match with word
  boundaries. Raw-substring matching is what makes a two-letter subsystem token match the
  middle of an unrelated identifier, and it is the single largest source of imprecision in a
  naming dictionary. This is what lets a short, high-value token be safe to keep.
- **Down-weight a weak rule, or delete it — but prefer deleting a catch-all.** A pattern that
  matches a suffix nearly every class in the engine carries adds noise to every comparison
  while never being able to carry an attribution on its own. Split out its useful half as a
  specific rule and drop the rest.
- **Count each fragment kind at most once per frame per candidate.** A frame whose path
  contains a subsystem token three times is one piece of evidence, not three. Without this
  cap, deeply nested paths dominate the whole score.
- **Let one frame contribute to several candidates.** A crash genuinely at a boundary should
  produce two competing scores — that is exactly the signal the margin gate needs. Forcing a
  winner per frame destroys the information that makes declining possible.
- **Keep a per-candidate list of which frames contributed and at which weight.** The score
  alone is unfalsifiable; the contributing frames are what a human checks the verdict against,
  and they are what makes a wrong attribution diagnosable rather than mysterious. Emit the
  trace strongest-contribution-first, each line naming the candidate, the points, the evidence
  kind, the raw text and the frame index.
- **Rank deterministically.** Sort by score descending and break ties on a stable key such as
  the candidate name. A verdict that depends on hash-map insertion order is a verdict that
  changes between runs on identical input, and it will be discovered by someone who no longer
  trusts the tool.

## Decision rules

- When a fragment kind is absent from a frame (no path, symbol only — common in stripped or
  optimised builds), score what is present and do not impute. Missing evidence is missing, not
  neutral.
- When the same quantity — "how strongly does this frame indicate this subsystem" — would be
  computed by two code paths, collapse them. Two scorers disagreeing about the same crash is
  worse than one scorer that is occasionally wrong, because the disagreement is invisible.
- When you are tempted to add a subsystem to the dictionary to explain one crash, do not. Add
  it when it names a team that could own a ticket.
- When the dictionary and the review-routing taxonomy diverge, treat that as a defect in one
  of them. A project with two subsystem vocabularies has neither.

## When not to use

Do not use naming evidence at all when the crash carries a stronger, direct signal — an
explicit subsystem tag in the fatal record, a module attribution from the runtime itself, an
assertion whose message names its own owner. Direct evidence outranks inferred evidence;
naming weights are the fallback for stacks that carry no such statement, which is most of
them but not all.

Do not use this scoring on a stack that has been symbolised badly. Frames resolved to the
nearest exported symbol in a stripped build produce plausible-looking names that are not the
functions that ran. Detect this (implausible symbol repetition, missing paths across the whole
stack) and report unknown rather than scoring noise.
