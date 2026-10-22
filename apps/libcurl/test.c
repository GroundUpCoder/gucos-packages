#include <curl/curl.h>
#include <stdio.h>
int main(void) {
  CURL *c = curl_easy_init();
  long status = -1;
  if (!c)
    return 1;
  if (curl_easy_setopt(c, 987654, 1L) != CURLE_UNKNOWN_OPTION)
    return 2;
  if (curl_easy_setopt(c, CURLOPT_FOLLOWLOCATION, 0L) != CURLE_NOT_BUILT_IN)
    return 3;
  if (curl_easy_perform(c) != CURLE_NOT_BUILT_IN)
    return 4;
  if (curl_easy_setopt(c, CURLOPT_FOLLOWLOCATION, 1L))
    return 5;
  if (curl_easy_setopt(c, CURLOPT_URL, "file:///etc/passwd"))
    return 6;
  if (curl_easy_perform(c) != CURLE_UNSUPPORTED_PROTOCOL)
    return 7;
  if (curl_easy_getinfo(c, CURLINFO_RESPONSE_CODE, &status) || status)
    return 8;
  curl_easy_cleanup(c);
  puts("CURL-SUBSET-PASS");
  return 0;
}
