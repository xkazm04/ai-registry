---
source: repository
url: https://github.com/onecli/onecli
title: "onecli - the agent harness built for teams"
author: onecli (open source, Apache-2.0 + ee/)
kind: practitioner-codebase
mined_on: 2026-08-22
commit: ff7a192
words: n/a (tree, not transcript)
skill_version: 0.6.0
extracted: 10
picked: 9
accepted: 7
already_covered: 3
declined: 0
leads: 0
untriaged: 1
dispatched: 0
---

# onecli, 2026-08-22 - a practitioner codebase, and the run's richest class

Ninth run, and a new source class: the **practitioner codebase** - a public
tree cloned and read, not a transcript. Its defining property: it is the one
class that can *authorize applications* (`verified_on` / a cited commit),
because the corroboration IS the reading. Its second property: the tree's
comments state failure modes with a candor talks never reach ("four of the
six had silently rotted"; "produces a sandbox that runs but can never
report"). Mine the comments' *reasons*, not just the code's shapes.

The operator picked all rows except the confirmation sweep (#10). Every
accepted finding is cited against commit `ff7a192`.

## Accepted

### 1+3 - The outbound compute plane -> `fleet-orchestration/outbound-compute-plane` (new technique)

The runner: long-poll is the only clock, no inbound ports, no tunnel, no TLS
story; NAT/laptop/VPC parity; the runner never touches the database (api =
the one door); dev relaxation (`RUNNER_NETWORK_INTERNAL=false`) explicitly
labeled development-only. Candidate 3 (single-use bootstrap token per spawn,
`ws/server.ts:17,36,55`) folded in as the auth section, with the
replace-not-restart consequence (`runner.ts:277-295`) - a spent token means
every start replaces the container. Boundary to `security/device-pairing`
stated, not duplicated.

### 2 - Substrate reconciliation -> `fleet-orchestration/substrate-reconciliation` (new technique + application)

"Reconcile is the truth (and the teardown path)" - deletion reaches compute
by convergence, not command; crash-safe by construction. The fence stack from
`runner.ts:737-840` became the technique's decision rules: authority first /
abort-on-partial-answer, the installation fingerprint fence, never delete the
unidentifiable, grace window, reap kill-switch. Application
`node--substrate-reconciliation` written against the tree (verified_on
2026-08-22).

### 4 - Substrate seam + fake -> catch, repaid as `module-design/applications/node--seams-and-adapters`

`seams-and-adapters` already owns the idea completely ("nothing else in the
system names the outside thing at all" = "docker/ is the only place a
container runtime is named"). Landed as an application instead: two seams at
two altitudes (SandboxBackend + the vendor-neutral harness), with the
conformance-suite-includes-the-fake discipline as the "double checked against
the same contract" made mechanical.

### 5 - Provision before you degrade -> `optional-dependency-degradation` (amendment)

The dev launcher (`scripts/dev.mjs`) generates every missing secret into the
operator's `.env`, never overwriting a set value, and offers the expensive
one-time image build at the point of need with a viable decline path. The
subject's fallback ladder had no rung for "mint the value"; added as the top
rung, with the offer-at-point-of-need sibling rule.

### 7 - Unexercised verifiers -> `dead-code/instrument-per-orphan-class` (amendment)

New orphan class. Evidence from the runner README: the hand-run `dev/*.sh`
proof scripts were removed because "nothing ran them, so four of the six had
silently rotted - the automated suite is the only form of this worth
keeping." The class inverts carrying cost: a dead check reads as coverage.
Repair rule: wire it into a lane something runs, or delete it.

### 8 - Mid-turn steering -> `streaming-output/mid-turn-steering` (new technique)

Better in the code than in the marketing: `harness.ts` declares `steer` as a
capability (never probed), the control plane owns the queue-only degrade, the
contract REFUSES between turns (never queues quietly - the double-delivery
trap), and the join is observable (`message.joined` before the turn's
terminal event). Home contested (input to a live turn vs output rendering);
placed beside `cancellation-and-finalization` as its constructive sibling -
the subject's stated job is not lying about the live turn's state, and the
join event is exactly that.

## Already covered

- **3 standalone** (bootstrap pairing) - `device-pairing` + `credential-vault/acquisition`
  own the human and vault halves; the machine-spawn half folded into finding 1.
- **4 as a technique** - `module-design/seams-and-adapters` says it all; see above.
- **6 - migrations one-shot pinned with code** - `data-layer/migrations` GP owns
  unattended boot migration + refuse-to-open-on-newer; `error-propagation` owns
  the boot contract. onecli's compose shape (one-shot migrations image pinned by
  the same version var, api waits on it) is a deployment instance, not a gap.

## Untriaged

| # | Title | Anchor | My read |
| --- | --- | --- | --- |
| 10 | Confirmation sweep: gateway injection vs `brokered-egress`, in-chat approvals vs `hitl-approval`, version pinning vs release discipline | gateway/src, approval.rs | likely catches; operator descoped the sweep - cheap to run in a later pass if a citation is ever needed |

## Cross-references

- Subject notes: [[../subjects/software-engineering/fleet-orchestration]],
  [[../subjects/software-engineering/streaming-output]],
  [[../subjects/software-engineering/optional-dependency-degradation]],
  [[../subjects/software-engineering/dead-code]],
  [[../subjects/software-engineering/module-design]]
- The agent-memory lead from [[2026-08-22-shapes-of-agent-memory]] (trained
  memory-use) is untouched by this tree: onecli's agent memory is platform-kept
  files, the frozen-reader shape.
