import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function GamesPage() {
  return (
    <div className="container py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Games</h1>
        <p className="text-muted-foreground">
          Choose from our collection of 10 mini-games. Your progress is saved automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.slug} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden bg-muted/50">
              <div className="flex h-full items-center justify-center text-6xl">{game.emoji}</div>
            </div>
            <CardHeader>
              <CardTitle>{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>{game.details}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full gap-2">
                <Link href={`/games/${game.slug}`}>
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

const games = [
  {
    title: "Rock Paper Scissors",
    slug: "rock-paper-scissors",
    emoji: "✂️",
    description: "The classic game of chance",
    details: "Challenge the computer in this timeless game. Can you predict your opponent's next move?",
  },
  {
    title: "Number Guess",
    slug: "number-guess",
    emoji: "🔢",
    description: "Guess the number between 1-100",
    details: "Use the hints to find the secret number in as few attempts as possible.",
  },
  {
    title: "Dice Roller",
    slug: "dice-roller",
    emoji: "🎲",
    description: "Roll the dice and test your luck",
    details: "A simple dice roller with animations. How many sixes can you roll in a row?",
  },
  {
    title: "Memory Match",
    slug: "memory-match",
    emoji: "🎴",
    description: "Find matching pairs of cards",
    details: "Test your memory by matching pairs of cards. Progress through increasingly difficult levels.",
  },
  {
    title: "Trivia Quiz",
    slug: "trivia-quiz",
    emoji: "🧠",
    description: "Test your knowledge",
    details: "Answer trivia questions across various categories before the timer runs out.",
  },
  {
    title: "Word Unscramble",
    slug: "word-unscramble",
    emoji: "📝",
    description: "Unscramble jumbled words",
    details: "Can you unscramble these jumbled words? Use hints if you get stuck.",
  },
  {
    title: "Grid Puzzle",
    slug: "grid-puzzle",
    emoji: "🧩",
    description: "Slide tiles to solve the puzzle",
    details: "Slide tiles into the correct order. The fewer moves, the better your score.",
  },
  {
    title: "Idle Clicker",
    slug: "idle-clicker",
    emoji: "💰",
    description: "Click to earn coins",
    details: "Click to earn coins and buy upgrades that earn coins automatically.",
  },
  {
    title: "Card Battle",
    slug: "card-battle",
    emoji: "⚔️",
    description: "Strategic card battle game",
    details: "Battle against the computer in this turn-based card game. Choose your actions wisely.",
  },
  {
    title: "Reaction Speed",
    slug: "reaction-speed",
    emoji: "⚡",
    description: "Test your reaction time",
    details: "Wait for the green light, then click as fast as you can. Compare with your previous best.",
  },
]
