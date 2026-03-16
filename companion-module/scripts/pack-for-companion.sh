#!/usr/bin/env bash
# Pack the module for Companion "Install from file" (root must contain companion/manifest.json).
# Includes production node_modules so the module runs without needing npm install after import.
set -e
cd "$(dirname "$0")/.."
V=$(node -p "require('./package.json').version")
NAME="techministry-spotifycontroller"
DIR="dist-pack/${NAME}-${V}"
rm -rf "$DIR"
mkdir -p "$DIR/companion"
cp companion/manifest.json companion/HELP.md "$DIR/companion/"
cp index.js package.json README.md LICENSE "$DIR/"
cp -r src "$DIR/"
# Install production deps so the packaged module runs when Companion extracts it
(cd "$DIR" && npm install --production --no-package-lock --omit=dev)
# Create tarball (node_modules included)
cd dist-pack && tar -czvf "../${NAME}-${V}.tgz" "$(basename "$DIR")" && cd ..
echo "Created ${NAME}-${V}.tgz"
