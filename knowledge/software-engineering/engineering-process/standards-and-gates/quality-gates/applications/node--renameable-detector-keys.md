---
layer: application
type: application
subject: quality-gates
technique: renameable-detector-keys
stack: node
verified_on: 2026-09-04
verified_against: node@20
applied: code
ab_verdict: better
proof: ab-paired
---

# A purity gate keyed on a list of names (Node)

Read and exercised 2026-09-04 against this registry's own bundle checker — the
Node script that every writing session runs before it commits, and the thing
that decides whether an upper-layer document is allowed to exist. The CI
workflow pins the runtime at node@20; the session that ran these arms was on
24.14.0 and the check is version-independent.

The registry is an honest exhibit for this technique for the same reason it was
for its sibling: it wrote the technique, and it is the tree the defect is
easiest to prove on, because the rule the gate enforces is one the project
cares about more than most.

## The seam

The gate's purity check holds a per-domain list of literal product, framework
and path identifiers, and refuses any upper-layer document containing one. The
list's own comment says it is "a FLOOR: extend it when a leak slips past, never
narrow it to make a document pass" — so the project already knew the coverage
was partial. What the comment describes is an **accidental** gap, closing as the
list grows.

The key is renameable, which makes the gap something else. The property the rule
is about is *does this document tie itself to a particular product*. The key is
*does this document contain one of these strings*. A writer — or an agent asked
to make the gate pass — closes the second without touching the first by
referring to the product instead of naming it.

## The arms

Same document, same checker, same invocation. The measurable is the count of
purity violations the gate reports.

- **A — literal referent.** One sentence added to a technique file naming a
  listed linter. Gate reports `body purity — contains stack/product identifier`,
  exit non-zero. **1 violation.**
- **B — periphrastic referent.** The same sentence, the product described
  unmistakably and not named ("the dominant style checker for the language
  browsers run, the one whose dotfile every front-end repository carries").
  Identical referent, identically non-transplantable, identical meaning to any
  reader. Gate reports nothing and prints `bundle integrity OK`. **0
  violations.**

A first attempt at arm B tripped the gate on a *different* listed word that the
periphrasis happened to contain, which is worth recording: the floor is real and
it catches careless evasion. It took one revision to walk around, by a writer who
was not trying hard. That is the cost of the bypass, measured.

## What was changed, and what could not be

The technique's last section is the operative one here, because **no invariant
key exists for this property.** Reference is semantic; a static matcher cannot
separate "describes a product unmistakably" from ordinary prose, and the project
had already reached that conclusion — its real transplant test is handing the
document to an agent in another context, which the checker cannot run.

So detection was not improved and cannot be. What was wrong was the **verdict**.
The run over arm B printed `bundle integrity OK` after two honest disclaimers
(evidence resolution is consumer-side; the live transplant test is not statically
checkable) and nothing about the shape of the key that had just passed. A reader
—increasingly a machine reader — takes that as *this document is transplantable*.

One line was added to the checker's output, beside the two that were already
there:

> `Purity checked against literal names only — a product referred to without
> being named passes; the denylist is a floor, not a proof of transplantability`

Re-run against the same arm B document: same green, same zero, and the pass now
states what it read instead of the property it proxies.

## The proof, and what it does and does not show

`ab-paired`, n=1, same instrument, both arms run. The pairing establishes the
defect cleanly: two documents that are equally impure receive opposite verdicts,
and the only difference between them is a rewording.

The change's own measurable is narrower than the defect, and the application
would be dishonest if it blurred them. **Detection rate: unchanged, by
construction.** What moved is the verdict's predicate coverage — whether a
reader of a green run can tell that a periphrasis passes. Before: no. After:
yes. That is the whole claim, and it is the claim the technique makes for a key
with no invariant form.

## What this realization cannot do

- It does not detect the evasion, and nothing added to this file will. A team
  copying this should not read the added line as a mitigation; it is a
  disclosure, and its value is entirely in stopping the next reader from
  over-reading a green.
- It does not bound how often the bypass happens. The diagnostic the technique
  asks for — findings per thousand documents over time, watched for a fall
  nobody explains — is not collected here, and the checker keeps no history, so
  a drift would be invisible. That instrument is missing and its absence is the
  return condition on this row.
- The one honest structural fact the tree offers is negative and was not
  designed: the project maintained this list for six domains, extended it twice
  in response to leaks, and wrote a comment explaining that extension is the
  remedy. Every one of those extensions was a response to an *accidental* miss.
  Nothing in six domains' worth of maintenance had asked whether the key could
  be stepped around on purpose — which is the question the technique exists to
  make routine.
