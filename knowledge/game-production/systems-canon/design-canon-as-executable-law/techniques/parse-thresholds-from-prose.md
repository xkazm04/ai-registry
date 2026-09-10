---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: parse-thresholds-from-prose
status: forged
laws: [law-and-check-share-one-source, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [extracting a checker threshold out of a written rule, a canon edit broke the parse, writing patterns that survive rewording]
---

# Parse thresholds from prose

The named concern: **the extraction layer** — the small piece of machinery that turns a
sentence a designer wrote into a number a checker compares against. It is the load-bearing
joint of the whole subject, it is where the coupling is either honest or fake, and it is
about forty lines of code that repay more care than their size suggests.

## The pattern is written against the sentence's skeleton, not its typography

The naive extraction matches the number the way it appears today: a literal decimal, a
specific dash, a particular symbol. Then someone edits the rule to read more clearly —
swaps a hyphen for an en-dash, adds an approximation sign, writes the percentage with a
space before the symbol — and the pattern stops matching. The rule did not change; its
typography did.

The robust technique is to **match the structural words and skip over everything between
the numbers with a non-digit run.** Anchor on the phrase a designer would not casually
rewrite — the metric's name, the verb of the constraint — and let the punctuation between
that anchor and the number be arbitrary. A pattern shaped as *"power target", then
non-digits, then a number, then non-digits, then a number, then a percent sign* survives
every rewrite that keeps the sentence saying the same thing, and fails on rewrites that do
not. That is exactly the sensitivity you want.

Concretely, prose in this domain carries plus-or-minus signs, approximately-equal signs,
less-than-or-equal signs, multiplication crosses, en-dashes, and true minus signs — and
the same rule will be written with different ones by different people over its life.
Enumerating the acceptable punctuation is a losing game with a long tail. Skipping
non-digit runs between anchor and number costs one character in the pattern and removes
the entire class of failure.

## A parse failure throws, at load, by name

The single most important property of the extraction layer:

- **It fails at module load, not at check time.** The parse runs once when the code is
  first imported, so a broken canon edit surfaces the moment anything touches the system —
  in a test run, in a build, in a local session — rather than in the middle of a
  conformance run over three thousand artifacts.
- **It throws. It never falls back.** A default value used when the parse fails is worse
  than a hardcoded threshold, because it presents as derived. The system reports itself as
  canon-driven while enforcing a number nobody wrote. There is no safe default here; the
  safe behaviour is refusal.
- **The error names the rule and what it was looking for.** "Could not read the faucet
  tolerance from the economy rule body — the pattern expected a percentage after 'balanced
  within'." That message must be enough for the person who just edited the prose to fix it
  without opening the checker. An error that names only a regular expression sends a
  designer to an engineer.
- **A rule id that does not resolve throws too.** Renaming or deleting a rule is a valid
  design action, and it must break every check that cited it, loudly, immediately.

The corollary: put a test in the suite that resolves every parsed threshold and asserts
the values. It costs nothing, and it makes the coupling visible where engineers look —
so the day a canon rewrite lands, the failing test names the rule rather than a
mysterious import.

## Keep the unit at the boundary

Prose states percentages as percentages, seconds as seconds, multipliers as multipliers.
Checkers usually want fractions. Convert **once, at the parse boundary**, and name the
exported constant so its unit is unmistakable — a tolerance expressed as a fraction and a
tolerance expressed as a percent must not share a name. Half the arithmetic bugs in this
layer are a value divided by a hundred twice or not at all, and every one of them is a
naming failure at the boundary. Export the unit in the identifier and the bug becomes
unwriteable.

The same applies to the basis. A tolerance band is symmetric around something; a cap is
absolute; a ratio bound is relative to a stated reference. Carry the basis in the exported
shape — a band exported as a pair of bounds is unambiguous where a band exported as a
single tolerance number is not, because the reader has to know what it is a tolerance
*of*.

## Procedure

1. **Read the rule body as written.** Do not normalize it first; the prose is the source.
2. **Identify the anchor phrase** — the two or three words that state what the number is,
   which a rewrite for clarity would preserve.
3. **Write the pattern as anchor, non-digit run, capture; repeat for each number.** Capture
   groups in the order the sentence states them.
4. **Convert to the checker's unit at the boundary** and name the constant with its unit.
5. **Throw on no-match, with the rule id and the anchor in the message.**
6. **Assert the parsed values in a test.** The test is documentation of what the prose
   currently means.
7. **Re-run the extraction against every historical wording of the rule** you can find in
   version history. If it fails on a wording that meant the same thing, the anchor is too
   tight.

## Decision rules

- **When the pattern is more than one line long, the rule is doing too much.** Split the
  rule, or split the sentence. A rule that needs a complex pattern is a rule a human reads
  ambiguously too.
- **When a rule states several bands for several classes, generate one pattern per class
  from the class name.** Do not write one pattern that captures six numbers positionally;
  a reordering of the sentence then silently swaps two bands. Anchoring each capture on its
  class name makes reordering harmless.
- **When a number appears in the prose that the checker does not need, do not capture it.**
  Every capture is a coupling to a phrasing.
- **When the prose expresses a rule as a shape rather than a value** — grows geometrically,
  descends, is monotonic — parse the parameter if there is one but check the shape, not a
  sampled point against the parameter.
- **When you are tempted to normalize the prose so the pattern is simpler, stop.** The
  prose is written for humans; that is its job and the reason it is trusted. The pattern
  bends around the prose, never the reverse.

## When not to use this

- **A rule whose number is inherently a table.** Twenty affix tiers with twenty
  thresholds are data, not prose. Give them a structured source of their own and let the
  canon rule state the *policy* the table must satisfy. Parsing a table out of a paragraph
  is how you get a paragraph nobody dares reword.
- **A canon maintained by people who cannot see the failure.** If the prose lives somewhere
  the build cannot read, the coupling is a fiction and a scheduled sync will lie about it.
  Move the canon into the build's reach first; the technique depends on the parse breaking
  the build.
- **Rules that change several times a week.** A canon under that much churn is not yet a
  canon; it is a working document. Let it settle before coupling checks to its wording.
- **Anything where the check is trivially wrong at a glance.** If a rule states one number
  and one checker uses it, and both are read by the same person in the same review, the
  extraction machinery buys little. Its value scales with the number of consumers and the
  distance between the editors.
