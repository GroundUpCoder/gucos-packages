# Cairo GObject

Unpublished1.18.4 optional Cairo GObject types/boxed-reference provider. It depends
on the single public Cairo and GObject providers; it owns only its extra library,
header and metadata. Base Cairo does not advertise these optional entry points.
The adapter makes the installed cairo-gobject.h advertise its own provider when
explicitly included, without replacing cairo-features.h. Original archive bytes
are unchanged. Retained static/shared reference-count/type tests are prepared;
fresh guest execution and full GTK composition remain pending.
