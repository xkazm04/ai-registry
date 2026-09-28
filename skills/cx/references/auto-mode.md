# Auto mode - the unattended walk

Loaded by `/cx --auto` and `/cx triage` (see SKILL.md, **Auto mode**). Everything here overrides
only what it names; every other phase runs as SKILL.md writes it.

The walk without the user in the chair. It exists because the manual walk's record showed the
same shape stop after stop: the user accepted the read whole and steered on the *review* of the
built screen, so the prompt at Phase 5 mostly cost a round-trip. `--auto` removes that round-trip for
everything a builder can land and a verifier can check in one sitting, and keeps the human for the
decisions that are expensive to undo. It is the same method: same map, same stops, same heuristics,
same gates, one commit per stop. The only things that change are **who triages** and **who looks at
the after-shot**.

## The loop

```
for each stop in journey.md, in order, not [x] and not [-]:     (--stops N caps the count)
  Phase 3  arrive + capture                        (unchanged)
  Phase 4  read                                    (unchanged; the standing law pre-empts)
  A5       auto-triage                             (replaces Phase 5)
  Phase 6  dispatch the auto-accepted items        (unchanged, plus A6 below)
  A6       independent verification                (replaces the user looking at the after-shot)
  Phase 7  close the stop, commit, update the vault (unchanged; triage queue appended)
  -> next stop, no prompt
Phase 8 once, then A8 (the report)
```

Each stop is closed completely (committed, `journey.md` and `state.md` rewritten) before the next
is opened. A stop whose only open items are in the triage queue is closed `[x]`: the queue carries
them, and a `[~]` would make the loop walk the stop again, so an interruption, a context compaction or a new session loses at most the stop in
flight, and `/cx --auto` resumes it. To spread a long map across sessions, `/loop /cx --auto`.

**One product state, one driver at a time.** Executors and the director capture against the same
running product, so while an executor drives it the director reads code, writes notes and briefs -
it does not capture. A defect that appears only in the walk's own driving (a stale frame, a phone
reopened between runs, an index the test sent wrong) is checked against the code before it is read
as the product's.

**Stops are sequential, never parallel.** Stop N+1 is often the screen stop N's items just changed,
and the read must be taken of the product as it is now. Parallelism lives inside a stop (Phase 6).

**The map under `--auto`.** `map --auto` / `replan --auto` build the map as Phase 2 describes and
write it without the confirmation menu; the map printed in the run log is the record the user
reviews. A cold vault or a map marked stale is rebuilt first. The one map decision `--auto` never
takes alone is **removing** a journey the overlay's `## Journeys` seeds; it keeps the journey and
queues the question.

## A5 · Auto-triage

The user's expectation is absent, so it is **not invented**. The stop note records
`expectation: none - auto` instead. What stands in for it is the **standing law**, applied in this
order, and a proposal that any line of it contradicts is withdrawn with that line cited:

1. `Patterns/cx-preferences.md`: the user's promoted rules.
2. The user's expectations recorded verbatim in earlier stop notes, and every earlier decline. A
   proposal a stop note declined is not remade in other words.
3. The overlay's `## Repo law` and `## Heuristics`, and the `design_doc`.
4. Any feedback the host's memory holds for this product.

Then route every surviving proposal:

| route | when | what happens |
|---|---|---|
| **auto** | effort `xs`, `s` or `m`, names a heuristic, and is none of the gated classes below | accepted, dispatched this stop |
| **triage** | effort `l` or `xl` | written to the triage queue with its full brief; not built |
| **triage** | a gated class, whatever its effort: changes the `design_doc` or the overlay's law; deletes a screen, route or journey the user can reach today; a new capability off the map's path (`deferred - new feature` in the default modes); an irreversible or outward act (data migration, a published asset, anything pushed); a proposal that reverses a decision a stop note records | queued with the reason it is gated |
| **withdrawn** | contradicted by the standing law | recorded with the line that withdrew it |

**Never split an `l` into several `m`s to dodge the queue.** If the pieces only make sense
together, it is one `l`. If an executor finds that an `m` is really an `l` once it is working on
it, it stops and returns `needs l` with what it learned. The item then moves to the queue, and
nothing half-built is committed. **The director re-grades after the build too**: an executor that
finished an `m` by touching the store, a session view and several routes built an `l`, whatever it
reports. Verify it, park it on its own branch, and queue it with the branch named, so the owner's
yes costs one merge.

Print the triage as one block and move on without waiting:

```
S<n> · <screen>   auto 4 (xs xs s m) · queued 1 (l: <proposal>) · withdrawn 1 (<rule>)
```

## A6 · Independent verification

In the manual walk the user looks at the after-shot. Here a **verifier** does. It is a fresh
subagent that did not build the change and gets no executor report beyond the list of files
touched. It receives the before and after captures, each item's acceptance line, and the
repo law, quoted. It returns `pass`, `fail` or `unsure` per item, with the pixel, count or string
that decided it. It also runs the overlay's measurable rules against the after-shot, such as a word
budget or a minimum type size. Those rules are checked with numbers.

- `pass` and the gates are green: landed.
- `fail`: **one** repair round with the verifier's finding as the brief, then re-verify. A second
  `fail` is `deferred - failed acceptance`: its files are restored and the stop commits the rest.
- `unsure`: landed, and a `review` line goes to the queue with both captures. The user settles
  it in `triage`; the verifier never settles it by guessing.

**Baseline first.** Run the gates once before the first dispatch of the run. If they are red
before anything was built, the run stops and says so. `--auto` never builds on a red baseline,
because nothing downstream could tell its own breakage from what was already broken.

**A screen that did not exist before this stop** (an `absent` stop built in `complete` mode, or a
new screen an item created) gets one automatic **second read** after it lands. The first read of
an unbuilt screen is only a spec, and the real read can only be taken of the built thing. The
second read is auto-triaged and built like the first. There is no third read. What is left after
the second goes to the queue as `review`.

## The triage queue

`$VAULT/Cx/triage.md` is where `--auto` leaves every decision it would not take. It is one
append-only file for the whole walk:

```markdown
# CX Triage - <product>

Decisions `--auto` would not take. Walk with `/cx triage`. State is the first character.
[ ] open   [x] accepted and landed   [-] declined   [>] deferred

## S<n> · <screen>
- [ ] T<k> · <impact>/<effort> · <heuristic> · <proposal>
  why queued: <l | xl | gated: <class> | review: <verifier's unsure>>
  evidence: <what triggered it>   brief: [[S<n>#T<k>]]
```

The full execution brief is written into the stop note under `## Queued`, so `triage` can dispatch
the item without taking a new read.

**`/cx triage`** walks the open lines one at a time, highest impact first, one prompt each:

```
T<k> · S<n> · <screen> · <impact>/<effort> · <proposal>
<why queued, one line> · <evidence, one line>

1. other -> adjust (say how)
2. Accept - build it now                                 [default]
3. Decline (reason optional)
4. Defer - keep it queued
5. Stop triage here
```

Accepted items are dispatched through Phase 6 with the stop's brief. They are verified, committed
against their stop as a dated round and marked `[x]` in both the queue and the stop note. A
decline is recorded in the stop note too, so that A5 treats it as standing law from then on.

## Stop conditions

The run ends when any of these happens, and says which:

- the map is exhausted, or `--stops N` stops have been closed
- a red baseline, or gates that were green before a stop and are red after it, and restoring that
  stop's files does not turn them green again
- the product cannot be run, and the stop needs a capture: the run does not fall back to
  `(from code)` reads, because an unattended read without a screen cannot be checked
- three stops in a row landed nothing because everything was queued. The map has reached a part of
  the product that needs the human, and walking on only makes the queue longer

It does not push. It does not open PRs. It does not touch the paths the overlay's law protects.
It never answers a question the vault records as the user's to answer. Such a question goes to the
queue as `gated: owner question`.

## A8 · The report

After Phase 8, print one block and nothing else. The vault holds everything longer.

```
/cx --auto - <product>   S<a>..S<b>   <stops> stops · <commits> commits
landed <n> · withdrawn <w> · deferred (failed acceptance) <f> · queued for you <q>

S<n> · <screen>    <sha>  <n> landed  <q> queued
...

Triage queue (<q> open, highest impact first):
T<k>  S<n> · <screen>  H/l   <proposal>
...
Next?
1. /cx triage - walk the <q> queued items                [default]
2. /cx --auto - continue from S<next>
3. status
```
