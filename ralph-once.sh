#!/bin/bash

docker sandbox run claude -p "$(cat prompt.md)"
