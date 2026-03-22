// src/components/game/RulebookExport.tsx
'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  FileText, 
  Book, 
  Printer, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  List,
  Grid,
  Settings
} from 'lucide-react';
import jsPDF from 'jspdf';

interface RulebookExportProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'markdown' | 'pdf' | 'print';

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    id: 'markdown',
    label: 'Markdown 文档',
    description: '导出为 Markdown 格式，适合文档编辑和版本控制',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'pdf',
    label: 'PDF 规则书',
    description: '导出为美观的 PDF 规则书，适合打印和分享',
    icon: <Book className="w-5 h-5" />,
  },
  {
    id: 'print',
    label: '直接打印',
    description: '使用浏览器打印功能直接打印规则书',
    icon: <Printer className="w-5 h-5" />,
  },
];

export function RulebookExport({ isOpen, onClose }: RulebookExportProps) {
  const { project } = useStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 获取游戏元素统计
  const cardElements = project.elements.filter((e) => e.type === 'card');
  const deckElements = project.elements.filter((e) => e.type === 'deck');
  const propElements = project.elements.filter((e) => e.type === 'prop');

  const handleExport = async () => {
    setStatus('exporting');
    setErrorMessage(null);

    try {
      switch (selectedFormat) {
        case 'markdown':
          await exportAsMarkdown();
          break;
        case 'pdf':
          await exportAsPdf();
          break;
        case 'print':
          await exportAsPrint();
          break;
      }
      
      setStatus('success');
      
      // 延迟关闭
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '导出失败');
    }
  };

  const exportAsMarkdown = async () => {
    const markdown = generateMarkdown();
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `${project.name}_规则书_${new Date().toISOString().split('T')[0]}.md`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportAsPdf = async () => {
    const markdown = generateMarkdown();
    
    // 创建PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 设置字体
    pdf.setFont('helvetica');
    
    // 添加标题
    pdf.setFontSize(24);
    pdf.setTextColor(40, 40, 40);
    pdf.text(project.name, 105, 30, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('游戏规则书', 105, 40, { align: 'center' });
    
    // 添加基本信息
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    
    let y = 60;
    
    // 项目描述
    if (project.description) {
      pdf.setFontSize(12);
      pdf.setTextColor(40, 40, 40);
      pdf.text('游戏描述', 20, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const descriptionLines = pdf.splitTextToSize(project.description, 170);
      pdf.text(descriptionLines, 20, y);
      y += descriptionLines.length * 5 + 10;
    }
    
    // 游戏统计
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text('游戏统计', 20, y);
    y += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`• 玩家数量: ${project.players.length}`, 25, y);
    y += 6;
    pdf.text(`• 卡牌数量: ${cardElements.length}`, 25, y);
    y += 6;
    pdf.text(`• 牌堆数量: ${deckElements.length}`, 25, y);
    y += 6;
    pdf.text(`• 道具数量: ${propElements.length}`, 25, y);
    y += 10;
    
    // 玩家信息
    if (project.players.length > 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(40, 40, 40);
      pdf.text('玩家信息', 20, y);
      y += 8;
      
      pdf.setFontSize(10);
      project.players.forEach((player, index) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        
        pdf.setTextColor(60, 60, 60);
        pdf.text(`玩家 ${index + 1}: ${player.name}`, 25, y);
        y += 5;
        
        pdf.setTextColor(80, 80, 80);
        pdf.text(`  类型: ${player.type === 'human' ? '人类玩家' : '电脑玩家'}`, 30, y);
        y += 5;
        
        if (player.stats.length > 0) {
          pdf.text(`  属性:`, 30, y);
          y += 5;
          player.stats.forEach(stat => {
            pdf.text(`    • ${stat.name}: ${stat.defaultValue}${stat.suffix || ''}`, 35, y);
            y += 5;
          });
        }
        y += 5;
      });
      y += 5;
    }
    
    // 添加页脚
    pdf.setFontSize(10);
    pdf.setTextColor(128);
    pdf.text(
      `规则书 - ${project.name} - 导出时间: ${new Date().toLocaleString()}`,
      105,
      287,
      { align: 'center' }
    );

    // 保存PDF
    pdf.save(`${project.name}_规则书_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportAsPrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('无法打开打印窗口');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${project.name} - 规则书</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .print-header { 
            text-align: center; 
            margin-bottom: 40px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 20px;
          }
          .print-header h1 { 
            margin: 0; 
            color: #222; 
            font-size: 2.5rem;
          }
          .print-header p { 
            color: #666; 
            margin: 10px 0;
            font-size: 1.1rem;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #444;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
          }
          .stat-card h3 {
            margin: 0 0 10px 0;
            color: #555;
            font-size: 1rem;
          }
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #222;
          }
          .player-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
          }
          .player-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: #f8f9fa;
          }
          .player-card h3 {
            margin: 0 0 10px 0;
            color: #444;
          }
          .stat-item {
            margin: 5px 0;
            font-size: 0.9rem;
          }
          .stat-label {
            font-weight: bold;
            color: #666;
          }
          @media print {
            body { margin: 0; padding: 15mm; }
            .print-header { border-bottom: 2px solid #000; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${project.name}</h1>
          <p>游戏规则书</p>
          <p>版本 1.0 • 导出时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h2>游戏描述</h2>
          <p>${project.description || '暂无描述'}</p>
        </div>
        
        <div class="section">
          <h2>游戏统计</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>玩家数量</h3>
              <div class="stat-value">${project.players.length}</div>
            </div>
            <div class="stat-card">
              <h3>卡牌数量</h3>
              <div class="stat-value">${cardElements.length}</div>
            </div>
            <div class="stat-card">
              <h3>牌堆数量</h3>
              <div class="stat-value">${deckElements.length}</div>
            </div>
            <div class="stat-card">
              <h3>道具数量</h3>
              <div class="stat-value">${propElements.length}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>玩家信息</h2>
          <div class="player-list">
            ${project.players.map((player, index) => `
              <div class="player-card">
                <h3>玩家 ${index + 1}: ${player.name}</h3>
                <div class="stat-item">
                  <span class="stat-label">类型:</span> ${player.type === 'human' ? '人类玩家' : '电脑玩家'}
                </div>
                ${player.stats.map(stat => `
                  <div class="stat-item">
                    <span class="stat-label">${stat.name}:</span> ${stat.defaultValue}${stat.suffix || ''}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="section">
          <h2>游戏设置</h2>
          <div class="stat-item">
            <span class="stat-label">网格列数:</span> ${project.settings.gridCols}
          </div>
          <div class="stat-item">
            <span class="stat-label">网格行数:</span> ${project.settings.gridRows}
          </div>
          <div class="stat-item">
            <span class="stat-label">玩家数量:</span> ${project.settings.playersCount}
          </div>
        </div>
        
        <div class="section">
          <h2>基本规则</h2>
          <p>1. 游戏开始时，所有玩家按照顺序进行回合。</p>
          <p>2. 每个回合玩家可以执行以下操作：移动卡牌、使用道具、执行脚本等。</p>
          <p>3. 游戏目标根据具体规则设定，可能是收集特定卡牌、达到分数要求或击败对手。</p>
          <p>4. 详细游戏规则请参考游戏内的脚本和事件设置。</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const generateMarkdown = () => {
    return `# ${project.name} - 游戏规则书

## 基本信息
- **游戏名称**: ${project.name}
- **描述**: ${project.description || '暂无描述'}
- **创建时间**: ${new Date().toLocaleString()}
- **版本**: 1.0

## 游戏统计
- 玩家数量: ${project.players.length}
- 卡牌数量: ${cardElements.length}
- 牌堆数量: ${deckElements.length}
- 道具数量: ${propElements.length}

## 玩家信息
${project.players.map((player, index) => `
### 玩家 ${index + 1}: ${player.name}
- **类型**: ${player.type === 'human' ? '人类玩家' : '电脑玩家'}
- **颜色**: ${player.color}
${player.stats.map(stat => `- **${stat.name}**: ${stat.defaultValue}${stat.suffix || ''}`).join('\n')}
`).join('\n')}

## 游戏设置
- 网格列数: ${project.settings.gridCols}
- 网格行数: ${project.settings.gridRows}
- 玩家数量: ${project.settings.playersCount}
- 公共区域: ${project.settings.publicAreaEnabled ? '启用' : '禁用'}

## 游戏元素

### 卡牌列表
${cardElements.map(card => `
#### ${card.name}
- **类型**: ${card.cardType || '普通卡牌'}
- **颜色**: ${card.color}
- **属性**:
${Object.entries(card.properties || {}).map(([key, prop]) => `  - ${prop.label}: ${prop.value}`).join('\n')}
`).join('\n')}

### 牌堆列表
${deckElements.map(deck => `
#### ${deck.name}
- **卡牌数量**: ${deck.properties?.cardCount?.value || 0}
`).join('\n')}

## 基本规则

### 游戏流程
1. 游戏开始时，所有玩家按照顺序进行回合
2. 每个回合玩家可以执行以下操作：
   - 移动卡牌到网格位置
   - 使用道具
   - 执行脚本积木
   - 与其他玩家互动
3. 游戏目标根据具体规则设定

### 胜利条件
游戏胜利条件由游戏设计者通过脚本定义，常见类型包括：
- 收集特定卡牌组合
- 达到指定分数
- 击败所有对手
- 完成特定任务

### 特殊规则
${includeExamples ? `
#### 示例规则
1. 每回合只能移动一张卡牌
2. 道具使用后进入冷却
3. 特定卡牌有特殊效果
` : '*规则详情请参考游戏内脚本设置*'}

## 脚本说明
游戏使用积木脚本系统，主要事件包括：
- \`game_start\`: 游戏开始时触发
- \`turn_start\`: 回合开始时触发
- \`element_click\`: 点击元素时触发
- \`card_played\`: 打出卡牌时触发

## 导出信息
- 导出时间: ${new Date().toLocaleString()}
- 导出格式: ${selectedFormat === 'markdown' ? 'Markdown' : selectedFormat === 'pdf' ? 'PDF' : '打印'}
- 包含示例: ${includeExamples ? '是' : '否'}

---
*本规则书由 CardEngine 自动生成*
`;
  };

  const renderPreview = () => {
    const markdown = generateMarkdown();
    const previewLines = markdown.split('\n').slice(0, 20).join('\n');
    
    return (
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 max-h-64 overflow-auto">
        <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">
          {previewLines}
          {markdown.split('\n').length > 20 && (
            <div className="text-neutral-500 italic mt-2">
              ... (共 {markdown.split('\n').length} 行，预览前20行)
            </div>
          )}
        </pre>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="导出规则书"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* 导出选项 */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            选择导出格式
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFormat === option.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedFormat === option.id ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium text-neutral-900">{option.label}</div>
                  <div className="text-sm text-neutral-500 mt-1">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 导出设置 */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            导出设置
          </label>
          <div className="space-y-3 p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="include-examples"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="include-examples" className="text-sm text-neutral-700 cursor-pointer">
                包含示例规则和说明
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="include-images"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="include-images" className="text-sm text-neutral-700 cursor-pointer">
                包含图片（如果可用）
              </label>
            </div>
          </div>
        </div>

        {/* 预览区域 */}
        <div>
          <div className="text-sm font-medium text-neutral-700 mb-3">规则书预览</div>
          {renderPreview()}
          <div className="text-xs text-neutral-500 mt-2">
            规则书将包含：游戏描述、玩家信息、卡牌列表、基本规则等
          </div>
        </div>

        {/* 错误提示 */}
        {status === 'error' && errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={status === 'exporting'}
          >
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={status === 'exporting' || status === 'success'}
            className="flex-1"
          >
            {status === 'exporting' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                导出成功
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出规则书
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}