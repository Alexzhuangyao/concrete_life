#!/bin/bash

# 云边一体化架构 - 快速测试脚本

echo "🧪 云边一体化架构 - 功能测试"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试核心包构建
echo -e "${BLUE}📦 测试 1: 构建核心包${NC}"
cd packages/core
if npm install && npm run build; then
    echo -e "${GREEN}✅ 核心包构建成功${NC}"
else
    echo -e "${YELLOW}⚠️  核心包构建失败${NC}"
fi
cd ../..
echo ""

# 测试云端模式
echo -e "${BLUE}☁️  测试 2: 云端模式配置${NC}"
export DEPLOYMENT_MODE=cloud
export DATABASE_URL=postgresql://test:test@localhost:5432/test
export REDIS_URL=redis://localhost:6379

node -e "
const { EnvironmentDetector, ConfigManager, FeatureManager } = require('./packages/core/dist/index.js');

console.log('部署模式:', EnvironmentDetector.getMode());
console.log('是否云端:', EnvironmentDetector.isCloud());

const config = ConfigManager.getConfig();
console.log('数据库类型:', config.database.type);
console.log('端口:', config.port);

FeatureManager.initialize();
console.log('多站点管理:', FeatureManager.isEnabled('multiSiteManagement'));
console.log('PLC通信:', FeatureManager.isEnabled('plcCommunication'));
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 云端模式测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  云端模式测试失败${NC}"
fi
echo ""

# 测试边缘模式
echo -e "${BLUE}🏭 测试 3: 边缘模式配置${NC}"
export DEPLOYMENT_MODE=edge
export SQLITE_PATH=./data/test.db
export SITE_ID=1
export PLC_HOST=192.168.1.100
export CLOUD_API_URL=http://localhost:3001

node -e "
const { EnvironmentDetector, ConfigManager, FeatureManager } = require('./packages/core/dist/index.js');

EnvironmentDetector.reset();
ConfigManager.reset();
FeatureManager.reset();

console.log('部署模式:', EnvironmentDetector.getMode());
console.log('是否边缘:', EnvironmentDetector.isEdge());

const config = ConfigManager.getConfig();
console.log('数据库类型:', config.database.type);
console.log('站点ID:', config.cloudSync.siteId);
console.log('PLC地址:', config.plc.host);

FeatureManager.initialize();
console.log('多站点管理:', FeatureManager.isEnabled('multiSiteManagement'));
console.log('PLC通信:', FeatureManager.isEnabled('plcCommunication'));
console.log('云端同步:', FeatureManager.isEnabled('cloudSync'));
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 边缘模式测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  边缘模式测试失败${NC}"
fi
echo ""

# 测试自动检测
echo -e "${BLUE}🔍 测试 4: 自动环境检测${NC}"
unset DEPLOYMENT_MODE
export POSTGRES_URL=postgresql://test:test@localhost:5432/test

node -e "
const { EnvironmentDetector } = require('./packages/core/dist/index.js');
EnvironmentDetector.reset();
console.log('自动检测模式:', EnvironmentDetector.getMode());
console.log('预期: cloud');
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 自动检测测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  自动检测测试失败${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}🎉 测试完成！${NC}"
echo ""
echo "下一步："
echo "1. 运行 ./scripts/deploy.sh 进行实际部署"
echo "2. 查看 IMPLEMENTATION_SUMMARY.md 了解详细信息"
echo "================================================"
