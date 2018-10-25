const engine = require("./engine.js");
const learn = require("./learn.js");
const fs = require("fs");

function train(filename) {
	let tree = JSON.parse(fs.readFileSync(filename, 'utf8'));
	let X = [], y = [];
	let process = (node) => {
		X.push([]);
		let arr = node.state.split(",");
		for (let i = 0; i < 42; i++) {
			X[X.length - 1].push(parseInt(arr[i]));
		}
		y.push([]);
		for (let coup = 0; coup < 7; coup++) {
			y[y.length - 1].push(0);
			for (let c = 0; c < node.children.length; c++) {
				if (node.children[c].coup == coup && node.children[c].n)
					y[y.length - 1][coup] = node.children[c].w / node.children[c].n;
			}
		}
		node.children.map(process);
	}
	process(tree);
	let clf = learn.MLPClassifier();
	fs.writeFileSync("clf.json", JSON.stringify(clf));
	clf.fit(X, y);
	return clf;
}

function computerMove(clf, game) {
	let state = game.serial().split(",").map(x => parseInt(x));
	let scores = clf.predict(state);
	console.log("\nAI scores: " + scores);
	let winner = game.play(scores.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0]? a:r))[1]);
	return {
		game: game,
		winner: winner,
	}
}

function display(game) {
	console.log(game.board);
	console.log("\nEnter your move:");
}

function checkGameState(winner, game) {
	console.log("Winner: " + game.evaluate());
	let players = ["AI", "Human"];
	if (winner != 0) {
		console.log("\n" + players[winner - 1] + " wins!");
		process.exit();
	} else if (game.full()) {
		console.log("\nIt's a draw...");
		process.exit();
	}
}

train(process.argv[2]);


let clf = learn.MLPClassifier();
clf.layers = JSON.parse(fs.readFileSync("clf.json", "utf-8")).layers;
let game = engine.initGame();
let stdin = process.openStdin();
stdin.addListener("data", (d) => {
	let col = parseInt(d.toString());
	if (game.coups().includes(col)) {
		let winner = game.play(col);
		checkGameState(winner, game);
		let output = computerMove(clf, game);
		checkGameState(output.winner, output.game);
		game = output.game;
		display(game);
	} else {
		console.log("Wrong coup.");
	}
});

computerMove(clf, game);
display(game);

