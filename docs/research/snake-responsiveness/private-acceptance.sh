set -eu
cd /Users/jku/git/gucos-packages-snake
export GUCOS_CORE_DIST=/Users/jku/git/gucos/dist
export COMPAT_EXPECT_RUNTIME=19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441
export MIGRATION_UPGRADE_PLAN=docs/research/snake-responsiveness/upgrade-plan.json
export COMPAT_RUN_DIR=$PWD/test-results/migration/snake-response-source-v2
node tests/migration/stage.mjs build snake > "$COMPAT_RUN_DIR/build.log" 2>&1
export MIGRATION_BINARY_RUN=$COMPAT_RUN_DIR
python3 tests/migration/prepare.py snake-response-binary 28b53d415411435a96fa7d8de1d3444dbd7ab288 snake
export COMPAT_RUN_DIR=$PWD/test-results/migration/snake-response-binary
node tests/migration/stage.mjs install snake > "$COMPAT_RUN_DIR/install.log" 2>&1
node tests/migration/snake.mjs > "$COMPAT_RUN_DIR/gameplay.log" 2>&1
node tests/migration/stage.mjs reload snake > "$COMPAT_RUN_DIR/reload.log" 2>&1
python3 - <<'PY'
from pathlib import Path
import shutil
source=Path('test-results/migration/snake-response-binary');dest=source.with_name('snake-response-upgrade');dest.mkdir()
for name in ['config.json','candidate-manifests.json','dist-files.json','port','snake.sha256']:shutil.copyfile(source/name,dest/name)
PY
export COMPAT_RUN_DIR=$PWD/test-results/migration/snake-response-upgrade
node tests/migration/snake-upgrade.mjs > "$COMPAT_RUN_DIR/upgrade.log" 2>&1
node tests/migration/stage.mjs reload snake > "$COMPAT_RUN_DIR/reload.log" 2>&1
