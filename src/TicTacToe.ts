import type { Board, Player } from './types.js';

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
    throw new Error('Not implemented');
  }

  /**
   * Returns `true` if at least one cell is empty AND nobody has won.
   * Returns `false` after a win, even if empty cells remain, and on a full board.
   *
   * @throws InvalidBoardError if the board is invalid.
   */
  public anyMovesLeft(board: Board): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Returns `true` if the game is won or drawn (full board, no winner); `false` while in progress.
   * Equivalent to `!anyMovesLeft(board)`.
   *
   * @throws InvalidBoardError if the board is invalid.
   */
  public isGameOver(board: Board): boolean {
    throw new Error('Not implemented');
  }
}
