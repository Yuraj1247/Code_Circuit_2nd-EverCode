"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameData } from "@/components/game-data-provider"

type Upgrade = {
  id: string
  name: string
  description: string
  cost: number
  cps: number
  multiplier: number
  owned: number
}

type FloatingCoin = {
  id: number
  x: number
  y: number
}

export function IdleClicker() {
  const [coins, setCoins] = useState(0)
  const [cps, setCps] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [upgrades, setUpgrades] = useState<Upgrade[]>([])
  const [clickValue, setClickValue] = useState(1)
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([])
  const [nextCoinId, setNextCoinId] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["idle-clicker"] || { plays: 0 }
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Initialize game
  const initializeGame = useCallback(() => {
    const initialUpgrades: Upgrade[] = [
      {
        id: "clicker",
        name: "Better Clicker",
        description: "Double the value of each click",
        cost: 10,
        cps: 0,
        multiplier: 2,
        owned: 0,
      },
      {
        id: "auto1",
        name: "Auto Clicker",
        description: "Automatically generates 1 coin per second",
        cost: 15,
        cps: 1,
        multiplier: 1,
        owned: 0,
      },
      {
        id: "auto5",
        name: "Coin Generator",
        description: "Automatically generates 5 coins per second",
        cost: 100,
        cps: 5,
        multiplier: 1,
        owned: 0,
      },
      {
        id: "auto25",
        name: "Coin Factory",
        description: "Automatically generates 25 coins per second",
        cost: 500,
        cps: 25,
        multiplier: 1,
        owned: 0,
      },
    ]

    setUpgrades(initialUpgrades)

    // Load saved data
    if (gameStats) {
      setCoins(gameStats.coins || 0)
      setCps(gameStats.cps || 0)
      setClicks(gameStats.clicks || 0)
      setClickValue(gameStats.clickValue || 1)

      if (gameStats.upgrades) {
        try {
          const savedUpgrades = JSON.parse(gameStats.upgrades as string)
          setUpgrades(savedUpgrades)
        } catch (error) {
          console.error("Error parsing saved upgrades:", error)
        }
      }
    }

    // Increment play count if first time
    if (!gameStats.plays) {
      incrementGamePlays("idle-clicker")
    }

    setIsInitialized(true)
  }, [gameStats, incrementGamePlays])

  // Initialize on first render
  useEffect(() => {
    if (!isInitialized) {
      initializeGame()
    }
  }, [isInitialized, initializeGame])

  // Handle auto-clicker interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only start interval if CPS > 0
    if (cps > 0) {
      intervalRef.current = setInterval(() => {
        setCoins((prev) => prev + cps)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [cps])

  // Save game data when it changes
  useEffect(() => {
    if (isInitialized) {
      updateGameProgress("idle-clicker", {
        coins,
        cps,
        clicks,
        clickValue,
        upgrades: JSON.stringify(upgrades),
      })

      checkAndUnlockBadges()
    }
  }, [coins, cps, clicks, clickValue, upgrades, updateGameProgress, checkAndUnlockBadges, isInitialized])

  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleClick = () => {
    setCoins((prev) => prev + clickValue)
    setClicks((prev) => prev + 1)

    // Add floating coin animation
    const newCoin = {
      id: nextCoinId,
      x: Math.random() * 80 - 40, // Random position around the click area
      y: -50 - Math.random() * 50, // Random height above
    }

    setFloatingCoins((prev) => [...prev, newCoin])
    setNextCoinId((prev) => prev + 1)

    // Remove coin after animation
    setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((coin) => coin.id !== newCoin.id))
    }, 1000)
  }

  const buyUpgrade = (upgradeId: string) => {
    const upgradeIndex = upgrades.findIndex((u) => u.id === upgradeId)
    if (upgradeIndex === -1) return

    const upgrade = upgrades[upgradeIndex]

    // Check if player has enough coins
    if (coins < upgrade.cost) return

    // Apply the upgrade
    setCoins((prev) => prev - upgrade.cost)

    const newUpgrades = [...upgrades]
    newUpgrades[upgradeIndex] = {
      ...upgrade,
      owned: upgrade.owned + 1,
      cost: Math.floor(upgrade.cost * 1.5), // Increase cost for next purchase
    }

    setUpgrades(newUpgrades)

    // Apply effects
    if (upgrade.id === "clicker") {
      setClickValue((prev) => prev * upgrade.multiplier)
    } else {
      setCps((prev) => prev + upgrade.cps)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="relative w-full overflow-hidden p-6 text-center">
        <h3 className="mb-2 text-xl font-semibold">Idle Clicker</h3>

        <div className="mb-6">
          <div className="text-4xl font-bold">{coins.toLocaleString()} Coins</div>
          <div className="text-sm text-muted-foreground">{cps} coins per second</div>
        </div>

        <div className="relative mb-8">
          <motion.button
            className="relative h-32 w-32 rounded-full bg-primary text-6xl text-primary-foreground shadow-lg"
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
          >
            💰
          </motion.button>

          {/* Floating coins - rendered outside the button to prevent re-renders */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingCoins.map((coin) => (
              <motion.div
                key={coin.id}
                className="absolute text-2xl"
                initial={{ opacity: 1, y: 0, x: coin.x }}
                animate={{ opacity: 0, y: coin.y, x: coin.x + (Math.random() * 40 - 20) }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                +{clickValue}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Click Value: {clickValue} | Total Clicks: {clicks.toLocaleString()}
        </div>
      </Card>

      <div className="w-full">
        <h3 className="mb-4 text-xl font-semibold">Upgrades</h3>
        <div className="grid gap-4">
          {upgrades.map((upgrade) => (
            <Card key={upgrade.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{upgrade.name}</div>
                  <div className="text-sm text-muted-foreground">{upgrade.description}</div>
                  <div className="mt-1 text-xs">Owned: {upgrade.owned}</div>
                </div>
                <Button
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={coins < upgrade.cost}
                  variant={coins >= upgrade.cost ? "default" : "outline"}
                >
                  {upgrade.cost} Coins
                </Button>
              </div>
              <Progress value={(coins / upgrade.cost) * 100} max={100} className="h-1 rounded-none" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
