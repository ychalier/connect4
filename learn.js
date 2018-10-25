function f(x) {
	return 1/(1+Math.exp(-x));
}

function randMatrix(n, p) {
	let m = [];
	for (let i = 0; i < n; i++) {
		m.push([]);
		for (let j = 0; j < p; j++) m[i].push(Math.random() * 2 - 1);
	}
	return m;
}

function dot(a, x, p) {
	let y = [];
	for (let row = 0; row < a.length; row++) {
		y.push(0);
		for (let col = 0; col < a[0].length - 1; col++) y[row] += a[row][col] * (p != null ? x[p][col] : x[col]);
		y[row] += a[row][a[0].length - 1];
	}
	return y;
}

function architecture(inputSize=42, hiddenSize=100, outputSize=7) {
	let layers = {
		hidden: randMatrix(hiddenSize, inputSize + 1),
		output: randMatrix(outputSize, hiddenSize + 1),
	};
	return layers;
}

function forward(layers, X, p) {
	let fNetH = dot(layers.hidden, X, p).map(f);
	return {
		fNetH: fNetH,
		fNetO: dot(layers.output, fNetH).map(f),
	};
}

function backtrack(layers, X, y, eta=.1, threshold=.001, maxIter=100) {
	let inputSize = layers.hidden[0].length - 1;
	let hiddenSize = layers.hidden.length;
	let outputSize = layers.output.length;
	let squaredError = threshold * 2;
	let iter = 0;
	while (squaredError > threshold && (maxIter == null || iter < maxIter)) {
		iter++;
		squaredError = 0;
		for (let p = 0; p < X.length; p++) {
			let fwd = forward(layers, X, p);
			let deltaO = [];
			for (let k = 0; k < outputSize; k++) {
				let error = y[p][k] - fwd.fNetO[k];
				deltaO.push(error * fwd.fNetO[k] * (1 - fwd.fNetO[k]));
				squaredError += error * error;
			}
			let deltaH = [];
			for (let j = 0; j < hiddenSize; j++) {
				let sum = 0;
				for (let k = 0; k < outputSize; k++) sum += deltaO[k] * layers.output[k][j];
				deltaH.push(fwd.fNetH[j] * (1 - fwd.fNetH[j]) * sum);
			}
			for (let k = 0; k < outputSize; k++) {
				for (let j = 0; j < hiddenSize; j++) layers.output[k][j] += eta * deltaO[k] * fwd.fNetH[j];
				layers.output[k][hiddenSize] += eta * deltaO[k];
			}
			for (let j = 0; j < hiddenSize; j++) {
				for (let i = 0; i < inputSize; i++) layers.hidden[j][i] += eta * deltaH[j] * X[p][i];
				layers.hidden[j][inputSize] += eta * deltaH[j];
			}
		}
		squaredError /= X.length;
		console.log("Squared error = " +  squaredError);
	}
	return layers;
}

function test(layers, Xrow) {
	return forward(layers, [Xrow], 0).fNetO;
}

function MLPClassifier(inputSize=42, hiddenSize=100, outputSize=7) {
	return {
		layers: architecture(inputSize, hiddenSize, outputSize),
		fit: function(X, y, threshold=.01) {
			this.layers = backtrack(this.layers, X, y, threshold);
			return this;
		},
		predict: function(X) {
			return test(this.layers, X);
		}
	}
}

module.exports = { MLPClassifier };
