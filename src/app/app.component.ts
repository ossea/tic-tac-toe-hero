import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type board = Array<Array<string>>;

interface TicTacToePosition {
  x: number;
  y: number;
}

class Winner {
  constructor(
    public isWinner: boolean,
    public winnerPLayer: string,
    public hasNextMove: boolean
  ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'tic-tac-toe-hero';

  board: BehaviorSubject<board> = new BehaviorSubject<board>(
    new Array(3).fill(new Array(3).fill(''))
  );

  currentUser = new BehaviorSubject<string>('');

  user: string = '';
  computer: string = '';

  isCompleted: boolean = false;

  ngOnInit(): void {
    this.currentUser.subscribe((user) => {
      if (user !== '' && user === this.computer) {
        let bestMove = this.bestMove();
        let playedBoard = this.move(
          JSON.parse(JSON.stringify(this.board.value)),
          bestMove
        );
        this.board.next(playedBoard);
        this.currentUser.next(this.user);
      }
    });
  }

  reset() {
    this.user = '';
    this.computer = '';
    this.board.next(new Array(3).fill(new Array(3).fill('')));
    this.currentUser.next('');
    this.isCompleted = false;
  }

  setUser(user: string) {
    this.user = user;
    this.computer = user === 'x' ? 'o' : 'x';
    this.currentUser.next('x');
  }

  userMove(position: TicTacToePosition) {
    if (this.currentUser.value === this.user) {
      let board = this.move(
        JSON.parse(JSON.stringify(this.board.value)),
        position
      );
      this.board.next(board);
      this.currentUser.next(this.computer);
    }
  }

  move(testBoard: board, position: TicTacToePosition): board {
    if (
      testBoard[position.y][position.x] === '' &&
      this.isCompleted === false
    ) {
      testBoard[position.y][position.x] = this.currentUser.value;
      let winner = this.checkWinner(JSON.parse(JSON.stringify(testBoard)));
      let checkCompleted = this.checkCompleted(
        JSON.parse(JSON.stringify(testBoard))
      );
      if (winner.isWinner) {
        this.isCompleted = true;
      } else if (checkCompleted) {
        this.isCompleted = true;
      }
    }
    return testBoard;
  }

  checkCompleted(testBoard: board): boolean {
    return testBoard.every((x) => x.every((y) => y !== ''));
  }

  checkWinner(testBoard: board = this.board.value): Winner {
    //satırlarda kazanma hali
    for (let y = 0; y < testBoard.length; y++) {
      let values: Array<string> = [];
      for (let x = 0; x < testBoard[y].length; x++) {
        values.push(testBoard[y][x]);
      }
      if (
        values.some((val) => val !== '' && values.every((val2) => val === val2))
      ) {
        return new Winner(
          true,
          values[0],
          this.checkCompleted(testBoard) === false
        );
      }
    }

    //sutunlarda kazanma hali
    for (let y = 0; y < testBoard.length; y++) {
      let values: Array<string> = [];
      for (let x = 0; x < testBoard[y].length; x++) {
        // for (let x = 0; x < testBoard.length; x++) {

        //   for (let y = 0; y < testBoard[x].length; y++) {
        values.push(testBoard[x][y]);
      }
      if (
        values.some((val) => val !== '' && values.every((val2) => val === val2))
      ) {
        return new Winner(
          true,
          values[0],
          this.checkCompleted(testBoard) === false
        );
      }
    }

    //sag diagonal kazanma hali
    let values: Array<string> = [];
    for (let x = 2; x >= 0; x--) {
      values.push(testBoard[2 - x][x]);
    }
    if (
      values.some((val) => val !== '' && values.every((val2) => val === val2))
    ) {
      return new Winner(
        true,
        values[0],
        this.checkCompleted(testBoard) === false
      );
    }

    //sol diagonal kazanma hali
    values = [];
    for (let x = 0; x < testBoard.length; x++) {
      values.push(testBoard[x][x]);
    }

    if (
      values.some((val) => val !== '' && values.every((val2) => val === val2))
    ) {
      return new Winner(
        true,
        values[0],
        this.checkCompleted(testBoard) === false
      );
    }

    if (this.checkCompleted(testBoard)) {
      return new Winner(false, '', false);
    }

    return new Winner(false, '', true);
  }

  maxAl(testBoard: board): number {
    let winner = this.checkWinner(testBoard);
    if (winner.isWinner) {
      return winner.winnerPLayer === this.user
        ? winner.hasNextMove
          ? -10
          : -20
        : winner.hasNextMove
        ? 20
        : 10;
    } else if (winner.hasNextMove === false) {
      return 0;
    }

    let bestCtrl = -Infinity;
    for (let y = 0; y < testBoard.length; y++) {
      for (let x = 0; x < testBoard[y].length; x++) {
        if (testBoard[y][x] === '') {
          testBoard[y][x] = this.computer;
          bestCtrl = Math.max(
            bestCtrl,
            this.minAl(JSON.parse(JSON.stringify(testBoard)))
          );
          testBoard[y][x] = '';
        }
      }
    }
    return bestCtrl;
  }

  minAl(testBoard: board): number {
    let winner = this.checkWinner(testBoard);
    if (winner.isWinner) {
      return winner.winnerPLayer === this.user
        ? winner.hasNextMove
          ? -10
          : -20
        : winner.hasNextMove
        ? 20
        : 10;
    } else if (winner.hasNextMove === false) {
      return 0;
    }

    let bestCtrl = Infinity;
    for (let y = 0; y < testBoard.length; y++) {
      for (let x = 0; x < testBoard[y].length; x++) {
        if (testBoard[y][x] === '') {
          testBoard[y][x] = this.user;
          bestCtrl = Math.min(
            bestCtrl,
            this.maxAl(JSON.parse(JSON.stringify(testBoard)))
          );
          testBoard[y][x] = '';
        }
      }
    }
    return bestCtrl;
  }

  bestMove(): TicTacToePosition {
    let board = JSON.parse(JSON.stringify(this.board.value));
    let hamleler: { [key: string]: { [key: number]: TicTacToePosition } } = {};
    let bestScore = -Infinity;
    let move: TicTacToePosition = { x: 0, y: 0 };
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === '') {
          board[y][x] = this.computer;
          let best = this.minAl(board);
          board[y][x] = '';
          if (hamleler[`${x},${y}`]) {
            hamleler[`${x},${y}`][best] = { x, y };
          } else {
            hamleler[`${x},${y}`] = {};
            hamleler[`${x},${y}`][best] = { x, y };
          }
          if (best > bestScore) {
            bestScore = best;
            move = { x, y };
          }
        }
      }
    }

    // let values = Object.keys(hamleler);
    // var best = Math.max(...values);
    return move;
  }
}
