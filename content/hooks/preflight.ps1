param([string]$Root = ".")

$ErrorActionPreference = "Stop"
$resolved = Resolve-Path -LiteralPath $Root
node (Join-Path $resolved "dist/cli.js") validate --source $resolved
