---
layer: technique
type: technique
subject: codebase-scanning
technique: the-tree-is-not-the-population
status: forged
laws:
  - failure-not-empty-success
  - count-carries-predicate
shared_with: []
use_when: [a scan reports full sensor coverage and zero findings, a detector is quiet on a class of files nobody has confirmed it can see, the traversal inherits ignore rules from tools that are not the scanner, a user suspects a result is being hidden and has no way to check]
---

# The tree is not the population

Every honest thing this subject says about coverage is said about the
*sensors*: which ones ran, which were skipped, what coverage is therefore
missing, and a headline that reads "N findings from M of K sensors" rather
than "N findings". That discipline is complete along one axis and absent along
the other. A sweep can run twelve of twelve sensors, exit green, and report
zero findings over a tree from which the traversal silently removed a third of
the files before any sensor was offered one — and nothing in the report is
false. The sensors did run. The findings were zero. The population those two
statements are about was never disclosed, and it is not the tree.

This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
one stage earlier than the reporting layer usually catches it. The sibling
discipline that keeps a report's arithmetic honest works on *units the report
set out to evaluate*, resolving each to checked, failed, or skipped with a
reason. Its model cannot see this failure, because the removed files land in
none of the three states: nothing skipped them, since nothing enumerated them.
They were gone before the denominator existed. A three-state count is still a
lie about the tree when the enumeration that produced its universe dropped a
third of it without saying so.

## The scanner did not choose its own exclusions

The reason this goes unnoticed for so long is that the exclusions are almost
never the scanner's. A traversal written today inherits, by default and usually
by design:

- **The version-control ignore rules**, which express what should not be
  *committed*. That is a different predicate from what should not be
  *examined*, and the two disagree constantly — build outputs, vendored
  dependencies, generated clients, local fixtures and credential templates are
  all uncommitted and all things a scanner may badly need to read.
- **Tool-specific ignore files** layered on top, typically with their own
  precedence order relative to the version-control ones, and typically rooted
  at whatever directory each one happens to sit in.
- **The hidden-file convention**, which on most systems hides exactly the
  configuration a stewardship scan cares most about.
- **Content-class filters** — the binary heuristic, size caps, encoding
  refusals — each of which removes files on a property of the contents rather
  than of the path, and therefore removes files no path-based audit will
  predict.
- **Link-following policy**, which decides whether a directory reachable only
  through an indirection is part of the tree at all.

None of these was a decision the scan made about its own predicate. Each was a
decision some other tool made about a different question, adopted because it
was the default and because adopting it usually produces the more useful
result. That is a good default and it should stay the default. What is not
defensible is leaving it undisclosed, because the union of five inherited
filters is a population nobody in the loop has ever seen stated.

## Publish the excluded count with the same weight as the sensor count

The correction is arithmetic, and it is the same arithmetic the sensor axis
already gets. The scan enumerates the tree *before* filtering, applies its
filters, and reports both sides:

- **The enumerated total** — how many files the traversal saw at all.
- **The examined count, and the excluded count as its complement**, never as a
  quantity the reader is expected to infer from a difference they were not
  given.
- **The excluded count broken down by the filter that removed each file.**
  "4,106 files excluded: 3,880 by inherited version-control rules, 191 hidden,
  28 over the size cap, 7 as binary" is a sentence an operator can act on. A
  single total is one they cannot, because every remedy is filter-specific.
- **A named example path per filter**, so the reader can tell an expected
  exclusion from a surprising one without running anything. The cost is one
  line; the failure it catches is a rule whose pattern was one character wider
  than its author believed.

Every figure here carries its predicate and its denominator per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate). The
report's headline gains a second clause and becomes "N findings, from M of K
sensors, over E of T files".

## An explicitly named target overrides every automatic filter

There is a rule that makes aggressive defaults safe, and it is worth stating
because it is not what most implementations do. **Automatic filtering applies
to what the traversal discovered; it never applies to what the operator named.**
A path passed in as an argument has already been chosen by a person, and every
filter in the list above exists to guess at what a person would have chosen —
so running the guess against the explicit statement is not conservative, it is
contradictory. A hidden file named directly is examined. A file the ignore
rules exclude, named directly, is examined. A file the content heuristic calls
binary, named directly, is examined under whatever mode reads it safely.

The rule pays twice. It gives the operator a working instrument for checking
one suspicious file without editing configuration, and it removes the entire
class of support question in which the tool silently does nothing in response
to a direct request.

## The disclosure ladder: one control, ordered by likelihood

Reporting the excluded count tells an operator that something was hidden. It
does not tell them how to see it, and the naive remedy — one flag per filter —
requires knowing which of the five layers is responsible, which is precisely
what the operator does not know. Wanting to know is the whole reason they are
here.

Ship instead a **single repeatable control that peels the layers one at a time,
ordered by how likely each is to be the culprit**. The first use disables the
inherited ignore rules, the second additionally admits hidden files, the third
additionally admits the content-class refusals. An operator who suspects a
false negative escalates until the result appears, and the number of steps it
took *names the layer* without them ever having learned the layer's name. That
is a diagnostic which teaches the tool's model of itself as a side effect of
being used.

Behind it sits the second rung — a trace mode reporting, per file, which filter
matched and which rule inside it — and behind that the admission that the tool
may be wrong, with somewhere to say so. Three rungs, in increasing cost, is the
whole ladder.

## State the cost of every disable, next to the disable

Some of these filters exist for correctness and some exist for speed, and the
ones that exist for speed are the dangerous half, because turning them off
changes the answer rather than merely the runtime. A scan that memory-maps a
file may only be able to apply a content heuristic to its first few kilobytes,
while a scan that streams the same file applies the heuristic to every byte —
so a file can be classified differently by an internal strategy choice the
operator never made and cannot see. Where that is true, three things are owed
together: the control that pins the strategy, the statement that classification
depends on it, and the cost of pinning it. Documenting the control without the
dependency leaves the operator unable to know when to reach for it.

The general form is the one this subject already carries about speed refactors
in [precision-trades-have-a-direction](./precision-trades-have-a-direction.md):
an optimization that discards information moves the error in a knowable
direction. What this technique adds is the operator-facing half — that an
optimization which changes the *observable answer* owes a control that turns it
off, and that the control is worthless without its cost stated beside it, since
an operator who cannot price it will not use it.

## Where the exclusion set becomes a finding of its own

Once the excluded count is published it starts carrying information the scan
did not set out to produce. A sweep whose excluded fraction moves sharply
between runs has usually not been reconfigured — a rule was added upstream, by
someone with a different purpose, and the scan's population changed underneath
its trend line. Findings counts across that boundary are not comparable, and a
scan that tracks its own coverage can say so instead of reporting the drop as
an improvement.

The strongest form is a class going to zero. When a filter's excluded count for
some class rises to cover the whole class, every detector specialised to that
class is now reporting an unearned clean bill, and it will keep reporting it
indefinitely, because a detector matching nothing looks exactly like a healthy
one unless somebody is watching the denominator. The zero-match refusal that
[rule-precision-discipline](./rule-precision-discipline.md) applies at a rule's
birth needs its counterpart at runtime: a detector whose eligible population
has fallen to zero is reported as uncovered, never as clean.

## Decision rules

- Enumerate before filtering, and report the enumerated total; a scan that only
  counts what it examined cannot describe what it missed.
- Report the excluded count broken down by filter, with one example path each —
  never a single total, because every remedy is filter-specific.
- Extend the coverage headline along both axes: findings, sensors, and files.
- Apply automatic filters to discovered paths only; anything the operator names
  explicitly is examined regardless of every filter.
- Provide one repeatable escalating control that peels filters in likelihood
  order, so diagnosis does not require knowing the layer names.
- State the cost beside every disable, and say explicitly where a filter's
  verdict depends on an internal strategy the operator did not choose.
- Treat a sharp move in the excluded fraction as a population change that
  invalidates trend comparison across it.
- Report a detector whose eligible population has fallen to zero as uncovered,
  never as clean.
