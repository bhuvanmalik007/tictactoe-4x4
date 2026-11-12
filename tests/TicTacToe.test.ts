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

describe('TicTacToe.anyMovesLeft and isGameOver', () => {
  const game = new TicTacToe();

  // isGameOver is always the opposite of anyMovesLeft, but both columns are spelled out.
  it.each<[string, Board, { movesLeft: boolean; gameOver: boolean }]>([
    ['empty board (in progress)', board(
      '....',
      '....',
      '....',
      '....',
    ), { movesLeft: true, gameOver: false }],
    ['partial board, no winner (in progress)', board(
      'XO..',
      '.X..',
      '..O.',
      '....',
    ), { movesLeft: true, gameOver: false }],
    ['X has won with empty cells left', board(
      'XXXX',
      'O.O.',
      '.O..',
      '....',
    ), { movesLeft: false, gameOver: true }],
    ['O has won with empty cells left', board(
      'X.X.',
      '.X..',
      '...X',
      'OOOO',
    ), { movesLeft: false, gameOver: true }],
    ['full board, no winner (draw)', board(
      'XXOO',
      'OOXX',
      'XXOO',
      'OOXX',
    ), { movesLeft: false, gameOver: true }],
    ['full board, O has won', board(
      'OOOO',
      'XXOX',
      'XOXX',
      'XXOO',
    ), { movesLeft: false, gameOver: true }],
  ])('%s', (_label, b, expected) => {
    expect(game.anyMovesLeft(b)).toBe(expected.movesLeft);
    expect(game.isGameOver(b)).toBe(expected.gameOver);
  });

  describe('throws InvalidBoardError on an invalid board', () => {
    it.each<[string, Board]>([
      ['both players win', board(
        'XXXX',
        'OOOO',
        '....',
        '....',
      )],
      ['impossible counts (O moved first)', board(
        'O...',
        '....',
        '....',
        '....',
      )],
      ['malformed array', [[null, null, null]] as unknown as Board],
    ])('%s', (_label, b) => {
      expect(() => game.anyMovesLeft(b)).toThrow(InvalidBoardError);
      expect(() => game.isGameOver(b)).toThrow(InvalidBoardError);
    });
  });
});

describe('TicTacToe.checkWinner with multiple winning lines', () => {
  const game = new TicTacToe();
  // All boards have valid counts (X = O + 1) and O owns no line, so only the
  // shared-cell rule decides the outcome.

  it('row 0 + column 0 sharing (0,0): returns X', () => {
    const b = board(
      'XXXX',
      'XOOO',
      'XO.O',
      'X.O.',
    );
    expect(game.checkWinner(b)).toBe('X');
  });

  it('row 0 + overlapping 2x2 box (sharing (0,1) and (0,2)): returns X', () => {
    const b = board(
      'XXXX',
      'OXXO',
      'O.O.',
      '.O..',
    );
    expect(game.checkWinner(b)).toBe('X');
  });

  it('row 0 + bottom-middle 2x2 box (no shared cell): throws', () => {
    const b = board(
      'XXXX',
      'OOO.',
      'OXXO',
      'OXXO',
    );
    expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    expect(() => game.checkWinner(b)).toThrow(/disjoint/i);
  });

  it('row 0 + anti-diagonal + 2x2 box (overlap pairwise, no common cell): throws', () => {
    // row0∩anti = (0,3), row0∩box = (0,1),(0,2), anti∩box = (1,2); no cell is in all three.
    const b = board(
      'XXXX',
      'OXXO',
      'OXOO',
      'XOO.',
    );
    expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    expect(() => game.checkWinner(b)).toThrow(/disjoint/i);
  });

  it('a single winning line still returns the winner (regression)', () => {
    const b = board(
      'XXXX',
      'O.O.',
      '.O..',
      '....',
    );
    expect(game.checkWinner(b)).toBe('X');
  });
});

describe('TicTacToe multiple winning lines for O', () => {
  const game = new TicTacToe();

  it('O with row 3 + column 3 sharing (3,3): returns O', () => {
    const b = board(
      'XXXO',
      'X.XO',
      'XX.O',
      'OOOO',
    );
    expect(game.checkWinner(b)).toBe('O');
  });

  it('O with disjoint lines: throws with a disjoint message', () => {
    // The only such board with valid counts and no X line: O owns both diagonals,
    // the corners and the center box, and the two diagonals share no cell.
    const b = board(
      'OXXO',
      'XOOX',
      'XOOX',
      'OXXO',
    );
    expect(() => game.checkWinner(b)).toThrow(InvalidBoardError);
    expect(() => game.checkWinner(b)).toThrow(/disjoint/i);
  });
});

describe('anyMovesLeft and isGameOver on disjoint winning lines', () => {
  const game = new TicTacToe();
  const disjoint = board(
    'XXXX',
    'OOO.',
    'OXXO',
    'OXXO',
  );

  it('anyMovesLeft throws with a disjoint message', () => {
    expect(() => game.anyMovesLeft(disjoint)).toThrow(InvalidBoardError);
    expect(() => game.anyMovesLeft(disjoint)).toThrow(/disjoint/i);
  });

  it('isGameOver throws with a disjoint message', () => {
    expect(() => game.isGameOver(disjoint)).toThrow(InvalidBoardError);
    expect(() => game.isGameOver(disjoint)).toThrow(/disjoint/i);
  });
});

describe('TicTacToe methods called detached', () => {
  const { checkWinner, anyMovesLeft, isGameOver } = new TicTacToe();
  const won = board(
    'XXXX',
    'O.O.',
    '.O..',
    '....',
  );

  it('work without a `this` binding', () => {
    expect(checkWinner(won)).toBe('X');
    expect(anyMovesLeft(won)).toBe(false);
    expect(isGameOver(won)).toBe(true);
  });

  it('work as array callbacks', () => {
    const empty = board('....', '....', '....', '....');
    expect([empty, won].map(new TicTacToe().isGameOver)).toEqual([false, true]);
  });
});
