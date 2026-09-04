---
layer: technique
type: technique
subject: register-bytecode-execution
technique: dce-refuses-hoisted-declarations
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [writing dead-code elimination for a language that hoists declarations out of blocks, a constant-folded branch was removed and a name the program could see disappeared with it, deciding what "dead" means for a pass that runs before scope analysis]
---

# Dead-code elimination refuses hoisted declarations

Dead-code elimination removes a branch whose condition has folded to a constant that
never selects it. In a language whose declarations are **hoisted** (a variable or
function declared anywhere in a function body is bound at the function's top, before any
statement runs), the unreachable branch is not unobservable: its declarations exist
whether or not the branch executes. The technique states the rule a correct pass follows:
**a branch that contains a hoisted declaration is never eliminated**, however dead its
body, and the pass walks the branch to find out before it decides.

## Why reachability is the wrong gate

The pass's naive gate is "can control reach this code?" and the naive answer for a branch
under a constant-false condition is no. The gate is answering the wrong question. What
elimination must preserve is every observable effect of the code, and in a hoisting
language a declaration's effect (a binding, initialised to undefined for a variable and
to a closure for a function declaration) happens at scope entry, not at the declaration's
position. The branch is unreachable and its declaration is observed by every read of the
name in the enclosing function, and by the program's behaviour when that read would
otherwise be a reference error. The gate must see the target, which is the set of
bindings the branch contributes, and not the proxy, which is whether execution enters it
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The demonstration is three lines: a constant-false conditional wrapping a variable
declaration, followed by a read of the variable. Correct semantics: the read yields the
undefined value. After naive elimination: the read throws. A function declaration inside
the dead branch is the same case with a worse symptom, because the function is callable
from the live code and elimination removes a callable.

## The walk

Before eliminating a branch, the pass walks its statements for declarations that hoist:
variable declarations of the hoisting kind, function declarations, and in some languages
class or labelled-block forms that bind at the enclosing scope. Block-scoped declarations
(the kind bound at their own block's entry) do not hoist past the branch and do not
protect it. The walk stops at the first hoisting declaration it finds, because one is
enough to refuse. Whether it descends into nested function bodies is a choice between
precision and safety: a nested function's declarations hoist to that function's own
scope and do not protect the branch, so a walk that stops at function boundaries
eliminates more; a walk that descends refuses a few branches it could have removed and
can never be wrong. A pass whose walker is generic over the syntax tree gets the
descending kind for free, and that is the acceptable default; the boundary-stopping
kind is a refinement to make deliberately, with a test for the nested case.

If the walk finds a hoisting declaration the pass leaves the branch alone. It does not
try to extract the declarations and eliminate the rest, because the declarations'
initialisers may be live and the partial rewrite is a source of subtle bugs for a
saving that a later pass, running after scope analysis, could make correctly. The rule
for a pass that runs before scope analysis is to refuse, and the refusal is the technique.

## What is safe to eliminate

Expression statements with no declarations, nested blocks whose declarations are all
block-scoped, loop bodies under a constant-false condition with the same walk applied,
and the dead arm of a conditional expression (which cannot contain a statement). The
pass eliminates the branch, replaces the conditional with its live arm or with nothing,
and reports the change to the fixpoint loop, which may then fold what the elimination
exposed.

## Decision rules

- When a branch's condition folds to a constant that never selects it, walk the
  branch's statements for hoisting declarations before eliminating it; never eliminate
  on reachability alone, because reachability is a proxy for observability and the
  hoisted declaration is where they differ.
- When the walk finds a hoisting declaration, leave the whole branch in place; never
  extract the declarations and eliminate the rest, because the initialisers may be live
  and the partial rewrite is wrong more often than it saves.
- When walking, ignore block-scoped declarations, because they bind at a scope the
  branch's removal does not affect; descend into nested functions unless the walker has
  been taught to stop there and tested for it, because over-refusing is safe and
  under-refusing is a missing binding.
- When the language has any construct that binds a name at a scope other than its own
  position, add it to the walk in the same change that adds the construct, because the
  pass is only as correct as its list.

## When not to use it

A language with no hoisting (every declaration binds at its own position and is visible
only after it) can eliminate on reachability and this technique is a no-op. A pass that
runs after scope analysis has the bindings as data and can move a hoisted declaration to
the scope head before eliminating; that is a better pass and a larger one, and the
technique is the rule for the pass that runs before it.
