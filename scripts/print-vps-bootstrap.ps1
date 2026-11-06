# One-shot: print the exact commands to paste on the NEW VPS (after password/console login).
# Does not change your machine. Run:  powershell -File scripts/print-vps-bootstrap.ps1

$pub = Join-Path $env:USERPROFILE '.ssh\id_ed25519_zarva_ci.pub'
if (-not (Test-Path $pub)) {
  Write-Error "Missing $pub — create the zarva CI key first."
  exit 1
}
$line = (Get-Content $pub -Raw).Trim()

Write-Host @"

=== Paste this on the VPS (as root) after you can login with password/console ===

mkdir -p ~/.ssh && chmod 700 ~/.ssh
grep -q 'zarva-github-actions' ~/.ssh/authorized_keys 2>/dev/null || \
  echo '$line' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Optional: allow SSH from the world (needed for GitHub-hosted runners)
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp
  ufw allow 1032/tcp
  ufw status
fi

=== Then from THIS PC verify ===

ssh -i `$env:USERPROFILE\.ssh\id_ed25519_zarva_ci root@109.70.78.80

=== If GitHub still times out (even after key works from home) ===

GitHub runners cannot reach many IR VPS IPs.
Use a self-hosted runner: Settings → Actions → Runners → New
Labels: self-hosted, zarva
Repo variable DEPLOY_RUNS_ON = [\"self-hosted\",\"zarva\"]

"@
