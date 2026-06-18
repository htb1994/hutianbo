#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/vendor/superpowers"
SKILLS_LINK="$ROOT/.agents/skills/superpowers"
REPO="https://github.com/obra/superpowers.git"
UPDATE=false

for arg in "$@"; do
  case "$arg" in
    --update) UPDATE=true ;;
    -h|--help)
      echo "Usage: bash scripts/install-superpowers.sh [--update]"
      echo "  Clone Superpowers to vendor/superpowers and link .agents/skills/superpowers"
      exit 0
      ;;
  esac
done

echo "==> Installing Superpowers into vendor/superpowers"

if [ -d "$VENDOR/.git" ]; then
  if [ "$UPDATE" = true ]; then
    echo "    Updating existing clone..."
    if GIT_TERMINAL_PROMPT=0 git -C "$VENDOR" fetch --depth 1 origin main \
      && GIT_TERMINAL_PROMPT=0 git -C "$VENDOR" reset --hard origin/main; then
      :
    else
      echo "    Warning: update failed; using existing checkout."
    fi
  else
    echo "    Using existing clone (pass --update to refresh from GitHub)."
  fi
else
  echo "    Cloning repository..."
  mkdir -p "$(dirname "$VENDOR")"
  git clone --depth 1 --branch main "$REPO" "$VENDOR"
fi

echo "==> Linking Codex skills (.agents/skills/superpowers)"
mkdir -p "$ROOT/.agents/skills"
rm -f "$SKILLS_LINK"
ln -sfn "../../vendor/superpowers/skills" "$SKILLS_LINK"

echo ""
echo "Done."
echo "  Vendor: vendor/superpowers ($(git -C "$VENDOR" rev-parse --short HEAD))"
echo "  Codex:  .agents/skills/superpowers -> vendor/superpowers/skills"
echo ""
echo "Cursor: import this repo as a Team Marketplace (Dashboard -> Settings -> Plugins),"
echo "        or install from the marketplace panel: /add-plugin superpowers"
echo "Codex:  launch from the repo root; skills auto-discover from .agents/skills/"
