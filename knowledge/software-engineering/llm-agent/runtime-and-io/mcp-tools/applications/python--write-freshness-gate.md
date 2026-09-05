---
layer: application
type: application
subject: mcp-tools
technique: write-freshness-gate
stack: python
verified_on: 2026-09-04
verified_against: python@3.11.14
---

# A write that licenses skipping its own readback

The same local generation runner at commit `cdab3128` — stack version witnessed by
`docs/INSTALLATION.md:23`, `conda create -n wan2gp python=3.11.14`, with the
protocol library pinned at `requirements.txt:84` (`mcp==1.10.1`) — exposes a file
plane to an agent through one routing tool. It is a narrow witness for this technique — it does not
implement the freshness gate at all — but it is a precise one for the amendment,
because it takes the opposite position on the one question the gate answers with an
absolute, and it does so from a defensible place.

## The write that says a readback is unnecessary

The technique's rule is that writes never refresh marks, so every modification is
followed by a re-read before the next one. This server draws a line through the
middle of that, at one operation:

```python
# shared/mcp_server.py:1391-1398
if exported_artifact_id:
    result["artifact_id"] = exported_artifact_id
    verification = artifact_workspace.reference_status(exported_artifact_reference)
    verification.update({key: result[key] for key in (
        "characters_written", "lines_written", "line_count",
        "markdown_heading_count", "first_markdown_heading", "last_markdown_heading",
        "sha256", "size_bytes") if key in result})
    verification["partial_export"] = verification["kind"] == "record_set" and not verification["finalized"]
    if verification.get("expected_items") is not None:
        verification["remaining_items"] = max(0, int(verification["expected_items"]) - int(verification.get("source_items", 0)))
    verification["readback_required"] = False
    result["verification"] = verification
```

The agent-facing instruction is the matching half: *"After `write_artifact_text`
returns structural verification with `readback_required=false`, trust it and do not
reread the compiled document."*

## Why the exception is licensed here, and would not be elsewhere

The amendment's discriminator is whether the file's new content depends on content
the writer did not supply. This operation sits at the far end of that: it refuses to
accept content over the wire at all.

```python
# :1383-1387
if action_name == "write_artifact_text":
    artifact_reference = action_arguments.get("artifact")
    if not isinstance(artifact_reference, dict) or not str(artifact_reference.get("$artifact", "") or "").strip():
        raise TypeError("write_artifact_text requires an artifact reference; literal text is not accepted.")
```

The argument is a handle to a document the server is already holding. The model is
not the source of the bytes and never saw them as text, so a readback could not tell
it anything it did not already have a better route to — the amendment's strongest
form, enforced as a type error rather than as a convention. The technique's own
worry, that a refreshed mark lets a model "edit its own stale intent forever," has
nothing to bite on: there is no prior file content mixed into the result, and no
model-authored text to be stale about.

Note also what the flag is attached to. It is set beside `sha256` and `size_bytes`,
not instead of them — the permission to skip the read travels with the evidence that
would have justified reading, which is what makes it auditable by the caller rather
than a promise.

## The completeness field is the half most implementations would omit

`partial_export` and `remaining_items` answer a question the write's success cannot:
a whole-artifact write can land perfectly over a source record set that is itself
still being filled. The server reports the shortfall as expected-minus-exported
rather than folding it into the write's status, so a caller is never told
"verified" about a document that is merely *written*. The amendment names this as
the second condition on an honest refresh, and this tree is where the condition came
from.

## What this tree does not demonstrate, and one place it contradicts the technique

This server has **no freshness gate**. There is no content-hash mark on read
results, no precondition on `write_text`, and no refusal of a stale write — the
`IO_ACTIONS` write path is guarded by an access policy and a root scope
(`shared/deepy/filesystem.py:753+`), which answer "may you write here", never "did
you see the current version". So the tree is evidence for the amendment's exception
and no evidence at all for the rule the exception is carved out of, and a reader
should not take it as a model of the technique.

It also runs the amendment's risk in the open, and the shape of that risk is worth
recording because it is not the obvious one. The evidence is not the scarce thing
here: **one helper produces it for every write on the plane**
(`shared/deepy/filesystem.py:509-520` returns `sha256`, `characters_written`,
`lines_written` and the heading facts), so a literal `write_text` comes back
carrying exactly the same proof as an artifact export. What differs is only which
call gets `readback_required` attached to it, and that is decided by the action
name rather than by anything about the write.

That matters because `write_text` takes `mode: create | overwrite | append`.
Append is precisely the case the amendment says may never refresh a mark — its
result depends on content the writer did not supply — and it emits the identical
evidence block. The discriminator the amendment draws is therefore *not* visible in
the evidence, and a server that granted the license by looking at what came back
would grant it to appends. Here it is granted by hand, to one action, correctly.

The routing to that action is a convention on both surfaces that state it: the skill
file (*"Use `write_artifact_text`, not literal `write_text`, when file content
comes from an artifact"*) and the `write_text` schema description itself (*"For
artifact content, use write_artifact_text instead of copying it here"*). The type
error at `:1385` enforces one direction only — the artifact path refuses literal
text — and nothing stops literal text from taking the unlicensed path when it
should have been promoted first. The verification flag is sound and the exception is
correctly placed; what carries it is a name, not a property.
