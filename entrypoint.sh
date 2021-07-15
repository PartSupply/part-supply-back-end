#!/bin/bash

worker=0

# SIGTERM-handler
term_handler() {
  if [ $worker -ne 0 ]; then
    kill -SIGTERM "$worker" # send SIGTERM to node process
    wait "$worker" # wait for the node app to shutdown gracefully
    exit $?; # send exit code of node process back
  else
    exit 0;
  fi
}

trap term_handler SIGTERM

if [[ $1 == "--dev" ]]; then
  echo "Starting part-supply-bff in dev mode..."
  yarn nodemon &
else
  echo "Starting part-supply-bff in prod mode..."
  node dist/main.js &
fi

worker="$!"
wait $worker
