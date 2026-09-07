# Sentry as the `monitoring` connector, feeding intake

What was learned mapping this recipe onto an application error monitor as an automated
reporter. Nothing here is part of the recipe: swap the connector and this file stops
applying while the recipe does not change.

## What the mapping has to decide

**An error is not an incident, and most of them are not.** A monitor emits continuously
and an incident log is meant to be readable. The binding is only worth making if
something narrows what reaches intake: a rate breaking out against its own history, an
issue on a path the adopter named as consequential, or a first appearance after a
release. Wiring the raw stream in produces an incident log that is a second copy of the
error list, which is the failure the recipe's first personalization need warns about.

**The severity the monitor reports is not the severity this recipe means.** The level on
an event is set by whatever line of code logged it, usually years earlier and with no
knowledge of who is affected. Treating it as incident severity imports an anchor the
recipe explicitly rejects. Take the count of people affected instead, which the monitor
does carry, and let the anchor be that.

**One outage arrives as many issues, and that is exactly the join decision.** Several
services failing together produce several unrelated looking issues, and this recipe's
default is to open them separately and offer the join. That default is right here and it
feels wrong, because the board briefly looks messy. The alternative is that the second
service's problem is closed when the first one's is, and nobody sees it.

**Scoping happens before intake, not after.** The monitor's account usually spans more
than the system in question, and filtering after the fact still lets an unrelated team's
spike arrive as incidents. Scope the projects at the source.

**The monitor can open an incident and can never close one.** An issue going quiet means
the error stopped being sent, which is not the same as the problem being over and is
sometimes caused by the thing that broke. Closure stays with a person, and this connector
is the clearest case for why.

## What transfers to any monitoring connector

- Something has to narrow the stream before it reaches intake, or the log becomes a copy
  of the monitor.
- A severity a tool assigns is a property of the code that logged it, not of the impact.
- An automated reporter can open and cannot close; silence from a monitor has two causes
  and only one of them is good news.
