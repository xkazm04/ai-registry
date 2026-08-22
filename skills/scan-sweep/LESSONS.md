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
