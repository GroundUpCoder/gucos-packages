# Terminal Snake acceptance, 2026-10-11

Source: c-compiler ceeaa2df06f63b95e77c442819e659062783804e vendor/snake;
unchanged upstream.c, original Apache license and exact hashes retained in apps/snake.
Modified main.c fixes terminal cleanup/input/food/capacity behavior. Core unchanged:
61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0 (1.0.1).

Source build/logic job48e573dc passed, source commit4121c27. Binary archive
d7b6a5804fdbd3bfa8cc6782e8204f44c187b8d9445eb4ffefd1aa9934a3ee20,
39936bytes, five outputs. Fresh installation, actual interactive shell keyboard
play (timer movement, arrow turn, wall collision, restart, one-q exit, Ctrl-C,
terminal modes/cursor restoration), and browser reload passed jobf760ddf2.
Harness b00185e uses posix_spawn wrapper to compare termios before/after the exact
installed game; it verifies all frozen payload hashes before gameplay. Screenshot
is an actual Playwright screenshot. All receipts distinguish source and binary.

Three failed harness preparations remain recorded: absent stty, scripted shell's
nonterminal output (correctly rejected by game), and fork needing compiler flag.
They did not establish gameplay failures. Corrected harness launches a real
interactive shell and uses posix_spawn. No changed game binary was substituted.
Source/harness preparation approved at ec66666 by independent reviewer01a123e0;
final harness/evidence/artifact publication review remains pending at this record.
Public installation acceptance has not run yet. Main migration queue untouched.
