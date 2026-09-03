---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: absent-degrades-malformed-fails-fast
status: forged
laws:
  - failure-not-empty-success
  - absent-guard-is-loud
shared_with: []
use_when: [deciding what an unset configuration value does, writing a boot validation pass, a mistyped value ran in fallback mode unnoticed, reading a numeric or boolean tunable from the environment, validating configuration on a platform with no process boot]
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

## Tunables are where the collapse actually happens

The examples above are credentials and addresses. The class where the two
conditions get collapsed most often is duller and far more numerous:
**tunables with defaults** — a numeric ceiling, a boolean switch, an
enumerated mode. Absent means "use the default", which is correct, and it is
the only case the customary idiom handles. That idiom is a parse with the
default as its fallback: a number coerced and replaced by the default when the
result is not finite, a switch compared against one spelling of true. So a
ceiling with a typo runs silently at the default, and a switch written as
`yes`, `on`, or with a capital letter silently reads as off. Nobody notices,
because the default is a working configuration and the surface looks fine.

The asymmetry applies unchanged. Absent takes the default. Present parses
strictly — the accepted spellings of a boolean enumerated once for the whole
repository, a number required to be a number in the permitted range — and
anything else refuses at boot with the variable and the received value named.
The direction of the silent misread decides how much it costs: a fail-open
switch that quietly reads as closed is the safe accident; a strictness switch
that quietly reads as off has disarmed a guard without anyone choosing to
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), and a
ceiling that quietly reverts to its default has un-tuned a limit the operator
believed they raised.

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

## Where there is no boot

A runtime that starts a fresh process per cold start has no boot in the sense
above. Its earliest hook runs on every instance, so a refusal there is not one
loud failure in front of the person who deployed — it is a stream of failed
requests in front of users, indistinguishable from an outage, from a platform
that reports the deployment as live. On such a platform the step that *has*
the boot property is the **build or deploy step**: run the same validator
there, so the rollout is refused and the previous deployment keeps serving.

Two traps come with that placement. Build-time and request-time environments
are frequently different sets — a value present when the artifact is built and
absent when it runs, or the reverse — so the validator says which environment
it read, and a value that exists only at runtime is still checked in the
per-instance hook, with that failure spelled as a refusal rather than left to
crash. And the build-time validator is the one most often switched off: a skip
flag is added so a pipeline without secrets can produce an artifact, and it is
left set in the environment that had the secrets, at which point the guard
meant to refuse the deploy protects nothing and says nothing
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The skip
is scoped to the pipeline that needs it, and a build that skipped validation
says so in its output.

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

## The third state: well-formed, and wrong for the role

Absent and malformed are the two states a parser can see. There is a third it
cannot, and it appears wherever a value is **shared between two roles**: a value
that is present, syntactically valid, and semantically correct for a role other
than the one reading it.

The canonical instance is a bind address. A server is told to listen on the
wildcard address so it accepts traffic on every interface, and that value is
correct, deliberate, and meaningful — for the server. It is never valid as a
*connect* target. When the two roles read the same variable, and they often do
because the variable was named for the service rather than for the direction, a
client picks up the server's binding and tries to dial a non-address. The parse
succeeds, so the malformed rule does not fire; the value is present, so the
absent rule does not fire; and the failure surfaces one layer down as an
unhelpful connection error.

Enumerating this class is cheap because it is small and it is a property of the
value's *domain*, not of the deployment: wildcard and any-interface addresses,
placeholder hosts, a port of zero meaning "pick one", a path that is valid but
belongs to the other side of a boundary. Each has a check of a line or two.
Treat a hit as **absent with a warning** — say which value was ignored and why,
then take the fallback — rather than as malformed, because the operator did not
make a mistake in the sense the fail-fast rule punishes. They set a variable
correctly for a different consumer.

## A fallback belongs to a value you chose, never to one the operator chose

The related rule concerns what happens *after* the value resolves, and it cuts
against the instinct to make retry behaviour uniform.

A defaulted address may reasonably be tried more than one way. The classic case
is a loopback hostname that resolves to the IPv6 address while the service is
listening only on the IPv4 one; falling back from the name to the literal
address is a correct, invisible repair, because the code — not the operator —
chose the name in the first place, and both candidates encode the same
intention.

An **explicitly configured** address gets no such courtesy. If the operator
named a host and it is unreachable, the honest response is to fail against the
host they named. A fallback there does not repair anything: it hides a
misconfiguration at exactly the moment the operator was being explicit, and it
does so by succeeding — the process comes up healthy, pointed somewhere the
operator did not ask for, and the boot summary reports a working dependency
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
resulting bug report is that the setting "does nothing".

So the fallback chain is a property of *provenance*: values the code defaulted
may carry alternates, values the operator supplied may not. That distinction has
to survive into the resolved configuration — a resolver that returns only the
address, discarding whether it was defaulted or supplied, has thrown away the
input this decision needs.

## Decision rules

- **Branch on presence, never on parse success.** A parse failure is not
  evidence of absence; treating it as such is the incident this technique
  exists to prevent.
- **A value that is valid for another role is absent, loudly.** Check the small
  domain-specific set — wildcard binds, placeholder hosts, port zero — name the
  value you ignored, and degrade. It is not malformed and the operator is not at
  fault.
- **Fallbacks attach to defaults, not to configuration.** Carry provenance
  (defaulted versus supplied) through resolution, and let only the defaulted
  value try an alternate. An explicit setting that fails, fails.
- **An empty string is absent.** Environments deliver unset values as empty
  strings through several layers, and a deployment tool that writes an empty
  value means "not set". Normalise once, at the reader. The one class where
  empty is a legitimate value — a list that may be empty, a prefix that may be
  none — declares that at the reader too, because the default reader will
  otherwise turn a deliberate "none" into the fallback.
- **A default is for absence, never for a parse failure.** The tunable that
  falls back to its default on a bad value is the week in fallback mode at
  small scale, and it is written by the idiom, not by carelessness.
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
