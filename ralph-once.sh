#!/bin/bash

docker sandbox run claude "$(cat prompt.md)"
