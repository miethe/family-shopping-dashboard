#!/bin/sh
set -eu
printf 'mockup-local-only\n' > .aos-mockups/runtime/pg-password
.aos-mockups/runtime/pg-bin/initdb -D "$PWD/.aos-mockups/runtime/postgres" -U postgres --pwfile="$PWD/.aos-mockups/runtime/pg-password" --auth=trust --no-locale --encoding=UTF8
