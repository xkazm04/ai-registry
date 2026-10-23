---
layer: technique
type: technique
subject: trust-base
technique: census-counts-unmarked-members
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [auditing the trust base of a package pinned to an earlier language revision, a census by the escape keyword reports zero or a small number, code writes the process environment while other threads may be running, an automated revision migration wrapped calls in the escape marker with a note to audit later, a justification says a call is fine because it compiles, tests that change the process environment run on a parallel test runner, the checker's unchecked type is a type that standard decoders return, a suppression ceiling records explicit uses of the unchecked type as zero]
---

# The census counts members the marker does not spell

The golden path defines the trust base as the places where somebody overrode or
extended the checker, and an audit finds them by their spelling: the escape marker,
the hand-written assertion, the skipped body. One kind of member has no spelling at
all. When a language revision re-marks a standard function as requiring the escape
marker, it does so because the function's precondition is something the checker
cannot check. Code pinned to the earlier revision calls that function with no marker,
and the checker accepts the call without deriving that it is safe. By the subject's
own test the call is a member: its soundness rests on a person's word. Nothing that
counts markers will ever find it, and a lint for undocumented escape blocks never
visits it.

The standing example is writing the process environment. Its precondition is about
every other thread in the process, which no type system tracks.

## How large the gap is

The same two predicates were run over three managed trees on one day, both stated:
**A**, lines carrying the escape keyword as a block, function, impl or foreign item;
**B**, calls to the re-marked environment functions on lines with no marker.

| Tree | A: marker sites | B: unmarked re-marked calls |
| --- | --- | --- |
| a desktop application | 38 | 103 (99 outside test directories, most inside in-file test modules) |
| a service workspace | 0 | 49 |
| a smaller service | 5 | 6 |

A census by marker reported the second tree's trust base as empty. That zero is the
instrument's blindness, not the tree's state
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)), and it
would have closed the audit before it started.

## The instrument is the revision's migration lint

The language ships a lint, for migrating to the revision that re-marks these
functions, that reports every such call in older-revision code. Run it per package as
a line of the census and report its number beside the marker count, each with its
predicate ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
text search for the re-marked function names is a fast stand-in across many trees,
and it is valid only after it has been checked against the lint on one package: on
the package checked here, the text search and the compiler lint named the same nine
calls on the same nine lines. The text search miscounts calls written inside a
multi-line marked block, so it is a census instrument for older-revision code only.

## Where the unchecked type is a value, not a marker

Some checkers spell their escape as a type rather than as a keyword: a type that is
assignable to and from every other type, so a value of it reaches typed code without
anything being derived. There, standard functions are unspelled members without any
revision re-marking them. A text decoder that returns the unchecked type, a network
response whose body resolves to it, and an array guard that narrows the safe unknown
type to an array of it all hand the program an unchecked value with nothing at the call
site to count, and no rule has to be switched off to use one. A census of directives
and explicit uses of the type then reports zero. In one tree it reported zero over three
packages where the type-aware lint found thirty members.

The instrument is the checker's type-aware lint for unsafe flow of that type
(assignment, return, argument, member access, call), counted per package beside the
directives. **That lint has a predicate too, and it does not cover every member.** A
callback whose parameter is annotated with a concrete shape, attached to a promise of
the unchecked type, is an assertion with no assertion keyword. The language lets a
function taking the shape stand in for one taking the unchecked type, and the lint
visits arguments, not the parameter types of the function passed. In the same tree two
of thirteen members in one package were of this kind, and a fixture outside the tree
reproduced the silence. Count that shape by text, validated against known sites and
against callbacks annotated with the safe unknown type, which are the cure and not
members. Name what the lint does not visit when you report its count.

Removal comes before documentation here too: decode into the safe unknown type and pass
the value through one function that checks it. In that tree the one package that
already did this had no members.

## A migration is not an audit

The automated migration wraps each call in the marker and leaves a note saying the
call should be audited for single-threaded use. After it runs, the marker exists, a
lint that requires a note beside every escape block is satisfied, and nothing has been
argued. Count members whose only note is a reminder to audit as unargued, separately
from members whose note states an argument.

## The argument is about the thread population, from the function's own precondition

The function's documentation states its precondition, and the argument starts from a
quotation of it: sound in a single-threaded program; always sound on one platform,
whose environment is synchronized; on the others, sound only if no other thread
writes **or reads** the environment by any route, including library functions that
read it without saying so, such as name resolution. Two narrowings of that
precondition were found in the trees, and both are wrong in instructive ways:

- **"No other thread reads this variable."** The precondition is about every variable
  and every reader, because the race is on the environment block itself, not on one
  entry.
- **"The earlier revision accepts the call, so it is safe."** That is a statement about
  the checker. The revision changed the marker, not the precondition; the call was
  exactly as unsound before the re-marking.

## A thread-population argument decays at a distance

An argument that rests on which threads exist depends on every thread that can be
running when the site runs, including threads started later for unrelated reasons.
In one tree the note was correct for the command-line path when it was written. Five
months later a latency change opened the audio output device on a new thread one line
before the call path that reaches the write, so that opening the device would overlap
loading a model. The note was not touched, and nothing could have told its author:
the change was in a different function, made for a different reason, and the build
stayed green. [soundness-argument-names-its-dependencies](./soundness-argument-names-its-dependencies.md)
covers the dependency's second end; for this shape the second end is every spawn
point that can precede the site.

## Remove before you document

The golden path ranks removal first, and these members are unusually easy to remove.

- **Move the write before the first thread starts.** The first statement of the entry
  point, before any runtime, any logger or error reporter with a background thread,
  any pool. One tree's loader for local settings runs there and says why in its
  comment. That member is sound by placement and needs no further argument.
- **Replace the process-global with an explicit value.** In-process readers take a
  once-set cell or a parameter; child processes receive values through the
  constructed environment of their spawn, which never touches the parent's own. One
  tree wrote a credential into its own environment at startup, from a worker thread,
  so that in-process tools could read it, and then had to strip it back out of two
  kinds of children that would otherwise have inherited it. The environment was
  serving as a channel to three readers and leaking to a fourth.
- **Give tests one lock, or their own process.** A test runner runs tests on parallel
  threads. A lock declared inside one test module serializes the tests that take it
  and nothing else; the desktop application above declares a separate one in each
  module that touches the environment, so two modules' tests can still race each
  other, and every test that reads the environment without a lock races them all. A
  second tree, read the same day by an independent run, had three such locks and
  reached the same reading; a variable name unique to each test does not help either,
  because the race is on the environment as a whole. One
  process-wide lock that every environment-touching test takes narrows the race to
  readers that take no lock; a separate test process removes it.

## Platform-conditional members

Where the precondition always holds on one platform, the member is sound there and a
member everywhere else. That is an [assumptions-are-build-errors](./assumptions-are-build-errors.md)
case: restrict the site to that platform with a build condition, or count it as a
member on every other target the package ships to.

## Decision rules

- **Run the migration lint on every package pinned to an earlier revision, and
  report its count beside the marker count,** each with its predicate.
- **Validate any text stand-in against the lint on one package** before using it
  across trees.
- **Where the unchecked type is a value, count its unsafe flow with the type-aware
  lint beside the directives, and count annotated callbacks on it separately,** since
  the lint does not visit them.
- **Count audit-reminder notes as unargued.**
- **Quote the function's precondition in the argument;** never argue from what the
  checker accepts, and never from a narrower reading scoped to one variable.
- **For a thread-population argument, name the spawns that can precede the site,**
  and prefer moving the site before the first spawn or removing the global.
- **Give environment-touching tests one process-wide lock or a process of their own.**

## When not to use it

- **The package is already on the revision that marks the function.** The marker is
  there and the census finds it; the discipline is then the ordinary one of
  [soundness-argument-names-its-dependencies](./soundness-argument-names-its-dependencies.md).
- **The program is single-threaded by construction:** no runtime, no background
  threads, no library that starts one. Say so once, and the census line for these
  members is that sentence.
