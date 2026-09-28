---
layer: application
type: application
subject: live-system-demo-film
technique: recording-that-asserts-its-claims
stack: go
status: forged
verified_on: 2026-09-27
verified_against: go@1.26
---

# A terminal recorder that is also an integration test

charmbracelet/vhs renders terminal demos from a `.tape` script: it boots a
terminal in a headless browser, types the script's keystrokes into it, captures
frames, and hands them to ffmpeg for a GIF, MP4 or WebM. It is the recorder
technique on a second stack and at the opposite end of the take-length scale -
seconds of picture, no narration, nothing paid for before the capture - and
that is what makes it useful here: it agrees with the technique on *what* to
assert against, and it shows exactly where the technique's failure policy stops
applying. Read at commit `24fa2254a9806091e6ee6a980e9f3bcfe0a9ba53`;
`go.mod:3` declares `go 1.26.7`. The tree was read, not built - no Go toolchain
was available to the reading - so the anchors below are to source, not to a run.

## The doctrine is the tool's own tagline

`README.md:12` states both jobs in one line - "Write terminal GIFs as code for
integration testing and demoing your CLI tools." - and `README.md:840-849`
makes the build-artifact half concrete: "You can hook up VHS to your CI pipeline
to keep your GIFs up-to-date", followed by "VHS can also be used for integration
testing. Use the `.txt` or `.ascii` output to generate golden files. Store these
files in a git repository to ensure there are no diffs between runs of the tape
file." A demo that is re-rendered by CI and diffed on every run is the subject's
"film as a build with a gate", reached independently.

## Assertions land on rendered text

The tape's assertion is `Wait`, which blocks until a regular expression matches
the terminal (`README.md:711-731`; defaults `README.md:730-731`: "The default
regular expression is `/>$/`, the wait timeout is `15s`, and the default scope is
`Line`"). What it matches against is the point. `command.go:150-209` reads either
the current line or the whole screen through `v.Buffer()`, and `testing.go:68-70`
shows what the buffer is:

```go
buf, err := v.Page.Eval("() => Array(term.rows).fill(0).map((e, i) => term.buffer.active.getLine(i).translateToString().trimEnd())")
```

That is the terminal emulator's **rendered** grid - the characters the frame
shows - not the child process's output stream. A program that wrote the right
bytes and had them mangled by width, wrapping or an escape sequence fails the
`Wait`, which is the technique's "assert on what the audience sees" rule
implemented at the only layer where it holds.

The golden files come from the same buffer. `command.go:26-31` snapshots it after
**every** command while recording (`if v.recording && v.Options.Test.Output != "" {
err := v.SaveOutput()`), and `testing.go:52-62` appends each snapshot followed by
a separator line - so the `.txt` output is a per-step transcript of the rendered
screen, the terminal analogue of a per-beat record.

## The verdict lives outside the recorder

Nothing in the tool compares a golden file. `testing.go:13` declares a `Golden`
option, and it is the only occurrence of the name outside the tests; there is no
code that reads it. The comparison is delegated to the repository: the README's
instruction is to commit the file and let a diff be the gate. That is a coherent
split - the recorder produces the record, CI owns the verdict - but it means a
tape run on its own passes whenever every `Wait` matched, whatever the screens
looked like in between. The claims a tape asserts are exactly its `Wait`s; the
golden file is evidence that only becomes an assertion where someone diffs it.

## Deviation that is the technique's condition: fail fast, render nothing

A `Wait` that times out returns an error (`command.go:205-206`, "timeout waiting
for %q to match %s; last value was: %s"), and the evaluator's command loop stops
on the first error - `evaluator.go:167-171`:

```go
err := Execute(cmd, &v)
if err != nil {
	teardown()
	return []error{err}
}
```

`v.Render(ctx)` at `evaluator.go:187` is never reached, so a failed tape produces
no GIF at all - not a diagnostic take, not a partial one. That is the opposite of
record-and-carry-on, and here it is correct. The technique's case for carrying on
is economic: a long serial take whose narration was already paid for, where
aborting yields one defect and no film. A tape is seconds long and spends nothing
before its capture, so re-running after each fix costs less than reading a
diagnostic recording would. The error message is also the diagnostic the
technique wants recorded against the beat - it carries the last screen value it
saw. The rule that transfers is the condition, not the policy: carry on when the
take is expensive to repeat; fail fast when it is not.

## Deviation: the capture's own failures do not fail the run

The asymmetry runs the wrong way for a film. Script failures abort, but failures
of the capture itself are only logged: `evaluator.go:136-141` drains the
recorder's error channel with `log.Print`, and `vhs.go:683-688` shows what a
failed frame costs - `ch <- fmt.Errorf("error: %v, %v", textErr, cursorErr)`
then `continue`, with the frame counter not advanced. The frames are encoded as
an image sequence at a fixed rate (`video.go:120-127`, `"-r",
fmt.Sprint(opts.Framerate)`, default 50 at `video.go:63`), so the film's clock
is **frames captured divided by the rate**, not the wall clock. A dropped frame
shortens the film at that point, and so does any stretch where one capture takes
longer than the interval - `vhs.go:672` waits `interval - time.Since(start)`,
which is already negative when a capture overran. The run still exits clean.

For a silent terminal GIF this is cosmetic. For the film this subject describes
it is the uncertainty the technique says to write down where it is created: the
picture's timeline is not the timeline the script ran on, and nothing records by
how much. Narration laid on at logged wall-clock offsets would drift against
such a capture with no signal. The standard stands - a capture defect is a
measurement the run did not make, and it should be counted, not logged.

## What does not transfer

Pacing is authored, not measured: `Sleep` and `TypingSpeed` are durations
written into the tape by hand. With no narration there is no clip to measure,
which is the audio-first technique's own "when not to use it" case rather than a
gap. And the stage is the operator's shell: `Hide`/`Show`
(`README.md:747-758`, "helpful for performing any setup and cleanup required to
record a GIF") keeps setup off the picture, but nothing declares which parts of
what the viewer sees were staged, so the boundary technique has no counterpart
here.
