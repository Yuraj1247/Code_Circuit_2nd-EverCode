"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGameData } from "@/components/game-data-provider"

type MemoryCard = {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export function MemoryMatch() {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
  const [isLocked, setIsLocked] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["memory-match"]

  useEffect(() => {
    startGame()
  }, [level])

  const getGridSize = () => {
    switch (level) {
      case 1:
        return { rows: 2, cols: 2 } // 4 cards (2 pairs)
      case 2:
        return { rows: 2, cols: 3 } // 6 cards (3 pairs)
      case 3:
        return { rows: 3, cols: 4 } // 12 cards (6 pairs)
      case 4:
        return { rows: 4, cols: 4 } // 16 cards (8 pairs)
      default:
        return { rows: 2, cols: 2 }
    }
  }

  const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔"]

  const startGame = () => {
    const { rows, cols } = getGridSize()
    const totalCards = rows * cols
    const pairsNeeded = totalCards / 2

    // Get emojis for this level
    const levelEmojis = emojis.slice(0, pairsNeeded)

    // Create pairs
    let cardData: MemoryCard[] = []
    levelEmojis.forEach((emoji, index) => {
      // Add two of each emoji
      cardData.push({ id: index * 2, emoji, isFlipped: false, isMatched: false })
      cardData.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false })
    })

    // Shuffle cards
    cardData = cardData.sort(() => Math.random() - 0.5)

    setCards(cardData)
    setFlippedCards([])
    setMoves(0)
    setGameOver(false)

    // Increment play count
    incrementGamePlays("memory-match")

    // Update level in game progress
    updateGameProgress("memory-match", { level })
  }

  const handleCardClick = (id: number) => {
    // Prevent clicking if game is locked or card is already flipped/matched
    if (
      isLocked ||
      flippedCards.length >= 2 ||
      flippedCards.includes(id) ||
      cards.find((card) => card.id === id)?.isMatched
    ) {
      return
    }

    // Flip the card
    setCards(cards.map((card) => (card.id === id ? { ...card, isFlipped: true } : card)))

    // Add to flipped cards
    setFlippedCards([...flippedCards, id])

    // If this is the second card, check for a match
    if (flippedCards.length === 1) {
      setIsLocked(true)
      setMoves(moves + 1)

      const firstCardId = flippedCards[0]
      const firstCard = cards.find((card) => card.id === firstCardId)
      const secondCard = cards.find((card) => card.id === id)

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setTimeout(() => {
          setCards(
            cards.map((card) =>
              card.id === firstCardId || card.id === id ? { ...card, isMatched: true, isFlipped: true } : card,
            ),
          )
          setFlippedCards([])
          setIsLocked(false)

          // Check if all cards are matched
          const allMatched = cards.every((card) => card.id === firstCardId || card.id === id || card.isMatched)

          if (allMatched) {
            setGameOver(true)

            // Update best score
            const currentBest = gameStats.bestScore || 999
            if (moves + 1 < currentBest) {
              updateGameProgress("memory-match", { bestScore: moves + 1 })
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
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(
            cards.map((card) => (card.id === firstCardId || card.id === id ? { ...card, isFlipped: false } : card)),
          )
          setFlippedCards([])
          setIsLocked(false)
        }, 1000)
      }
    }
  }

  const nextLevel = () => {
    if (level < 4) {
      setLevel(level + 1)
    }
  }

  const prevLevel = () => {
    if (level > 1) {
      setLevel(level - 1)
    }
  }

  const { rows, cols } = getGridSize()

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevLevel} disabled={level === 1}>
            ←
          </Button>
          <div className="rounded-md bg-muted px-3 py-1 text-sm">Level {level}</div>
          <Button variant="outline" size="sm" onClick={nextLevel} disabled={level === 4}>
            →
          </Button>
        </div>
        <div className="rounded-md bg-muted px-3 py-1 text-sm">Moves: {moves}</div>
        <Button variant="outline" size="sm" onClick={startGame}>
          Reset
        </Button>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={`relative h-20 w-20 cursor-pointer rounded-lg sm:h-24 sm:w-24 ${
              card.isMatched ? "pointer-events-none" : ""
            }`}
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
          >
            <motion.div
              className="absolute h-full w-full rounded-lg bg-primary text-4xl"
              initial={false}
              animate={{
                rotateY: card.isFlipped ? 180 : 0,
                opacity: card.isMatched ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex h-full items-center justify-center">?</div>
            </motion.div>
            <motion.div
              className="absolute h-full w-full rounded-lg bg-card text-4xl shadow-md"
              initial={false}
              animate={{
                rotateY: card.isFlipped ? 0 : -180,
                opacity: card.isMatched ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex h-full items-center justify-center">{card.emoji}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {gameOver && (
        <Card className="w-full p-6 text-center">
          <h3 className="mb-2 text-xl font-semibold">Level Complete!</h3>
          <p className="mb-4 text-muted-foreground">
            You completed level {level} in {moves} moves.
          </p>
          <div className="flex justify-center gap-2">
            {level < 4 ? (
              <Button onClick={nextLevel}>Next Level</Button>
            ) : (
              <Button onClick={() => setLevel(1)}>Start Over</Button>
            )}
            <Button variant="outline" onClick={startGame}>
              Replay Level
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
