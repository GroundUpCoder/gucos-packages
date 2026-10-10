# ncurses

Retains historical6.5 narrow/wide static SDK, tools and complete terminfo data.
Both original configure flag sets remain; make runs serially. Build tools come
from core. The original artifact hash verifies and supplies the 2928-path
payload inventory only, with five symlink aliases represented as regular files.
Historical packaging metadata is excluded; upstream license is additionally
installed under share/licenses. No historical artifact is republished.

Retained tests exercise tic/infocmp roundtrip, tput256 colors, narrow windows,
wide CJK/combining/emoji cell widths and exact UTF-8 output fragments. They run
against the current staged/installed SDK. Fresh guest, binary and public gates
remain pending; no general interactive terminal compatibility claim yet.
