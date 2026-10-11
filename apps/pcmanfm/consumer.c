/* Headless SDK adaptation of the retained libfm path/enumeration consumer.
 * This tests PCManFM's installed module header and dependency API, not its GUI. */
#include <pcmanfm-modules.h>
#include <gtk/gtk.h>
#include <assert.h>
#include <stdio.h>
#include <string.h>
int main(int argc, char **argv) {
    assert(argc == 2);
    assert(gtk_get_major_version() == 3 && gtk_get_minor_version() == 24);
    FmTabPageStatusInit callbacks = {0};
    assert(!callbacks.init && !callbacks.finalize && !callbacks.sel_message);
    assert(FM_MODULE_tab_page_status_VERSION == 1);
    /* Verify the same XDG-relative profile path used by app-config.c.
     * This is a headless lookup assertion, not execution of PCManFM. */
    const gchar *const *dirs = g_get_system_config_dirs();
    assert(dirs[0]);
    char *profile = g_build_filename(dirs[0], "pcmanfm", "default", "pcmanfm.conf", NULL);
    GKeyFile *cfg = g_key_file_new();
    assert(g_key_file_load_from_file(cfg, profile, 0, NULL));
    GError *error = NULL;
    assert(g_key_file_get_integer(cfg, "ui", "win_width", &error) == 640 && !error);
    assert(g_key_file_get_integer(cfg, "ui", "win_height", &error) == 480 && !error);
    g_key_file_free(cfg); g_free(profile);
    assert(fm_init(NULL));
    char *input = g_build_filename(argv[1], "nested", "..", "hello.txt", NULL);
    char *expected = g_build_filename(argv[1], "hello.txt", NULL);
    FmPath *path = fm_path_new_for_path(input);
    char *normalized = fm_path_to_str(path);
    assert(!strcmp(normalized, expected));
    g_free(normalized); fm_path_unref(path); g_free(input);
    path = fm_path_new_for_path(argv[1]);
    FmDirListJob *job = fm_dir_list_job_new2(path, FM_DIR_LIST_JOB_DETAILED);
    fm_path_unref(path);
    assert(fm_job_run_sync(FM_JOB(job)));
    assert(fm_file_info_list_get_length(fm_dir_list_job_get_files(job)) == 2);
    g_object_unref(job);
    char *bytes = NULL; gsize size = 0;
    assert(g_file_get_contents(expected, &bytes, &size, NULL));
    assert(size == 6 && !memcmp(bytes, "hello\n", 6));
    g_free(bytes); g_free(expected); fm_finalize();
    puts("PCMANFM-STAGED-SDK-PASS");
    return 0;
}
