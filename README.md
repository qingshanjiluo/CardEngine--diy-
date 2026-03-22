# 🎴 CardEngine · 卡牌引擎

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Zustand-4.4-orange?style=flat-square" alt="Zustand">
</p>

<p align="center">
  <strong>让每个桌游创意，都能轻松实现。</strong>
</p>

<p align="center">
  <a href="#-简介">简介</a> •
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-使用教程">使用教程</a> •
  <a href="#-技术架构">技术架构</a> •
  <a href="#-部署指南">部署指南</a> •
  <a href="#-项目结构">项目结构</a> •
  <a href="#-作者">作者</a>
</p>

---

## 📖 简介

**CardEngine（卡牌引擎）** 是一款面向桌游DIY爱好者的可视化卡牌创作与规则编辑工具。它采用类似 Scratch 的模块化编程界面，让用户无需编写代码即可定义桌游的交互逻辑、卡牌行为和游戏规则。

产品提供一体化的设计环境，支持从卡牌设计、规则编写到桌面模拟的全流程创作，最终可导出可打印的卡牌、规则书、项目文件及 JSON 数据。

### ✨ 核心亮点

- 🧩 **积木式编程** - 拖拽积木块即可定义游戏规则，零编程门槛
- 🎨 **可视化设计** - 实时预览卡牌效果，所见即所得
- 🎮 **多玩家支持** - 支持 2-4 名玩家，模拟真实桌游环境
- 📱 **响应式设计** - 完美适配桌面端与移动端
- 📦 **多种导出格式** - 支持 PNG、PDF、JSON、HTML 等多种格式

---

## 🚀 功能特性

### 1. 可视化积木编程

采用 Scratch 风格的积木编程系统，提供 **100+** 个积木块，涵盖：

| 分类 | 功能描述 |
|------|----------|
| 🎯 **事件** | 游戏开始、元素点击、回合切换、广播消息等触发器 |
| 🔄 **控制** | 循环、条件判断、等待、广播等流程控制 |
| ⚡ **动作** | 移动、创建、删除元素，抽牌、洗牌，属性修改等 |
| 🔍 **侦测** | 空白位状态、元素属性、玩家数据、随机数等检测 |
| 💾 **数据** | 变量、列表、玩家属性等数据管理 |
| 🔢 **运算** | 逻辑、数学、文本运算支持 |
| 📦 **自定义** | 自定义积木块，实现代码复用 |

### 2. 卡牌与元素系统

- **卡牌设计**：支持正反面设置，自定义属性（攻击力、血量、费用等）
- **多面态系统**：一张卡牌可拥有多个形态，可动态切换
- **道具元素**：骰子、计数器、标记等非卡牌类元素
- **牌堆管理**：支持抽牌、洗牌、查看剩余数量

### 3. 游戏桌面模拟

- **空白位系统**：3×5 可自定义网格，支持命名（如"手牌区"）
- **多玩家支持**：2-4 名玩家，独立区域 + 共享公共区域
- **交互方式**：点击、拖拽、右键/长按菜单
- **调试面板**：实时监控变量、广播消息、玩家状态

### 4. 导出功能

| 导出类型 | 格式 | 用途 |
|----------|------|------|
| 项目文件 | `.crdengine` | 包含所有素材和脚本的完整项目 |
| JSON 数据 | `.json` | 纯数据格式，便于二次开发 |
| 卡牌表 | PNG / PDF | 九宫格排版，适合打印 |
| 规则书 | Markdown / PDF | 自动生成的游戏规则文档 |
| 独立游戏 | HTML | 单文件可运行版本 |

---

## ⚡ 快速开始

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本（或 yarn、pnpm）
- **现代浏览器**: Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/cardengine.git
cd cardengine
```

2. **安装依赖**

```bash
npm install
# 或使用 yarn
yarn install
```

3. **启动开发服务器**

```bash
npm run dev
# 或使用 yarn
yarn dev
```

4. **访问应用**

打开浏览器访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

---

## 📚 使用教程

### 第一步：创建新项目

1. 点击左上角的「新建」按钮
2. 设置玩家数量（2-4人）
3. 配置桌面网格大小（默认 3×5）

### 第二步：设计卡牌

1. 在「元素选择器」中点击「+」添加卡牌
2. 上传卡牌图片（支持正反面）
3. 添加自定义属性：
   - 点击「添加属性」
   - 设置属性名（如"攻击力"）
   - 选择类型（整数/浮点数/文本/布尔）
   - 设置默认值

### 第三步：编写规则（积木编程）

1. 从左侧积木分类栏拖拽积木到画布
2. 将积木拼接成完整的逻辑：

```
当游戏开始时
  └─ 重复执行 (玩家数量) 次
      ├─ 抽取 5 张牌从 [主牌堆] 到 [玩家手牌]
      └─ 设置 [当前玩家] 的生命值为 30

当 [卡牌] 被点击
  └─ 如果 ([该卡牌] 的类型 = "随从")
      └─ 移动 [该卡牌] 到 [战场区域]
```

3. 点击「开始」按钮测试游戏

### 第四步：导出成果

1. 点击「导出」按钮
2. 选择导出格式：
   - **打印卡牌**：选择 PNG/PDF 格式
   - **分享规则**：选择 Markdown/PDF 格式
   - **二次开发**：选择 JSON 格式
   - **独立运行**：选择 HTML 格式

### 示例：创建一个简单的抽卡游戏

1. 创建牌堆，添加 10 张不同卡牌
2. 在全局脚本中添加：
   ```
   当游戏开始时
     └─ 洗牌 [主牌堆]
   ```
3. 为每张卡牌添加：
   ```
   当被点击
     └─ 广播 ["抽牌"] 并等待
   ```
4. 运行测试，点击卡牌即可抽牌

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 14 + React 18 |
| **编程语言** | TypeScript 5 |
| **样式方案** | Tailwind CSS 3 |
| **状态管理** | Zustand |
| **动画效果** | Framer Motion |
| **拖拽交互** | 原生 Touch 事件 |
| **PDF 生成** | jsPDF |
| **图片导出** | html-to-image |

### 核心模块

```
src/
├── app/                    # Next.js App Router
│   ├── editor/            # 编辑器主页面
│   ├── info/              # 项目信息页
│   └── srtting/           # 设置页面
├── components/
│   ├── blocks/            # 积木系统组件
│   │   ├── BlockCanvas.tsx    # 积木画布
│   │   ├── BlockPalette.tsx   # 积木分类栏
│   │   ├── CodeBlock.tsx      # 单个积木块
│   │   ├── ExportDialog.tsx   # 导出对话框
│   │   └── ImportDialog.tsx   # 导入对话框
│   ├── game/              # 游戏模拟组件
│   │   ├── GameBoard.tsx      # 游戏桌面
│   │   ├── CardEditor.tsx     # 卡牌编辑器
│   │   ├── DeckEditor.tsx     # 牌堆编辑器
│   │   ├── PlayerPanel.tsx    # 玩家面板
│   │   └── DebugPanel.tsx     # 调试面板
│   ├── layout/            # 布局组件
│   │   ├── Header.tsx         # 顶部导航
│   │   └── Sidebar.tsx        # 侧边栏
│   └── ui/                # 基础UI组件
├── lib/
│   ├── block-definitions.ts   # 积木定义
│   ├── interpreter.ts         # 积木解释器
│   ├── runtime.ts             # 游戏运行时
│   ├── store.ts               # 全局状态
│   └── export.ts              # 导出功能
├── types/                 # TypeScript 类型定义
└── hooks/                 # 自定义 React Hooks
```

### 数据模型

```typescript
interface Project {
  projectName: string;        // 项目名称
  author: string;             // 作者
  version: string;            // 版本
  settings: {
    playersCount: number;     // 玩家数量
    gridRows: number;         // 网格行数
    gridCols: number;         // 网格列数
    background: Background;   // 背景设置
    publicArea: PublicArea;   // 公共区域
  };
  globalScript: Block[];      // 全局脚本
  elements: {
    cards: Card[];            // 卡牌定义
    props: Prop[];            // 道具定义
    decks: Deck[];            // 牌堆定义
  };
  players: Player[];          // 玩家初始状态
}
```

---

## 🚀 部署指南

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击「New Project」
4. 导入 GitHub 仓库
5. 框架预设选择「Next.js」
6. 点击「Deploy」

### Netlify 部署

1. 构建项目：
   ```bash
   npm run build
   ```
2. 将 `.next` 目录作为发布目录
3. 或使用 Netlify CLI：
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### 静态导出部署

如需导出为纯静态网站：

1. 修改 `next.config.js`：
   ```javascript
   const nextConfig = {
     output: 'export',
     distDir: 'dist',
   }
   module.exports = nextConfig
   ```

2. 构建：
   ```bash
   npm run build
   ```

3. 部署 `dist` 目录到任何静态托管服务

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

构建并运行：
```bash
docker build -t cardengine .
docker run -p 3000:3000 cardengine
```

---

## 📁 项目结构

```
cardengine/
├── .next/                  # Next.js 构建输出
├── public/                 # 静态资源
├── src/
│   ├── app/               # App Router 页面
│   │   ├── globals.css    # 全局样式
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 首页
│   │   ├── editor/        # 编辑器页面
│   │   ├── info/          # 信息页面
│   │   └── srtting/       # 设置页面
│   ├── components/        # React 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具函数和核心逻辑
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
├── .gitignore             # Git 忽略配置
├── LICENSE                # 许可证
├── next.config.js         # Next.js 配置
├── package.json           # 项目依赖
├── postcss.config.js      # PostCSS 配置
├── README.md              # 项目说明
├── tailwind.config.ts     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 状态管理优先使用 Zustand

---

## 📝 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 👤 作者

**CardEngine Team**

- 🎨 **产品设计师** - 负责产品规划与用户体验设计
- 💻 **前端工程师** - 负责核心功能开发与架构设计
- 🎮 **桌游顾问** - 负责桌游机制设计与规则验证

### 联系方式

- 📧 Email: your.email@example.com
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)
- 💬 Discord: [加入讨论](https://discord.gg/yourlink)

### 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Lucide](https://lucide.dev/) - 图标库

---

<p align="center">
  用 ❤️ 和 🎴 制作
</p>

<p align="center">
  <sub>如果你发现这个项目对你有帮助，请给它一个 ⭐️ Star！</sub>
</p>
