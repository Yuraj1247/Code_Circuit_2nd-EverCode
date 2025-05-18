import Link from "next/link"
import { Gamepad2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Gamepad2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Game Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          Oops! The game you're looking for doesn't exist or has been moved to another universe.
        </p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
