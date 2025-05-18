"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Clock, Coins, GamepadIcon as GameController, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameData } from "@/components/game-data-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

export default function DailyChallengesPage() {
  const { gameData, refreshDailyChallenges } = useGameData()
  const [mounted, setMounted] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState("")

  useEffect(() => {
    setMounted(true)

    // Update time until reset every second
    const interval = setInterval(() => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilReset(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Daily Challenges</h1>
        <p className="mt-2 text-muted-foreground">Loading challenges...</p>
      </div>
    )
  }

  // Group challenges by game
  const challengesByGame: Record<string, typeof gameData.challenges> = {}

  gameData.challenges.forEach((challenge) => {
    if (!challengesByGame[challenge.game]) {
      challengesByGame[challenge.game] = []
    }
    challengesByGame[challenge.game].push(challenge)
  })

  // Calculate challenge stats
  const totalChallenges = gameData.challenges.length
  const completedChallenges = gameData.challenges.filter((c) => c.completed).length
  const challengeProgress = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0
  const totalCoinsAvailable = gameData.challenges.reduce((sum, c) => sum + (c.completed ? 0 : c.rewardCoins), 0)
  const totalCoinsEarned = gameData.challenges.reduce((sum, c) => sum + (c.completed ? c.rewardCoins : 0), 0)

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6 space-y-2 md:mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Daily Challenges</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Complete challenges to earn coins and unlock special rewards.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Challenges Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold md:text-2xl">
              {completedChallenges}/{totalChallenges}
            </div>
            <Progress value={challengeProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Coins Earned Today</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold md:text-2xl">{totalCoinsEarned}</div>
            <div className="text-xs text-muted-foreground">{totalCoinsAvailable} coins still available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold md:text-2xl">{gameData.sessionStats.totalCoins}</div>
            <div className="text-xs text-muted-foreground">Lifetime earnings</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">Challenges Reset In</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold md:text-2xl">{timeUntilReset}</div>
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={refreshDailyChallenges}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <ScrollArea className="w-full pb-4">
          <TabsList className="mb-4 flex w-max flex-nowrap md:mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {Object.keys(challengesByGame).map((game) => (
              <TabsTrigger key={game} value={game}>
                {game === "all" ? "Special" : formatGameName(game)}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="all">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gameData.challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gameData.challenges
              .filter((challenge) => !challenge.completed)
              .map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gameData.challenges
              .filter((challenge) => challenge.completed)
              .map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
          </div>
        </TabsContent>

        {Object.entries(challengesByGame).map(([game, challenges]) => (
          <TabsContent key={game} value={game}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: any }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={challenge.completed ? "border-green-500/50 bg-green-500/5" : ""}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base md:text-lg">{challenge.title}</CardTitle>
            {challenge.completed && (
              <div className="rounded-full bg-green-500/20 p-1 text-green-500">
                <Check className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            )}
          </div>
          <CardDescription>
            {challenge.game === "all" ? "Special Challenge" : formatGameName(challenge.game)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs md:text-sm">{challenge.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs md:mt-4 md:text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              <span>Expires in {timeUntilExpiry(challenge.expiresAt)}</span>
            </div>
            <div className="flex items-center font-medium text-amber-500">
              <Coins className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              <span>{challenge.rewardCoins} coins</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {challenge.completed ? (
            <div className="w-full rounded-md bg-green-500/20 py-1.5 text-center text-xs font-medium text-green-500 md:py-2 md:text-sm">
              Completed
            </div>
          ) : (
            <Button asChild variant="outline" className="w-full text-xs md:text-sm" size="sm">
              <Link href={`/games/${challenge.game === "all" ? "" : challenge.game}`}>
                <GameController className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                {challenge.game === "all" ? "Play Games" : `Play ${formatGameName(challenge.game)}`}
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function formatGameName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function timeUntilExpiry(expiryDateString: string): string {
  const expiryDate = new Date(expiryDateString)
  const now = new Date()

  const diff = expiryDate.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}
