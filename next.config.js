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
  // 部署到子目录: https://qingshanjiluo.github.io/CardEngine--diy-/
  basePath: '/CardEngine--diy-',
}

module.exports = nextConfig
