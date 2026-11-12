import type { Board, Cell, Player } from './board.js';
import { InvalidBoardError } from './errors.js';
import { WINNING_LINES, type Coord, type Line } from './lines.js';

const isCell = (value: unknown): value is Cell => value === 'X' || value === 'O' || value === null;

/** Runtime shape check: 4x4, every cell 'X' | 'O' | null. Index loops so sparse-array holes are caught. */
function assertWellFormed(board: unknown): asserts board is Board {
  if (!Array.isArray(board) || board.length !== 4) {
    throw new InvalidBoardError('Board must be an array of 4 rows');
  }
  for (let r = 0; r < 4; r++) {
    const row: unknown = board[r];
    if (!Array.isArray(row) || row.length !== 4) {
      throw new InvalidBoardError(`Row ${r} must be an array of 4 cells`);
    }
    for (let c = 0; c < 4; c++) {
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

/** The winning lines fully filled by `player`. */
function winningLinesOf(board: Board, player: Player): Line[] {
  return WINNING_LINES.filter((line) => line.every((coord) => cellAt(board, coord) === player));
}

/** True if at least one cell is in EVERY given line (intersection of all, not pairwise overlap). */
function shareCommonCell(lines: readonly Line[]): boolean {
  const [first, ...rest] = lines;
  if (first === undefined) return true;
  return first.some(([r, c]) => rest.every((line) => line.some(([lr, lc]) => lr === r && lc === c)));
}

/** Validates the board against every rule and returns its winner, or null. Throws InvalidBoardError. */
function validatedWinner(board: Board): Player | null {
  assertWellFormed(board);

  const { x, o } = countMarks(board);
  if (x - o !== 0 && x - o !== 1) {
    throw new InvalidBoardError(`Impossible mark counts X=${x}, O=${o}: X moves first, so X − O must be 0 or 1`);
  }

  const xLines = winningLinesOf(board, 'X');
  const oLines = winningLinesOf(board, 'O');
  if (xLines.length > 0 && oLines.length > 0) {
    throw new InvalidBoardError('Both X and O have a winning line');
  }

  const winner: Player | null = xLines.length > 0 ? 'X' : oLines.length > 0 ? 'O' : null;
  if (winner === null) return null;

  if (winner === 'X' && x !== o + 1) {
    throw new InvalidBoardError(`X has won but X=${x}, O=${o}; an X win requires X = O + 1`);
  }
  if (winner === 'O' && x !== o) {
    throw new InvalidBoardError(`O has won but X=${x}, O=${o}; an O win requires X = O`);
  }

  // One move completes every line at once, so all of the winner's lines must share that cell.
  if (!shareCommonCell(winner === 'X' ? xLines : oLines)) {
    throw new InvalidBoardError(
      `${winner} has disjoint winning lines: no single cell is common to all of them, so the board is unreachable in legal play`,
    );
  }

  return winner;
}

/** Validates the board; true if nobody has won and an empty cell remains. */
function movesLeft(board: Board): boolean {
  return validatedWinner(board) === null && board.flat().includes(null);
}

/**
 * 4x4 tic-tac-toe rules. Stateless: every method takes the board as a parameter and
 * does not use `this`, so methods can be passed around detached (e.g. `boards.map(game.isGameOver)`).
 *
 * Every method validates the board first and throws `InvalidBoardError` if it is invalid:
 * - the board is not 4x4, or a cell is not 'X' | 'O' | null;
 * - mark counts are impossible (X moves first, so X − O must be 0 or 1);
 * - both players have a winning line;
 * - X has won but X ≠ O + 1, or O has won but X ≠ O;
 * - the winner's winning lines do not all share at least one common cell.
 */
export class TicTacToe {
  /**
   * Returns the player who has filled one of the 20 winning lines, or `null` if nobody has.
   * `null` covers both a draw and a game still in progress.
   * A player may have several winning lines only if ALL of them share at least one common cell
   * (the move that completed them). Pairwise overlap is not enough.
   *
   * @throws InvalidBoardError if both players have a winning line; if the winner's lines are
   * disjoint (no cell common to all of them; the message says so); or if the board is otherwise invalid.
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
    return movesLeft(board);
  }

  /**
   * Returns `true` if the game is won or drawn (full board, no winner); `false` while in progress.
   * Equivalent to `!anyMovesLeft(board)`.
   *
   * @throws InvalidBoardError if the board is invalid.
   */
  public isGameOver(board: Board): boolean {
    // Module function, not `this.anyMovesLeft`, so the method still works when called detached.
    return !movesLeft(board);
  }
}
