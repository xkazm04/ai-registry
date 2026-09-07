# Formbricks as the `forms` connector

What was learned mapping this recipe onto Formbricks specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The respondents are usually already users, which inverts the weighting.** Formbricks is
a survey and in product feedback tool, so what arrives is typically a response from
somebody already inside the product rather than a stranger who found a contact page. Fit
is therefore largely already known and adds little, while behaviour carries almost all of
the signal. A rubric ported unchanged from a cold contact form will spend most of its
weight on firmographics it did not need and underweight the one thing it can actually
see. Decide which audience the form has before choosing the weighting, because the answer
changes the rubric rather than a setting in it.

**Prefer the identifier the product already holds.** An in product response usually
carries the application's own user or contact identity, which is a far better key for
this recipe's identity resolution than an email somebody may have typed differently this
time. Where it exists, match on it first and treat email as a fallback.

**Absence of a response is a sampling artefact, not a signal.** In product surveys are
shown to a subset under targeting rules, so most people who would have answered were
never asked. A rubric that reads "did not respond" as disengagement is reading the
targeting configuration rather than the person. Nothing about non responders belongs in
the judgment here.

**The analytics half of this connector is not what this recipe reads.** Formbricks is
catalogued as both forms and analytics. This recipe binds it as forms; binding it for
analytics would resolve a type this recipe never reads, and an adoption that does so
looks configured and delivers nothing.

## What transfers to any forms connector

- Establish whether the form's audience is strangers or known users. It decides the fit
  versus behaviour weighting, and that is a change to the rubric rather than a knob.
- Where the source already holds a stable identity, match on it before matching on an
  email a person retypes.
- A source that samples who it asks cannot support any inference from silence.
