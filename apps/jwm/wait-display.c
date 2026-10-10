/* Bounded connection readiness for the package-owned X server. */
#include <X11/Xlib.h>
#include <stdio.h>
#include <unistd.h>
int main(void) {
    alarm(15); /* Also bounds a stalled X setup handshake. */
    for (int attempt = 0; attempt < 150; ++attempt) {
        Display *display = XOpenDisplay(NULL);
        if (display) {
            XCloseDisplay(display);
            alarm(0);
            return 0;
        }
        usleep(100000);
    }
    fputs("X display did not become ready\n", stderr);
    return 1;
}
