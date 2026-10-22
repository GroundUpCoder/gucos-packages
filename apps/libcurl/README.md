# libcurl HTTP subset 0.1.0

An original C implementation of a deliberately small libcurl **source API** for
gucOS platform 1.0.1. It is not upstream libcurl and does not claim binary or full
behavioral compatibility. Include `<curl/curl.h>` and link `-lcurl`.

Supported: global init/cleanup, easy init/reset/cleanup/setopt/getinfo/perform,
slist append/free, error strings; URL, GET/POST/custom method, borrowed POSTFIELDS
and POSTFIELDSIZE, HTTPHEADER, write/header callbacks and userdata, ERRORBUFFER,
FAILONERROR, TIMEOUT_MS, CONNECTTIMEOUT_MS, NOSIGNAL=1, NOPROGRESS and XFERINFO
callback/data; RESPONSE_CODE and EFFECTIVE_URL. Option numeric values match curl.
URL and custom method strings are copied; body/header-list/userdata lifetimes
extend through perform. Null write callbacks use fwrite and stdout by default.
Callbacks receive size=1 and byte count. Returning a short write aborts.

## Explicit limits

- **Set FOLLOWLOCATION=1 before perform.** Browser fetch always follows redirects;
  perform refuses without this opt-in. Setting FOLLOWLOCATION=0 fails. Redirect
  hops, per-hop headers, redirect limits and protocol restrictions are unavailable.
- HTTP(S) only. No sockets, DNS API, TLS customization, proxies, cookie jar,
  multipart helpers, streaming uploads, pause, multi API, or automatic retries.
- Browser CORS/header restrictions apply. Cookies are omitted. Response headers
  are browser-normalized, capped at the runtime's limit, and exclude headers
  hidden by CORS. Header callbacks get a **synthetic** HTTP/1.1 status line with
  no reason phrase, final exposed headers, and a blank line. This does not report
  the negotiated protocol. EFFECTIVE_URL is the final URL reported by fetch.
- CONNECTTIMEOUT_MS bounds arrival of response headers, not just connection
  establishment. Zero uses the platform's 30-second header default. TIMEOUT_MS
  is an overall deadline (zero disables it); the runtime body-idle deadline is
  disabled. Timeouts/cancellation are checked at most every 100ms between callbacks;
  a blocking application callback cannot be preempted.
- XFERINFO reports unknown download total as zero and buffered upload length;
  upload completion is submission to the runtime, not a wire progress measurement.
- All unsupported setopt/getinfo values fail explicitly. Do not ignore their
  return values. CURL_WRITEFUNC_PAUSE is unsupported; no silent success stubs.
- Same easy handle is not reentrant. Different handles can be driven by separate
  application threads. No thread setup is required by this library itself.

An ordinary portable consumer can use this subset against native libcurl on macOS.
Source/installed-consumer and real browser transport checks are required before
publication. See the release evidence for executed scope.
