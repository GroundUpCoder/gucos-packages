#define _POSIX_C_SOURCE 200809L
#include <curl/curl.h>
#include <errno.h>
#include <limits.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <sys/select.h>
#include <time.h>
#include <unistd.h>
#ifndef GUC_CURL_TEST
__import int __http_open(const char *, const char *, const char *, const void *,
                         int, int, int);
__import int __http_status(int, int *, char *, int);
__import int __http_error(int, char *, int);
#else
int __http_open(const char *, const char *, const char *, const void *, int,
                int, int);
int __http_status(int, int *, char *, int);
int __http_error(int, char *, int);
#endif
struct GucCurl {
  char *url, *method, *effective;
  const char *body;
  struct curl_slist *headers;
  char *error;
  void *write_data, *header_data, *progress_data;
  curl_write_callback write_cb, header_cb;
  curl_xferinfo_callback progress_cb;
  long body_size, timeout, connect_timeout, follow, post, fail, no_progress,
      status;
};
static double now_ms(void) {
  struct timespec t;
  clock_gettime(CLOCK_MONOTONIC, &t);
  return t.tv_sec * 1000.0 + t.tv_nsec / 1000000.0;
}
static char *copy(const char *s) {
  if (!s)
    return NULL;
  size_t n = strlen(s) + 1;
  char *p = malloc(n);
  if (p)
    memcpy(p, s, n);
  return p;
}
static CURLcode string_set(char **p, const char *s) {
  char *q = copy(s);
  if (s && !q)
    return CURLE_OUT_OF_MEMORY;
  free(*p);
  *p = q;
  return CURLE_OK;
}
CURLcode curl_global_init(long flags) {
  return (flags & ~3L) ? CURLE_BAD_FUNCTION_ARGUMENT : CURLE_OK;
}
void curl_global_cleanup(void) {}
void curl_easy_reset(CURL *c) {
  if (!c)
    return;
  free(c->url);
  free(c->method);
  free(c->effective);
  memset(c, 0, sizeof *c);
  c->body_size = -1;
  c->no_progress = 1;
}
CURL *curl_easy_init(void) {
  CURL *c = calloc(1, sizeof *c);
  if (c)
    curl_easy_reset(c);
  return c;
}
void curl_easy_cleanup(CURL *c) {
  if (c) {
    curl_easy_reset(c);
    free(c);
  }
}
struct curl_slist *curl_slist_append(struct curl_slist *h, const char *s) {
  if (!s)
    return NULL;
  struct curl_slist *n = calloc(1, sizeof *n);
  if (!n)
    return NULL;
  n->data = copy(s);
  if (!n->data) {
    free(n);
    return NULL;
  }
  if (!h)
    return n;
  struct curl_slist *p = h;
  while (p->next)
    p = p->next;
  p->next = n;
  return h;
}
void curl_slist_free_all(struct curl_slist *h) {
  while (h) {
    struct curl_slist *n = h->next;
    free(h->data);
    free(h);
    h = n;
  }
}
CURLcode curl_easy_setopt(CURL *c, CURLoption o, ...) {
  if (!c)
    return CURLE_BAD_FUNCTION_ARGUMENT;
  va_list a;
  va_start(a, o);
  CURLcode r = CURLE_OK;
  long v;
  switch (o) {
  case CURLOPT_URL:
    r = string_set(&c->url, va_arg(a, const char *));
    break;
  case CURLOPT_CUSTOMREQUEST:
    r = string_set(&c->method, va_arg(a, const char *));
    break;
  case CURLOPT_POSTFIELDS:
    c->body = va_arg(a, const char *);
    c->post = 1;
    break;
  case CURLOPT_POSTFIELDSIZE:
    v = va_arg(a, long);
    if (v < -1 || v > INT_MAX)
      r = CURLE_BAD_FUNCTION_ARGUMENT;
    else
      c->body_size = v;
    break;
  case CURLOPT_HTTPHEADER:
    c->headers = va_arg(a, struct curl_slist *);
    break;
  case CURLOPT_ERRORBUFFER:
    c->error = va_arg(a, char *);
    break;
  case CURLOPT_WRITEDATA:
    c->write_data = va_arg(a, void *);
    break;
  case CURLOPT_HEADERDATA:
    c->header_data = va_arg(a, void *);
    break;
  case CURLOPT_XFERINFODATA:
    c->progress_data = va_arg(a, void *);
    break;
  case CURLOPT_WRITEFUNCTION:
    c->write_cb = va_arg(a, curl_write_callback);
    break;
  case CURLOPT_HEADERFUNCTION:
    c->header_cb = va_arg(a, curl_write_callback);
    break;
  case CURLOPT_XFERINFOFUNCTION:
    c->progress_cb = va_arg(a, curl_xferinfo_callback);
    break;
  case CURLOPT_TIMEOUT_MS:
  case CURLOPT_CONNECTTIMEOUT_MS:
    v = va_arg(a, long);
    if (v < 0 || v > INT_MAX)
      r = CURLE_BAD_FUNCTION_ARGUMENT;
    else if (o == CURLOPT_TIMEOUT_MS)
      c->timeout = v;
    else
      c->connect_timeout = v;
    break;
  case CURLOPT_FOLLOWLOCATION:
    v = va_arg(a, long);
    if (v != 1)
      r = CURLE_NOT_BUILT_IN;
    else
      c->follow = 1;
    break;
  case CURLOPT_POST:
    c->post = !!va_arg(a, long);
    break;
  case CURLOPT_HTTPGET:
    if (va_arg(a, long))
      c->post = 0;
    break;
  case CURLOPT_FAILONERROR:
    c->fail = !!va_arg(a, long);
    break;
  case CURLOPT_NOPROGRESS:
    c->no_progress = !!va_arg(a, long);
    break;
  case CURLOPT_NOSIGNAL:
    if (va_arg(a, long) != 1)
      r = CURLE_NOT_BUILT_IN;
    break;
  default:
    r = CURLE_UNKNOWN_OPTION;
    break;
  }
  va_end(a);
  return r;
}
CURLcode curl_easy_getinfo(CURL *c, CURLINFO info, ...) {
  if (!c)
    return CURLE_BAD_FUNCTION_ARGUMENT;
  va_list a;
  va_start(a, info);
  CURLcode r = CURLE_OK;
  if (info == CURLINFO_RESPONSE_CODE) {
    long *p = va_arg(a, long *);
    if (p)
      *p = c->status;
    else
      r = CURLE_BAD_FUNCTION_ARGUMENT;
  } else if (info == CURLINFO_EFFECTIVE_URL) {
    char **p = va_arg(a, char **);
    if (p)
      *p = c->effective ? c->effective : c->url;
    else
      r = CURLE_BAD_FUNCTION_ARGUMENT;
  } else
    r = CURLE_UNKNOWN_OPTION;
  va_end(a);
  return r;
}
const char *curl_easy_strerror(CURLcode r) {
  switch (r) {
  case 0:
    return "No error";
  case 1:
    return "Only HTTP(S) is supported";
  case 2:
    return "Runtime HTTP transport unavailable";
  case 3:
    return "Invalid URL";
  case 4:
    return "Option/behavior unavailable in gucOS curl subset (explicit "
           "FOLLOWLOCATION=1 required)";
  case 22:
    return "HTTP status indicates failure";
  case 23:
    return "Write callback failed";
  case 27:
    return "Out of memory";
  case 28:
    return "Operation timed out";
  case 42:
    return "Aborted by callback";
  case 43:
    return "Invalid argument";
  case 48:
    return "Unsupported curl option";
  default:
    return "HTTP transport failed";
  }
}
static CURLcode failure(CURL *c, CURLcode r, int fd) {
  if (c->error) {
    c->error[0] = 0;
    if (fd >= 0)
      __http_error(fd, c->error, CURL_ERROR_SIZE);
    if (!c->error[0])
      snprintf(c->error, CURL_ERROR_SIZE, "%s", curl_easy_strerror(r));
  }
  if (fd >= 0)
    close(fd);
  return r;
}
static int emit_header(CURL *c, char *s, size_t n) {
  if (c->header_cb)
    return c->header_cb(s, 1, n, c->header_data) == n;
  if (c->header_data) {
    if (c->write_cb)
      return c->write_cb(s, 1, n, c->header_data) == n;
    return fwrite(s, 1, n, (FILE *)c->header_data) == n;
  }
  return 1;
}
CURLcode curl_easy_perform(CURL *c) {
  if (!c)
    return CURLE_BAD_FUNCTION_ARGUMENT;
  c->status = 0;
  free(c->effective);
  c->effective = NULL;
  if (c->error)
    c->error[0] = 0;
  if (!c->follow)
    return failure(c, CURLE_NOT_BUILT_IN, -1);
  if (!c->url)
    return failure(c, CURLE_URL_MALFORMAT, -1);
  if (strncmp(c->url, "https://", 8) && strncmp(c->url, "http://", 7))
    return failure(c, CURLE_UNSUPPORTED_PROTOCOL, -1);
  size_t hn = 1;
  for (struct curl_slist *p = c->headers; p; p = p->next) {
    size_t n = strlen(p->data);
    if (strchr(p->data, '\r') || strchr(p->data, '\n') ||
        !strchr(p->data, ':') || n > 65536 || hn > 65536 - n)
      return failure(c, CURLE_BAD_FUNCTION_ARGUMENT, -1);
    hn += n + 1;
  }
  char *headers = malloc(hn);
  if (!headers)
    return failure(c, CURLE_OUT_OF_MEMORY, -1);
  headers[0] = 0;
  for (struct curl_slist *p = c->headers; p; p = p->next) {
    strcat(headers, p->data);
    strcat(headers, "\n");
  }
  size_t len = c->post && c->body
                   ? (c->body_size < 0 ? strlen(c->body) : (size_t)c->body_size)
                   : 0;
  if (len > INT_MAX || (c->post && !c->body && c->body_size > 0)) {
    free(headers);
    return failure(c, CURLE_BAD_FUNCTION_ARGUMENT, -1);
  }
  double start = now_ms();
  if (!c->no_progress && c->progress_cb &&
      c->progress_cb(c->progress_data, 0, 0, 0, 0)) {
    free(headers);
    return failure(c, CURLE_ABORTED_BY_CALLBACK, -1);
  }
  int fd = __http_open(c->method ? c->method : (c->post ? "POST" : "GET"),
                       c->url, headers, c->post ? c->body : NULL,
                       c->post ? (int)len : 0, (int)c->connect_timeout, -1);
  free(headers);
  if (fd < 0)
    return failure(c, errno == ENOSYS ? CURLE_FAILED_INIT : CURLE_RECV_ERROR,
                   -1);
  if (fd >= FD_SETSIZE)
    return failure(c, CURLE_FAILED_INIT, fd);
  int got_status = 0;
  curl_off_t received = 0;
  char buf[16384];
  for (;;) {
    if (c->timeout && now_ms() - start >= c->timeout)
      return failure(c, CURLE_OPERATION_TIMEDOUT, fd);
    if (!c->no_progress && c->progress_cb &&
        c->progress_cb(c->progress_data, 0, received, (curl_off_t)len,
                       (curl_off_t)len))
      return failure(c, CURLE_ABORTED_BY_CALLBACK, fd);
    fd_set rd;
    FD_ZERO(&rd);
    FD_SET(fd, &rd);
    struct timeval tv = {0, 100000};
    int sel = select(fd + 1, &rd, NULL, NULL, &tv);
    if (sel < 0) {
      if (errno == EINTR)
        continue;
      return failure(c, CURLE_RECV_ERROR, fd);
    }
    if (!sel)
      continue;
    if (!got_status) {
      int status = 0;
      char h[65538];
      int n = __http_status(fd, &status, h, sizeof h - 2);
      if (n < 0) {
        if (errno == EAGAIN)
          continue;
        return failure(
            c, errno == ETIMEDOUT ? CURLE_OPERATION_TIMEDOUT : CURLE_RECV_ERROR,
            fd);
      }
      if (n > (int)sizeof h - 2)
        return failure(c, CURLE_RECV_ERROR, fd);
      h[n] = 0;
      got_status = 1;
      c->status = status;
      char first[64];
      int fn = snprintf(first, sizeof first, "HTTP/1.1 %d\r\n", status);
      if (!emit_header(c, first, (size_t)fn))
        return failure(c, CURLE_WRITE_ERROR, fd);
      char *p = h;
      while (*p) {
        char *end = strchr(p, '\n');
        if (end)
          *end = 0;
        if (!strncmp(p, "x-guc-final-url: ", 17)) {
          if (string_set(&c->effective, p + 17))
            return failure(c, CURLE_OUT_OF_MEMORY, fd);
        } else {
          size_t z = strlen(p);
          char *line = malloc(z + 3);
          if (!line)
            return failure(c, CURLE_OUT_OF_MEMORY, fd);
          memcpy(line, p, z);
          memcpy(line + z, "\r\n", 3);
          int ok = emit_header(c, line, z + 2);
          free(line);
          if (!ok)
            return failure(c, CURLE_WRITE_ERROR, fd);
        }
        if (!end)
          break;
        p = end + 1;
      }
      if (!emit_header(c, "\r\n", 2))
        return failure(c, CURLE_WRITE_ERROR, fd);
      if (c->fail && status >= 400)
        return failure(c, CURLE_HTTP_RETURNED_ERROR, fd);
    }
    ssize_t n = read(fd, buf, sizeof buf);
    if (!n) {
      close(fd);
      return CURLE_OK;
    }
    if (n < 0) {
      if (errno == EAGAIN || errno == EINTR)
        continue;
      return failure(
          c, errno == ETIMEDOUT ? CURLE_OPERATION_TIMEDOUT : CURLE_RECV_ERROR,
          fd);
    }
    size_t wrote = c->write_cb
                       ? c->write_cb(buf, 1, (size_t)n, c->write_data)
                       : fwrite(buf, 1, (size_t)n,
                                c->write_data ? (FILE *)c->write_data : stdout);
    if (wrote != (size_t)n)
      return failure(c, CURLE_WRITE_ERROR, fd);
    received += n;
  }
}
