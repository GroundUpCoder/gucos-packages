# gucode 0.1.0

Source project: https://github.com/josephkimgpt/gucode

Portable C coding agent, tested with DeepSeek on native macOS and gucOS. Streams
responses, inspects/edits files, runs commands, and optionally saves conversations.
Depends on this repository's documented libcurl subset. No direct runtime imports
or embedded JavaScript are added to the application.

```sh
gucman install groundupcoder:gucode
export DEEPSEEK_API_KEY='your-key'
gucode -C /home/user/project
```

Use `--key-file` for a private key file; `--session FILE` enables save/resume.
Edits and shell commands ask for permission unless `--yes` is explicitly set.
Shell commands are not sandboxed. Browser CORS and the core's automatic redirect
behavior apply. See upstream documentation for the precise feature/transport limits.

Source archive provenance and individual source hashes are in provenance.json.
The application and vendored cJSON license files are installed with the binary.
Build uses the guest compiler and installed libcurl archive, with platform target
wasm32-wasm-posix, minimum platform 1.0.1 and runtime ABI 5.

Version 0.1.1 checks `$HOME/.guc/creds/deepseek-api-key` first, followed by
`--key-file`, then `DEEPSEEK_API_KEY`. Missing default files fall back; invalid
or unreadable default files fail. `--yolo` is an alias for `--yes`, permitting
edits and shell actions without confirmation.

Malformed UTF-8 from binary tool output is replaced with valid Unicode before
API submission; affected saved conversations are repaired on resume. This release
also includes the upstream conversation/resource limits and session-preservation
changes pulled during release preparation. Exact scope and test provenance are
in `docs/research/gucode-0.1.1/`.
