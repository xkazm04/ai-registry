# Google Ads as the `advertising` connector

What was learned mapping this recipe onto Google Ads specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The account has its own timezone, and it is almost never the analytics project's.** A
window given as two dates means a different set of hours on each side, and the whole
difference lands on the boundary days, which is exactly where a short window's movement
comes from. Establish both timezones at adoption and either align the windows in absolute
time or state the offset in the read. This is the cheapest way a cross-source scan
produces a fictitious daily swing.

**Part of the conversion figure is modelled, not observed.** Where consent or
cross-device linkage is missing, conversions are estimated and folded into the same
column as the observed ones, with no flag on the row. Placing that column beside a site
side count of actual events is comparing an estimate against a census, and the gap
between them will look like a data quality problem when it is a definitional one. Report
the paid side as the platform's own count under its own rules, which is what this recipe
asks for, rather than trying to reconcile it.

**Conversions keep arriving after the window closes.** The attribution window means a day
read today and the same day read next week carry different numbers, and a baseline built
from settled days compared against a fresh window shows a decline every single run. Read
only windows old enough to have settled, and if a fresh window must be read, say that it
is fresh rather than comparing it to settled history.

**Spend is complete immediately and conversions are not.** That asymmetry makes every
freshly read window look expensive: the cost is final and the return is still landing.
Any efficiency ratio computed on a fresh window is biased in one known direction, so
either wait or state the direction of the bias.

## What transfers to any advertising connector

- Two systems with the same dates and different timezones are not reading the same
  window. Align in absolute time or state the offset.
- Ask which parts of the reported conversion figure are modelled. A modelled count and an
  observed count do not reconcile and should not be asked to.
- Cost settles instantly and conversions settle slowly, so a fresh window always looks
  worse. Wait, or name the bias.
