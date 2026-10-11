/* Adapted from the exact retained source/tests/consumer.c.
 * TEST_ROOT isolates file fixtures; an argument selects the retained menu test. */
#include <libfm/fm.h>
#include <menu-cache.h>
#include <glib/gstdio.h>
#include <assert.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>
static void operation(FmFileOpType type,const char *from,const char *to){
 FmPathList *list=fm_path_list_new();FmPath *src=fm_path_new_for_path(from);fm_path_list_push_tail(list,src);fm_path_unref(src);
 FmFileOpsJob *job=fm_file_ops_job_new(type,list);fm_path_list_unref(list);
 if(to){FmPath *dest=fm_path_new_for_path(to);fm_file_ops_job_set_dest(job,dest);fm_path_unref(dest);}
 assert(fm_job_run_sync(FM_JOB(job)));g_object_unref(job);
}
int main(int argc, char **argv){
 if (argc == 2 && !strcmp(argv[1], "config")) {
 FmConfig *cfg=fm_config_new();assert(cfg);
 cfg->single_click=TRUE;cfg->thumbnail_max=-1;
 fm_config_load_from_file(cfg,NULL);
 assert(!cfg->single_click && cfg->thumbnail_max==2048);
 g_object_unref(cfg);puts("LIBFM-RELOCATED-CONFIG-PASS");return 0;
 }
 if (argc > 1) {
 alarm(30);menu_cache_init(0);MenuCache *cache=menu_cache_lookup_sync("test.menu");assert(cache);MenuCacheDir *root=menu_cache_dup_root_dir(cache);assert(root);
 MenuCacheItem *item=menu_cache_find_child_by_id(root,"fixture.desktop");assert(item);assert(!strcmp(menu_cache_item_get_name(item),"File Manager Fixture"));menu_cache_item_unref(item);menu_cache_item_unref((MenuCacheItem*)root);menu_cache_unref(cache);alarm(0);
 puts("LIBFM-MENU-CACHE-PASS");return 0;
 }
 assert(fm_init(NULL));
 FmPath *p=fm_path_new_for_path(TEST_ROOT "/source/nested/../hello.txt");char *s=fm_path_to_str(p);assert(!strcmp(s,TEST_ROOT "/source/hello.txt"));g_free(s);fm_path_unref(p);
 p=fm_path_new_for_path(TEST_ROOT "/source");FmDirListJob *ls=fm_dir_list_job_new2(p,FM_DIR_LIST_JOB_DETAILED);fm_path_unref(p);
 assert(fm_job_run_sync(FM_JOB(ls)));assert(fm_file_info_list_get_length(fm_dir_list_job_get_files(ls))==2);g_object_unref(ls);
 operation(FM_FILE_OP_COPY,TEST_ROOT "/source",TEST_ROOT "/copied");
 gsize n;char *text=NULL;assert(g_file_get_contents(TEST_ROOT "/copied/source/nested/data.txt",&text,&n,NULL));assert(n==12&&!memcmp(text,"nested data\n",12));g_free(text);
 operation(FM_FILE_OP_MOVE,TEST_ROOT "/copied/source",TEST_ROOT "/moved");
 assert(!g_file_test(TEST_ROOT "/copied/source",G_FILE_TEST_EXISTS));assert(g_file_test(TEST_ROOT "/moved/source/hello.txt",G_FILE_TEST_IS_REGULAR));
 text=NULL;assert(g_file_get_contents(TEST_ROOT "/moved/source/nested/data.txt",&text,&n,NULL));assert(n==12&&!memcmp(text,"nested data\n",12));g_free(text);
 text=NULL;assert(g_file_get_contents(TEST_ROOT "/moved/source/hello.txt",&text,&n,NULL));assert(n==6&&!memcmp(text,"hello\n",6));g_free(text);
 operation(FM_FILE_OP_DELETE,TEST_ROOT "/moved/source",NULL);assert(!g_file_test(TEST_ROOT "/moved/source",G_FILE_TEST_EXISTS));
 puts("LIBFM-FILE-OPERATIONS-PASS");fflush(stdout);
 fm_finalize();return 0;
}
