"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGameData } from "@/components/game-data-provider"

type Choice = "rock" | "paper" | "scissors" | null
type Result = "Win" | "Lose" | "Draw" | null

export function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [streak, setStreak] = useState(0)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["rock-paper-scissors"]

  useEffect(() => {
    // Load streak from localStorage
    const savedStreak = localStorage.getItem("rps-streak")
    if (savedStreak) {
      setStreak(Number.parseInt(savedStreak))
    }
  }, [])

  useEffect(() => {
    // Save streak to localStorage
    if (streak > 0) {
      localStorage.setItem("rps-streak", streak.toString())
    }
  }, [streak])

  const options: Choice[] = ["rock", "paper", "scissors"]

  const getResult = (player: Choice, computer: Choice): Result => {
    if (!player || !computer) return null
    if (player === computer) return "Draw"
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "scissors" && computer === "paper") ||
      (player === "paper" && computer === "rock")
    )
      return "Win"
    return "Lose"
  }

  const handleChoice = (choice: Choice) => {
    if (isAnimating) return

    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)
    setIsAnimating(true)

    // Increment play count on first play of session
    if (gameStats.plays === 0) {
      incrementGamePlays("rock-paper-scissors")
    }

    // Animate hands shaking
    setTimeout(() => {
      const computerSelection = options[Math.floor(Math.random() * 3)]
      setComputerChoice(computerSelection)

      const gameResult = getResult(choice, computerSelection)
      setResult(gameResult)

      // Update stats
      if (gameResult === "Win") {
        updateGameProgress("rock-paper-scissors", {
          wins: (gameStats.wins || 0) + 1,
          plays: (gameStats.plays || 0) + 1,
        })
        setStreak((prev) => prev + 1)

        // Trigger confetti on win
        if (typeof window !== "undefined") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }
      } else if (gameResult === "Lose") {
        updateGameProgress("rock-paper-scissors", {
          losses: (gameStats.losses || 0) + 1,
          plays: (gameStats.plays || 0) + 1,
        })
        setStreak(0)
      } else {
        updateGameProgress("rock-paper-scissors", {
          draws: (gameStats.draws || 0) + 1,
          plays: (gameStats.plays || 0) + 1,
        })
      }

      checkAndUnlockBadges()
      setIsAnimating(false)
    }, 1000)
  }

  const getEmoji = (choice: Choice) => {
    switch (choice) {
      case "rock":
        return "🪨"
      case "paper":
        return "📄"
      case "scissors":
        return "✂️"
      default:
        return "❓"
    }
  }

  const getResultColor = (result: Result) => {
    switch (result) {
      case "Win":
        return "text-green-500"
      case "Lose":
        return "text-red-500"
      case "Draw":
        return "text-yellow-500"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="flex flex-col items-center p-6">
          <h3 className="mb-4 text-xl font-semibold">Your Choice</h3>
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-muted text-7xl">
            {isAnimating ? (
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 1, repeat: 0 }}>
                ✊
              </motion.div>
            ) : playerChoice ? (
              getEmoji(playerChoice)
            ) : (
              "❓"
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleChoice("rock")}
              disabled={isAnimating}
              className="text-2xl"
            >
              🪨
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleChoice("paper")}
              disabled={isAnimating}
              className="text-2xl"
            >
              📄
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleChoice("scissors")}
              disabled={isAnimating}
              className="text-2xl"
            >
              ✂️
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col items-center p-6">
          <h3 className="mb-4 text-xl font-semibold">Computer's Choice</h3>
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-muted text-7xl">
            {isAnimating ? (
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 1, repeat: 0 }}>
                ✊
              </motion.div>
            ) : computerChoice ? (
              getEmoji(computerChoice)
            ) : (
              "❓"
            )}
          </div>
          <div className="text-center">
            {result && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-2xl font-bold ${getResultColor(result)}`}
              >
                {result}
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Wins</div>
          <div className="text-2xl font-bold">{gameStats.wins || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Losses</div>
          <div className="text-2xl font-bold">{gameStats.losses || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Draws</div>
          <div className="text-2xl font-bold">{gameStats.draws || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Win Streak</div>
          <div className="text-2xl font-bold">{streak}</div>
        </Card>
      </div>
    </div>
  )
}
