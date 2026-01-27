#!/bin/bash

# 测试运行脚本
# 用于运行完整的测试套件

set -e

echo "================================"
echo "混凝土搅拌站管理系统 - 测试套件"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Node.js
echo -e "${YELLOW}检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未安装Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js版本: $(node --version)${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未安装npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm版本: $(npm --version)${NC}"
echo ""

# 安装依赖
echo -e "${YELLOW}检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
fi
echo ""

# 运行测试
echo -e "${YELLOW}运行测试套件...${NC}"
echo ""

# 1. 单元测试
echo "================================"
echo "1. 运行单元测试"
echo "================================"
npm run test:unit
UNIT_TEST_RESULT=$?

if [ $UNIT_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ 单元测试通过${NC}"
else
    echo -e "${RED}✗ 单元测试失败${NC}"
fi
echo ""

# 2. 集成测试
echo "================================"
echo "2. 运行集成测试"
echo "================================"
npm run test:integration
INTEGRATION_TEST_RESULT=$?

if [ $INTEGRATION_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ 集成测试通过${NC}"
else
    echo -e "${RED}✗ 集成测试失败${NC}"
fi
echo ""

# 3. 生成覆盖率报告
echo "================================"
echo "3. 生成测试覆盖率报告"
echo "================================"
npm run test:cov
COVERAGE_RESULT=$?

if [ $COVERAGE_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ 覆盖率报告生成成功${NC}"
    echo "报告位置: coverage/lcov-report/index.html"
else
    echo -e "${RED}✗ 覆盖率报告生成失败${NC}"
fi
echo ""

# 总结
echo "================================"
echo "测试总结"
echo "================================"

TOTAL_FAILURES=0

if [ $UNIT_TEST_RESULT -ne 0 ]; then
    echo -e "${RED}✗ 单元测试失败${NC}"
    TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
else
    echo -e "${GREEN}✓ 单元测试通过${NC}"
fi

if [ $INTEGRATION_TEST_RESULT -ne 0 ]; then
    echo -e "${RED}✗ 集成测试失败${NC}"
    TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
else
    echo -e "${GREEN}✓ 集成测试通过${NC}"
fi

if [ $COVERAGE_RESULT -ne 0 ]; then
    echo -e "${RED}✗ 覆盖率报告生成失败${NC}"
    TOTAL_FAILURES=$((TOTAL_FAILURES + 1))
else
    echo -e "${GREEN}✓ 覆盖率报告生成成功${NC}"
fi

echo ""

if [ $TOTAL_FAILURES -eq 0 ]; then
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}所有测试通过！ ✓${NC}"
    echo -e "${GREEN}================================${NC}"
    exit 0
else
    echo -e "${RED}================================${NC}"
    echo -e "${RED}有 $TOTAL_FAILURES 项测试失败 ✗${NC}"
    echo -e "${RED}================================${NC}"
    exit 1
fi
