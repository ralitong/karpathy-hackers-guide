// circuit with single gate for now
var forwardMultiplyGate = function (x, y) { return x * y; };

/* Analytic Gradient
*  d/dx f(x,y) = (f(x+h,y) - f(x,y)) / h
*  Recall that f(x,y) = xy
*  d/dx f(x,y) = ((x+h)y - xy) / h = y
*  d/dx f(x,y) = (xy + hy - xy) / h = y
*  d/dx f(x,y) = hy / h
*  d/dx f(x,y) = y
*  d/dy f(x,y) = (f(x,y+h) - f(x,y)) / h
*  d/dy f(x,y) = (x(y+h) - xy) / h = x
*  d/dy f(x,y) = (xy + xh - xy) / h = x
*  d/dy f(x,y) = xh / h
*  d/dy f(x,y) = x
*/

var x = -2, y = 3; // some input values
var out = forwardMultiplyGate(x, y); // -6
var x_gradient = y; // Recall d/dx f(x,y) = y, so gradient is y
var y_gradient = x; // Recall d/dy f(x,y) = x, so gradient is x

var step_size = 0.01;
x += step_size * x_gradient; // -2 + 0.03 = -1.97
y += step_size * y_gradient; // 3 + (0.01 * -2) = 2.98
var out_new = forwardMultiplyGate(x, y); // -5.87