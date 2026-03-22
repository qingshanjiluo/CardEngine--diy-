# GitHub Pages 资源加载问题修复指南

## 问题描述
网站部署在 `https://qingshanjiluo.github.io/CardEngine-diy/`，但资源从错误的路径加载：
- 错误路径：`https://qingshanjiluo.github.io/CardEngine--diy-/_next/...`
- 正确路径：`https://qingshanjiluo.github.io/CardEngine-diy/_next/...`

## 根本原因
1. 仓库名称已从 `CardEngine--diy-` 重命名为 `CardEngine-diy`
2. `next.config.js` 中的 `basePath` 配置仍为 `/CardEngine--diy-`
3. GitHub Actions 工作流使用环境变量，但硬编码的 `basePath` 会覆盖环境变量

## 已实施的修复

### 1. 更新 `next.config.js`
```javascript
// 之前
basePath: '/CardEngine--diy-',

// 之后
basePath: '/CardEngine-diy',
```

### 2. 更新 GitHub Actions 工作流
更新 `.github/workflows/deploy.yml` 中的构建步骤，明确设置 `basePath`：
```yaml
- name: Build with Next.js
  run: |
    # 明确设置 basePath 为 /CardEngine-diy
    echo "Building with basePath: /CardEngine-diy"
    NEXT_PUBLIC_BASE_PATH="/CardEngine-diy" npm run build
```

## 手动修复步骤（如果自动部署失败）

### 选项1：本地构建并手动部署
1. 确保 `next.config.js` 中的 `basePath` 为 `/CardEngine-diy`
2. 运行构建命令：
   ```bash
   npm run build
   ```
3. 构建输出在 `dist` 目录
4. 手动将 `dist` 目录内容上传到 GitHub Pages

### 选项2：使用 GitHub CLI 触发工作流
```bash
gh workflow run deploy.yml
```

### 选项3：直接编辑仓库设置
1. 访问 GitHub 仓库设置
2. 转到 Pages 设置
3. 确保部署分支正确（gh-pages 或 main 分支的 dist 目录）

## 验证修复

### 1. 检查网站可访问性
```bash
curl -I https://qingshanjiluo.github.io/CardEngine-diy/
# 应该返回 HTTP 200
```

### 2. 检查资源加载
```bash
curl -I https://qingshanjiluo.github.io/CardEngine-diy/_next/static/css/app/layout.css
# 应该返回 HTTP 200
```

### 3. 检查页面标题
```bash
curl -s https://qingshanjiluo.github.io/CardEngine-diy/ | grep "<title>"
# 应该显示 "CardEngine · 卡牌创作引擎"
```

## 故障排除

### 如果资源仍然404：
1. 检查 GitHub Actions 构建日志
2. 验证 `dist` 目录中的文件路径
3. 确保所有资源路径都以 `/CardEngine-diy/` 开头

### 如果网站完全无法访问：
1. 检查 GitHub Pages 设置
2. 验证仓库名称是否正确
3. 检查是否有构建错误

## 预防措施
1. 保持 `next.config.js` 中的 `basePath` 与仓库名称同步
2. 在 GitHub Actions 工作流中使用环境变量
3. 定期测试部署后的网站功能

## 当前状态
- ✅ `next.config.js` 已更新
- ✅ GitHub Actions 工作流已更新
- ⏳ 等待推送更改并触发自动部署
- ⏳ 等待验证修复效果