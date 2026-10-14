---
layer: technique
type: technique
subject: hitl-approval
technique: author-advisories-yield-to-the-users-mode
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [loading an agent definition written by someone other than the person running it, merging approval rules from an author file and a user file, an author-declared default that could loosen or tighten approval, deciding which side wins when a rule says ask and the user chose an auto-deciding policy]
---

# Author advisories yield to the user's mode

An agent definition is increasingly something the operator did not write: a
file fetched from a URL, pulled from a registry or shared by a colleague. It
carries instructions *and* approval configuration, so the same document that
describes what the agent is also describes how much it may do unasked. The
question is whose word governs when the author's configuration and the
person running the agent disagree.

The answer cannot be "the later or more specific source wins". That rule lets
whoever controls the file move the approval boundary. It has to be provenance:
**rules carry the tier of the person who wrote them, and the tiers differ in
what they may decide.**

## The rule: restrictions bind from any tier, and the policy dial belongs to the person running

Order of evaluation is fixed and short: deny, then allow, then ask, then the
policy's fallback for unmatched calls. On top of that, three asymmetries:

- **A deny from any tier wins, and so does it across merges.** An author's deny
  protects the author's intent, a user's global deny protects the user, and
  neither can be overridden by an allow from the other. Merging is a union of
  denies, never a replace.
- **An author's `ask` is advisory.** Written in the agent definition, it asks
  for confirmation under the legacy and strict policies, and *yields* to a policy
  the user chose explicitly (balanced, fail-closed, open). Otherwise an
  author could re-introduce prompts into a profile that exists to be
  prompt-free, and turn a headless run
  ([fail-closed-profile-for-headless](./fail-closed-profile-for-headless.md))
  back into one that hangs. A user's own `ask` made at session level is direct
  intent and always prompts.
- **Author defaults fill gaps and never outrank an expression of preference.**
  An author may declare a default policy, even the open one, as a convenience for
  their own use. It applies only when the person running expressed no
  preference through any user-owned source (flag, alias, user config), and it is
  documented as such. The resolution is a stated priority list, not an
  accident of load order, and a value from the author tier is labelled so a
  reader of the effective configuration can see where it came from.

## What the author may still do

The author's tier is not powerless, and treating it as noise defeats the point
of declarative agent definitions:

- Tighten: add denies and strict defaults. Restrictions cost the user nothing
  they did not already own the power to undo.
- Allow, with a known cost. In the tree this was read from, an author-tier
  `allow` is honoured like any other and overrides the fail-closed fallback,
  so an author file can approve a destructive call the user's profile would
  have refused. That is a hole in the rule above, not a feature: the policy
  dial is the user's, but an allow list is a second way to turn it. A design
  that wants the full guarantee demotes author-tier allows the way it demotes
  author-tier asks (honoured under strict and legacy, ignored by a fail-closed
  profile), or at least labels them in the effective configuration.
- Advise: an `ask` that the user's strict or legacy policy honours is useful
  guidance for exactly the people who have not decided yet.

## Why this is an authority question, not a precedence question

[cross-source-precedence-chain](../../../../operations/governance-and-records/settings/techniques/cross-source-precedence-chain.md)
settles which of several sources supplies a *value*. This technique asks which
source may supply a *relaxation*, a different predicate with an asymmetric
answer: the same sentence, "allow this", has different meaning from the owner and
from a stranger whose file the owner ran. Keep it as one authority per
vocabulary ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the effective approval boundary has a single resolution function and the tiers
are an input to it, not three separate checks.

## Smells

- Approval defaults read from the fetched file with no check that the user
  stated nothing.
- A merge that lets a later `allow` cancel an earlier `deny`.
- An author-written `ask` that re-prompts inside the user's fail-closed or
  open run.
- An effective-configuration view that does not say which tier produced each
  rule.
- Resume that re-reads author defaults and overwrites the stored policy.
