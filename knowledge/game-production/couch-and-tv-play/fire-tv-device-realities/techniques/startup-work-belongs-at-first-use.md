---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: startup-work-belongs-at-first-use
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a game starts quickly on a desktop and sits on a black screen on the stick, content tables are built in a static initialiser or at class load, a lazy content list is about to be iterated by a lookup or a menu]
---

# Startup work belongs at first use

## The concern

Work that a desktop virtual machine finishes in a quarter of a second at class load can hold a
streaming stick on a black screen for far longer. The stick's cores are several times slower, its
runtime loads and verifies classes from compiled bytecode on a cold process, and a static
initialiser that builds every level, every spline and every spatial index runs on the path to the
first frame whether or not any of it is needed. The symptom points away from the cause: the game
"does not start", the launch reported success, the process is alive, and nothing is on the screen
because the main thread is still building sixty courses that the player will choose one of. The
bar is not generous: the television platform's published launch targets ask for the first frame of
a cold start within about two seconds, well inside the general mobile threshold at which a start
counts as excessive, and general platform guidance gives the same remedy this technique does —
initialise an object the first time it is needed, not when its class loads.

## Procedure

1. **List what runs before the first frame.** Static initialisers, singleton constructors, eager
   catalogue loads, and any structure baked for every item of a collection. A desktop profile of a
   cold start names the candidates; the device timing says which of them matter.
2. **Make collections lazy per element.** A list of content keeps its indices stable and builds each
   element on first access, behind a guard that makes concurrent first access build it once. Lookups
   by identifier are answered from a table of identifiers, not by building elements to read their
   names.
3. **Bake derived structures on first use, not at load.** A spatial index for a level is built the
   first time the level is queried, not for every level when the class loads.
4. **Find the aggregate accessors that defeat the laziness.** Any code that iterates the whole lazy
   collection — to find an element by identifier, to list routes for a menu, to concatenate a preview
   list — silently builds every element. These live outside the content code, in the network handler
   or the menu, and they move the stall from startup to the first time a player touches that menu.
   Replace each with an index lookup or an iteration over metadata.
5. **Move the remaining first-use cost off the render thread.** When the player picks a level, build it
   on a worker thread and hand the render thread a finished object to swap in, so the pick costs a
   frame, not a stall.
6. **Measure startup phases on the device.** Timestamps around class initialisation, the first content
   build and the first frame, taken on the stick from a cold process. Desktop figures rank the
   candidates; they do not estimate the device by a factor
   ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When a desktop cold start is fast, the device cold start is still unmeasured.** Record it as such
  until a device run times it ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
- **When content becomes lazy, audit every caller that iterates it.** The laziness is only as good as
  the least careful caller, and the careless caller is usually in another module.
- **When a deferred cost is small and lands on every path anyway, deferring it buys nothing.** Laziness
  relocates cost; it removes it only for items that are never used. A catalogue that the first race
  needs is paid by the first race whether it was built at load or at first use.
- **When a deferred cost lands on an interactive moment, move it to a transition.** A countdown, a
  loading card or a menu fade can absorb a bake that a live frame cannot.

## What it does not prove

A lazy start proves that startup no longer pays for content it does not show. It does not prove the
first race starts smoothly — the cost of the chosen level, its art and its first-use shaders arrives at
the transition into play, and a long frame there is a separate finding with its own instrument.

## When not to use

When the content set is small enough that building all of it costs less than one frame on the device,
laziness adds a guard and a class of bug for nothing. And where every element is needed immediately —
a title screen that previews every level — build them off the main thread instead of lazily.

## Evidence status

Observed on one stick: an eager bake of every level's spatial index at class load stalled startup on
the device, and making the bake lazy removed the stall; the stall's duration was reported, not timed.
The per-element laziness, the aggregate-accessor trap and the relocation finding are measured on a
desktop host only.
