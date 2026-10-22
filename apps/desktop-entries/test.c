#define main desktop_main
#include "main.c"
#undef main
#include <assert.h>
static void good(const char *text,const char *expected[],int count) {
 struct entry e={0};e.exec=(char *)text;e.name="Name & \"label\"";e.icon="an icon";
 char *args[ARGS]={0};assert(arguments(&e,"/a/test.desktop",args));
 int n=0;while(args[n])n++;assert(n==count);
 for(int i=0;i<n;i++)assert(!strcmp(args[i],expected[i]));free_args(args);
}
static void bad(const char *text) {
 struct entry e={0};e.exec=(char *)text;e.name="Name";
 char *args[ARGS]={0};assert(!arguments(&e,"/test.desktop",args));free_args(args);
}
static int read_text(const char *text,struct entry *e) {
 char path[]="/tmp/desktop-profile.XXXXXX";int fd=mkstemp(path);assert(fd>=0);
 assert(write(fd,text,strlen(text))==(ssize_t)strlen(text));assert(!close(fd));
 int ok=read_entry(path,e);assert(!unlink(path));return ok;
}
int main(void) {
 assert(xml_utf8((const unsigned char *)"뱀 🐍 & \"text\""));
 assert(!xml_utf8((const unsigned char *)"\xc0\xaf"));assert(!xml_utf8((const unsigned char *)"\xed\xa0\x80"));
 assert(!xml_utf8((const unsigned char *)"\xef\xbf\xbe"));assert(!xml_utf8((const unsigned char *)"\xf4\x90\x80\x80"));
 assert(!xml_utf8((const unsigned char *)"\xe2\x82"));assert(!xml_utf8((const unsigned char *)"\x80"));
 const char *a[]={"prog","literal; & | $(x)","","100%","Name & \"label\"","/a/test.desktop","--icon","an icon"};
 good("prog \"literal; & | \\$(x)\" \"\" 100%% %c %k %i %F",a,8);
 const char *b[]={"prog","a\"b","a\\b","`x`"};good("prog \"a\\\"b\" \"a\\\\b\" \"\\`x\\`\"",b,4);
 bad("prog ; touch /tmp/never");bad("prog $(x)");bad("prog \"$x\"");bad("prog 'arg'");
 bad("prog %Z");bad("prog prefix%c");bad("prog \"%c\"");bad("prog %F %u");bad("%c");bad("x=y");
 bad("prog \"no close");bad("prog \"mixed\"suffix");bad("prog %");bad("prog abc%z");
 struct entry e={0};
 assert(read_text("# comment\n\n[Desktop Entry]\nType=Application\nName=A & B\n\nExec=prog\nTerminal=true\n",&e));assert(e.terminal);clear(&e);
 assert(!read_text("[Desktop Entry]\nType=Application\nName=Name\nExec=prog\nHidden=true\n",&e));clear(&e);
 assert(!read_text("[Desktop Entry]\nType=Application\nName=Name\nName=duplicate\nExec=prog\n",&e));clear(&e);
 assert(!read_text("[Desktop Entry]\nType=Application\nName=Name\nExec=prog\nTerminal=yes\n",&e));clear(&e);
 assert(!read_text("[Desktop Entry]\nType=Application\nName=Name\nExec=prog\nPath=/tmp\n",&e));clear(&e);
 assert(!read_text("[Desktop Entry]\nType=Application\nName=Name\nExec=prog\nDBusActivatable=true\n",&e));clear(&e);
 assert(!read_text("[Desktop Entry]\nType=Application\nName=Name\\nInjected\nExec=prog\n",&e));clear(&e);
 assert(id_ok("wasm-posix-snake.desktop"));assert(!id_ok("../escape.desktop"));assert(!id_ok("x;bad.desktop"));
 puts("desktop entry parser tests passed");return 0;
}
