---
layer: technique
type: technique
subject: quality-gates
technique: match-the-resolved-artifact
status: forged
laws: [gate-sees-target, failure-not-empty-success, count-carries-predicate, deletion-is-not-repair]
shared_with: []
use_when: [a check is implemented as a literal string search over a file, a rule is declared in a layered configuration and its finding count is zero, a later declaration can replace an earlier one for the same rule, a convention is explained in a comment beside the code that obeys it, a gate asserts a literal string is absent from a built artifact, deciding whether a green from a text-matching guard means the rule holds, a guard reads a configuration's source text to prove a rule is enforced]
---

# Match the resolved artifact, not its text

A large share of every team's gates are string searches. It is the cheapest
instrument that exists, it is the right one more often than purists admit
([decidable-in-a-window](./decidable-in-a-window.md) is the test for when),
and it has one structural hazard that has nothing to do with how good the
pattern is: **the bytes the matcher reads are not the thing the rule is
about.**

Between them sits a resolution step. A configuration engine decides which of
several declarations wins for a given path. A compiler discards the comments
and folds the literals. A bundler joins two adjacent fragments into one
string. A search tool decides whether a file is text at all. Each step is
where the matcher's answer and the rule's answer come apart, and the
direction is almost always the permissive one: the match that should have
happened does not, or the match that happens is on something that never
executes. Either way the report is green
([gate-sees-target](../../../../_laws.md#gate-sees-target) — the gate read
the file, and the rule is about the program).

What makes this family worth naming separately from the rest of liveness is
the *absence of a symptom*. The deficiency signals the subject already
teaches — a walked population of zero, an implausible count, a finding rate
that falls — all assume a number somebody can watch. Here the number is
frequently **zero, correct-looking, and zero for the whole period the rule
was dead**, because the population of violations was zero too. Nothing
drifts, nothing spikes, nothing regresses. The only observable is the
resolved artifact, and the only way to see it is to ask the engine that
resolves it.

## The rule is in the configuration and not in the configuration that runs

Layered configuration formats compose by **replacement**, not by union: a
later block that matches a file supplies that rule's options wholesale for
that file, and the earlier block's options are gone. Declare a group of
constraints for a broad scope, append a block later for a narrower scope
that restates only its own constraints, and the first group now applies to
nothing inside the narrower scope — while remaining fully present, correctly
spelled, and visibly load-bearing in the configuration's own text.

This kills a guard-of-the-guard as well as the rule. A meta-check that reads
the configuration *source* and asserts the constraint is declared will pass
for exactly as long as the shadowing lasts, because the declaration is
exactly what survived. The same is true of a standing document that says the
rule "rides the lint run": two artifacts can point at each other about which
one holds the law while neither does.

A measured instance is worth the detail because of what it says about
detection. In one application tree, four constraints of a design rule were
declared in the first block of a layered lint configuration; a later block
matching a strict superset of those paths set the same rule with only its own
constraints. From the day that second block landed, the rule applied to
nothing and the whole-tree run had not reported a hardcoded colour since —
with a finding population of **zero throughout**, so no count moved, no
document was contradicted, and the configuration file itself documented this
exact hazard beside a different group, in a note telling the reader to spread
that group into both blocks. Every other group had been restated correctly.
A known, written-down trap, still committed, and discoverable only by probe:
a file carrying both a colour literal and a second, unshadowed violation
reported only the second.

The corrective is to gate on the resolved configuration:

- **Ask the engine what it will apply to a path, for one representative path
  per scope.** Every mature configuration system can answer this; the answer
  is the gate's real definition, and the file is only its source.
- **Assert both directions.** For each scope, name the rule groups that must
  be present *and* the groups that must be absent because an exemption was
  declared there. A one-directional assertion is satisfied by a configuration
  that switched the rule off everywhere, and equally by one that switched an
  exemption off — so the pair is what makes the fixture non-vacuous, and a
  pinned pair (this group present here, absent there, and a third group
  present in both so the two scopes are comparable) is what makes a typo in
  the expectation table visible.
- **Assert reach over the enumerated population, separately.** Per-path
  expectations are hand-written, so a whole directory that no declaration
  addresses is invisible to all of them: the engine resolves no options
  there, every expectation still passes, and the run is green over code no
  rule reaches. Derive the population from the tracked tree rather than from
  the expectation list, and fail naming the unreached members.

In the same tree, the first version of this guard covered the layers by hand
and was extended after the reach assertion found the gap: on 2026-09-20 the
suite pins sixteen representative paths across the layers, a present-and-
absent pair for the design group, and a whole-tree assertion that every
tracked source file resolves to at least one declaration — the last one
carrying its own floor, so a broken file enumeration fails loudly instead of
asserting over an empty set.

## Prose satisfies the matcher

A structural guard that detects a convention by looking for a symbol in
source text is reading a file that contains two languages: the program, and
the prose that explains it. The matcher cannot tell them apart, and a house
style that explains each rule beside the code that obeys it guarantees the
prose contains the symbol. **The guard is therefore most reliably blind
exactly where the convention is best documented**, which is a false negative
that scales with documentation quality — the artifact that records the rule
is the artifact that defeats its detector.

Measured: in one service, an authorization guard asserted that every route
taking a row identifier from the caller names one of nine authorization
entry points, matching over raw file text. Deleting the import *and* both
call sites from one route, leaving only the three comment lines that name
them, kept the suite at **21 of 21 green** — a route with its authorization
entirely removed read as compliant, in a voice indistinguishable from
success. Stripping comments and string literals first, then re-seeding the
same route, turned it red.

Two obligations follow, and the second is the one that keeps the stripper
honest:

- **Normalise the haystack to what executes**, with a scan that tracks which
  of comment, string and code it is inside. A pattern pass is not enough in
  either direction: a line comment inside a string literal, and a quotation
  mark inside a comment, each break the naive version, and the breakage is
  silent.
- **Keep the seeded pair in the suite.** One fragment that only *describes*
  the gate must not match; one that calls it must; and it is worth asserting
  in the same test that the unstripped text cannot tell the two apart, so the
  fixture records why the stripper exists.

Stripping is not unconditional, and the discriminator is the **direction of
the error**. Where the key legitimately is a literal — a parameter name read
out of a string, a token that only ever appears quoted — the raw read is the
correct one, because there over-detection merely demands a constraint on a
file that mentions the thing, while a stripped read would silently stop
demanding it. When two probes in one guard deliberately read different
sources, say so where they differ; an unexplained raw read is
indistinguishable from the defect above.

## Every needle carries a positive control

A gate that asserts a literal string is **absent** from a built artifact
makes two claims and checks one. The checked claim is that the output does
not contain the string. The unchecked claim is that the string is something
the output *could* have contained — that it still exists, in the source the
gate names, spelled the way the gate spells it. Reword the literal and the
gate keeps passing while hunting a sentence that exists nowhere. Nothing is
suppressed, no count changes, and the clean verdict is manufactured
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
a leg that can match nothing has not run).

So **assert each needle present in the source it names, before asserting it
absent from the output** — and strip comments in that control too, or a file
that merely talks about the string satisfies it, which is the previous
section aimed at the control rather than at the gate.

Measured: a bundle-purity gate carried ten fingerprints of server-only
modules that must never reach a browser bundle. On the assertion's first run,
2026-09-04, **one of the ten** turned out to exist only in a comment — the
running code built the line from a bare token and joined with spaces, so the
spaced form the fingerprint carried had never been in the source or in any
chunk, and that leg had hunted nothing since it was added eight days earlier.
The same assertion exposed a second entry split across two adjacent literal
fragments that the bundler folds and a source read does not; the fix was to
stop the fingerprint at the fragment's edge. None of the ten had ever been
checked against source before.

The control's failure is a **could-not-run**, not a violation: it exits on
its own path, says which fingerprint no longer exists where, and names the
remedy — point the entry at the new wording, or choose another string from
the same file. Deleting the entry is the one move it must refuse, because
that converts a dead leg into no leg at all
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

## The haystack can be emptied by one byte

The population of a text-matching gate is not the set of files it was pointed
at. It is the set of files its tooling was willing to treat as **text**, and
that decision is made by the tool, per file, on content — not on
configuration a reviewer can read.

One control character embedded as a raw byte is enough. A line-oriented
search tool that meets it classifies the entire file as binary: it reports
that the file matches and prints no lines and no line numbers, so a caller
that consumes matched lines receives nothing. The change-history renderer
does the same thing on its own axis, showing every revision of that file as a
size delta with zero insertions and zero deletions, so a diff-shaped review
gate sees a file that never changes. The file compiles, ships and behaves
exactly as written. It has simply left the population of every text gate,
every code search and every line-level review the project owns, and no
instrument reports its absence, because from each one's point of view that
file had nothing to say.

Measured on 2026-09-20, in one desktop application tree: two source files
carry a raw separator byte inside a string literal. A line search over one of
them returns the single line `Binary file … matches` and no line numbers; the
change summary for its most recent commit reads `Bin 13966 -> 13958 bytes`
and `1 file changed, 0 insertions(+), 0 deletions(-)`. A third file in the
same tree, repaired earlier by rewriting the byte as an escape sequence, is
507 addressable lines with an unchanged program.

Two corrections, at two layers:

- **At the source.** A control character used as a field separator is written
  as an escape sequence, never as a raw byte. The program is identical and
  the file stays addressable. This is cheap enough to be a house rule and
  small enough to be a lint.
- **At the gate.** A text gate's instrument assertion counts the files it
  could read *as text*. A file dropped from the walk for being unreadable is
  a could-not-run for that file, reported by name — never a member that
  passed. Without this the gate's population silently shrinks by exactly the
  files whose content defeated it.

## Boundaries

- [renameable-detector-keys](./renameable-detector-keys.md) owns the key an
  author can change **on purpose** to clear a check. This technique owns the
  case where nobody changed anything on purpose: the text stayed put and the
  meaning moved under it, or the text was never what the rule was about. The
  remedy differs accordingly — that one re-keys the detector, this one adds a
  control.
- [gate-liveness](./gate-liveness.md) owns liveness per gate. This is
  liveness **per needle and per rule inside a gate that is demonstrably
  alive**, the same relationship
  [vacuous-by-evaluation](./vacuous-by-evaluation.md) has to a red-capable
  rule set.
- [decidable-in-a-window](./decidable-in-a-window.md) asks whether a bounded
  window can decide the rule at all. This one assumes it can, and asks
  whether the window is over the right bytes.
- [instrument-answers-only-its-own-question](./instrument-answers-only-its-own-question.md)
  owns a question a shared configuration hands to another tool. Here nothing
  was handed anywhere: the declaration is present, wins nowhere, and no
  configuration records the transfer, because there was none.

## Decision rules

- **Ask the engine, not the file.** A rule's effective scope is what the
  resolver returns for a path. Configuration text is evidence about the
  source and none about the gate.
- **Every absence assertion carries a presence assertion** over the artifact
  it names, and the presence assertion is itself normalised to code.
- **Normalise the haystack to what executes** — unless over-detection is the
  safe direction for that probe, in which case say so beside it.
- **Assert both directions of a scope**: where the rule binds and where an
  exemption releases it. One direction alone is satisfiable by a rule that
  was switched off wholesale.
- **Assert reach separately from content.** A hand-written expectation list
  cannot see a population nothing addresses.
- **A member lost from the walk is a could-not-run for that member**, named
  in the output, never folded into the pass
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
  the green carries the population it was taken over).
