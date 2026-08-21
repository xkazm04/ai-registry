---
layer: application
type: application
subject: conformance-checking
technique: declared-then-proven
stack: node
status: forged
verified_on: 2026-08-20
---

# A zero-dependency doctor that proves what the manifest declares

Ascent (`C:\Users\kazda\kiro\ascent`) ships adopting repositories a `.ai/`
standard: a `manifest.yaml` spine that *declares* the project's paths,
capabilities and controls, and `.ai/doctor.mjs` — an executable checker that
*proves* them. The generator lives in `src/lib/standard/doctor.ts`, which
emits the script as one template literal (authored with no backticks so it
embeds verbatim in both the generator and the onboarding skill document).
Zero runtime dependencies beyond Node built-ins, so any adopting repo can
run it, and the check *contract* is language-neutral: `.ai/SPEC.md` states
the checks, and `doctor.mjs` is explicitly "just the reference runner".

## The three proof rungs, concretely

**Presence** — `check(existsSync(...), label, 'warn')` for the context index
and memory store (`doctor.ts:100`).

**Shape** — the declared-pointer loop immediately after: every key under the
manifest's `paths` block must resolve. The comment there records the
false-fail this rule fixed: the doctor *used to* warn that `evals/` was
missing on every fresh install, "for a subsystem the standard never
scaffolds — a guaranteed yellow you had no in-kit way to fix." The rule is
now "declare a pointer and it is enforced; leave it out and it is silent."

Also shape: control wiring. `doctor.ts:191` onward checks not merely that a
hook file exists but that each declared `controls.prePush` capability is
actually *wired into* it, through an alias table (`lint → eslint | ruff |
biome | clippy | rubocop`, and so on).

**Execution** — `--run` shell-executes each declared capability command with
`execSync(caps[n], { stdio: 'ignore', timeout: 180000 })`. The 180-second
budget is documented in the usage banner and in the spec, and the failure
finding names the kill signal explicitly, because the comment notes a
timeout must read as "hit the time limit", not as "a silent, message-less
failure". A capability whose command still matches `/<.*>/` — a template
placeholder — is warned about and never executed.

## The word-boundary lesson

`doctor.ts:39` is the technique's sharpest confirmation, and it is a
post-mortem in code:

> A naive `hookText.includes(alias)` gave FALSE "wired" passes because short
> aliases are substrings of unrelated words: `'build:latest'.includes('test')`
> is true, so a repo that never wired `test` looked wired.

The replacement `wired(hookText, alias)` scans for the alias flanked by
non-alphanumeric characters or a string edge — so `test` matches `npm test`
but not `latest`, while multi-word and flag aliases (`go vet`, `--cov`,
whose own edges are already non-alphanumeric) still match. This is the
false-*pass* half of the discipline: the naive check certified a practice
that was not there.

## Existence is not content

`doctor.ts:205` reads each `CONTEXT.md` the context index points at and
reports it *unfilled* if it still carries the shipped template's
`<placeholder>` markers — either the template heading `# CONTEXT: <module
path>`, or three or more angle-bracket tokens containing a space (real prose
and HTML tags rarely do, so the heuristic does not fire on a genuinely
written document). The comment states the stake: "the scaffold scoring
itself green while empty."

## The one hard failure, and the tool-absent path

`doctor.ts:117` implements both rules from the severity ladder in eight
lines. A file matching the repo's own declared `secrets.neverCommit`
patterns that is tracked by version control is the single `fail` promoted to
guardrail status — "because by the time it trips the secret is already in
history." And when `git ls-files` cannot run at all (a shallow tarball, no
repository), `tracked` stays `null` and the checker **reports nothing**
rather than emitting a false failure.

`doctor.ts:191` carries the same instinct for freshness: last-change is
`git log -1 --format=%cs -- <file>`, not `mtime`, because "a git
checkout/clone rewrites every file's mtime to now, so an mtime check warns
stale on every CI run regardless of real drift." An unavailable history
returns `''` and the file is skipped rather than false-warned.

## Write-back and its security perimeter

`doctor.ts:149` flips each capability's `verified` flag in `manifest.yaml`
to the run's actual outcome — "pass → true, fail → false; a stale true never
outlives a broken command" — with the serializer's one-line-per-capability
format making the targeted rewrite safe, and placeholder capabilities never
touched. Without it, the comment notes, "the manifest promised a flip that
never happened."

The banner at `doctor.ts:16` states the perimeter that makes this safe:
`--run` shell-executes commands declared in the manifest, so it must never
run on untrusted fork builds, and the conformance token must never be
exposed to such a workflow — "a malicious PR can rewrite a capability
command to execute arbitrary code and exfiltrate those secrets."

The outward leg, `src/app/api/report/conformance/route.ts:1`, closes the
adopt → verify → re-score loop and carries the report-back rules: the ingest
is a cross-tenant write, so an org-scoped token is verified against the
payload's repo owner (a deployment-wide legacy token is accepted only with a
warning, and `CONFORMANCE_INGEST_STRICT=1` retires it); `headSha` orders
re-runs so a stale re-run of a superseded commit is acknowledged but not
persisted; and the score is validated as an actual number rather than
coerced, because `Number(v)` let `null`, `""` and `false` all persist a
fabricated `score: 0`.
