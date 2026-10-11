# Xarchiver layout attempt 1: exit failure

The retained layout report says completed-layout-discovery and claims clean quit.
That clean-quit claim is contradicted by layout.log: PID 25 crashed with a fatal
WebAssembly unreachable trap after Ctrl+Q. Process disappearance and terminal
restoration did not distinguish a crash from normal exit. Preserve the original
report unchanged as evidence of this insufficient oracle.

Installation, installed consumers and desktop dependencies have passed reports.
Main, menu and New/Open chooser screenshots were captured. No archive operation,
normal-close, persistence, public functional acceptance or publication is approved
by this attempt. The JavaScript stack includes __engine_callback_4 through
g_cclosure_marshal_VOID__VOID and closure_accel_activate; source diagnosis remains
pending. Native-looking source frame annotations are not assumed authoritative.
