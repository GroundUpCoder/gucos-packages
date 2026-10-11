set -eu
cd /Users/jku/git/gucos-packages-snake
export COMPAT_RUN_DIR=$PWD/test-results/migration/snake-response-public
node tests/migration/stage.mjs install snake > "$COMPAT_RUN_DIR/install.log" 2>&1
node tests/migration/snake.mjs > "$COMPAT_RUN_DIR/gameplay.log" 2>&1
node tests/migration/stage.mjs reload snake > "$COMPAT_RUN_DIR/reload.log" 2>&1
export COMPAT_RUN_DIR=$PWD/test-results/migration/snake-response-public-upgrade
node tests/migration/snake-upgrade.mjs > "$COMPAT_RUN_DIR/upgrade.log" 2>&1
node tests/migration/stage.mjs reload snake > "$COMPAT_RUN_DIR/reload.log" 2>&1
