#include <gio/gio.h>
#include <stdio.h>
int main(int argc,char **argv) {
 g_assert_cmpint(argc,==,2);GError *error=NULL;
 GSettingsSchemaSource *source=g_settings_schema_source_new_from_directory(argv[1],NULL,FALSE,&error);g_assert_no_error(error);g_assert_nonnull(source);
 const char *names[]={"org.gtk.Settings.ColorChooser","org.gtk.Settings.Debug","org.gtk.Settings.EmojiChooser","org.gtk.Settings.FileChooser"};
 for(unsigned i=0;i<4;i++) {
  GSettingsSchema *schema=g_settings_schema_source_lookup(source,names[i],FALSE);g_assert_nonnull(schema);
  gchar **keys=g_settings_schema_list_keys(schema);g_assert_nonnull(keys);g_assert_nonnull(keys[0]);unsigned count=0;
  for(char **k=keys;*k;k++) {GSettingsSchemaKey *key=g_settings_schema_get_key(schema,*k);g_assert_nonnull(key);GVariant *value=g_settings_schema_key_get_default_value(key);g_assert_nonnull(value);g_assert_true(g_variant_is_of_type(value,g_settings_schema_key_get_value_type(key)));g_variant_unref(value);g_settings_schema_key_unref(key);count++;}
  printf("SCHEMA-PASS %s %u keys\n",names[i],count);g_strfreev(keys);g_settings_schema_unref(schema);
 }
 g_settings_schema_source_unref(source);puts("GTK-SCHEMAS-ALL-PASS");return 0;
}
