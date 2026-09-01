---
layer: application
type: application
subject: agent-cli-transport
technique: child-observed-posture
stack: claude-code
verified_on: 2026-09-01
verified_against: claude-code@2.1.252
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The three seams, reproduced on win32

Host: Windows 11, Node v24.14.0, `claude` 2.1.251 resolving to a `.cmd`
shim under `~/.local/bin`. Every result below was executed on 2026-08-30;
the two argv/stdin probes ran against a trivial local program so the
mechanism is visible without a model call, and the flags they carry are
this CLI's real ones.

## Seam 1 — the empty argument is deleted, and it takes a flag with it

`claude --help` documents `--tools ""` as the sanctioned way to disable all
tools ("Use \"\" to disable all tools"). On this platform the binary is a
`.cmd` shim, so a Node host must spawn with `shell: true`, and that turns
the vector into a string:

```
host vector : ["--tools","","--max-turns","1","-p"]
shell:false -> ["--tools","","--max-turns","1","-p"]
shell:true  -> ["--tools","--max-turns","1","-p"]
```

The empty string is gone. `--tools` now takes `--max-turns` as its value —
a tool name that does not exist — and `1` shifts into a positional slot,
which for this CLI is **the prompt**. So a call that read as "no tools, one
turn, print mode" reaches the child as "an unknown tool allowlist, no turn
cap, and a prompt of `1`". Nothing throws. The host's own copy of the array
still reads correctly, so no in-process assertion can detect it; the loss
happens after the array stops existing. Node's own DEP0190 deprecation
warning fires on the same call and describes the mechanism ("arguments are
not escaped, only concatenated") — it is the only signal, and it is a
deprecation notice, not an error.

This matches, and generalizes, the field report from an internal consumer
(2026-08-27) that lost `--allowed-tools ""` and `--max-turns 1` the same
way while its source comment described a sandbox. The pinning test is
cheap: launch a program that prints its own `argv` through the *same* spawn
path the door uses, and compare position for position.

## Seam 2 — the auth probe describes whatever environment it is given

Measured in full in this subject's `subscription-auth-selection`
application for this stack. Summary of the consequence for this technique:
`claude auth status` recomputes from the child's environment, so a probe run
at the host's prompt is evidence about the host. Worse, the field that moves
differs per leak — with `ANTHROPIC_API_KEY` present, `authMethod` and
`apiProvider` are unchanged and only `subscriptionType` goes `null` — so an
adapter asserting the obvious field gets a green probe over a metered run.
Run the probe through the spawn door; compare the whole record.

## Seam 3 — a missing binary is not a spawn error, and the write can kill the host

Spawning a nonexistent agent CLI through `shell: true` and writing a 2 MB
prompt to its input:

```
UNGUARDED : uncaught "Error: write EOF" -> host process ends
GUARDED   : stdin 'error' EOF caught -> call fails, host lives
            close code=1, child.on('error') never fired
```

Two findings, and the second is the one that was not in the field report:

- Without a handler **on the input stream**, the write to the dead child's
  pipe is an unhandled `'error'` event, which Node escalates to an
  `uncaughtException` that ends the whole host process. The transport's
  not-installed verdict and the fallback ladder above it both exist and
  neither can run, because nothing survives to classify anything. The
  bigger the prompt, the more reliably the write outlives the child — and
  prompts here are large.
- With the handler attached, the run completes and **`child.on('error')`
  never fires at all** (`classified=false`, `close code=1`). Through a
  shell, a missing program is not a spawn failure: the shell launches
  successfully, fails to find the program, and exits 1 like any ordinary
  child. So the handler where implementations put "not installed" is
  unreachable on this platform, and absence must be recognized from the
  probe plus exit status and stderr text instead.

Both behaviors are total on machines without the tool and invisible on
machines with it — which is to say invisible to everyone who tests the
ladder and fatal to everyone the ladder was built for.

## How three field implementations actually score (re-read 2026-08-30)

The same three repos this subject already cites for envelope parsing were
re-read against these seams. The pattern is that each seam is solved by
whoever was forced to notice it, and by nobody else.

- **Seam 1, solved structurally in the Python consumer.** `kp`
  (`pipeline/jobfit/claude_cli.py`, `_executable`) resolves the command with
  `shutil.which` and invokes the **absolute path**, with a docstring naming
  the exact cause — "On Windows the npm-installed `claude` is a `.CMD` shim;
  passing the bare name to `subprocess.run` fails because `CreateProcess`
  does not apply `PATHEXT`" — and closing "the prompt goes over stdin (never
  argv), so the `.cmd` quoting hazards don't apply." Resolving the path
  removes the need for a shell, and removing the shell removes the seam.
  The Node consumers, which reach for `shell: true` against the same shim,
  keep it.
- **Seam 2, environment right and assertion wrong, in the same file.** kp
  runs its auth probe with `env=self._child_env()` and the comment "same env
  the real run gets: seat, not key" — independent convergence on this
  technique's rule, with the reason stated. But the verdict is then
  `PROBE_READY if logged_in else PROBE_UNAUTHED`, decided on `loggedIn`
  alone. `authMethod` and `subscription_type` are carried on the probe
  record as data and nothing branches on them. Per the measurement table in
  this subject's `subscription-auth-selection` page, `loggedIn` is `true` on
  **every** leak row — so this probe returns `PROBE_READY` on a machine
  whose spawned runs would bill per token, and the field that would have
  caught it is sitting on the record, unused. Getting the environment right
  and the field wrong is the likely failure mode, not an unlikely one.
- **Seam 3, guarded but silenced.** `systedo-case`
  (`src/lib/llm/claude.ts:264`) has `child.stdin.on("error", () => {})`. The
  host survives — the important half. But the empty handler discards the
  only evidence of what happened, so the run continues with an unwritten
  prompt and the failure surfaces downstream as an unparseable envelope.
  The ladder then descends for the wrong stated reason: "parse failure"
  rather than "binary absent", which is the one distinction the descent
  record exists to preserve. The handler should classify, not just absorb.

## What to pin

Three tests, none of which needs a model call: an argv round-trip through
the real spawn path; an auth-status parse taken from the door's constructed
environment and asserted as a whole record; and a not-installed descent
exercised against a binary name that genuinely does not exist.

## The delivery seam, on a later build: arrival has no producer-side signal

Run 2026-09-01 against Claude Code 2.1.252 in a throwaway git repository,
testing the fifth seam: whether a host can tell that context it arranged
to inject actually reached the model.

Both arms use the **same hook script**, the same event, the same bytes,
and the same exit status. The single variable is the stream the bytes are
written to — stdout, which this harness routes into model context, versus
stderr, which it does not. Writing to the wrong stream is not a contrived
fault; it is an ordinary wiring mistake and it is precisely the shape of
the field report this technique is written from, where a harness ran a
project hook successfully and its output never reached the model.

### The two arms

| Arm | Channel | Producer evidence — the only signal a host-side check has | Echo probe |
| --- | --- | --- | --- |
| B | stdout | `ran=…, rc=0` | token quoted back → **delivered** |
| A′ | stderr | `ran=…, rc=0` — *byte-identical* | `NO_TOKEN` → **not delivered** |

The token was generated fresh for the run and stamped into the injected
text; the model's first instruction was to quote it back, so a correct
answer could only have come through the channel under test.

**Every producer-side observable agrees across the two arms.** The hook
ran, exited zero, and wrote its marker in both. A host asserting "the hook
succeeded" passes in the arm where nothing arrived. Only the echo
separates them, which is the technique's claim stated as a measurement:
producing is not delivering, and no amount of watching the producer will
tell you which one you got.

### The negative arm is the useful half

A reader deciding whether to build the probe should note that the arm
worth paying for is A′. Arm B — the working case — proves only that the
wiring is right today. It is arm A′ that shows the *instrument* is
necessary: without the echo, arm A′ is indistinguishable from success, and
a transport shipping in that state reports healthy while its injected
context silently does not exist.

### Bounds

This run establishes the seam and the instrument on one harness, on one
surface, on one date. It does **not** establish per-surface delivery for
any other tool. A second harness was installed and probed in the same lab
and its run did not complete inside a four-minute budget — plausibly an
authorization state rather than a delivery result — so it is recorded as
**not exercised**, not as a negative. Inferring a delivery answer from a
run that never produced one would reproduce, in the measurement, exactly
the confusion the technique exists to prevent.
