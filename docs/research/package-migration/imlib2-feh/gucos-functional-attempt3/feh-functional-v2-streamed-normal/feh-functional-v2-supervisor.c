/* Private proposed harness only. No signals, timeout success or package edits. */
#include <sys/types.h>
#include <sys/wait.h>
#include <spawn.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
extern char **environ;
static void record(const char *dir,const char *name,const char *text) {
 char path[512];
 if(snprintf(path,sizeof path,"%s/%s",dir,name)>=(int)sizeof path)exit(120);
 int fd=open(path,O_WRONLY|O_CREAT|O_EXCL,0600);if(fd<0)exit(121);
 size_t n=strlen(text),off=0;while(off<n){ssize_t k=write(fd,text+off,n-off);if(k<0&&errno==EINTR)continue;if(k<=0)exit(122);off+=(size_t)k;}
 if(close(fd))exit(123);
}
int main(int argc,char **argv) {
 if(argc!=2 || strncmp(argv[1],"/home/user/feh-functional-v2-",sizeof("/home/user/feh-functional-v2-")-1))return 119;
 char b[256];snprintf(b,sizeof b,"%ld\n",(long)getpid());record(argv[1],"supervisor.pid",b);
 char *args[]={"/usr/local/bin/desktop-menu","launch","feh.desktop",NULL};
 pid_t child;int rc=posix_spawn(&child,args[0],NULL,NULL,args,environ);
 if(rc){snprintf(b,sizeof b,"spawn_error=%d\n",rc);record(argv[1],"spawn.error",b);return 124;}
 snprintf(b,sizeof b,"%ld\n",(long)child);record(argv[1],"child.pid",b);
 int status;pid_t got;do{got=waitpid(child,&status,0);}while(got<0&&errno==EINTR);
 if(got!=child)return 125;
 snprintf(b,sizeof b,"{\"pid\":%ld,\"rawStatus\":%d,\"exited\":%d,\"exitCode\":%d,\"signaled\":%d,\"signal\":%d}\n",(long)child,status,!!WIFEXITED(status),WIFEXITED(status)?WEXITSTATUS(status):-1,!!WIFSIGNALED(status),WIFSIGNALED(status)?WTERMSIG(status):0);
 record(argv[1],"result.json",b);
 /* Separate readiness file: readers never parse a partial result. */
 record(argv[1],"done","done\n");
 return WIFEXITED(status)&&WEXITSTATUS(status)==0?0:126;
}
