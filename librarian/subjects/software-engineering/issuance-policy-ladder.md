---
subject: issuance-policy-ladder
domain: software-engineering
last_touched: 2026-09-17
dry_streak: 0
---

# issuance-policy-ladder

### 2026-09-17 - `/harvest backlog` wave 4, one technique + one application

`stamped-instants-name-their-clock`. The ladder's every rung is a difference from *now*, and the clock is the one piece of issuer state nothing checks although every other rung is measured from it. The remedy is chosen by a single question - **after this artifact leaves, can the issuer still change it?** A row the issuer re-reads on every use needs a repair path and refusing to mint would be the larger outage; an artifact carried to verifiers the issuer will never meet needs a minting path that can refuse. Between them sits the honest third option, minting only bounds the issuer itself enforces, and naming it is what stops a design pretending the first two are the same choice. The sharpest case is the smallest, and it is the one the measurement produced rather than predicted: **a stamped deadline equal to the present is the one bound a backward clock step always undoes**, so an irreversible intent is a state and not an instant. The same rule covers a window already closed when it is computed - a deadline clamped into the past is not a short window, it is a retirement, and writing it as a date leaves it reversible. Also worth carrying: this is the honest reading of `creation-names-reaper` for artifacts whose reaper is a stamp. Naming the reaper at creation is only as good as the reaper, and a reaper that is a comparison against a movable clock has named a condition, not a destroyer.
