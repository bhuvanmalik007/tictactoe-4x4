import { SIZE, type Board, type Cell, type Player } from './board.js';
import { InvalidBoardError } from './errors.js';
import { WINNING_LINES, type Coord } from './lines.js';

const isCell = (value: unknown): value is Cell => value === 'X' || value === 'O' || value === null;

/** Runtime shape check: 4x4, every cell 'X' | 'O' | null. Index loops so sparse-array holes are caught. */
function assertWellFormed(board: unknown): asserts board is Board {
  if (!Array.isArray(board) || board.length !== SIZE) {
    throw new InvalidBoardError(`Board must be an array of ${SIZE} rows`);
  }
  for (let r = 0; r < SIZE; r++) {
    const row: unknown = board[r];
    if (!Array.isArray(row) || row.length !== SIZE) {
      throw new InvalidBoardError(`Row ${r} must be an array of ${SIZE} cells`);
    }
    for (let c = 0; c < SIZE; c++) {
      if (!isCell(row[c])) {
        throw new InvalidBoardError(`Invalid cell at [${r}, ${c}]: ${JSON.stringify(row[c])}`);
      }
    }
  }
}

function cellAt(board: Board, [r, c]: Coord): Cell {
  const cell = board[r]?.[c];
  if (cell === undefined) throw new Error(`Coordinate [${r}, ${c}] is out of bounds`);
  return cell;
}

function countMarks(board: Board): { x: number; o: number } {
  const cells = board.flat();
  return {
    x: cells.filter((cell) => cell === 'X').length,
    o: cells.filter((cell) => cell === 'O').length,
  };
}

/** Players who fill at least one winning line. */
function winnersOf(board: Board): Set<Player> {
  const winners = new Set<Player>();
  for (const line of WINNING_LINES) {
    const cells = line.map((coord) => cellAt(board, coord));
    const first = cells[0];
    if (first != null && cells.every((cell) => cell === first)) winners.add(first);
  }
  return winners;
}

/** Validates the board against every rule and returns its winner, or null. Throws InvalidBoardError. */
function validatedWinner(board: Board): Player | null {
  assertWellFormed(board);

  const { x, o } = countMarks(board);
  if (x - o !== 0 && x - o !== 1) {
    throw new InvalidBoardError(`Impossible mark counts X=${x}, O=${o}: X moves first, so X − O must be 0 or 1`);
  }

  const winners = winnersOf(board);
  if (winners.has('X') && winners.has('O')) {
    throw new InvalidBoardError('Both X and O have a winning line');
  }
  if (winners.has('X') && x !== o + 1) {
    throw new InvalidBoardError(`X has won but X=${x}, O=${o}; an X win requires X = O + 1`);
  }
  if (winners.has('O') && x !== o) {
    throw new InvalidBoardError(`O has won but X=${x}, O=${o}; an O win requires X = O`);
  }

  if (winners.has('X')) return 'X';
  if (winners.has('O')) return 'O';
  return null;
}

/**
 * 4x4 tic-tac-toe rules. Stateless: every method takes the board as a parameter.
 *
 * Every method validates the board first and throws `InvalidBoardError` if it is invalid:
 * - the board is not 4x4, or a cell is not 'X' | 'O' | null;
 * - mark counts are impossible (X moves first, so X − O must be 0 or 1);
 * - both players have a winning line;
 * - X has won but X ≠ O + 1, or O has won but X ≠ O.
 */
export class TicTacToe {
  /**
   * Returns the player who has filled one of the 20 winning lines, or `null` if nobody has.
   * `null` covers both a draw and a game still in progress.
   * One player having several winning lines at once is valid.
   *
   * @throws InvalidBoardError if both players have a winning line, or the board is otherwise invalid.
   */
  public checkWinner(board: Board): Player | null {
    return validatedWinner(board);
  }

  /**
   * Returns `true` if at least one cell is empty AND nobody has won.
   * Returns `false` after a win, even if empty cells remain, and on a full board.
   *
   * @throws InvalidBoardError if the board is invalid.
   */
  public anyMovesLeft(board: Board): boolean {
    const winner = validatedWinner(board);
    return winner === null && board.flat().includes(null);
  }

  /**
   * Returns `true` if the game is won or drawn (full board, no winner); `false` while in progress.
   * Equivalent to `!anyMovesLeft(board)`.
   *
   * @throws InvalidBoardError if the board is invalid.
   */
  public isGameOver(board: Board): boolean {
    return !this.anyMovesLeft(board);
  }
}
