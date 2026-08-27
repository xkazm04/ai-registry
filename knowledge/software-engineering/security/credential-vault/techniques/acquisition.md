---
layer: technique
type: technique
subject: credential-vault
technique: acquisition
status: forged
laws: [one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [routing a provider to its best acquisition mode, credential fails inside automation days after entry, a tool refresh silently killed the vault's copy, writing the setup instructions a user follows to connect a provider]
---

# Acquisition

Acquisition is the distance between "the user has an account somewhere" and
"the vault holds a working credential" — and it is where vaults win or lose.
Every hop of that distance the user walks by hand is a leak surface (a
clipboard, a chat message, a shell history line, a sticky note) and an
abandonment point (the provider console's key page has moved twice since your
instructions were written). The technique is a ladder of modes ordered by
decreasing automation; a mature vault offers several and routes each provider
to the best one it supports.

## The modes

**Delegated grant flows.** Where the provider supports redirect-based
authorization: open the provider's consent page, receive the callback on a
local listener or registered return path, exchange the code, store the grant.
The user proves their identity to the provider and approves scopes; **the
credential itself never passes through the user's hands or eyes.** This is
the ceiling of acquisition UX and the default wherever offered. Craft points:
request the narrowest scope set the feature needs (scope requested is scope
at risk — the golden path's least-privilege posture starts here, at the
consent screen); use the flow variants hardened for native/local apps
(one-time proof-of-possession exchanges, exact-match return paths); and treat
the callback listener as a credential surface itself — bound to the loopback,
alive only for the duration of the flow, its shutdown named at start
(a reaper for the flow's own scaffolding).

**Tool capture.** The user's machine often *already holds* a working
credential — their command-line tools have logged in, their agent
configurations carry keys, their development environment authenticated this
morning. With **explicit consent per capture**, the vault can harvest that
work: invoke the tool's own token-minting command and capture the output, or
read the tool's credential store. Two disciplines keep this honest: consent
is per-source and informed (name the tool, show what will be read), and
provenance is recorded (below) because a captured credential's lifecycle is
chained to the tool that owns the grant — the vault may hold a copy it cannot
itself refresh.

**Foraging.** One step broader: scanning well-known local locations —
environment files, tool configuration directories, project conventions — for
candidate credentials, then presenting candidates for the user to adopt.
Foraging is powerful and invasive in exact proportion, so its rules are
strict:

- **Consent precedes scanning**, not just adoption. Reading a user's
  environment files without asking is indistinguishable from malware
  behavior, whatever the intent.
- **Read-only, always.** Foraging never moves, rewrites, or deletes the
  original; the source of truth stays where its owning tool expects it.
- **Candidates are presented by identity and location, never by value** —
  "a key for service S found in location L", validated on adoption, not
  echoed for visual inspection.
- **"Found nothing" and "couldn't look" are different results**
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)): a
  scan that lacked permission for a directory, or a tool that wasn't
  installed, reports that — an empty result that hides a failed probe teaches
  the user "I have no credentials there", which may be false.

**Guided manual entry.** The floor, for providers offering nothing better:
the user visits a console and pastes a value. Craft still matters — deep-link
as close to the key page as the provider allows, state the exact click-path
and required scopes/settings (instructions versioned, because consoles move),
mask the paste field, validate immediately on submit, and never re-display
the pasted value. Ambition here is honest reduction of error, not elimination.

## When the installer is the registrant

Every mode above assumes one deployed instance holding a registered identity
at the provider. That assumption is doing quiet work: it is the reason a
grant-flow credential is the ceiling, and the reason the provenance table
below can say the vault owns the client relationship and may re-consent on
its own.

A tool distributed as source and run once per user has no such identity. It
cannot ship client credentials — every copy would carry them, extractable by
anyone who has a copy — so each install registers *its own* client in the
user's provider console, and the user hand-carries a client identifier and
secret back into the application through a clipboard. The ladder's ceiling
is reached by walking its floor: a delegated grant flow whose precondition
is a guided manual entry.

Record it as its own provenance case rather than as a grant flow, because it
inherits from both parents and the refresh engine needs to know which. The
token refreshes like a grant-flow credential. The registration it refreshes
*against* is owned by the human, who can delete or restrict it in a console
the vault cannot see — so the failure arrives as a grant-flow credential
that stops refreshing for a reason no rotation path can fix, and the honest
recovery is "the human must re-register", which is a manual credential's
answer.

### The consent screen is also a verdict about you

Least-privilege posture starts at the consent screen — but the consent
screen is not only where scopes are requested. It is where the provider
renders its own judgment of the requester, and for a self-registered client
that judgment is *always* unverified. Nothing is wrong; the client was
created minutes ago by the very person now being warned about it. The signal
is structurally uninformative in this architecture, and will remain so
however trustworthy the tool is.

Which is exactly what makes the instruction hazardous. **A setup guide must
never resolve the provider's trust prompt on the user's behalf.** Explaining
why the warning appears, and what it does and does not mean here, is
documentation. "Click through, it is safe" is a stranger answering a
question the provider deliberately addressed to the user — and the author
cannot know the answer for the reader's copy, because the thing being
vouched for is the reader's own registration and whatever else they later
point it at. The durable damage is not to that install. It is that a reader
taught to click past that screen clicks past the identical screen the next
time, for a client they did not create.

### A scope in a document is a scope granted N times

The same asymmetry governs defaults. The scope named in a setup instruction
is the scope users will grant, because almost nobody narrows a documented
default — the instruction is the path of least resistance and it was written
by someone assumed to know. An unrestricted grant written into a guide is
not one careless decision; it is one author's sentence, honoured by every
install, on credentials whose blast radius each reader owns alone.

So for a tool acquired this way, the least-privilege work happens in the
*instructions*, not in the code. Name the narrowest scope set the feature
needs, at the step where the reader is choosing; state what each is for, so
a reader who wants less can tell what they are giving up; and write the
revocation path in the same breath as the grant, because the user is the
only party who can execute it.

## One door in: validation before admission

Whatever the mode, admission is singular
([one-validation-door](../../../_laws.md#one-validation-door)): **a credential
enters the vault only through a live validation** — an authenticated probe
proving the value works, resolving the identity it authenticates as, and
discovering its actual scopes. Storing an unvalidated paste is storing a
future support ticket with extra steps: the failure surfaces days later,
inside an automation, stripped of the context ("I pasted it with a trailing
newline") that made it trivially diagnosable at entry.

Two disciplines keep the door real as modes multiply:

- **The door disbelieves the deliverer.** An acquiring surface that claims
  "already validated" is a proxy, not a proof — the admission door re-probes
  server-side regardless, because the claim travels from code the vault does
  not control ([gate-sees-target](../../../_laws.md#gate-sees-target)).
- **Admission controls live below the modes.** Every mode added after the
  door was written is a mode the door's *per-flow* checks never met. Controls
  attached to the shared write path (the record insert) cover all modes
  automatically; controls attached to one flow's handler cover that flow.
  When a new acquisition mode ships, the review question is not "did it copy
  the checks" but "does it reach the same door" — and the honest audit is a
  count: N admission routes, K of them passing through the full door.

Validation-at-admission also mints the credential's **baseline record**: the
verified identity, the discovered scope set (which is what the brokered
door's scope intersection later checks against), the provider's reported
expiry. Confirmation to the user is by identity — "authenticated as X, scopes
Y" — never by echoing the value.

## Provenance is lifecycle destiny

Record where each credential came from — grant flow, tool capture, foraged
from location L, manual paste — because provenance determines what the vault
may do later:

- A **grant-flow** credential can be refreshed and re-consented by the vault
  itself; the vault owns the client relationship.
- A **captured or foraged** credential is a copy; the *tool* owns the grant.
  The vault cannot unilaterally rotate it, and if the tool refreshes with
  rotation, the vault's copy dies without warning — a remediation-time
  diagnosis the provenance field answers instantly.
- A **manual** credential can only be replaced by the human; rotation policy
  for it means *reminding*, not executing.
- A **self-registered grant** — a grant flow against a client the *user*
  registered — refreshes like a grant flow and dies like a manual one. The
  vault may refresh the token and may not re-establish the client; when the
  registration goes away, the only recovery is to send the human back to the
  console. Classifying it as grant-flow buys a rotation attempt that cannot
  succeed and a diagnosis that never resolves.

Provenance also scopes retirement: revoking a foraged credential upstream
would break the tool it was foraged from — the vault retires *its copy* and
says so, which is a different act than killing the capability.

Provenance is the field most reliably *lost*, for a structural reason: each
acquisition mode knows exactly where its value came from at the moment of
admission, and none of them is forced to write it down — so the knowledge
evaporates at the door, one mode at a time. Make provenance a required,
single-vocabulary field of the admission contract (not an optional metadata
key each flow spells its own way), or the measured end state is a vault where
most records carry no origin at all and the refresh engine cannot tell which
recovery path any of them supports.

## The half-acquired are reaped

Every mode has an abandonment path: the consent page closed, the tool capture
denied, the paste never validated. Each in-flight acquisition names its
cleanup at start — pending grants expire, callback listeners shut down,
candidate lists are discarded, partially-captured values are wiped, not
parked. An acquisition flow that leaves unvalidated fragments behind has
built a shadow vault with none of the vault's guarantees.
