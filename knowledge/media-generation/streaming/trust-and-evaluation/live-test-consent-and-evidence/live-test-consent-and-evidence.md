---
layer: golden-path
type: golden-path
subject: live-test-consent-and-evidence
status: forged
use_when: [testing a streamer tool against the real streaming platform, deciding which accounts and channels a live test may act on, deciding whether a claim about a stream tool may say live or verified, labelling simulated, recorded or unverified material in a tool, a demo or a submission]
techniques:
  - owned-test-accounts-only
  - live-tests-behind-an-exact-flag
  - undo-even-on-uncertain-response
  - evidence-pending-by-default
  - no-fixture-for-live-footage
  - provenance-labels-derived-from-state
---

# Live test consent and evidence

A tool a human streamer runs beside their stream acts on other people. It times a viewer
out, deletes a message, bans an account, posts in chat, creates a poll, refunds points.
Every one of those calls is easy to write against the platform's documentation and
impossible to trust until it has run against the real platform, because the
documentation describes the happy path and the platform's behaviour lives in the rest: the
permission it actually checks, the error it returns to a moderator acting on another
moderator, the delay before an event arrives, the response that comes back late or not at
all. So the tool must be tested live at some point, and the moment it is, a test becomes
an action on a real service with real accounts in it. **Live test consent and evidence**
is the discipline of doing that only where everybody the test can touch has agreed to be
touched, and of letting a claim about the tool say "live" only when something live was
observed.

The principal practitioner holds two beliefs that the naive approach gets backwards. The
first is that **a live test is an action, not an observation**. A ban issued to see what
the platform returns is a ban; it lands on an account, it is logged on a channel, it may
notify a person, and a test suite that runs it against whoever happened to be in chat has
moderated a stranger to learn an error code. The second is that **a claim about live
behaviour is pending until evidence arrives, not true until disproved**. The tool's code
compiles, the unit tests pass against a recorded response, the rehearsal lit every overlay
— and none of that is the platform. A status page, a readme, a demo film or a submission
that says the moderation desk "works live" on that basis has said more than anyone
observed.

## What this subject owns, and what the neighbours own

Three neighbours sit on the same ground. The
[streamer dress rehearsal](../streamer-dress-rehearsal/streamer-dress-rehearsal.md) runs
the whole toolchain with generated chat and **no platform session at all**; its quarantine
is what makes it safe, and the instant a test needs the real platform it has left that
subject and entered this one. A rehearsal cannot tell you the platform's error codes,
delays or permission model; this subject is how you find them out without harming anyone.
The [evidence-gated clip publish](../../live-show/stream-moment-capture/techniques/evidence-gated-clip-publish.md)
technique gates what a *show* publishes about itself — a clip cut from the stream, checked
for context and exclusions before strangers see it. This subject gates what a *tool's
makers* claim about the tool: that a call works against the platform, that footage is
live, that a draw was verified. The
[recording that asserts its claims](../../../production-ops/live-system-demo-film/techniques/recording-that-asserts-its-claims.md)
technique makes a demo film's recorder assert, beat by beat, that the system did what the
narration says; it answers "did the system behave as the film claims", and this subject
answers the prior question a film of a stream tool cannot skip: "was what the camera saw
the live platform, a recording, or a simulation, and does the film's label say which".
The rule a reader uses to pick: no platform session, read the rehearsal; a clip leaving
the show, read the clip gate; a demo film's behavioural claims, read the recorder; a test
or claim that reaches the real platform, or a label that says how real something was, read
this.

## Consent is decided by account ownership, before the test is written

The only people a live test may act on are people who own the test
(owned-test-accounts-only). In practice that is a channel the team controls, a small set
of viewer accounts the team created and holds the credentials for, and nobody else.

The harness cannot infer ownership; it can only hold the operator to an assertion and
check everything around it. The operator names the test channel and the target, and naming
them is recorded as their statement that they own both. The harness then checks what it
can, before it sends anything: the authenticated identity is the test channel's
broadcaster, the target is a different account, and the target holds no privilege. The
target's identity is best taken from the platform's own verified metadata rather than a
name lookup: the owned account sends a fixed marker into the test channel, and the
identifier the platform attaches to that message is the one the test acts on. "The test
only bans an account called test-viewer" is not consent: display names are claimable, and
the account that holds the name on the day the suite runs may be a person.

Ownership is necessary and not sufficient. A test account that is a moderator on the test
channel is a different target from one that is not, because platforms treat actions on
moderators differently and often refuse them; a suite that wants to learn the ordinary
path needs a target that is **not** privileged. And an owned channel that is live with an
audience is not a test channel for the duration: the viewers in it did not agree to watch
a ban suite run. Live tests run on a channel that is offline or that is explicitly a test
stream, with nothing a test emits visible to anyone who did not opt in.

What a test writes into the platform is fixed, not generated. Chat lines, timeout
reasons, poll titles — each is a constant marker string that says this was a test, so
that a log reviewer, a platform trust team or the team itself a month later reads it for
what it was. Free text in a live test is a way to put something on a real service that
nobody reviewed. What a test reads back is fixed too: it echoes the marker and nothing
else, and never logs or keeps a message body, because a real chat line saved by a test
has become a fixture nobody agreed to be in.

The smallest live test is one that **observes rather than acts**. Most of what a team
needs to learn about the platform — the shape of a moderation event, the fields of a held
message, how a setting change is announced — can be learned by asking the operator to
perform the action by hand on the owned accounts while the test only listens. The test
then issues no ban and no settings change of its own; the person who owns the accounts
does, through the platform's own interface, and the test checks what arrives. Write the
test to act only where the question is about the tool's own call.

## Live tests are opt-in by exact value, and skipping is not passing

A test that can reach the platform does not run by default (live-tests-behind-an-exact-flag).
The ordinary suite — what a developer runs on save and what continuous integration runs on
every change — is hermetic; it never opens a connection to the platform, and a credential
lying in the environment does not change that. Live tests run only when an operator sets a
flag to an exact, documented value: not "any non-empty string", not "truthy", because a
leftover variable from another tool, a copied shell profile or a typo of another flag then
silently arms a suite that bans accounts. Exact matching costs nothing and turns a whole
class of accidents into a skip. The check runs first, before the test reads any other
configuration, opens the credential store or resolves a name, so a disarmed run touches
nothing; and the operator arms the flag for one command and removes it when that command
ends, so the shell is never left armed for the next one. The flag arms tests and nothing
else: a product capability that also touches a live service has its own opt-in, because
one switch that quietly enables two different kinds of live behaviour is a switch nobody
can reason about.

When the flag is absent, live tests in the ordinary suite report **skipped**, by name,
never passed. When an operator explicitly asks for the live suite and the flag is wrong,
the run fails red with the reason, because that operator expected the platform to be
touched and a quiet skip would let them believe it was. A run that
shows a green tick for a live ban test that did not run has told the reader something no
one observed ([_laws: unmeasured-is-not-pass_](../../../_laws.md#unmeasured-is-not-pass)).
Each live test has an offline twin that exercises the same code against a recorded
response; the twin proves the parsing, the live test proves the platform, and the report
keeps the two apart.

## Every action a live test takes has an undo, and the undo runs on doubt

A live test that bans its own test account must unban it, and it must do so not only when
the ban is confirmed but whenever the ban **might** have landed
(undo-even-on-uncertain-response). The dangerous outcome is not the error; it is the
timeout, the dropped connection, the response that could not be parsed. Each of those
leaves the platform's state unknown, and the naive harness treats unknown as "nothing
happened" and moves on, leaving a test account banned, a poll open or a message pinned
until somebody notices. The rule is that any outcome other than a definite refusal runs
the compensating action, and that the compensating action is itself safe to run when
nothing needs undoing. The undo's result is recorded beside the action's, and an undo
that could not be confirmed is a finding the operator sees before the next run, not a log
line. A clean undo does not rescue the step: an action whose outcome was uncertain did not
produce the observation the test existed to make, so the step fails even though the
account was restored.

## A live claim starts pending

Every statement a team makes about the tool's behaviour against the platform carries a
status, and the default status is **pending** (evidence-pending-by-default). It moves to
verified only when a named piece of observed evidence is attached: the run, its date, the
account and channel it ran against, the response the platform actually returned, and
where the record of it lives. Writing the code does not move it; an offline twin passing
does not move it; a rehearsal does not move it; a process that exited cleanly does not
move it. The vocabulary is closed and small — pending, verified live, verified offline
only, failed, not applicable — so that "mostly works" and "should be fine" have nowhere to
be written down
([_laws: output-never-outruns-evidence_](../../../_laws.md#output-never-outruns-evidence)).
Pending also says **who owes the next step** — more building, or a run only the account
owner can perform — because a list in which every open row looks the same cannot be
worked.

Evidence proves exactly what it observed and no more. One observed moderation action does
not establish the whole action vocabulary; an interface that accepted a long reason does
not show where the platform's own limit sits; a request the broadcasting software
acknowledged is not a picture that shows the source. An event that was already queued
before the operator was asked to act is not evidence of that act, so an observer discards
what arrived before its instruction. And a live test never drives traffic at the platform
to discover a limit: a limit that was not reached naturally on owned accounts stays
unmeasured, and no pass threshold is invented to stand in for it.

The discipline matters most at deadlines. A submission checklist, a release note, a
pitch: each is a moment when a pending row is tempting to round up, because the code is
written and the live run is a calendar problem. The rule is that a row is what was
observed, and a list that is honestly half pending is worth more to its reader than a list
that is entirely green and partly invented. Any summary of the list — a status line at
the top of the page, a count on a slide — is derived from the rows, never typed
separately, because a hand-written header goes stale in whichever direction nobody checks.

## Footage claimed as live is captured live

A film, a screenshot or a clip that shows the tool working on the platform is a live claim
in picture form (no-fixture-for-live-footage). It must be captured from a live run.
Re-staging it from a recorded response, from the rehearsal's generated chat, or by
editing a capture of one run onto another is fabrication with production values, however
faithful the recreation. Where a live run is not possible — the platform session is not
yet approved, the event is rare — the footage is labelled as what it is, in the picture,
and the claim it supports stays pending. The rehearsal and the recorded fixture are
legitimate material; passing them off as live is not. The working form is a shot list in
which every shot is marked either capturable now from labelled material or dependent on a
live run, and every narration line that says live is conditional on that run's evidence:
if the run does not happen, the line is cut, not the label. A capture stops when somebody
who did not agree to be in it enters the channel, and it never shows a sign-in dialog, a
device code or a credential screen; the success state after sign-in is what gets filmed.

## Labels are a function of state, from a closed vocabulary

Simulated, recorded, live, verified, unverified, pending: these words appear on overlays,
on proofs, in the tool's own interface, in exports and in films. They are claims, and they
are only as trustworthy as the code that chooses them (provenance-labels-derived-from-state).
The label is computed from the state the surface is showing — where the inputs came from,
where the randomness came from, whether a verification ran and what it returned — by one
function per artifact kind, drawing from a closed set of words that each have one
meaning. No caller passes a label in, and no surface adds one from context. A screen that
decides "this is the demo page, so stamp it demo" stops stamping the moment the same
artifact is reached any other way; a caller that can pass "verified" will one day pass it
for something that was not. A mode is not evidence either: a session launched in "live"
mode has not thereby produced a live result, and the label waits for the state that
proves it. Until that state is known the label says **unknown**, which is a word in the
vocabulary, not a gap to be filled with whichever default is more flattering.

Verification and trust are separate axes. A proof that checks out is verified, but a draw
whose randomness the streamer controlled stays labelled streamer-controlled after it
verifies; a passing check does not promote the weaker trust tier to the stronger one. A
check that could not run — no trusted anchor, no network — yields unverified, never
silence and never pass.

The neighbouring rehearsal subject carries the *simulated* flag from generated chat to
every consumer. This subject owns the vocabulary that flag is one word of, and the rule
that every word in it is derived rather than asserted.

## What the discipline cannot give you

Owned accounts on a quiet test channel are not a real audience. A live test proves the
platform accepts the call, returns what was recorded, and delivers the event; it does not
prove how the tool behaves under a thousand viewers, a raid, or a moderator acting at the
same moment. Verified live therefore means "observed once, on this date, on these
accounts", and a careful claim says exactly that. Platforms also change: a verified row
is a dated observation, and a claim built on it re-runs its live test before it is
repeated in public.
