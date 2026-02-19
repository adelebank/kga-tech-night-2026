# Add a New Arcade Game

Add a new student game to the KGA arcade. I need:

- **Student first name**
- **Grade** (Kindergarten, 1st, 2nd, 3rd, 4th, 5th, or 6th)
- **Teacher's name**
- **Emoji** for the game card (e.g., 🐵 🎮 🌟)

## Steps to Perform

1. **Add to registry**: Add a new entry to [src/games.ts](src/games.ts) with the provided info. Use a URL-safe slug (lowercase, no spaces) derived from the student's name.

2. **Create route file**: Create [src/routes/games/<slug>.tsx](src/routes/games/) with:
   - `createFileRoute('/games/<slug>')` 
   - Look up the game from the registry by slug
   - Display header with emoji, student name, grade, teacher
   - Include a placeholder game area for the student to build their game

3. **Keep it self-contained**: The game page should be standalone. Use localStorage for any state that needs to persist. Use existing shadcn/ui components for UI.

## Template for New Game Page

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { games } from '@/games'

export const Route = createFileRoute('/games/<slug>')({
  component: GameComponent,
})

const game = games.find((g) => g.slug === '<slug>')!

function GameComponent() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8 text-center">
        <span className="text-6xl" role="img" aria-hidden>{game.emoji}</span>
        <h1 className="mt-4 text-2xl font-bold">{game.name}'s Game</h1>
        <p className="mt-1 text-muted-foreground">
          {game.grade} Grade · {game.teacher}
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">Game area — build your game here!</p>
      </div>
    </div>
  )
}
```

Replace `<slug>` with the actual slug in both the route path and the `games.find()` call.
