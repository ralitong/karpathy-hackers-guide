var forwardMultiplyGate = function (x, y) { return x * y; };
var forwardAddGate = function (a, b) { return a + b };
var forwardCircuit = function (x, y, z) {
    var q = forwardAddGate(x, y);
    var f = forwardMultiplyGate(q, z);
    return f;
}

// f(q,z) = qz
// d/dq f(q,z) = z
// d/dz f(q,z) = q

// q is a function(x,y) where f(x,y) = x + y
// ... or q(x,y) = x + y

// Getting the derivative of q(x,y) = x + y with respect to x
// d/dx q(x,y) = d/dx x + d/dx y

// d/dx q(x,y) = d/dx x + d/dx y
// d/dx q(x,y) = 1 + 0       
// Why is d/dx y = 0? Because y is a constant and y is not a function of x. Or y is not dependent on x.
// Getting the derivative of a constant is 0.
// d/dx q(x,y) = 1

// Getting the derivative of q(x,y) = x + y with respect to y
// d/dy q(x,y) = 0 + 1
// d/dy q(x,y) = 1

// f(q,z) = f(q(x,y),z) = qz
// d/dx f(q,z) = d/dx f(q(x,y),z)
// Using the chain rule d/dx f(g(x)) = f'(g(x)) * g'(x)
// The chain rule simply means multiply the derivative of the outer function by the derivative of the inner function.
// d/dx f(q,z) = d/dq f(q,z) * d/dx q(x,y)

// Okay, remember that forwardAddGate is q = x + y or q(x,y) = x + y
// and forwardMultiplyGate is f(q,z) = qz
// you could say that f(q,z) = f(q(x,y),z)

// Let's implement d/dx f(q,z) = d/dq f(q,z) * d/dx q(x,y) in code

var x = -2, y = 5, z = -4;
var q = forwardAddGate(x, y); // q = 3
var f = forwardMultiplyGate(q, z); // f = -12

// gradient of the MULTIPLY gate with respect to its inputs
// wrt is short for "with respect to"
// Remember that getting d/dq f(q,z) where f(q,z) = qz
// is d/dq f(q,z) = z
// and d/dz f(q,z) = q
var derivative_f_wrt_z = q // 3
var derivative_f_wrt_q = z // -4

// derivative of the ADD gate with respect to its inputs
// Remember that d/dx q(x,y) where q(x,y) = x + y
// d/dx q(x,y) = d/dx x + d/dx y
// d/dx q(x,y) = x^1-0 + 0 Again remember that y is an independent variable and is treated as a constant, so y is zero
// d/dx q(x,y) = x^0
// d/dx q(x,y) = 1

// Also if getting the derivative of q(x,y) with respective to y is also 1
// d/dy q(x,y) = 1

var derivative_q_wrt_x = 1.0;
var derivative_q_wrt_y = 1.0;

// chain rule d/dx f(q,z) = d/dq f(q,z) * d/dx q(x,y) in code
var derivative_f_wrt_x = derivative_f_wrt_q * derivative_q_wrt_x; // -4
var derivative_f_wrt_y = derivative_f_wrt_q * derivative_q_wrt_y; // -4

// final gradient, from above: [-4, -4, 3]
var gradient_f_wrt_xyz = [derivative_f_wrt_x, derivative_f_wrt_y, derivative_f_wrt_z]

// let the inputs respond to the force/tug:
step_size = 0.01
x = x + step_size * derivative_f_wrt_x; // -2.04
y = y + step_size * derivative_f_wrt_y; // 4.94
z = z + step_size * derivative_f_wrt_z; // -3.97

console.log('x with force is', x);
console.log('y with force is', y);
console.log('z with force is', z);

// Our circuit now better give higher output:
var q = forwardAddGate(x, y); // q becomes 2.92
var f = forwardMultiplyGate(q, z); // output is -11.59, up from -12! Nice!