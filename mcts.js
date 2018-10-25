const engine = require("./engine.js");

function initTree() {
	let tree = {
		state: root(),
		children: [],
		parent: null,
		coup: null,
		w: 0,
		n: 0,
		final: false,
	};
	return tree;
}

function createGame(string) {
	let unravelled = string.split(",");
	let game = engine.initGame();
	game.player = 1 + (string.split("1").length + string.split("2").length) % 2;
	game.board = [];
	while (unravelled.length) game.board.push(unravelled.splice(0, 7).map(x => parseInt(x)));
	return game;
}

function root() {
	string = '0';
	for (let i = 0; i < 41; i++) string += ',0';
	return string;
}

function exploration(node, c=1.41421356237) {
	let w = node.w, n = node.n + 1, N = node.parent.n;
	return w/n + c*Math.sqrt(Math.log(N)/n);
}

function learn(tree, n) {
	for (let step = 0; step < n; step++) {
		let node = tree;
		while (node.n > 0 && !node.final && node.children.length > 0) {
			scores = node.children.map(exploration);
			node = node.children[scores.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0]? a:r))[1]];
		}
		let game = createGame(node.state);
		let coups = game.coups();
		for (let c = 0; c < coups.length; c++) {
			let winner = game.play(coups[c]);
			node.children.push({
				state: game.serial(),
				children: [],
				parent: node,
				coup: coups[c],
				w: 0,
				n: 0,
				final: winner != 0 || game.full(),
			})
			game.undo(coups[c]);
		}
		let child = node.children[Math.floor(Math.random() * node.children.length)];
		let outcome = finish(createGame(child.state));
		while (true) {
			child.n++;
			if (outcome == 1) child.w++;
			if (child.parent) {
				child = child.parent;
			} else {
				break;
			}
		}
	}
	return tree;
}

function finish(game) {
	let winner = 0;
	while (winner == 0 && !game.full()) {
		let coups = game.coups();
		winner = game.play(coups[Math.floor(Math.random() * coups.length)]);
	}
	return winner;
}

function serialTree(tree) {
	return JSON.stringify(tree, (key, value) => {
			if (key == 'parent' && value) return value.state;
			else return value;
		});
}

let tree = initTree();
console.log(serialTree(learn(tree, parseInt(process.argv[2]))));
