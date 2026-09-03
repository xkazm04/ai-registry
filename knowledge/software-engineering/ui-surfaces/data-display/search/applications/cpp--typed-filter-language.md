---
layer: application
type: application
subject: search
technique: typed-filter-language
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# A per-split message filter language, typed at parse time

Read against Chatterino 2.5.5 (`CMakeLists.txt:71`, Qt 6 required per
`CMakeLists.txt:30,100`, C++23 per `CMakeLists.txt:281`) at commit
`fda51f0d3a4a5cd15f099b951b796e299d566e9e`. The filter language lives in
`src/controllers/filters/lang/` and is what a user types into the Filters
settings page to decide which messages a split shows; each split's filter
set is evaluated once per incoming message into the split's virtual channel
(`src/widgets/helper/ChannelView.cpp:1154`, `src/controllers/filters/FilterSet.cpp:42-60`),
on the GUI thread. That is the hot path the technique is written for.

## The decision, as the tree makes it

`Tokenizer -> FilterParser -> Expression tree`. The parser
(`src/controllers/filters/lang/FilterParser.cpp:32-52`) builds the tree with
a hand-written recursive descent and, if the parse succeeded, immediately
calls `synthesizeType()` on the root. The type vocabulary is the enum at
`lang/Types.hpp:19-28` - `String, Int, Bool, Color, RegularExpression, List,
StringList, MatchingSpecifier` - and the result of synthesis is a
`PossibleType = std::variant<TypeClass, IllTyped>` (`Types.hpp:59`), where
`IllTyped` carries a pointer to the offending `Expression` and a message
(`Types.hpp:47-57`, with the lifetime warning written beside it). Every
expression node implements the pair `execute` / `synthesizeType`
(`lang/expressions/Expression.hpp:28-37`), and the binary operator's
synthesis is the typing table the technique describes: `+` is int-plus-int
or string-plus-anything, arithmetic needs ints, comparisons need ints,
`contains`/`starts_with`/`ends_with` accept a list or a string on the left,
`match` accepts a regular expression or a `{regex, int}` matching specifier
and returns bool or string accordingly
(`lang/expressions/BinaryOperation.cpp:265-375`). List literals synthesize to
`StringList` when every element is a string and to `MatchingSpecifier` for
the exact `{RegularExpression, Int}` shape (`ListExpression.cpp:41-72`).

The return-type contract is enforced twice, at two writers.
`FilterRecord`'s constructor builds its `Filter` through
`Filter::fromString` and discards it when `returnType() != Type::Bool`
(`src/controllers/filters/FilterRecord.cpp:11-30`); the settings page runs
the same `fromString` and shows "Expected Bool but got String" for a
well-typed non-boolean rule (`src/widgets/settingspages/FiltersPage.cpp:102-121`).
Both go through one door - `Filter::fromString` at `lang/Filter.cpp:11-23`
is the only constructor of a `Filter`, and its error text is the parser's
log joined by newlines.

The error message carries the location the technique asks for:
`explainIllType` prints the message, then "Problem occurred here:" followed
by the offending subexpression rendered back in filter syntax
(`FilterParser.cpp:21-26`). The settings table shows each rule as "Valid" or
"Show errors" (`src/controllers/filters/FilterModel.cpp:30-31`), and clicking
a valid rule shows its normalized form, "Parsed as:" plus `filterString()`
(`FiltersPage.cpp:108-113`) - the reflection-back the technique wants.

An invalid rule's effect on the stream is a stated policy, and it is fail
closed: `FilterSet::filter` returns `false` for any record that is not valid
(`FilterSet.cpp:53-58`), so a split whose filter set contains a broken rule
shows nothing until the rule is fixed, and the rule is marked "Show errors"
in the table. Nothing is hidden by a default that fell out of a null.

## Where it falls short of the technique

**Evaluation still coerces at run time.** The design read's claim that the
hot path "never branches on type" is not what the tree does.
`BinaryOperation::execute` converts both operand variants to the operator's
expected type on every evaluation and returns `0` or `false` when the
conversion fails (`BinaryOperation.cpp:54-123`, e.g. `convertVariantTypes(left,
right, QMetaType::Int)` at `:66-70`); equality falls back to
`looselyCompareVariants`, a reimplementation of the older framework's
permissive variant comparison (`:11-40`). The type check makes those
fallbacks unreachable for a rule that passed it, which is the technique's
buy, but the evaluator carries them anyway and would default silently
rather than assert if a checker hole let a bad tree through. The technique's
"evaluator asserts on a type it was not promised" test would fail here.

**The catalog is two tables.** The tokenizer decides whether a word is an
identifier from `VALID_IDENTIFIERS_MAP` at `lang/Tokenizer.cpp:23-62` (name
plus human label, used by the filter editor dialog); the type checker and
evaluator read a separate `accessorMap` at
`lang/expressions/IdentifierExpression.cpp:124-394` (name, type, accessor).
An identifier present in the first and absent from the second tokenizes,
parses, and only then fails typing with "Invalid access: <name>" - the
source admits it: `// FIXME: Return an error here immediately instead of
failing when type-checking.` (`IdentifierExpression.cpp:406`). This is the
one-authority-per-vocabulary drift the technique predicts, present in the
tree as a pending fix rather than a live bug because both tables currently
list the same 37 names.

**One error at a time.** `errorLog` records only the first error unless
asked to expand (`FilterParser.cpp:304-311`), so an author with two mistakes
fixes them serially.

**Deprecated fields are handled well.** `flags.elevated_message` and
`flags.hype_chat` remain in both tables as typed constants returning
`false`, commented "Feature deprecated ... in 2023"
(`IdentifierExpression.cpp:269-292`, `Tokenizer.cpp:43,46`), so a saved rule
naming them still loads and still types - the technique's retire-as-constant
rule, met.

**No preview.** The settings page validates and prints the parsed form but
does not run a new rule over recent messages; an author learns whether a
rule matches anything by watching the split.
