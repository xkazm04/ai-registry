---
layer: application
type: application
subject: voice-io
technique: real-time-synthesis-budget
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
---

# A local speech tool that measured its process boundary both ways

The tree is the open-source speech tool vox, read at commit `96fe9dbc`; the witness for
the stack is `Cargo.toml:4 "edition"`, the 2024 revision, which needs 1.85 or later. It
ships several local synthesis engines in one binary and is called by coding agents,
from a command line, a resident daemon and a tool server. Its documentation is in
French; the quotations below are verbatim and translated beside them.

## The process boundary, measured both ways

The technique's rule is to time the same engine as a fresh process per utterance and
as a resident one, on the same machine. The tree states the cost plainly, a command
line call is a new process that reloads the model every time,
`docs/ARCHITECTURE.md:400 "Un appel CLI est un nouveau processus"`, and it measured
both shapes on one laptop for the engine that speaks languages other than English:
`docs/ARCHITECTURE.md:389 "environ 0,75 s | 0,26 a 0,32 s"` (about 0.75 s to first
sound without the daemon, 0.26 to 0.32 s with it). The resident daemon is opt-in and
never started for the user, `docs/ARCHITECTURE.md:274 "Il n'est jamais demarre automatiquement."`
(it is never started automatically), and a command routes to it only when the engine
holds a model, no output file was asked for, and the daemon answers a health probe,
`src/main.rs:383 "if is_heavy && opts.output.is_none() && daemon::is_running() {"`.
The file case bypasses the daemon on purpose: a relative path would resolve against
the daemon's working directory, `docs/ARCHITECTURE.md:293 "un chemin relatif y serait resolu"`.

## Figures that carry their conditions

The benchmark page times whole commands that render to a file, so that no audio device
is involved and machines compare,
`docs/BENCHMARKS.md:12 "Rien n'est joue, donc"` (nothing is played, so the figure does
not depend on an audio device). Each figure is the median of five commands with the
minimum and maximum beside it, `docs/BENCHMARKS.md:20 "Chaque chiffre est la mediane de 5 commandes"`,
the first call that downloads and loads the model is excluded and reported in its own
table, `docs/BENCHMARKS.md:18 "Un premier appel, non compte"`, and the page closes on
what was not measured, `docs/BENCHMARKS.md:164 "Ce qui n'a pas ete mesure"`. Older
figures that nobody re-took are kept and labelled as unattributed rather than reused,
`docs/ARCHITECTURE.md:396 "sans dire sur quelle machine ; non remesure."` (without
saying on which machine; not re-measured). That is the
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) discipline the
technique asks every figure to travel with.

The same page shows why the tier matters: the accelerated build sped up the cloning
engine six times and the recognizer fourteen times over the processor build on one
machine, `docs/BENCHMARKS.md:104 "Le build CUDA accelere"`, while the two default
engines took the same time on both, because they run on the processor in every build.

## A device choice the user times

The tool has a command that times one sentence with every engine on this machine,
rendering to a temporary file so nothing plays, and stores the fastest only when asked,
`src/main.rs:885 "Store the fastest backend when"` followed by the flag that asks. That
is the technique's rule that the default should follow a probe on the user's machine,
with the honest limit that it times speed and not voice.

## What this realization cannot do

The status line that reports acceleration describes the build, not the device created
at run time; the tree says so in its own documentation and prints the real device only
for one engine when it loads. The technique's "ready, but on the slow path" state is
therefore visible for one engine and inferred for the other. And the first-sound
figures were taken on one laptop in a power-saving mode, three seconds of speech each;
the page says the other platforms were reached over a remote shell with no audio
device, so first sound was never measured there.
