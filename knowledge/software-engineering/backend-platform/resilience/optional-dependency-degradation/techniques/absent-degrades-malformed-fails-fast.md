---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: absent-degrades-malformed-fails-fast
status: forged
laws:
  - failure-not-empty-success
shared_with: []
use_when: [deciding what an unset configuration value does, writing a boot validation pass, a mistyped value ran in fallback mode unnoticed]
---

# Absent degrades, malformed fails fast

Two conditions arrive at the same line of code and mean opposite things. The
value is not there; the value is there and wrong. A `try`, a parse, and a
fallback treat them identically, and that single conflation is what produces
the characteristic incident of this subject: a production deployment running in
fallback mode for days because somebody pasted a key with a trailing newline.

The separation is not a matter of care at each site. It is a branch taken on
**presence** before anything is parsed:

- **Absent** → the feature's declared fallback, and the process continues. This
  is a supported deployment posture, not a failure, and nothing in the request
  path should shout about it.
- **Present** → the value must be *right*. Validate its shape at boot and refuse
  to start when it is wrong, naming the variable and the shape expected.

## What counts as malformed

Malformed is not "the dependency rejected it" — that is a runtime fact and a
different technique. Malformed is anything a boot-time reader can determine
without a network call:

- **Wrong syntactic shape.** Not a valid address, not a number, not a
  key-shaped string of the expected length or prefix.
- **Wrong protocol or scheme.** A destination given without a scheme, or with
  an insecure one where the deployment requires otherwise. This deserves its own
  message rather than being folded into "not a valid address", because the
  operator's mistake and its fix are different.
- **An unreplaced placeholder.** The example value shipped in the template is
  the single most common way a variable becomes present-and-wrong, because
  copying the template is the documented first step. Placeholders must
  therefore be *recognisable* — a fixed sentinel, a bracketed word, a
  well-known dummy — and the validator rejects them by name.
- **Structural damage.** Leading or trailing whitespace, embedded newlines, a
  value that is obviously truncated, surrounding quotes carried in from a shell.
  Trimming these silently is a kindness that hides a broken deployment pipeline;
  rejecting them, with the observed length or the offending character named, is
  the fix arriving at the right person.

Cross-value consistency belongs here too: a pair of values that must refer to
the same project, a public and a private half that must both be present or both
absent. Half-configured is malformed, and it is exactly the state that produces
a surface which authenticates but cannot write.

## What the message must contain

A boot refusal is read once, by someone who just deployed, usually in a log
viewer with no context. Three things make it actionable and a fourth makes it
safe:

- **The variable's name**, exactly as it is spelled in the environment.
- **The shape expected**, concretely — "an absolute address beginning with a
  secure scheme", not "invalid configuration".
- **What was observed.** For a value that is not a secret — an address, a mode
  flag, a project reference — echo it in full, quoted so that stray whitespace
  and invisible characters are visible. Nothing identifies the mistake faster
  than seeing the value the process actually received. For a secret, identify it
  without disclosing it: the length, the prefix, the offending character, the
  fact that it equals the template's placeholder.
- **Never a secret's value.** Boot logs are shipped, screenshotted and pasted
  into tickets. A secret printed at boot is a secret leaked. The split is by
  trust class, and it is the same classification the environment template
  records per variable.

One message per distinct mistake. Missing, malformed, and wrong-protocol are
three conditions with three fixes, and a single message covering all three
sends the operator hunting.

## Fail fast means fail at boot

Fast is not a description of latency; it is a statement about *who* discovers
the mistake. A malformed value discovered at boot is discovered by the person
who deployed, at the moment they are still watching. The same value discovered
at first use is discovered by a user, at an unpredictable time, through a
symptom that does not name a variable. So the validation runs in whatever the
runtime's earliest hook is — the instrumentation or startup entry point that
executes before the first request is served — and its failure terminates the
process rather than being logged and passed over.

The failure must also be spelled differently from success in the only channel
that matters: the exit status. A start-up that logs a red line and then serves
traffic has produced an output indistinguishable from a healthy boot to
everything downstream
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The one exemption, and how to take it

A declared offline, mock or local-only mode is a real thing: absence is the
intended configuration and the upstream is not supposed to be reachable. The
validator is **skipped as a whole in that named mode**, with the skip written
at the validator and conditioned on the mode flag. What is never acceptable is
the alternative that gets chosen under time pressure: loosening the validator
for every deployment so that the mock mode stops failing. That converts a
scoped exemption into a permanent hole, and the next malformed production value
passes through it.

The same discipline applies to the small set of values that genuinely are
required. Those are not optional dependencies and this technique does not
govern them: they fail fast on *absence* as well as on malformation. Keep that
set as small as the product allows — ideally empty — and make each member say,
at the point of refusal, why it cannot be defaulted.

## Decision rules

- **Branch on presence, never on parse success.** A parse failure is not
  evidence of absence; treating it as such is the incident this technique
  exists to prevent.
- **An empty string is absent.** Environments deliver unset values as empty
  strings through several layers, and a deployment tool that writes an empty
  value means "not set". Normalise once, at the reader.
- **Validate every present value at boot, even the ones nothing has used yet.**
  A value read lazily by a feature nobody exercised is a mistake that waits.
- **Reject the placeholder by name.** The template's own example value is the
  most likely wrong value in existence.
- **Echo a non-secret, describe a secret.** Quoting the offending address in the
  refusal is the fastest fix available; quoting the key is a disclosure.
- **The boot summary is the compromise between silent and discoverable.** A
  single line at start-up listing which features are running degraded costs
  nothing, is read by whoever deployed, and keeps "silently" from meaning
  "invisibly". Silence belongs in the request path, not at boot.
- **Test both halves.** The valuable tests are: unset, and the named fallback
  runs; present-but-malformed, and the process refuses to start with the
  variable named. The second test is the one nobody writes and the only one
  that would have caught the week in fallback mode.
