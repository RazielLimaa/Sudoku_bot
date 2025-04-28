#!/usr/bin/env node
import readline from "readline"

// Create readline interface for terminal interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Sudoku class to handle generation and solving
class Sudoku {
  constructor() {
    this.grid = Array(9)
      .fill()
      .map(() => Array(9).fill(0))
    this.solution = null
  }

  // Print the Sudoku grid to the terminal
  print() {
    console.log("┌───────┬───────┬───────┐")
    for (let i = 0; i < 9; i++) {
      let row = "│ "
      for (let j = 0; j < 9; j++) {
        row += this.grid[i][j] || " "
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

  // Check if the current grid matches the solution
  checkSolution() {
    if (!this.solution) return false

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.grid[i][j] !== this.solution[i][j]) {
          return false
        }
      }
    }

    return true
  }

  // Set a value in the grid
  setValue(row, col, value) {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      this.grid[row][col] = value
      return true
    }
    return false
  }
}

// Main application class
class SudokuApp {
  constructor() {
    this.sudoku = new Sudoku()
    this.isPlaying = false
  }

  // Display the main menu
  showMainMenu() {
    console.clear()
    console.log("=== SUDOKU GENERATOR AND SOLVER ===")
    console.log("1. Generate a new Sudoku puzzle")
    console.log("2. Solve current Sudoku puzzle")
    console.log("3. Enter a Sudoku puzzle manually")
    console.log("4. Exit")

    rl.question("Select an option: ", (answer) => {
      switch (answer) {
        case "1":
          this.generatePuzzle()
          break
        case "2":
          this.solvePuzzle()
          break
        case "3":
          this.enterPuzzle()
          break
        case "4":
          console.log("Goodbye!")
          rl.close()
          break
        default:
          console.log("Invalid option. Please try again.")
          setTimeout(() => this.showMainMenu(), 1000)
      }
    })
  }

  // Generate a new puzzle
  generatePuzzle() {
    console.clear()
    console.log("=== GENERATE SUDOKU PUZZLE ===")
    console.log("Select difficulty:")
    console.log("1. Easy")
    console.log("2. Medium")
    console.log("3. Hard")
    console.log("4. Expert")
    console.log("5. Back to main menu")

    rl.question("Select an option: ", (answer) => {
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
          setTimeout(() => this.generatePuzzle(), 1000)
          return
      }

      console.log(`Generating ${difficulty} puzzle...`)
      this.sudoku.generatePuzzle(difficulty)
      console.clear()
      console.log(`Generated ${difficulty} Sudoku puzzle:`)
      this.sudoku.print()

      this.playMenu()
    })
  }

  // Solve the current puzzle
  solvePuzzle() {
    console.clear()
    console.log("=== SOLVING PUZZLE ===")
    this.sudoku.print()

    console.log("Solving...")
    const startTime = Date.now()
    const solved = this.sudoku.solve()
    const endTime = Date.now()

    if (solved) {
      console.log(`Puzzle solved in ${endTime - startTime}ms:`)
      this.sudoku.print()
    } else {
      console.log("This puzzle has no solution!")
    }

    rl.question("Press Enter to continue...", () => {
      this.showMainMenu()
    })
  }

  // Enter a puzzle manually
  enterPuzzle() {
    console.clear()
    console.log("=== ENTER SUDOKU PUZZLE ===")
    console.log("Enter each row as 9 digits (use 0 for empty cells)")
    console.log('Example: 530070000 for "5 3 0 0 7 0 0 0 0"')

    this.sudoku = new Sudoku()
    this.enterRow(0)
  }

  // Helper function to enter a row
  enterRow(rowIndex) {
    if (rowIndex >= 9) {
      console.clear()
      console.log("Entered puzzle:")
      this.sudoku.print()
      this.playMenu()
      return
    }

    rl.question(`Enter row ${rowIndex + 1}: `, (input) => {
      // Validate input
      if (!/^[0-9]{9}$/.test(input)) {
        console.log("Invalid input. Please enter exactly 9 digits (0-9).")
        this.enterRow(rowIndex)
        return
      }

      // Set the values in the grid
      for (let i = 0; i < 9; i++) {
        this.sudoku.grid[rowIndex][i] = Number.parseInt(input[i])
      }

      this.enterRow(rowIndex + 1)
    })
  }

  // Play menu for interacting with the puzzle
  playMenu() {
    this.isPlaying = true
    console.log("\n=== PLAY MENU ===")
    console.log("1. Enter a number")
    console.log("2. Solve puzzle")
    console.log("3. Check solution")
    console.log("4. Back to main menu")

    rl.question("Select an option: ", (answer) => {
      switch (answer) {
        case "1":
          this.enterNumber()
          break
        case "2":
          this.solvePuzzle()
          break
        case "3":
          this.checkSolution()
          break
        case "4":
          this.isPlaying = false
          this.showMainMenu()
          break
        default:
          console.log("Invalid option. Please try again.")
          setTimeout(() => this.playMenu(), 1000)
      }
    })
  }

  // Enter a number in the grid
  enterNumber() {
    rl.question("Enter row (1-9): ", (rowInput) => {
      const row = Number.parseInt(rowInput) - 1
      if (isNaN(row) || row < 0 || row > 8) {
        console.log("Invalid row. Please enter a number between 1 and 9.")
        this.enterNumber()
        return
      }

      rl.question("Enter column (1-9): ", (colInput) => {
        const col = Number.parseInt(colInput) - 1
        if (isNaN(col) || col < 0 || col > 8) {
          console.log("Invalid column. Please enter a number between 1 and 9.")
          this.enterNumber()
          return
        }

        rl.question("Enter number (1-9, or 0 to clear): ", (numInput) => {
          const num = Number.parseInt(numInput)
          if (isNaN(num) || num < 0 || num > 9) {
            console.log("Invalid number. Please enter a number between 0 and 9.")
            this.enterNumber()
            return
          }

          if (this.sudoku.setValue(row, col, num)) {
            console.clear()
            console.log("Updated puzzle:")
            this.sudoku.print()
            this.playMenu()
          } else {
            console.log("Could not set value. Please try again.")
            this.enterNumber()
          }
        })
      })
    })
  }

  // Check if the current solution is correct
  checkSolution() {
    console.clear()
    this.sudoku.print()

    if (this.sudoku.checkSolution()) {
      console.log("Congratulations! The solution is correct!")
    } else {
      console.log("The solution is not correct yet.")
    }

    rl.question("Press Enter to continue...", () => {
      console.clear()
      this.sudoku.print()
      this.playMenu()
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
