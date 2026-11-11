import { describe, expect, it } from 'vitest';
import { WINNING_LINES, type Line } from './lines.js';
import { SIZE } from './types.js';

/** Order-insensitive key for a line, so the same cells in a different order count as a duplicate. */
const lineKey = (line: Line): string =>
  line
    .map(([r, c]) => `${r},${c}`)
    .sort()
    .join('|');

describe('WINNING_LINES', () => {
  it('has exactly 20 lines', () => {
    expect(WINNING_LINES).toHaveLength(20);
  });

  it('has no duplicate lines', () => {
    const keys = WINNING_LINES.map(lineKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('each line has 4 distinct, in-bounds cells', () => {
    for (const line of WINNING_LINES) {
      expect(new Set(line.map(([r, c]) => `${r},${c}`)).size).toBe(4);
      for (const [r, c] of line) {
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(SIZE);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(SIZE);
      }
    }
  });
});
