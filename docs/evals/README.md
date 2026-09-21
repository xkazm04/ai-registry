# Workflow evaluation fixtures

`routing-cases.json` freezes positive, negative and adjacent-workflow cases at
`d1150345`. Supply the task and current selection guide to a reviewer without the
expected verdict, capture its choice and intended actions, then score against the
required and forbidden behavior. Keep full transcripts local; publish case verdicts,
the model/runtime identity, versions, elapsed time and observed input usage.

For procedure comparisons, give old and new methods the same task and fixture. Compare
accepted artifacts and unmet requirements, including negative cases and missing tools.
Separate routing results from execution results. Do not edit expectations after seeing
a candidate fail without recording the rationale and rerunning both procedures.

The context extraction check reconstructs the old entry file from the new file and
its reference. It establishes unchanged instruction text, not unchanged agent behavior.
Entry-file UTF-8 bytes are reproducible; actual loaded tokens and time require runtime
telemetry. A branch run may load slightly more text because it reads a reference stub
as well as the reference. No speed or quality improvement follows from byte counts alone.
