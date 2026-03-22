#!/bin/bash
# 测试GitHub Pages资源加载修复

echo "测试GitHub Pages资源加载..."
echo "=============================="

# 测试主页面
echo "1. 测试主页面可访问性:"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" https://qingshanjiluo.github.io/CardEngine-diy/

echo -e "\n2. 检查页面标题:"
curl -s https://qingshanjiluo.github.io/CardEngine-diy/ | grep -o "<title>[^<]*</title>"

echo -e "\n3. 测试CSS资源加载:"
curl -s -o /dev/null -w "CSS资源状态: %{http_code}\n" https://qingshanjiluo.github.io/CardEngine-diy/_next/static/css/app/layout.css

echo -e "\n4. 测试JavaScript资源加载:"
curl -s -o /dev/null -w "JS资源状态: %{http_code}\n" https://qingshanjiluo.github.io/CardEngine-diy/_next/static/chunks/main.js

echo -e "\n5. 检查basePath配置:"
echo "当前next.config.js basePath:"
grep "basePath" next.config.js

echo -e "\n6. 检查GitHub Actions状态:"
echo "等待部署完成后再运行此检查..."

echo -e "\n=============================="
echo "测试完成！如果所有资源都返回200，则修复成功。"