"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGameData } from "@/components/game-data-provider"

export function DiceRoller() {
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [rollHistory, setRollHistory] = useState<number[]>([])
  const { gameData, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["dice-roller"]

  const rollDice = () => {
    if (isRolling) return

    setIsRolling(true)

    // Increment play count
    incrementGamePlays("dice-roller")

    // Animate dice roll
    let rollCount = 0
    const maxRolls = 10
    const rollInterval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 6) + 1
      setDiceValue(newValue)

      rollCount++
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval)
        setIsRolling(false)

        // Add to history
        setRollHistory((prev) => {
          const newHistory = [newValue, ...prev]
          return newHistory.slice(0, 10) // Keep only last 10 rolls
        })
      }
    }, 100)
  }

  const getDiceFace = (value: number) => {
    switch (value) {
      case 1:
        return (
          <div className="grid h-full w-full place-items-center">
            <div className="h-4 w-4 rounded-full bg-current"></div>
          </div>
        )
      case 2:
        return (
          <div className="grid h-full w-full grid-cols-2">
            <div className="flex items-start justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-end justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="grid h-full w-full grid-cols-3 grid-rows-3">
            <div className="col-start-1 row-start-1 flex items-start justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="col-start-3 row-start-3 flex items-end justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            <div className="flex items-start justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-start justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-end justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-end justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="grid h-full w-full grid-cols-3 grid-rows-3">
            <div className="col-start-1 row-start-1 flex items-start justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="col-start-3 row-start-1 flex items-start justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="col-start-1 row-start-3 flex items-end justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="col-start-3 row-start-3 flex items-end justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="grid h-full w-full grid-cols-2 grid-rows-3">
            <div className="flex items-start justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-start justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-center justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-center justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-end justify-start p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
            <div className="flex items-end justify-end p-4">
              <div className="h-4 w-4 rounded-full bg-current"></div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full p-6 text-center">
        <div className="mb-6 flex justify-center">
          <motion.div
            className="relative h-40 w-40 rounded-xl border-2 border-primary/20 bg-card text-primary shadow-lg"
            animate={
              isRolling
                ? {
                    rotate: [0, 15, -15, 10, -10, 5, -5, 0],
                    scale: [1, 1.05, 0.95, 1.02, 0.98, 1],
                  }
                : {}
            }
            transition={{ duration: 1 }}
          >
            {getDiceFace(diceValue)}
          </motion.div>
        </div>

        <div className="mb-6 text-4xl font-bold">{diceValue}</div>

        <Button onClick={rollDice} disabled={isRolling} size="lg" className="mx-auto">
          Roll Dice 🎲
        </Button>
      </Card>

      <Card className="w-full p-6">
        <h3 className="mb-4 text-center text-xl font-semibold">Roll History</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {rollHistory.length > 0 ? (
            rollHistory.map((roll, index) => (
              <div
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-medium"
              >
                {roll}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No rolls yet</div>
          )}
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">Total Rolls: {gameStats.plays || 0}</div>
      </Card>
    </div>
  )
}
