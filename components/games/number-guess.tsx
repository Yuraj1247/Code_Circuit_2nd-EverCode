"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGameData } from "@/components/game-data-provider"

export function NumberGuess() {
  const [target, setTarget] = useState(0)
  const [guess, setGuess] = useState("")
  const [message, setMessage] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts] = useState(10)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["number-guess"]

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1
    setTarget(newTarget)
    setGuess("")
    setMessage("I'm thinking of a number between 1 and 100.")
    setAttempts(0)
    setGameOver(false)
    setGameWon(false)

    // Increment play count
    incrementGamePlays("number-guess")
  }

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, "")
    setGuess(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!guess || gameOver) return

    const userGuess = Number.parseInt(guess)
    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (userGuess === target) {
      setMessage("Correct! You got it!")
      setGameWon(true)
      setGameOver(true)

      // Update best score if this is better or first time
      const currentBest = gameStats.bestScore || 999
      if (newAttempts < currentBest) {
        updateGameProgress("number-guess", {
          bestScore: newAttempts,
          score: newAttempts,
        })
      } else {
        updateGameProgress("number-guess", { score: newAttempts })
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
    } else {
      const hint = userGuess > target ? "Too High" : "Too Low"
      setMessage(hint)

      if (newAttempts >= maxAttempts) {
        setMessage(`Game over! The number was ${target}.`)
        setGameOver(true)
        updateGameProgress("number-guess", { score: 0 })
      }
    }

    setGuess("")
  }

  const getEmoji = () => {
    if (gameWon) return "😄"
    if (gameOver) return "😢"
    if (attempts > maxAttempts * 0.7) return "😰"
    if (attempts > maxAttempts * 0.4) return "🤔"
    return "🙂"
  }

  const getMessageColor = () => {
    if (gameWon) return "text-green-500"
    if (gameOver) return "text-red-500"
    if (message.includes("Too High")) return "text-orange-500"
    if (message.includes("Too Low")) return "text-blue-500"
    return "text-muted-foreground"
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full p-6 text-center">
        <motion.div
          className="mb-4 text-7xl"
          animate={gameWon ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {getEmoji()}
        </motion.div>
        <div className={`mb-6 text-xl font-medium ${getMessageColor()}`}>{message}</div>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm gap-2">
          <Input
            type="text"
            value={guess}
            onChange={handleGuessChange}
            placeholder="Enter your guess (1-100)"
            disabled={gameOver}
            className="text-center text-lg"
            maxLength={3}
          />
          <Button type="submit" disabled={!guess || gameOver}>
            Guess
          </Button>
        </form>

        <div className="mt-6 flex justify-center gap-2">
          <div className="rounded-full bg-muted px-4 py-2 text-sm">
            Attempts: {attempts}/{maxAttempts}
          </div>
          {gameOver && (
            <Button onClick={startNewGame} variant="outline" size="sm">
              New Game
            </Button>
          )}
        </div>
      </Card>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Games Played</div>
          <div className="text-2xl font-bold">{gameStats.plays || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Best Score (Fewest Guesses)</div>
          <div className="text-2xl font-bold">{gameStats.bestScore ? gameStats.bestScore : "-"}</div>
        </Card>
      </div>
    </div>
  )
}
