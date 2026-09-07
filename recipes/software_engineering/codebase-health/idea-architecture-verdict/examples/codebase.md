# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**The checkout holds the idiom, and the idiom is the thing the fit judgment is made
against.** It is not written down anywhere as a rule: it is in how the existing modules are
shaped, what the tests look like, which abstractions recur. A verdict that reads the code
can see it. A verdict that reads only the idea and the project's stated conventions cannot,
and will approve something that follows every written rule while fighting everything around
it.

**Settled decisions may or may not be in this binding.** Where the project keeps its
decision records inside the repository, a checkout answers the "does this contradict
something" half directly and the verdict can cite a record. Where they live in a wiki or a
chat history, the checkout cannot see them at all, and the verdict has to say that half was
made from the code alone. Establish which of the two this project is at adoption; it changes
what the verdict can claim.

**The absence half is the one this binding is weakest at.** Confirming that something is
there is a search. Confirming that something is not is an exhaustive read, and it fails
quietly against dependency injection, generated code and anything resolved by name at
runtime. Where the idea's missing piece would be provided that way, say the absence is
unconfirmed rather than asserting the gap.

**Infrastructure and deployment questions are not in the tree.** A verdict about whether a
change fits the way this system is built and shipped has no evidence available in a
checkout beyond configuration files, and configuration files describe an intent rather than
a running system. This is the class where a confident verdict is most often wrong, and it is
worth marking as such by default rather than case by case.

## What transfers to any source_control connector

- The local idiom is only visible to a binding that reads code, and it is the fit
  judgment's real subject.
- Establish whether settled decisions are inside the binding's reach; if not, the
  contradiction half of the verdict is an assumption.
- Absence is a much stronger claim than presence and needs a much stronger read; label it
  when you cannot make one.
