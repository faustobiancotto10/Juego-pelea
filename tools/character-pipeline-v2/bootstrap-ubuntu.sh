#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y \
  synfig \
  synfigstudio \
  inkscape \
  ffmpeg \
  imagemagick

echo "Character Pipeline V2 authoring tools installed."
echo "OpenToonz is intentionally optional: install it separately only when a GUI authoring session is useful."
