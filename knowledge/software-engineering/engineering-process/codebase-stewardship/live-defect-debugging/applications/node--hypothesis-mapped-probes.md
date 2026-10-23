---
layer: application
type: application
subject: live-defect-debugging
technique: hypothesis-mapped-probes
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@22
applied: simulation
ab_verdict: better
---

# Three investigations of one desktop-app driver, replayed under a layered hypothesis set

What this realization cannot do: it is a replay of history, not a run. The three
investigations happened, but the hypothesis sets below are reconstructed from commit
messages after the causes were known, so the "A" arm is the investigators' behaviour
read back and not a recorded list. Nothing here measures how many rounds the amended
set would have saved. The evidence is one tree (n=3 cases, one author line).

Tree read: a public desktop application's commit history, three commits from the end
of May 2026, and the node scripts they added under the end-to-end test directory. The
version witness is the node-based driver scripts themselves, which are plain `.mjs`
files run by the project's node toolchain; no engine pin was opened, so `node@22` is the
stack line the registry uses and not a witnessed pin. Citations are commit-message
quotes resolved with `git show` on the shas below, not file lines.

## The seam

Anchor choice: the technique's layer list (input, state, ordering, environment,
dependency) was chosen as the falsifier, because a sentence that enumerates its own
completeness invites one question: did a real cause fall outside it? A caught result
would amend the list; a held result would show the list sufficed. Both outcomes change
what the technique says.

## The three cases

1. `072fd846bf` "no heap leak", "prior \"exit 0\" traced to tauri-dev port-1420 startup
   contention". The set the investigation ran was effectively one hypothesis, a slow
   leak ("the leading crash hypothesis" in the probe script's own header). It spent 90+
   adoption cycles to reject it. Under the technique's width rule that is the
   confirmation-hunt failure, and the cause was in the environment layer. The same commit
   reverts a hook left "unconditionally always-on" that "added main-thread work during the very stalls it measured
   (observer effect)", an instrument-layer cause that no hypothesis named.
2. `062f7abb06` "The apparent adoption-modal \"crash\" was a harness bug", the close
   selector "matched the custom titlebar's OS window-close button". A layered set that
   included the driver would have carried "the driver clicked something other than the
   modal's button", and one probe logging the clicked element would have decided it in a
   single round. The original list had no layer where this cause could sit.
3. `dd89bfff80` "`/eval` queue itself goes silent mid-session", "every prior `/eval` click
   had been a silent no-op". Seven smoke attempts each "surfaced a new layer". This is
   the silent-probe precondition: an entry probe tagged to no hypothesis would have shown
   attempts 2-7 as invalid runs on the first try. Here the technique already held; the
   case confirms it and adds nothing.

## What A and B predict

Policy A (the listed layers): case 1 is covered only if the author thinks of the
environment; cases 1 and 2 have causes in no listed layer. Policy B (the amended list
with the instrument as a layer): case 2 is settled in round one, case 1's observer
effect is a named hypothesis, case 3 is unchanged. Two of three cases move, one holds.

Falsifier: a driver-layer cause that the existing entry probe already catches without
the amendment would show the new line adds nothing. Case 3 is that, and it is why the
amendment states the entry probe as the discriminator rather than a separate probe.

## Where this falls short

- The cases are all one project's end-to-end driver. A defect observed without a driver
  has no instrument layer and the line is noise there.
- A reconstructed hypothesis set is a counterfactual. The measure that would settle it
  is rounds-to-cause on the next investigation of a driven defect, with the set
  written down before the first probe.
