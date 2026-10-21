---
layer: application
type: application
subject: cross-runtime-rules-conformance
technique: pinned-rules-data-across-runtimes
stack: dotnet
status: draft
verified_on: 2026-10-21
verified_against: dotnet@9.0.308
applied: simulation
ab_verdict: not-better
---

# One source compiled twice: the pin is a compile include, and the arithmetic is read by margin

Source tree: `garden-vr` on `main` at `decb7e8` (the root of every path below). Two Unity apps
share a rules package, and a plain .NET test project compiles the same files so the rules can
be tested on a machine with no Unity licence. On 2026-10-21, `dotnet test` on
`shared/core-dotnet/GardenVR.Core.Tests` (SDK 9.0.308, `net9.0`), filtered to the parity,
invariant and breath-rule suites, passed 29 of 29.

## No copy to drift

The test project does not hold a copy of the rules. It compiles the package's own sources:
`shared/core-dotnet/GardenVR.Core/GardenVR.Core.csproj:11 "<Compile Include="../../packages/com.gardenvr.core/Runtime/**/*.cs" />"`,
under a comment that states why
(`shared/core-dotnet/GardenVR.Core/GardenVR.Core.csproj:2 "so the rules are tested without Unity"`).
Data drift and logic drift between the tested build and the shipped build are absent by
construction: there is one file per rule, and both builds read it. The technique's manifest and
hash check have nothing to guard here. The include path is the pin.

What the include does not remove is a second site for a rule inside the source itself. The
project had two vitality curves, one for the garden and one for companions, and fixed it by
making both read one function, then pinning that they agree at every gap
(`shared/core-dotnet/GardenVR.Core.Tests/VitalityParityTests.cs:9 "Both now read"`). App files
that still hold their own copy of a rule are frozen until a session can compile Unity
(`docs/decisions/0004-refactoring-without-a-unity-licence.md:22 "Until then the app copy is frozen."`).

## What one source leaves: the shipped runtime's arithmetic

The tests run on the .NET host only. The project says so in its own gate
(`docs/decisions/0004-refactoring-without-a-unity-licence.md:11 "never claim a Unity build or play-mode test"`).
The shipped build goes through a different compiler backend on a different instruction set, so
the remaining divergence class is arithmetic. Three float-decided branches in the shared rules
were walked to see whether that residue needs a run on the shipped runtime:

1. **The droop floor.** `shared/packages/com.gardenvr.core/Runtime/Terrarium/Garden.cs:74`
   computes `1f - 0.15f * (gap - 1)` and clamps it at a floor of 0.6. A backend may fuse the
   multiply and subtract, which moves the result by about one unit in the last place, near
   6e-8 here. In single precision, over gaps 2 to 40, the closest value to the floor sits
   0.05000007 away, and the droop test (`< 1f`, line 60) sits 0.15 away. No fusion can flip
   either branch.
2. **Breath phase thresholds.** `shared/packages/com.gardenvr.core/Runtime/Breath/BreathSession.cs:94`
   accumulates `PhaseTime += dt`, and lines 150, 184 and 200 compare it to configured seconds.
   Addition and comparison are correctly rounded on both backends, so the same `dt` sequence
   gives the same branch. On a device the `dt` sequence itself differs, which is an input
   difference that no conformance suite owns.
3. **The uncoil approach.** Lines 225-226 step a display value toward a target with a
   multiply-add and clamp it with `Math.Max` / `Math.Min`. A fused operation can move the frame
   on which the target is reached by one frame. The value is presentation, and no rule branches
   on it.

No branch in the shared rules package calls a transcendental function (a search for `Math`
and `Mathf` sine, cosine, exponent, power, logarithm, arctangent and square root returned
nothing; a search of the same files for a known accumulation line found it).

## Verdict

Policy A: the source is shared, so the host tests vouch for the device. Policy B: the shared
source removes data and logic drift, and a run on the shipped runtime is still owed for the
float-decided branches. The two policies reach the same decision on all three cases, because
every float branch's margin is many orders of magnitude above what a fused operation or a
rounding difference can move. That is recorded as `not-better`, and the condition it adds is
written into the golden path: the residual check is a margin read first. A run on the shipped
runtime is owed only for a branch whose margin cannot be bounded from the code, such as a
library function near a threshold or a quantity accumulated by multiplication.

## What this realization cannot show

- That the Unity apps compile against the current package. The project records that check as
  owed debt, not as run.
- Any behaviour of the rules on the target headset. Nothing here ran on a device.
- Whether the frozen app copies of rules still agree with the package. Decision 0004 freezes
  them. It does not compare them.
