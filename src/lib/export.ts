// src/lib/export.ts
import { Project, RuntimeState, GameElement } from '@/types';
import { toPng } from 'html-to-image';

export type ExportFormat = 'json' | 'html' | 'image-board' | 'image-card';

interface ExportOptions {
  format: ExportFormat;
  includeRuntime?: boolean;
  elementId?: string; // 用于导出特定卡牌图片
}

/**
 * 导出项目主函数
 */
export function exportProject(
  project: Project,
  runtime: RuntimeState,
  options: ExportOptions
): string | Blob | Promise<Blob> {
  switch (options.format) {
    case 'json':
      return exportAsJson(project, runtime, options.includeRuntime);
    case 'html':
      return exportAsHtml(project, runtime);
    case 'image-board':
      return exportBoardAsImage();
    case 'image-card':
      if (!options.elementId) {
        throw new Error('需要指定 elementId 来导出卡牌图片');
      }
      return exportCardAsImage(options.elementId);
    default:
      throw new Error(`不支持的导出格式: ${options.format}`);
  }
}

/**
 * 导出为 JSON 格式
 */
function exportAsJson(
  project: Project,
  runtime: RuntimeState,
  includeRuntime?: boolean
): string {
  const exportData = {
    version: '1.0.0',
    project: {
      ...project,
      exportDate: new Date().toISOString(),
    },
    ...(includeRuntime && {
      runtime: {
        ...runtime,
        exportDate: new Date().toISOString(),
      },
    }),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 导出为 HTML 格式（独立运行）
 */
function exportAsHtml(project: Project, runtime?: RuntimeState): Blob {
  const html = generateGameHtml(project, runtime);
  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

/**
 * 导出游戏面板为图片
 */
async function exportBoardAsImage(): Promise<Blob> {
  const boardElement = document.querySelector('[data-game-board]') as HTMLElement;
  if (!boardElement) {
    throw new Error('未找到游戏面板元素，请确保游戏面板已渲染');
  }

  try {
    const dataUrl = await toPng(boardElement, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    throw new Error(`导出面板图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 导出指定卡牌为图片
 */
async function exportCardAsImage(elementId: string): Promise<Blob> {
  const cardElement = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
  if (!cardElement) {
    throw new Error(`未找到卡牌元素: ${elementId}`);
  }

  try {
    const dataUrl = await toPng(cardElement, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: 'transparent',
    });

    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    throw new Error(`导出卡牌图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成完整的游戏 HTML
 */
function generateGameHtml(project: Project, runtime?: RuntimeState): string {
  const cardElements = project.elements.filter((e) => e.type === 'card');
  const deckElements = project.elements.filter((e) => e.type === 'deck');
  const propElements = project.elements.filter((e) => e.type === 'prop');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.name)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: ${project.settings.background?.value || '#FAFAFA'};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .game-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      width: 100%;
      flex: 1;
    }

    .game-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .game-header h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 10px;
    }

    .game-header p {
      color: #666;
      font-size: 0.95rem;
    }

    .game-board {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(${project.settings.gridCols}, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .grid-slot {
      aspect-ratio: 3/4;
      background: #f9f9f9;
      border: 2px dashed #ddd;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      min-height: 120px;
      position: relative;
    }

    .grid-slot:hover {
      border-color: #5686FE;
      background: #f0f5ff;
    }

    .grid-slot.drag-over {
      border-color: #10B981;
      background: #f0fdf4;
      border-style: solid;
    }

    .grid-slot.occupied {
      border-style: solid;
      border-color: #e5e5e5;
    }

    .card {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      padding: 10px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .card.dragging {
      opacity: 0.5;
    }

    .card-face {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .card-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }

    .card-name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .card-stats {
      display: flex;
      gap: 8px;
      font-size: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .stat-badge {
      background: rgba(255,255,255,0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .deck {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .deck:hover {
      transform: scale(1.05);
    }

    .deck-count {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .deck-label {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .players {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .player {
      background: white;
      border: 2px solid #eee;
      border-radius: 12px;
      padding: 15px;
      transition: all 0.2s;
    }

    .player.active {
      border-color: #5686FE;
      background: #f0f5ff;
      box-shadow: 0 0 0 3px rgba(86, 134, 254, 0.1);
    }

    .player-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .player-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--player-color, #5686FE);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .player-name {
      font-weight: bold;
      color: #333;
    }

    .player-type {
      font-size: 0.75rem;
      color: #999;
    }

    .player-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .player-stat {
      background: #f5f5f5;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .player-stat-label {
      color: #666;
    }

    .player-stat-value {
      font-weight: bold;
      color: #333;
    }

    .controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      background: #5686FE;
      color: white;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    button:hover {
      background: #4475ed;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(86, 134, 254, 0.3);
    }

    button:active {
      transform: translateY(0);
    }

    button.secondary {
      background: #f0f0f0;
      color: #333;
    }

    button.secondary:hover {
      background: #e5e5e5;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .game-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 0.9rem;
    }

    .info-value {
      font-weight: bold;
      color: #333;
    }

    .log-panel {
      margin-top: 20px;
      background: #f9f9f9;
      border-radius: 12px;
      padding: 15px;
      max-height: 200px;
      overflow-y: auto;
    }

    .log-entry {
      font-size: 0.85rem;
      padding: 4px 0;
      color: #666;
      border-bottom: 1px solid #eee;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-entry.info { color: #5686FE; }
    .log-entry.error { color: #EF4444; }
    .log-entry.broadcast { color: #10B981; }

    .footer {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 0.875rem;
    }

    .footer a {
      color: #5686FE;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: repeat(${Math.min(project.settings.gridCols, 3)}, 1fr);
      }

      .game-header h1 {
        font-size: 1.5rem;
      }

      .players {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="game-container">
    <div class="game-header">
      <h1>${escapeHtml(project.name)}</h1>
      <p>${escapeHtml(project.description || '由 CardEngine 创建')}</p>
    </div>

    <div class="game-info">
      <div class="info-item">
        <span>回合:</span>
        <span class="info-value" id="turn-count">1</span>
      </div>
      <div class="info-item">
        <span>当前玩家:</span>
        <span class="info-value" id="current-player">-</span>
      </div>
      <div class="info-item">
        <span>状态:</span>
        <span class="info-value" id="game-status">准备中</span>
      </div>
    </div>

    <div class="game-board">
      <div class="grid" id="grid">
        ${generateGridSlots(project)}
      </div>

      <div class="players" id="players">
        ${generatePlayerCards(project)}
      </div>

      <div class="controls">
        <button onclick="startGame()" id="btn-start">开始游戏</button>
        <button onclick="endTurn()" id="btn-end-turn" disabled>结束回合</button>
        <button onclick="resetGame()" class="secondary">重置</button>
      </div>

      <div class="log-panel" id="log-panel" style="display: none;">
        <!-- 日志将显示在这里 -->
      </div>
    </div>
  </div>

  <div class="footer">
    使用 <a href="#" target="_blank">CardEngine</a> 创建
  </div>

  <script>
    // 游戏数据
    const gameData = ${JSON.stringify(project)};

    // 游戏状态
    let gameState = {
      isPlaying: false,
      currentPlayerIndex: 0,
      turnCount: 1,
      phase: 'setup',
      elements: {},
      players: {},
      gridState: {},
      logs: []
    };

    // 初始化
    function init() {
      // 初始化玩家状态
      gameData.players.forEach((player, index) => {
        gameState.players[player.id] = {
          ...player,
          currentStats: player.stats.reduce((acc, stat) => {
            acc[stat.key] = stat.defaultValue;
            return acc;
          }, {}),
          handCards: [],
          isActive: index === 0
        };
      });

      // 初始化元素状态
      gameData.elements.forEach(element => {
        gameState.elements[element.id] = {
          ...element,
          currentSlot: element.currentSlot ?? null
        };
      });

      updateUI();
      setupEventListeners();
    }

    // 开始游戏
    function startGame() {
      if (gameState.isPlaying) return;

      gameState.isPlaying = true;
      gameState.phase = 'playing';
      gameState.currentPlayerIndex = 0;
      gameState.turnCount = 1;

      // 清空日志
      gameState.logs = [];
      log('游戏开始！', 'broadcast');

      // 执行全局脚本中的"当游戏开始时"事件
      executeEvent('game_start');

      updateUI();
      document.getElementById('btn-start').disabled = true;
      document.getElementById('btn-end-turn').disabled = false;
    }

    // 结束回合
    function endTurn() {
      if (!gameState.isPlaying) return;

      const currentPlayer = gameData.players[gameState.currentPlayerIndex];
      log(\`\${currentPlayer.name} 结束回合\`, 'info');

      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameData.players.length;

      if (gameState.currentPlayerIndex === 0) {
        gameState.turnCount++;
        log(\`第 \${gameState.turnCount} 回合开始\`, 'broadcast');
      }

      const nextPlayer = gameData.players[gameState.currentPlayerIndex];
      log(\`轮到 \${nextPlayer.name}\`, 'broadcast');

      // 更新玩家激活状态
      gameData.players.forEach((p, i) => {
        gameState.players[p.id].isActive = i === gameState.currentPlayerIndex;
      });

      // 执行"回合开始"事件
      executeEvent('turn_start');

      updateUI();
    }

    // 重置游戏
    function resetGame() {
      gameState.isPlaying = false;
      gameState.currentPlayerIndex = 0;
      gameState.turnCount = 1;
      gameState.phase = 'setup';
      gameState.gridState = {};
      gameState.logs = [];

      // 重置玩家状态
      gameData.players.forEach((player, index) => {
        gameState.players[player.id].currentStats = player.stats.reduce((acc, stat) => {
          acc[stat.key] = stat.defaultValue;
          return acc;
        }, {});
        gameState.players[player.id].isActive = index === 0;
      });

      // 清空格子
      document.querySelectorAll('.grid-slot').forEach(slot => {
        slot.innerHTML = '';
        slot.classList.remove('occupied');
      });

      updateUI();
      document.getElementById('btn-start').disabled = false;
      document.getElementById('btn-end-turn').disabled = true;
      document.getElementById('log-panel').style.display = 'none';
    }

    // 更新界面
    function updateUI() {
      // 更新回合数
      document.getElementById('turn-count').textContent = gameState.turnCount;

      // 更新当前玩家
      const currentPlayer = gameData.players[gameState.currentPlayerIndex];
      document.getElementById('current-player').textContent = currentPlayer?.name || '-';

      // 更新游戏状态
      const statusText = {
        'setup': '准备中',
        'playing': '进行中',
        'ended': '已结束'
      };
      document.getElementById('game-status').textContent = statusText[gameState.phase];

      // 更新玩家高亮
      document.querySelectorAll('.player').forEach((el, index) => {
        el.classList.toggle('active', index === gameState.currentPlayerIndex);
      });

      // 更新玩家数据
      gameData.players.forEach(player => {
        const playerEl = document.querySelector(\`[data-player="\${player.id}"]\`);
        if (playerEl) {
          player.stats.forEach(stat => {
            const statEl = playerEl.querySelector(\`[data-stat="\${stat.key}"]\`);
            if (statEl) {
              statEl.textContent = gameState.players[player.id].currentStats[stat.key];
            }
          });
        }
      });
    }

    // 设置事件监听
    function setupEventListeners() {
      // 格子点击事件
      document.querySelectorAll('.grid-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
          const slotIndex = parseInt(slot.dataset.slot);
          handleSlotClick(slotIndex);
        });

        // 拖拽事件
        slot.addEventListener('dragover', (e) => {
          e.preventDefault();
          slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
          slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          slot.classList.remove('drag-over');
          const elementId = e.dataTransfer.getData('element-id');
          if (elementId) {
            moveElementToSlot(elementId, parseInt(slot.dataset.slot));
          }
        });
      });

      // 卡牌拖拽事件
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('element-id', card.dataset.elementId);
          card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });
      });
    }

    // 处理格子点击
    function handleSlotClick(slotIndex) {
      const elementId = gameState.gridState[slotIndex];
      if (elementId) {
        const element = gameState.elements[elementId];
        log(\`点击了: \${element?.name || '未知元素'}\`, 'info');
        executeEvent('element_click', { elementId, slotIndex });
      } else {
        log(\`点击了空格子 \${slotIndex}\`, 'info');
      }
    }

    // 移动元素到格子
    function moveElementToSlot(elementId, slotIndex) {
      // 从原位置移除
      Object.keys(gameState.gridState).forEach(key => {
        if (gameState.gridState[key] === elementId) {
          delete gameState.gridState[key];
          const oldSlot = document.querySelector(\`[data-slot="\${key}"]\`);
          if (oldSlot) {
            oldSlot.innerHTML = '';
            oldSlot.classList.remove('occupied');
          }
        }
      });

      // 添加到新位置
      gameState.gridState[slotIndex] = elementId;
      const newSlot = document.querySelector(\`[data-slot="\${slotIndex}"]\`);
      if (newSlot) {
        const element = gameState.elements[elementId];
        newSlot.innerHTML = generateCardHtml(element);
        newSlot.classList.add('occupied');
        setupCardDrag(newSlot.querySelector('.card'));
      }

      gameState.elements[elementId].currentSlot = slotIndex;
      log(\`移动 \${gameState.elements[elementId].name} 到格子 \${slotIndex}\`, 'info');
    }

    // 设置卡牌拖拽
    function setupCardDrag(card) {
      if (!card) return;
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('element-id', card.dataset.elementId);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    }

    // 生成卡牌 HTML
    function generateCardHtml(element) {
      const statsHtml = Object.entries(element.properties || {})
        .map(([key, prop]) => \`<span class="stat-badge">\${prop.label}: \${prop.value}</span>\`)
        .join('');

      return \`
        <div class="card" draggable="true" data-element-id="\${element.id}">
          <div class="card-face">
            \${element.image ? \`<img src="\${element.image}" class="card-image" alt="\${element.name}">\` : ''}
            <span class="card-name">\${element.name}</span>
            <div class="card-stats">\${statsHtml}</div>
          </div>
        </div>
      \`;
    }

    // 执行事件
    function executeEvent(eventType, data = {}) {
      // 查找并执行对应的事件处理积木
      const eventBlocks = gameData.globalScript.filter(block => {
        if (eventType === 'game_start') return block.type === 'event_game_start';
        if (eventType === 'turn_start') return block.type === 'event_turn_start';
        if (eventType === 'element_click') return block.type === 'event_element_click';
        return false;
      });

      eventBlocks.forEach(block => {
        executeBlock(block);
      });
    }

    // 执行积木（简化版）
    function executeBlock(block) {
      console.log('执行积木:', block.type, block);
      // 这里可以扩展完整的积木执行逻辑
    }

    // 添加日志
    function log(message, type = 'info') {
      gameState.logs.push({ message, type, time: Date.now() });
      const logPanel = document.getElementById('log-panel');
      logPanel.style.display = 'block';

      const entry = document.createElement('div');
      entry.className = \`log-entry \${type}\`;
      entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
      logPanel.appendChild(entry);
      logPanel.scrollTop = logPanel.scrollHeight;
    }

    // 启动
    init();
  </script>
</body>
</html>`;
}

/**
 * 生成格子 HTML
 */
function generateGridSlots(project: Project): string {
  const totalSlots = project.settings.gridRows * project.settings.gridCols;
  let html = '';

  for (let i = 0; i < totalSlots; i++) {
    // 查找是否有元素在这个格子上
    const element = project.elements.find((e) => e.currentSlot === i);
    let content = '';
    let occupiedClass = '';

    if (element) {
      occupiedClass = 'occupied';
      if (element.type === 'deck') {
        content = generateDeckHtml(element);
      } else if (element.type === 'card') {
        content = generateCardHtmlForExport(element);
      }
    }

    html += `<div class="grid-slot ${occupiedClass}" data-slot="${i}">${content}</div>\n`;
  }

  return html;
}

/**
 * 生成牌组 HTML
 */
function generateDeckHtml(element: GameElement): string {
  return `<div class="deck" data-element-id="${element.id}">
  <span class="deck-count">${element.properties?.cardCount?.value || 0}</span>
  <span class="deck-label">${element.name}</span>
</div>`;
}

/**
 * 生成卡牌 HTML（用于导出）
 */
function generateCardHtmlForExport(element: GameElement): string {
  const statsHtml = Object.entries(element.properties || {})
    .map(
      ([key, prop]) =>
        `<span class="stat-badge">${escapeHtml(prop.label)}: ${prop.value}</span>`
    )
    .join('');

  return `<div class="card" draggable="true" data-element-id="${element.id}">
  <div class="card-face">
    ${element.image ? `<img src="${escapeHtml(element.image)}" class="card-image" alt="${escapeHtml(element.name)}">` : ''}
    <span class="card-name">${escapeHtml(element.name)}</span>
    <div class="card-stats">${statsHtml}</div>
  </div>
</div>`;
}

/**
 * 生成玩家卡片 HTML
 */
function generatePlayerCards(project: Project): string {
  return project.players
    .map(
      (player, index) => `<div class="player ${index === 0 ? 'active' : ''}" data-player="${player.id}" style="--player-color: ${player.color}">
  <div class="player-header">
    <div class="player-avatar">${player.name.charAt(0)}</div>
    <div>
      <div class="player-name">${escapeHtml(player.name)}</div>
      <div class="player-type">${player.type === 'human' ? '玩家' : '电脑'}</div>
    </div>
  </div>
  <div class="player-stats">
    ${player.stats
      .map(
        (stat) => `<div class="player-stat">
      <span class="player-stat-label">${escapeHtml(stat.name)}:</span>
      <span class="player-stat-value" data-stat="${stat.key}">${stat.defaultValue}${stat.suffix || ''}</span>
    </div>`
      )
      .join('')}
  </div>
</div>`
    )
    .join('');
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  const div = { toString: () => text };
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

/**
 * 下载文件
 */
export function downloadFile(content: string | Blob, filename: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导入项目
 */
export function importProject(jsonString: string): { project: Project; runtime?: RuntimeState } {
  try {
    const data = JSON.parse(jsonString);

    if (!data.project) {
      throw new Error('无效的项目文件：缺少项目数据');
    }

    // 验证项目数据基本结构
    const project = data.project;
    if (!project.name || !Array.isArray(project.elements) || !Array.isArray(project.players)) {
      throw new Error('无效的项目文件：项目数据结构不完整');
    }

    return {
      project: data.project,
      runtime: data.runtime,
    };
  } catch (error) {
    throw new Error(`导入项目失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 读取文件内容为文本
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

/**
 * 验证导入文件
 */
export function validateImportFile(file: File): boolean {
  // 检查文件类型
  const validTypes = ['application/json', 'text/plain'];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.json')) {
    return false;
  }

  // 检查文件大小 (最大 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return false;
  }

  return true;
}
