# PostHog as a `monitoring` connector, and why it usually is not one

What was learned when the `monitoring` connector type resolves to PostHog. This file exists
because the resolution succeeds and the result is wrong, which is harder to notice than a
binding that fails.

## What the mapping has to decide

**It is catalogued under monitoring and it holds no infrastructure signals.** PostHog's series
are product events: page views, feature use, funnels, retention. None of the four signals this
recipe scans has a counterpart there. Latency and error rate as this recipe means them do not
exist, traffic exists only as user activity, and saturation has no analogue whatsoever. A scan
bound here runs to completion and produces an infrastructure account made of signups.

**The failure is silent because the numbers look plausible.** Event volumes have a daily and
weekly shape, so the baseline machinery works, deviations appear, and the report reads exactly
like an infrastructure report. Nothing errors. The only defence is to establish at adoption
what each bound series physically measures rather than trusting the catalogue category, and to
say so in the account.

**When it is bound anyway, say what it is for.** Product event volume genuinely is worth
watching for anomalies, and a drop in signups is a real finding. It belongs to a product
metrics recipe, not this one. If an operator has only this connector, the honest move is to
report that the infrastructure scan has no source and offer the product read as a different
piece of work, rather than dressing one as the other.

## What transfers to any monitoring connector

- A catalogue category is a claim about a connector's family, not about which signals it holds.
- Verify at adoption what each bound series physically measures; a plausible shape is not evidence.
- A recipe with no real source should say it has no source, not produce an account from whatever resolved.
