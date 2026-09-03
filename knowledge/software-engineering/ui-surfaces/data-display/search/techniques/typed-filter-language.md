---
layer: technique
type: technique
subject: search
technique: typed-filter-language
status: forged
laws: [verdict-survives-boundary, one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [users author filter expressions that run against every item on a hot path, a filter language grows past field prefixes into operators and lists, deciding whether an ill-formed rule should be rejected or coerced, a saved rule fails only when a matching item finally arrives]
---

# Typed filter language

[query-parsing](./query-parsing.md) owns the box where the user types an
information need and the system translates it into an engine's syntax. This
technique owns the other box: the one where the user deliberately writes a
**program** - a predicate in a small expression language the product exposes on
purpose, with identifiers, operators, literals and lists - and the product runs
that predicate against every item that flows past, forever, on the path that
paints the surface. The two boxes look alike and obey opposite rules. In the
search box, an input the parser cannot read is searched as literal text, because
the user was never shown a grammar. In the rule box, an input the parser cannot
read is **refused at the author**, because the user was shown a grammar and is
writing in it, and because the alternative is a predicate that fails later, per
item, in a place with no one watching.

## The problem: a rule fails where nobody is

A filter expression is evaluated N times per item per view. Whatever it is, the
evaluator sees it far more often than the author does, and if evaluation can
fail - a string compared to a number, a list where a boolean was expected, an
identifier that does not name a field - the failure happens at the worst
possible moment: not when the rule was written, but when the first item arrives
that exercises the bad branch, on a thread that is painting, with no surface to
report to. Dynamic coercion "fixes" this by never failing: the mismatched
comparison becomes false, the missing field becomes empty, and the rule silently
drops or admits items it was never asked to. That is the worst outcome of all,
because the user sees a filtered view and believes it.

## The mechanism: assign a type to every node before the first item

The parser builds an expression tree, and a second pass - or the same pass -
**synthesizes a type for every node**, bottom-up, from a closed set the product
owns: string, integer, boolean, colour, regular expression, list, and whatever
refinements the operators need (a list of only strings; a two-element
regex-and-index pair that names a capture group). Leaves get their types from
what they are: a quoted literal is a string, a bare number an integer, a regex
literal a regex. Identifiers get theirs from a **typing context** - a declared
map from field name to type that is the static twin of the runtime map from
field name to value. Operators are typing rules: arithmetic wants two integers;
logical connectives want two booleans; ordering comparisons want two integers;
containment wants a list on the left or two strings; a regex match wants a
string on the left and a regex on the right, and yields a boolean unless the
right side is a capture specifier, in which case it yields a string.

The result of the pass is one of two things: a type for the root, or an
**ill-typed verdict that points at the offending node** and carries a message.
That verdict is a typed value, not a log line, and it travels intact to whoever
asked - the editor renders it beside the input, the storage door refuses the
rule, the settings table marks the row - which is what
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
demands. A verdict that survived only as "invalid" would tell the author
nothing; one that names the node ("can only compare integers; problem occurred
here: `author.name < 5`") is a fix waiting to be typed.

Two contracts close the mechanism. First, the root has a **required return
type**: a filter is a predicate, so the root must synthesize to boolean, and an
expression that types cleanly to a string or an integer is still refused - it is
a well-formed program that is not a filter. Second, **the door is at storage,
not at the editor** ([one-validation-door](../../../../_laws.md#one-validation-door)):
every writer of a rule - the interactive editor, the file the rules were
persisted to and are read back from, any import or programmatic path - passes
through the same parse-and-type step, so a rule that was valid under last
year's field vocabulary and is not under this year's is caught when it is
loaded, not when it is evaluated. The editor's job is to show the same verdict
earlier and more kindly.

## What it buys, stated as a property

The property is: **no accepted program can reach a type failure at evaluation
time.** Everything else follows. Evaluation may run on the hottest path in the
product because it cannot fail there; there is one parse per rule, not one
check per item; author-time errors carry a location; and the field vocabulary
is a single declared table that the editor can also render as documentation,
because the typing context is exactly the list of what a rule may name.

This is also the standard shape for user-authored predicate languages in
message routers, log pipelines and mail rules, arrived at independently: a
closed type set, a typing pass at save time, a boolean root contract. The
convergence is the corroboration.

## The decision rule

**When a user-authored expression will be evaluated more often than it is
written, type it when it is written and refuse it if it does not type.** The
inversion of query-parsing's fallback rule is deliberate and the discriminator
is simple: is the text an information need or a program? An information need
has no wrong form and must always be searched somehow; a program has a grammar
the author was shown and a meaning that must be fixed before it runs. The
search box tolerates; the rule box refuses. A product that puts both behind one
input has to decide which it is before it can be correct.

Two corollaries. Reject, do not warn, on an ill-typed rule; a warning on a
predicate that will silently drop items is a warning nobody reads twice. And
refuse the *unknown identifier* at the same door with the same shape of message
- the identifier that does not name a field is the most common authoring error
and the one most likely to produce a rule that evaluates to nothing forever.

## Boundaries

- **Not for the search box.** Free text over a corpus is
  [query-parsing](./query-parsing.md): one door, tokenize-then-quote,
  unparseable input searched as literal. The moment a product exposes
  operators and identifiers as a feature, it has left that technique and
  entered this one.
- **Not a substitute for a real language.** The type set is closed and small
  on purpose; when rules need functions, scoping, or user-defined types, the
  product has a scripting surface and should treat it as one - a runtime
  embedded in-process, with the extension-host disciplines that implies.
- **Partial typing is dynamic typing where it is partial.** The tempting
  shortcut is to type equality as "always boolean, any operands" so that
  colour-equals-string and integer-equals-string work by coercion. Every such
  hole is a place where the evaluator's runtime conversion becomes
  load-bearing again and the property above no longer holds for that
  operator. Either close the hole with a typing rule (equality wants two
  operands of one type, or a declared coercion set) or write the hole down as
  a known exception.
- **The evaluator may keep defensive branches.** A typed pass does not require
  ripping the coercions out of the evaluator; it requires that an accepted
  program never takes them. Keeping them costs a branch per node and buys
  safety against a typing rule that is later loosened by mistake.
- **A rule that fails to load must fail visibly on the surface it filters.**
  Refusing at the door is only half the contract. A persisted rule that no
  longer types - because a field was renamed - must not silently evaluate to
  "hide everything" or "show everything"; the view it governs says a rule is
  broken ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
  not merely the settings page.

## How to test for the property

The test is a **validity table**: a list of expressions paired with the
expected verdict, one line per typing rule and one per syntax error, run
through the same door the product uses. It must contain the negative cases -
integer plus boolean, string minus integer, comparison of a list to a number,
an unknown identifier, an unclosed list, a top-level expression that types to
an integer - because the pass is proven by what it refuses, not by what it
admits. A second table pairs valid expressions with their synthesized root
type, so a loosened typing rule shows up as a changed expectation rather than
as a runtime surprise. The property is falsified in the usual way: remove one
typing rule from the operator table and watch the corresponding row go red;
if it does not, the evaluator's coercion was absorbing the error and the hole
above has been found.
