# 4x4 Tic-Tac-Toe winner checker

## Stack

TypeScript, Vitest. Run tests: `npm test`. Type-check: `npx tsc --noEmit`.

## API (decided — follow this class signature)

```ts
class TicTacToe {
    public checkWinner(board: Board): 'X' | 'O' | null;
    public anyMovesLeft(board: Board): boolean;
    public isGameOver(board: Board): boolean;
}

function parseBoard(s: string): Board; // standalone, not part of the class
```

- Methods take the board as a parameter (pure, no internal state).
- Every method validates the board first and throws `InvalidBoardError` if it is invalid.
- `checkWinner`: the winning player, or `null` if there is no winner (draw or in progress).
- `anyMovesLeft`: `true` only if at least one cell is empty AND nobody has won. It returns `false` after a win, even if cells are still empty.
- `isGameOver`: `true` on a win or a draw (equivalent to `!anyMovesLeft`).
- Game states for a valid board:
  - **Win**: exactly one player fills one of the winning lines.
  - **Draw**: the board is full and nobody has won.
  - **In progress**: anything else.

## Rules (decided — don't change without asking)

- Board: 4x4 grid of 'X' | 'O' | null. Also accept 16-char string ('X','O','.') via `parseBoard`.
- Coordinates are 0-indexed `[row, col]`.
- Win = 4 same marks in: any row, any column, either main diagonal, the 4 corners, any 2x2 box (9 boxes).
  - "Either main diagonal" means the diagonal and the anti-diagonal.
  - The 9 boxes are all contiguous 2x2 boxes, overlapping ones included.
  - That makes 20 lines: 4 rows + 4 cols + 2 diagonals + 1 corners + 9 boxes.
- Winning lines are defined as DATA (list of coordinate sets), not hardcoded per-condition logic.
- X always moves first.
- A winner is awarded only if the board is completely valid.
- Invalid board → throw `InvalidBoardError`. A board is invalid if:
  - Both players have a winning line.
  - It doesn't hold that `X − O ∈ {0, 1}`.
  - X has won but `X ≠ O + 1`.
  - O has won but `X ≠ O`.
  - A board array is not 4x4, or a cell is not 'X' | 'O' | null. Check this at runtime; don't rely only on the types.
  - The winner has disjoint winning lines (see below). The error message says the player has disjoint winning lines.
- A player may have several winning lines only if ALL of them share at least one common cell (the move that completed them).
  - Check the intersection of all the lines, not pairwise overlap. Lines that overlap in pairs but have no cell common to all of them are disjoint.
  - Disjoint winning lines can't happen in legal play, so the board is invalid.

## Parser

- Row-major: chars 0–3 are row 0, and so on.
- Exactly 16 chars. Only uppercase `X`, `O` and `.` are allowed: no lowercase, no whitespace or separators.
- Bad input throws `InvalidBoardError` with a descriptive message.
- The parser checks format only. Game-rule validity is checked by the `TicTacToe` methods.

## Errors

- `InvalidBoardError` extends `Error` and sets `name = 'InvalidBoardError'`.
- Tests assert the error class, not the message text.
  - Exception: the disjoint-lines tests also check that the message contains "disjoint", to prove that this rule is the one throwing.

## Layout

- Source goes in `src/`, with tests next to it as `*.test.ts`.
- `module: nodenext` is set, so relative imports need the `.js` extension (`./board.js`).

## Working style

- Small steps. Propose a plan before writing code. Wait for my approval.
- Write/update tests alongside every change. Run tests before saying you're done.
- Don't add a UI or dependencies.
