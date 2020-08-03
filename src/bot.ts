import { IBoard } from "./game";

export class TicTacToeBot {
    private board: IBoard = [[]];
    constructor(public AI: 'X' | 'O') { }
    private count = 0;

    // Bot returns the feild it will place in
    takeTurn(board_: IBoard): number {
        this.board = JSON.parse(JSON.stringify(board_));
        console.time('Bot: time spent thinking: ');
        this.count = 0;
        const bestMove = this.bestMove();
        console.log('Looked at ' + this.count + ' different possibilities');
        console.timeEnd('Bot: time spent thinking: ')
        return bestMove;
    }

    bestMove(): number {
        // AI to make its turn
        let bestScore = -Infinity;
        let move: number = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                // Is the spot available?
                if (this.isSpotEmpty(i, j, this.board)) {

                    this.board[i][j] = this.AI;
                    let score = this.minimax(-Infinity, Infinity, 0, false);
                    this.board[i][j] = (i * 3 + j);
                    if (score > bestScore) {
                        bestScore = score;
                        move = (i * 3 + j);
                    }
                }
            }
        }
        return move;
    }

    minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean) {
        let scores = {
            [this.AI]: 100,
            [this.AI == 'X' ? 'O' : 'X']: -100,
            tie: 0
        };

        let result = this.checkWinner();
        if (result) {
            return scores[result];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;

            for (let idx = 0; idx < 9; idx++) {
                const row = ~~(idx / 3);
                const col = idx - (row * 3);

                // Is the spot available?
                if (this.isSpotEmpty(row, col, this.board)) {
                    this.board[row][col] = this.AI;
                    let score = this.minimax(alpha, beta, depth + 1, false);
                    this.board[row][col] = idx;
                    alpha = Math.max(alpha, score)
                    bestScore = Math.max(score, bestScore);
                    if (beta <= alpha) break;
                }
            }

            this.count++;
            return bestScore;
        } else {
            let bestScore = Infinity;

            for (let idx = 0; idx < 9; idx++) {
                const row = ~~(idx / 3);
                const col = idx - (row * 3);

                // Is the spot available?
                if (this.isSpotEmpty(row, col, this.board)) {
                    this.board[row][col] = this.AI == 'X' ? 'O' : 'X';
                    let score = this.minimax(alpha, beta, depth + 1, true);
                    this.board[row][col] = idx;
                    beta = Math.min(beta, score)
                    bestScore = Math.min(score, bestScore);
                    if (alpha <= beta) break;
                }
            }

            this.count++;
            return bestScore;
        }
    }

    equals3(a: any, b: any, c: any) {
        return a == b && b == c && a != '';
    }

    checkWinner(): 'X' | 'O' | 'tie' {
        // horizontal
        for (let i = 0; i < 3; i++) {
            if (this.equals3(this.board[i][0], this.board[i][1], this.board[i][2])) {
                return this.board[i][0] as any;
            }
        }

        // Vertical
        for (let i = 0; i < 3; i++) {
            if (this.equals3(this.board[0][i], this.board[1][i], this.board[2][i])) {
                return this.board[0][i] as any;
            }
        }

        // Diagonal
        if (this.equals3(this.board[0][0], this.board[1][1], this.board[2][2])) {
            return this.board[0][0] as any;
        }
        if (this.equals3(this.board[2][0], this.board[1][1], this.board[0][2])) {
            return this.board[2][0] as any;
        }

        if (this.getOpenFields().length == 0) return 'tie'
        return (undefined as any);
    }

    getOpenFields(): number[] {
        return this.board.reduce((acc, cur) => [...acc, ...cur.filter(f => !isNaN(f as any))], []) as number[];
    }

    hasPlayerWon(): 'X' | 'O' | 'tie' {
        let winner: 'X' | 'O' = (undefined as any);

        //Check rows
        this.board.forEach(row => row.every((f, _, arr) => f == (arr[_ - 1] || f)) && (winner = row[0] as any));
        if (winner) return winner;

        // Check columns
        this.board.forEach((_, idx) => {
            let column = this.board.map(row => row[idx]);
            column.every((f, _, arr) => f == (arr[_ - 1] || f)) && (winner = column[0] as any);
        });
        if (winner) return winner;

        //Check diagonals
        // board_.every((row, idx) => row[idx] == who) && (winner = board_[0][0]);
        // board_.every((row, idx) => row[2 - idx] == who) && (winner = board_[0][2]);

        if (this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2]) {
            winner = this.board[0][0] as any;
        }
        if (this.board[2][0] == this.board[1][1] && this.board[2][0] == this.board[0][2]) {
            winner = this.board[2][0] as any;
        }
        if (winner) return winner;

        if (!winner && this.getOpenFields().length == 0) return 'tie'
        return winner;
    }

    isSpotEmpty(i: number, j: number, _: any): boolean {
        return this.board[i][j] != 'O' && this.board[i][j] != 'X';
    }
}