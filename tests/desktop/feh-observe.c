/* Read-only Feh observer for real-input desktop acceptance.
 * No input synthesis, focus changes, property writes, or server grabs.
 * Each invocation is one sample; caller owns polling and the deadline. */
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xatom.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

#define MAX_SIDE 4096
#define MAX_PIXELS 4194304UL
#define MAX_NODES 4096
#define MAX_CHILDREN 1024
#define MAX_DEPTH 16

static int raced;
static int (*previous_error_handler)(Display *, XErrorEvent *);
static int observation_error(Display *d, XErrorEvent *e)
{
    if (e->error_code == BadWindow) { raced = 1; return 0; }
    return previous_error_handler(d, e);
}

static int number(const char *s, unsigned long *value)
{
    const char *p;
    char *end;
    if (!s || !*s) return 0;
    for (p = s; *p; ++p) if (*p < '0' || *p > '9') return 0;
    errno = 0;
    *value = strtoul(s, &end, 10);
    return !errno && !*end && *value > 0 && *value <= UINT32_MAX;
}

static int feh_class(Display *d, Window w)
{
    XClassHint h = {0};
    int ok = XGetClassHint(d, w, &h);
    int match = ok && h.res_class && !strcmp(h.res_class, "feh");
    if (h.res_name) XFree(h.res_name);
    if (h.res_class) XFree(h.res_class);
    return match;
}

static int pid_of(Display *d, Window w, Atom atom, unsigned long *pid)
{
    Atom type = None;
    int format = 0;
    unsigned long count = 0, rest = 0;
    unsigned char *bytes = NULL;
    int ok;
    if (atom == None) return 0;
    ok = XGetWindowProperty(d, w, atom, 0, 1, False, XA_CARDINAL,
                           &type, &format, &count, &rest, &bytes) == Success
         && type == XA_CARDINAL && format == 32 && count == 1 && rest == 0
         && bytes;
    if (ok) {
        *pid = *(unsigned long *)bytes;
        ok = *pid > 0 && *pid <= UINT32_MAX;
    }
    if (bytes) XFree(bytes);
    return ok;
}

struct search { unsigned nodes, matches; int incomplete; Window found; };
static void search(Display *d, Window w, unsigned depth, struct search *s)
{
    XWindowAttributes a;
    Window root, parent, *children = NULL;
    unsigned count = 0, i;
    if (depth > MAX_DEPTH || ++s->nodes > MAX_NODES) {
        s->incomplete = 1; return;
    }
    if (!XGetWindowAttributes(d, w, &a)) { s->incomplete = 1; return; }
    if (a.map_state != IsViewable) return;
    if (a.class == InputOutput && feh_class(d, w)) {
        ++s->matches; s->found = w;
    }
    if (!XQueryTree(d, w, &root, &parent, &children, &count)) {
        s->incomplete = 1; return;
    }
    if (count > MAX_CHILDREN) s->incomplete = 1;
    else for (i = 0; i < count && !s->incomplete; ++i)
        search(d, children[i], depth + 1, s);
    if (children) XFree(children);
}

struct extent { unsigned long count; int minx, miny, maxx, maxy; };
static void add(struct extent *e, int x, int y)
{
    if (!e->count) e->minx = e->maxx = x, e->miny = e->maxy = y;
    else {
        if (x < e->minx) e->minx = x;
        if (x > e->maxx) e->maxx = x;
        if (y < e->miny) e->miny = y;
        if (y > e->maxy) e->maxy = y;
    }
    ++e->count;
}
static void print_extent(const char *name, const struct extent *e)
{
    printf(",\"%s\":{\"count\":%lu,\"minX\":%d,\"minY\":%d,"
           "\"maxX\":%d,\"maxY\":%d}", name, e->count,
           e->minx, e->miny, e->maxx, e->maxy);
}

int main(int argc, char **argv)
{
    int pixels, absent, code = 4, x, y, rootx, rooty, afterx, aftery;
    unsigned long expected_xid = 0, expected_pid = 0, pid = 0, afterpid = 0;
    Display *d;
    Window root, child;
    Atom pid_atom;
    XWindowAttributes a, after;
    XImage *im = NULL;
    struct search s = {0};
    struct extent red = {0, -1, -1, -1, -1}, green = {0, -1, -1, -1, -1};
    uint32_t hash = UINT32_C(2166136261);

    if (argc < 2) return 1;
    pixels = !strcmp(argv[1], "pixels");
    absent = !strcmp(argv[1], "absent");
    if (pixels) {
        if (argc != 4 || !number(argv[2], &expected_xid)
            || !number(argv[3], &expected_pid)) return 1;
    } else if (argc != 2 || (!absent && strcmp(argv[1], "window"))) return 1;

    d = XOpenDisplay(NULL);
    if (!d) return 2;
    previous_error_handler = XSetErrorHandler(observation_error);
    root = DefaultRootWindow(d);
    /* only_if_exists=True: observation must not create an atom. */
    pid_atom = XInternAtom(d, "_NET_WM_PID", True);
    search(d, root, 0, &s);
    XSync(d, False);
    if (raced || s.incomplete) goto done;
    if (absent) {
        code = s.matches ? 3 : 0;
        goto done;
    }
    if (!s.matches) { code = 3; goto done; }
    if (s.matches != 1) goto done; /* Never choose an arbitrary client. */
    if (pixels && (unsigned long)s.found != expected_xid) goto done;
    if (!pid_of(d, s.found, pid_atom, &pid)) goto done;
    if (pixels && pid != expected_pid) goto done;
    if (!XGetWindowAttributes(d, s.found, &a) || a.map_state != IsViewable
        || a.class != InputOutput || a.width < 1 || a.height < 1
        || a.width > MAX_SIDE || a.height > MAX_SIDE
        || (unsigned long)a.width * a.height > MAX_PIXELS) goto done;
    if (!XTranslateCoordinates(d, s.found, root, 0, 0, &rootx, &rooty, &child))
        goto done;
    if (pixels) {
        /* Deliberately require the reviewed 24-bit TrueColor Xvfb profile. */
        if (a.depth != 24 || a.visual->class != TrueColor
            || a.visual->red_mask != 0xff0000UL
            || a.visual->green_mask != 0x00ff00UL
            || a.visual->blue_mask != 0x0000ffUL) goto done;
        im = XGetImage(d, s.found, 0, 0, a.width, a.height, AllPlanes, ZPixmap);
        if (!im) goto done;
        for (y = 0; y < a.height; ++y) for (x = 0; x < a.width; ++x) {
            uint32_t rgb = (uint32_t)(XGetPixel(im, x, y) & 0xffffffUL);
            hash = (hash ^ rgb) * UINT32_C(16777619);
            if (rgb == 0xff0000) add(&red, x, y);
            if (rgb == 0x00ff00) add(&green, x, y);
        }
    }
    /* Fail a sample if identity/geometry changed during observation. */
    if (!XGetWindowAttributes(d, s.found, &after)
        || after.map_state != IsViewable || after.width != a.width
        || after.height != a.height || after.depth != a.depth
        || !feh_class(d, s.found) || !pid_of(d, s.found, pid_atom, &afterpid)
        || afterpid != pid
        || !XTranslateCoordinates(d, s.found, root, 0, 0, &afterx, &aftery, &child)
        || afterx != rootx || aftery != rooty) goto done;
    XSync(d, False);
    if (raced) goto done;
    code = 0;
done:
    if (im) XDestroyImage(im);
    XSync(d, False);
    if (raced) code = 4;
    XCloseDisplay(d);
    if (code) return code;
    if (absent) puts("{\"absent\":true}");
    else {
        printf("{\"xid\":%lu,\"pid\":%lu,\"x\":%d,\"y\":%d,"
               "\"width\":%d,\"height\":%d", (unsigned long)s.found, pid,
               rootx, rooty, a.width, a.height);
        if (pixels) {
            printf(",\"hash\":%lu", (unsigned long)hash);
            print_extent("red", &red); print_extent("green", &green);
        }
        puts("}");
    }
    return 0;
}
