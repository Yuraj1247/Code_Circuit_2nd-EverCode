import { notFound } from "next/navigation"

import { RockPaperScissors } from "@/components/games/rock-paper-scissors"
import { NumberGuess } from "@/components/games/number-guess"
import { DiceRoller } from "@/components/games/dice-roller"
import { MemoryMatch } from "@/components/games/memory-match"
import { TriviaQuiz } from "@/components/games/trivia-quiz"
import { WordUnscramble } from "@/components/games/word-unscramble"
import { GridPuzzle } from "@/components/games/grid-puzzle"
import { IdleClicker } from "@/components/games/idle-clicker"
import { CardBattle } from "@/components/games/card-battle"
import { ReactionSpeed } from "@/components/games/reaction-speed"

export async function generateStaticParams() {
  return [
    { slug: "rock-paper-scissors" },
    { slug: "number-guess" },
    { slug: "dice-roller" },
    { slug: "memory-match" },
    { slug: "trivia-quiz" },
    { slug: "word-unscramble" },
    { slug: "grid-puzzle" },
    { slug: "idle-clicker" },
    { slug: "card-battle" },
    { slug: "reaction-speed" },
  ]
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const { slug } = params

  const gameInfo = games.find((game) => game.slug === slug)

  if (!gameInfo) {
    return notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{gameInfo.title}</h1>
        <p className="text-muted-foreground">{gameInfo.description}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {slug === "rock-paper-scissors" && <RockPaperScissors />}
        {slug === "number-guess" && <NumberGuess />}
        {slug === "dice-roller" && <DiceRoller />}
        {slug === "memory-match" && <MemoryMatch />}
        {slug === "trivia-quiz" && <TriviaQuiz />}
        {slug === "word-unscramble" && <WordUnscramble />}
        {slug === "grid-puzzle" && <GridPuzzle />}
        {slug === "idle-clicker" && <IdleClicker />}
        {slug === "card-battle" && <CardBattle />}
        {slug === "reaction-speed" && <ReactionSpeed />}
      </div>
    </div>
  )
}

const games = [
  {
    title: "Rock Paper Scissors",
    slug: "rock-paper-scissors",
    description: "Challenge the computer in this classic game of chance and strategy.",
  },
  {
    title: "Number Guess",
    slug: "number-guess",
    description: "Guess the number between 1 and 100 with helpful hints.",
  },
  {
    title: "Dice Roller",
    slug: "dice-roller",
    description: "Roll the dice and test your luck.",
  },
  {
    title: "Memory Match",
    slug: "memory-match",
    description: "Test your memory by matching pairs of cards.",
  },
  {
    title: "Trivia Quiz",
    slug: "trivia-quiz",
    description: "Answer trivia questions before the timer runs out.",
  },
  {
    title: "Word Unscramble",
    slug: "word-unscramble",
    description: "Unscramble jumbled words to test your vocabulary.",
  },
  {
    title: "Grid Puzzle",
    slug: "grid-puzzle",
    description: "Slide tiles to solve the puzzle in as few moves as possible.",
  },
  {
    title: "Idle Clicker",
    slug: "idle-clicker",
    description: "Click to earn coins and buy upgrades.",
  },
  {
    title: "Card Battle",
    slug: "card-battle",
    description: "Battle against the computer in this turn-based card game.",
  },
  {
    title: "Reaction Speed",
    slug: "reaction-speed",
    description: "Test your reaction time by clicking as soon as you see the green light.",
  },
]
