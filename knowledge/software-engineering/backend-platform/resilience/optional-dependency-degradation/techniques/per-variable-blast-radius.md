---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: per-variable-blast-radius
status: forged
laws:
  - one-authority-per-vocabulary
  - count-carries-predicate
shared_with: []
use_when: [adding a configuration variable, writing setup instructions a stranger can follow, nobody can say what breaks if a value is unset]
---

# The per-variable blast radius

The environment template is the most-read and least-written file in a
repository. Everyone copies it; almost nobody maintains it. In its usual state
it is a list of names — the reader learns that a variable exists, and nothing
about what it does, whether they need it, or what happens if they skip it. That
is a document with no information content standing exactly where the highest
concentration of undocumented coupling lives.

The upgrade is to treat the template as **the blast-radius document**: for every
variable, what it powers, what stops working without it, what the application
does instead, and what else must be done besides setting it. Four facts, written
at the variable, in the file people actually open.

## The four facts

- **The surfaces it powers.** Named features, not layers. "The upload button on
  the profile editor and the export job" tells a reader whether they care;
  "the storage client" does not.
- **What breaks without it.** Stated as the loss, from the operator's side. The
  reader is deciding whether to skip this variable today, and they can only
  decide against a consequence.
- **What the application does instead.** The named fallback and its durability
  statement — a local directory, an in-process store cleared on restart, a
  console sink, a hidden link, an honest refusal. This is the line that makes
  the claim falsifiable.
- **The companion setup step.** Everything the value alone does not accomplish:
  the bucket that must exist, the policy that must be applied, the address that
  must be registered with the provider, the host that must be added to the
  content-security directive before the browser will load anything from it. This
  is the fact that is never written down and always needed, because a value
  pasted without its companion step produces a deployment that is configured and
  still broken.

Two annotations earn their place beside the four. **Trust class** — whether the
value is server-only or exposed to clients — because the two are
indistinguishable in a shell and confusing them is how a private key ends up in
a browser bundle. And, where it applies, **the security consequence of
absence**: a variable whose absence disables an endpoint entirely is not merely
degrading, it is closing a door, and the entry should say so in those words, so
that nobody later "fixes" the endpoint by making it reachable without the
credential it exists to check.

## One authority, not a template plus a guide

The pull toward a second document is constant: a setup guide, an onboarding
page, a section in the readme listing the same variables in prose. Every one of
those is a second hand-maintained copy of one vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and the drift is directional — a feature branch adds a variable to the template
because the code will not run without it, and updates the guide only if someone
remembers. The guide is what a new person reads. So the template holds the
facts and any other document links to it; where a runtime has no template file
at all, because values arrive from a secrets manager, the same four facts move
to the manifest that declares them. The artifact changes; the contract does not.

Ordering is part of the authority. Group by feature, with a heading per
dependency and its variables beneath, because the reader's question is "what do
I need for search" and never "what starts with the letter S". A feature group
also gives the fallback statement a natural scope: it is written once for the
dependency rather than repeated per variable.

## Placeholders that a validator can reject

The template ships with example values, and those examples become production
values more often than anyone admits. Choose placeholder text that is
**mechanically recognisable** — a fixed sentinel word, a bracketed token, a
domain reserved for documentation — and give the boot validator the same list,
so a copied-but-unedited value is rejected by name rather than parsed as
plausible. A placeholder that looks like a real key is a trap the template set
itself.

## The line is a claim, and a test keeps it true

"When unset, uploads go to a local directory and are lost on restart" is a
statement about program behaviour written in a text file, which is to say it is
a comment, and comments rot. The cheap defence is a **degraded-mode test per
dependency**: boot with the variable unset, exercise the surface, assert the
named fallback happened. Where that is too heavy, the floor is one run — an
environment stripped to nothing, booted, and clicked through — recorded with
its date, because a claim that has never been executed is a guess.

Coverage here is a count that must carry its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"twelve variables documented" means nothing next to "twelve of fourteen
variables carry a fallback statement, two of which have an executing degraded
-mode test". The gap between those two numbers is the honest state of the
document.

## Decision rules

- **The entry is written in the change that adds the variable.** A variable
  introduced without an entry is an undocumented boot dependency, and the person
  who could describe it accurately is available for exactly one afternoon.
- **Every variable states what happens when it is unset**, including the ones
  that are required — for those, the entry says the application does not start
  and why the value cannot be defaulted.
- **Consequences are stated as losses, not as mechanisms.** "Sessions do not
  survive a restart" over "the memory adapter is used".
- **Companion steps are numbered actions in the world**, not references to a
  provider's documentation home page.
- **A variable removed from the code is removed from the template in the same
  change**, or the template starts collecting values that configure nothing —
  which teaches readers that entries are advisory.
- **Never put a real credential in the template**, including an expired one or
  a development-tier one. The file is public by construction.

## When this is not the shape

A deployment whose configuration is generated — by an infrastructure
description, a platform's environment editor, a secrets manager with its own
schema — has an authority already, and adding a template beside it creates the
second copy this technique exists to prevent. Put the four facts in the
generating artifact's comments or schema descriptions instead. The rule that
survives every substrate: the facts live *with* the declaration, exactly once.
