/* Modified for wasm-posix, 2026-10-11: terminal cleanup, bounded board,
 * fragmented input, single-key quit/restart, and collision/food fixes.
 * Original source and exact provenance are shipped alongside this file. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <sys/ioctl.h>
#include <sys/select.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <time.h>

#define MAX_SNAKE 1000
#define INITIAL_LEN 5

static struct termios orig_termios;
static int rows, cols;
static int snake_x[MAX_SNAKE], snake_y[MAX_SNAKE];
static int snake_len;
static int dir_x, dir_y;
static int food_x, food_y;
static int score;
static int game_over;
static volatile sig_atomic_t quitting;
static int raw_enabled, escape_state;
static unsigned int rng_state;

static unsigned int xorshift(void) {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

static void get_terminal_size(void) {
    struct winsize ws;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, (void *)&ws) == 0) {
        rows = ws.ws_row;
        cols = ws.ws_col;
    } else {
        rows = 24;
        cols = 80;
    }
}

static int enable_raw_mode(void) {
    if (tcgetattr(STDIN_FILENO, &orig_termios) != 0) return -1;
    struct termios raw = orig_termios;
    cfmakeraw(&raw);
    if (tcsetattr(STDIN_FILENO, TCSANOW, &raw) != 0) return -1;
    raw_enabled = 1;
    return 0;
}

static void disable_raw_mode(void) {
    if (raw_enabled) tcsetattr(STDIN_FILENO, TCSANOW, &orig_termios);
    raw_enabled = 0;
}

static void write_str(const char *s) {
    write(STDOUT_FILENO, s, strlen(s));
}

static void move_cursor(int r, int c) {
    char buf[32];
    int n = 0;
    buf[n++] = '\033';
    buf[n++] = '[';
    int tmp = r;
    if (tmp >= 100) { buf[n++] = '0' + tmp / 100; tmp %= 100; buf[n++] = '0' + tmp / 10; tmp %= 10; }
    else if (tmp >= 10) { buf[n++] = '0' + tmp / 10; tmp %= 10; }
    buf[n++] = '0' + tmp;
    buf[n++] = ';';
    tmp = c;
    if (tmp >= 100) { buf[n++] = '0' + tmp / 100; tmp %= 100; buf[n++] = '0' + tmp / 10; tmp %= 10; }
    else if (tmp >= 10) { buf[n++] = '0' + tmp / 10; tmp %= 10; }
    buf[n++] = '0' + tmp;
    buf[n++] = 'H';
    buf[n] = 0;
    write_str(buf);
}

static void hide_cursor(void) { write_str("\033[?25l"); }
static void show_cursor(void) { write_str("\033[?25h"); }
static void clear_screen(void) { write_str("\033[2J"); }

static void place_food(void) {
    int cells = (cols - 2) * (rows - 3);
    int start = (int)(xorshift() % (unsigned)cells);
    for (int offset = 0; offset < cells; offset++) {
        int cell = (start + offset) % cells;
        int x = 2 + cell % (cols - 2), y = 2 + cell / (cols - 2);
        int occupied = 0;
        for (int i = 0; i < snake_len; i++)
            if (snake_x[i] == x && snake_y[i] == y) occupied = 1;
        if (!occupied) { food_x = x; food_y = y; return; }
    }
    food_x = food_y = 0;
    game_over = 1;
}

static void draw_border(void) {
    write_str("\033[36m");
    for (int c = 1; c <= cols; c++) {
        move_cursor(1, c); write_str("-");
        move_cursor(rows - 1, c); write_str("-");
    }
    for (int r = 1; r <= rows - 1; r++) {
        move_cursor(r, 1); write_str("|");
        move_cursor(r, cols); write_str("|");
    }
    write_str("\033[0m");
}

static void draw_score(void) {
    move_cursor(rows, 1);
    write_str("\033[33m");
    char buf[64];
    int n = 0;
    n += sprintf(buf + n, " Score: %d ", score);
    n += sprintf(buf + n, " | Arrow keys to move | q to quit ");
    write(STDOUT_FILENO, buf, n < cols ? n : cols - 1);
    write_str("\033[0m");
}

static void draw_food(void) {
    move_cursor(food_y, food_x);
    write_str("\033[31m*\033[0m");
}

static void draw_snake(void) {
    move_cursor(snake_y[0], snake_x[0]);
    write_str("\033[32m@\033[0m");
    for (int i = 1; i < snake_len; i++) {
        move_cursor(snake_y[i], snake_x[i]);
        write_str("\033[32mo\033[0m");
    }
}

static void init_game(void) {
    score = 0;
    escape_state = 0;
    game_over = 0;
    snake_len = INITIAL_LEN;
    dir_x = 1;
    dir_y = 0;
    int start_x = cols / 2;
    int start_y = rows / 2;
    for (int i = 0; i < snake_len; i++) {
        snake_x[i] = start_x - i;
        snake_y[i] = start_y;
    }
    place_food();
    clear_screen();
    draw_border();
    draw_food();
    draw_snake();
    draw_score();
}

static void input_char(unsigned char c, int *out_dx, int *out_dy) {
    if (c == 'q' || c == 'Q' || c == 3 || c == 4) { quitting = 1; return; }
    if (game_over && (c == 'r' || c == 'R')) { init_game(); *out_dx = dir_x; *out_dy = dir_y; return; }
    if (c == 27) { escape_state = 1; return; }
    if (escape_state == 1) { escape_state = (c == '[' || c == 'O') ? 2 : 0; return; }
    if (escape_state == 2) {
        escape_state = 0;
        if (c == 'A') c = 'w'; else if (c == 'B') c = 's';
        else if (c == 'C') c = 'd'; else if (c == 'D') c = 'a';
        else return;
    }
    if ((c == 'w' || c == 'k') && dir_y != 1) { *out_dx = 0; *out_dy = -1; }
    if ((c == 's' || c == 'j') && dir_y != -1) { *out_dx = 0; *out_dy = 1; }
    if ((c == 'd' || c == 'l') && dir_x != -1) { *out_dx = 1; *out_dy = 0; }
    if ((c == 'a' || c == 'h') && dir_x != 1) { *out_dx = -1; *out_dy = 0; }
}

static void poll_key(int *out_dx, int *out_dy) {
    unsigned char buf[64];
    ssize_t n = read(STDIN_FILENO, buf, sizeof(buf));
    if (n == 0 || (n < 0 && errno != EINTR && errno != EAGAIN)) { quitting = 1; return; }
    for (ssize_t i = 0; i < n && !quitting; i++) input_char(buf[i], out_dx, out_dy);
}

static void step(void) {
    int new_x = snake_x[0] + dir_x;
    int new_y = snake_y[0] + dir_y;

    if (new_x <= 1 || new_x >= cols || new_y <= 1 || new_y >= rows - 1) {
        game_over = 1;
        return;
    }

    int ate = (new_x == food_x && new_y == food_y);
    for (int i = 0; i < snake_len - (ate ? 0 : 1); i++) {
        if (snake_x[i] == new_x && snake_y[i] == new_y) {
            game_over = 1;
            return;
        }
    }

    if (!ate) {
        move_cursor(snake_y[snake_len - 1], snake_x[snake_len - 1]);
        write_str(" ");
    }

    if (!ate) {
        for (int i = snake_len - 1; i > 0; i--) {
            snake_x[i] = snake_x[i-1];
            snake_y[i] = snake_y[i-1];
        }
    } else {
        if (snake_len < MAX_SNAKE) {
            for (int i = snake_len; i > 0; i--) {
                snake_x[i] = snake_x[i-1];
                snake_y[i] = snake_y[i-1];
            }
            snake_len++;
        } else {
            for (int i = snake_len - 1; i > 0; i--) {
                snake_x[i] = snake_x[i-1];
                snake_y[i] = snake_y[i-1];
            }
        }
        score += 10;
        draw_score();
    }

    snake_x[0] = new_x;
    snake_y[0] = new_y;
    if (ate) { place_food(); if (food_x) draw_food(); }

    draw_snake();
}

static void cleanup(void) {
    if (!raw_enabled) return;
    write_str("\033[0m\033[?25h\033[?1049l");
    disable_raw_mode();
}
static void stop(int sig) { (void)sig; quitting = 1; }
static long long milliseconds(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (long long)ts.tv_sec * 1000 + ts.tv_nsec / 1000000;
}
int main(int argc, char **argv) {
    if (argc == 2 && !strcmp(argv[1], "--help")) {
        puts("Snake: arrows/WASD/HJKL move; q or Ctrl-C quits; r restarts after game over.");
        return 0;
    }
    if (argc != 1) { fprintf(stderr, "Usage: snake [--help]\n"); return 2; }
    if (!isatty(0) || !isatty(1)) { fprintf(stderr, "snake: interactive terminal required\n"); return 1; }
    rng_state = 42;
    get_terminal_size();
    if (rows < 10 || cols < 20) { fprintf(stderr, "snake: terminal must be at least 20x10\n"); return 1; }
    if (rows > 22) rows = 22;
    if (cols > 60) cols = 60;
    if (enable_raw_mode() != 0) { perror("snake: termios"); return 1; }
    atexit(cleanup);
    signal(SIGTERM, stop); signal(SIGHUP, stop); signal(SIGINT, stop);
    write_str("\033[?1049h"); hide_cursor(); init_game();
    long long next = milliseconds() + 150;
    int announced = 0, new_dx = dir_x, new_dy = dir_y;
    while (!quitting) {
        fd_set rfds; FD_ZERO(&rfds); FD_SET(0, &rfds);
        long long remaining = next - milliseconds();
        if (remaining < 0) remaining = 0;
        if (remaining > 150 || game_over) remaining = 150;
        struct timeval tv = {0, (long)remaining * 1000};
        int ret = select(1, &rfds, NULL, NULL, &tv);
        if (ret < 0 && errno != EINTR) break;
        if (ret > 0) poll_key(&new_dx, &new_dy);
        if (quitting) break;
        if (!game_over && milliseconds() >= next) {
            dir_x = new_dx; dir_y = new_dy; step();
            next = milliseconds() + 150;
            announced = 0;
        }
        if (game_over && !announced) {
            move_cursor(rows / 2, 2);
            write_str("\033[1;31mGAME OVER\033[0m");
            move_cursor(rows / 2 + 1, 2);
            write_str("r: restart q: quit");
            announced = 1;
        }
    }
    cleanup();
    return 0;
}
