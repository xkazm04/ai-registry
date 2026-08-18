---
kind: semantic
confidence: 1.0
namespace: platform
source: architecture-review
---

# Service naming and ownership

A durable fact about how services are named and owned across this example organization. Written
down because it is the question every new repo asks in its first hour, and because an agent that
guesses gets it wrong in a way that is expensive to rename later.

## The rule

- A service repo is named `<domain>-<role>`: `billing-api`, `billing-worker`, `catalog-api`.
  Domain first, so an alphabetical repo list groups by domain.
- The domain is a business noun, never a technology (`billing`, not `postgres-service`).
- The role is one of: `api`, `worker`, `web`, `cli`, `lib`. No other roles without a decision.
- A library shared by more than one domain lives under `platform-<thing>` and is owned by the
  platform group, not by whichever team needed it first.

## Ownership

Every repo has a `CODEOWNERS` file naming exactly one owning team for the root path. Additional
entries may narrow specific paths, but the root entry is never empty and never a person - people
change teams and a personal owner becomes an unmergeable PR the week they move.

The owning team is accountable for the repo's security findings and its dependency upgrades, not
only for reviewing its pull requests.

## Why

Two earlier conventions were tried and dropped: a team-prefixed name (`payments-billing-api`)
broke on the first reorg, and a purely functional name (`api-gateway-2`) told a reader nothing
about what the service was for. Domain-first survives both reorganizations and rewrites, because
the domain is the part that does not change.

## Consequences

- Renaming a service is a domain decision, not a technical one.
- A repo that does not fit the pattern is a signal that the domain boundary is wrong. Check the
  boundary before inventing a new role suffix.
