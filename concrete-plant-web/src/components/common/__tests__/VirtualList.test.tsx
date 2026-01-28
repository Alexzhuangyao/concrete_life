import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VirtualList, useVirtualList } from '../VirtualList'
import { renderHook } from '@testing-library/react'

describe('VirtualList', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }))

  const renderItem = (item: any, index: number, style: React.CSSProperties) => (
    <div style={style} data-testid={`item-${index}`}>
      {item.name}
    </div>
  )

  describe('基本渲染', () => {
    it('应该渲染虚拟列表容器', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      const listContainer = container.querySelector('.virtual-list-container')
      expect(listContainer).toBeInTheDocument()
    })

    it('应该只渲染可见项', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      // 容器高度 500px，项高度 50px，应该渲染约 10 个可见项 + overscan
      const renderedItems = container.querySelectorAll('[data-testid^="item-"]')
      expect(renderedItems.length).toBeLessThan(30) // 10 visible + 3*2 overscan
      expect(renderedItems.length).toBeGreaterThan(0)
    })

    it('应该设置正确的容器高度', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      const listContainer = container.querySelector('.virtual-list-container')
      expect(listContainer).toHaveStyle({ height: '500px' })
    })

    it('应该计算正确的总高度', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      // 找到内部的 spacer div（第二个 div，包含 position: relative）
      const spacer = container.querySelector('.virtual-list-container > div')
      expect(spacer).toBeTruthy()
      // 检查高度是否正确
      const height = spacer?.getAttribute('style')
      expect(height).toContain(`${mockItems.length * 50}px`)
    })
  })

  describe('滚动行为', () => {
    it('应该在滚动时更新可见项', () => {
      const onScroll = vi.fn()
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
          onScroll={onScroll}
        />
      )

      const listContainer = container.querySelector('.virtual-list-container')
      
      fireEvent.scroll(listContainer!, { target: { scrollTop: 1000 } })

      expect(onScroll).toHaveBeenCalledWith(1000)
    })

    it('应该在滚动后渲染新的可见项', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      const listContainer = container.querySelector('.virtual-list-container')
      
      // 初始状态应该渲染前面的项
      expect(screen.queryByTestId('item-0')).toBeInTheDocument()

      // 滚动到中间
      fireEvent.scroll(listContainer!, { target: { scrollTop: 25000 } })

      // 应该渲染中间的项（索引约 500）
      const renderedItems = container.querySelectorAll('[data-testid^="item-"]')
      const firstRenderedIndex = parseInt(
        renderedItems[0].getAttribute('data-testid')?.split('-')[1] || '0'
      )
      expect(firstRenderedIndex).toBeGreaterThan(400)
    })
  })

  describe('overscan 配置', () => {
    it('应该使用默认 overscan 值', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      const renderedItems = container.querySelectorAll('[data-testid^="item-"]')
      // 默认 overscan=3，可见项约 10，总共应该约 16 项
      expect(renderedItems.length).toBeGreaterThan(10)
    })

    it('应该使用自定义 overscan 值', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
          overscan={10}
        />
      )

      const renderedItems = container.querySelectorAll('[data-testid^="item-"]')
      // overscan=10，可见项约 10，总共应该约 30 项
      expect(renderedItems.length).toBeGreaterThan(20)
    })
  })

  describe('自定义样式', () => {
    it('应该应用自定义 className', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
          className="custom-list"
        />
      )

      const listContainer = container.querySelector('.custom-list')
      expect(listContainer).toBeInTheDocument()
    })

    it('应该应用自定义 style', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
          style={{ border: '1px solid red' }}
        />
      )

      const listContainer = container.querySelector('.virtual-list-container')
      expect(listContainer).toHaveStyle({ border: '1px solid red' })
    })
  })

  describe('keyExtractor', () => {
    it('应该使用自定义 key 提取器', () => {
      const keyExtractor = (item: any) => `custom-${item.id}`
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      )

      const firstItem = container.querySelector('[data-testid="item-0"]')
      expect(firstItem?.parentElement?.getAttribute('style')).toBeTruthy()
    })

    it('应该在没有 keyExtractor 时使用索引作为 key', () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      const items = container.querySelectorAll('[data-testid^="item-"]')
      expect(items.length).toBeGreaterThan(0)
    })
  })

  describe('空列表', () => {
    it('应该处理空数组', () => {
      const { container } = render(
        <VirtualList
          items={[]}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      const renderedItems = container.querySelectorAll('[data-testid^="item-"]')
      expect(renderedItems.length).toBe(0)
    })
  })

  describe('项目高度变化', () => {
    it('应该支持不同的项目高度', () => {
      const { container, rerender } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      let spacer = container.querySelector('.virtual-list-container > div')
      let height = spacer?.getAttribute('style')
      expect(height).toContain(`${mockItems.length * 50}px`)

      rerender(
        <VirtualList
          items={mockItems}
          itemHeight={100}
          containerHeight={500}
          renderItem={renderItem}
        />
      )

      spacer = container.querySelector('.virtual-list-container > div')
      height = spacer?.getAttribute('style')
      expect(height).toContain(`${mockItems.length * 100}px`)
    })
  })
})

describe('useVirtualList', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }))

  it('应该计算可见项范围', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, 50, 500, 0, 3)
    )

    expect(result.current.startIndex).toBe(0)
    expect(result.current.visibleItems.length).toBeGreaterThan(0)
    expect(result.current.totalHeight).toBe(mockItems.length * 50)
  })

  it('应该在滚动时更新可见项', () => {
    const { result, rerender } = renderHook(
      ({ scrollTop }) => useVirtualList(mockItems, 50, 500, scrollTop, 3),
      { initialProps: { scrollTop: 0 } }
    )

    const initialStart = result.current.startIndex

    rerender({ scrollTop: 1000 })

    expect(result.current.startIndex).toBeGreaterThan(initialStart)
  })

  it('应该计算正确的偏移量', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, 50, 500, 1000, 3)
    )

    const expectedStartIndex = Math.max(0, Math.floor(1000 / 50) - 3)
    expect(result.current.offsetY).toBe(expectedStartIndex * 50)
  })

  it('应该处理边界情况', () => {
    const { result } = renderHook(() =>
      useVirtualList(mockItems, 50, 500, 999999, 3)
    )

    expect(result.current.endIndex).toBeLessThanOrEqual(mockItems.length - 1)
  })

  it('应该支持自定义 overscan', () => {
    const { result: result1 } = renderHook(() =>
      useVirtualList(mockItems, 50, 500, 0, 3)
    )

    const { result: result2 } = renderHook(() =>
      useVirtualList(mockItems, 50, 500, 0, 10)
    )

    expect(result2.current.visibleItems.length).toBeGreaterThan(
      result1.current.visibleItems.length
    )
  })
})

