/* Copyright 2026 GroundUpCoder. SPDX-License-Identifier: Apache-2.0 */
#define _POSIX_C_SOURCE 200809L
#include <dirent.h>
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>
#ifndef PREFIX
#define PREFIX "/usr/local"
#endif
#define APPS PREFIX "/share/applications/"
#define STATE PREFIX "/lib/gucman/packages/"
#define LIMIT 65536
#define ARGS 128
struct entry { char *name,*exec,*tryexec,*icon,*type; int terminal,hidden,blocked; };
static void clear(struct entry *e) {
 free(e->name); free(e->exec); free(e->tryexec); free(e->icon); free(e->type); memset(e,0,sizeof *e);
}
static int id_ok(const char *s) {
 size_t n=strlen(s); if(n<9||n>200||strcmp(s+n-8,".desktop"))return 0;
 for(size_t i=0;i<n;i++)if(!strchr("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.+-",s[i]))return 0;
 return s[0]!='.';
}
/* Receipts, not directory presence alone, establish v1 package ownership. */
static int owned(const char *id,char *path) {
 char target[PATH_MAX], expected[PATH_MAX], paths[PATH_MAX], line[PATH_MAX];
 snprintf(path,PATH_MAX,APPS "%s",id);
 ssize_t n=readlink(path,target,sizeof target-1); if(n<0||n>=(ssize_t)sizeof target-1)return 0; target[n]=0;
 if(strncmp(target,STATE,strlen(STATE)))return 0;
 char *owner=target+strlen(STATE),*slash=strchr(owner,'/'); if(!slash||slash==owner||slash-owner>100)return 0;
 for(char *p=owner;p<slash;p++)if(!strchr("abcdefghijklmnopqrstuvwxyz0123456789+.-",*p))return 0;
 if(owner[0]=='.'||owner[0]=='-'||owner[0]=='+')return 0;
 *slash=0;
 snprintf(expected,sizeof expected,STATE "%s/current/share/applications/%s",owner,id);
 *slash='/'; if(strcmp(target,expected))return 0;
 *slash=0; snprintf(paths,sizeof paths,STATE "%s/current/paths",owner);
 FILE *f=fopen(paths,"r"); if(!f)return 0;
 snprintf(expected,sizeof expected,"share/applications/%s\n",id);
 int found=0; size_t count=0;
 while(fgets(line,sizeof line,f)&&++count<=100000)if(!strcmp(line,expected)){found=1;break;}
 fclose(f); return found;
}
static int xml_utf8(const unsigned char *s) {
 while(*s){
  unsigned c=*s++,value;int n;
  if(c<128){if(c<32||c==127)return 0;continue;}
  if(c>=0xc2&&c<=0xdf){value=c&31;n=1;}
  else if(c>=0xe0&&c<=0xef){value=c&15;n=2;}
  else if(c>=0xf0&&c<=0xf4){value=c&7;n=3;}
  else return 0;
  for(int i=0;i<n;i++){if((*s&0xc0)!=0x80)return 0;value=(value<<6)|(*s++&63);}
  if((n==2&&value<0x800)||(n==3&&value<0x10000)||value>0x10ffff||
     (value>=0xd800&&value<=0xdfff)||value==0xfffe||value==0xffff)return 0;
 }
 return 1;
}
static char *unescape(const char *s) {
 char *r=malloc(strlen(s)+1),*out=r; if(!r)return NULL;
 while(*s){
  unsigned char c=*s++;
  if(c=='\\'){
   c=*s++; if(!c){free(r);return NULL;}
   if(c=='s')c=' '; else if(c=='n')c='\n'; else if(c=='t')c='\t'; else if(c=='r')c='\r';
   else if(c!='\\'){free(r);return NULL;}
  }
  /* No control characters in display text or executable arguments. */
  if(c<32||c==127){free(r);return NULL;} *out++=c;
 }
 *out=0;if(!xml_utf8((unsigned char *)r)){free(r);return NULL;} return r;
}
static int boolean(const char *s,int *value) {
 if(!strcmp(s,"true")){*value=1;return 1;} if(!strcmp(s,"false")){*value=0;return 1;} return 0;
}
static int read_entry(const char *path,struct entry *e) {
 FILE *f=fopen(path,"rb"); if(!f)return 0;
 char *data=malloc(LIMIT+1); if(!data){fclose(f);return 0;}
 size_t len=fread(data,1,LIMIT+1,f); int ok=!ferror(f)&&len<=LIMIT&&!memchr(data,0,len); fclose(f);
 if(!ok){free(data);return 0;} data[len]=0;
 int group=0,seen_group=0; unsigned seen=0;
 char *line=data;
 while(line&&ok){
  char *next=strchr(line,'\n');if(next)*next++=0;
  size_t n=strlen(line); if(n&&line[n-1]=='\r')line[n-1]=0;
  if(*line=='['){group=!strcmp(line,"[Desktop Entry]");if(group&&seen_group++)ok=0;}
  else if(group&&*line&&*line!='#'){
   char *eq=strchr(line,'='); if(!eq){ok=0;break;} *eq++=0;
   const char *keys[]={"Type","Name","Exec","TryExec","Icon","Terminal","Hidden","NoDisplay","DBusActivatable","Path","OnlyShowIn","NotShowIn"};
   int key=-1;for(int i=0;i<12;i++)if(!strcmp(line,keys[i]))key=i;
   if(key>=0){
    if(seen&(1u<<key)){ok=0;break;} seen|=1u<<key;
    char *v=unescape(eq); if(!v){ok=0;break;}
    if(key==0)e->type=v; else if(key==1)e->name=v; else if(key==2)e->exec=v; else if(key==3)e->tryexec=v; else if(key==4)e->icon=v;
    else {
     int b=0;
     if(key<9){ok=boolean(v,&b);if(key==5)e->terminal=b;else if(b){if(key==8)e->blocked=1;else e->hidden=1;}}
     else if(*v)e->blocked=1;
     free(v);
    }
   }
  }
  line=next;
 }
 free(data);
 return ok&&seen_group&&e->type&&!strcmp(e->type,"Application")&&e->name&&*e->name&&e->exec&&*e->exec&&!e->hidden&&!e->blocked;
}
static void free_args(char **a) {for(int i=0;a[i];i++)free(a[i]);}
static int append(char **a,int *n,const char *s) {
 if(*n>=ARGS-8)return 0; a[*n]=strdup(s);if(!a[*n])return 0;(*n)++;a[*n]=NULL;return 1;
}
/* Deliberately bounded freedesktop profile. Field codes stand alone. */
static int arguments(struct entry *e,const char *path,char **a) {
 const char *s=e->exec; int n=0,files=0;
 while(*s){
  while(*s==' ')s++;if(!*s)break;
  char token[LIMIT+1];size_t used=0;int quote=*s=='"',closed=!quote;if(quote)s++;
  while(*s){
   char c=*s++;
   if(quote){
    if(c=='"'){closed=1;break;}
    if(c=='\\'){c=*s++;if(!c||!strchr("\"`$\\",c))return 0;}
    else if(c=='$'||c=='`')return 0;
   }else{
    if(c==' ')break;
    if(strchr("\t\n\"'\\><~|&;$*?#()`",c))return 0;
   }
   token[used++]=c;
  }
  if(!closed||(quote&&*s&&*s!=' '))return 0; token[used]=0;
  if(!n&&(!*token||strchr(token,'=')||strchr(token,'%')))return 0;
  if(strchr(token,'%')){
   if(quote)return 0;
   if(token[0]=='%'&&token[1]&&token[2]==0&&token[1]!='%'){
    char c=token[1];
    if(strchr("fuFU",c)){if(files++)return 0;continue;}
    if(strchr("dDnNvm",c))continue;
    if(c=='c'){if(!append(a,&n,e->name))return 0;continue;}
    if(c=='k'){if(!append(a,&n,path))return 0;continue;}
    if(c=='i'){if(e->icon&&*e->icon&&(!append(a,&n,"--icon")||!append(a,&n,e->icon)))return 0;continue;}
    return 0;
   }
   char *p=token,*out=token;
   while(*p){if(*p=='%'&&*++p!='%')return 0;*out++=*p++;}*out=0;
  }
  if(!append(a,&n,token))return 0;
 }
 return n>0;
}
static int executable(const char *name,char *out) {
 if(strchr(name,'/')){
  if(*name!='/'||strlen(name)>=PATH_MAX)return 0;strcpy(out,name);
  struct stat st;return !stat(out,&st)&&S_ISREG(st.st_mode)&&!access(out,X_OK);
 }
 const char *dirs[]={PREFIX "/bin",PREFIX "/sbin","/usr/bin","/bin",NULL};
 for(int i=0;dirs[i];i++){
  if(snprintf(out,PATH_MAX,"%s/%s",dirs[i],name)>=PATH_MAX)continue;
  struct stat st;if(!stat(out,&st)&&S_ISREG(st.st_mode)&&!access(out,X_OK))return 1;
 }
 return 0;
}
static int load(const char *id,struct entry *e,char **args,char *path,char *program,char *terminal) {
 char try_path[PATH_MAX];
 return id_ok(id)&&owned(id,path)&&read_entry(path,e)&&arguments(e,path,args)&&
  executable(args[0],program)&&(!e->tryexec||!*e->tryexec||executable(e->tryexec,try_path))&&
  (!e->terminal||executable("xterm",terminal));
}
static void xml(const char *s) {
 for(;*s;s++)switch(*s){case '&':fputs("&amp;",stdout);break;case '<':fputs("&lt;",stdout);break;case '>':fputs("&gt;",stdout);break;case '"':fputs("&quot;",stdout);break;case '\'':fputs("&apos;",stdout);break;default:putchar(*s);}
}
static int compare(const void *a,const void *b){return strcmp(*(char *const *)a,*(char *const *)b);}
int main(int argc,char **argv) {
 if(argc==2&&!strcmp(argv[1],"--help")){puts("desktop-menu jwm-items | launch FILE.desktop\nInstalled package entries only; see share/doc/desktop-entries/README.md");return 0;}
 if(argc==3&&!strcmp(argv[1],"launch")){
  struct entry e={0};char *args[ARGS]={0},path[PATH_MAX],program[PATH_MAX],terminal[PATH_MAX];
  if(!load(argv[2],&e,args,path,program,terminal)){fputs("desktop-menu: unavailable or unsupported entry\n",stderr);free_args(args);clear(&e);return 1;}
  if(e.terminal){
   char *cmd[ARGS+8]={terminal,"-fn","fixed","-title",e.name,"-e",program};
   int i=1;for(;args[i];i++)cmd[i+6]=args[i];cmd[i+6]=NULL;execv(terminal,cmd);
  }else execv(program,args);
  perror("desktop-menu exec");free_args(args);clear(&e);return 126;
 }
 if(argc==2&&!strcmp(argv[1],"jwm-items")){
  DIR *d=opendir(APPS);if(!d)return errno==ENOENT?0:1;
  char *ids[1024];size_t count=0;struct dirent *de;
  while((de=readdir(d)))if(id_ok(de->d_name)){
   if(count==1024){closedir(d);for(size_t i=0;i<count;i++)free(ids[i]);fputs("desktop-menu: too many entries\n",stderr);return 1;}
   ids[count]=strdup(de->d_name);if(!ids[count]){closedir(d);for(size_t i=0;i<count;i++)free(ids[i]);return 1;}count++;
  }
  closedir(d);qsort(ids,count,sizeof *ids,compare);
  for(size_t i=0;i<count;i++){
   struct entry e={0};char *args[ARGS]={0},path[PATH_MAX],program[PATH_MAX],terminal[PATH_MAX];
   if(load(ids[i],&e,args,path,program,terminal)){
    fputs("<Program label=\"",stdout);xml(e.name);fputs("\">" PREFIX "/bin/desktop-menu launch ",stdout);fputs(ids[i],stdout);puts("</Program>");
   }
   free_args(args);clear(&e);free(ids[i]);
  }
  return ferror(stdout)?1:0;
 }
 fputs("usage: desktop-menu jwm-items | launch FILE.desktop\n",stderr);return 2;
}
