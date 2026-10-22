# Game Boy emulator candidate

Retains all eight historical source blobs at 0b9b324, including Peanut-GB,
APU and built-in scrolling test ROM. No external commercial ROM is included.
The original project builds directly against the core SDL shim. The executable
moves from reserved lib/wasm-posix state to bin/gameboy; its package-owned desktop
entry launches into its own graphical VT. No X11 renderer is introduced.

Fresh source build, original palette/animation browser checks, binary installation,
reload and independent publication approval remain pending.
