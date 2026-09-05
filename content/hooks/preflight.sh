#!/usr/bin/env sh
set -eu
root="${1:-.}"
node "$root/dist/cli.js" validate --source "$root"
