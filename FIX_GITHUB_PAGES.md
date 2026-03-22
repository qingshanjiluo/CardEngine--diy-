# GitHub Pages 404错误修复指南

## 问题描述

部署到GitHub Pages后出现404错误，资源文件无法加载。错误信息显示：
```
GET https://qingshanjiluo.github.io/_next/static/css/... 404 (Not Found)
```

## 原因分析

这是因为Next.js生成的资源路径与GitHub Pages的实际URL不匹配。有两种情况：

1. **部署在根目录**：`https://username.github.io/`
   - 资源应该从根目录加载：`/_next/...`
   - basePath应该为空：`''`

2. **部署在子目录**：`https://username.github.io/repo-name/`
   - 资源应该从子目录加载：`/repo-name/_next/...`
   - basePath应该为：`'/repo-name'`

## 解决方案

### 方案1：如果部署在根目录（推荐）

如果您希望网站通过 `https://qingshanjiluo.github.io/` 访问：

1. 修改 `next.config.js`：
   ```javascript
   basePath: '',
   ```

2. 重新构建并部署：
   ```bash
   npm run build
   git add .
   git commit -m "Fix: remove basePath for root deployment"
   git push
   ```

### 方案2：如果部署在子目录

如果您希望网站通过 `https://qingshanjiluo.github.io/CardEngine--diy-/` 访问：

1. 修改 `next.config.js`：
   ```javascript
   basePath: '/CardEngine--diy-',
   ```

2. 重新构建并部署。

### 方案3：使用环境变量（自动）

当前配置已支持环境变量 `NEXT_PUBLIC_BASE_PATH`：

1. 在GitHub仓库的Settings → Secrets and variables → Actions中，添加变量：
   - Name: `NEXT_PUBLIC_BASE_PATH`
   - Value: `''`（空字符串）或 `'/CardEngine--diy-'`

2. 更新GitHub Actions工作流，在构建步骤中添加：
   ```yaml
   - name: Build with Next.js
     run: NEXT_PUBLIC_BASE_PATH="${{ vars.NEXT_PUBLIC_BASE_PATH }}" npm run build
   ```

## 快速修复

运行以下命令之一：

### 修复为根目录部署：
```bash
# 更新next.config.js
sed -i "s/basePath: .*/basePath: '',/" next.config.js

# 重新构建
npm run build

# 提交更改
git add .
git commit -m "Fix: deploy to root directory"
git push
```

### 修复为子目录部署（假设仓库名为CardEngine--diy-）：
```bash
# 更新next.config.js
sed -i "s/basePath: .*/basePath: '\/CardEngine--diy-',/" next.config.js

# 重新构建
npm run build

# 提交更改
git add .
git commit -m "Fix: deploy to subdirectory"
git push
```

## 验证修复

1. 等待GitHub Actions完成部署（约2-5分钟）
2. 访问您的网站
3. 按F12打开开发者工具，检查Console和Network标签页
4. 确保所有资源（CSS、JS、字体）都成功加载

## 预防措施

1. **本地测试**：在部署前，本地测试构建结果：
   ```bash
   npm run build
   npx serve dist
   ```
   访问 `http://localhost:3000` 检查是否正常

2. **检查构建输出**：确保dist目录中的index.html引用了正确的资源路径

3. **GitHub Pages设置**：
   - 如果部署在根目录，选择 `/(root)` 作为源
   - 如果部署在子目录，选择 `/(root)/dist` 或 `/(root)/docs` 作为源

## 技术支持

如果问题仍然存在：
1. 检查GitHub Actions构建日志
2. 查看dist目录中的实际文件结构
3. 确保trailingSlash配置正确（当前为true）
4. 考虑使用Vercel等专门支持Next.js的托管平台