---
layer: application
type: application
subject: live-response-latency-budgeting
technique: latency-class-per-role
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Rust: a role route table, measured against a night tournament

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 4025231) is an AI-run villain
livestream whose host, Malakor, is a Rust "brain" calling models through a
role-routed engine. This application reads its route table against the
[latency-class-per-role](../techniques/latency-class-per-role.md) technique,
and reads the night tournament (night tournament night-0dd890a1ad, n as
stated, 2026-10-18) as the measurement the technique says a tier must be
admitted on. The toolchain is pinned in `rust-toolchain.toml` at 1.97.1.

## The route table: tier, effort and timeout move together

The engine routes every role through one function, and each row binds a tier,
an effort and a timeout together, which is the shape the technique asks for:

- `crates/shadowrunr-engine/src/config.rs:9 "Default routing per role: (tier, effort, timeout_ms)"`
- `crates/shadowrunr-engine/src/config.rs:13 "Role::CoreThread => (ModelTier::Haiku, Effort::Low, 30_000)"`
- `crates/shadowrunr-engine/src/config.rs:15 "Role::Planner => (ModelTier::Sonnet, Effort::Medium, 120_000)"`
- `crates/shadowrunr-engine/src/config.rs:19 "Role::Judge => (ModelTier::Sonnet, Effort::Medium, 600_000)"`

Confirmed: the live voice (`CoreThread`) runs the small tier at low effort,
the slow roles (planner, researcher, consolidator) run the mid tier with
minutes of timeout, and the offline judge gets ten minutes. The spread of
timeouts, from 20 s for the picker to 600 s for the judge and reconciler,
is the two-orders-of-magnitude spread the technique describes. The research
doc behind the design states the reasoning-off rule for the live lane:
`docs/research/03-llm-orchestration.md:117 "The fast lane can meet the budget only when thinking is off."`

**Deviation: the class is implicit.** There is no latency-class field; a
reader infers the class from the timeout. The comment on the table admits the
rows are not measured: `crates/shadowrunr-engine/src/config.rs:10 "core-thread entry; everything else is a starting point."`
The standard stands: every route declares its class, and the timeout derives
from it.

**Deviation: the live timeout sits outside the silence ceiling.** The core
thread may run 30 s before it times out, while the show's own rubric fails a
stretch with no chat if the host is quiet for more than 20 s of stream time:
`sim/rubric.toml:79 "goes quiet for more than 20 seconds of stream time"`.
A core call that runs to its timeout has therefore already breached the
ceiling. The technique's rule is that a live role's timeout sits inside the
silence ceiling; here it sits half again outside it.

**Deviation: the first-word budget is design, not code.** The 2–4 s budget
to the first spoken word is a research estimate:
`docs/research/03-llm-orchestration.md:115 "Can the stack meet a 2–4 s budget?"`.
No controller enforces it. The engine records a per-call first-text time
(`crates/shadowrunr-engine/src/ledger.rs:20 "pub first_text_ms: Option<u64>,"`),
which is the instrument such a controller would need, but the beat loop runs
on a 5 s tick in simulation (`crates/shadowrunr-daemon/src/config.rs:100 "tick_s: 5,"`),
a scheduling wait the research budget books at 0–500 ms.

## The tournament: the median chose wrong

The night tournament ran 120 planned ten-minute simulated streams on a 5 s
tick, with the small tier (n=60) and the mid tier (n=59) as the core, and a
separate five-run slice with the large tier as core (judged by a different
tier, so not directly comparable). Per core tier:

| | small (n=60) | mid (n=59) | large (n=5) |
|---|---|---|---|
| core p50 / p95 latency | 1.37 s / 5.1 s | 1.74 s / 4.2 s | 3.0 s / 5.8 s |
| max say gap seen | 20 s | 10 s | 5 s |
| pacing / no dead air (judge) | 93% | 100% | - |

The small tier, the table's current default for the live voice, posted the
best median and the worst tail of the two comparable tiers, and the longest
silence. The mid tier was slower at the median and faster at p95, and never
went past half the small tier's longest gap. This is the **upward lesson**
the technique now carries: admit a tier to the live voice on its high
percentile and its longest silence, never its median. The cost column cuts
the other way (API-equivalent cost per ten-minute run, core only: $0.75
small, $15.37 mid), which is why the choice belongs to cost per usable minute
of show and not per call; the tournament did not measure usable minutes
directly, so the route stays a decision for the owner.

The silence figure comes from the simulation's own gap measure:
`crates/shadowrunr-sim/src/runner.rs:185 "Longest stretch of stream time without a Malakor line, seconds."`
It is quantised to the 5 s tick, so 20 s, 10 s and 5 s are four, two and one
silent beats; and the loop advances one tick per beat however long the call
took (`crates/shadowrunr-sim/src/runner.rs:529 "t += tick_s;"`), so these
gaps are silences the host chose or errored into, not silences its latency
caused. Both points went into the say-gap technique as measurement traps.

## The judge: an offline role sized too close to its tail

The judge, the large tier in the tournament, took p50 381 s and p95 502 s per
ten-minute transcript against its 600 s timeout, and one transcript never
finished: its judge call timed out four times and the run was left
`judge_pending` (119 of 120 judged). A timeout a fifth above the measured p95
lost the longest job. **Upward lesson**, now in the technique: headroom must
cover the longest inputs, and an offline timeout is a pending result, never a
verdict. The harness got the second half right; it recorded the run as
pending rather than scoring it.
