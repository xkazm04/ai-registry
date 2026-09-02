---
layer: application
type: application
subject: pipeline-dag
technique: graph-validation
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.95
---

# A process graph validated at the door, with expansion as a stage the technique does not have

A dataflow runtime declares its graph in a descriptor - nodes, typed inputs
and outputs, placement, per-node and per-edge policies - and validates it
before any process is spawned. The validator lives in one module
(`libraries/core/src/descriptor/validate.rs`) and is called from every
lifecycle path that turns a descriptor into running processes: `run`,
`start`, `build`, the explicit `validate` command, and `expand`. That is the
technique's one door, and the tree names its writers.

## What the tree confirms, check by check

- **Referential integrity** is `check_wiring` (`validate.rs:27-57`): every
  input's source must name an existing node and an output that node
  declares, for custom nodes and for each operator inside a runtime node
  alike (`check_input`, `:508-572`). A dangling edge is a refusal with the
  node, input and missing output named - the technique's "diagnosis
  withheld" rule honoured.
- **Class-specific configuration checks** are the bulk of the file: timing
  fields (`check_timing_fields`, `:229`), every seconds-valued policy field
  validated as finite and non-negative (`check_seconds_field`, `:258`), byte
  sizes with overflow guards (`:432-479`), log-routing fields resolved
  (`:120-135`), and a bridge node's configuration validated against its own
  inputs and outputs (`validate_ros2_configs`, `:70-78`). Each node class
  contributes its checks and the validator aggregates them, which is the
  technique's plug-in shape.
- **Authoring-time versus run-time** is drawn explicitly and in the
  direction the technique asks: `check_dataflow_static` (`:65`) proves what
  the document alone can prove; `check_dataflow` (`:141`) additionally
  resolves paths on the machine (`:185-206`, "no shared library at", "no
  Python library at") and is the run-start re-check. A missing binary is a
  run-time fact and is refused at run start, not mid-run.

## The stage the technique does not model: expansion before validation

The descriptor supports `module:` nodes that expand into a sub-dataflow at
load time, and the tree learned the hard way that expansion is a validation
stage of its own. Until recently a module node that also carried source
fields (`path`, `git`, `operators`, and so on) parsed, ran the module, and
*silently discarded* the extra fields when the expansion replaced it
(changelog, "A module node may no longer carry source fields"). The fix is a
refusal at expansion time (`classify.rs:271`, `:405-424`: "a module node
references a sub-dataflow and cannot also be" a source-bearing node), and it
had to be added there because a module node "never reaches `node.kind()`" -
the ordinary discriminator check ran after expansion had already thrown the
evidence away.

The technique's check catalog assumes the document the validator sees is the
document the user wrote. Where a descriptor is *rewritten* before validation
- macro expansion, template instantiation, module inclusion - the checks
that can only see the pre-expansion form (a field that expansion will
delete) belong in the expander, and the technique's "middle category" that
must never exist has a second home: checks that could have run on the
source form and instead ran on the expanded one, over a defect that no
longer exists there. This is a boundary case of graph-validation, recorded
here for the technique's next revision rather than amended in this pass.

## What the tree does not do

There is no acyclicity check and no reachability check in this validator,
and neither is an omission: the graph is a message-passing graph, cycles are
legal (a controller feeding a sensor node that feeds the controller), and an
unreachable node is a valid source with no inputs. The technique's checks 2
and 3 are statements about a *step* DAG with a fate per node; this tree is
the counter-example that draws the boundary between the two subjects, and
the reason a process graph belongs beside pipeline-dag rather than inside it.
