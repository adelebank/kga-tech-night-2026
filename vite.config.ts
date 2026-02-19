import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { games } from './src/games'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const config = defineConfig({
  base: isGitHubPages ? '/kga-tech-night-2026/' : '/',
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          crawlLinks: true,
        },
      },
      pages: [
        { path: '/' },
        { path: '/games' },
        ...games.map((g) => ({ path: `/games/${g.slug}` })),
      ],
      prerender: {
        failOnError: false,
      },
    }),
    viteReact(),
  ],
})

export default config
