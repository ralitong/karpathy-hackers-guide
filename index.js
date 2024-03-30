// every Unit corresponds to a wire in the diagrams
var Unit = function (value, gradient) {
    // value computed in the forward pass
    this.value = value
    // the derivative of the circuit output with respect to this unit, computed in backward pass
    this.gradient = gradient;
}

var multiplyGate = function () { }

multiplyGate.prototype = {
    forward: function (u0, u1) {
        // store pointers to input Units u0 and u1 and output unit utop
        this.u0 = u0;
        this.u1 = u1;
        this.utop = new Unit(u0.value * u1.value, 0.0);
        return this.utop;
    },
    backward: function () {
        // take the gradient in output unit and chain it with the
        // local gradients, which we derived for multiply gate before
        // then write those gradients to those Units.

        // To take the partial derivative with respect to other gates
        // i.e. The output of this gate can be an input of another function

        // We first take the local derivatives of this multiply gate first
        // local partial derivative of this multiply gate w.r.t. to u0
        // = u1
        // local partial derivative of this multiply gate w.r.t. to u1
        // = u0

        // And using the chain rule
        // chain rule = local partial derivative * output circuit derivative
        // partial derivative for the whole circuit w.r.t u0
        // = u1 * output circuit derivative
        // partial derivative for the whole circuit w.r.t u1
        // = u0 * output circuit derivative
        // this.utop represents the ouput wire so
        // output circuit derivative = this.utop.gradient
        this.u0.gradient += this.u1.value * this.utop.gradient;
        this.u1.gradient += this.u0.value * this.utop.gradient;
    }
}

var addGate = function () { }
addGate.prototype = {
    forward: function (u0, u1) {
        this.u0 = u0;
        this.u1 = u1;
        this.utop = new Unit(u0.value + u1.value, 0.0);
        return this.utop;
    },
    backward: function () {
        // add gate. derivative wrt both inputs is 1
        this.u0.gradient += 1 * this.utop.gradient;
        this.u1.gradient += 1 * this.utop.gradient;
    }
}

var sigmoidGate = function () {
    // helper function
    this.sig = function (x) { return 1 / (1 + Math.exp(-x)) };
}

sigmoidGate.prototype = {
    forward: function (u0) {
        this.u0 = u0;
        this.utop = new Unit(this.sig(this.u0.value), 0.0);
        return this.utop;
    },
    backward: function () {
        var s = this.sig(this.u0.value)
        this.u0.gradient += (s * (1 - s)) * this.utop.gradient;
    }
}

// A circuit: it takes 5 Units (x,y,a,b,c) and outputs a single Unit
// It can also compute the gradient w.r.t. its inputs

var Circuit = function () {
    // creat some gates
    this.mulg0 = new multiplyGate();
    this.mulg1 = new multiplyGate();
    this.addg0 = new addGate();
    this.addg1 = new addGate();
}

Circuit.prototype = {
    forward: function (x, y, a, b, c) {
        this.ax = this.mulg0.forward(a, x); // a*x
        this.by = this.mulg1.forward(b, y); // b*y
        this.ax_plus_by = this.addg0.forward(this.ax, this.by); // a*x + b*y
        this.ax_plus_by_plus_c = this.addg1.forward(this.ax_plus_by, c); // a*x + b*y + c
        return this.ax_plus_by_plus_c;
    },
    backward: function (gradient_top) { // takes pull from aboe
        this.ax_plus_by_plus_c.gradient = gradient_top;
        this.addg1.backward();
        this.addg0.backward();
        this.mulg1.backward();
        this.mulg0.backward();
    }
}

// SVM class
var SVM = function () {
    // random initial parameter values
    this.a = new Unit(1.0, 0.0);
    this.b = new Unit(-2.0, 0.0);
    this.c = new Unit(-1.0, 0.0);

    this.circuit = new Circuit();
};

SVM.prototype = {
    forward: function (x, y) { // assume x and y are units
        this.unit_out = this.circuit.forward(x, y, this.a, this.b, this.c);
        return this.unit_out;
    },
    backward: function (label) { // label is +1 or -1
        // reset pulls on a,b,c
        this.a.gradient = 0.0;
        this.b.gradient = 0.0;
        this.c.gradient = 0.0;

        // compute hte pull based on what the circuit output was
        var pull = 0.0;
        if (label === 1 && this.unit_out.value < 1) {
            pull = 1; // the score was too low: pull up
        }
        if (label === -1 && this.unit_out.value > -1) {
            pull = -1; // the score was too high for a positive example, pull down
        }
        this.circuit.backward(pull); // writes gradient into x,y,a,b,c

        // add regularization pull for parameters: towards zero and proportional to value
        this.a.gradient += -this.a.value
        this.b.gradient += -this.b.value
    },
    parameterUpdate: function () {
        var step_size = 0.01;
        this.a.value += step_size * this.a.gradient;
        this.b.value += step_size * this.b.gradient;
        this.c.value += step_size * this.c.gradient;
    },
    learnFrom: function (x, y, label) {
        this.forward(x, y);
        this.backward(label);
        this.parameterUpdate();
    }
};

// Training the SVM with Stochastic Gradient Descent
var data = []; var labels = [];
data.push([1.2, 0.7]); labels.push(1);
data.push([-0.3, -0.5]); labels.push(-1);
data.push([3.0, 0.1]); labels.push(1);
data.push([-0.1, -1.0]); labels.push(-1);
data.push([-1.0, 1.1]); labels.push(-1);
data.push([2.1, -3]); labels.push(1);
var svm = new SVM();

var evalTrainingAccuracy = function () {
    var num_correct = 0;
    for (var i = 0; i < data.length; i++) {
        var x = new Unit(data[i][0], 0.0);
        var y = new Unit(data[i][1], 0.0);
        var true_label = labels[i];

        // see if the predictions matches the provided label
        var predicted_label = svm.forward(x, y).value > 0 ? 1 : -1;
        if (predicted_label === true_label) {
            num_correct++;
        }
    }
    return num_correct / data.length;
};

// the learning loop
for (var iter = 0; iter < 400; iter++) {
    // pick a random data point
    var i = Math.floor(Math.random() * data.length);
    var x = new Unit(data[i][0], 0.0);
    var y = new Unit(data[i][1], 0.0);
    var label = labels[i];
    svm.learnFrom(x, y, label);

    if (iter % 25 == 0) { // every 25th iteration
        var iterStr = iter.toString().padEnd(3); // pad the iteration number with spaces
        console.log(`training accuracy at iter ${iterStr}: ${evalTrainingAccuracy().toFixed(2)}`);
    }
}

var a = 1; b = -2; c = -1;
for (var iter = 0; iter < 400; iter++) {
    // pick a random data point
    var i = Math.floor(Math.random() * data.length);
    var x = data[i][0];
    var y = data[i][1];
    var label = labels[i];

    // compute pull
    var score = a * x + b * y + c;
    var pull = 0.0;
    if (label === 1 && score < 1) pull = 1;
    if (label === -1 && score > -1) pull = -1;

    // compute gradient and update parameters
    var step_size = 0.01
    a += step_size * (x * pull - a);
    b += step_size * (y * pull - b);
    c += step_size * (1 * pull);
}