"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGameData } from "@/components/game-data-provider"

type Tile = {
  value: number
  position: number
}

export function GridPuzzle() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [emptyPosition, setEmptyPosition] = useState(15)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["grid-puzzle"] || { plays: 0 }

  // Check if a puzzle configuration is solvable
  const isSolvable = useCallback((tiles: Tile[], emptyPos: number): boolean => {
    // Count inversions
    let inversions = 0
    const values = tiles.map((t) => t.value)

    for (let i = 0; i < values.length; i++) {
      if (values[i] === 0) continue // Skip empty tile
      for (let j = i + 1; j < values.length; j++) {
        if (values[j] === 0) continue // Skip empty tile
        if (values[i] > values[j]) {
          inversions++
        }
      }
    }

    // For a 4x4 puzzle:
    // If the empty tile is on an even row counting from the bottom (row 2 or 4),
    // the puzzle is solvable if the number of inversions is odd.
    // If the empty tile is on an odd row counting from the bottom (row 1 or 3),
    // the puzzle is solvable if the number of inversions is even.
    const emptyRow = Math.floor(emptyPos / 4) + 1
    const rowFromBottom = 5 - emptyRow

    if (rowFromBottom % 2 === 0) {
      return inversions % 2 === 1
    } else {
      return inversions % 2 === 0
    }
  }, [])

  // Create a solvable puzzle
  const createSolvablePuzzle = useCallback(() => {
    // Create initial ordered tiles
    const initialTiles: Tile[] = []
    for (let i = 0; i < 15; i++) {
      initialTiles.push({ value: i + 1, position: i })
    }

    let shuffledTiles: Tile[] = []
    let isSolvableConfig = false
    let attempts = 0
    const maxAttempts = 100

    // Keep shuffling until we get a solvable configuration
    while (!isSolvableConfig && attempts < maxAttempts) {
      shuffledTiles = shuffleTiles([...initialTiles])
      isSolvableConfig = isSolvable(shuffledTiles, 15)
      attempts++
    }

    // If we couldn't generate a solvable puzzle after max attempts, use a simple one
    if (!isSolvableConfig) {
      // Create a simple solvable puzzle with just a few moves needed
      shuffledTiles = [...initialTiles]
      // Swap a few tiles to create a simple puzzle
      const temp = shuffledTiles[13].position
      shuffledTiles[13].position = shuffledTiles[14].position
      shuffledTiles[14].position = temp
    }

    return shuffledTiles
  }, [isSolvable])

  const shuffleTiles = (tiles: Tile[]): Tile[] => {
    // Perform random valid moves to shuffle
    let currentEmptyPos = 15
    const shuffledTiles = [...tiles]

    // Make 100 random valid moves
    for (let i = 0; i < 100; i++) {
      const validMoves = getValidMoves(currentEmptyPos)
      const randomMoveIndex = Math.floor(Math.random() * validMoves.length)
      const tileToMove = validMoves[randomMoveIndex]

      // Find the tile at this position
      const tileIndex = shuffledTiles.findIndex((t) => t.position === tileToMove)
      if (tileIndex !== -1) {
        // Swap positions
        shuffledTiles[tileIndex].position = currentEmptyPos
        currentEmptyPos = tileToMove
      }
    }

    return shuffledTiles
  }

  const getValidMoves = (emptyPos: number): number[] => {
    const validMoves: number[] = []

    // Check if empty space has a tile above it
    if (emptyPos >= 4) {
      validMoves.push(emptyPos - 4)
    }

    // Check if empty space has a tile below it
    if (emptyPos < 12) {
      validMoves.push(emptyPos + 4)
    }

    // Check if empty space has a tile to the left
    if (emptyPos % 4 !== 0) {
      validMoves.push(emptyPos - 1)
    }

    // Check if empty space has a tile to the right
    if (emptyPos % 4 !== 3) {
      validMoves.push(emptyPos + 1)
    }

    return validMoves
  }

  const startGame = useCallback(() => {
    // Create a solvable puzzle
    const shuffledTiles = createSolvablePuzzle()

    setTiles(shuffledTiles)
    setEmptyPosition(15)
    setMoves(0)
    setGameOver(false)
    setStartTime(Date.now())
    setElapsedTime(0)
    setTimerActive(true)
    setIsInitialized(true)

    // Increment play count
    incrementGamePlays("grid-puzzle")
  }, [createSolvablePuzzle, incrementGamePlays])

  useEffect(() => {
    if (!isInitialized) {
      startGame()
    }
  }, [isInitialized, startGame])

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined

    if (timerActive) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timerActive, startTime])

  const handleTileClick = (position: number) => {
    if (gameOver) return

    // Check if this is a valid move
    const validMoves = getValidMoves(emptyPosition)
    if (!validMoves.includes(position)) return

    // Find the tile at this position
    const tileIndex = tiles.findIndex((t) => t.position === position)
    if (tileIndex === -1) return

    // Move the tile to the empty position
    const newTiles = [...tiles]
    newTiles[tileIndex].position = emptyPosition

    setTiles(newTiles)
    setEmptyPosition(position)
    setMoves(moves + 1)

    // Check if puzzle is solved
    const isSolved = checkWin(newTiles)
    if (isSolved) {
      setGameOver(true)
      setTimerActive(false)

      // Update best score and time
      const currentBestMoves = gameStats.bestMoves || 999
      const currentBestTime = gameStats.bestTime || 9999

      if (moves + 1 < currentBestMoves) {
        updateGameProgress("grid-puzzle", { bestMoves: moves + 1 })
      }

      if (elapsedTime < currentBestTime) {
        updateGameProgress("grid-puzzle", { bestTime: elapsedTime })
      }

      checkAndUnlockBadges()

      // Trigger confetti
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  const checkWin = (currentTiles: Tile[]): boolean => {
    return currentTiles.every((tile) => tile.value === tile.position + 1)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full items-center justify-between">
        <div className="rounded-md bg-muted px-3 py-1 text-sm">Moves: {moves}</div>
        <div className="rounded-md bg-muted px-3 py-1 text-sm">Time: {formatTime(elapsedTime)}</div>
        <Button variant="outline" size="sm" onClick={startGame}>
          Reset
        </Button>
      </div>

      <div className="grid aspect-square w-full max-w-md grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, index) => {
          const tile = tiles.find((t) => t.position === index)

          return index === emptyPosition ? (
            <div key={`empty-${index}`} className="aspect-square rounded-lg bg-muted/30"></div>
          ) : (
            <motion.button
              key={`tile-${tile?.value || index}`}
              className="aspect-square rounded-lg bg-primary/10 font-bold text-primary shadow-sm transition-colors hover:bg-primary/20"
              onClick={() => handleTileClick(index)}
              layout
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tile?.value}
            </motion.button>
          )
        })}
      </div>

      {gameOver && (
        <Card className="w-full p-6 text-center">
          <h3 className="mb-2 text-xl font-semibold">Puzzle Solved!</h3>
          <p className="mb-4 text-muted-foreground">
            You completed the puzzle in {moves} moves and {formatTime(elapsedTime)}.
          </p>
          <Button onClick={startGame}>Play Again</Button>
        </Card>
      )}

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Games Played</div>
          <div className="text-2xl font-bold">{gameStats.plays || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Best Moves</div>
          <div className="text-2xl font-bold">{gameStats.bestMoves || "-"}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Best Time</div>
          <div className="text-2xl font-bold">{gameStats.bestTime ? formatTime(gameStats.bestTime) : "-"}</div>
        </Card>
      </div>
    </div>
  )
}
