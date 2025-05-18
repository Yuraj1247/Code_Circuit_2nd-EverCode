"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameData } from "@/components/game-data-provider"

type Action = "attack" | "defend" | "heal"

export function CardBattle() {
  const [playerHP, setPlayerHP] = useState(100)
  const [enemyHP, setEnemyHP] = useState(100)
  const [playerDefense, setPlayerDefense] = useState(0)
  const [enemyDefense, setEnemyDefense] = useState(0)
  const [message, setMessage] = useState("Choose your action!")
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null)
  const [actionLog, setActionLog] = useState<string[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["card-battle"]

  useEffect(() => {
    startGame()
  }, [])

  useEffect(() => {
    // Enemy turn logic
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        enemyTurn()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, gameOver])

  const startGame = () => {
    setPlayerHP(100)
    setEnemyHP(100)
    setPlayerDefense(0)
    setEnemyDefense(0)
    setMessage("Choose your action!")
    setGameOver(false)
    setWinner(null)
    setActionLog([])
    setIsPlayerTurn(true)
    setIsAnimating(false)

    // Increment play count
    incrementGamePlays("card-battle")
  }

  const playerAction = (action: Action) => {
    if (!isPlayerTurn || gameOver || isAnimating) return

    setIsAnimating(true)

    let actionMessage = ""

    switch (action) {
      case "attack":
        const attackDamage = Math.floor(Math.random() * 15) + 10 // 10-25 damage
        const actualDamage = Math.max(1, attackDamage - enemyDefense)
        const newEnemyHP = Math.max(0, enemyHP - actualDamage)

        setEnemyHP(newEnemyHP)
        setEnemyDefense(Math.max(0, enemyDefense - Math.floor(actualDamage / 2)))

        actionMessage = `You attack for ${actualDamage} damage!`

        if (newEnemyHP <= 0) {
          endGame("player")
        }
        break

      case "defend":
        const defenseAmount = Math.floor(Math.random() * 10) + 5 // 5-15 defense
        setPlayerDefense(playerDefense + defenseAmount)

        actionMessage = `You gain ${defenseAmount} defense!`
        break

      case "heal":
        const healAmount = Math.floor(Math.random() * 15) + 5 // 5-20 heal
        const newPlayerHP = Math.min(100, playerHP + healAmount)
        setPlayerHP(newPlayerHP)

        actionMessage = `You heal for ${healAmount} HP!`
        break
    }

    setMessage(actionMessage)
    setActionLog((prev) => [actionMessage, ...prev.slice(0, 4)])

    setTimeout(() => {
      setIsPlayerTurn(false)
      setIsAnimating(false)
    }, 1000)
  }

  const enemyTurn = () => {
    if (gameOver) return

    setIsAnimating(true)

    // Enemy AI - choose action based on situation
    let action: Action
    let actionMessage = ""

    if (enemyHP < 30 && Math.random() < 0.7) {
      // Low health - likely to heal
      action = "heal"
    } else if (playerDefense > 15 && Math.random() < 0.6) {
      // Player has high defense - likely to attack
      action = "attack"
    } else if (enemyDefense < 10 && Math.random() < 0.4) {
      // Low defense - might defend
      action = "defend"
    } else {
      // Default - random action with bias toward attack
      const rand = Math.random()
      if (rand < 0.6) {
        action = "attack"
      } else if (rand < 0.8) {
        action = "defend"
      } else {
        action = "heal"
      }
    }

    switch (action) {
      case "attack":
        const attackDamage = Math.floor(Math.random() * 15) + 8 // 8-23 damage
        const actualDamage = Math.max(1, attackDamage - playerDefense)
        const newPlayerHP = Math.max(0, playerHP - actualDamage)

        setPlayerHP(newPlayerHP)
        setPlayerDefense(Math.max(0, playerDefense - Math.floor(actualDamage / 2)))

        actionMessage = `Enemy attacks for ${actualDamage} damage!`

        if (newPlayerHP <= 0) {
          endGame("enemy")
        }
        break

      case "defend":
        const defenseAmount = Math.floor(Math.random() * 10) + 5 // 5-15 defense
        setEnemyDefense(enemyDefense + defenseAmount)

        actionMessage = `Enemy gains ${defenseAmount} defense!`
        break

      case "heal":
        const healAmount = Math.floor(Math.random() * 15) + 5 // 5-20 heal
        const newEnemyHP = Math.min(100, enemyHP + healAmount)
        setEnemyHP(newEnemyHP)

        actionMessage = `Enemy heals for ${healAmount} HP!`
        break
    }

    setMessage(actionMessage)
    setActionLog((prev) => [actionMessage, ...prev.slice(0, 4)])

    setTimeout(() => {
      setIsPlayerTurn(true)
      setIsAnimating(false)
    }, 1000)
  }

  const endGame = (winner: "player" | "enemy") => {
    setGameOver(true)
    setWinner(winner)

    if (winner === "player") {
      setMessage("You win! The enemy has been defeated.")
      updateGameProgress("card-battle", {
        wins: (gameStats.wins || 0) + 1,
      })
    } else {
      setMessage("You lose! Better luck next time.")
      updateGameProgress("card-battle", {
        losses: (gameStats.losses || 0) + 1,
      })
    }

    checkAndUnlockBadges()
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="bg-primary/10 p-4">
            <h3 className="text-center text-xl font-semibold">You</h3>
          </div>
          <div className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">HP: {playerHP}/100</span>
              <span className="text-sm font-medium">DEF: {playerDefense}</span>
            </div>
            <Progress value={playerHP} max={100} className="h-4" />

            <div className="mt-6 grid grid-cols-3 gap-2">
              <Button
                onClick={() => playerAction("attack")}
                disabled={!isPlayerTurn || gameOver || isAnimating}
                className="bg-red-500 hover:bg-red-600"
              >
                Attack
              </Button>
              <Button
                onClick={() => playerAction("defend")}
                disabled={!isPlayerTurn || gameOver || isAnimating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Defend
              </Button>
              <Button
                onClick={() => playerAction("heal")}
                disabled={!isPlayerTurn || gameOver || isAnimating}
                className="bg-green-500 hover:bg-green-600"
              >
                Heal
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-destructive/10 p-4">
            <h3 className="text-center text-xl font-semibold">Enemy</h3>
          </div>
          <div className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">HP: {enemyHP}/100</span>
              <span className="text-sm font-medium">DEF: {enemyDefense}</span>
            </div>
            <Progress value={enemyHP} max={100} className="h-4" />

            <div className="mt-6">
              <div className={`rounded-lg border p-4 text-center ${isPlayerTurn ? "bg-muted/30" : "bg-muted"}`}>
                {isPlayerTurn ? "Waiting for your move..." : "Enemy is thinking..."}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="w-full p-6">
        <div className="mb-4 text-center font-medium">{message}</div>

        <div className="mb-4 max-h-32 overflow-y-auto rounded-lg bg-muted/30 p-2">
          {actionLog.length > 0 ? (
            <ul className="space-y-1">
              {actionLog.map((log, index) => (
                <li key={index} className="text-sm">
                  {log}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-sm text-muted-foreground">Battle log will appear here</div>
          )}
        </div>

        {gameOver && (
          <div className="text-center">
            <Button onClick={startGame}>Play Again</Button>
          </div>
        )}
      </Card>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Games Played</div>
          <div className="text-2xl font-bold">{gameStats.plays || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Wins</div>
          <div className="text-2xl font-bold">{gameStats.wins || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Losses</div>
          <div className="text-2xl font-bold">{gameStats.losses || 0}</div>
        </Card>
      </div>
    </div>
  )
}
