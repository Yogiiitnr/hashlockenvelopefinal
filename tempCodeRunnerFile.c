#include<stdio.h>
int main()
{
int i,j,k;
for(i=1;i<=5;i++)
{
for(j=4;j>=i-1;j--)
{
printf(" ");
printf("\n");
}
for(k=1;k<=2*i-1;k++)
{
    printf("* ");
    
}
}
}