---
layer: technique
type: technique
subject: prompt-assembly
technique: contributed-document-admission
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [injecting a registry of instruction documents your team did not author, a document declares the tools it wants and something grants them, two installed sources publish an entry under the same name, an installed document is ignored and nobody can tell whether it loaded, deciding whether to inject a document's body or a pointer to it]
---

# Contributed-document admission

[capability-documentation](./capability-documentation.md) renders the ability
layer from the live registry and treats that registry as an authority — which
it is, when the system wrote it. A second kind of registry entry arrives from
outside: an **instruction document a person installed**, authored by somebody
who has never seen this deployment, declaring a name, a purpose, sometimes a
list of tools it would like, and often a procedure written as steps. These
entries want to reach the standing layers, they are usually the larger half of
what the model reads, and the assembler is the only component that knows where
each one came from.

That makes admission an assembly decision, not a loader decision. The
subject's own trust rule says an untrusted span never lands in the identity or
policy layers and enters only at declared insertion points. A contributed
document is neither authored nor untrusted in that sense — it is a third
class, *installed on purpose by the operator, written by a stranger* — and it
wants to sit in the capability layer, which is above the line untrusted spans
may cross. This technique is the contract that makes that admissible: what
enters the prompt, what identity the entry is given, and the two things a
document may describe but never obtain.

## The index is the injection; the body never is

The standing layer carries, per admitted entry, exactly three things: a
**name**, a **description** written in the vocabulary the selection is made
in, and a **canonical identifier** that resolves to the document itself. The
body is not injected — at admission, and also not on selection. When a task
falls in an entry's domain, the model reads the document, with a read
operation it already had, and the fetch appears in the transcript like any
other.

Two properties, and the second is the one usually missed. The standing cost
becomes a function of **entry count** rather than of document size, which is
what makes a large installed catalog affordable at all; this is the same trade
[elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md) makes over a
transcript, applied at composition time to material that was never in the
prompt to begin with. And **admitting a document grants no new reach**: the
identifier resolves through a capability already on the roster, so installing
an entry adds bytes to the index and nothing to what the agent can do. An
identifier that required a bespoke resolver would make every admission a
capability change, and it would be a capability change nobody reviews, because
the review that happens is of the document.

The description is the whole selection surface — it is what routes, and a
superb body behind a vague description is a standing cost with a lottery
ticket attached. Budget it as an index line, and treat its wording as the
entry's real interface.

## A declaration is a claim, not an acquisition

Contributed documents routinely state what they need: an operation, a
permission, an integration. **Requesting a capability is not acquiring one.**
A host that widens the roster because a document asked has moved the grant
decision to whoever wrote the document, and it has done so through a gate that
reads the requester's own statement instead of the thing being gated
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The check that
looks diligent — *this document declares it needs three operations, so we
enable three operations* — is the vulnerability, not the safeguard.

What a declared need is good for is a **precondition**: compare it against
what this session actually holds, and let the comparison decide how the entry
renders. An entry whose stated needs are met renders normally. An entry whose
needs are unmet is listed with the gap named, so the owner can grant it
deliberately or uninstall it, and so the model is not routed toward a
procedure it cannot complete. The declaration never widens anything.

## Nothing in the document is executed

A contributed document commonly contains commands, scripts, or a numbered
procedure that reads like one. **None of it is run by the host.** It is text
the model reads and decides about, and it reaches an effect only by the model
invoking a capability the session already holds, through whatever consent that
capability carries.

The distinction is not cosmetic, and it is invisible in the document itself: a
command the model chooses to run passes every gate the assembly installed —
consent, argument checks, audit — while the same command executed by the
loader passes none of them, because the loader runs before any of that exists.
Two identical lines of text, two entirely different trust stories, decided
solely by who ran them. A registry that executes anything from its entries has
converted an install into code execution with the host's privileges, and the
install is a decision the owner made in a second, for one afternoon, months
ago.

## Identity comes from where the entry sits

Derive an entry's identity from its **source root plus its own container** —
the location, in the layout the registry scans — and treat the name the
document declares about itself as one more field of content.

The reason is the ordinary one, with an unusual consequence. Two authorities
for one name is a drift race
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and here the second authority is written by a party outside the trust
boundary: a document that names itself into another source's namespace is
claiming a reputation it did not earn, and if the self-declaration wins, the
collision resolves in favour of whichever source loaded last. Location cannot
be forged from inside a document, which is exactly why it makes a better key
than anything the document says.

So a self-declared name that disagrees with the entry's location is a
**warning attached to the entry, never an override**. Report it — a
disagreement is usually a copied template nobody edited, occasionally
something worse, and always worth one line of diagnostic — and keep addressing
the entry by where it lives.

## An invalid entry stays visible and stays out

An entry that fails to parse, or whose required fields are missing, gets
neither of the two easy treatments. It is **not injected**, because unvalidated
content does not enter a standing layer. And it is **not dropped**, because a
silently dropped entry is indistinguishable from one that was never installed
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
the owner's only symptom is that the agent never uses a document they can see
on disk, which is a symptom with no error message and no obvious place to look.

The third treatment is the correct one: the entry appears in the registry's own
listing, marked invalid, carrying the diagnostic that says what is wrong with
it — while contributing nothing to the prompt. The listing the owner reads and
the index the model receives are therefore **not the same artifact**, and that
is deliberate: one is complete and honest about failures, the other carries
only what was admitted.

## Which entries are active is local state, and it is a fingerprint input

Enable state — which admitted entries are switched on for this machine — is
per-installation, and it belongs beside the installation rather than inside the
source everyone shares. Persist only **deviations from the source's own
default**, never the resolved set: storing the resolved set freezes today's
default into every machine, so a source that later changes what it ships by
default moves nobody, including the majority who never expressed an opinion.

This matters to assembly and not only to configuration, because the active set
decides the standing text. It is therefore a fingerprint input on the same
footing as the template version and the active capability roster (see
[fingerprinting-and-cache-keys](./fingerprinting-and-cache-keys.md)): a session
opened before an entry was disabled is running against an index that no longer
exists anywhere, and it is stale rather than merely out of date.

## When not to use it

A registry whose entries the system authors and versions alongside its own
code needs none of this — that registry is an authority, and
[capability-documentation](./capability-documentation.md) covers it. These
rules are the surcharge paid for entries with a third-party author, and the
surcharge is worth paying from the first such entry, because the properties it
buys (identity that cannot be claimed, capability that cannot be self-granted,
failure that cannot be silent) are all properties that are cheap at admission
and unrecoverable afterwards.
