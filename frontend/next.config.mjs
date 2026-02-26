import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Pin Turbopack root to this project so it doesn't crawl parent dirs (e.g. Desktop) and hit permission errors
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
