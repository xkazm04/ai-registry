---
layer: technique
type: technique
subject: mcp-tools
technique: ambient-selection-is-not-an-argument
status: forged
laws: [gate-sees-target, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a tool server drives a single-seat interactive application rather than a service, a tool argument names the current selection or the active document, an operator and an agent both act on one running instance, deciding what a long unattended tool run may assume about the state it started from, a tool surface is added to a program that was designed for one person at a time]
---

# Ambient selection is not an argument

Most servers in this subject sit in front of a service: a database, an index, an
API, something built from the start to be called by many callers with no memory
of each other. A growing number sit in front of something else — **a single-seat
interactive application**, a program designed for one person at a keyboard, that
has acquired a tool surface over the scripting interface it already had. A design
editor, an analysis workbench, a modelling tool, an editing suite. The protocol
is the same wire. The thing behind it is not, and one difference decides the rest.

A service-backed server holds no state a caller did not give it. A single-seat
application is **all** state, and most of it belongs to the person using it:
which document is open, which item is selected, where the cursor sits, what the
last undoable action was. That state is real, it is what the application's own
scripting interface reads by default, and **it is not in the request**.

## The failure: a reference the request does not carry

The shape arrives as an argument that reads like an argument and is not one:

> *"Extract shorts from the currently selected timeline."*
> *"Apply this to the active document."* *"Re-render the current view."*

Every one of those resolves against a variable the caller never set and the
server never minted. The golden path's framing says every request is
self-describing, that there are no protocol-level sessions, and that state which
must span calls is an explicit handle the server mints and the caller passes
back. An ambient selection satisfies none of it: it spans calls, the server
cannot mint it because it does not own it, and the request describes a *spelling*
rather than a target ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
Two calls with byte-identical arguments address different objects, and neither
call is wrong.

Note which neighbour does *not* cover this.
[write-freshness-gate](./write-freshness-gate.md) governs an artifact the model
**read** and is now writing back, and its proof is a hash of the content the
model saw. Here the model never read anything: it passed a word through and the
server resolved it on the other side. There is nothing to hash, so the gate does
not fire — and it should not, because nothing went stale. The reference was never
fresh.

## Exclusivity is what makes it work, and nobody designed it

The reason this ships and appears to be fine is worth stating plainly, because it
is the part that will break.

These applications are single-threaded against their own automation surface.
While a tool call is executing, the application is **unavailable to the person
sitting in front of it** — the window does not respond, the operator waits or
walks away, and the practitioner advice that circulates for these setups is
scheduling advice: run it overnight, drive it from a second machine, queue the
work before lunch. That is read as a performance limitation, and it is one.

It is also the only thing holding the invariant. The selection cannot move under
the agent because nobody can move it. **The correctness of every ambient
reference in the design rests on a mutual-exclusion property that exists as a
byproduct of the application being slow and single-threaded**, that appears in no
contract, and that the vendor is actively working to remove — every release that
makes the automation surface more concurrent, or lets the operator keep working
during a long job, deletes it. An invariant nothing declares is an invariant
nothing will notice losing
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) in its
undeclared form).

The tell that a design is standing on it: ask what the tool does if the operator
clicks a different item halfway through a twenty-minute call. If the answer is
"they can't", the answer is about today's build.

## The rule

> **Resolve an ambient reference to an explicit identity once, at the boundary,
> and name that identity in every call after it.**

The server *can* mint a handle for what it read, even though it cannot mint the
selection itself — which is the whole of the corrective
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). Four
obligations follow, and they are cheap:

1. **Resolution happens in its own call, and returns what it resolved.** A tool
   that accepts "the current selection" returns the identity, the kind, and a
   human-legible name for it — not a success. The model then has something to
   pass, and the operator reading a transcript can see which object the run
   actually operated on, which is the difference between an auditable run and a
   plausible one.
2. **Every subsequent call names the identity, never the ambient term.** Once
   resolved, "current" is not available as an argument. This is a schema
   decision, not a convention: the later tools do not accept the word, so the
   model cannot re-resolve mid-run and silently change subject.
3. **An empty or ambiguous selection is a typed refusal, not a default — where
   the absence can change the answer.** "No document is open", "several items are
   selected, and this operation takes one", and "the resolved item is not of a
   kind this operation accepts" are three different facts an operator acts on
   differently, and none of them is *the first one*
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
   Falling back to the first, the last, or the whole document is the failure this
   obligation exists to prevent, because it produces a confident result about the
   wrong object.

   The qualifier is not a softening, and it was learned by aiming this rule at a
   tool that already held it. An unconditional refusal on a missing reference
   makes the tool unusable for every call where no ambient state is in play,
   which is most of them. So the refusal is owed exactly when the missing
   reference **could have changed this answer**, and a tool able to decide that
   cheaply should decide it rather than refuse on principle. The shape that
   works: from the target the caller *did* name, compute whether any state the
   absent reference would have scoped can actually reach it — refuse by name if
   it can, proceed silently if it provably cannot. That is a predicate over the
   real target rather than a policy about the argument
   ([gate-sees-target](../../../../_laws.md#gate-sees-target) on its negative
   side), and it is the difference between a guard and a nuisance.

4. **A long run re-asserts the identity rather than trusting exclusivity.** Where
   the operation spans many calls, each write verifies that the named object
   still exists and is still the kind it was, and stops if not. That is the check
   that survives the day concurrency arrives, and it costs one comparison.

## What this does not settle

It does not make the application multi-tenant. Two agents against one instance
remains a bad configuration for reasons this technique cannot repair — undo
stacks, modal dialogs, and global settings are all still one, and a resolved
handle protects the object, not the program.

Nor does it address the *other* half of a single-seat backing resource: that the
operator's own work is blocked for the duration. That is a scheduling question
and belongs to whoever owns the run, not to the tool contract. What the tool
contract owes is honesty about it — a call whose expected duration is measured in
tens of minutes says so in its description, because the host's consent gate is
the last place the person can decide not to lose their afternoon.
