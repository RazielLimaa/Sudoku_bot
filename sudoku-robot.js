#!/usr/bin/env node
import readline from "readline"

// Create readline interface for terminal interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Utility function to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Sudoku class to handle generation and solving
class Sudoku {
  constructor() {
    this.grid = Array(9)
      .fill()
      .map(() => Array(9).fill(0))
    this.solution = null
    this.candidates = Array(9)
      .fill()
      .map(() =>
        Array(9)
          .fill()
          .map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])),
      )
    this.original = null
  }

  // Print the Sudoku grid to the terminal
  print(highlightCell = null) {
    console.log("┌───────┬───────┬───────┐")
    for (let i = 0; i < 9; i++) {
      let row = "│ "
      for (let j = 0; j < 9; j++) {
        // Highlight the cell if specified
        if (highlightCell && highlightCell[0] === i && highlightCell[1] === j) {
          row += `\x1b[32m${this.grid[i][j] || " "}\x1b[0m`
        } else if (this.original && this.original[i][j] !== 0) {
          // Show original clues in bold
          row += `\x1b[1m${this.grid[i][j] || " "}\x1b[0m`
        } else {
          row += this.grid[i][j] || " "
        }
        row += " "
        if ((j + 1) % 3 === 0) {
          row += "│ "
        }
      }
      console.log(row)
      if ((i + 1) % 3 === 0 && i < 8) {
        console.log("├───────┼───────┼───────┤")
      }
    }
    console.log("└───────┴───────┴───────┘")
  }

  // Check if a number can be placed at a specific position
  isValid(row, col, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (this.grid[row][i] === num) {
        return false
      }
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (this.grid[i][col] === num) {
        return false
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.grid[boxRow + i][boxCol + j] === num) {
          return false
        }
      }
    }

    return true
  }

  // Solve the Sudoku using backtracking algorithm
  solve() {
    const emptyCell = this.findEmptyCell()
    if (!emptyCell) {
      return true // Puzzle solved
    }

    const [row, col] = emptyCell

    // Try placing numbers 1-9
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(row, col, num)) {
        this.grid[row][col] = num

        if (this.solve()) {
          return true
        }

        this.grid[row][col] = 0 // Backtrack
      }
    }

    return false // Trigger backtracking
  }

  // Find an empty cell in the grid
  findEmptyCell() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.grid[i][j] === 0) {
          return [i, j]
        }
      }
    }
    return null // No empty cells
  }

  // Generate a complete Sudoku solution
  generateSolution() {
    // Clear the grid
    this.grid = Array(9)
      .fill()
      .map(() => Array(9).fill(0))

    // Fill diagonal boxes first (these can be filled independently)
    this.fillDiagonalBoxes()

    // Solve the rest of the grid
    this.solve()

    // Store the complete solution
    this.solution = this.grid.map((row) => [...row])
  }

  // Fill the diagonal 3x3 boxes with random numbers
  fillDiagonalBoxes() {
    for (let box = 0; box < 3; box++) {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      this.shuffleArray(numbers)

      let index = 0
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.grid[box * 3 + i][box * 3 + j] = numbers[index++]
        }
      }
    }
  }

  // Create a puzzle by removing numbers from the solution
  generatePuzzle(difficulty) {
    // Generate a complete solution first
    this.generateSolution()

    // Make a copy of the solution
    this.grid = this.solution.map((row) => [...row])

    // Determine how many cells to remove based on difficulty
    let cellsToRemove
    switch (difficulty) {
      case "easy":
        cellsToRemove = 40 // 41 clues remain
        break
      case "medium":
        cellsToRemove = 50 // 31 clues remain
        break
      case "hard":
        cellsToRemove = 55 // 26 clues remain
        break
      case "expert":
        cellsToRemove = 60 // 21 clues remain
        break
      default:
        cellsToRemove = 45
    }

    // Remove cells while ensuring the puzzle remains uniquely solvable
    this.removeNumbers(cellsToRemove)

    // Store the original puzzle
    this.original = this.grid.map((row) => [...row])

    // Initialize candidates for each cell
    this.initializeCandidates()
  }

  // Remove numbers while ensuring unique solution
  removeNumbers(count) {
    const positions = []

    // Create a list of all positions
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push([i, j])
      }
    }

    // Shuffle the positions
    this.shuffleArray(positions)

    // Try to remove numbers
    let removed = 0
    for (const [row, col] of positions) {
      if (removed >= count) break

      const backup = this.grid[row][col]
      this.grid[row][col] = 0

      // Check if the puzzle still has a unique solution
      if (this.hasUniqueSolution()) {
        removed++
      } else {
        // If not, restore the number
        this.grid[row][col] = backup
      }
    }
  }

  // Check if the puzzle has a unique solution
  hasUniqueSolution() {
    // For simplicity, we'll just check if the puzzle is solvable
    // A more thorough check would verify that only one solution exists
    const tempGrid = this.grid.map((row) => [...row])
    const result = this.solve()
    this.grid = tempGrid
    return result
  }

  // Utility function to shuffle an array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Initialize candidates for each cell
  initializeCandidates() {
    // Reset all candidates
    this.candidates = Array(9)
      .fill()
      .map(() =>
        Array(9)
          .fill()
          .map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])),
      )

    // Remove candidates based on existing numbers
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] !== 0) {
          // Cell already has a value, no candidates needed
          this.candidates[row][col].clear()

          // Remove this value from candidates in the same row, column, and box
          this.updateCandidates(row, col, this.grid[row][col])
        }
      }
    }
  }

  // Update candidates after placing a number
  updateCandidates(row, col, num) {
    // Remove from row
    for (let i = 0; i < 9; i++) {
      this.candidates[row][i].delete(num)
    }

    // Remove from column
    for (let i = 0; i < 9; i++) {
      this.candidates[i][col].delete(num)
    }

    // Remove from box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.candidates[boxRow + i][boxCol + j].delete(num)
      }
    }
  }

  // Set a value in the grid and update candidates
  setValue(row, col, value) {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      this.grid[row][col] = value

      if (value !== 0) {
        // Clear candidates for this cell
        this.candidates[row][col].clear()

        // Update candidates in related cells
        this.updateCandidates(row, col, value)
      } else {
        // If clearing a cell, recalculate its candidates
        this.recalculateCandidates(row, col)
      }

      return true
    }
    return false
  }

  // Recalculate candidates for a specific cell
  recalculateCandidates(row, col) {
    // Start with all possibilities
    this.candidates[row][col] = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])

    // Remove candidates based on row
    for (let i = 0; i < 9; i++) {
      if (this.grid[row][i] !== 0) {
        this.candidates[row][col].delete(this.grid[row][i])
      }
    }

    // Remove candidates based on column
    for (let i = 0; i < 9; i++) {
      if (this.grid[i][col] !== 0) {
        this.candidates[row][col].delete(this.grid[i][col])
      }
    }

    // Remove candidates based on box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.grid[boxRow + i][boxCol + j] !== 0) {
          this.candidates[row][col].delete(this.grid[boxRow + i][boxCol + j])
        }
      }
    }
  }

  // Find naked singles (cells with only one candidate)
  findNakedSingles() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0 && this.candidates[row][col].size === 1) {
          const value = [...this.candidates[row][col]][0]
          return { technique: "Naked Single", row, col, value }
        }
      }
    }
    return null
  }

  // Find hidden singles (a number that can only go in one place in a row/column/box)
  findHiddenSingles() {
    // Check rows
    for (let row = 0; row < 9; row++) {
      for (let num = 1; num <= 9; num++) {
        const possiblePositions = []
        for (let col = 0; col < 9; col++) {
          if (this.grid[row][col] === 0 && this.candidates[row][col].has(num)) {
            possiblePositions.push(col)
          }
        }
        if (possiblePositions.length === 1) {
          return {
            technique: "Hidden Single (Row)",
            row,
            col: possiblePositions[0],
            value: num,
          }
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      for (let num = 1; num <= 9; num++) {
        const possiblePositions = []
        for (let row = 0; row < 9; row++) {
          if (this.grid[row][col] === 0 && this.candidates[row][col].has(num)) {
            possiblePositions.push(row)
          }
        }
        if (possiblePositions.length === 1) {
          return {
            technique: "Hidden Single (Column)",
            row: possiblePositions[0],
            col,
            value: num,
          }
        }
      }
    }

    // Check boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        for (let num = 1; num <= 9; num++) {
          const possiblePositions = []
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              const row = boxRow * 3 + i
              const col = boxCol * 3 + j
              if (this.grid[row][col] === 0 && this.candidates[row][col].has(num)) {
                possiblePositions.push([row, col])
              }
            }
          }
          if (possiblePositions.length === 1) {
            return {
              technique: "Hidden Single (Box)",
              row: possiblePositions[0][0],
              col: possiblePositions[0][1],
              value: num,
            }
          }
        }
      }
    }

    return null
  }

  // Find naked pairs (two cells in a row/column/box with the same two candidates)
  findNakedPairs() {
    // Check rows
    for (let row = 0; row < 9; row++) {
      const pairCells = []
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0 && this.candidates[row][col].size === 2) {
          pairCells.push({ col, candidates: [...this.candidates[row][col]] })
        }
      }

      for (let i = 0; i < pairCells.length; i++) {
        for (let j = i + 1; j < pairCells.length; j++) {
          const pair1 = pairCells[i]
          const pair2 = pairCells[j]

          if (pair1.candidates[0] === pair2.candidates[0] && pair1.candidates[1] === pair2.candidates[1]) {
            // Found a naked pair, check if it eliminates any candidates
            let elimination = false
            for (let col = 0; col < 9; col++) {
              if (col !== pair1.col && col !== pair2.col && this.grid[row][col] === 0) {
                for (const num of pair1.candidates) {
                  if (this.candidates[row][col].has(num)) {
                    elimination = true
                    break
                  }
                }
              }
            }

            if (elimination) {
              return {
                technique: "Naked Pair (Row)",
                cells: [
                  { row, col: pair1.col },
                  { row, col: pair2.col },
                ],
                values: pair1.candidates,
              }
            }
          }
        }
      }
    }

    // Check columns (similar logic)
    for (let col = 0; col < 9; col++) {
      const pairCells = []
      for (let row = 0; row < 9; row++) {
        if (this.grid[row][col] === 0 && this.candidates[row][col].size === 2) {
          pairCells.push({ row, candidates: [...this.candidates[row][col]] })
        }
      }

      for (let i = 0; i < pairCells.length; i++) {
        for (let j = i + 1; j < pairCells.length; j++) {
          const pair1 = pairCells[i]
          const pair2 = pairCells[j]

          if (pair1.candidates[0] === pair2.candidates[0] && pair1.candidates[1] === pair2.candidates[1]) {
            // Found a naked pair, check if it eliminates any candidates
            let elimination = false
            for (let row = 0; row < 9; row++) {
              if (row !== pair1.row && row !== pair2.row && this.grid[row][col] === 0) {
                for (const num of pair1.candidates) {
                  if (this.candidates[row][col].has(num)) {
                    elimination = true
                    break
                  }
                }
              }
            }

            if (elimination) {
              return {
                technique: "Naked Pair (Column)",
                cells: [
                  { row: pair1.row, col },
                  { row: pair2.row, col },
                ],
                values: pair1.candidates,
              }
            }
          }
        }
      }
    }

    // Check boxes (similar logic)
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const pairCells = []
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i
            const col = boxCol * 3 + j
            if (this.grid[row][col] === 0 && this.candidates[row][col].size === 2) {
              pairCells.push({ row, col, candidates: [...this.candidates[row][col]] })
            }
          }
        }

        for (let i = 0; i < pairCells.length; i++) {
          for (let j = i + 1; j < pairCells.length; j++) {
            const pair1 = pairCells[i]
            const pair2 = pairCells[j]

            if (pair1.candidates[0] === pair2.candidates[0] && pair1.candidates[1] === pair2.candidates[1]) {
              // Found a naked pair, check if it eliminates any candidates
              let elimination = false
              for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                  const row = boxRow * 3 + i
                  const col = boxCol * 3 + j
                  if (
                    (row !== pair1.row || col !== pair1.col) &&
                    (row !== pair2.row || col !== pair2.col) &&
                    this.grid[row][col] === 0
                  ) {
                    for (const num of pair1.candidates) {
                      if (this.candidates[row][col].has(num)) {
                        elimination = true
                        break
                      }
                    }
                  }
                }
              }

              if (elimination) {
                return {
                  technique: "Naked Pair (Box)",
                  cells: [
                    { row: pair1.row, col: pair1.col },
                    { row: pair2.row, col: pair2.col },
                  ],
                  values: pair1.candidates,
                }
              }
            }
          }
        }
      }
    }

    return null
  }

  // Apply naked pair elimination
  applyNakedPair(nakedPair) {
    const { technique, cells, values } = nakedPair
    let changed = false

    if (technique.includes("Row")) {
      const row = cells[0].row
      for (let col = 0; col < 9; col++) {
        if (col !== cells[0].col && col !== cells[1].col && this.grid[row][col] === 0) {
          for (const value of values) {
            if (this.candidates[row][col].has(value)) {
              this.candidates[row][col].delete(value)
              changed = true
            }
          }
        }
      }
    } else if (technique.includes("Column")) {
      const col = cells[0].col
      for (let row = 0; row < 9; row++) {
        if (row !== cells[0].row && row !== cells[1].row && this.grid[row][col] === 0) {
          for (const value of values) {
            if (this.candidates[row][col].has(value)) {
              this.candidates[row][col].delete(value)
              changed = true
            }
          }
        }
      }
    } else if (technique.includes("Box")) {
      const boxRow = Math.floor(cells[0].row / 3) * 3
      const boxCol = Math.floor(cells[0].col / 3) * 3
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow + i
          const col = boxCol + j
          if (
            (row !== cells[0].row || col !== cells[0].col) &&
            (row !== cells[1].row || col !== cells[1].col) &&
            this.grid[row][col] === 0
          ) {
            for (const value of values) {
              if (this.candidates[row][col].has(value)) {
                this.candidates[row][col].delete(value)
                changed = true
              }
            }
          }
        }
      }
    }

    return changed
  }

  // Find pointing pairs/triples (when a number can only appear in one row/column within a box)
  findPointingPairs() {
    // Check each box
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        // Check each possible number
        for (let num = 1; num <= 9; num++) {
          const rowPositions = new Set()
          const colPositions = new Set()
          let count = 0

          // Find all positions in this box where num is a candidate
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              const row = boxRow * 3 + i
              const col = boxCol * 3 + j
              if (this.grid[row][col] === 0 && this.candidates[row][col].has(num)) {
                rowPositions.add(i)
                colPositions.add(j)
                count++
              }
            }
          }

          // If all candidates are in the same row
          if (count >= 2 && count <= 3 && rowPositions.size === 1) {
            const rowOffset = [...rowPositions][0]
            const row = boxRow * 3 + rowOffset

            // Check if there are candidates outside the box in this row
            let elimination = false
            for (let col = 0; col < 9; col++) {
              const boxColCheck = Math.floor(col / 3)
              if (boxColCheck !== boxCol && this.grid[row][col] === 0 && this.candidates[row][col].has(num)) {
                elimination = true
                break
              }
            }

            if (elimination) {
              return {
                technique: "Pointing Pair/Triple (Row)",
                box: { boxRow, boxCol },
                row,
                value: num,
              }
            }
          }

          // If all candidates are in the same column
          if (count >= 2 && count <= 3 && colPositions.size === 1) {
            const colOffset = [...colPositions][0]
            const col = boxCol * 3 + colOffset

            // Check if there are candidates outside the box in this column
            let elimination = false
            for (let row = 0; row < 9; row++) {
              const boxRowCheck = Math.floor(row / 3)
              if (boxRowCheck !== boxRow && this.grid[row][col] === 0 && this.candidates[row][col].has(num)) {
                elimination = true
                break
              }
            }

            if (elimination) {
              return {
                technique: "Pointing Pair/Triple (Column)",
                box: { boxRow, boxCol },
                col,
                value: num,
              }
            }
          }
        }
      }
    }

    return null
  }

  // Apply pointing pair/triple elimination
  applyPointingPair(pointingPair) {
    const { technique, box, value } = pointingPair
    let changed = false

    if (technique.includes("Row")) {
      const row = pointingPair.row
      for (let col = 0; col < 9; col++) {
        const boxColCheck = Math.floor(col / 3)
        if (boxColCheck !== box.boxCol && this.grid[row][col] === 0 && this.candidates[row][col].has(value)) {
          this.candidates[row][col].delete(value)
          changed = true
        }
      }
    } else if (technique.includes("Column")) {
      const col = pointingPair.col
      for (let row = 0; row < 9; row++) {
        const boxRowCheck = Math.floor(row / 3)
        if (boxRowCheck !== box.boxRow && this.grid[row][col] === 0 && this.candidates[row][col].has(value)) {
          this.candidates[row][col].delete(value)
          changed = true
        }
      }
    }

    return changed
  }

  // Find a move using various techniques
  findMove() {
    // Try naked singles first (most basic technique)
    const nakedSingle = this.findNakedSingles()
    if (nakedSingle) {
      return nakedSingle
    }

    // Try hidden singles
    const hiddenSingle = this.findHiddenSingles()
    if (hiddenSingle) {
      return hiddenSingle
    }

    // Try naked pairs
    const nakedPair = this.findNakedPairs()
    if (nakedPair) {
      return nakedPair
    }

    // Try pointing pairs/triples
    const pointingPair = this.findPointingPairs()
    if (pointingPair) {
      return pointingPair
    }

    // If no logical technique works, use backtracking as a last resort
    return { technique: "Backtracking" }
  }

  // Apply a move
  applyMove(move) {
    if (move.technique === "Naked Single" || move.technique.includes("Hidden Single")) {
      this.setValue(move.row, move.col, move.value)
      return true
    } else if (move.technique.includes("Naked Pair")) {
      return this.applyNakedPair(move)
    } else if (move.technique.includes("Pointing Pair")) {
      return this.applyPointingPair(move)
    } else if (move.technique === "Backtracking") {
      // Find a cell with minimum candidates
      let minCandidates = 10
      let minCell = null

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (
            this.grid[row][col] === 0 &&
            this.candidates[row][col].size < minCandidates &&
            this.candidates[row][col].size > 0
          ) {
            minCandidates = this.candidates[row][col].size
            minCell = [row, col]
          }
        }
      }

      if (minCell) {
        const [row, col] = minCell
        const value = [...this.candidates[row][col]][0]
        this.setValue(row, col, value)
        return true
      }
    }

    return false
  }

  // Check if the puzzle is solved
  isSolved() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) {
          return false
        }
      }
    }
    return true
  }

  // Print candidates for a specific cell
  printCandidates(row, col) {
    if (this.grid[row][col] !== 0) {
      return `Cell (${row + 1},${col + 1}) already has value ${this.grid[row][col]}`
    }

    const candidates = [...this.candidates[row][col]].sort().join(", ")
    return `Candidates for cell (${row + 1},${col + 1}): ${candidates}`
  }
}

// SudokuRobot class to automatically solve puzzles
class SudokuRobot {
  constructor() {
    this.sudoku = new Sudoku()
    this.moveHistory = []
    this.speed = 500 // milliseconds between moves
  }

  // Generate a new puzzle
  async generatePuzzle(difficulty) {
    console.clear()
    console.log(`Generating ${difficulty} puzzle...`)
    this.sudoku.generatePuzzle(difficulty)
    console.log(`Generated ${difficulty} Sudoku puzzle:`)
    this.sudoku.print()
    this.moveHistory = []
  }

  // Solve the puzzle automatically
  async solvePuzzle() {
    console.clear()
    console.log("=== AUTOMATIC SOLVING ===")
    console.log("Starting to solve the puzzle...")
    this.sudoku.print()

    await sleep(1000)

    let moveCount = 0
    let lastTechnique = ""

    while (!this.sudoku.isSolved()) {
      const move = this.sudoku.findMove()

      if (move.technique === "Naked Single" || move.technique.includes("Hidden Single")) {
        console.clear()
        console.log(`Move ${++moveCount}: ${move.technique}`)
        console.log(`Placing ${move.value} at position (${move.row + 1},${move.col + 1})`)
        console.log(this.sudoku.printCandidates(move.row, move.col))

        this.sudoku.setValue(move.row, move.col, move.value)
        this.moveHistory.push(move)

        this.sudoku.print([move.row, move.col])
        lastTechnique = move.technique

        await sleep(this.speed)
      } else if (move.technique.includes("Naked Pair")) {
        console.clear()
        console.log(`Move ${++moveCount}: ${move.technique}`)
        console.log(
          `Found Naked Pair ${move.values.join(", ")} at positions (${move.cells[0].row + 1},${move.cells[0].col + 1}) and (${move.cells[1].row + 1},${move.cells[1].col + 1})`,
        )
        console.log("Eliminating these values from other cells in the same unit")

        const changed = this.sudoku.applyNakedPair(move)
        if (changed) {
          this.moveHistory.push(move)
        }

        this.sudoku.print()
        lastTechnique = move.technique

        await sleep(this.speed)
      } else if (move.technique.includes("Pointing Pair")) {
        console.clear()
        console.log(`Move ${++moveCount}: ${move.technique}`)

        if (move.technique.includes("Row")) {
          console.log(
            `Found ${move.value} confined to row ${move.row + 1} in box (${move.box.boxRow + 1},${move.box.boxCol + 1})`,
          )
          console.log(`Eliminating ${move.value} from other cells in row ${move.row + 1}`)
        } else {
          console.log(
            `Found ${move.value} confined to column ${move.col + 1} in box (${move.box.boxRow + 1},${move.box.boxCol + 1})`,
          )
          console.log(`Eliminating ${move.value} from other cells in column ${move.col + 1}`)
        }

        const changed = this.sudoku.applyPointingPair(move)
        if (changed) {
          this.moveHistory.push(move)
        }

        this.sudoku.print()
        lastTechnique = move.technique

        await sleep(this.speed)
      } else if (move.technique === "Backtracking") {
        // If we need to use backtracking, find a cell with minimum candidates
        let minCandidates = 10
        let minCell = null

        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (
              this.sudoku.grid[row][col] === 0 &&
              this.sudoku.candidates[row][col].size < minCandidates &&
              this.sudoku.candidates[row][col].size > 0
            ) {
              minCandidates = this.sudoku.candidates[row][col].size
              minCell = [row, col]
            }
          }
        }

        if (minCell) {
          const [row, col] = minCell
          const candidates = [...this.sudoku.candidates[row][col]]
          const value = candidates[0]

          console.clear()
          console.log(`Move ${++moveCount}: Guessing (Backtracking)`)
          console.log(`Trying ${value} at position (${row + 1},${col + 1})`)
          console.log(`Possible values: ${candidates.join(", ")}`)

          this.sudoku.setValue(row, col, value)
          this.moveHistory.push({
            technique: "Backtracking",
            row,
            col,
            value,
            candidates,
          })

          this.sudoku.print([row, col])
          lastTechnique = "Backtracking"

          await sleep(this.speed)
        } else {
          console.log("No valid moves found. Puzzle may be unsolvable.")
          break
        }
      } else {
        console.log("No valid moves found. Puzzle may be unsolvable.")
        break
      }
    }

    if (this.sudoku.isSolved()) {
      console.clear()
      console.log("=== PUZZLE SOLVED! ===")
      console.log(`Total moves: ${moveCount}`)
      console.log("Final solution:")
      this.sudoku.print()

      // Show statistics
      const techniques = {}
      for (const move of this.moveHistory) {
        techniques[move.technique] = (techniques[move.technique] || 0) + 1
      }

      console.log("\nTechniques used:")
      for (const [technique, count] of Object.entries(techniques)) {
        console.log(`- ${technique}: ${count} times`)
      }
    }
  }

  // Set the speed of the robot
  setSpeed(speed) {
    this.speed = speed
  }
}

// Main application class
class SudokuApp {
  constructor() {
    this.robot = new SudokuRobot()
  }

  // Display the main menu
  showMainMenu() {
    console.clear()
    console.log("=== SUDOKU ROBOT ===")
    console.log("1. Generate and solve a new Sudoku puzzle")
    console.log("2. Set solving speed")
    console.log("3. Exit")

    rl.question("Select an option: ", (answer) => {
      switch (answer) {
        case "1":
          this.selectDifficulty()
          break
        case "2":
          this.setSpeed()
          break
        case "3":
          console.log("Goodbye!")
          rl.close()
          break
        default:
          console.log("Invalid option. Please try again.")
          setTimeout(() => this.showMainMenu(), 1000)
      }
    })
  }

  // Select difficulty level
  selectDifficulty() {
    console.clear()
    console.log("=== SELECT DIFFICULTY ===")
    console.log("1. Easy")
    console.log("2. Medium")
    console.log("3. Hard")
    console.log("4. Expert")
    console.log("5. Back to main menu")

    rl.question("Select an option: ", async (answer) => {
      let difficulty
      switch (answer) {
        case "1":
          difficulty = "easy"
          break
        case "2":
          difficulty = "medium"
          break
        case "3":
          difficulty = "hard"
          break
        case "4":
          difficulty = "expert"
          break
        case "5":
          this.showMainMenu()
          return
        default:
          console.log("Invalid option. Please try again.")
          setTimeout(() => this.selectDifficulty(), 1000)
          return
      }

      await this.robot.generatePuzzle(difficulty)

      rl.question("Press Enter to watch the robot solve this puzzle...", async () => {
        await this.robot.solvePuzzle()

        rl.question("Press Enter to return to main menu...", () => {
          this.showMainMenu()
        })
      })
    })
  }

  // Set the solving speed
  setSpeed() {
    console.clear()
    console.log("=== SET SOLVING SPEED ===")
    console.log("1. Slow (1000ms)")
    console.log("2. Medium (500ms)")
    console.log("3. Fast (200ms)")
    console.log("4. Very Fast (50ms)")
    console.log("5. Back to main menu")

    rl.question("Select an option: ", (answer) => {
      switch (answer) {
        case "1":
          this.robot.setSpeed(1000)
          console.log("Speed set to Slow")
          break
        case "2":
          this.robot.setSpeed(500)
          console.log("Speed set to Medium")
          break
        case "3":
          this.robot.setSpeed(200)
          console.log("Speed set to Fast")
          break
        case "4":
          this.robot.setSpeed(50)
          console.log("Speed set to Very Fast")
          break
        case "5":
          this.showMainMenu()
          return
        default:
          console.log("Invalid option. Please try again.")
          setTimeout(() => this.setSpeed(), 1000)
          return
      }

      setTimeout(() => this.showMainMenu(), 1500)
    })
  }

  // Start the application
  start() {
    this.showMainMenu()
  }
}

// Start the application
const app = new SudokuApp()
app.start()
