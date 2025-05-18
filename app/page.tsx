"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Award, BarChart2, Gamepad2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80 px-4 py-24 text-center md:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f2a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f620,transparent)]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block text-primary">GameVerse</span>
            <span className="mt-2 block text-3xl font-bold sm:text-4xl">The Ultimate Free Gaming Hub</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Play 10 addictive mini-games, unlock badges, and track your progress - all in one place. No sign-up
            required!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button asChild size="lg" className="gap-2">
            <Link href="/games">
              <Gamepad2 className="h-5 w-5" />
              Play Games
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/dashboard">
              <BarChart2 className="h-5 w-5" />
              View Dashboard
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/badges">
              <Award className="h-5 w-5" />
              Explore Badges
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Game Preview Section */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Games</h2>
          <p className="mt-4 text-muted-foreground">Challenge yourself with these addictive mini-games</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredGames.map((game) => (
            <motion.div
              key={game.slug}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-video w-full overflow-hidden bg-muted/50">
                <div className="flex h-full items-center justify-center text-4xl">{game.emoji}</div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold">{game.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{game.description}</p>
                <div className="mt-4 flex justify-between">
                  <Link
                    href={`/games/${game.slug}`}
                    className="inline-flex items-center text-sm font-medium text-primary"
                  >
                    Play Now <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/games">View All Games</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why GameVerse?</h2>
          <p className="mt-4 text-muted-foreground">More than just games - it's a complete gaming experience</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

const featuredGames = [
  {
    title: "Rock Paper Scissors",
    slug: "rock-paper-scissors",
    emoji: "✂️",
    description: "Challenge the computer in this classic game of chance and strategy.",
  },
  {
    title: "Memory Match",
    slug: "memory-match",
    emoji: "🎴",
    description: "Test your memory by matching pairs of cards in this classic concentration game.",
  },
  {
    title: "Trivia Quiz",
    slug: "trivia-quiz",
    emoji: "🧠",
    description: "Race against the clock to answer trivia questions across various categories.",
  },
]

const features = [
  {
    title: "100+ Badges to Unlock",
    description: "Earn badges as you play and master different games. Show off your achievements!",
    icon: <Award className="h-6 w-6" />,
  },
  {
    title: "Progress Dashboard",
    description: "Track your gaming stats with beautiful charts and visualizations.",
    icon: <BarChart2 className="h-6 w-6" />,
  },
  {
    title: "No Sign-up Required",
    description: "All your progress is saved locally. Just play and enjoy!",
    icon: <Gamepad2 className="h-6 w-6" />,
  },
]
