import { Award, Gamepad2, Github, LineChart, Zap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About GameVerse</h1>
        <p className="text-muted-foreground">Learn more about our platform, technology, and vision.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Why GameVerse?</CardTitle>
            <CardDescription>Our vision and mission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              GameVerse was created to provide a fun, accessible gaming experience without the need for accounts,
              downloads, or complicated setups. We believe gaming should be simple, enjoyable, and available to
              everyone.
            </p>
            <p>
              Our collection of mini-games is designed to provide quick entertainment while also tracking your progress
              and rewarding your achievements with badges and statistics.
            </p>
            <p>
              All your progress is saved locally in your browser, so you can pick up right where you left off without
              needing to create an account or remember a password.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
            <CardDescription>The technology behind GameVerse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {tech.icon}
                  </div>
                  <div>
                    <div className="font-medium">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Badge System</CardTitle>
          <CardDescription>Gamification to track your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">How It Works</h3>
              <p className="text-sm text-muted-foreground">
                As you play games and achieve milestones, you'll automatically unlock badges. Each game has multiple
                badges to earn, from novice to master level.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Special Badges</h3>
              <p className="text-sm text-muted-foreground">
                Beyond individual game achievements, you can earn special badges for platform-wide accomplishments, like
                playing all games or unlocking a certain number of badges.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Future Plans</h3>
              <p className="text-sm text-muted-foreground">
                We're constantly working on new games and badges. Our roadmap includes daily challenges, seasonal
                events, and more complex achievements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Future Roadmap</CardTitle>
          <CardDescription>What's coming to GameVerse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmap.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">GameVerse is an open-source project. Contributions are welcome!</p>
        <div className="mt-2 flex justify-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Github href="https://github.com/Yuraj1247" className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

const techStack = [
  {
    name: "Next.js",
    description: "React framework for the frontend",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    name: "LocalStorage",
    description: "For persistent game data",
    icon: <Gamepad2 className="h-5 w-5" />,
  },
  {
    name: "Framer Motion",
    description: "For smooth animations",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: "Recharts",
    description: "For dashboard visualizations",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    name: "Badges System",
    description: "For gamification",
    icon: <Award className="h-5 w-5" />,
  },
]

const roadmap = [
  {
    title: "More Games",
    description: "We're working on adding 5 more games to the collection, including puzzle and strategy games.",
  },
  {
    title: "Daily Challenges",
    description: "Complete special daily challenges for bonus badges and achievements.",
  },
  {
    title: "Multiplayer Support",
    description: "Challenge your friends with shareable game links and compete for high scores.",
  },
  {
    title: "Advanced Statistics",
    description: "More detailed analytics and insights about your gaming habits and improvements.",
  },
  {
    title: "Customization Options",
    description: "Personalize your gaming experience with themes and settings.",
  },
]
