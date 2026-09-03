# Lint exemptions

<!-- TODO: paste this section into CONTRIBUTING.md, or keep it as its own file and link it. -->

This repository runs `<TODO: analyser name>` with `<TODO: the strict rule group>` set to
**error**, not warning. The configuration lives in `<TODO: path to the lint configuration>`.

## Suppressing a finding

Every suppression carries a reason on the line above it, and the reason names the **cause**.

```
// Triggered by <TODO: what generates the pattern - a macro, a generated file, a framework>
<TODO: the suppression directive>

// Triggered by <TODO: which analyser version> on idiomatic code; re-test after upgrade
<TODO: the suppression directive>
```

Two reasons are legitimate:

1. The finding comes from code we do not author (generated, derived, vendored).
2. The finding is a false positive of this analyser version on code we consider correct.

Both are claims that can expire. That is the point: an exemption with a stated cause can be
deleted and re-tested; an exemption with no cause is inherited forever.

## Rules

- Scope the suppression as narrowly as the tool allows. Prefer the statement over the
  function, the function over the file, the file over the whole unit.
- A rule you will never enforce is not an exemption. Remove it from the strict group in
  `<TODO: path to the lint configuration>`, where it is visible as policy.
- Do not suppress a finding you have not read.

## Re-testing

When `<TODO: analyser name>` or `<TODO: the libraries named in the reason comments>` are
upgraded, delete the suppressions whose reasons name them and run the analyser. Whatever
stays green was already fixed upstream.

<!-- TODO: if the repo has a command for this, name it here. -->
