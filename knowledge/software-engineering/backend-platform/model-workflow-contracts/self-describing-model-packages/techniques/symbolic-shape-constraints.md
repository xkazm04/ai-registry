---
layer: technique
type: technique
subject: self-describing-model-packages
technique: symbolic-shape-constraints
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [describing an input a model accepts in more than one size, building the check that proves a package's metadata against its network, reviewing metadata that ships one example shape]
---

# Symbolic shape constraints

Most trained models accept a family of input shapes, not one. A fully
convolutional network takes any spatial size, or any size divisible by the
product of its downsampling strides; a patch-based model takes one fixed
patch; a model with a fixed-size head takes a fixed size in one axis and
anything in the others. The metadata has to express the family, because a
consumer that knows only one member of it will either fail on real data or
pad and crop its way to an answer that looks plausible and is wrong.

The rule: **when a valid input shape is a family, write it as an arithmetic
expression in shared one-letter variables, and ship a solver that turns the
expression into a concrete instance and forward-passes it.** The grammar
makes the family checkable; the solver makes it provable.

## The grammar

One entry per spatial axis. Each entry is one of:

- a **literal** — this axis is exactly this size;
- a **wildcard** — any size is accepted;
- an **expression** — an arithmetic formula over one-letter variables, using
  multiplication, addition and exponentiation, evaluated to an integer.

The variables are the whole point. `2**p*n` says "a multiple of a power of
two", and it says it in a way a program can enumerate: pick a `p`, pick an
`n`, evaluate. Where the same variable appears in more than one axis, it
binds the **same value** in all of them — a rule that an image must be square
is written by using one variable in both axes, and a rule that two axes are
independent is written by using two. A model whose divisibility requirement
comes from a shared stride writes the same variable everywhere the stride
applies, and a consumer can then read the coupling straight off the
metadata.

Keep the variable alphabet small and the exponent base explicit. A grammar
that permits arbitrary function calls has become an expression language,
and the sibling subject that owns expression languages will tell you what
that costs. Two or three named variables with fixed meanings — one for the
power, one for the multiplier — cover the families that actually occur, and
every additional variable is one more thing a consumer must be told how to
choose. Make the alphabet **closed**: a variable name outside it is an
error at solve time, not a free variable the solver quietly binds to one.

The expression is author-supplied text that the solver evaluates, and the
author is a stranger. Evaluate it in a **restricted evaluator over bounded
integer types** — arithmetic operators and the named variables, nothing
else, with values that overflow rather than grow without limit. An
exponentiation evaluated in the host language's arbitrary-precision
integers is a denial-of-service one metadata file away; the same
expression over a fixed-width integer either produces a shape or fails
fast.

## The solver

A grammar with no solver is documentation with a stricter syntax. The
package's tooling ships a command that:

1. reads the shape expressions from the metadata;
2. accepts a value for each variable from the caller, with sane defaults
   (a small power, a small multiplier) so that the command runs with no
   arguments;
3. substitutes, evaluates, and materializes a random input of the resulting
   shape, with the declared channel count and element type;
4. instantiates the network from the package's own configuration, loads the
   weights, and forward-passes the input;
5. asserts that the output's channel count and element type match what the
   metadata declared for the output.

Step five is where the technique earns its name. The metadata makes a claim
about the network; the only thing that can test the claim is the network
(`../../../../_laws.md#gate-sees-target`). A schema validator confirms the
expression parses. Only a forward pass confirms the network accepts what the
expression describes and returns what the metadata promises about it.

The solver must fail loudly and distinguishably. A forward pass that raises
is one outcome; an output with the wrong channel count is another; a
metadata file with no shape expression at all is a third, and none of them
may be reported as the empty success of "no mismatch found"
(`../../../../_laws.md#failure-not-empty-success`). A consumer that runs the
check as a gate before deployment needs to branch on which one it got.

## Decision rules

- **When a shape is fixed, write the literal.** An expression that evaluates
  to one value is a literal wearing a costume, and it invites a consumer to
  vary a variable that must not vary.
- **When any size is accepted, write the wildcard** — and mean it. A
  wildcard on an axis the network actually constrains is a lie the solver
  will catch only if the caller happens to choose an invalid value.
- **When a divisibility rule comes from architecture, derive the expression
  from the architecture**, not from the sizes the model was trained on. A
  network with four halvings accepts multiples of sixteen whether or not the
  training set happened to be larger.
- **When the model consumes patches of a fixed size cut from a larger
  input, say so in a separate flag** and write the patch size as the shape.
  The consumer then knows the shape describes what the network sees, not
  what the user supplies, and that a windowed-inference wrapper sits between
  them.
- **When a variable would need a meaning beyond "a power" or "a
  multiplier", stop and ask whether the family is real.** Most families that
  need a third variable are two models sharing a package.

## When not to use this

Do not use symbolic shapes for non-spatial dimensions that the framework
already handles — batch is the consumer's, and a channel count is a literal.
And do not use the solver as the package's only test: it proves that one
instance of the family runs and returns the declared type, not that the
model is accurate on it. Accuracy is a property of a dataset and a metric;
this technique is about whether the contract and the network agree on
shape, and it stops there.
