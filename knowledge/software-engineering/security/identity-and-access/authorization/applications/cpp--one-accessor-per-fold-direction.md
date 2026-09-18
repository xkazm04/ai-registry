---
layer: application
type: application
subject: authorization
technique: one-accessor-per-fold-direction
stack: cpp
verified_on: 2026-09-16
verified_against: cpp@17
applied: code
ab_verdict: better
---

# One accessor per fold direction in Squid's access-control answer

Squid is a caching HTTP proxy whose configuration language is, in practice, a
policy language: an operator writes access rules and a few dozen directives
consult them. Citations are against `squid-cache/squid` at commit `e68d7413`
(2026-09-15); the version witness is
`configure.ac:8` "AC_INIT([Squid Web Proxy],[8.0.0-VCS]", a source pin rather than a
release tag, which is the strongest witness a from-VCS tree carries. The
`verified_against` line names the language standard the tree mandates —
`configure.ac:100` "AX_CXX_COMPILE_STDCXX([17],[noext],[mandatory])" — because
that field's contract is a stack runtime version; the commit is the pin.

The finding is that the policy answer here is **four-valued and stays that way
all the way to its consumers**, and that the type deliberately refuses to
supply the fold.

## The verdict keeps its uncertainty

`src/acl/Acl.h:39-47` "ACCESS_DUNNO," declares the outcome set:

```
typedef enum {
    // Authorization ACL result states
    ACCESS_DENIED,
    ACCESS_ALLOWED,
    ACCESS_DUNNO,

    // Authentication Acl::Node result states
    ACCESS_AUTH_REQUIRED,    // Missing Credentials
} aclMatchCode;
```

Two definite values and two that are not answers: the check could not resolve,
or it needs credentials it does not have. The wrapper type defaults to the
uncertain one — `src/acl/Acl.h:96` "aclMatchCode code = ACCESS_DUNNO;" — so a
default-constructed answer claims nothing, which is the producer-side half the
corpus already demands.

## The two accessors, and the sentence on each

The technique's mechanism is visible in six lines, `src/acl/Acl.h:78-91` "If in doubt, use this popular method.":

```
    /// Whether an "allow" rule matched. If in doubt, use this popular method.
    /// Also use this method to treat exceptional ACCESS_DUNNO and
    /// ACCESS_AUTH_REQUIRED outcomes as if a "deny" rule matched.
    /// See also: denied().
    bool allowed() const { return code == ACCESS_ALLOWED; }

    /// Whether a "deny" rule matched. Avoid this rarely used method.
    /// Use this method (only) to treat exceptional ACCESS_DUNNO and
    /// ACCESS_AUTH_REQUIRED outcomes as if an "allow" rule matched.
    /// See also: allowed().
    bool denied() const { return code == ACCESS_DENIED; }

    /// whether Squid is uncertain about the allowed() or denied() answer
    bool conflicted() const { return !allowed() && !denied(); }
```

Every element the technique asks for is present and none of it is accidental:

- **Neither accessor is the negation of the other.** `!allowed()` is true for
  four-minus-one values; `denied()` is true for one. In a two-valued verdict
  these would be the same function, and the comments exist because they are not.
- **Each names what it absorbs**, by name, rather than describing its own
  return. The sentence a caller reads is "use this to treat DUNNO and
  AUTH_REQUIRED as if a deny rule matched" — the fold, stated as the purpose.
- **They are ranked.** *"If in doubt, use this popular method"* against *"Avoid
  this rarely used method"*. The symmetric pair is given an asymmetric default,
  in prose, at the definition.
- **The third branch exists** as `conflicted()`, so a caller wanting three ways
  out does not have to compose two tests correctly.
- **Whether the answer was matched or derived travels with it**:
  `src/acl/Acl.h:102` "bool implicit = false;", set when the answer came from
  the "negate the last explicit action" rule rather than from a rule that
  addressed the case.

There is one concession the technique would not write:
`src/acl/Acl.h:74-76` "operator aclMatchCode() const {" is an implicit
conversion, and the type's own
`src/acl/Acl.h:56` "TODO: Find a good way to avoid implicit conversion"
says the authors agree. It converts to the enum rather than to `bool`, so it
does not reintroduce the silent fold — it forfeits the compiler's help in
finding call sites, not the distinction itself.

## Why this tree needs the pair rather than a kernel fold

This is the structural fact, and it is what makes the case worth recording: the
same answer type is consumed by directives whose safe directions genuinely
differ. Authority-bearing rules — whether to serve a request at all — fold
uncertainty to refusal. Directives that select between two authorized
behaviours — which peer to consult, whether to store a response, whether to
take a direct route — have no closed direction to fail toward; each has a
correct default and it is not the same one. A kernel that folded centrally
would have to pick one, and a boolean-returning API would pick it silently.

The tree states the same asymmetry for its two empty inputs, four lines apart
in `src/acl/Checklist.h`, and the placement is the point — a reader sees both
defaults in one screen:

- `src/acl/Checklist.h:60` "If there are no rules to check at all, the result becomes ACCESS_DUNNO."
  A policy with no rules has said nothing.
- `src/acl/Checklist.h:83` "If there are no ACLs to check at all, the result becomes ACCESS_ALLOWED."
  A directive whose condition list is empty matches everything.

Two empties, opposite defaults, deliberately. And the implicit rule between
them is stranger than either:
`src/acl/Checklist.h:50` "Its result is the negation of the keyword of the last seen rule."
When rules exist and every one of them mismatches, that implicit rule decides.
The fallback is not a constant; it is derived from the
policy's own last line, which is why `implicit` has to ride along on the
answer.

## What the realization cannot do

The compiler does not enforce any of it. Nothing stops a contributor adding a
`bool` conversion, and the ranking that makes `denied()` rare is a comment, not
a type. The evidence that it holds anyway is social and reviewable rather than
mechanical — a project that has carried this pair for years without collapsing
it, in a codebase where the cost of collapsing it would be a silent policy
inversion. A stack that can express the pair as distinct *types* rather than
two methods on one type would get the same guarantee from the compiler; this
one gets it from the two sentences and the review culture around them.

The line `src/acl/Checklist.cc:111` "a fast-only directive uses a slow ACL!"
is the matching admission on the neighbouring axis:
a directive evaluated where it cannot wait, consulting a rule that needs to,
produces a debug line at level 2 and an uncertain answer — not a refusal to
start. The adjacent
`src/acl/Checklist.cc:109` "TODO: add a once-in-a-while WARNING about fast directive using slow ACL?"
records that the check is known to be
quieter than it should be.
