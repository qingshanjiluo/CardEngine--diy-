# GitHub Pages 部署指南

## 概述

本项目已配置为可通过 GitHub Pages 进行静态部署，让您的卡牌引擎应用可以通过公网访问。

## 部署步骤

### 1. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录您的账户
2. 点击右上角 "+" 图标，选择 "New repository"
3. 输入仓库名称（例如 `CardEngine`）
4. 选择 "Public"（公开仓库）
5. **不要**初始化 README、.gitignore 或 license（因为本地已有）
6. 点击 "Create repository"

### 2. 推送代码到 GitHub

在本地项目目录中执行以下命令：

```bash
# 添加远程仓库（将 YOUR_USERNAME 替换为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/CardEngine.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 "Settings"（设置）
2. 在左侧菜单中找到 "Pages"（页面）
3. 在 "Source"（源）部分：
   - 选择 "GitHub Actions"
   - 或者选择 "Deploy from a branch"，然后选择：
     - Branch: `main`
     - Folder: `/dist`
4. 点击 "Save"（保存）

### 4. 触发 GitHub Actions 部署

1. 代码推送后，GitHub Actions 会自动运行
2. 在仓库页面点击 "Actions" 标签页查看部署状态
3. 等待部署完成（约 2-5 分钟）

### 5. 访问您的网站

部署完成后，您的网站将通过以下 URL 访问：

```
https://YOUR_USERNAME.github.io/CardEngine/
```

**注意**：首次部署可能需要几分钟才能生效。

## 自定义配置

### 修改 basePath

如果您将仓库命名为其他名称，需要更新 `next.config.js` 中的 `basePath`：

```javascript
basePath: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES === 'true' ? '/您的仓库名' : '',
```

### 使用自定义域名

如果您有自己的域名：

1. 在仓库 Settings → Pages 中，添加自定义域名
2. 在域名 DNS 设置中添加 CNAME 记录指向 `YOUR_USERNAME.github.io`

## 故障排除

### 构建失败

1. 检查 GitHub Actions 日志中的错误信息
2. 确保 `package.json` 中的依赖项正确
3. 本地测试构建：`npm run build`

### 页面显示空白或 404

1. 检查 `basePath` 配置是否正确
2. 确保 `next.config.js` 中 `output: 'export'` 已设置
3. 检查 GitHub Pages 设置中的源文件夹是否为 `/dist`

### 样式丢失

1. 确保 Tailwind CSS 已正确配置
2. 检查构建输出中 CSS 文件是否存在

## 自动部署

每次向 `main` 分支推送代码时，GitHub Actions 会自动：
1. 安装依赖
2. 构建项目
3. 部署到 GitHub Pages

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建测试
npm run build

# 预览构建结果
npx serve dist
```

## 注意事项

1. GitHub Pages 是静态托管，不支持 Next.js 的服务器端渲染（SSR）
2. 所有页面都预渲染为静态 HTML
3. API 路由需要其他解决方案（如 Vercel、Netlify）
4. 免费账户有存储和带宽限制，但足够个人项目使用

## 替代方案

如果 GitHub Pages 不满足需求，考虑：

1. **Vercel**：Next.js 官方托管平台，支持 SSR
2. **Netlify**：类似 Vercel，提供更多免费功能
3. **Cloudflare Pages**：快速全球 CDN

## 支持

如有问题，请查看：
- [Next.js 静态导出文档](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)