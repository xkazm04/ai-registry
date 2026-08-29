---
source: web:github.com/SenteLabsAI/OpenExecutive
kind: vendor repository (open tree - the class archetype's engine is closed; this one's is not)
url: https://github.com/SenteLabsAI/OpenExecutive
title: "OpenExecutive - AI-powered virtual executive team"
author: SenteLabsAI
words: 2723 (landing page) / ~1950 (in-tree operating docs) / 894 tracked files
extracted: 14
accepted: 5
declined: 0
leads: 4
already_covered: 0
untriaged: 5
dispatched: 0
cross_repo: 1 consumer changed, 1 application extended
---

# OpenExecutive - the repository whose prose states absolutes its own code
# knowingly breaks

Part of [[index]].

## The class reading, and why it beat its own row

Named **vendor repository** at Phase 2: a company's repo for a product whose engine is a
hosted service. The class entry says read it as three sources wearing one name - a
marketing surface authoritative for nothing, a stated-production-rules page that is a
genuine first-party document, and the types of whatever open client renders the closed
engine - and it predicts a moderate yield of amendments.

The prediction held on structure and broke on volume, for one reason worth writing into
the class entry. **The archetype's engine is closed, which is why the class entry sends
you hunting for the data model in a client's types.** Here the engine is hosted but the
entire application tree is open, so the "stated production rules" third is not a page,
it is nine hundred files - and the run's whole yield came from reading the code that
implements the README's claims rather than from any document.

The generalisation is the useful half: **for this class, ask what fraction of the
product is in the tree, not whether the engine is.** A hosted engine with a closed client
gives you one types file; a hosted engine with an open client gives you every operating
rule the team learned, annotated in comments nobody wrote for an audience.

Expected yield was stated as 2-3 landings before the table. Landed 3 documents from 5
candidates. **0 of 3 fetches spent** - seventh consecutive zero-fetch run for a source
carrying its own primary material; the shallow clone was the extraction.

## The property that produced every landing

Three of the five accepted candidates have the same shape, and it is a shape worth
hunting for by name in any open tree:

> **The prose states an absolute rule. The code knowingly violates it, for a stated and
> correct reason. The prose never names the reason.**

- The README, both environment configs and the architecture document all say the
  deployment must run one instance *because of the claim*. The comment beside the claim
  says the claim is safe across processes. The line that actually forces it is an
  unconditional requeue in a startup path, named nowhere.
- The contributor guide says *never put dynamic content in a cached block*. The cache
  builder puts two computed values in the cached block and justifies each in a comment -
  *process-stable, so cache stays valid*. That comment is the real rule; the guide's
  version is a slogan that bans the safe case and permits the dangerous one.

This is the documented "a source that is contradicted is the best case" pattern arriving
from inside a single source. It is cheaper here than in the usual form: no fetch is
needed to adjudicate, because both halves ship in the same tree and the code wins by
construction. **When an open tree carries both a rulebook and the code that breaks it,
diff them first** - the delta is pre-filtered to the rules the team found too simple to
follow, which is exactly the population a mature corpus has not already absorbed.

## Candidates

### 1. Recovery sweep, not the claim, sets the executor ceiling - ACCEPTED

Anchor: `scheduler/runner.py:4` - *"uses an UPDATE … RETURNING claim to prevent
double-firing within a process, but the startup `requeue_orphaned_running` sweep assumes
a single scheduler worker"*; the sweep itself is an unconditional
`UPDATE … SET status='pending' WHERE status='running'` with no holder and no lease.

Prior art `job-coordination/terminal-state-recovery` is thorough and already names the
blanket sweep as an anti-pattern - four verdicts, evidence requirements, registry
reconciliation, lineage. **It frames the sweep entirely as verdict correctness and never
states its deployment consequence**, and neither does `lease-renewal`; a grep for
instance/scale/horizontal across both files returns two incidental matches. That is the
asymmetry: a subject that models process death in five techniques, silent on the one
number process death decides.

Landed as an amendment, not a technique - the material hangs off the existing verdict
table and the `adopt` verdict is already defined in the terms the fix needs.
`gate-sees-target` (the sweep reads state as a proxy for executor liveness, and they
diverge exactly when a second executor exists) and `unknown-is-not-a-value` (a running
row with no lease is an absence of evidence; the requeue converts it to a definite
*abandoned*) both fit without stretching.

The misattribution is the reusable half and is written into the section: the claim is
the interesting primitive, so it collects the comment, the design note and the
deployment paragraph - and therefore the blame. The diagnostic is one read of what the
sweep's condition examines.

### 2+3. Cache breakpoint allocation, and the wrong discriminator - ACCEPTED as one

Anchors: `prompts/cache_manager.py:27` - *"max 2 blocks, total cache_control budget ≤ 2
here so that the caller's tool block + message cache stay within the API limit of 4"*;
two merge decisions each justified in a comment (*"as stable as the persona (a
constant)"*, *"both change on the same cadence (session/hour) so sharing a breakpoint
costs nothing"*); and against those, the contributor guide's *"Never put dynamic content
in system prompt blocks that have cache_control"* beside `tz` and `exec_email` sitting in
the cached block under *"process-stable, so cache stays valid"*.

Three files in the corpus surround this and none owns it. `layered-composition` orders
layers by volatility and stops at **one implicit boundary** - everything upstream of the
first volatile byte - which is the right model only for a provider that infers one.
`context-budgeting` prices compression against cache state. `model-routing/cache-continuity`
prices tier switches against the prefix treated as a single monolithic asset. The missing
stage is the cut itself: that declared cut points are a **scarce request-wide budget**
shared with tool declarations and message history, that each carries its own lifetime,
and that allocating them is a decision with a rule.

Landed as new technique `cache-breakpoint-allocation` (10th in the subject), registered
bidirectionally. It absorbs candidate 3 rather than banking it separately - the two are
one finding, since the merge rule and the admission rule are the same question asked
about a block's boundary and its contents. The golden path's layer table already carries
a *Changes* column; the technique names it as the allocation map and says cut where that
column changes value, not where the topic does.

Second-order catch worth recording: the README advertises *"up to 85% cache hit rate
after the first few turns"*, which is a count with its predicate removed - the most
favourable population available, excluding every cold start and every fan-out call. Went
into the technique's closing section as a caution under `count-carries-predicate` rather
than as a cited number.

### 4+5. Egress argument gating - ACCEPTED as one

Anchors: `orchestrator/mcp_gateway.py:145` - *"we do not know every grantee field name
across workspace-mcp versions, so the gate scans all string values rather than an
allow-list of keys - every email-like token found must resolve to the roster (fail closed
on the unknown)"*; `:105` - *"a tool that models 'anyone with link' as a boolean/int flag
would slip past it"*; `:92` - *"grant access to a population rather than a single
addressable person - these bypass the per-recipient roster model entirely"*.

The asymmetry hunt found this one. `mcp-tools/authentication-and-scoping` models the
inbound question in full; egress gets **one bullet** in `untrusted-result-handling` -
*constrain which tools can move data out* - which is a policy, not a mechanism. Both
files "cover" the seam and only opening both shows one has a model and the other a
sentence. `security/credential-vault/brokered-egress` is a different concern (whether the
caller may hold the secret, not who may receive the resource) and is not a duplicate.

Landed as new technique `egress-argument-gating` (8th in the subject). Four things the
gateway demonstrates that the one-bullet version cannot:

- **Two orthogonal scans, each blind where the other sees.** Value-shaped survives
  unknown field names; key-shaped survives non-string capabilities. The gateway writes
  its own residual hole down - a novel key name carrying a non-string value - which is
  the practice the technique adopts, because a gate whose limits are unstated reads as
  total.
- **Strategy is chosen by whether the argument surface is enumerable**, and both
  strategies appear in one file: mail gets a *key* allow-list (unknown key rejected,
  because that is where a recipient smuggles in via a raw blob or custom headers), file
  sharing gets the value scan. The discriminator is stated in the code.
- **A principal allow-list cannot express a population** - candidate 5, and the sharpest
  sentence in the repository. A roster answers *is this person permitted*; a
  share-to-anyone has no principal, so the check finds nothing to reject and returns
  allowed. The widest possible grant passes cleanly through a well-formed check that was
  asked the wrong question. Refused categorically by a rule that runs *before* the
  allow-list, never as a case inside it.
- **The gate is directional.** Turning link sharing off is permitted; only widening
  trips it. A gate that refuses the operation blocks the remediation as firmly as the
  breach.

Candidate 5 folded in rather than banking separately, per the standing critique that
synthesis comes from the skill: it is the boundary of the allow-list model, which is the
subject of the same document.

## Leads

- **Non-negotiable segments compose outside the user-overridable region** (candidate 6).
  A user-editable persona with an identity block appended *after* the override so a
  custom prompt cannot silently drop it, and a placeholder substitution that degrades to
  append rather than to a no-op when the user has deleted the placeholder. Sits between
  `layered-composition` (owned sections) and `variable-interpolation` (a missing variable
  is a loud failure) and may be a seam rather than a technique. **Return when a second
  independent source ships a user-editable system prompt with mandatory segments**, or
  when a connected project grows one.
- **Tool-server process topology follows tenancy cardinality** (candidate 8). Co-locating
  a tool server as a child process rather than a separate service, argued from the
  product being single-tenant - *one install = one company = one account* - so the server
  is inherently one-per-install. Adjacent to `mcp-tools/transport-selection`. **Return
  when a second source argues topology from cardinality**; one instance is a habit, two
  is a rule.
- **A provider abstraction must auto-disable non-portable features** (candidate 9).
  Server-side search, prompt caching and extended thinking are automatically disabled for
  local models rather than documented as unsupported. Reads like a case of
  `absent-guard-is-loud` inverted - the capability, not the guard, is what must not
  default silently. Nearest home `model-routing/capability-floors`. **Return when a
  connected project routes across providers with unequal capability sets.**
- **An agent must never sign as a human on its own roster** (candidate 13). A standing
  prompt rule forbidding the agent from authoring under any named person's name, with
  the third-person substitution and the escalation path written into it. Distinct from
  impersonation-of-the-user; this is impersonation of a third party the agent has a
  roster entry for. **Return when a second source carries an agent that acts on behalf of
  an organisation rather than a user.**

## Untriaged

Extracted, reached the table, never picked. Nobody verified these and they carry no
judgment - recorded with anchors so a later run does not re-derive them.

| # | Candidate | Anchor | My unverified read |
| --- | --- | --- | --- |
| 7 | Modifying a documented topic has no forcing function; adding one does | CLAUDE.md *"new behavior added under an existing topic … nothing forces an update, so the page silently goes stale"* | likely catch - `docs-sync` is 9 techniques, and `source-doc-mapping`'s use_when already carries "choosing what change altitude dismisses each surface" |
| 10 | An ambient auth env var in the dev shell diverges tests from CI | CLAUDE.md *"if BACKEND_SHARED_SECRET is set in your shell … tests return 401 … CI does not set it"* | likely catch against `test-harness/isolation-lanes` |
| 11 | Twin environments differ only in name, secrets and deploy trigger | deployment.md *"byte-for-byte the same images as dev"* | likely catch - `deployment-contract/environment-promotion`, a subject a parallel session created the same day |
| 12 | An LLM-generated documentation page retired for hand-authored static content | CLAUDE.md *"no longer fed to a runtime generator … nothing on this path calls an LLM"* | thin, but a currency signal about a genre: the generated-docs feature retired by the team that shipped it |
| 14 | The one self-terminating kind among chain-forever recurring actions | prebuilt/scheduler.json *"the one self-terminating recurring action (every other recurring kind chains forever)"* | thin; `job-coordination` neighbourhood |

## Declines

None. Nothing reached the table and was rejected on the merits; the five rows above went
unpicked, which is a different fact.

## Method notes

- **The class's fetch prediction held for the wrong reason.** The class entry says
  vendor repositories may need a fetch because the engine is closed. Here the fetch was
  unnecessary because the tree was open - same outcome, opposite cause. The
  open-tree/closed-tree split is the variable the entry should carry.
- **`research-map` behaved well and was still not the instrument that found anything.**
  All three landings came from opening the top prior-art file and asking what it does
  *not* measure. The map put the run in three correct neighbourhoods in one call; every
  finding was one level below what a slug can express.
- **The near-empty rule fired again in its asymmetry form.** `egress allowlist` returned
  7 weak subject matches, semantically unrelated - and the answer was neither a hole nor
  a duplicate but a subject where the inbound half is modelled and the outbound half is a
  sentence.
- The landing-page ingest returned 2,723 words and predicted almost none of the yield.
  Seventh run confirming `--min-words` answers "is anything there at all" and nothing
  more.


## Cross-repo lane (2026-08-28)

Run on the operator's instruction to assess impact and execute where a project
could benefit. Seven consumer trees resolved from the bridge and scanned.

**Finding 2 has no consumer.** Not one tree in the fleet declares a cache
breakpoint - the scan for the construct returned zero across all seven. The
technique lands as a standard with no application, which is the honest outcome
and is recorded here so a later run does not re-scan for it.

**Finding 3 has no consumer either.** No tree gates outbound tool arguments;
the allow-list hits were unrelated.

**Finding 1 had a consumer, and it was the best case.** A `rust` tree already
carried an application for this exact technique, so the finding could be tested
against a document written before it existed. It confirmed, and sharpened the
amendment: the consumer has no claim to misattribute the constraint to, so the
executor ceiling is written down nowhere - it survives only as a premise in a
comment that a later module falsified. Detail in the subject note; the
structural argument is in the application.

The consumer change is committed locally and **not pushed**, with the
verification gap stated in its commit message: the tree's build fails on this
machine before the compiler runs, and that was confirmed pre-existing by
reverting the three files and reproducing the identical failure. The change
parses and is rustfmt-clean; its types are unverified. Said plainly rather than
quietly, because an application whose consumer half was never compiled is a
claim about intent, not about a running system.

Method note for the class: **the negative result was worth as much as the
positive one.** Two of three findings having no tree in a seven-project fleet
is a fact about what this registry publishes versus what its consumers build,
and it cost one scan to learn.
