import { describe, expect, it } from 'vitest';
import { parseBoard, type Board, type Cell } from '../src/board.js';
import { InvalidBoardError } from '../src/errors.js';
import { TicTacToe } from '../src/TicTacToe.js';

/** Builds a board from 4 row strings, top to bottom. */
const board = (...rows: [string, string, string, string]): Board => parseBoard(rows.join(''));

// Every fixture is a valid board (X moves first): X wins with X = O + 1, O wins with X = O,
// and the losing player owns no winning line.
describe('TicTacToe.checkWinner', () => {
  const game = new TicTacToe();

  describe('X wins by each win condition', () => {
    it.each<[string, Board]>([
      ['a row (row 0)', board(
        'XXXX',
        'O.O.',
        '.O..',
        '....',
      )],
      ['a column (col 0)', board(
        'XO..',
        'X.O.',
        'XO..',
        'X...',
      )],
      ['the main diagonal', board(
        'XO..',
        '.XO.',
        'O.X.',
        '...X',
      )],
      ['the anti-diagonal', board(
        'O..X',
        '..XO',
        '.XO.',
        'X...',
      )],
      ['the 4 corners', board(
        'X.OX',
        '.O..',
        '..O.',
        'X..X',
      )],
      ['a corner 2x2 box (top-left)', board(
        'XXO.',
        'XX..',
        'O...',
        '...O',
      )],
      ['the center 2x2 box', board(
        'O...',
        '.XX.',
        '.XX.',
        'O..O',
      )],
    ])('%s', (_label, b) => {
      expect(game.checkWinner(b)).toBe('X');
    });
  });

  it('returns O when O wins (row 3)', () => {
    const b = board(
      'X.X.',
      '.X..',
      '...X',
      'OOOO',
    );
    expect(game.checkWinner(b)).toBe('O');
  });

  it('returns null on a partial board with no winner', () => {
    const b = board(
      'XO..',
      '.X..',
      '..O.',
      '....',
    );
    expect(game.checkWinner(b)).toBeNull();
  });

  it('returns null on a full board with no winner (draw)', () => {
    const b = board(
      'XXOO',
      'OOXX',
      'XXOO',
      'OOXX',
    );
    expect(game.checkWinner(b)).toBeNull();
  });

  it('throws InvalidBoardError when both players have a winning line', () => {
    // Counts are valid (X = O = 4), so only the both-win rule makes this invalid.
    const b = board(
      'XXXX',
      'OOOO',
      '....',
      '....',
    );
    expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
  });
});

describe('TicTacToe.checkWinner board validation', () => {
  const game = new TicTacToe();

  describe('rejects malformed boards at runtime', () => {
    const emptyRow = (): Cell[] => [null, null, null, null];
    /** Bypasses the type system to simulate bad data from outside TypeScript. */
    const raw = (value: unknown): Board => value as Board;

    const holeyRow: Cell[] = [null, null, null];
    holeyRow.length = 4; // index 3 is a hole, not undefined

    it.each<[string, unknown]>([
      ['not an array', null],
      ['3 rows', [emptyRow(), emptyRow(), emptyRow()]],
      ['5 rows', [emptyRow(), emptyRow(), emptyRow(), emptyRow(), emptyRow()]],
      ['a row that is not an array', [emptyRow(), 'X...', emptyRow(), emptyRow()]],
      ['a row with 3 cells', [emptyRow(), [null, null, null], emptyRow(), emptyRow()]],
      ['a row with 5 cells', [emptyRow(), [null, null, null, null, null], emptyRow(), emptyRow()]],
      ['a lowercase mark', [['x', null, null, null], emptyRow(), emptyRow(), emptyRow()]],
      ["a '.' cell (string form, not array form)", [['.', null, null, null], emptyRow(), emptyRow(), emptyRow()]],
      ['an undefined cell', [[undefined, null, null, null], emptyRow(), emptyRow(), emptyRow()]],
      ['a sparse-array hole', [holeyRow, emptyRow(), emptyRow(), emptyRow()]],
    ])('%s', (_label, value) => {
      expect(() => game.checkWinner(raw(value))).toThrow(InvalidBoardError);
    });
  });

  describe('rejects impossible mark counts (X moves first)', () => {
    it('O has more marks than X', () => {
      const b = board(
        'O...',
        '....',
        '....',
        '....',
      );
      expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    });

    it('X is two marks ahead of O', () => {
      const b = board(
        'XX..',
        '....',
        '....',
        '....',
      );
      expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    });
  });

  describe("rejects a win that doesn't fit the turn order", () => {
    // Counts alone are valid in both boards; only the winner/count mismatch makes them invalid.
    it('X has won but X = O (O moved after X already won)', () => {
      const b = board(
        'XXXX',
        'O.O.',
        '.O..',
        'O...',
      );
      expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    });

    it('O has won but X = O + 1 (X moved after O already won)', () => {
      const b = board(
        'X.X.',
        '.X.X',
        'X...',
        'OOOO',
      );
      expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    });
  });
});
