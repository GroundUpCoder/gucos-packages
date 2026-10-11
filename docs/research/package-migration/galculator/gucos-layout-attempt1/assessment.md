# Galculator layout discovery: configuration failure

The attempt captured Basic, View-menu and Scientific layouts. Installation,
installed consumers and desktop dependencies have passed reports. The runtime
log records failure to create /home/user/.config/galculator and failure to write
its configuration. The report records zero configuration bytes. Persistence
is not established. Source main.c uses g_mkdir for the final directory only;
missing parent directories are a candidate explanation, not yet verified runtime
filesystem state.

The retained log has no fatal/crashed/RuntimeError match, but the driver checks
PID disappearance rather than child wait status. Its clean-quit wording exceeds
that direct observation. Future normal-close acceptance requires a stronger
exit-status oracle. Pango critical messages and icon warnings are retained.
No arithmetic, persistence or public functional acceptance follows from this
layout attempt. Original reports are retained unchanged.
