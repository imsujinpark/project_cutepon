#!/usr/bin/env bash

if ! command -v bun &> /dev/null
then
    echo 'bun could not be found! Try this...'
    echo 'curl https://bun.sh/install | bash'
    echo 'export BUN_INSTALL="$HOME/.bun"'
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"'
    exit
fi

DIR="node_modules"
if [ ! -d "$DIR" ]; then
    echo 'running bun install...'
    bun install
fi

bun dev baojs.ts