#!/bin/zsh
cd "${0:A:h}"
if ! command -v node >/dev/null; then
  echo "Instala Node.js antes de ejecutar MotoPower."
  read
  exit 1
fi
if ! curl -fsS http://127.0.0.1:5550/api/health >/dev/null 2>&1; then
  node server.cjs >server.log 2>&1 &
  sleep 2
fi
open http://127.0.0.1:5550
