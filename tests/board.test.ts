import { describe, expect, it } from 'vitest';
import { InvalidBoardError } from '../src/errors.js';
import { parseBoard } from '../src/board.js';

describe('parseBoard', () => {
  describe('valid input', () => {
    it('parses an empty board to all nulls', () => {
      expect(parseBoard('................')).toEqual([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
    });

    it('parses row-major: chars 0-3 are row 0', () => {
      expect(parseBoard('XO..' + '.X..' + '..O.' + '...X')).toEqual([
        ['X', 'O', null, null],
        [null, 'X', null, null],
        [null, null, 'O', null],
        [null, null, null, 'X'],
      ]);
    });

    it('parses a full board', () => {
      expect(parseBoard('XOXO' + 'OXOX' + 'XOXO' + 'OXOX')).toEqual([
        ['X', 'O', 'X', 'O'],
        ['O', 'X', 'O', 'X'],
        ['X', 'O', 'X', 'O'],
        ['O', 'X', 'O', 'X'],
      ]);
    });

    it('checks format only, not game rules', () => {
      expect(() => parseBoard('XXXXXXXXXXXXXXXX')).not.toThrow();
    });
  });

  describe('invalid input', () => {
    it.each([
      ['empty string', ''],
      ['15 chars', '...............'],
      ['17 chars', '.................'],
    ])('rejects wrong length: %s', (_label, input) => {
      expect(() => parseBoard(input)).toThrow(InvalidBoardError);
    });

    it.each([
      ['lowercase x', 'x...............'],
      ['lowercase o', '...............o'],
      ['space', 'XO.. X..........'.slice(0, 16)],
      ['newline', 'XO..\nX..........'.slice(0, 16)],
      ['dash', '-...............'],
      ['digit zero', '0...............'],
    ])('rejects invalid character: %s', (_label, input) => {
      expect(input).toHaveLength(16);
      expect(() => parseBoard(input)).toThrow(InvalidBoardError);
    });

    it('rejects separated rows (wrong length)', () => {
      expect(() => parseBoard('XO..\n....\n....\n....')).toThrow(InvalidBoardError);
    });

    it('rejects non-string input at runtime', () => {
      expect(() => parseBoard(null as unknown as string)).toThrow(InvalidBoardError);
      expect(() => parseBoard(16 as unknown as string)).toThrow(InvalidBoardError);
    });

    it('throws an Error subclass named InvalidBoardError', () => {
      expect(() => parseBoard('')).toThrow(Error);
      try {
        parseBoard('');
      } catch (e) {
        expect((e as Error).name).toBe('InvalidBoardError');
      }
    });
  });
});
