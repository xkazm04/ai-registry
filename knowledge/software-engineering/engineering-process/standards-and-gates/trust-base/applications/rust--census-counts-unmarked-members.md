---
layer: application
type: application
subject: trust-base
technique: census-counts-unmarked-members
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
---

# A marked environment write whose argument narrowed the precondition and then decayed

The tree is the open-source speech tool vox, read at commit `96fe9dbc` with sixty
commits of history. The witness for the stack is `Cargo.toml:4 "edition"`, set to the
2024 revision, which re-marks environment writes as unsafe; this tree therefore spells
its member with the marker, and it is the half of the technique that concerns the
argument, not the census.

## The member and its argument

The speech backend that phonemizes text extracts a data directory once and points a
library at it through the process environment,
`src/backend/piper.rs:71 "std::env::set_var("` with the variable named in the note below.
The site carries a note, `src/backend/piper.rs:67 "SAFETY: espeak-rs reads this env var inside a OnceLock-guarded init that"`,
and the note's conclusion is `src/backend/piper.rs:69 "there is no race with other threads reading PIPER_ESPEAKNG_DATA_DIRECTORY."`

That is narrower than the function's own precondition. The standard library's
documentation for the function, read on the day of the run, says it is sound in a
single-threaded program, always sound on one platform, and otherwise requires that no
other thread write or read the environment through any route, including library
functions that read it implicitly. The note argues about readers of one variable.

## How it decayed

The note entered the tree on 2026-05-14 in commit `b251c3c`, when the backend loaded
its model first and played afterwards, so the command-line path had one thread at the
write. On 2026-10-05, commit `33398d4` made the backend open the output device before
loading the model, to overlap the two waits:
`src/backend/piper.rs:361 "Opened before the model loads, so the two waits overlap."`
The device opens on a new thread, `src/backend/piper.rs:365 ".then(|| crate::audio::Player::start(opts.volume));"`,
and the very next statement, `src/backend/piper.rs:367 "let mut guard = get_or_load_model(&voice)?;"`,
reaches the write through `src/backend/piper.rs:327 "ensure_espeak_data()?;"`. On the
first call of each process the write now runs while the new thread is opening an audio
device through the platform's audio libraries, which read the environment. The note
was not touched by the change, and the build stayed green.

The write happens once per process, guarded by a once-cell, so the window is the
first call only. The tree's resident daemon and its tool server run other threads
before any call arrives, so for those two hosts the note was narrower than the
precondition from the day it was written.

## Two other environment writes in the tree

`src/daemon.rs:525 "SAFETY: GetStdHandle takes no pointer and returns a handle owned by"`
is an ordinary foreign call with a local argument, which the soundness technique
counts as locally sound. The tree's remaining environment writes are in tests; the
test runner runs them on parallel threads.

## What this realization cannot do

It cannot show a crash. The race is a window of microseconds on the first call, and
nothing in the tree or its issue history reports one; the finding is that the written
argument no longer covers the code, which is what the technique says a reviewer can
check and a test cannot. The remedy the technique ranks first is cheap here: pass the
data directory to the phonemizer directly if the library allows it, or set the
variable as the first statement of the entry point, before any thread starts, where a
placement argument replaces a population claim.
