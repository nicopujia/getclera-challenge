#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

COMPLETE="<promise>COMPLETE</promise>"

for ((i=1; i<=$1; i++)); do
  result=$(docker sandbox run claude \
    -p "$(cat prompt.md)\nIf all issues are complete, output $(COMPLETE)."
  )

  echo "$result"

  if [[ "$result" == "$COMPLETE" ]]; then
    echo "PRD complete after $i iterations."
    exit 0
  fi
done
