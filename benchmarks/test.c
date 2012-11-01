/*
  Compile as gcc -O3
*/

#include <stdio.h>

void main(void)
{
  float array[100000];
  int i,j, operaci = 0;
  
  array[0] = 0.1;
  for(i = 1; i < 100000; i++)
    array[i] = array[i-1] + 0.5;
    
  for(j = 0; j < 10000; j++) {
    for(i = 1; i < 100000; i++) {
      array[i] = array[i-1] * array[i];
      operaci++;
    }
  }
  
  /* Do something with the numbers otherwise 
     gcc will optimize the whole code out
  */
  for(i = 0; i < 100000; i++)
    fprintf(stdin,"%f",array[i]);
  
  printf("Ops %dM\n",operaci/1000000);
}
