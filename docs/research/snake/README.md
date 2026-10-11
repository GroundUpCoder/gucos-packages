# Terminal Snake acceptance, 2026-10-11

Source: c-compiler ceeaa2df06f63b95e77c442819e659062783804e vendor/snake;
unchanged upstream.c, original Apache license and exact hashes retained in apps/snake.
Modified main.c fixes terminal cleanup/input/food/capacity behavior. Core unchanged:
61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0 (1.0.1).

Source build/logic job48e573dc passed, source commit4121c27. Binary archive
d7b6a5804fdbd3bfa8cc6782e8204f44c187b8d9445eb4ffefd1aa9934a3ee20,
39936bytes, five outputs. Fresh installation, actual interactive shell keyboard
play (timer movement, arrow turn, wall collision, restart, one-q exit, Ctrl-C,
terminal modes/cursor restoration), and browser reload passed jobc5b62b4f.
Harness05f8990 uses posix_spawn wrapper to compare termios before/after the exact
installed game; it verifies all frozen payload hashes before gameplay. Screenshot
is an actual Playwright screenshot. All receipts distinguish source and binary.

Three failed harness preparations remain recorded: absent stty, scripted shell's
nonterminal output (correctly rejected by game), and fork needing compiler flag.
They did not establish gameplay failures. Corrected harness launches a real
interactive shell and uses posix_spawn. No changed game binary was substituted.
Source/harness preparation approved at ec66666 by independent reviewer01a123e0;
final harness and artifact4acd079, then catalog9832b2f, were independently approved by reviewer01a123e0 before publication.
The b00185e run under superseded-log-only passed log assertions but failed visual
inspection: direct shell.command left the bootstrap prompt redrawing over output.
Corrected05f8990 launches sh through keyboard/UI and verifies rendered borders,
head and food before capturing the screenshot. No game-source changes required.
Public acceptance passed on https://os.groundupcoder.net at 2026-10-11 03:28 UTC: fresh binary installation from published catalog9832b2f, actual keyboard gameplay, terminal restoration, and browser reload. The default main catalog now contains Snake. Main migration queue untouched.

Play: `gucman install snake`, then `snake`. WASD, HJKL or arrow keys steer; r restarts after game over; q quits. The port is a terminal program and has a desktop entry for subsequent launcher integration. It does not itself change JWM.
