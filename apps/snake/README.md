# Snake

Terminal Snake from GroundUpCoder/c-compiler, adapted for wasm-posix.
Run `gucman install snake`, then `snake`. Arrows, WASD or HJKL steer;
q or Ctrl-C exits immediately; r restarts after collision. Requires a 20x10
terminal or larger; board is capped at 60x22. No SDL or ncurses dependency.
The original source is upstream.c; provenance.json records exact source/license
hashes. main.c fixes terminal cleanup, fragmented arrows, EOF spinning, double-q
exit, food placement and moving-tail collisions. SIGKILL cannot run cleanup.
Resize during play does not resize the board; quit and restart after resizing.

Version 1.0.0-2 restores the original 100 ms idle movement and immediate
movement on each valid direction key (including key repeat). Complete keys in
a single read are applied in order; partial arrows and invalid reversals do not
move the snake. Input-driven movement resets the next timer step. The game
blocks in select between input or timer events, and waits indefinitely for input
on the game-over screen. The existing 60x22 board limit and bug fixes remain.
