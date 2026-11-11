import { SIZE } from './types.js';

/** 0-indexed [row, col]. */
export type Coord = readonly [row: number, col: number];
export type Line = readonly [Coord, Coord, Coord, Coord];

const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/** Builds a 4-cell line from a function mapping step 0..3 to a coordinate. */
const line = (at: (i: number) => Coord): Line => [at(0), at(1), at(2), at(3)];

function generateWinningLines(): Line[] {
  const last = SIZE - 1;

  const rows = range(SIZE).map((r) => line((i) => [r, i]));
  const cols = range(SIZE).map((c) => line((i) => [i, c]));
  const diagonals = [line((i) => [i, i]), line((i) => [i, last - i])];
  const corners: Line = [[0, 0], [0, last], [last, 0], [last, last]];
  const boxes = range(SIZE - 1).flatMap((r) =>
    range(SIZE - 1).map(
      (c): Line => [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]],
    ),
  );

  return [...rows, ...cols, ...diagonals, corners, ...boxes];
}

/** All 20 winning lines: 4 rows, 4 cols, 2 diagonals, 4 corners, 9 2x2 boxes. */
export const WINNING_LINES: readonly Line[] = generateWinningLines();
