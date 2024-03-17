// circuit with single gate for now
var forwardMultiplyGate = function (x, y) { return x * y; };

/* The derivative d/dx f(x,y) is:
* f(x+h,y) - f(x,y) / h
*/

var x = -2, y = 3; 
var out = forwardMultiplyGate(x, y); // -6
var h = 0.0001;


// compute derivative with respect to x
var xph = x + h; // -1.9999
var out2 = forwardMultiplyGate(xph, y); // -5.9997
var x_derivative = (out2 - out) / h; // 3.0

// compute derivative with respect to y
var yph = y + h
var out3 = forwardMultiplyGate(x, yph); // -6.0002
var y_derivative = (out3 - out) / h; // -2.0

var step_size = 0.01
var out = forwardMultiplyGate(x, y); // before: -6
x = x + step_size * x_derivative; // x becomes -1.97
y = y + step_size * y_derivative; // y becomes 2.98
var out_new = forwardMultiplyGate(x, y); // -5.87! exciting
