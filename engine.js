function initGame() {
	let game = {
		board: [],
		player: 1,
		full: function(colIndex) {
			let minIndex = 0, maxIndex = 7;
			if (colIndex != null) {
				minIndex = colIndex;
				maxIndex = minIndex + 1;
			}
			for (let j = minIndex; j < maxIndex; j++)
				if (this.board[0][j] == 0)
					return false;
			return true;
		},
		coups: function() {
			let arr = [];
			for (let colIndex = 0; colIndex < 7; colIndex++) {
				if (!this.full(colIndex)) arr.push(colIndex);
			}
			return arr;
		},
		play: function(colIndex) {
			var rowIndex = 5;
			while (this.board[rowIndex][colIndex] != 0) {
				rowIndex--;
			}
			this.board[rowIndex][colIndex] = this.player;
			this.player = 1 + (this.player % 2);
			return this.evaluate();
		},
		undo: function(colIndex) {
			var rowIndex = 0;
			while (this.board[rowIndex][colIndex] == 0) {
				rowIndex++;
			}
			this.board[rowIndex][colIndex] = 0;
			this.player = 1 + (this.player % 2);
		},
		evaluate: function() {
			for (let i = 0; i < 7; i++) {
				let winner = 0;
				if (i < 6)
					winner = aligned(this.board[i]);
				if (winner == 0)
					winner = aligned(this.board.map(row => row[i]));
				if (winner != 0) return winner;
				for (let k = 0; k < 13; k++) {
					let vect1 = [], vect2 = [];
					for (let row = 5; row >= 0; row--) {
						let col1 = k - row, col2 = k - 6 + row;
						if (col1 >= 0 && col1 < 7) vect1.push(this.board[row][col1]);
						if (col2 >= 0 && col2 < 7) vect2.push(this.board[row][col2]);
					}
					winner = aligned(vect1);
					if (winner != 0) return winner;
					winner = aligned(vect2);
					if (winner != 0) return winner;
				}
			}
			return 0;
		},
		serial: function() {
			return this.board.map(x => x.join(",")).join(",");
		}
	}
	for (let row = 0; row < 6; row++) {
		game.board.push([]);
		for (let col = 0; col < 7; col++) {
			game.board[row].push(0);
		}
	}
	return game;
}

function aligned(vect, size=4) {
	let regex = new RegExp("([^0])\\1{" + (size - 1) + ",}");
	match = regex.exec(vect.join(""));
	if (match != null) return parseInt(match[1]);
	return 0;
}

module.exports = { initGame };
