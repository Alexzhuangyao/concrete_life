import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeploymentModeBadge } from '../DeploymentModeBadge'
import * as useRuntimeConfigModule from '../../../hooks/useRuntimeConfig'

// Mock the hooks
vi.mock('../../../hooks/useRuntimeConfig', () => ({
  useRuntimeConfig: vi.fn(),
}))

// Mock DevModeConfigSwitcher
vi.mock('../DevModeConfigSwitcher', () => ({
  DevModeConfigSwitcher: ({ visible, onClose }: any) => 
    visible ? <div data-testid="config-modal" onClick={onClose}>Config Modal</div> : null,
}))

describe('DeploymentModeBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('加载状态', () => {
    it('应该在加载时不渲染', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: null,
        loading: true,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: true,
      })

      const { container } = render(<DeploymentModeBadge />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('边缘模式', () => {
    it('应该显示本地模式徽章', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'edge' } as any,
        loading: false,
        error: null,
        deploymentMode: 'edge',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      expect(screen.getByText('本地')).toBeInTheDocument()
    })

    it('应该显示正确的图标和颜色', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'edge' } as any,
        loading: false,
        error: null,
        deploymentMode: 'edge',
        isLoading: false,
      })

      const { container } = render(<DeploymentModeBadge />)
      const badge = container.querySelector('div[style*="rgba(82, 196, 26"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('云端模式', () => {
    it('应该显示云端模式徽章', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'cloud' } as any,
        loading: false,
        error: null,
        deploymentMode: 'cloud',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      expect(screen.getByText('云端')).toBeInTheDocument()
    })

    it('应该显示正确的图标和颜色', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'cloud' } as any,
        loading: false,
        error: null,
        deploymentMode: 'cloud',
        isLoading: false,
      })

      const { container } = render(<DeploymentModeBadge />)
      const badge = container.querySelector('div[style*="rgba(24, 144, 255"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('开发模式', () => {
    it('应该显示开发模式徽章', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'hybrid' } as any,
        loading: false,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      expect(screen.getByText('开发')).toBeInTheDocument()
    })

    it('应该显示正确的图标和颜色', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'hybrid' } as any,
        loading: false,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: false,
      })

      const { container } = render(<DeploymentModeBadge />)
      const badge = container.querySelector('div[style*="rgba(250, 173, 20"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('紧凑模式', () => {
    it('应该在紧凑模式下使用较小的尺寸', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'edge' } as any,
        loading: false,
        error: null,
        deploymentMode: 'edge',
        isLoading: false,
      })

      const { container } = render(<DeploymentModeBadge compact />)
      const badge = container.querySelector('div[style*="padding: 2px 8px"]')
      expect(badge).toBeInTheDocument()
    })

    it('应该在非紧凑模式下使用正常尺寸', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'edge' } as any,
        loading: false,
        error: null,
        deploymentMode: 'edge',
        isLoading: false,
      })

      const { container } = render(<DeploymentModeBadge compact={false} />)
      const badge = container.querySelector('div[style*="padding: 4px 12px"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('配置切换', () => {
    it('应该在开发/混合模式下显示设置图标', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'hybrid' } as any,
        loading: false,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      const badge = screen.getByText('开发').parentElement
      expect(badge?.querySelector('[data-icon="setting"]')).toBeInTheDocument()
    })

    it('应该在点击时打开配置模态框', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'hybrid' } as any,
        loading: false,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      
      const badge = screen.getByText('开发').parentElement
      fireEvent.click(badge!)

      expect(screen.getByTestId('config-modal')).toBeInTheDocument()
    })

    it('应该在关闭时隐藏配置模态框', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'hybrid' } as any,
        loading: false,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      
      const badge = screen.getByText('开发').parentElement
      fireEvent.click(badge!)

      const modal = screen.getByTestId('config-modal')
      fireEvent.click(modal)

      expect(screen.queryByTestId('config-modal')).not.toBeInTheDocument()
    })
  })

  describe('工具提示', () => {
    it('应该在开发模式下显示可点击提示', () => {
      vi.mocked(useRuntimeConfigModule.useRuntimeConfig).mockReturnValue({
        config: { mode: 'hybrid' } as any,
        loading: false,
        error: null,
        deploymentMode: 'hybrid',
        isLoading: false,
      })

      render(<DeploymentModeBadge />)
      const badge = screen.getByText('开发').parentElement
      expect(badge?.getAttribute('title')).toContain('点击切换配置')
    })
  })
})

