---
layer: application
type: application
subject: mcp-tools
technique: budgeted-partial-response
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# The envelope is built; the empty success survives (cass)

The tree is cass (coding_agent_session_search), a Rust CLI and MCP server that
indexes local coding-agent transcripts and answers agents through a `--robot`
JSON surface. Read at commit `7fc01958d367`. The stack version is the toolchain pin (nightly 2026-08-31, written as a dotted date); the crate version is
`Cargo.toml:3 "version"` (0.10.0), and the toolchain pin lives in
`rust-toolchain.toml`, which names no release number. Nothing was
executed; every claim below is a read of the cited line.

This tree is the source the technique was taken from, so the useful question is
not whether it matches but where its shape outruns or undercuts the rule written
from it. The short answer: every mechanism in the envelope section is present and
carefully built, and the exit-status rule, the one the technique adds, is still
broken on the default search path.

## What the tree gets right, clause by clause

- **Shed before the deadline.** One pure function maps elapsed and total to three
  phases, with the shedding threshold at four fifths of the budget
  (`src/robot_budget_envelope.rs:34 "NEAR_LIMIT_FRACTION: f64 = 0.8"`). Because the
  decision is a function of two integers, it is testable without a clock, which is
  how the technique's "inject a clock" test becomes cheap.
- **One clock sample per decision.** The snapshot type exists because a second
  reading after a scheduler pause once reported a near-limit decision as an
  exhausted one (`src/robot_budget_envelope.rs:88 "Re-reading the live clock can otherwise make"`).
  The serialized block derives its timeout flag from the same sample
  (`src/robot_budget_envelope.rs:246 "is sampled once and the timeout decision is derived from"`).
  This is the technique's single-sample rule, and the scar it came from.
- **Unknown is null, marked uninspected.** When triage runs out of time, every
  section it skipped is emitted with null values and an explicit uninspected marker
  and a sentence saying why
  (`src/lib.rs:86934 "Detailed index readiness was skipped because the triage execution budget"`;
  `src/lib.rs:87057 "was not inspected before the triage budget expired"`), and the
  top-level status reads partial with a stated reason
  (`src/lib.rs:87336 "Readiness probes did not complete within the triage execution budget."`).
- **The probe differs from the call that failed.** Triage's recovery command keeps
  the scope and multiplies the budget by four with a one-minute floor
  (`src/lib.rs:87034 "budget.total_ms().saturating_mul(4).max(60_000)"`), and the
  recommendation carries a run condition and a success signal an agent can test
  (`src/lib.rs:87082 "Run when triage budget.skipped_sections is non-empty."`). The
  search retry doubles the budget inside a one-second to five-minute band
  (`src/lib.rs:31147 ".saturating_mul(2)"`, `src/lib.rs:31148 ".clamp(1_000, 300_000)"`).
- **Skipped sections are named in the tool's own vocabulary.** The search path
  alone pushes about a dozen distinct section names (refresh, search,
  semantic_setup, semantic_refinement, reranking, aggregations, trust_correlation),
  each at the point where it was shed, for example
  `src/lib.rs:32718 "empty_search_result()"` right after the search section is
  recorded as skipped.

## Where the shape undercuts the rule

**The empty success is the documented contract.** The agent guide tells callers
that an expired search or pack exits 0 with an empty hit list and a flag in the body
(`docs/ROBOT_MODE.md:20 "an expired search or pack exits 0 with"`). The code that
writes it builds the payload with an empty hit list and a match total of zero
(`src/lib.rs:31206 "let mut payload = serde_json::json!({"` and the two lines that
follow). The tree knows the hazard: it adds a stderr note precisely because a caller
that checks only the exit status reads the empty list as no matches
(`src/lib.rs:31224 "a caller that checks only the exit"`;
`src/lib.rs:31230 "the empty hit list is"`). A note on the diagnostics stream is a
mitigation for a human reader, not a status an agent's harness branches on.

**The fix was applied per mode and per format, never per class.** Explicit semantic
search was moved to a retryable timeout exit after callers misread the empty
envelope (`CHANGELOG.md:815 "instead of exiting 0 with an empty semantic envelope"`),
while hybrid and lexical keep the exit-0 shape
(`CHANGELOG.md:816 "Hybrid searches still demote to lexical with"`). The
sessions output format of the same search already raises a typed timeout error
with code 10 (`src/lib.rs:31186 "matches!(format, RobotFormat::Sessions)"`;
`src/lib.rs:31198 "code: 10,"`) while the JSON format of the same search exits 0.
So one search, timed out the same way, carries a failure status or a success
status depending on the output format the caller chose. That is the technique's
"the contract says which of the two a caller will see, per call" rule broken along
an axis the technique did not name: the format, not the call.

**A timed-out zero is a count without its predicate.** The partial payload reports
a match total of zero beside the empty list. Under the technique's count rule the
honest values are null or a lower bound; the tree does mark lower bounds elsewhere
(see the cursor manifest in the ranking-budgets application of this tree), but not
on this path.

**The three-state outcome was built and not adopted.** The module defines a full
envelope with complete, partial and timed-out outcomes
(`src/robot_budget_envelope.rs:211 "pub enum BudgetOutcome"`), and its header says
wiring the surfaces to it is remaining work
(`src/robot_budget_envelope.rs:22 "Wiring each surface to populate and emit this envelope"`).
A grep of `src/` and `tests/` finds no use of that envelope or outcome type outside
its own module; the robot surfaces (search, pack, triage, follow-up reads) embed the
smaller block instead
(`src/robot_budget_envelope.rs:228 "pub struct BudgetBlock"`), which carries a
timeout boolean and the skipped list but no outcome field
(`src/robot_budget_envelope.rs:234 "pub timed_out: bool,"`). A caller therefore
infers "partial" from a non-empty skipped list with the flag false. It works, but it
is an inference the technique's envelope was designed to make unnecessary.

**One path rewrites the sample it reports.** The early-timeout search output raises
the reported elapsed time to at least the budget and forces the flag true
(`src/lib.rs:31183 "budget_block.elapsed_ms.max(budget_block.budget_ms)"`;
`src/lib.rs:31184 "budget_block.timed_out = true;"`). The intent is consistency
(a worker gave up, so the block must not say otherwise), but it is a patch on the
sample rather than the sample, the one place the single-reading discipline is
traded away.

## What the realization cannot do

- **Name a probe when the input cannot be replayed.** A search fed from standard
  input returns no retry command at all
  (`src/lib.rs:31119 "if sessions_from == Some("`). The technique's reading applies:
  a section with no recovery probe is one the tool should not shed; it should refuse
  with a retryable status instead.
- **Hold its contract on a loaded host.** The wall-clock contract tests failed on
  I/O-saturated gate hosts at the release commit and passed on some isolated reruns
  (`CHANGELOG.md:808 "failed on I/O-saturated gate hosts at the release commit"`).
  This is the technique's closing warning observed in the source: the budget tests
  that matter are the ones run under load, and here they are the ones that flaked.

## What the tree's shape says about the technique

It confirms every construction rule: the shedding fraction, the single sample, the
null-and-uninspected section, the differing probe. It refines one: the recovery
probe needs a fallback for inputs that cannot be replayed, which the tree handles by
emitting nothing. And it is the worked counter-example for the exit-status rule. A
team that built the envelope this carefully still shipped empty success on its
default path, fixed it for one mode after a misread, and left the exit status a
function of the output format. Envelope quality does not substitute for the status
rule; the status rule has to be stated for the class or it gets fixed one instance
at a time.
