import { createFileRoute, Link } from '@tanstack/react-router'
import { games } from '@/games'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          KGA Celebration of Science & Engineering Night
        </h1>
        <p className="mt-2 text-muted-foreground">
          Vibe-coded arcade games by our students
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link key={game.slug} to={`/games/${game.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="text-center">
                <span className="text-5xl" role="img" aria-hidden>
                  {game.emoji}
                </span>
                <CardTitle className="mt-2">{game.name}&apos;s Game</CardTitle>
                <CardDescription>
                  {game.grade} Grade · {game.teacher}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <span className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Play now →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
