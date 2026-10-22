#include <gio/gio.h>
#include <gmodule.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
static int changed;
static void on_change(GFileMonitor *m,GFile *f,GFile *other,GFileMonitorEvent event,gpointer data) {
 char *base=g_file_get_basename(f);
 if(!strcmp(base,"observed.txt") && (event==G_FILE_MONITOR_EVENT_CREATED || event==G_FILE_MONITOR_EVENT_CHANGED || event==G_FILE_MONITOR_EVENT_CHANGES_DONE_HINT))changed++;
 g_free(base);
}
int main(void) {
 alarm(30);GError *error=NULL;int fd[2];g_assert_cmpint(socketpair(AF_UNIX,SOCK_STREAM,0,fd),==,0);
 GSocket *a=g_socket_new_from_fd(fd[0],&error);g_assert_no_error(error);g_assert_nonnull(a);
 GSocket *b=g_socket_new_from_fd(fd[1],&error);g_assert_no_error(error);g_assert_nonnull(b);
 g_assert_cmpint(g_socket_send(a,"migration",9,NULL,&error),==,9);g_assert_no_error(error);
 char bytes[16]={0};g_assert_cmpint(g_socket_receive(b,bytes,sizeof(bytes),NULL,&error),==,9);g_assert_no_error(error);g_assert_cmpstr(bytes,==,"migration");
 g_object_unref(a);g_object_unref(b);puts("GIO-UNIX-STREAM-PASS");
 char *dir=g_dir_make_tmp("migration-monitor-XXXXXX",&error);g_assert_no_error(error);g_assert_nonnull(dir);
 GFile *root=g_file_new_for_path(dir);GFileMonitor *monitor=g_file_monitor_directory(root,G_FILE_MONITOR_NONE,NULL,&error);g_assert_no_error(error);g_assert_nonnull(monitor);
 g_signal_connect(monitor,"changed",G_CALLBACK(on_change),NULL);
 GFile *file=g_file_get_child(root,"observed.txt");g_assert_true(g_file_replace_contents(file,"watched",7,NULL,FALSE,G_FILE_CREATE_NONE,NULL,NULL,&error));g_assert_no_error(error);
 gint64 deadline=g_get_monotonic_time()+5000000;
 while(!changed && g_get_monotonic_time()<deadline){while(g_main_context_iteration(NULL,FALSE)){}g_usleep(10000);}
 g_assert_cmpint(changed,>,0);g_file_monitor_cancel(monitor);g_object_unref(monitor);
 g_assert_true(g_file_delete(file,NULL,&error));g_assert_no_error(error);g_assert_true(g_file_delete(root,NULL,&error));g_assert_no_error(error);g_object_unref(file);g_object_unref(root);g_free(dir);puts("GIO-FILE-MONITOR-PASS");
 g_assert_true(g_module_supported());GModule *module=g_module_open("/tmp/migration-gio-module.so",G_MODULE_BIND_LOCAL);if(!module)g_error("%s",g_module_error());
 int (*answer)(void)=NULL;g_assert_true(g_module_symbol(module,"migration_answer",(gpointer*)&answer));g_assert_nonnull(answer);g_assert_cmpint(answer(),==,42);g_assert_true(g_module_close(module));puts("GMODULE-LOAD-PASS");
 puts("GIO-INSTALLED-CONSUMER-PASS");return 0;
}
