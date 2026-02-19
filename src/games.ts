export interface Game {
  name: string
  grade: string
  teacher: string
  emoji: string
  slug: string
}

export const games: Game[] = [
  {
    name: 'Adele',
    grade: '4th',
    teacher: 'Mrs. Studioso',
    emoji: '🐵',
    slug: 'adele',
  },
]
