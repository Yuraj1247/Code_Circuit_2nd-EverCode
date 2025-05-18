"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGameData } from "@/components/game-data-provider"

type GameState = "waiting" | "ready" | "clicked" | "tooEarly"

export function ReactionSpeed() {
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(3)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["reaction-speed"]

  useEffect(() => {
    // Load best time from game stats
    if (gameStats.bestTime) {
      setBestTime(gameStats.bestTime)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [gameStats.bestTime])

  const startGame = () => {
    setGameState("waiting")
    setReactionTime(null)
    setCountdown(3)

    // Increment play count
    incrementGamePlays("reaction-speed")

    // Countdown from 3
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          startWaiting()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startWaiting = () => {
    // Random delay between 1-5 seconds
    const delay = Math.floor(Math.random() * 4000) + 1000

    timerRef.current = setTimeout(() => {
      setGameState("ready")
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (gameState === "waiting") {
      // Clicked too early
      setGameState("tooEarly")
    } else if (gameState === "ready") {
      // Good click
      const endTime = Date.now()
      const time = startTime ? endTime - startTime : 0
      setReactionTime(time)
      setGameState("clicked")

      // Update best time if this is better
      if (bestTime === null || time < bestTime) {
        setBestTime(time)
        updateGameProgress("reaction-speed", { bestTime: time })
        checkAndUnlockBadges()
      }
    }
  }

  const getBackgroundColor = () => {
    switch (gameState) {
      case "waiting":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      case "clicked":
        return "bg-blue-500"
      case "tooEarly":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getMessage = () => {
    switch (gameState) {
      case "waiting":
        return countdown > 0 ? `Get ready... ${countdown}` : "Wait for green..."
      case "ready":
        return "CLICK NOW!"
      case "clicked":
        return `Your time: ${reactionTime}ms`
      case "tooEarly":
        return "Too early! Try again."
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        className={`flex h-64 w-full cursor-pointer items-center justify-center rounded-lg text-white shadow-lg ${getBackgroundColor()}`}
        onClick={handleClick}
        whileHover={gameState !== "clicked" && gameState !== "tooEarly" ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold">{getMessage()}</div>
          {gameState === "waiting" && countdown === 0 && (
            <div className="mt-2 text-sm">Click when the screen turns green</div>
          )}
        </div>
      </motion.div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Current Reaction Time</div>
          <div className="text-2xl font-bold">{reactionTime !== null ? `${reactionTime}ms` : "-"}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Best Reaction Time</div>
          <div className="text-2xl font-bold">{bestTime !== null ? `${bestTime}ms` : "-"}</div>
        </Card>
      </div>

      <Button onClick={startGame} disabled={gameState === "waiting" && countdown === 0} size="lg">
        {gameState === "waiting" && countdown === 0 ? "Game in progress..." : "Start New Test"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <p>Average human reaction time: 200-250ms</p>
        <p>Professional gamers: 150-180ms</p>
      </div>
    </div>
  )
}
