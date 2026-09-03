---
layer: technique
type: technique
subject: untrusted-extension-host
technique: per-callback-failure-policy
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [deciding whether an extension callback's failure aborts the operation that triggered it, a timeout on foreign code must not be mistaken for stopping it, an extension needs to refuse an operation rather than crash on it]
---

# Per-callback failure policy

An extension participates by registering callbacks at named points in the
host's operations, and the host must decide what a callback's failure means.
One global answer is wrong for most of the callbacks it covers, in one of two
directions. If every callback is implicitly fatal, a bug in a notification
extension refuses every save in the product. If none is, an extension installed
specifically to validate records is a guard that stops guarding the first time
it throws — and nothing in the system distinguishes "the guard passed it" from
"the guard was skipped".

The general craft of failure classification, error doors and typed propagation
belongs to the corpus's
[error-handling](../../../../backend-platform/resilience/error-handling/error-handling.md)
subject and is not restated. What is here is what only exists because the code
on the far side is foreign: who may declare a failure non-fatal, what a timeout
is allowed to bound, and why a crash and a refusal must not arrive as one
signal.

## The declaration is per registration, and its default is correctness

**Each registration states whether its own failure is fatal to the operation
that triggered it.** Not each extension — each registration, because one
extension routinely holds both a validating hook and a notifying one, and a
per-extension setting forces the author to choose the wrong answer for one of
them.

The default is the **correctness-safe** side: a callback that does not say is
treated as blocking, and its failure fails the operation. Hosts default the
other way because it makes the platform feel robust in demos, and the cost
appears later, in the only place it matters — a policy hook that silently
stopped running. When the default is fail-open, the system's guarantee degrades
by accident; when it is fail-closed, it degrades by an author's explicit
statement, which is a thing a reviewer can see and an administrator can be told
about.

The declaration has a ceiling the extension does not control. **The host, not
the author, decides which hook points *may* be declared non-blocking.** Points
whose entire purpose is to permit or refuse — an admission check, a validation
gate, an authorization contribution — are blocking by construction, and a
registration there that declares itself non-blocking is refused at registration
time with a named reason. The reason is the same one that makes an intercepting
contribution fail closed elsewhere in the corpus: a guard whose author can opt
out of mattering is not a guard, and an untrusted author is precisely the
principal who would.

The symmetric ceiling matters too. On a hot path where a blocking third-party
callback would put foreign latency in front of every request, the host may
declare the point non-blocking and refuse a registration that asks to block
there. Both ceilings are properties of the *point*, declared by the host,
published in the extension contract, and enforced at registration — never
negotiated per call.

## A timeout bounds the wait, not the work

The most common misunderstanding in the whole area, and the one that leaks
resources quietly. A host that awaits a foreign callback with a deadline has
bounded **how long it waits**. It has not bounded the callback. When the
deadline fires, the operation proceeds or fails according to the policy above,
and the extension's code is *still running*: still holding its isolate, still
consuming its ceilings, still able to issue brokered calls, still able to
complete and return a value nobody is listening for.

Three rules follow, and hosts that skip them accumulate orphaned executions
until the isolate pool is the outage:

- **Say what the timeout does, in the contract and in the diagnostic.** "Hook
  timed out after N ms; the operation continued" is honest. "Hook cancelled" is
  a claim about foreign code that the host is not in a position to make.
- **The timeout is the host's, not the extension's.** An author-supplied
  deadline bounds a wait the author does not perform; the wait is the host's
  and so is its bound. Author configuration may narrow it, never widen it.
- **Name the reaper for the abandoned execution**
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). The
  isolate the timed-out callback is running in is torn down on a schedule the
  host controls, its late brokered calls are refused rather than served, and
  its eventual return value is discarded rather than applied to an operation
  that has already finished. A late result applied after the deadline is worse
  than no result: it is a write nobody's timeline accounts for.

A timed-out blocking callback fails its operation. It does not *pass* it —
that is the shape of empty success this area produces
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)), and
it is how an overloaded validation extension turns into an accept-everything
policy at exactly the moment the system is under load.

## Refusal is a value, not an exception

An extension that wants to **decline** an operation — this record fails our
editorial policy, this publish violates our schedule rule — needs a way to say
so that is distinguishable from crashing. If the only channel is throwing, then
the host receives one signal for two facts, and every consumer downstream is
guessing: the administrator sees an error where a policy message belonged, the
retry logic retries a deliberate refusal, and the author's careful message is
rendered as an internal failure.

So the callback returns a **structured result envelope**, versioned, with a
small closed shape: an outcome, an optional bounded reason string, and nothing
else that the host will act on. A refusal carries its reason to the caller as a
typed refusal; an exception is a failure with the extension's identity attached
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Four properties keep the envelope from becoming its own attack surface:

- **Versioned**, because the shape will grow and an old extension's envelope
  must remain readable rather than being reinterpreted under new rules.
- **Bounded**, because the reason string is foreign text that will be rendered
  in the host's interface and stored in the host's records. Cap its length at
  parse, and treat it as text rather than as anything the interface will
  interpret.
- **Closed**, because a field the host does not recognize is a field an author
  is using to reach something. Unknown fields are dropped, not passed through.
- **Collapsing**, because the interesting failure is a *malformed* envelope —
  a wrong shape, an unparseable outcome, a value where the shape says
  otherwise. That collapses to the generic failure for this callback under its
  declared policy. It never collapses to success, and it is never repaired by
  guessing which outcome the author meant.

The host tier needs the same verdict and usually spells it as a thrown
sentinel type rather than a returned envelope, which is fine — but the
discriminator must not be prototype identity alone. A packaging step that
duplicates a module across bundles gives two copies of one class, and an
identity test against the wrong copy reports a *deliberate refusal as a
crash*: the editor sees an internal error where a policy message belonged, and
the operator sees a plugin fault where a plugin was working correctly. Test a
stable discriminant the duplicate also carries — a name, a code, a marker
field — with the prototype check as the fast path, and write the test against
the discriminator rather than the class.

The one thing to state plainly to authors: a refusal is a decision the
extension is making on the operator's behalf and it will be shown to a human
with the extension's name on it. That framing gets better reason strings than
any validation rule does.

## Decision rules

- Declare blocking-ness per registration, not per extension; default to
  blocking.
- Let the host decide, per hook point, which policies are permitted; refuse a
  non-blocking registration at a gating point and a blocking one at a
  host-declared hot path, at registration time, with a named reason.
- Bound the wait with a host-owned timeout; say in the contract and the
  diagnostic that the work continues; let author configuration narrow it only.
- Tear down the abandoned execution on the host's schedule, refuse its late
  brokered calls, and discard its late return value.
- Fail a blocking callback's operation on timeout; never pass it.
- Return refusals through a versioned, bounded, closed result envelope; keep
  refusal and failure typed all the way to the caller.
- Collapse a malformed envelope to the generic failure under the declared
  policy — never to success, never to a repair.
- Where the verdict is a thrown sentinel type, discriminate on a stable
  marker the packaging step cannot duplicate away, not on prototype identity
  alone.

## When not to use it

A host whose extension points are all observational — recording, measuring,
annotating, deciding nothing — needs one global fail-open policy and no
declaration, because there is no correctness answer to get wrong. The
per-registration policy earns its complexity the moment one hook point can
change an operation's outcome, and the structured envelope earns its cost the
moment one extension is expected to say no.

## Boundary: an observe-and-augment surface, and the mute the host then owes

The rule above is per registration because a hook point can change an
operation's outcome. There is a whole class of host where no hook point can:
every callback observes or augments - annotates a record before it is shown,
replaces a message before it is painted, adds a completion, posts a
notification - and none permits or refuses. On that surface a **uniform
non-fatal policy is correct**, not a shortcut: every callback runs as a
protected call, its failure goes to the extension's own log channel with the
extension's identity on it, and the host's operation proceeds as if the
callback had returned nothing. There is no correctness-safe side to default
to, because there is no verdict for the failure to be mistaken for.

Two duties follow, and the uniform policy is wrong without them. First, the
dead extension never runs again. An extension whose entry file failed keeps
its error and every later callback lookup returns empty; an extension that
was unloaded has its registered closures *abandoned* - the host drops the
reference without destroying the function, because destroying a foreign
function after its runtime is gone is the host's own crash. Second, because
an augmenting callback fires on exactly the mutation it can itself perform -
replace fires the replaced hook, append fires the appended hook - the
extension can re-trigger itself. The host cannot decide when that recursion is
legitimate, so it hands the extension a **re-entrancy mute** on its own
registration: block, unblock, is-blocked on the connection handle, documented
beside every hook that is delivered synchronously. The host still bounds depth
as a backstop, and the backstop is a release-mode guard, not a debug
assertion.

The boundary reverts the moment one hook point on the surface can veto: the
per-registration rule returns for that point, and the uniform policy becomes
the fail-open guard this file warns against.
