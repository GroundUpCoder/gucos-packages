# Doom migration candidate

Retains the pinned historical source tree and shareware game data unchanged.
The engine GPL and OPL3 LGPL notices are installed. The proprietary shareware
WAD is not covered by those licenses. A separately installed id Software notice
was recovered from Debian doom-wad-shareware 1.9.fixed-4; the Debian upstream
archive WAD exactly matches the retained data. Exact URLs and hashes are in
provenance.json. This notice was absent from the historical source tree.
Executable moves out of reserved core state to libexec, with a package-owned
launcher and SDL virtual terminal. Home configuration/save data is separate from
package outputs. Fresh build, retained graphical gameplay, binary integrity,
reload and independent publication acceptance remain pending.
