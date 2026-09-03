---
layer: technique
type: technique
subject: sidecar-provisioning
technique: atomic-downloads
status: forged
laws: [creation-names-reaper, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [deciding whether transport success proves completeness, two features racing to fetch one artifact, half-installed tree reports itself installed]
---

# Atomic downloads

A multi-hundred-MB artifact takes minutes to arrive over a network the
application does not control, onto a disk it shares, while the user does
other things — including quitting. This technique makes one guarantee out
of that chaos: **the published artifact is either complete and verified, or
it does not exist.** Every observable intermediate state is confined to a
staging name no consumer ever reads.

## Stage, verify, rename

The transfer never writes to the final name. Bytes stream into a **partial
file** — same directory as the destination (so the final rename is a
same-volume atomic operation, not a copy), name derived from the
destination plus a suffix that unambiguously marks it as garbage-in-progress.
The sequence is fixed:

1. Open the partial file; stream the response into it.
2. On transfer completion, run **verification against the staged copy** —
   digest, size class, content sniff, whatever source-pinning prescribes
   for this artifact. The first, non-negotiable assertion: **the transport
   layer's own success signal does not prove completeness.** A stream that
   ends early is not an error at the transport level — the connection
   closed, the read loop exited, everything "succeeded" — so received
   bytes are compared against the advertised total before anything else,
   or a truncated file is promoted and every later load fails with an
   opaque error pointing nowhere near the cause. And note the trap inside
   the fix: the advertised total is an *optional* response header, absent
   on chunked transfers — a completeness check guarded by "if the total is
   known" silently vanishes for exactly some sources. A rung that can be
   skipped by the remote end's framing choice is not a rung; the catalog's
   own expected size or digest closes the hole. Verifying after
   publication is verifying nothing: by then a consumer may already have
   loaded the bad bytes
   ([gate-sees-target](../../../../_laws.md#gate-sees-target) — the staged copy
   is the target; the final name must only ever hold verified content).
3. **Atomic rename** to the final name. This is the single instant of
   publication; readers before it see absence, readers after it see the
   complete artifact, and no reader ever sees a prefix.

A crash at any point leaves either nothing or a partial file whose name
declares its status. The partial file names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the next
download attempt truncates or resumes it, and a startup or periodic sweep
deletes stale partials that no in-flight transfer claims. One scoping rule
is earned, not obvious: **failure cleanup removes only the failed
transfer's own partial file, by exact name.** Several artifacts stage into
one directory, and a "tidy up" that sweeps every partial-suffixed file
destroys a concurrent sibling's in-flight transfer — a corruption the
sibling reports as its own mysterious failure. And the reaper logs what it
could not remove: a locked, undeletable partial silently poisons the next
attempt. A directory accumulating anonymous half-artifacts is the
signature of a design that skipped this paragraph.

## Multi-file artifacts publish as a unit

An artifact that is an archive of many files — an engine plus its runtime
libraries, a model plus its tokenizer and data directory — obeys the same
law at directory grain: **extract into a staging directory, verify the
complete set, then swap into the live location.** Extracting directly into
the live directory means a failure midway leaves some files in place — and
if the resolution probe keys on the file that happened to extract first,
the half-installed tree is now *resolvable*: every status surface reports
the capability installed, and every use fails at load time with an error
that points at the engine, not the install. A readiness predicate may only
answer "present" for states that verification has actually blessed —
sentinel checks that run after the damage is on the live path merely
report the corruption they permitted.

Two features asking for the same artifact concurrently is the common case,
not the corner case — the first launch of a capability-rich application
triggers several. Without a guard, concurrent transfers interleave writes
into one partial file or race the rename; with a naive guard, the second
caller gets an error for a condition that is actually good news. The
standard shape: a process-wide registry of in-flight downloads keyed by
artifact identity. The first caller starts the transfer; subsequent callers
**join it** — subscribing to the same progress and the same completion —
rather than failing or duplicating. The guard entry is removed on every
exit path, success or failure; a guard that leaks its entry converts one
failed download into a permanently "already downloading" artifact that only
a restart clears.

Where multiple application instances can run against one managed directory,
the in-process registry is not enough and the guard must extend to a
machine-scoped exclusion on the staging file — the same posture
subprocess-lifecycle takes for cross-instance resource contention.

## Progress at human rate

A streamed transfer produces progress on every chunk — thousands of events
for one download. Forwarding each one to the interface layer buries it. The
technique: **throttle at the source.** Emit progress on a time floor (a few
events per second at most) or a delta floor (whole-percent steps), and
always emit the terminal event — completion or failure — unthrottled and
guaranteed, because a progress stream that ends at ninety-eight percent
with no verdict is worse than no progress at all. Progress carries
identity: artifact, bytes so far, total if known — so concurrent downloads
render as separate bars, not one flickering composite.

## Resume or restart is a decision, not a default

Interrupted transfers have two honest recoveries: **resume** (range
requests against a source that supports them, continuing the partial file)
and **restart** (truncate and begin again). Resume saves real user time on
large artifacts over slow links, but it carries obligations: the source
must honor ranges, the partial content must be validated as belonging to
the same remote artifact (a source that silently changed makes the resumed
file a chimera), and the final verification must cover the assembled whole.
Restart is simpler and always correct. The technique does not mandate
either — it mandates that the choice be **made per artifact class and
stated**, and that whichever is chosen, a failed transfer's outcome is
recorded distinctly from "never attempted"
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Retry cadence and backoff for the re-attempt belong to
[retry-backoff](../../../../backend-platform/resilience/retry-backoff/retry-backoff.md).

### The resume contract, check by check

"Validated as belonging to the same remote artifact" is one sentence and
five checks, and a resume path that has not enumerated them has built the
happy path only. Each check is named by the corruption it prevents, and
each is a property of the transfer protocol rather than of any source, so
the list is closed:

1. **A partial already at the expected size is verified and accepted
   without a request.** Asking the source for `bytes=<end>-` earns a
   range-not-satisfiable answer on every attempt, and a loop that treats
   that answer as a retryable error never finishes. A partial *larger* than
   the expected size is deleted, not trimmed — nothing about it is known to
   be right.
2. **A full-content answer to a range request means the source ignored the
   range** — the protocol permits exactly that (RFC 9110 §14.2) — and the
   body is the whole artifact from byte zero. Appending it to the partial
   corrupts the file silently; the partial is discarded and the transfer
   restarts from zero.
3. **A partial-content answer must begin exactly at the partial's end.**
   The source must state the enclosed range (§15.3.7); the stated start is
   compared to the partial's length before the first byte is written, and
   any other start discards the partial. Trusting the status without reading
   the range is how a resumed file becomes a chimera.
4. **Range-not-satisfiable is never a completion signal.** It says the
   requested start is at or past the object's current length (§14.4). With a
   catalog size in hand and a partial that is not full-size, that can only
   mean the remote object is *smaller* than the catalog says; only a digest
   that matches can bless the partial as complete, and without one the
   partial is cleared. The one exception is the full-size partial, which
   check 1 already accepted without asking.
5. **The expected total is pinned before the first byte, and enforced
   during the stream.** A source advertising a total that differs from the
   catalog's is rejected before anything is written; a source that keeps
   sending past the total is cut at the first excess byte and everything it
   sent is cleared, because an untrusted mirror must not be able to fill the
   disk and a provably misbehaving source taints what it already delivered.
   The specification itself says a client cannot learn the representation's
   effective length from the advertised one (§14.4) — which is why the
   catalog, not the header, holds the number.

Two timeouts sit under the contract, and conflating them breaks it. A
*connect* timeout bounds setup. A *stall* timeout bounds the gap between
bytes — no headers or body for that long means the transfer is wedged, not
slow — and on expiry it keeps the partial for resume rather than deleting it,
because a stall proves nothing about the bytes already on disk.
Cancellation keeps the partial on the same reasoning.

The contract is enforced by tests, one per check, against a local socket
server that replays that check's failure — a short body, a range ignored, a
partial-content answer at the wrong offset, a body that exceeds the total, a
total that contradicts the catalog. That test list is the contract's most
legible form: a resume path whose tests cover only "download completes"
has tested none of the checks above. One measured caution for the first of
them: some transport libraries enforce the advertised length themselves and
fail a short body before the application sees it, so a check-1 test may pass
for a reason the application did not build — and the hole those libraries
cannot close is check 5, a source that advertises *and delivers* a smaller
total than the catalog states, which only the catalog comparison catches.

## Cancellation is a first-class exit

The user who started a two-gigabyte download must be able to change their
mind. Cancellation stops the stream, releases the in-flight guard, disposes
or retains the partial file per the resume policy, and records the outcome
as *cancelled* — its own verdict, not a failure. A download that cannot be
cancelled holds the network, the disk, and the guard hostage to a decision
the user already reversed.
