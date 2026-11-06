# Keep the system and display awake for as long as /shift has seats or proofs running.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/shift-awake.ps1 [-Minutes 1440] [-StopFile <path>]
#
# Why: display-off Modern Standby is not system sleep and "never sleep" does not stop it. On this
# box it took H3 clips from about 480 s to 1022-1115 s, and it would stall research seats the same
# way. The request belongs to this process's thread, changes no Windows setting, and ends with it,
# so a crash cannot leave the machine pinned awake. A closed lid still sleeps.
#
# It ends on its own after -Minutes so a forgotten holder cannot keep a display on for ever, and
# earlier when the stop file (default .ai/shift/awake.stop) exists. Exit 0: ended normally. Exit 2:
# the request was refused.
param(
  [int]$Minutes = 1440,
  [string]$StopFile = ""
)
if (-not $StopFile) { $StopFile = Join-Path $PSScriptRoot "..\.ai\shift\awake.stop" }
Add-Type -Namespace ShiftRun -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
# ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
if ([ShiftRun.Power]::SetThreadExecutionState([uint32]2147483651) -eq 0) {
  Write-Output "shift-awake: the keep-awake request was refused"
  exit 2
}
Write-Output ("shift-awake: holding system and display for up to {0} min" -f $Minutes)
$until = (Get-Date).AddMinutes($Minutes)
while ((Get-Date) -lt $until) {
  if (Test-Path -LiteralPath $StopFile) {
    Remove-Item -LiteralPath $StopFile -Force -ErrorAction SilentlyContinue
    Write-Output "shift-awake: told to stop"
    exit 0
  }
  Start-Sleep -Seconds 5
}
Write-Output "shift-awake: time is up"
exit 0
