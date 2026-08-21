---
layer: technique
type: technique
subject: inclusive-job-advertising
technique: advisory-lint-gated-on-substance
status: forged
laws: [absence-of-evidence-is-not-evidence, inference-must-look-like-inference, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [wiring a posting lint into an editor, deciding when a check may fire at the writer, a quality panel is being ignored or switched off]
---

# Advisory lint gated on substance

The concern: the *delivery* of posting findings. A check that is correct and
delivered badly is turned off, and once it is off its correctness is worth
nothing. Three properties make the difference between a check writers use and
one they mute: it is **advisory**, it is **silent until the draft has
substance**, and it draws each fact it reports from a **single shared
predicate** so no two surfaces disagree.

## Advisory, not blocking

The findings are advice to a human author who may have context the rules do not
have. Hard-blocking on a phrase list produces three failures, reliably:

- **Evasion.** The writer rephrases past the rule. The posting is no better and
  the check now believes it is.
- **Collapse of trust.** Any phrase list is wrong some of the time — quotations,
  product names, roles where the flagged word is literal. A wrong finding that
  merely advises costs a second of annoyance; a wrong finding that blocks
  publication costs the whole tool its standing, and takes the correct findings
  with it.
- **Optimization against the checker.** Once findings gate a workflow, writers
  optimize the finding count, not the posting. A count that can be driven to
  zero by deletion will be.

What may legitimately gate publication is narrow and different in kind: a
**stated fact that policy requires and that is measurably absent** — a
disclosure obligation, an approval, a required field satisfied concretely
rather than nominally. That is a policy gate reading a three-state predicate,
not a lint reading prose. Keep the two mechanisms separate, and never let a
policy gate be satisfied by a phrase.

Per [inference must look like
inference](../../_laws.md#inference-must-look-like-inference), the findings
also render in the grammar of advice: named phrases with named fixes, not a
score, not a percentage, not a compliance verdict. A number invites the writer
to move the number.

## Gated on substance

A check that fires on a three-word stub is nagging. The writer who learns in
the first minute that the panel shouts at an empty document will ignore it in
the tenth, when it is finally right.

So findings are suppressed until the draft has **enough body to be judged** —
a minimum character count of real body text, defined once as a named threshold
and shared by every surface that decides whether to nag. The threshold is a
proxy for "the author has expressed an intention", and the right value is
empirical, set by which failure you fear: too low and the panel nags a stub,
too high and a short-but-real posting sails through unchecked. The safer error
is *low* — the point of the gate is to survive the first sentence, not to
excuse a terse posting from review — so a few dozen characters of trimmed body
is a defensible landing zone and a few hundred is usually already too many.
Pin the value in a test so it cannot drift silently.

Two refinements matter more than the exact number:

- **Gate on body substance, not on total document length.** A document made of
  a filled title, a location dropdown and an empty description has length and
  no substance; it must not be judged, and it must not be counted as checked.
- **Suppressed is not clean.** Per [absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence), a draft under
  the threshold shows *not yet checked*, never a green state. A writer who sees
  a passing check on an empty draft has been taught the check means nothing.

## One predicate per fact

Every surface that asks the same question about a posting — does this role
state a salary, is this posting ready to publish, should we prompt for a band —
must call the **same predicate**. Two implementations drift within a release,
and the drift always surfaces the same way: one screen calls the posting
complete while another nags about it, and the writer concludes both are
unreliable.

The rule generalizes: the lint, the publication gate, the prompt-for-a-band
nudge, the candidate-facing card and any outbound copy read one source of truth
for "does this role have a stated salary". That predicate returns the three
states — stated, absent, gestured-at — and each surface decides what to do with
them. Surfaces disagree about *action*; they never disagree about *fact*.

## The findings are typed, and the type is closed

A finding is **structured data with a canonical kind**, not a sentence. The
prose the writer reads is composed at render time from the kind plus its
values, in the language of the surface. Freezing the sentence inside the engine
makes the engine monolingual and makes every copy change a code change —
[meaning does not live in a
label](../../_laws.md#meaning-does-not-live-in-a-label) applies to the
checker's own output as much as to the posting's.

The kind vocabulary is **closed and exhaustively handled**. The failure this
prevents is specific and observed: a display layer that maps findings to copy
through a chain of conditionals will, when a new kind is added, fall through to
whichever label sits at the end of the chain — so a brand-new finding renders
under an unrelated, confidently-worded message. The remedy is a mapping that is
total over the vocabulary and fails loudly on an unknown member, so adding a
finding kind without adding its copy is caught before it ships rather than
discovered as a mislabelled finding in front of a writer.

## Procedure

1. Define the substance threshold once, as a named constant, next to the
   predicate that uses it.
2. Compute findings only when body substance clears the threshold; otherwise
   return the explicit not-yet-checked state.
3. Return findings as a list of typed items — phrase, reason, suggested fact —
   ordered by cost, fact-shaped findings first.
4. Expose the fact predicates separately from the prose findings, so a policy
   gate can consume the fact without consuming the advice.
5. Run the check on every edit. It is a rules pass; if it is expensive enough
   that this is a problem, it has stopped being this technique.
6. Apply the check to seeded, templated and generated drafts too. A sample
   posting that would fail the lint teaches the house style more effectively
   than the lint teaches against it.

## Decision rules

- **When a finding is advice, it never blocks.** When a requirement is policy,
  it blocks and it is not a finding.
- **When the draft is under the threshold, report not-checked.** Never clean,
  never a finding.
- **When two surfaces need the same fact, they share the predicate or one of
  them is wrong.** There is no third option that survives a release.
- **When a rules check would need a model to decide, it is out of scope.** The
  always-on lint stays deterministic, instant and free; anything needing
  judgment moves to an explicit, invoked, clearly-labelled assist.

## When not to use it

- **Not for checks whose findings are legally required to be resolved.** Those
  belong to the policy gate, where refusal is the point.
- **Not for a check that cannot run on every keystroke.** A costly or
  nondeterministic check delivered as an always-on panel produces flicker,
  latency, and findings that change on identical text — which destroys the
  writer's ability to learn the rules.
- **Not as the product's only quality signal.** An advisory lint measures text
  against a list. Whether the advertisement worked is measured at the funnel,
  and a lint with no conversion measurement behind it will slowly accumulate
  rules nobody validated.
