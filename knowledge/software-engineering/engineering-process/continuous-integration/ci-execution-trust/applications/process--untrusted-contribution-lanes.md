---
layer: application
type: application
subject: ci-execution-trust
technique: untrusted-contribution-lanes
stack: process
status: forged
verified_on: 2026-08-22
---

# A registry whose untrusted lane is the only lane

This repository is an interesting case for the technique because it does not need the lane
split and gets most of the benefit anyway — by having nothing worth stealing in any lane. Its
gates run eight jobs across two workflows, and a grep for `secrets.` across
`.github/workflows/` returns nothing at all.

That is the technique's untrusted lane in its strongest form: not a lane that carefully
withholds credentials, but a lane that never had any. Everything the gates do — bundle
integrity, index freshness, usage and signals shape, currency reporting, catalog freshness,
skill shape and version discipline — is a pure function of the checkout. Nothing is published,
nothing is deployed, no external service is called.

The consequence is worth stating plainly, because it is the argument for keeping it that way:
a malicious proposal against this repository can currently cause a build to run its own code
and print things. It cannot exfiltrate anything, because there is nothing in the environment to
take.

## Untrusted input as data, done correctly

The one place this repository handles attacker-influenced text, it handles it the way the
technique prescribes. `.github/workflows/skills.yml`, in the `version` job:

```yaml
- name: Check every changed skill carries a version bump
  run: node scripts/check-skills.mjs --since "$BASE_SHA"
  env:
    BASE_SHA: ${{ github.event.pull_request.base.sha }}
```

The event value goes through a named environment variable and is referenced as a shell variable
in the command. The direct form — interpolating the expression into the `run:` body — would
splice event-derived text into a shell script at template-expansion time, which is the
substitution defect the technique names. A grep for `run:` lines containing an expression
across both workflows returns nothing: the indirection is used consistently, not once.

The quoting around `"$BASE_SHA"` is the second half and is equally load-bearing. The variable
indirection prevents template splicing; the quotes prevent word splitting of whatever the
variable holds.

## The dependency-free gate as a trust property

Both workflows carry the same comment above their check steps:

> `# No install step: the gate is dependency-free by design.`

It is stated as a convenience — the gate runs anywhere, with no lockfile and no install
latency — and it is also, unremarked, the strongest supply-chain property this repository has.
Nothing third-party executes inside a gate run. Every checker under `scripts/` is first-party
code with `node:`-prefixed imports only, so the set of parties with execution privilege inside
a build is: this repository's authors, and the two platform actions below.

The technique's step-tier concern — each extension is another party with execution privilege,
and the aggregate is rarely counted — is here countable, and the count is two.

## Action references, pinned by commit

Sixteen `uses:` lines across the two workflows — twelve in `knowledge.yml`, four in
`skills.yml` — reference `actions/checkout` and `actions/setup-node`. Every one names a commit
SHA with the human-readable version in a trailing comment:

```yaml
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
- uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
```

This was a recorded deviation until 2026-08-22. Both were previously `@v4` — floating
major-version tags, which the injected-code ladder's rule rejects: a moving name is an
agreement to run whatever that publisher pushes next, evaluated at build time, with no review
step between the push and the execution.

The workflow headers carry the reasoning rather than only the result, including the half that
is easy to get wrong:

> Pinning to a digest also freezes the deprecation clock, so the pin moved to the current major
> rather than freezing v4 — which was three majors behind and already emitting a Node 20
> deprecation on every run. Bump deliberately, by resolving the tag again.

That is the cost this technique's rule quietly imposes and rarely states: a digest pin converts
"silently current" into "explicitly stale", and a repository that pins without ever bumping has
exchanged an unreviewed upgrade for an unreviewed freeze. The second is safer and it is not
free. Pinning to a version already carrying a deprecation warning would have locked in decay
under the appearance of rigour.

The exposure that was closed was real but modest, and worth stating accurately rather than
dramatically: the publisher is the platform vendor rather than an arbitrary third party, and
the jobs hold no credentials for a compromised action to take. The residual risk was code
execution on a runner holding a checkout of a public registry — a low-value target, and not a
zero one.

What remains unpinned is the runner image itself. `runs-on: ubuntu-latest` is the same class of
moving reference one layer down, and it is not addressed here — see this bundle's
`capability-typed-queues` application, which records it.

## What is deliberately absent, and what that costs

- **No `permissions:` block** in either workflow, so each job runs with whatever the
  repository's default grant is rather than an explicitly narrowed one. The technique's
  enumerate-what-the-lane-holds step is not written down anywhere; it is currently true by
  accident of never having added anything, which is a different and weaker property than being
  true by declaration.
- **No scheduled verification** that the lane is still empty. The technique asks for a periodic
  check after configuration changes, on the reasoning that credentials accumulate. This
  repository has nothing to accumulate yet, so the check would find nothing — but the day a
  publishing step is added for the catalog or a signals ingest, the property changes silently
  and nothing is watching for it.

Both are the cheap-to-prepare, expensive-to-retrofit items the technique names. `CODEOWNERS`
already carries the corresponding human control, with the reasoning attached — *"Merging is
adopting. Whoever is listed here decides what the organization's agents run."* — and singles
out the one path where a merge changes a guardrail rather than content.
