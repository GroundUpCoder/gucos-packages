#include <X11/Xlib.h>
#include <X11/Xatom.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
static Window find(Display *d, Window w, int depth) {
    if (depth > 16) return None;
    char *name = NULL;
    if (XFetchName(d, w, &name) && name) {
        int match = !strcmp(name, "Live desktop PTY");
        XFree(name);
        if (match && depth >= 2) return w;
    }
    Window root, parent, *children = NULL, found = None;
    unsigned count = 0;
    if (!XQueryTree(d, w, &root, &parent, &children, &count)) return None;
    for (unsigned i = 0; i < count && found == None; i++)
        found = find(d, children[i], depth + 1);
    if (children) XFree(children);
    return found;
}
int main(void) {
    Display *d = XOpenDisplay(NULL);
    if (!d) return 1;
    Window root = DefaultRootWindow(d);
    Atom wm = XInternAtom(d, "_NET_SUPPORTING_WM_CHECK", False);
    for (int i = 0; i < 150; i++) {
        Atom type; int format; unsigned long count, rest; unsigned char *data = NULL;
        int managed = XGetWindowProperty(d, root, wm, 0, 1, False, XA_WINDOW,
            &type, &format, &count, &rest, &data) == Success && type == XA_WINDOW && format == 32 && count == 1;
        if (data) XFree(data);
        Window w = find(d, root, 0);
        if (managed && w != None) {
            XWindowAttributes a;
            Window r, parent, *children = NULL; unsigned n;
            int tree = XQueryTree(d, w, &r, &parent, &children, &n);
            if (children) XFree(children);
            if (tree && parent != root && XGetWindowAttributes(d, w, &a) && a.map_state == IsViewable) {
                XSetInputFocus(d, w, RevertToParent, CurrentTime);
                XSync(d, False);
                puts("LIVE-JWM-XTERM-FOCUSED"); fflush(stdout);
                XCloseDisplay(d); return 0;
            }
        }
        usleep(100000);
    }
    XCloseDisplay(d); return 2;
}
