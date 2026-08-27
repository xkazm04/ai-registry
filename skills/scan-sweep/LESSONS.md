# Lessons - scan-sweep

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets. Merged from every copy of this skill on 2026-08-22 when it moved into the registry lane.

## 1.0 - 2026-08-20 - kp (CandiDate / KP studio)

Run shape: `--lenses bounty-hunter`, all-contexts coverage, resolve mode. 285
contexts, 235k LOC TS/TSX + 54k LOC Python, a codebase already swept by several
long-running quality loops (a 19-round perfection loop, UAT, an LLM-call-site
audit).

- **On a heavily-swept codebase, pattern greps yield ~zero and burn a lot of
  budget.** Divide-by-length, `parseInt` radix, `.sort()` on numbers, loose
  equality, unescaped `new RegExp`, unclamped query params, `catch` returning
  success, bare `except` — every single one came back clean or already guarded,
  usually with a comment naming the bug it closed. Roughly half the run's budget
  went into probes that could not have hit. The signal to switch is the *second*
  clean battery, not the fifth.

- **What DID hit, all of it the same shape: two implementations of one rule
  that must agree, where only one got fixed.** Four of the five real findings
  were divergence, not absence:
  - a gate and its debit reading different amounts (one sibling route fixed, the
    other not — the fixed one's comment even described the bug);
  - a declared single-source constant module with one call site still
    hardcoding the literals;
  - an abstraction built to kill name-comparisons, with ~20 name-comparisons
    never migrated onto it (and one that *writes* an off-axis value);
  - a word-boundary alias whose boundary was unsatisfiable at the end of the
    string it was tested against.

  Generalizable technique: **hunt for pairs.** Client vs server validation, gate
  vs debit, TS vs Python constants, an abstraction vs its un-migrated call sites,
  a doc's stated rule vs the code. Grep for the *shared* symbol and diff the call
  sites, rather than grepping for a defect shape.

- **Hand-maintained coverage lists are the highest-impact finding class, and no
  gate watches them.** The critical finding (candidate PII with no GDPR erasure
  path) was a scrub function enumerating PII tables by hand, which had drifted
  behind a whole module added later — and its regression test asserted only over
  the tables the implementation *already* covered, so the test could never catch
  the omission. Same shape as auth allow-lists, tenancy manifests, rate-limit
  contracts. **Ask of every such list: what enumerates the ground truth, and is
  the test derived from that or from the list?** A test that reads the
  implementation's own list is coverage theater.

- **Contract/source-guard tests pin the OLD expression, so a real fix fails
  them.** Two of three fixes required editing an assertion that had frozen the
  buggy line. That is correct by design (the repo says changing one is
  deliberate) — but the sweep must budget for it and must *strengthen* the
  assertion in the same edit (pin the new expression AND forbid the old), or the
  fix silently loses its guard.

- **Parallel-session boundaries bind harder than the skill's file-path rule
  suggests.** Two genuine S-sized fixes were left unbuilt not because of risk but
  because their files (`messages/cs.json`, `pipeline-stages.ts`) were mid-edit by
  a concurrent session — committing them would have carried a stranger's in-flight
  work. Worth stating in the finding itself so the next session knows it was a
  coordination call, not a triage call.

### Redesign proposal (not applied)

The all-contexts + single-lens invocation has no home in the method: SKILL.md
assumes one session owns one context and runs many lenses over it. The inverse —
one lens over every context — is a genuinely different and useful shape (it finds
cross-context divergence a per-context sweep structurally cannot see, because
both halves of a divergent pair rarely live in the same context). It needs its
own scoping rule (pattern sweep repo-wide, then rank contexts by risk and deep-read
top N, declare the split honestly as DEGRADED), its own budget (findings are
repo-wide, not per-context), and its own snapshot scope value. Proposing rather
than applying: it changes the coverage ledger's shape, which the no-arg picker
and `coverage.mjs` both read.

## 1.0 - 2026-08-27 - personas (method review, no run)

Design review of the method itself against three gaps the operator named. Recorded
here because each was a *structural* absence, not a run-specific miss - and two of
them were invisible from inside a single run, which is why several good runs never
surfaced them.

- **The method described a session; the operator wanted a LOOP.** v1.0 owned one
  context end to end and stopped. Every coverage instrument it shipped
  (`lens_keys`, the no-arg picker, `coverage.mjs`) existed to make the NEXT session
  pick well - which quietly assumed a human would keep starting sessions. The
  budget was the tell: 30 findings per context against 22 lenses is a depth-first
  number, and it is the wrong one when 12 sibling contexts have never been read at
  all. v2.0 makes the loop the default and cuts the per-round budget to 5, on the
  rule that *the fifth-best finding in an unswept context beats the eleventh-best in
  this one*.

- **`--optimize` and `--develop` bracketed a default that had no name.** "Balanced"
  is not a direction, and a strategy with no name cannot be argued with or recorded
  honestly in a snapshot. Naming the default `stabilize` - defects, unpolished UI
  states, measured performance - is what lets the report say which of three things
  the run was actually doing.

- **The triage gate was keyed on RISK alone, so it could not see a cheap win or an
  expensive one.** v1.0 auto-executed at `risk <= 3` and asked above it. That routes
  a risk-5/impact-9 fix and a risk-5/impact-2 fix identically, which is the decision
  the operator was being asked to make by hand every time. v2.0 keys on the ratio:
  S auto-approves, L always backlogs, and M clears at `impact/risk >= 2.0` with
  `risk <= 4`. Pure churn is excluded by construction rather than by rule - it
  cannot score an impact that clears the bar.

- **Auto-approving a size class is only safe if the class is enforced at EXECUTION
  time.** The demotion rule (an S that touches a third file is reverted and re-emitted
  larger) existed in v1.0 as good hygiene; under auto-approval it is the load-bearing
  guard, because classification happens before the code is opened. Stated as such,
  and joined by four vetoes that outrank every route: outside the context boundary,
  a schema/protocol/public-API change, no gate that can verify it, or a foreign
  session's in-flight file.

- **The skill consumed a knowledge registry and paid nothing back into it.** A sweep
  is one of the few moments that can: it lands a fix and then knows something it did
  not before. v1.0 had no read side (findings were graded against the repo's own
  conventions, so a finding could only ever be an opinion about local taste) and no
  write side. v2.0 adds both, and the write side is deliberately the weaker verb: a
  LEAD to `.ai/registry-leads.jsonl`, gated on four bars - general, rule-shaped,
  novel against the subject actually read this round, and earned by a fix that
  LANDED. A sweep originates a finding; it never authorizes one.

  The bar that does the most work is the fourth. Proposing is free and landing is
  not, so restricting leads to fixes that shipped is what keeps the inbox from
  filling with things the sweep merely believed.

### Redesign proposal (not applied)

`leads-collect.mjs` folds project ledgers into `librarian/inbox.md` but has no
gate - nothing fails when a lead sits untriaged for a quarter, and nothing counts
the decline rate. If leads turn out to arrive faster than they are ruled on, the
answer is an age clause in `librarian/standard.md` (attention points for an
inbox line past N days), not a bigger inbox. Deferred until there is a real
arrival rate to measure: a threshold set before any data is a guess with a number
on it.

## 2.0 - 2026-08-27 - gravity (gravitone studio)

First run of the v2.0 loop, and the first full-coverage one: 13 contexts, 13/13
at 22/22 lenses, 13 fixes landed as atomic commits, 5 registry leads, 19
deviations logged across 22 subjects. Every fix carries a gate and a proven
fail-before. The repo arrived with a BLOCKING CI gate red on main and left green.

- **The loop's real payoff was lens coverage, not depth, and it is measurable.**
  The single most serious finding of the run - a server-side request forgery
  through a vendor-supplied image URL, proven by downloading the cloud metadata
  endpoint - came from `security-auditor` on a context that had been swept two
  days earlier by a `--optimize` pass and had never had that lens applied. The
  second most serious (an unbounded paid compute route) came from
  `risk-assessor`, also never applied there. Both contexts read as "already
  worked" by every other measure. **A context at 6/22 is not a swept context, and
  the ledger is the only thing that says so.**

- **The 5-item budget did what it was designed to do and cost nothing.** No round
  hit the cap; two rounds honestly returned zero built. Under v1.0's 30-item
  budget the first context would have consumed the session.

- **Three of thirteen rounds produced no fix, and two of those were right.**
  `research-step` and `shared-notebook` came back clean at this depth after two
  candidate races were traced and BOTH proved unreachable - mutually exclusive
  mount branches in one case, an internal catch in the other. The discipline that
  produced the clean verdict was checking reachability before writing the fix; on
  the second I had already drafted the hypothesis and it was wrong.

### The routing rules, measured

- **S auto-approval held.** Ten of thirteen fixes were S and none needed an ask.
  The execution-time demotion rule never fired, but the four VETOES fired
  constantly and are what made auto-approval safe.
- **Veto 3 (no gate that can verify it) is the one that earns its place.** It
  stopped a defensive fix to a path the UI prevents, and it is the reason two
  probes were rewritten rather than shipped: one asserted a *timing* property no
  return-value test can see, the other spent a real Claude run to prove a limit.
- **Veto 1 (outside the context boundary) fired six times in thirteen rounds,
  which is too many.** See the redesign proposal below.
- **The M rule was exercised exactly twice.** One cleared at 7/3 = 2.33 and was
  built (the SSRF); one landed at 5/3 = 1.67 in the ask band and was surfaced to
  the operator rather than guessed at. Two data points is not calibration, but
  the band did discriminate rather than collapsing to one side.

### The registry lane, measured

- **The read side changed the findings, not just the paperwork.** Naming the
  technique a finding violates makes it arrive with the fix already described,
  and twice it CHANGED THE VERDICT: the corpus already stated the focus-management
  rule and the "a second list is a copy that drifts" rule verbatim, so those
  rounds correctly filed no lead and recorded a deviation instead.
- **The four-bar gate refused more leads than it passed** - 5 filed against 13
  rounds - which is the intended ratio. The bar that did the work was "novel
  against the corpus", and it can only be applied by actually reading the
  technique: twice I expected novelty and found the rule already written.
- **A ledger nobody reads is theatre, so the collector had to exist.** It was
  also the run's own worst bug: `leads-collect.mjs` shipped non-idempotent and
  appended all five leads twice, because its dedup key was reconstructed from the
  row's columns and had to be kept in step with the renderer by hand. The exact
  hand-maintained-list failure four of the leads are about, in the script that
  carries them.

### Two method defects this run, both mine, both worth a rule

- **`cmd | tail && git commit` takes `tail`'s exit code.** I committed once on a
  RED typecheck because the pipe that was keeping output short also swallowed the
  failure, and section 7.2's "verify before committing" was defeated by the shell
  idiom I was verifying with. Caught, repaired, amended. **Assert the exit code of
  the gate itself (`npm run typecheck; echo $?`), never the exit code of whatever
  you piped it into.** Applied to SKILL.md in this change.

- **A shell heredoc silently corrupted a regex I was writing INTO a gate.**
  `\b` became a literal 0x08, so `/<BS>guardRequest/` matched nothing and all
  nine gated routes read as ungated. The gate could not fail, in the commit whose
  entire subject was a gate that could not fail. It was caught only because the
  count looked wrong (9 ungated out of 10) - a plausible-looking number would have
  shipped. **Never author a pattern through a heredoc; use the file-writing tool,
  and after any scripted edit assert the gate still detects a seeded violation.**
  Applied to SKILL.md in this change.

### Redesign proposal (not applied)

**Veto 1 is too blunt for a small, tightly-coupled repository.** Six of thirteen
rounds found something real whose fix touched a second context, and the method's
only answer is "emit it as a finding naming the foreign file". That was right
twice - the two repairs deferred to `script-step` landed properly in its own
round, with the boundary doing exactly its job. It was wrong the other four
times: a red CI gate, two gates missing from CI, and a delete dialog that folds
"could not read" into "holds nothing" all sat unfixed for a coordination benefit
that did not exist, because no parallel session was running.

The rule should key on the actual hazard rather than on the boundary. Something
like: a cross-context edit is permitted when (a) the sweep can name every context
it touches, (b) the change lands as ONE commit that says so, and (c) no other
session has declared those paths - which the fleet already has a ledger for. The
loop would then end with an explicit cross-context pass rather than a backlog of
items each blocked on a different round. Proposing rather than applying: it
weakens the one rule that makes parallel sweeps safe, and that trade needs the
operator's judgement, not mine.

## 2.1 - 2026-08-27 - gravity (yield audit of the run above)

The operator challenged the previous entry's numbers: 13 contexts, 22 lenses, 28
findings. The challenge was right and the cause was the method - specifically the
v2.0 rewrite recorded above, not the session that ran it.

**The measurement, same repository, a fortnight apart:**

| | lenses | findings/context | findings per LENS-PASS |
|---|---|---|---|
| v1.0 `--optimize` | 6 | 16.3 | **1.63** |
| v2.0 `--stabilize` | 22 | 2.2 | **0.098** |

A 17x collapse in yield per lens-pass, from 3.6x MORE lenses. And the diagnostic
that rules out "the codebase was clean": **0 of 13 rounds reached the 5-finding
cap.** A binding cap makes rounds cluster at the cap; these clustered at 1-3. The
budget was never the limit - it was the ANCHOR.

Two causes, both introduced by the v2.0 rewrite:

- **I deleted v1.0's yield floor.** It read "around 20 findings on a healthy
  context. Under ~10 usually means you stopped at the surface - dig again before
  declaring clean." I replaced it with "Under-filling the budget is fine and
  common on a healthy area; say so." That inverts the pressure from *you failed,
  look again* to *few is fine*, and nothing else in the method pushed back.

- **The budget and the package contradicted each other.** A 22-lens package
  against a 5-item budget is exhausted by lens three. The other nineteen had
  nowhere to put a finding, so they became coverage RECORDING - the ledger reads
  22/22 and the round reports a clean tail it never had room to hear. That is
  coverage theater, produced by the skill whose highest-value finding class is
  coverage theater, in the same file that teaches how to spot it.

**The root confusion, worth naming because it is easy to repeat: I tuned the
FINDING budget while reasoning about the WORK budget.** How much a round builds is
decided by the routing rules - S builds, M clears a ratio, L never does - not by
how many findings exist. Raising the finding budget raises the BACKLOG, which is
the artefact the operator triages, and leaves build volume exactly where routing
put it. Find generously, build conservatively; they are different dials.

**Rebalanced and then VALIDATED rather than asserted.** Budget 12/context (20 for
`--one`), per-tier allowances (deep 3, matched 2, tail 1), lifetime cap 40, and
the floor restored with counter-pressure: under 6 is a signal about the PASS, not
the codebase, and a genuinely clean round must now state what it read and which
hypotheses it traced. Re-swept one context that had returned 2 findings / 0
fixed: **6 findings and 2 fixes from two of its fifteen files.** Both fixes were
real - colliding render ids from a stale-closure counter, and a documented
"caller revokes when done" contract that no caller in the repository had ever
honoured.

**The re-sweep also found the previous run's most embarrassing miss.** A repo-wide
grep in round 6 had already PRINTED the colliding-id site; I read the `set*`
updaters on the two lines it showed, saw they used their arguments correctly, and
moved on without reading the line above them where the id was being taken from
render state. The grep did its job. The budget had nowhere to put another finding
and the anchor said the round was done.

### Three more ways a verification step passed while verifying nothing

All three were mine, all three in this session, all three now in SKILL.md:

- **`; echo "TC=$?"` reports a red gate and commits anyway.** I had already fixed
  the `| tail` variant in v2.1 and then wrote the printing variant, which is the
  same failure wearing the fix's clothes. *Reading* an exit code is not asserting
  it. Only `&&`-chaining is.
- **A whole-tree gate under a concurrent session is not a verdict on you.** A
  sibling agent mid-write made `tsc` red; the failing path was theirs and I
  committed into a red tree without checking whose it was. The parallel-session
  rules covered STAGING and stopped there. Verification has the same hazard and
  is easier to miss, because the output looks like it is about you.
- **A source-scanning gate matched its own comment.** The probe for the blob-URL
  contract passed against a deliberately broken subject because
  "revokeObjectURL" survived in the prose describing the fix. Strip comments
  before matching. Notably I had applied exactly this in round 1 and did not
  carry it forward - and the fail-before is the only step that caught it, both
  times.
