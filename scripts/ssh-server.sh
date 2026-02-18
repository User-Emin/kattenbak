#!/usr/bin/env bash
# Snelkoppeling: SSH naar productieserver met juiste key
# Gebruik: ./scripts/ssh-server.sh   of   bash scripts/ssh-server.sh

KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_mewsimqr}"
HOST="${SERVER_HOST:-catsupply.nl}"
USER="${SERVER_USER:-root}"

if [ -f "$KEY" ]; then
  exec ssh -i "$KEY" -o StrictHostKeyChecking=no "${USER}@${HOST}" "$@"
else
  echo "Key niet gevonden: $KEY"
  echo "Zonder key proberen..."
  exec ssh -o StrictHostKeyChecking=no "${USER}@${HOST}" "$@"
fi
