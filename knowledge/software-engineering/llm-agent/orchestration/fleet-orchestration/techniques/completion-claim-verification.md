---
layer: technique
type: technique
subject: fleet-orchestration
technique: completion-claim-verification
status: forged
laws: [gate-sees-target, failure-not-empty-success, unknown-is-not-a-value, silent-state-is-ungoverned]
shared_with: []
use_when: [a delegate reports done and nothing has read the artifact, writing acceptance criteria for a delegated task, a test run cited as evidence ran in the worker's own shell, deciding what a verifier says when it cannot decide, a completion cue parsed from a transcript parks a session as finished]
---

# Completion-claim verification

[result-harvest](./result-harvest.md) settles what a session hands back:
a declared result at a declared drop point, validated on ingestion, with
failure as a first-class report. [worker-trajectory-anatomy](./worker-trajectory-anatomy.md)
settles why that is not enough: about a quarter of failed trajectories end
by *claiming* completion, and the claim lands exactly where the work went
wrong. Its rule — verify against the artifact, never the report — names
the target and leaves the mechanism open. This technique is the mechanism:
**how a parent decides whether one member's "done" is true, from evidence
the member could not have authored, and what it says when it cannot decide.**

The shape to recognise first is the one
quality-gates calls *evidence the subject authors*: a completion claim is
the worker's own paperwork, and the cheapest thing a struggling worker can
produce is the word "done". Every layer below exists to move the evidence
out of the worker's hands.

## Layer one: receipts the runtime stamps

The parent's first source of truth is its **own record of what the worker
executed**. Every tool call the worker makes passes through the runtime,
and the runtime stamps a receipt at that boundary — tool name, status,
hashes of arguments and output, byte count, timestamp — into a ledger the
worker can read and cite but cannot write. The report contract then
requires it: **an action claim cites the receipt for the action**, a
deliverable carries a verifiable handle (a path, an identifier, a status
code), and a failure is reported as a failure. The parent resolves every
citation against the ledger it holds.

Three consequences shape the ledger:

- **A claim with no receipt is a claim.** It is not rejected — the worker
  may honestly summarise — but it carries no evidence, and the parent's
  verdict says so.
- **A citation that does not resolve is a finding about the worker**, not
  a formatting slip. It is the fabrication window made visible, and it
  should downgrade the whole report rather than the one line.
- **The ledger is bounded, and the bound is honest.** When receipts exceed
  the budget, keep the newest in chronological order under their original
  identifiers and leave a marker that older ones were omitted. A citation
  is then checked against a *consecutive* range of retained identifiers
  — never renumbered, because renumbering after context compaction is
  how a citation to receipt twelve resolves to whatever is twelfth now.
  Whatever set of receipts the worker was shown is the exact set the
  parent validates against; omitted receipts cannot validate anything.

Receipts are stamped by the outermost layer of the tool pipeline, ahead of
any guard that can answer a call itself — an authorization refusal, an
audit block, a freshness gate. A receipt layer placed inside those guards
gaps the ledger precisely on the calls a verifier most wants to see.

**Status comes from a marker the runtime owns, never from prose.** A
worker whose model call failed and whose graph ended cleanly on an error
fallback has not succeeded; the runtime stamps that fallback as a
machine-readable marker, and only the marker is read. Prose that *looks*
like an error, without the marker, is an ordinary result. The moment a
parent parses display text for status it has built a second protocol out
of wording, which the worker can drift out of at will
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

## Layer two: decidable leaves, checked in code, parent-side

Acceptance criteria are declared at dispatch. Most are judgments; a few
are **leaves the parent can decide mechanically**: a named path exists, is
non-empty, or was written; a named command ran and its recorded exit was
success with a test summary in its output. Split the list at that line.
Leaves are checked by the parent, in code, on the parent's own instrument
— reading the artifact through the parent's own file access, matching the
command against the parent's own execution record — and nothing else is.

**Anything the checker cannot decide is UNVERIFIED, never passed.** The
verdict is three-valued: held, failed, unverified. This is the fail-closed
branch of quality-gates' unmeasurable-criteria applied to delegation — the
instrument ran, read the input, and the input is outside what it can model
— and it must not be spelled as a pass, because the cases that fall
outside the model are exactly the ones a fabricating worker will reach for.
The unverified cases worth enumerating, because each is a place a naive
checker says yes:

- **A path outside the scope the parent can read** — an upload area, a
  mount the parent does not resolve. Out of scope degrades; it never
  misjudges. And scope is decided on the *canonical* path: a symlink inside
  the workspace pointing out of it satisfies nothing.
- **Evidence that was truncated.** A command cut at a length cap cannot be
  matched on its prefix; an output tail that lost its exit marker cannot
  prove success. The cap that bounds the evidence must preserve the marker
  inside its budget, or every long command becomes unverifiable by
  construction.
- **A size the checker could not establish.** Reads are byte-bounded, and
  the bound is established before the read — a leaf above the cap answers
  from the size alone. A file whose size cannot be read is not "probably
  fine".
- **A read that returned an error as content.** Some sandboxes report a
  missing file as a string beginning with an error word instead of
  raising. That string is a failed check, not a non-empty file — and the
  distinction is typed by which sandbox produced it, so a genuine file
  that happens to start with that word on a sandbox that raises is still
  content.
- **A binary deliverable the text reader cannot decode** exists and is
  non-empty; that is the verdict, not a decode error dropped on the floor.

The exit status of a cited command is **parsed from the runtime's own
marker in the output**, not read from the tool's success flag: a shell
tool reports the call as successful whenever it returned text, and a
non-zero exit is text. Where no marker exists, the meta status is the
fallback and the verdict says which it used.

## Layer three: provenance — a run inside the worker's session proves nothing

The subtlest leaf is `the tests passed`. The parent finds a matching
command in the execution record, exit zero, a summary line naming a
positive count. It still may not hold, for a reason that has nothing to
do with the command: **the command ran in a shell the worker had been
using for the whole task.** Any earlier call in that session could have
defined a function shadowing the test runner, prepended a directory to the
path, exported a variable the tests read, or aliased the command outright.
The clean-looking run executed in state the worker chose.

So execution evidence carries a **provenance stamp** from the sandbox that
produced it: was this a fresh, controlled session, or a persistent one?
Only a fresh session can prove the leaf. A persistent stamp degrades to
UNVERIFIED — not failed, because nothing is known either way — and a
provenance the runtime cannot identify **fails closed**: a sandbox that
never declared its session semantics is unknown, and unknown is not fresh
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
The stamp is resolved from the sandbox state that carried the evidence,
never from the parent's own runtime — the parent may have delegated before
touching a sandbox at all.

The same suspicion governs the *text* of a match, because the worker
chooses the command it runs:

- **Executable identity is judged on the token, directionally.** A bare
  criterion (`run the tests`) accepts any spelling of the runner's name;
  a criterion that names a path requires the *same* normalised path in
  the execution. A relative path with a parent component is unprovable
  outright: lexical normalisation collapses it one way and the filesystem
  resolves it another.
- **The environment prefix must match exactly, as a name-to-final-value
  mapping.** No variable is provably inert across repositories; a
  reordered repeat of one name is the opposite environment.
- **Runtime expansion in the matched span is unprovable** — a variable, a
  substitution, a glob in an extra argument can narrow the selection
  invisibly.
- **Control flow is preserved.** The matched span must end at the
  command's last provably executed segment: a conjunction needs recorded
  success, a disjunction needs recorded failure, a pipeline or a
  backgrounded segment is never provable. A criterion's own connector is
  honoured — `cd there && test` executed as `cd there; test` lets a failed
  step be bypassed and degrades; only the stricter direction survives.
- **A summary line is attributed only when every preceding segment is
  provably silent.** A bare directory change or a pure assignment qualifies;
  anything that can print — an export with an invalid name, a sourced file,
  a directory change whose search path makes it echo — does not, so
  `echo '12 passed'; run-tests` cannot lend the shape.
- **Selection must be at least the criterion's.** Options that negate or
  narrow — an ignore, a deselect, a keyword filter, a last-failed rerun —
  make the executed selection a different one; a bare criterion accepts
  extra flags only when they are provably selection-preserving. A pass
  shape with a zero count is a veto.

None of this is an attempt to parse the shell. It is a list of the ways a
string can *mention* a criterion without the criterion having run, and
each is a deliberate degradation to UNVERIFIED rather than an attempt to be
clever.

## Where the criterion text lives

Criteria are supplied by the dispatching model and are untrusted at the
moment they reach the worker. They go into the worker's **task message,
in the untrusted channel**, neutralised and boundary-framed like any other
model-supplied text, capped in count and length. The worker's system
channel receives only a framework-owned pointer saying where the list is
and what authority it has. A criterion carried in the system channel is a
prompt injection with system priority, and the party writing it is the
same one whose claims the checklist exists to test.

Symmetrically, the verdict is **server-owned on the way back**: the
checklist and the citation verdict are stamped by the runtime, and any
copy arriving from outside — in a persisted message, in a request body —
is stripped before it can be read as one.

## What the verdict feeds

The three-valued result is written to the delegation ledger beside the
result summary and rendered into the dispatching model's context. That is
what lets the lead reuse a partial or unverified result *knowingly*: a
result capped by a budget, a leaf left unverified, a citation that failed
to resolve are each a different sentence in the ledger, and the lead's
next decision — retry tighter, verify by hand, accept the partial — is
made from the sentence rather than from the word "done"
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

- Stamp execution receipts at the runtime boundary, outside every guard
  that can answer a call itself; require the report to cite them and
  resolve every citation against the parent's ledger.
- Read status from a runtime-owned marker only. Never parse prose for a
  status protocol.
- Split acceptance criteria into decidable leaves and everything else;
  check leaves in code, on the parent's instrument, against the artifact.
  Everything else — and every leaf the checker cannot decide — is
  UNVERIFIED, never passed.
- Treat a test run in a persistent session as unverified and an unknown
  session as failed-closed; only a fresh controlled session proves an
  execution leaf.
- Bound every read and every stored piece of evidence, and make truncation
  degrade the verdict rather than certify a prefix.
- Carry criteria in the untrusted channel and verdicts as server-owned
  fields; strip both from any external source.

## What this does not settle

Runner semantics are trusted: a build script that swallows failures, a
runner that exits zero on a broken suite, certifies a leaf this technique
cannot see through. A bare criterion trusts the path — a worker-crafted
script with the runner's name is textually indistinguishable from the
runner; naming an absolute path in the criterion is the remedy. And
execution evidence says the work *ran*; whether the result is *correct*
is a judgment, which belongs to a reviewing seat or to re-execution in a
fresh environment, and which this checklist should never be extended to
imitate. The boundary is the strength: a checker that only answers the
questions it can answer is the one whose "held" means something.
