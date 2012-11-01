/*
  run as js -m -a -f test.js
*/
var size = 100000;
var array = new Float32Array(size);

array[0] = 0.1;
for(i = 1; i < size; i++)
  array[i] = array[i-1] + 0.5;

var op = 0;

for(j = 0; j < 250; j++) {
for(i = 1; i < size; i++) {
  array[i] = array[i-1] * array[i];
  op = op + 1;
}
}

print("Operaci " + op/1000000 + " Mil\n");

