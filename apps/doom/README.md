# Doom migration candidate

Retains the pinned historical source tree and shareware game data unchanged.
The engine GPL and OPL3 LGPL notices are installed. The proprietary shareware
WAD is not covered by those licenses; its original distribution notice was not
retained in the historical tree. Recovery of that notice is a publication gate.
Executable moves out of reserved core state to libexec, with a package-owned
launcher and SDL virtual terminal. Home configuration/save data is separate from
package outputs. Fresh build, retained graphical gameplay, binary integrity,
reload and independent publication acceptance remain pending.
