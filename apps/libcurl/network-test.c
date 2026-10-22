#include <curl/curl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
struct bytes {
  char data[4096];
  size_t n;
};
static size_t collect(char *p, size_t size, size_t n, void *arg) {
  struct bytes *b = arg;
  size_t z = size * n;
  if (z >= sizeof b->data - b->n)
    return 0;
  memcpy(b->data + b->n, p, z);
  b->n += z;
  b->data[b->n] = 0;
  return z;
}
static size_t abort_write(char *p, size_t a, size_t b, void *ctx) {
  (void)p;
  (void)a;
  (void)b;
  (void)ctx;
  return 0;
}
static int cancel(void *p, curl_off_t a, curl_off_t b, curl_off_t c,
                  curl_off_t d) {
  (void)a;
  (void)b;
  (void)c;
  (void)d;
  return ++*(int *)p > 2;
}
#define CHECK(x)                                                               \
  do {                                                                         \
    if (!(x)) {                                                                \
      fprintf(stderr, "network check failed line %d: %s\n", __LINE__, #x);     \
      return 1;                                                                \
    }                                                                          \
  } while (0)
#define OPT(k, v) CHECK(curl_easy_setopt(c, k, v) == CURLE_OK)
int main(int argc, char **argv) {
  if (argc != 2)
    return 2;
  CHECK(curl_global_init(CURL_GLOBAL_DEFAULT) == CURLE_OK);
  CURL *c = curl_easy_init();
  CHECK(c);
  struct bytes body = {{0}, 0}, headers = {{0}, 0};
  char url[1024], error[CURL_ERROR_SIZE];
  long status;
  snprintf(url, sizeof url, "%s/echo", argv[1]);
  OPT(CURLOPT_URL, url);
  OPT(CURLOPT_FOLLOWLOCATION, 1L);
  OPT(CURLOPT_WRITEFUNCTION, collect);
  OPT(CURLOPT_WRITEDATA, (void *)&body);
  /* Header callback falls back to WRITEFUNCTION using HEADERDATA. */
  OPT(CURLOPT_HEADERDATA, (void *)&headers);
  OPT(CURLOPT_ERRORBUFFER, error);
  OPT(CURLOPT_TIMEOUT_MS, 5000L);
  struct curl_slist *hs =
      curl_slist_append(NULL, "Content-Type: application/octet-stream");
  CHECK(hs);
  OPT(CURLOPT_HTTPHEADER, hs);
  const char binary[] = {'a', 0, 'b'};
  OPT(CURLOPT_POSTFIELDS, binary);
  OPT(CURLOPT_POSTFIELDSIZE, 3L);
  CHECK(curl_easy_perform(c) == CURLE_OK);
  CHECK(body.n == 3 && !memcmp(body.data, binary, 3));
  CHECK(strstr(headers.data, "200"));
  CHECK(strstr(headers.data, "content-type:"));
  CHECK(curl_easy_getinfo(c, CURLINFO_RESPONSE_CODE, &status) == CURLE_OK &&
        status == 200);
  char *effective = NULL;
  CHECK(curl_easy_getinfo(c, CURLINFO_EFFECTIVE_URL, &effective) == CURLE_OK &&
        effective && strstr(effective, "/echo"));
  /* Switching to GET must not dereference a stale/nonexistent POST body. */
  OPT(CURLOPT_POSTFIELDS, (const char *)1);
  OPT(CURLOPT_POSTFIELDSIZE, -1L);
  OPT(CURLOPT_HTTPGET, 1L);
  snprintf(url, sizeof url, "%s/stream", argv[1]);
  OPT(CURLOPT_URL, url);
  body.n = headers.n = 0;
  CHECK(curl_easy_perform(c) == CURLE_OK);
  CHECK(!strcmp(body.data, "one-two-three"));
  snprintf(url, sizeof url, "%s/error", argv[1]);
  OPT(CURLOPT_URL, url);
  OPT(CURLOPT_FAILONERROR, 1L);
  CHECK(curl_easy_perform(c) == CURLE_HTTP_RETURNED_ERROR);
  CHECK(curl_easy_getinfo(c, CURLINFO_RESPONSE_CODE, &status) == CURLE_OK &&
        status == 429);
  CHECK(error[0]);
  OPT(CURLOPT_FAILONERROR, 0L);
  snprintf(url, sizeof url, "%s/stream", argv[1]);
  OPT(CURLOPT_URL, url);
  OPT(CURLOPT_WRITEFUNCTION, abort_write);
  OPT(CURLOPT_HEADERDATA, (void *)NULL);
  CHECK(curl_easy_perform(c) == CURLE_WRITE_ERROR);
  OPT(CURLOPT_WRITEFUNCTION, collect);
  body.n = 0;
  snprintf(url, sizeof url, "%s/stall", argv[1]);
  OPT(CURLOPT_URL, url);
  OPT(CURLOPT_TIMEOUT_MS, 150L);
  CHECK(curl_easy_perform(c) == CURLE_OPERATION_TIMEDOUT);
  OPT(CURLOPT_TIMEOUT_MS, 5000L);
  OPT(CURLOPT_NOPROGRESS, 0L);
  int progress = 0;
  OPT(CURLOPT_XFERINFOFUNCTION, cancel);
  OPT(CURLOPT_XFERINFODATA, (void *)&progress);
  CHECK(curl_easy_perform(c) == CURLE_ABORTED_BY_CALLBACK);
  curl_easy_cleanup(c);
  curl_slist_free_all(hs);
  curl_global_cleanup();
  puts("CURL-NETWORK-PASS");
  return 0;
}
