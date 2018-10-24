const engine = require("./engine.js");
const fs = require("fs");

function loadTree(filename) {
	let root = JSON.parse(fs.readFileSync(filename, 'utf8'));
	let table = {};
	let process = (node) => {
		if (node.n) {
			table[node.state] = { p:node.w / node.n, children:[] };
			if (node.parent in table) table[node.parent].children.push(node);
		}
		for (let i = 0; i < node.children.length; i++) {
			process(node.children[i]);
		}
	}
	process(root);
	return table;
}

function computerMove(table, game) {
	let coups = game.coups();
	let scores = coups.map((coup) => {
			game.play(coup);
			let state = game.serial();
			game.undo(coup);
			return (state in table ? table[state].p : 0);
		});
	console.log("\nAI scores: " + scores);
	let winner = game.play(coups[scores.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0]? a:r))[1]]);
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


let table = loadTree(process.argv[2]);
let game = engine.initGame();
let stdin = process.openStdin();
stdin.addListener("data", (d) => {
	let col = parseInt(d.toString());
	if (game.coups().includes(col)) {
		let winner = game.play(col);
		checkGameState(winner, game);
		let output = computerMove(table, game);
		checkGameState(output.winner, output.game);
		game = output.game;
		display(game);
	} else {
		console.log("Wrong coup.");
	}
});

computerMove(table, game);
display(game);
