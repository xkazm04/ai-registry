---
layer: application
type: application
subject: concurrent-vcs
technique: commit-time-claim-guard
stack: process
verified_on: 2026-10-15
applied: experiment
ab_verdict: not-better
---

# A lease rule at the commit, replayed over a month of one shared checkout

This registry is written by many concurrent agent sessions on one checkout of its main
line. Its run board takes advisory claims on sources and subjects and three short named
locks; nothing checks a commit. An earlier round priced one commit-time rule on this
history, refuse a staged path the committing session never wrote, and found it caught
most known sweeps at a low false-refusal rate but missed one whose foreign content was a
sibling's rows inside ledgers the run had also written. A claim system read in a sibling
tree guards the commit with the other rule the technique names: refuse a staged path that
another holder's live exclusive claim covers. This application is that rule, replayed on
the same history as a second arm, before anyone proposes installing it.

## The instrument

The registry's commit-inventory replay maps every non-merge commit to the tool call that
made it from the agent harness's own session transcripts, including sessions launched in
other project folders, and rebuilds each session's write inventory. For this run it gained
two lease arms on an unlanded branch (`ab/lease-guard-replay`, `c0f626d8`), both computed in
one run of one parser beside the inventory rule:

- **declared leases:** the claims sessions actually made on the run board, rebuilt from
  their `claim`, `beat` and `release` calls (the board keeps no history), each live until
  released or 45 minutes after its last sign of life, subject claims resolved to their
  directories through the bundle index, every claim treated as exclusive;
- **implied leases:** the source's discipline followed perfectly - every session holds
  every file from its first write until the commit that carries it, renewed by each
  write, lapsing after an hour idle; a write while another session holds the file is
  counted as a refused grant.

Each lease arm also ran with the shared append-only ledgers and generated files exempt,
the way the source exempts its task tracker. Target and floor were declared before the
run: known sweeps refused (three real ones still inside transcript retention and one
planted replica of an older one), and clean commits refused, at most 2%. Window: the
transcripts' retention, 2026-09-14 to 2026-10-14; 1,425 commits mapped.

## What it measured

| arm | real commits refused | known sweeps (of 4) | unrecorded sweeps (of 2) | clean refused |
| --- | --- | --- | --- | --- |
| no guard | 0 | 0 | 0 | 0 |
| own inventory | 8 | 3 | 2 | 4 (0.28%) |
| declared leases | 3 | 2 | 1 | 1 (0.07%) |
| declared leases, ledgers exempt | 3 | 2 | 1 | 1 (0.07%) |
| implied leases | 218 | 3 | 2 | about 210 (about 15%) |
| implied leases, ledgers exempt | 40 | 2 | 2 | 37 (2.6%) |

The replica counts as caught for every lease arm by construction, since the plant supplies
its sibling holder; for the declared arm that holder is an assumption the transcripts
cannot confirm, and without it the declared arm caught one of three real sweeps. Every
refused row of the declared and exempt arms was read, and a 26-row sample of the implied
arm, each classified by whether the commit's added lines contained lines the holder had
written.

**Verdict: not-better.** No lease arm met the target and kept the floor. The declared
claims are too coarse and too sparse to see what lands: 409 commits were made while another
run held a live claim, and three carried a path under it. The implied arm is the only one
that refused the ledger-row sweep, and it did so by arrival order: the session whose rows
were swept had written the ledgers first and so held them. Exempting the ledgers removed
exactly that catch, as predicted before the run. No lease arm refused the commit that took
siblings' abandoned work "as found", because their claims had lapsed; the inventory rule
refused it. The implied arm's up-front cost was about 230 refused grants in the month on
tracked files, 119 of them ledger appends and 66 regenerations, and 154 of its 218 commit
refusals came from private worktrees, whose commits cannot carry a sibling's working-tree
bytes at all.

## What it changes

Nothing is installed and the branch is not merged. The result moves the open backlog item
for a declared-inventory guard: a lease rule is not its alternative arm, the content check
for shared ledgers (head plus this run's rows only) is still the direct fix for the missed
class, and the one lease signal worth testing beside the inventory is narrow - a holder
still in flight wrote this ledger first. The technique's rule order (inventory first, claim
as complement) is written from this replay, so this row is its evidence, not a test that
could have refuted it.

## What this realization cannot do

It reads transcripts, so it sees about a month and nothing a process without a transcript
committed. Path claims were reconstructed from command text; a claim made by a computed
argument is invisible to it. Some implied-arm refusals may be mapping limits, where the
holder's own commit of the file was not mapped to it and its lease never ended; the run
could not separate those without refining the mapping, which it was forbidden to do
against the lease rows. The inventory numbers come from a parser refined over earlier runs
after reading flagged rows, so they are rates on this corpus, not guarantees.
