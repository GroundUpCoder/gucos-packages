# Installed applications in JWM

The optional `desktop-entries` package adds installed package-owned desktop
entries to JWM 2.4.6-2's application menu. For Snake:

```sh
gucman install jwm
gucman install xterm
gucman install desktop-entries
gucman install snake
start-jwm
```

Open the JWM button and select Snake. If the desktop was already running when
an application was installed, choose **Refresh applications**. Snake runs inside
an xterm PTY; press `q` to close it. It also runs directly from the terminal with
`snake`. The installed desktop identifier remains `wasm-posix-snake.desktop`.

Only entries owned by installed packages are listed. The launcher implements a
bounded desktop-entry subset documented in its installed README. SDL graphical
applications retain their own virtual terminals; the menu adds no core desktop
or X11 GPU policy.

Exact acceptance and limitations are recorded in
[the continuation journal](logs/2026-10-11/porting-continuation.md).
