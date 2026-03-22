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
  // 根据部署环境设置basePath
  // 选项1: 如果部署在根目录 (https://username.github.io/)，设置为 ''
  // 选项2: 如果部署在子目录 (https://username.github.io/repo/)，设置为 '/repo'
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

module.exports = nextConfig
