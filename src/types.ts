import { InvalidBoardError } from './errors.js';

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Row = readonly [Cell, Cell, Cell, Cell];
export type Board = readonly [Row, Row, Row, Row];

export const SIZE = 4;
const CELL_COUNT = SIZE * SIZE;

function toCell(ch: string, index: number): Cell {
  switch (ch) {
    case 'X':
      return 'X';
    case 'O':
      return 'O';
    case '.':
      return null;
    default:
      throw new InvalidBoardError(
        `Invalid character ${JSON.stringify(ch)} at index ${index}; expected 'X', 'O' or '.'`,
      );
  }
}

/**
 * Parses a 16-char row-major string ('X', 'O', '.') into a Board.
 * Checks format only; game-rule validity is checked elsewhere.
 */
export function parseBoard(str: string): Board {
  if (typeof str !== 'string') {
    throw new InvalidBoardError(`Expected a string, got ${typeof str}`);
  }
  if (str.length !== CELL_COUNT) {
    throw new InvalidBoardError(`Expected ${CELL_COUNT} characters, got ${str.length}`);
  }

  const cell = (i: number): Cell => toCell(str.charAt(i), i);
  const row = (r: number): Row => {
    const start = r * SIZE;
    return [cell(start), cell(start + 1), cell(start + 2), cell(start + 3)];
  };

  return [row(0), row(1), row(2), row(3)];
}
