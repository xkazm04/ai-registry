---
layer: technique
type: technique
subject: quality-gates
technique: waiver-names-its-finding
status: forged
laws: [absent-guard-is-loud, count-carries-predicate, deletion-is-not-repair, creation-names-reaper]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [designing the escape hatch a blocking gate offers, a waiver is written as free prose in a commit message or change description, one waiver appears to have silenced findings it never mentioned, tightening the syntax of an existing waiver or allowlist, deciding which findings a waiver may never downgrade, deciding whether a waiver needs a linked issue or an expiry]
---

# A waiver names the finding it waives

A blocking gate needs a sanctioned escape
([false-positive-economics](./false-positive-economics.md)), and the lifecycle of a
standing suppression entry is owned elsewhere
([suppression-hygiene](../../../codebase-stewardship/dead-code/techniques/suppression-hygiene.md)).
This technique owns the escape's **grammar and reach**: what a waiver must say to
take effect, what it takes effect on, and what happens when it says too little.

## The default reach of an unnamed waiver is everything

The cheapest waiver to implement is a presence check: if a waiver token appears
anywhere in the change, downgrade the blocking findings. It reads as strict - a
sentence is required, a reviewer can read it - and its reach is every finding in
the scope the gate evaluates, including findings the sentence never mentions, from
commits appended after the fact, written by anyone. One legitimate waiver buys
silence for an unrelated finding elsewhere in the same range. In one replay of a
project's recorded pushes, two free-prose waivers downgraded seven blocking
findings none of them named; one was a new endpoint whose access posture was never
declared, and it is still undeclared, because nothing re-reads a range once it has
passed.

So: **a waiver carries the finding's identity - the rule and the site, optionally
the exact occurrence - and downgrades only the finding that matches it. One waiver,
one finding.** The site is the finding's identity, not a free-text description;
the join must be mechanical or the count below is not possible.

## A waiver that names nothing waives nothing - loudly

Malformed or unmatched waivers have two tempting resolutions and both are wrong.
Honoring a waiver whose target cannot be parsed is the blanket above. Dropping it
silently leaves the author believing a finding was accepted when it still blocks,
or - worse - leaves a stale acceptance nobody sees. The waiver is **ineffective and
reported** as its own line: which text was read, why it matched nothing, and the
form it should have taken
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The finding
keeps blocking. The cost is small and measured: tightening the grammar invalidated
one of eleven historical waivers, and the report named it.

Tolerate spelling where it carries no identity - the separator before the reason,
surrounding whitespace, letter case of the token - and nowhere else. One token, one
field order: that is what makes "how many waivers, of what, where" a single query
rather than a reconstruction
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Tightening the grammar does not re-adjudicate the past

A gate that evaluates ranges only sees new ranges. Every finding the loose grammar
waived stays waived, forever, with no record of which waiver did it. When the
grammar tightens, **replay the recorded ranges once under the new grammar** and
list what the old one waived that no waiver named. That list is the debt the loose
grammar created; it is typically short, and it is the only place it will ever be
visible.

## Which findings no waiver may downgrade

Make a finding class unwaivable when the harm is complete at the moment the change
exists and no sentence can reverse it - a credential written into history is
exposed whether or not a reviewer agrees with the justification, and the repair is
rotation, not acceptance. An author who can write the defect can also write the
waiver.

Removing coverage is **not** that class, and banning its waiver is the tempting
over-correction. A deleted test whose subject was deleted with its feature, and a
conditional skip that states its precondition, are legitimate and recur; made
unwaivable, they force either a dead test kept alive or an edit to the gate itself
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) cuts both
ways). Measured: an absolute ban blocked eight of eight legitimate historical
coverage waivers and broke five of the gate's own contract tests, while removing
no illegitimate waiver the named grammar had not already removed. What coverage
removal must never ride is a *blanket* - a waiver scoped to a directory, a glob,
or a whole range. Coverage removal is waivable only by a waiver that names the
exact file.

## Issue links and expiry belong to standing entries

A waiver attached to one change applies to that change and ends with it; it has no
lifetime to reap, and requiring a linked issue on it rejects legitimate waivers
while catching nothing. A **standing** exception - an allowlist entry that keeps
applying to future runs - does outlive its reason, and needs its reaper named
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)); a linked
issue is one form of that condition. Ask which kind you are designing before
choosing the fields.

## Decision rules

- Before shipping an escape hatch, write two findings in one range and a waiver
  naming one. If both are downgraded, the hatch is a blanket.
- Feed the gate a waiver with a typo in its target. It must block and say why.
- When the grammar changes, replay history once and read what the old grammar
  waived that nothing named.
- Unwaivable: harm complete at write time. Waivable only by exact name: coverage
  removal. Waivable by name: everything else.
- Linked issue or expiry: required on standing entries, not on one-shot waivers.
