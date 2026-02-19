import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/games')({
  component: GamesLayout,
})

function GamesLayout() {
  return (
    <div className="min-h-screen p-8">
      <nav className="mb-8">
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground"
        >
          ← Back to Home
        </Link>
      </nav>
      <Outlet />
    </div>
  )
}
