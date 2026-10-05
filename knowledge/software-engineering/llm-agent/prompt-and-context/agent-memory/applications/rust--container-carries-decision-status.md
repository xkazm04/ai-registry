---
layer: application
type: application
subject: agent-memory
technique: container-carries-decision-status
stack: rust
verified_on: 2026-10-05
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The container rule in the companion's nightly compress prompt (Rust)

The witness for `rust@1.96.1` is the repository's `rust-toolchain.toml`
channel pin. The seam is the COMPRESS phase of the companion's sleep cycle.
`build_compress_prompt` starts at
`src-tauri/src/companion/brain/sleep_cycle/prompts.rs:45 "pub(super) fn build_compress_prompt("`.
Its numbered rules sit after
`src-tauri/src/companion/brain/sleep_cycle/prompts.rs:65 "RULES — non-negotiable"`.
The pass runs on the aside tier,
`src-tauri/src/companion/model_routing.rs:33 "pub const ASIDE: TurnTier"`,
which is a mid-tier model at medium effort. It reads conversation only, so
anything an operator pastes into a chat (meeting bullets, a planning list)
reaches the extractor as conversation.

As shipped, rule 2 named "decisions, project state" among the facts to
keep, and rule 6 set confidence at "0.9+ for something stated directly".
Nothing said where a decision's status comes from.

## Arms and fixtures

The prompt was rebuilt outside the app with the same text, an empty tag
vocabulary and the same fence. It was run headless on the routed model at
medium effort. One variable per arm:

- **A**: the prompt as shipped.
- **B**: A plus a sentence-level rule: an idea, a suggestion or a "maybe" is
  not a decision, and a rejected option is recorded as rejected.
- **C**: B plus the container rule.
- **D**: A plus the container rule alone. This is what shipped.

Three fixtures, all invented. The first two hold explicit hedges in the
sentence beside settled facts and two "considered X, chose Y" items. The
third is four planning-session bullets pasted with no hedge, a draft change
and a merged change named in one sentence, a later "already making mockups"
reference, and a published release note.

**Target**: bullets written as decided or planned state, with no
"not stated" or undecided marker. **Floor**: the settled items still emitted
as facts, with no loss across arms.

| arm | hedged fixtures, hardened | planning bullets, hardened (3 draws) | settled items kept |
| --- | --- | --- | --- |
| A | 0 of 30 | **12 of 12**, at 0.85-0.9 | 20/21 + 9/9 |
| B | 0 of 30 | **12 of 12** | 21/21 + 9/9 |
| C | 0 (1 draw each) | **0 of 12** | 7/7 + 9/9 |
| D | 0 (1 draw each) | **0 of 12** | 7/7 + 9/9 |

The seam was chosen to falsify. Fixtures one and two test the technique's
obvious form, a modality rule over sentences. A caught result there would
have meant the shipped prompt already had the failure and any rule fixes
it. It came back clean on A. That refuted the claim that this extractor
turns a hedged sentence into a decision, and moved the technique onto the
container. Fixture three is where the failure lives. There, B (the
sentence rule) changed nothing.

One residue under D: in one draw a bullet came out as "planned to be renamed
... decision status not otherwise stated", at 0.6. That is a planning verb
with the status marker present. It is counted as held, and it is the
nearest miss.

## What shipped

Rule 2c in
`src-tauri/src/companion/brain/sleep_cycle/prompts.rs:80 "2c. A decision needs evidence that SAYS it was decided"`.
The text is byte-identical to arm D's rule. It was labelled 2d in the
experiment, where it followed B's rule.

## What this realization cannot do

- **It is a prompt rule, not an admission field.** Conversation has no
  lifecycle state, so rule 1 of the technique (admit by field, in code) has
  no seam here. A future ingest of tickets or change requests into this
  store should carry their state as a field and not rely on 2c.
- **It does not check its own output.** A lexical post-check (flag a
  "decided" claim whose cited episode has no decision word) would have
  caught 23 of the 24 A and B hardenings. Nothing in the apply path runs
  one.
- **The manual consolidation pass has its own rules block** at
  `src-tauri/src/companion/brain/consolidation.rs:1179 "RULES — non-negotiable"`
  and did not get 2c. It reads the same conversation, so the same container
  case reaches it unmeasured.
- **Volume.** Under the container rule, open items come out as facts that
  carry their status. On the hedged fixtures, facts per pass went from 3.8
  to 7.5 (one draw for D). The store's decay and pressure gates bound that
  growth, but no open item gets a revisit date.
