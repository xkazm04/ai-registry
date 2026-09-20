---
layer: technique
type: technique
subject: search
technique: query-parsing
status: forged
laws: [one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [turning raw user text into an engine-safe query, matching fails on accented input, zero results that could be failure or true emptiness]
---

# Query parsing

The user types in one language; the engine executes another. Query parsing is
the translation layer between them, and its first rule is that the two
languages are **never the same language**. An engine's expression syntax —
boolean operators, phrase quoting, prefix stars, column filters — is an
implementation surface. The moment raw user text reaches it unescaped, three
failure classes open at once: innocent punctuation becomes a syntax error
(a hyphenated word read as negation, a quote read as an unterminated phrase),
accidental operators silently change the query's meaning, and — where the
engine is powerful enough — user text becomes an injection vector into
whatever the expression language can reach.

## One door

All translation happens at a single, named function: raw text in, engine-safe
expression out. Every caller that executes a search goes through it; no call
site builds engine syntax by string concatenation on its own. This is the
one-validation-door law applied to queries — sanitization sprinkled across N
search boxes is sanitization minus the box added next quarter, and query
escaping is exactly the kind of subtle, easy-to-half-remember logic that
diverges when duplicated.

The door owns more than escaping: it owns the **matching policy** — case
folding, diacritic folding, whitespace handling, whether multiple words must
all match, and how a match spanning several fields is composed. Measured
across independent codebases, this policy is the single
most re-derived decision in the subject: dozens of call sites each lowercase
and substring-match inline, none of them folds diacritics, and in a
multi-locale product every one silently fails on accented input — while the
same codebases handle locale correctly when *ordering* strings, because
ordering has one named function and matching has none. Give matching the
same treatment: one named matcher with correct-by-default normalization, and
route every surface through it, because a policy set once per call site can
never be corrected centrally.

**The door is usually built for the injection reason, so a stack that removes
the injection reason never builds it.** A query API where a match is a *value*
bound into a field predicate — a builder, a parameterized statement, a
collection scan — closes the first failure class structurally, everywhere, for
free. That is a real safety property and it should be taken. What it does not
close is the second: with nothing forcing translation into one place, each
surface writes its own two-line predicate, and the matching policy is
re-decided every time, silently and differently. The injection reason files
bugs; the policy reason files none, so a codebase can reach a dozen matchers —
all safe, no two alike — without a single review remarking on it. The
measurement that finds this is not *where is user text escaped* but **where is
user text compared to stored text**, and the only correct answer to that count
is one.

The composition across fields is part of the policy and has two shapes that
are not equivalent. Matching each field separately and OR-ing the results
means a hit lies inside some field. Concatenating the fields into one string
and searching that means a hit may lie *across a join* — a query whose first
word ends one field and whose second begins the next matches a record in which
no field contains it, and the excerpt stage then has nothing to point at. The
concatenated form is cheaper to write and is the one that appears when nobody
decided; if it is chosen, it is chosen knowing that the surface can no longer
say which field matched.

The door's core move is **tokenize, then quote**: split the user's text into
words on whitespace and punctuation the engine treats as structure, wrap each
surviving token so the engine reads it as a literal, and only then compose the
tokens with operators *the door itself chose*. Operators are something the
door emits deliberately — never something that survives from input to output
by accident.

The door also **bounds the expression it emits**. Two limits earn their place
in every implementation: a minimum token length (single characters match half
the corpus and are noise, not signal) and a maximum term count (a pathological
paste — a page of text dropped into the search box — must become a bounded
expression, not a four-hundred-clause query handed to the engine). Both limits
are part of the door's contract, applied in one place, so every search surface
inherits them.

## Two grammars, explicitly

A well-designed search input supports structure without exposing engine
syntax, by owning a small user-facing grammar:

- **Field prefixes** — `status:failed`, `author:kim`. The parser recognizes a
  closed set of prefixes, lifts each into a typed filter, and removes it from
  the free-text remainder. Unrecognized prefixes stay in the free text as
  literals: a colon in ordinary prose must not vanish into a failed filter.
- **Phrase quoting** — quoted spans match as a unit. The parser honors
  balanced quotes and treats an unbalanced quote as a literal character, not
  an error.
- **Negation, if offered** — a deliberate, documented marker, parsed by the
  door, translated into whatever exclusion the engine supports.

The recognized structure is **reflected back visibly** — typically as removable
chips or highlighted tokens above or inside the input. This closes the loop in
both directions: the user learns the grammar by seeing what was understood,
and misparses become visible the instant they happen instead of silently
returning the wrong result set. A chip is also the correct deletion affordance:
removing a filter is one click on the thing itself, not surgery inside a text
string.

Everything the parser lifts out becomes typed state (a filter object with a
field, an operator, a value from the field's vocabulary); everything left
becomes the free-text term fed through the sanitization path. The two travel
together as the parsed query — the single artifact that downstream stages
(execution, ranking, count reporting, saved views) consume.

## The degradation ladder

A query that returns nothing is a fork in the road, and the honest path is a
**ladder of progressively weaker interpretations, each labeled**:

1. **As written** — all terms required, phrases intact, filters applied.
2. **All terms, unphrased** — phrase constraints relaxed to co-occurrence.
3. **Any term** — conjunction relaxed to disjunction; results now match *some*
   of what was typed.
4. **Prefix / partial** — terms matched as prefixes, catching the half-typed
   word and the near-miss.

Two rules govern the ladder. First, **descend only on empty** — never blend
rungs, or precise matches drown in fuzzy ones. Second, **label the rung** —
when the surface shows results for a weaker reading ("showing results matching
any of your words"), it must say so. Results from rung 3 presented as rung 1
answers a question the user didn't ask and lets them build conclusions on it.

## Failure is not an empty result

The parser and the engine can both fail, and each failure must be spelled
differently from a legitimate zero (the failure-not-empty-success law):

- **Unparseable input never errors at the user.** If the structured read
  fails, the door falls back to treating the entire input as literal text and
  searches that. Users cannot be blamed for a grammar they were never shown.
- **A degraded query is disclosed**, per the ladder above — the search that
  ran is not the search that was asked for, and the label is the difference
  between honesty and luck.
- **An engine error is an error state**, with a retry path — never rendered
  as "no results". Zero-because-nothing-matches invites the user to broaden
  the query; zero-because-the-engine-died invites them to broaden it forever.
- **And a failure is not the previous results either.** The rule that a
  surface must not blank its rows while the next answer is in flight is about
  the in-flight moment, and it ends when the request settles. Keeping the last
  successful list on screen after a failed one — the natural reading of "keep
  the current list on error" — spells an outage as an answer, under controls
  that describe a different question. It is the worse of the two silent
  failures: a zero at least invites suspicion, and a plausible list of rows
  does not. A read that returns nothing usable raises the error state; rows
  retained beside it are labeled as the previous query's, not the current
  one's.

## What the parsed query owes downstream

The parsed query is the predicate every later stage cites. Counts shown in the
surface are counts *under this parsed query* — filters included, degradation
rung included. Saved views persist the parsed form (typed filters plus raw
free text), not the raw input string alone, so that recalling a view does not
re-run a parse whose grammar may have shifted. And highlights in excerpts must
derive from the same term list the door produced — highlighting the raw input
while the engine matched the sanitized form produces marks that don't line up
with the match.
