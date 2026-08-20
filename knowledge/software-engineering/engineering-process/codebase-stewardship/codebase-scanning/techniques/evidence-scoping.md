---
layer: technique
type: technique
subject: codebase-scanning
technique: evidence-scoping
status: forged
laws:
  - gate-sees-target
  - count-carries-predicate
  - one-authority-per-vocabulary
shared_with: []
use_when: [a detector false-fired on an unfamiliar codebase, deciding where a rule is allowed to look, crediting a practice from a sampled subset, a ratio scores a correct target down]
---

# Evidence scoping

The precision discipline says to read the population before writing the rule.
On a codebase you do not control you cannot: the population is every project
the scanner will ever be pointed at, and the next one is unlike all the ones
you calibrated against. What remains available is a different lever, and on
foreign code it is the stronger one — **not the pattern, but where the pattern
is allowed to look, and what is allowed to count as evidence.** Almost every
false positive on an unfamiliar target is a scoping defect wearing a pattern's
clothes, and the repair is almost never a tighter expression. This technique
is the catalogue of those repairs, each stated with the wrong rule it replaces.

## Shrink the haystack, not the needle

A generic word used as a tool's name is unfixable as a pattern. Word
boundaries do not save it: the token is a real English word and it appears as
a legitimate identifier somewhere in any tree large enough to be interesting.
Tightening the expression trades one arbitrary miss for another.

The repair is to change the search space to one where the token can only be
deliberate: the tool's own configuration file, whose *existence* is the
declaration, or the automation pipeline's definitions, where naming a tool is
an act of invocation rather than a coincidence of vocabulary. Keep the
free-text match only for tokens that cannot occur by accident — vendor-scoped
identifiers, hyphenated product names.

The failure this replaces is unusually instructive because it announces
itself: a bare token matched against every path in the tree credited a large,
famous language runtime with an automated review assistant it does not use,
on the strength of an internal module whose name happens to contain the word.
When a scanner's most embarrassing outputs are on its most recognizable
subjects, the cause is nearly always a rule with an unbounded search space.

## The tree has zones, and they testify about different things

Not every directory in a target speaks for the target. Example applications,
benchmark harnesses, fixtures, test data, templates, and sample projects are
demonstrations — a capability found *only* there describes the sample, not the
project's own practice. Crediting an example application's database migrations
as the project's delivery automation, or a toolkit's sample feature-flag usage
as the toolkit's own, is a false positive nothing in the pattern can catch.

The decision rule is a question, asked once per detector: **whose behavior
does a file in this class testify to?** If the detector treats *presence* as
evidence that the project practices something, exclude the demonstration
zones. If the detector is about a capability existing anywhere for a reader to
find — documentation, guidance — do not, because there the sample is the
point. Get the axis wrong in either direction and the rule is wrong for a
whole class of target rather than for one file.

## A name is not evidence

The cheapest false positive in the family: a filename contains a word
associated with a practice, so the practice is credited. A user-interface
component named for an accessibility feature earns credit for accessibility
testing. A source file whose name contains an evaluation word earns a large
lift for an evaluation harness on a target that has none — reliably the single
largest false signal on projects that do nothing at all, because names are
free and harnesses are not.

Anchor credit to an artifact of the practice: a declared dependency on a tool
that performs it, a configuration file for that tool, its invocation in the
automation pipeline, or a file that is *itself* an artifact of the practice
(a test file, not a component file, bearing the word). And apply the
proportionality rule: **the largest awards must be unreachable by renaming a
file.** Rank every detector by the points it grants and audit the top of that
list first, because that is where a filename match does the most damage.

## Score the use, not the artifact

The moment a scanner's results matter to the people being scanned, the
artifacts it looks for become droppable. A scaffold generator can produce the
declared standard's whole directory tree in a second; if presence scores, the
scan has been converted into a form to fill in.

The structural guard is to split every award for a declared standard: presence
earns a token amount — enough to say it was noticed — while the substantive
points require **evidence of use**, which has two independently checkable
shapes. *Wiring*: the standard's executable is actually invoked from an
automation definition or a local hook, verified by reading that definition,
not by the executable's existence. *Accumulation*: the standard's store holds
entries beyond the one its own scaffold seeds, because a store with exactly
one entry is a scaffold and a store with a dozen is a habit. This works for a
mechanical reason worth stating plainly: presence is cheap to fake and use is
not, because faking use costs the work the measure was trying to detect.

The same move applies to documents. Replace "the guidance document exists"
with a rubric graded over its *content* — does it name the build and test
commands, describe the structure, state explicit constraints, encode what to
verify after a change, reference the surrounding tooling, carry concrete
examples. The award becomes a sum over checkable claims, and an empty
document scores what it is worth. What the weights should be is a
scoring-rubric question; what is owned here is that the read is of content,
and that the same graded function must be the single authority wherever
"good guidance" is displayed, or two surfaces will disagree about the same
document ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Walk the structure; never let position carry meaning

Where the target is a structured document and no parser is at hand, the
tempting shortcut is to match the header and then a fixed number of following
lines. It encodes position as meaning, and the format does not agree.

The worked case: a check for an over-broad permission grant matched the block
header immediately followed by the dangerous key. That expression requires the
dangerous key to be *first* in the block — so the commonest arrangement, where
a harmless key is listed above it, escaped the check entirely and the file
scored as if it were least-privileged. The check's headline number inverted on
exactly the case it exists to catch. The repair is a block walker: from the
key's own column, consume every line indented past it, treat blank lines as
interior, and stop at the first line that dedents back to or past the column.
Position becomes irrelevant, which is what the format always said.

The general rule: **when the target has structure and you cannot parse it,
emulate the structure — do not approximate it with adjacency.** A detector
defeated by reordering is not imprecise, it is structurally wrong, and no
amount of sample-based precision tuning will find it; only a fixture in the
un-tested arrangement will.

## The denominator holds only what could have satisfied the predicate

Any check reported as a ratio quietly asserts that every item counted *could*
have passed. Foreign codebases violate that constantly, because their formats
contain references that are structurally incapable of satisfying the rule. A
build stage that refers to another stage declared in the same document is an
internal reference, not an external dependency; there is nothing to pin to it.
An empty base has nothing to pin either. Counting both in the denominator
scores a perfectly pinned project down for constructs it did nothing wrong
with — and the disputed subject is right, which is the expensive kind of
false finding.

So for every ratio, **write the eligibility predicate before the arithmetic**,
derive eligibility from the document itself (a stage counts as internal only
where this document declared it, so an external artifact that merely shares
the name stays eligible), and publish the predicate beside the number
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). This is a
distinct concern from renormalizing over inputs that were *absent* — here the
input arrived and is ineligible; the arithmetic in the general case is
[measurement honesty](../../../../engineering-assessment/measurement-method/measurement-honesty/measurement-honesty.md)'s.

## Sample asymmetry: credit from a sample, never indict from one

Budgeted ingestion means most detectors see a subset of the class they judge,
and the two directions of inference are not symmetric.

- **Positive findings generalize.** One sampled file demonstrating a practice
  is an existence proof about the project; no sample-size condition applies.
- **Negative findings do not.** Absence across a subset is not absence, and a
  penalty levied on it is a claim about files nobody read
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)). The unlucky slice is
  not hypothetical: a handful of sampled files, all of one shallow kind, is
  the normal outcome of a budget on a large suite.

Where a penalty from a sample is genuinely wanted, gate it on a **minimum
sample fraction of the known population** — known, because the full listing
counted the class even though the budget only fetched part of it. Below the
floor, emit a non-scoring note that states the fraction observed and what it
showed, so the signal is not lost and the verdict is not fabricated. Where the
floor should sit, and why a small denominator carries no signal at all, is
[measurement honesty](../../../../engineering-assessment/measurement-method/measurement-honesty/measurement-honesty.md);
owned here is the asymmetry and the source of the denominator.

One vocabulary note that prevents a slow-motion version of all of this: where
two detectors recognize the same class of file, the path convention is defined
once and imported, never copied. Copies drift — one gets broadened during an
investigation, the other is silently left behind, and the two surfaces
disagree about the same tree.

## When not to use it

On a codebase you own, prefer the stronger move: read the population and
calibrate against it, and where a parser exists, use the parser rather than
any of the emulations here. Scoping is what remains when the target is
unknown, unreadable in full, or too varied to calibrate against — and the
adjacent craft of defending a published verdict to the project being judged
belongs to conformance checking, not here.
