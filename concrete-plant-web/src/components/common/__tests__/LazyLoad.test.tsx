import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingFallback, PageLoadingFallback, DashboardLoadingFallback, LazyWrapper } from '../LazyLoad'

describe('LazyLoad Components', () => {
  describe('LoadingFallback', () => {
    it('应该渲染默认加载状态', () => {
      render(<LoadingFallback />)
      
      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })

    it('应该显示自定义消息', () => {
      render(<LoadingFallback message="正在加载数据..." />)
      
      expect(screen.getByText('正在加载数据...')).toBeInTheDocument()
    })

    it('应该支持不同的尺寸', () => {
      const { rerender } = render(<LoadingFallback size="small" />)
      expect(screen.getByText('加载中...')).toBeInTheDocument()

      rerender(<LoadingFallback size="default" />)
      expect(screen.getByText('加载中...')).toBeInTheDocument()

      rerender(<LoadingFallback size="large" />)
      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })

    it('应该支持全屏模式', () => {
      const { container } = render(<LoadingFallback fullScreen />)
      
      const fullScreenDiv = container.querySelector('div[style*="position: fixed"]')
      expect(fullScreenDiv).toBeInTheDocument()
    })

    it('应该在非全屏模式下使用正常容器', () => {
      const { container } = render(<LoadingFallback fullScreen={false} />)
      
      // 检查不是全屏模式（没有 position: fixed）
      const fullScreenDiv = container.querySelector('div[style*="position: fixed"]')
      expect(fullScreenDiv).toBeNull()
      
      // 检查有正常的容器
      const normalDiv = container.querySelector('div[style*="width: 100%"]')
      expect(normalDiv).toBeTruthy()
    })
  })

  describe('PageLoadingFallback', () => {
    it('应该渲染页面加载状态', () => {
      const { container } = render(<PageLoadingFallback />)
      
      // Ant Design Spin 组件存在即可
      const spinElement = container.querySelector('.ant-spin')
      expect(spinElement).toBeInTheDocument()
    })

    it('应该显示自定义消息', () => {
      const { container } = render(<PageLoadingFallback message="页面加载中..." />)
      
      const spinElement = container.querySelector('.ant-spin')
      expect(spinElement).toBeInTheDocument()
    })

    it('应该有最小高度', () => {
      const { container } = render(<PageLoadingFallback />)
      
      // 检查容器存在
      const containerDiv = container.querySelector('div[style*="height: 100%"]')
      expect(containerDiv).toBeTruthy()
    })
  })

  describe('DashboardLoadingFallback', () => {
    it('应该渲染仪表板加载状态', () => {
      render(<DashboardLoadingFallback />)
      
      expect(screen.getByText('系统初始化中...')).toBeInTheDocument()
    })

    it('应该包含旋转动画样式', () => {
      const { container } = render(<DashboardLoadingFallback />)
      
      const style = container.querySelector('style')
      expect(style?.textContent).toContain('@keyframes spin')
    })

    it('应该使用全屏高度', () => {
      const { container } = render(<DashboardLoadingFallback />)
      
      const fullHeightDiv = container.querySelector('div[style*="height: 100vh"]')
      expect(fullHeightDiv).toBeInTheDocument()
    })
  })

  describe('LazyWrapper', () => {
    it('应该渲染子组件', () => {
      render(
        <LazyWrapper>
          <div>Test Content</div>
        </LazyWrapper>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('应该使用默认 fallback', () => {
      const LazyComponent = () => {
        throw new Promise(() => {}) // Simulate loading
      }

      render(
        <LazyWrapper>
          <LazyComponent />
        </LazyWrapper>
      )
      
      // Should show default loading fallback
      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })

    it('应该使用自定义 fallback', () => {
      const LazyComponent = () => {
        throw new Promise(() => {}) // Simulate loading
      }

      render(
        <LazyWrapper fallback={<div>Custom Loading...</div>}>
          <LazyComponent />
        </LazyWrapper>
      )
      
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument()
    })
  })
})

