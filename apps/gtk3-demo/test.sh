#!/bin/sh
set -eu
unset DISPLAY
test -x "$DESTDIR/bin/gtk3-demo"
test -x "$DESTDIR/libexec/gtk3-demo"
cat > /tmp/gtk3-demo-expected.txt <<'EXPECTED'
Usage: gtk3-demo [--run NAME | --list]
Selected upstream GTK 3.24.43 demos; Escape closes a demo.
  drawingarea: Drawing Area: draw with the mouse
  editable_cells: Editable Cells: edit a shopping list
  panes: Panes: resize split views
  entry_buffer: Entry Buffer: linked text fields
  button_box: Button Boxes: explore layouts
  colorsel: Color Chooser: mix colors
  combobox: Combo Boxes: choose from lists and trees
  entry_completion: Entry Completion: type suggested words
  expander: Expander: reveal additional details
  hypertext: Hypertext: follow links in text
  search_entry: Search Entry: search and cancel
  list_store: List Store: toggle and sort bug reports
  tree_store: Tree Store: explore a holiday calendar
  flowbox: Flow Box: resize a wrapping color grid
EXPECTED
gtk3-x11-run "$DESTDIR/libexec/gtk3-demo" --list > /tmp/gtk3-demo-list.txt
gtk3-x11-run "$DESTDIR/libexec/gtk3-demo" --help > /tmp/gtk3-demo-help.txt
cmp /tmp/gtk3-demo-expected.txt /tmp/gtk3-demo-list.txt
cmp /tmp/gtk3-demo-expected.txt /tmp/gtk3-demo-help.txt
status=0
gtk3-x11-run "$DESTDIR/libexec/gtk3-demo" --run definitely-not-a-demo > /tmp/gtk3-demo-invalid.txt 2>&1 || status=$?
test "$status" -eq 2
printf 'Use gtk3-demo --list for available demos.\n' > /tmp/gtk3-demo-invalid-expected.txt
cmp /tmp/gtk3-demo-invalid-expected.txt /tmp/gtk3-demo-invalid.txt
echo GTK3-DEMO-HEADLESS-PASS
