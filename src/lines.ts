/** 0-indexed [row, col]. */
export type Coord = readonly [row: number, col: number];
export type Line = readonly [Coord, Coord, Coord, Coord];

const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/** Builds a 4-cell line from a function mapping step 0..3 to a coordinate. */
const line = (at: (i: number) => Coord): Line => [at(0), at(1), at(2), at(3)];

function generateWinningLines(): Line[] {
  const rows = range(4).map((r) => line((i) => [r, i]));
  const cols = range(4).map((c) => line((i) => [i, c]));
  const diagonals = [line((i) => [i, i]), line((i) => [i, 3 - i])];
  const corners: Line = [[0, 0], [0, 3], [3, 0], [3, 3]];
  const boxes = range(3).flatMap((r) =>
    range(3).map((c): Line => [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]),
  );

  return [...rows, ...cols, ...diagonals, corners, ...boxes];
}

/** All 20 winning lines: 4 rows, 4 columns, 2 diagonals, the 4 corners (1 line) and 9 2x2 boxes. */
export const WINNING_LINES: readonly Line[] = generateWinningLines();
