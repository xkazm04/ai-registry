<!-- Starter. Replace <...> with your repo's specifics (gate commands live in
     CONTRIBUTING.md - point at it, do not duplicate it), then delete this comment. -->

## What this changes

<one focused change, described in one or two sentences - if "and" appears twice, split the PR>

## Checklist

- [ ] The verification gate is green locally (`<gate command(s)>` - see `CONTRIBUTING.md`).
- [ ] This is one focused change; unrelated edits are out.
- [ ] Commits are pathspec-scoped (no `git add -A`).
- [ ] Tests included - mandatory if this touches auth, billing, tenancy, rate limits, or
      an LLM chokepoint; state which, or state "none of those surfaces".
- [ ] Docs that describe the changed behavior are updated in this PR.
- [ ] Copy changes carry full locale parity (`<locales>`), or this PR changes no copy.

## AI assistance

<!-- You own what you submit: you ran the gate and can explain every line of the diff.
     Disclose substantially agent-generated work; drive-by bulk agent PRs are closed
     without review. -->

- [ ] This PR is substantially agent-generated: <yes/no; if yes, one line on what you
      directed and what you verified>

## Local-first invariants

<!-- Review criteria, not aspirations. Check them or explain why one does not apply. -->

- [ ] No provider becomes mandatory.
- [ ] No deterministic fallback is removed.
- [ ] Nothing added only makes sense hosted.
- [ ] Nothing phones home by default.
