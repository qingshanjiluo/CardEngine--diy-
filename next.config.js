// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // GitHub Pages部署需要basePath
  basePath: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' ? '/CardEngine' : '',
}

module.exports = nextConfig
