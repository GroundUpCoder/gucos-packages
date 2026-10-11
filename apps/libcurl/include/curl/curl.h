/* gucOS HTTP-only, source-compatible libcurl subset. See README.md. */
#ifndef GUC_CURL_H
#define GUC_CURL_H
#include <stddef.h>
#include <stdio.h>
#ifdef __cplusplus
extern "C" {
#endif
typedef struct GucCurl CURL;
typedef long long curl_off_t;
typedef int CURLcode;
typedef int CURLoption;
typedef int CURLINFO;
struct curl_slist {
  char *data;
  struct curl_slist *next;
};
typedef size_t (*curl_write_callback)(char *, size_t, size_t, void *);
typedef int (*curl_xferinfo_callback)(void *, curl_off_t, curl_off_t,
                                      curl_off_t, curl_off_t);
#define CURL_GLOBAL_DEFAULT 3L
#define CURL_ERROR_SIZE 256
#define CURLE_OK 0
#define CURLE_UNSUPPORTED_PROTOCOL 1
#define CURLE_FAILED_INIT 2
#define CURLE_URL_MALFORMAT 3
#define CURLE_NOT_BUILT_IN 4
#define CURLE_HTTP_RETURNED_ERROR 22
#define CURLE_WRITE_ERROR 23
#define CURLE_OUT_OF_MEMORY 27
#define CURLE_OPERATION_TIMEDOUT 28
#define CURLE_ABORTED_BY_CALLBACK 42
#define CURLE_BAD_FUNCTION_ARGUMENT 43
#define CURLE_UNKNOWN_OPTION 48
#define CURLE_RECV_ERROR 56
#define CURLOPT_WRITEDATA 10001
#define CURLOPT_URL 10002
#define CURLOPT_ERRORBUFFER 10010
#define CURLOPT_POSTFIELDS 10015
#define CURLOPT_HTTPHEADER 10023
#define CURLOPT_HEADERDATA 10029
#define CURLOPT_CUSTOMREQUEST 10036
#define CURLOPT_XFERINFODATA 10057
#define CURLOPT_WRITEFUNCTION 20011
#define CURLOPT_HEADERFUNCTION 20079
#define CURLOPT_XFERINFOFUNCTION 20219
#define CURLOPT_TIMEOUT_MS 155
#define CURLOPT_CONNECTTIMEOUT_MS 156
#define CURLOPT_NOPROGRESS 43
#define CURLOPT_POST 47
#define CURLOPT_FAILONERROR 45
#define CURLOPT_FOLLOWLOCATION 52
#define CURLOPT_POSTFIELDSIZE 60
#define CURLOPT_HTTPGET 80
#define CURLOPT_NOSIGNAL 99
#define CURLINFO_RESPONSE_CODE 0x200002
#define CURLINFO_EFFECTIVE_URL 0x100001
CURLcode curl_global_init(long flags);
void curl_global_cleanup(void);
CURL *curl_easy_init(void);
void curl_easy_cleanup(CURL *);
void curl_easy_reset(CURL *);
CURLcode curl_easy_setopt(CURL *, CURLoption, ...);
CURLcode curl_easy_getinfo(CURL *, CURLINFO, ...);
CURLcode curl_easy_perform(CURL *);
const char *curl_easy_strerror(CURLcode);
struct curl_slist *curl_slist_append(struct curl_slist *, const char *);
void curl_slist_free_all(struct curl_slist *);
#ifdef __cplusplus
}
#endif
#endif
