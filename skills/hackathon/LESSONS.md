# Lessons - hackathon

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-10-28 - gravitone-gcloud (audio-steer-1028: music anyone can make on purpose, 5 h long mode, host = the skill's author)

Run shape: four ideators (`claude-opus-5-5@high`, `claude-sonnet-5-5@high`, `agy:gemini-4-argon@high`, `muse:muse-wonder-1.0@high`), 40 of 40 ideas valid. The owner shortlisted 12 and had them fused into 4 packs, one per provider (one broad, three deep). Each pack was built at `xhigh` in a worktree of the real repo, from 12:36 to 17:36. Builds: 58, 9, 36 and 29 commits, +3.4k to +6.0k lines each. The verdict was a fusion: e1 as the base, e2's backend absorbed, e4's intent door absorbed (its MCP ops follow in the spark's second stage), e3 deferred to a later Suno package. The composed scope went to /spark. The fusion was recorded with 1.1.0's `verdict --fuse` after the fact, and its wrap removed only e3's tree (1.5 GB), keeping all four branches.

- **The owner's words are the menu, even when the track is broad.** One sentence the owner typed under "Other" in the framing wave (instrument steering, desktop instruments as preview material) anchored all four seats' strongest ideas. All four seats independently proposed an ear-first instrument palette. Track text that comes from the owner is still worth keeping verbatim; only host examples are banned. Now in Phase 1.
- **Picks outnumbered seats, and packs were invented mid-run.** The owner picked 12 ideas for 4 seats and asked for broad and deep packs. `shortlist --packs` was built in the run, in about 4 minutes. 1.1.0 refuses a `--pick` list longer than max(4, seats) and points the host at packs.
- **The host harness killed the run, not a seat.** At 16:19, Claude Code's memory-pressure reaper killed the background `run` shell: 5.7 of 63 GB were free, and about 12 GB of `link.exe` belonged to a sibling session's native build. Every seat CLI died with the tree, but `next dev` and two Python sidecars survived as orphans. Re-running `run` resumed all three running entries in 3 s, so the resume design held, but the clock lost the time. 1.1.0 adds `preflight`, a memory check in `run` (exit 3 when short), a reaper warning, and the instruction to launch detached or with `CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1`.
- **A seat ran out of allowance mid-build.** Muse showed 32% of its weekly allowance at ideation. It hit its subscription limit after 2 h 26 min of building, and reset two hours later; the error prints the reset time in UTC. 1.0.0 had no way back. `run --resume-limited` was added in the run and won back one 20-minute session before the deadline. Phase 0 now checks each seat's allowance and tells the owner before the clock starts.
- **Host deaths spent the seats' session budget.** Gemini works in short sessions (83, 50, 39 and 38 minutes). With the reaper's interrupt counted, it hit `max_sessions` 6 at 16:31 with an hour left, and the host raised the cap in the state file by hand. In 1.1.0, `interrupted` and `seat-limit` sessions do not count.
- **A seat that said it was done kept getting sessions.** Sonnet's entry declared itself finished at 16:55. It then burned four continuations of 1-4 minutes each and stopped only at the cap. 1.1.0 stops an entry when the builder writes `.hackathon/DONE`, or after two completed sessions in a row under 5 minutes each.
- **Baselines landed far ahead of `baseline_by`.** They arrived at 13, about 30, about 35 and about 35 minutes, against 1 h 45 min allowed. The 35% default never bound anything on a 5 h clock. One run is too little to change the default; Phase 5 now says a smaller fraction is fair.
- **Commit cadence is a seat trait.** Gemini made 2 commits in its first 2 hours, with 15 dirty files; the Claude and Muse seats made 16-24. The snapshot after each session saved the work. The builder brief now asks for a commit at least every 30 minutes.
- **Ideators probed despite "do not run anything".** One seat timed a VST load (77 s) and found an instrument that renders silence. That matched the host's own probe and made the ideas better. The ideator brief now allows short read-only probes and asks for them to be cited in `grounding`.
- **The demo pass needs craft.** Several things went wrong:
  - Three dev servers were left up while the owner judged. They were reaped as idle shells and survived as orphans holding about 4 GB.
  - A result panel sat in an inner scroll container that full-page screenshots missed.
  - `next dev` rewrote a tracked `tsconfig.json` in three worktrees.
  - A host script typed into the wrong field, which made an entry's step fail through no fault of the entry.

  Phase 6 now spells out one server at a time, kill by port, inner-scroll shots, and a `git status` restore. It also says to re-run a failing gate file alone and on the base. Here a test that failed on all four branches was inherited from the base, and the rest were load flakes.
- **The verdict rested on a mechanism the pack never named.** The owner judged e1 as "the LLM takes vague directions". The judging pack showed a sentence becoming chips, but not that a 150-row keyword table did it and that its LLM fallback was not wired. The follow-up /spark scout found this on its first read. The owner then chose an external MCP agent as the brain instead of an in-app LLM. Phase 6 now asks for each headline claim's mechanism (model, rule table or fixture), checked in code.
- **Smaller fixes.**
  - The verdict was a fusion, not a winner. 1.0.0 forced `--winner e1 --runner-up e2`, and its wrap would have removed e2's worktree, which the follow-up still had to read. 1.1.0 adds `verdict --fuse "e1=base,e2=absorb,e3=defer,e4=drop" [--followup ...]`, and wrap keeps the `base` and `absorb` trees.
  - A second `run` process beside the main one could lose state writes. `hackathon.json` now has a lock.
  - agy runs `xhigh` as `high`, but the ledger recorded `@xhigh`. Specs are now recorded as they run.

## 1.2.0 - 2026-10-30 - paypal
- First credit night (`--cloud`, killer-1030). The owner started it at 08:52, so `--until 08:00` would have meant a 23 h clock and the instrument refuses that. `--cloud --hours 8` kept the key funding with a daytime clock, which was the right escape. The evening sync should ask about the clock first whenever it runs after midnight.
- The pre-round on the key cost $1.44 for 20 valid ideas (Opus 5.5 high $1.01 in 257 s, Sonnet 5.5 high $0.43 in 187 s). The $15 ideation ceiling is about ten times what was needed.
- The 1.2.0 cap design had a flaw, caught on the dry run before launch:
  - The cap is split into per-session shares ($50.71 each for 5 entries). The first entry to spend its share would end `budget-reached` and switch every entry to the subscription, with about $200 of the cap unspent.
  - Fixed in 1.2.1: `budget-reached` switches only when what is left of the cap is under $1. Otherwise the entry resumes on the key with a fresh share.
- The shortlist's "ideas in more than one pack" line split labels on commas. Three of the five pack titles had one, so it listed single-pack ideas as shared. Fixed in 1.2.1 with a per-entry count (`sharedIdeas`).
- The owner fused across clusters (A5 + B5: rules from a sentence, plus the past/future timeline) and parked a whole cluster as a future hackathon. Packs carried both without extra tooling.
