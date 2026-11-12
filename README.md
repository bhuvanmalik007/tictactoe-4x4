# tictactoe-4x4

A winner checker for 4x4 tic-tac-toe, written in TypeScript. It tells you who has won, whether moves are left and whether the game is over. It also rejects any board that could not happen in a real game.

There is no UI and there are no runtime dependencies.

## Commands

```sh
npm install                              # install dev dependencies (TypeScript, Vitest)
npm test                                 # run all tests once
npm run test:watch                       # run tests in watch mode
npx vitest run tests/lines.test.ts       # run a single test file
npx vitest run -t "disjoint"             # run tests whose name matches
npm run typecheck                        # type-check everything (same as npx tsc --noEmit)
```

There is no build step. Vitest runs the TypeScript sources directly, and `tsc` is used only for type-checking.

## Usage

```ts
import { parseBoard } from './src/board.js';
import { TicTacToe } from './src/TicTacToe.js';

const game = new TicTacToe();
const board = parseBoard(
  'XXXX' +
  'O.O.' +
  '.O..' +
  '....',
);

game.checkWinner(board);  // 'X'
game.anyMovesLeft(board); // false (the game was won)
game.isGameOver(board);   // true
```

| Function | Returns | Meaning |
|---|---|---|
| `parseBoard(str)` | `Board` | Turns a 16-character string into a board. Checks the format only. |
| `checkWinner(board)` | `'X' \| 'O' \| null` | The winner, or `null` for a draw or a game in progress. |
| `anyMovesLeft(board)` | `boolean` | `true` only if nobody has won and at least one cell is empty. |
| `isGameOver(board)` | `boolean` | `true` on a win or a draw. Always the opposite of `anyMovesLeft`. |

All three `TicTacToe` methods validate the board first. They throw `InvalidBoardError` if it is invalid.

## Rules

### Winning lines

A player wins by filling any of these 20 lines:

| Line | Count |
|---|---|
| Rows | 4 |
| Columns | 4 |
| Diagonals (main and anti-diagonal) | 2 |
| The 4 corners (one line) | 1 |
| 2x2 boxes, overlapping ones included | 9 |

### When a board is invalid

A board is rejected with `InvalidBoardError` if it fails any of these checks. They run in this order, and the first failure decides the error message:

1. **Shape.** The board must be 4 rows of 4 cells, each `'X'`, `'O'` or `null`.
2. **Mark counts.** X moves first, so X has the same number of marks as O or one more.
3. **Both players win.** At most one player can have a winning line.
4. **Winner fits the turn order.** The winner must have made the last move. An X win needs one more X than O; an O win needs equal counts.
5. **Disjoint winning lines.** A player may hold several winning lines only if one cell is in all of them. The error message says the player has disjoint winning lines.

## Assumptions

- X always moves first.
- Coordinates are 0-indexed `[row, col]`.
- Board strings are read row by row: characters 0–3 are row 0, and so on.
- A board string is exactly 16 characters of uppercase `X`, `O` and `.` (empty). Lowercase letters, whitespace and separators are rejected.
- A full board with no winner is a draw. Any other valid board without a winner is a game in progress.
- After a win, there are no moves left, even if some cells are still empty.
- The board is always 4x4. The size is not configurable.

## Design decisions

- **Winning lines are data.** `src/lines.ts` builds `WINNING_LINES` as a list of coordinate sets, and every check just loops over that list. There is no separate code per kind of line. A test compares the list against a hand-drawn picture of all 20 lines, so a mistake in generating them fails a test.
- **Parsing is separate from game rules.** `parseBoard` only checks the string format and builds the board. The `TicTacToe` methods check whether the board could happen in a real game. A string like 16 X's parses fine but is rejected by the methods.
- **No stored state.** `TicTacToe` holds no state, and every method takes the board as a parameter. The methods don't use `this`, so they still work when passed around on their own, for example `boards.map(game.isGameOver)`.
- **Every method validates.** All three methods go through one validation function, so they can never disagree about whether a board is valid.
- **Runtime checks as well as types.** `Board` is a read-only 4x4 tuple type, but boards can still come from JSON or plain JavaScript. The shape is therefore checked at runtime too, including arrays with missing entries.
- **One error class.** Every invalid input throws `InvalidBoardError`, which extends `Error`, with a message that names the broken rule. Tests check the error class, except the disjoint-lines tests, which also check the message.

### Why the shared-cell rule

The rule comes from how a game ends. The game stops as soon as a player wins, so the winning move is the last move. If a player holds several winning lines, that single move must have completed all of them. That means the move's cell must be in every one of those lines.

If no cell is in all of them, at least one line was already complete before the last move. The game would have ended earlier, so the board can't happen. The rule checks all of the winner's lines together, not pair by pair. For example, three lines can each overlap the other two and still have no cell in common.

Together with the count rules, these checks accept exactly the boards that legal play can produce. This was confirmed once by generating every board reachable from an empty board and comparing it with what the validator accepts, across all 3¹⁶ boards. That exhaustive check takes about 36 seconds and is not part of `npm test`.

## Project layout

```
src/
  board.ts       Player, Cell, Board types and parseBoard
  lines.ts       WINNING_LINES and the Coord and Line types
  errors.ts      InvalidBoardError
  TicTacToe.ts   the TicTacToe class and the board validation
tests/
  board.test.ts       parser: valid and invalid strings
  lines.test.ts       the 20 lines against the hand-drawn spec
  TicTacToe.test.ts   wins, draws, validation rules, disjoint lines, detached calls
```

The test boards are written as four row strings stacked on top of each other, so each one reads as a grid. Every test board breaks at most one rule, so each test checks the rule it names.
