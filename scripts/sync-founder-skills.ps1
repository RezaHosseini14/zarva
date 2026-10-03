# Re-apply Cursor path fix and skill junctions after `git submodule update`.
# Run from repo root: pwsh -File scripts/sync-founder-skills.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
$packRoot = Join-Path $repoRoot ".agents\claude-skills-founder"
$skillsSrc = Join-Path $packRoot "skills"
$skillsLink = Join-Path $repoRoot ".agents\skills"

if (-not (Test-Path $skillsSrc)) {
  Write-Error "Missing submodule at $packRoot. Run: git submodule update --init .agents/claude-skills-founder"
}

$old = '`${CLAUDE_PLUGIN_ROOT}/shared/conventions.md'
$new = '`.agents/claude-skills-founder/shared/conventions.md'

Get-ChildItem $skillsSrc -Directory | ForEach-Object {
  $skillMd = Join-Path $_.FullName "SKILL.md"
  if (-not (Test-Path $skillMd)) { return }
  $text = Get-Content $skillMd -Raw
  if ($text -match [regex]::Escape('${CLAUDE_PLUGIN_ROOT}')) {
    ($text -replace '\`\$\{CLAUDE_PLUGIN_ROOT\}/shared/conventions\.md\`', $new) | Set-Content $skillMd -NoNewline
  }

  $link = Join-Path $skillsLink $_.Name
  if (Test-Path $link) {
    $item = Get-Item $link -Force
    if ($item.LinkType -eq "Junction") {
      if ($item.Target -ne $_.FullName) {
        Remove-Item $link -Force
        New-Item -ItemType Junction -Path $link -Target $_.FullName | Out-Null
      }
    } else {
      Write-Warning "Skip junction for $($_.Name): $link exists and is not a junction."
    }
  } else {
    New-Item -ItemType Junction -Path $link -Target $_.FullName | Out-Null
  }
}

$sha = git -C $packRoot rev-parse HEAD
Set-Content -Path (Join-Path $repoRoot ".agents\claude-skills-founder.UPSTREAM_COMMIT") -Value $sha -NoNewline
Write-Host "Founder skills synced. Upstream SHA: $sha"
