#!/bin/bash

# 检查GitHub Pages部署状态
echo "🔍 检查GitHub Pages部署状态..."
echo "URL: https://qingshanjiluo.github.io/CardEngine--diy-/"

# 检查主页面
echo -e "\n📄 检查主页面..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" https://qingshanjiluo.github.io/CardEngine--diy-/

# 检查CSS文件（示例）
echo -e "\n🎨 检查CSS文件..."
curl -s -o /dev/null -w "CSS文件状态: %{http_code}\n" https://qingshanjiluo.github.io/CardEngine--diy-/_next/static/css/

# 检查JS文件（示例）
echo -e "\n⚡ 检查JS文件..."
curl -s -o /dev/null -w "JS文件状态: %{http_code}\n" https://qingshanjiluo.github.io/CardEngine--diy-/_next/static/chunks/

# 检查GitHub Actions状态
echo -e "\n🔄 检查GitHub Actions状态..."
echo "访问: https://github.com/qingshanjiluo/CardEngine--diy-/actions"

# 部署完成提示
echo -e "\n✅ 如果所有状态码都是200，则部署成功！"
echo "📱 您的网站现在可以通过以下地址访问："
echo "   https://qingshanjiluo.github.io/CardEngine--diy-/"
echo "   https://qingshanjiluo.github.io/CardEngine--diy-/editor"
echo "   https://qingshanjiluo.github.io/CardEngine--diy-/info"