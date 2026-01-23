#!/bin/bash

# 云边一体化部署脚本

set -e

echo "🏭 混凝土搅拌站管理系统 - 云边一体化部署"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"
echo ""

# 选择部署模式
echo "请选择部署模式:"
echo "1) 云端部署 (Cloud)"
echo "2) 边缘节点部署 (Edge)"
echo "3) 开发环境 (Development)"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo ""
    echo -e "${BLUE}☁️  云端部署模式${NC}"
    echo "================================================"
    
    # 设置环境变量
    export DEPLOYMENT_MODE=cloud
    export NODE_ENV=production
    
    # 检查配置文件
    if [ ! -f "concrete-plant-api/.env" ]; then
      echo -e "${YELLOW}⚠️  未找到 .env 文件，复制示例配置...${NC}"
      cp concrete-plant-api/.env.cloud.example concrete-plant-api/.env
      echo -e "${YELLOW}⚠️  请编辑 concrete-plant-api/.env 文件配置数据库连接${NC}"
      read -p "按回车继续..."
    fi
    
    # 构建核心包
    echo ""
    echo -e "${BLUE}📦 构建核心包...${NC}"
    cd packages/core
    npm install
    npm run build
    cd ../..
    
    # 构建后端
    echo ""
    echo -e "${BLUE}🔨 构建后端 API...${NC}"
    cd concrete-plant-api
    npm install
    npm run build
    
    # 启动服务
    echo ""
    echo -e "${GREEN}🚀 启动云端服务...${NC}"
    npm run start:prod &
    
    echo ""
    echo -e "${GREEN}✅ 云端部署完成！${NC}"
    echo -e "${GREEN}📍 访问地址: http://localhost:3001${NC}"
    ;;
    
  2)
    echo ""
    echo -e "${BLUE}🏭 边缘节点部署模式${NC}"
    echo "================================================"
    
    # 获取站点信息
    read -p "请输入站点ID: " site_id
    read -p "请输入站点名称: " site_name
    read -p "请输入云端API地址 (默认: http://localhost:3001): " cloud_url
    cloud_url=${cloud_url:-http://localhost:3001}
    
    # 设置环境变量
    export DEPLOYMENT_MODE=edge
    export NODE_ENV=production
    export SITE_ID=$site_id
    export SITE_NAME=$site_name
    export CLOUD_API_URL=$cloud_url
    
    # 创建配置文件
    if [ ! -f "concrete-plant-api/.env" ]; then
      echo -e "${YELLOW}⚠️  创建边缘节点配置...${NC}"
      cp concrete-plant-api/.env.edge.example concrete-plant-api/.env
      
      # 替换配置
      sed -i.bak "s/SITE_ID=1/SITE_ID=$site_id/" concrete-plant-api/.env
      sed -i.bak "s/SITE_NAME=杭州总站/SITE_NAME=$site_name/" concrete-plant-api/.env
      sed -i.bak "s|CLOUD_API_URL=.*|CLOUD_API_URL=$cloud_url|" concrete-plant-api/.env
      rm concrete-plant-api/.env.bak
    fi
    
    # 构建核心包
    echo ""
    echo -e "${BLUE}📦 构建核心包...${NC}"
    cd packages/core
    npm install
    npm run build
    cd ../..
    
    # 构建后端
    echo ""
    echo -e "${BLUE}🔨 构建后端 API...${NC}"
    cd concrete-plant-api
    npm install
    npm run build
    
    # 创建数据目录
    mkdir -p data logs
    
    # 启动服务
    echo ""
    echo -e "${GREEN}🚀 启动边缘节点服务...${NC}"
    npm run start:prod &
    
    echo ""
    echo -e "${GREEN}✅ 边缘节点部署完成！${NC}"
    echo -e "${GREEN}📍 访问地址: http://localhost:3000${NC}"
    echo -e "${GREEN}🏭 站点ID: $site_id${NC}"
    echo -e "${GREEN}☁️  云端地址: $cloud_url${NC}"
    ;;
    
  3)
    echo ""
    echo -e "${BLUE}💻 开发环境模式${NC}"
    echo "================================================"
    
    # 构建核心包
    echo ""
    echo -e "${BLUE}📦 构建核心包...${NC}"
    cd packages/core
    npm install
    npm run build
    cd ../..
    
    # 启动后端
    echo ""
    echo -e "${BLUE}🔨 启动后端 (开发模式)...${NC}"
    cd concrete-plant-api
    npm install
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 3
    
    # 启动前端
    echo ""
    echo -e "${BLUE}🎨 启动前端 (开发模式)...${NC}"
    cd concrete-plant-web
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ 开发环境启动完成！${NC}"
    echo -e "${GREEN}📍 前端地址: http://localhost:5173${NC}"
    echo -e "${GREEN}📍 后端地址: http://localhost:3001${NC}"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    
    # 等待用户中断
    wait
    ;;
    
  *)
    echo -e "${RED}❌ 无效选项${NC}"
    exit 1
    ;;
esac

echo ""
echo "================================================"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "================================================"
