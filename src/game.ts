import * as rl from "readline-sync";
import { TicTacToeBot } from "./bot";

// Clear console on reboot
console.clear()

export type fieldType = number | 'X' | 'O';
export interface IBoard extends Array<Array<fieldType>> { };

class Game {
	public board: IBoard = [[]];
	private isPvp: boolean = true;
	private nextPlayer: 'X' | 'O' = 'X';
	private bot: TicTacToeBot = (undefined as any);
	isGameOver: boolean = false;
	isTied: boolean = false;

	constructor() { }

	init() {
		this.resetBoard();
		const isPvpAns = rl.question('Two player mode (Y/n) ', { limit: ['Y', 'N', 'y', 'n', ''] }).toLowerCase();
		this.isPvp = (!isPvpAns || isPvpAns == 'y');
		console.log('Game mode set to: ' + (this.isPvp ? 'Player VS Player' : 'Player VS Computer'));
		this.isGameOver = false;
		this.isTied = false;

		if (!this.isPvp) {
			this.bot = new TicTacToeBot(this.nextPlayer);
		}

		this.takeTurn();
	}

	resetBoard() {
		this.board = Array(3).fill(Array(3).fill(0));
		this.board = this.board.map((cur, i) => cur.map((_, j) => (i * 3) + j))
	}

	printBoard() {
		console.log('\n');
		this.board.forEach((cur, idx) => {
			console.log('     |     |     ');
			console.log(`  ${cur[0]}  |  ${cur[1]}  |  ${cur[2]}`);
			console.log(idx == 2 ? '     |     |     ' : '_____|_____|_____');
		});
		console.log('\n');
	}

	takeTurn() {
		this.printBoard();

		if (this.isPvp) {
			const placement: number = Number(rl.question(`${this.nextPlayer}'s turn, where do you wanna place your piece: `, { limit: [...this.getOpenFields(), 'exit'] }));
			if (isNaN(placement)) process.exit();
			this.placePiece(placement);
			console.log(`${this.nextPlayer}'s turn, where do you wanna place your piece?`);
			
		} else if (!this.isPvp) {
			if (this.nextPlayer == this.bot.AI) {
				let botTurn = this.bot.takeTurn(this.board);
				console.log(`Computer's turn, placed at ${botTurn}`);
				this.placePiece(botTurn)
			} else {
				const placement: number = Number(rl.question(`It's your turn, where do you wanna place your piece? (${this.nextPlayer}): `, { limit: [...this.getOpenFields(), 'exit'] }));
				if (isNaN(placement)) process.exit();
				this.placePiece(placement);
			}
		}
	}

	placePiece(where: number) {
		if(!this.getOpenFields().includes(where)) {
			console.log('Pleace enter an empty field');
			return;
		}

		const row = ~~(where / 3);
		const col = where - (row * 3);
		this.board[row][col] = this.nextPlayer;

		this.hasPlayerWon(this.nextPlayer);

		if (!this.isGameOver) {
			this.nextPlayer = this.nextPlayer == 'X' ? 'O' : 'X';
			this.takeTurn();
		} else if (this.isGameOver && !this.isTied) {
			this.printBoard();
			if(!this.isPvp && this.nextPlayer == this.bot.AI) {
				console.log(`The computer won`);
			} else {
				console.log(`Congarts ${this.nextPlayer}, you won!`)
			}
		} else if (this.isGameOver && this.isTied) {
			this.printBoard();
			console.log('The game ended in a tie...');
		}

		if (this.isGameOver) {
			this.promptRestart();
		}
	}

	getOpenFields(): number[] {
		return this.board.reduce((acc, cur) => [...acc, ...cur.filter(f => !isNaN(f as any))], []) as number[];
	}

	hasPlayerWon(who: 'X' | 'O') {
		//Check rows
		this.isGameOver = this.board.some(row => row.every(f => f == who));
		if (this.isGameOver) return;

		// Check columns
		this.isGameOver = this.board.some((_, idx) => {
			let column = this.board.map(row => row[idx]);
			return column.every(f => f == who);
		});
		if (this.isGameOver) return;

		//Check diagonals
		this.isGameOver = this.board.every((row, idx) => row[idx] == who) ||
			this.board.every((row, idx) => row[2 - idx] == who);
		if (this.isGameOver) return;
		
		if (this.getOpenFields().length == 0) {
			this.isGameOver = true;
			this.isTied = true;
		}
	}

	promptRestart() {
		const doRestart = rl.question('The game has ended, play again? (Y/n) ', { limit: ['Y', 'N', 'y', 'n', ''] }).toLowerCase();
		if (!doRestart || doRestart == 'y') {
			console.clear();
			this.init();
		} 
		else { process.exit() }
	}
}

const game = new Game();
game.init();