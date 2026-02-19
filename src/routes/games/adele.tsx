import { createFileRoute } from '@tanstack/react-router'
import { games } from '@/games'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/games/adele')({
  component: AdeleGame,
})

const game = games.find((g) => g.slug === 'adele')!

// Little Alchemy element chain: merge two same → next element
const ELEMENTS = [
  { emoji: '💧', name: 'Water' },
  { emoji: '🌊', name: 'Wave' },
  { emoji: '🏖️', name: 'Beach' },
  { emoji: '🐟', name: 'Fish' },
  { emoji: '🦈', name: 'Shark' },
  { emoji: '🐋', name: 'Whale' },
  { emoji: '🏝️', name: 'Island' },
  { emoji: '🌴', name: 'Tree' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🧪', name: 'Potion' },
  { emoji: '✨', name: 'Magic' },
] as const

const GRID_SIZE = 4
const STORAGE_KEY = 'adele-2048-alchemy'

type Cell = { value: number; id: string } | null

function getElement(value: number) {
  const tier = Math.log2(value)
  return ELEMENTS[Math.min(tier - 1, ELEMENTS.length - 1)]
}

function createBoard(): Cell[][] {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null))
}

function addRandomTile(board: Cell[][]): Cell[][] {
  const empty: [number, number][] = []
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (!cell) empty.push([r, c])
    })
  )
  if (empty.length === 0) return board
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const value = Math.random() < 0.9 ? 2 : 4
  const newBoard = board.map((row) => [...row])
  newBoard[r][c] = { value, id: `${Date.now()}-${r}-${c}` }
  return newBoard
}

function slideRow(row: Cell[]): { row: Cell[]; merged: boolean } {
  const filtered = row.filter((c): c is Cell => c !== null)
  const merged: Cell[] = []
  let i = 0
  let didMerge = false

  while (i < filtered.length) {
    if (i < filtered.length - 1 && filtered[i]!.value === filtered[i + 1]!.value) {
      merged.push({
        value: filtered[i]!.value * 2,
        id: `${Date.now()}-${i}`,
      })
      i += 2
      didMerge = true
    } else {
      merged.push(filtered[i]!)
      i++
    }
  }

  const padded = [...merged, ...Array(GRID_SIZE - merged.length).fill(null)]
  return { row: padded, merged: didMerge }
}

function move(board: Cell[][], direction: 'up' | 'down' | 'left' | 'right'): Cell[][] | null {
  let newBoard: Cell[][] = []
  let changed = false

  if (direction === 'left') {
    newBoard = board.map((row) => {
      const { row: newRow, merged } = slideRow(row)
      if (merged) changed = true
      if (JSON.stringify(row) !== JSON.stringify(newRow)) changed = true
      return newRow
    })
  } else if (direction === 'right') {
    newBoard = board.map((row) => {
      const reversed = [...row].reverse()
      const { row: newRow, merged } = slideRow(reversed)
      if (merged) changed = true
      return newRow.reverse()
    })
    if (JSON.stringify(board) !== JSON.stringify(newBoard)) changed = true
  } else if (direction === 'up') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = board.map((row) => row[c])
      const { row: newCol, merged } = slideRow(col)
      if (merged) changed = true
      newCol.forEach((cell, r) => {
        if (!newBoard[r]) newBoard[r] = []
        newBoard[r][c] = cell
      })
    }
    if (JSON.stringify(board) !== JSON.stringify(newBoard)) changed = true
  } else {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = board.map((row) => row[c]).reverse()
      const { row: newCol, merged } = slideRow(col)
      if (merged) changed = true
      const result = newCol.reverse()
      result.forEach((cell, r) => {
        if (!newBoard[r]) newBoard[r] = []
        newBoard[r][c] = cell
      })
    }
    if (JSON.stringify(board) !== JSON.stringify(newBoard)) changed = true
  }

  if (!changed) return null
  return addRandomTile(newBoard)
}

function AdeleGame() {
  const [board, setBoard] = useState<Cell[][]>(() => {
    if (typeof window === 'undefined') return addRandomTile(addRandomTile(createBoard()))
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Cell[][]
        if (Array.isArray(parsed) && parsed.length === GRID_SIZE) return parsed
      } catch {
        /* ignore */
      }
    }
    return addRandomTile(addRandomTile(createBoard()))
  })

  const [score, setScore] = useState(() => {
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem(`${STORAGE_KEY}-score`)
    return saved ? parseInt(saved, 10) || 0 : 0
  })

  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const handleMove = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (gameOver) return
      const next = move(board, direction)
      if (next) {
        const newScore = next.flat().reduce((s, c) => s + (c?.value ?? 0), 0)
        setBoard(next)
        setScore(newScore)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        localStorage.setItem(`${STORAGE_KEY}-score`, String(newScore))
        if (next.flat().some((c) => c?.value === 2048)) setWon(true)
        const hasEmpty = next.flat().some((c) => !c)
        const hasMerge = (b: Cell[][]) => {
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              const v = b[r][c]?.value
              if (c < GRID_SIZE - 1 && v === b[r][c + 1]?.value) return true
              if (r < GRID_SIZE - 1 && v === b[r + 1][c]?.value) return true
            }
          }
          return false
        }
        if (!hasEmpty && !hasMerge(next)) setGameOver(true)
      }
    },
    [board, gameOver]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right'
        handleMove(dir)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleMove])

  const reset = () => {
    const initial = addRandomTile(addRandomTile(createBoard()))
    setBoard(initial)
    setScore(0)
    setGameOver(false)
    setWon(false)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    localStorage.setItem(`${STORAGE_KEY}-score`, '0')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8 text-center">
        <span className="text-6xl" role="img" aria-hidden>
          {game.emoji}
        </span>
        <h1 className="mt-4 text-2xl font-bold">{game.name}&apos;s Game</h1>
        <p className="mt-1 text-muted-foreground">
          {game.grade} Grade · {game.teacher}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          2048 meets Little Alchemy — merge elements to create new ones!
        </p>
      </header>

      <div className="rounded-xl border border-muted-foreground/30 bg-muted/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="rounded-lg bg-background px-4 py-2 font-mono text-lg font-bold">
              Score: {score}
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              New Game
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Use arrow keys or buttons</p>
        </div>

        {(gameOver || won) && (
          <div
            className={`mb-4 rounded-lg p-4 text-center font-medium ${won ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-destructive/20 text-destructive'}`}
          >
            {won ? '🎉 You reached Magic (2048)!' : 'Game Over — no more moves!'}
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {board.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className="flex aspect-square w-16 items-center justify-center rounded-lg border-2 border-muted-foreground/20 bg-background text-3xl shadow-sm md:w-20"
                >
                  {cell ? (
                    <span title={getElement(cell.value).name} role="img" aria-label={getElement(cell.value).name}>
                      {getElement(cell.value).emoji}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div />
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => handleMove('up')}
              disabled={gameOver}
              aria-label="Move up"
            >
              ↑
            </Button>
            <div />
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => handleMove('left')}
              disabled={gameOver}
              aria-label="Move left"
            >
              ←
            </Button>
            <div className="flex items-center justify-center text-xs text-muted-foreground">Merge!</div>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => handleMove('right')}
              disabled={gameOver}
              aria-label="Move right"
            >
              →
            </Button>
            <div />
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => handleMove('down')}
              disabled={gameOver}
              aria-label="Move down"
            >
              ↓
            </Button>
            <div />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          💧→🌊→🏖️→🐟→🦈→🐋→🏝️→🌴→🍎→🧪→✨ Merge same elements to evolve!
        </p>
      </div>
    </div>
  )
}
