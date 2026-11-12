import { describe, expect, it } from 'vitest';
import { WINNING_LINES, type Line } from '../src/lines.js';

/** Order-insensitive key for a set of cells. */
const key = (cells: readonly (readonly [number, number])[]): string =>
  cells
    .map(([r, c]) => `${r},${c}`)
    .sort()
    .join('|');

const lineKey = (line: Line): string => key(line);

/** Cells marked 'X' in a 4-row picture ("XXXX/..../..../...."). */
const maskKey = (mask: string): string =>
  key(mask.split('/').flatMap((row, r) => [...row].flatMap((ch, c) => (ch === 'X' ? [[r, c] as const] : []))));

// The spec, drawn by hand. Independent of how lines.ts generates them.
const EXPECTED: Record<string, string> = {
  row0: 'XXXX/..../..../....',
  row1: '..../XXXX/..../....',
  row2: '..../..../XXXX/....',
  row3: '..../..../..../XXXX',
  col0: 'X.../X.../X.../X...',
  col1: '.X../.X../.X../.X..',
  col2: '..X./..X./..X./..X.',
  col3: '...X/...X/...X/...X',
  diagonal: 'X.../.X../..X./...X',
  antiDiagonal: '...X/..X./.X../X...',
  corners: 'X..X/..../..../X..X',
  box00: 'XX../XX../..../....',
  box01: '.XX./.XX./..../....',
  box02: '..XX/..XX/..../....',
  box10: '..../XX../XX../....',
  box11: '..../.XX./.XX./....',
  box12: '..../..XX/..XX/....',
  box20: '..../..../XX../XX..',
  box21: '..../..../.XX./.XX.',
  box22: '..../..../..XX/..XX',
};

describe('WINNING_LINES', () => {
  it('has exactly 20 lines', () => {
    expect(WINNING_LINES).toHaveLength(20);
  });

  it('has no duplicate lines', () => {
    const keys = WINNING_LINES.map(lineKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('matches the hand-drawn spec exactly', () => {
    const actual = WINNING_LINES.map(lineKey).sort();
    const expected = Object.values(EXPECTED).map(maskKey).sort();
    expect(actual).toEqual(expected);
  });

  it.each(Object.entries(EXPECTED))('includes %s', (_name, mask) => {
    expect(WINNING_LINES.map(lineKey)).toContain(maskKey(mask));
  });
});
