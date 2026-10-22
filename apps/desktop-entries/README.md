# Installed desktop entries, profile 1

Package-owned `share/applications/ID.desktop` files describe applications. JWM's
optional menu hook invokes `desktop-menu jwm-items`; refresh applications after
installation. `desktop-menu launch ID.desktop` rereads and validates the entry,
then executes arguments directly. Terminal=true uses xterm (fixed font), requiring
xterm to be installed. Direct SDL programs retain their own VT presentation.
No GPU/X sharing or SDL backend change is introduced by this launcher.

The scanner accepts only v1 gucman public links with an exact installed `paths`
receipt. Unmanaged files, dangling links, absent executables, hidden entries,
and unsupported entries are omitted. It does not search users' home directories.
All package payloads and recipes are trusted code; this is not an application
sandbox. Changes to manager ownership state require a compatible launcher update.

Supported freedesktop subset: Type=Application, unlocalized Name, Exec, TryExec,
Terminal, Hidden, NoDisplay and Icon (for %i expansion). Comment and Categories
may be provided but are not yet displayed/grouped; icon images are not rendered.
Boolean values must be true/false. Reject duplicate recognized keys, duplicate
Desktop Entry groups, control characters, DBusActivatable=true, nonempty Path,
OnlyShowIn and NotShowIn. Other fields/localized names are ignored.

Exec is a sequence of space-separated arguments, optionally wholly double-quoted,
with desktop string unescaping followed by Exec quote unescaping. No shell
evaluation. Reserved characters require quotes; dollar/backtick/backslash/quote
require escaping within quotes. Field codes are unquoted: standalone %c and %k
expand to name and entry path, %i to --icon plus Icon, absent icon to no arguments.
At most one standalone %f/%F/%u/%U is omitted (no file selection). Deprecated
standalone %d/%D/%n/%N/%v/%m are omitted. %% is a literal percent; embedded or
unknown field codes are rejected. Executable names cannot contain percent/equal.
This is a deliberately restricted profile, not full freedesktop implementation.

Executable lookup uses /usr/local/bin, /usr/local/sbin, /usr/bin and /bin, or an
absolute executable path. Relative paths containing slash are rejected. Limits:
64 KiB per entry, 120 arguments, 1024 entries, safe ASCII IDs at most 200 bytes.
Menu order is deterministic by filename. Names are XML-escaped and menu commands
contain only the fixed launcher path and validated ID, never an Exec string.

Defaults belong in share; applications copy defaults into home on first use and
preserve intentional user edits/deletions and saved games. Package rollback cannot
roll back those user files. No arbitrary install/remove hooks are used.

Reference: https://specifications.freedesktop.org/desktop-entry/latest/
Original implementation for wasm-posix-packages, Apache-2.0, 2026-10-11.
