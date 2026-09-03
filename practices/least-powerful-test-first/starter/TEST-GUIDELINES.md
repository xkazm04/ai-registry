# Test guidelines

<!-- TODO: paste this section into CONTRIBUTING.md under a "Test Guidelines" heading. -->

In general: **use the least powerful method of testing available to you.**

Powerful means "reaches further into the real world", and therefore slower, more fragile,
and harder to attribute a failure in. When two rungs would both work, take the lower one.

## The rungs

<!-- TODO: delete rungs this repo does not have. Define each by what it may touch. -->

| Rung | May touch | Run by |
| --- | --- | --- |
| unit | memory only | `<TODO: default test command>` |
| doc / example | memory only; compiled, not run, where it would need a service | `<TODO: command>` |
| integration | `<TODO: which real dependencies>` | `<TODO: opt-in command>` |
| end-to-end | `<TODO: the real deployed environment>` | `<TODO: pipeline job>` |

## What type of test

<!-- TODO: keep these as MUST / MUST NOT. A preference is arguable in review; a
     prohibition is citable. -->

- Unit tests **MUST NOT** contact `<TODO: the live dependency>`
- Doc tests **MUST** be marked as not-run when they would need `<TODO: the live dependency>`
- Integration tests **MUST NOT** be used when a unit test is sufficient
- Integration tests **MUST NOT** assume state left behind by another test
- End-to-end tests **MUST NOT** be used where an integration test is sufficient

## Which rung, per module

<!-- TODO: one line per module or package. This is the part that makes the prohibitions
     checkable without judgement. -->

- use unit tests in `<TODO: module>`
- use unit tests in `<TODO: module>` (and in rare cases integration tests)
- use end-to-end tests only for `<TODO: the property only the real environment falsifies -
  identity, packaging, wiring, deployment configuration>`

## The hermetic default

`<TODO: default test command>` must pass on a fresh clone with no network, no credentials
and no `<TODO: external dependency>`. Tests that need one are marked
`<TODO: the opt-in marker>` **with a reason string**, so the marker can be read and
re-tested:

```
<TODO: marker syntax with a reason, e.g. ignore = "needs a live queue (creates and drains one)">
```

## Scope of the top rung

The end-to-end lane proves what only the real environment can falsify. Keep each of its
cases small enough that a failure names its cause. If a case asserts business logic, that
logic is missing a test one or more rungs down; write that one and shrink this one.
