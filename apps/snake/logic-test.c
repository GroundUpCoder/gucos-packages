#define main snake_main
#include "main.c"
#undef main
#include <assert.h>
int main(void) {
 rows=12; cols=24; rng_state=42; init_game();
 assert(TICK_MS==100);
 int hx=snake_x[0],hy=snake_y[0];
 assert(!handle_input(27) && !handle_input('['));
 assert(snake_x[0]==hx && snake_y[0]==hy);
 assert(handle_input('A')==1 && snake_y[0]==hy-1);
 assert(handle_input('a')==1 && snake_x[0]==hx-1 && snake_y[0]==hy-1);
 assert(!handle_input('d') && snake_x[0]==hx-1); /* reversal ignored */
 assert(!handle_input('z') && snake_x[0]==hx-1);
 assert(handle_input('a')==1 && snake_x[0]==hx-2); /* same direction advances */
 init_game();
 int x=1,y=0; input_char(27,&x,&y); input_char('[',&x,&y); input_char('A',&x,&y);
 assert(x==0 && y==-1); x=1;y=0; input_char('a',&x,&y); assert(x==1 && y==0);
 snake_len=4; snake_x[0]=5;snake_y[0]=5;snake_x[1]=5;snake_y[1]=6;
 snake_x[2]=4;snake_y[2]=6;snake_x[3]=4;snake_y[3]=5;
 dir_x=-1;dir_y=0;food_x=10;food_y=10;game_over=0;step();
 assert(!game_over && snake_x[0]==4 && snake_y[0]==5);
 food_x=3;food_y=5;step();assert(!game_over && snake_len==5 && score==10);
 for(int i=0;i<snake_len;i++)assert(food_x!=snake_x[i] || food_y!=snake_y[i]);
 snake_x[0]=2;dir_x=-1;dir_y=0;step();assert(game_over);
 input_char('r',&x,&y);assert(!game_over && score==0 && snake_len==INITIAL_LEN);
 rows=MAX_ROWS;cols=MAX_COLS;game_over=0;snake_len=1;
 snake_x[0]=3;snake_y[0]=2;
 for(int row=2;row<rows-1;row++)for(int col=2;col<cols;col++) {
  if(row==2 && (col==2 || col==3))continue;
  snake_x[snake_len]=col;snake_y[snake_len++]=row;
 }
 assert(snake_len==MAX_SNAKE-1);dir_x=-1;dir_y=0;food_x=2;food_y=2;
 step();assert(game_over && snake_len==MAX_SNAKE && food_x==0 && food_y==0);
 input_char('q',&x,&y);assert(quitting);
 return 0;
}
