---
layer: technique
type: technique
subject: repository-landing-document
technique: caption-carrying-figures
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [placing a screenshot on a front page, two images are shown side by side to make a point, an image on the page has no visible text attached to it]
---

# Figures that carry their caption

The markup a landing document is written in has no figure element and no
caption element. An image is a single inline construct dropped into the flow
of prose, and the only text it carries is the alternative text — which is
invisible to every reader who can see the image, meaning invisible to
precisely the population whose problem this is.

So an uncaptioned figure asks its reader two questions and answers neither.
*What am I looking at* — is this the product, an example of its output, a
diagram of its internals, somebody else's product being compared to it? And,
when there are two of them, *what is different* — because a reader shown two
similar rectangles will spend several seconds hunting for the delta and will
usually find the wrong one, or give up, which on a page read for forty seconds
is the same thing.

## The rule

> **Every figure carries a visible caption stating what the reader should
> notice. A comparison of two figures states what differs between the
> panels.**

The second clause is the one that is skipped, and it is where the whole
information content of a comparison lives. Two screenshots side by side assert
that a difference exists and leave its identification as an exercise. Naming
the difference — *same content, same markup, one styling block apart* — costs
eight words and converts a decorative pair into an argument. A comparison
whose caption does not name the delta should be one image, because the second
one is costing bytes and screen height to communicate nothing.

The caption is not a description of the image. *A screenshot of the
application* is a caption that repeats what the reader can already see, which
is the same failure as the routing cell that says *more information*. The
caption states the thing the figure was placed there to prove, in the
reader's vocabulary: what to notice, and — where the figure carries a number —
what that number is of
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
because a figure containing a chart or a count is a claim, and a claim in an
image is still a claim that will be quoted without its predicate.

## The two idioms, since the element does not exist

The markup lacks a figure construct, so the caption is produced by convention,
and there are two that work.

**The single figure**: the image, immediately followed by a short centered,
italicised line. Immediacy matters more than the styling — a caption separated
from its image by a blank paragraph or a heading is read as body prose and
loses its attachment. Where the host permits a centering wrapper it improves
the reading; where it does not, or where the surface strips it, the italic
line beneath the image still reads as a caption, which is the property to
select for.

**The comparison**: a two-row, two-column table, images across the first row
and captions across the second, with the column headers naming the two things
being compared. This is the only construct in common markup that keeps two
images side by side, keeps each caption under its own image, and survives
being rendered by something that does not honour a layout wrapper. It degrades
predictably: on a narrow viewport the columns stack, and the pairing survives
because each caption is still in its own cell beneath its own image.

Both idioms have a shared prerequisite that is easy to miss: the caption must
still be text. A caption baked into the image is invisible to a reader on a
surface that drops images, unsearchable, untranslatable, and stale the moment
the image is regenerated without it.

## What a figure must be

A figure earns its place by showing something the prose cannot: the actual
rendered output, a real interface, a real diagram of a real flow. It does not
earn its place by being an illustration of a concept, and it especially does
not earn its place by being a plausible-looking approximation of an artifact
the project could have produced but did not. An invented screenshot, a
hand-drawn chart of data nobody computed, a mocked interface — each is a claim
the reader has no way to check, made in the one medium that reads as evidence.
Generate the figure by invoking the project's own real path, or choose a
non-figure element.

The alternative text remains mandatory and is a different job from the
caption. The caption tells a seeing reader what to notice; the alternative
text tells a non-seeing reader what is depicted. Writing one and calling it
the other leaves one of the two populations unserved.

## The boundary with freshness

This technique decides whether a figure earns its place and what it must carry.
It does not decide whether the figure is **still true** — a rendered figure is
a derived artifact coupled to whatever produced it, and it rots when that
source moves, which is a synchronization concern with its own machinery and
its own owner. The tell that the two are being confused: a rule in a style
guide about regenerating imagery. That rule is correct and it belongs
somewhere else; a landing-document convention that grows a rot discipline has
grown a second copy of a neighbour's.

## When to skip the figure entirely

Not every project has anything to photograph. A library with no visible
surface, a protocol, a set of conventions — a figure of these is a diagram
somebody drew because the rule said one image, and a diagram nobody needed is
worse than white space, because it is also now something to maintain. The
minimum a front page owes is **at least one non-prose element in its first
screen**, not at least one image, and a worked example or a small table
satisfies it honestly where a figure would not. The projects that must carry a
figure are the ones whose output a reader can look at, because for those, the
prose describing the output is strictly worse than the output.
