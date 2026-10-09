---
layer: application
type: application
subject: live-defect-debugging
technique: run-scoped-evidence
stack: node
status: forged
verified_on: 2026-10-09
verified_against: node@22
---

# Per-session sinks, labelled runs, and where ownership is only a sentence

What this realization cannot do: guarantee that a session owns the sink it clears. The
skill tells a model to touch only its own sink; the server hands any caller the
sink of whatever session id appears in the URL, and a second start in the same
directory is routed to the first session's server. The rule is enforced by prose to a
model, and the code beneath it implements address-by-id, not ownership. The evidence
is one tree (n=1).

Tree read: the `debug-agent` package at commit `295af90bcfc16ba3578e6be91ed1c552261bb257`.
Version witness: the CI pin, `.github/workflows/test.yml:24 "node-version: 22"`, over a
declared floor of `packages/debug-agent/package.json:60 "node": ">=18"`. Source read, not a run.

## An empty sink per run

The skill makes the clear mandatory and moves it through the server's own interface
rather than the filesystem: `packages/debug-agent/skill/SKILL.md:156 "Clear previous log file before each run (MANDATORY)"`,
performed by `packages/debug-agent/skill/SKILL.md:158 "Send a `DELETE` request to the **server endpoint**"`.
An earlier revision of the skill, kept in the same repository, told the model to delete
the file at the path directly and to use its delete tool and no shell command; the
current revision routes the same act through the endpoint. Moving it there is the
useful change, because the thing that created the sink is the thing that clears it.
The server side is one handler: `packages/debug-agent/src/server.ts:152 "fs.unlinkSync(sessionState.logPath)"`,
followed on the next line by emptying the dedupe set so the next run is not suppressed
as duplicates.

A deviation worth naming: the clear is a bare delete of the file, so a read of the sink
after a clear returns empty, and an empty read after a run returns empty too. The two
are indistinguishable (`packages/debug-agent/src/server.ts:166 "? fs.readFileSync(sessionState.logPath"` returns an empty string
when the file does not exist). The skill compensates in prose,
`packages/debug-agent/skill/SKILL.md:168 "the reproduction may have failed"`, which is the empty-sink
precondition, minus the entry probe that would tell the two silences apart.

## Labelled runs

The payload contract carries a run label, `packages/debug-agent/skill/SKILL.md:118 "runId"` in the
example entry, and the skill suggests a distinct label for verification,
`packages/debug-agent/skill/SKILL.md:181 "You may tag logs with"`. The proof of a fix is then
stated as a comparison: `packages/debug-agent/skill/SKILL.md:192 "Verification requires before/after log comparison with cited log lines"`.

Falling short: the label is only a suggestion ("may tag"), and the mandatory one-line
probe template does not include it, `packages/debug-agent/skill/SKILL.md:128 "message:'desc',data:{k:v},timestamp:Date.now()"`.
A model that copies the template exactly writes lines with no run label and no
hypothesis id, and the server stores them as sent.

## Ownership

The skill states the rule twice:
`packages/debug-agent/skill/SKILL.md:161 "Only clear YOUR session's logs"` and
`packages/debug-agent/skill/SKILL.md:196 "NEVER delete or modify log files that do not belong to this session"`.

Two things in the code weaken it:

- The server builds a session on demand for any id that matches the path pattern
  (`packages/debug-agent/src/server.ts:114 "const sessionState = getSessionState(requestSessionId);"`), with the file
  placed in the shared directory by id
  (`packages/debug-agent/src/server.ts:83 "path.join(logDirectory, `debug-${requestSessionId}.log`)"`). Any client that
  knows or guesses another session's id can read or delete its log; the id is three
  random bytes (`packages/debug-agent/src/constants.ts:1 "SESSION_ID_BYTE_LENGTH = 3"`), enough to keep honest sessions apart
  and not a credential.
- Starting a session is idempotent by design,
  `packages/debug-agent/skill/SKILL.md:78 "The server is idempotent"`, implemented by a lock in the shared
  temporary directory: `packages/debug-agent/src/server.ts:56 "const existingLock = readServerLock(logDirectory);"`
  and, when that server answers a ping, the existing session's info is returned in
  place of a new one (`packages/debug-agent/src/server.ts:63 "sessionId: existingLock.sessionId,"` through line 66). Reading the code, two agents
  on one machine that both start the daemon from the default location are given
  the same session id and the same sink, so one agent's pre-run clear removes the other's evidence.
  I read this and did not run it; it is the sharp edge of the otherwise sensible
  idempotence, and it is exactly the case where the technique says sharing must be a
  visible choice and not a side effect.

The technique's remedy is to treat the sink's identity as an issued value. The tool
does print one at start, `packages/debug-agent/skill/SKILL.md:73 "Session ID"` among the values to remember, so the model has
the identity in hand; what is missing is a start path that refuses to reuse someone
else's.

## Clearing is not removal

The skill separates the two operations in its own words, in the clearing step,
`packages/debug-agent/skill/SKILL.md:160 "Clearing the log file is NOT the same as removing instrumentation"`, and again
in the closing reminders, `packages/debug-agent/skill/SKILL.md:195 "Clearing the log file is not removing instrumentation"`.
That the sentence appears twice is a small sign of how often the confusion was seen.
