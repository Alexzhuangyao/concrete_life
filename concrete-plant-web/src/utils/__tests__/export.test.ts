import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToExcel, exportToJSON, exportData } from '../export'

describe('Export Utils', () => {
  let createElementSpy: any
  let appendChildSpy: any
  let removeChildSpy: any
  let clickSpy: any
  let createObjectURLSpy: any
  let revokeObjectURLSpy: any

  beforeEach(() => {
    // Mock DOM elements
    clickSpy = vi.fn()
    const mockLink = {
      setAttribute: vi.fn(),
      click: clickSpy,
      style: {},
    }

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

    // Mock URL methods (they should already exist from setup.ts, but we override them)
    createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url')
    revokeObjectURLSpy = vi.fn()
    
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectURLSpy,
    })
    
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: revokeObjectURLSpy,
    })

    // Mock Blob
    global.Blob = vi.fn().mockImplementation((content, options) => ({
      content,
      options,
    })) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportToCSV', () => {
    it('应该导出简单数据为 CSV', () => {
      const data = [
        { id: 1, name: 'Test1', value: 100 },
        { id: 2, name: 'Test2', value: 200 },
      ]

      exportToCSV(data, 'test')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })

    it('应该使用自定义表头', () => {
      const data = [{ id: 1, name: 'Test' }]
      const headers = { id: 'ID', name: '名称' }

      exportToCSV(data, 'test', headers)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该处理包含逗号的值', () => {
      const data = [{ name: 'Test, Inc', value: 100 }]

      exportToCSV(data, 'test')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该处理包含引号的值', () => {
      const data = [{ name: 'Test "Company"', value: 100 }]

      exportToCSV(data, 'test')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该处理包含换行符的值', () => {
      const data = [{ name: 'Test\nCompany', value: 100 }]

      exportToCSV(data, 'test')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该处理空值', () => {
      const data = [{ id: 1, name: null, value: undefined }]

      exportToCSV(data, 'test')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该在没有数据时抛出错误', () => {
      expect(() => exportToCSV([], 'test')).toThrow('没有数据可导出')
    })

    it('应该在数据为 null 时抛出错误', () => {
      expect(() => exportToCSV(null as any, 'test')).toThrow('没有数据可导出')
    })

    it('应该生成带日期的文件名', () => {
      const data = [{ id: 1 }]
      const mockDate = new Date('2024-01-15')
      vi.setSystemTime(mockDate)

      exportToCSV(data, 'test')

      const setAttributeCalls = (createElementSpy.mock.results[0].value.setAttribute as any).mock.calls
      const downloadCall = setAttributeCalls.find((call: any) => call[0] === 'download')
      expect(downloadCall[1]).toContain('2024-01-15')
    })
  })

  describe('exportToExcel', () => {
    it('应该导出数据为 Excel 格式', () => {
      const data = [
        { id: 1, name: 'Test1', value: 100 },
        { id: 2, name: 'Test2', value: 200 },
      ]

      exportToExcel(data, 'test')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该使用自定义表头', () => {
      const data = [{ id: 1, name: 'Test' }]
      const headers = { id: 'ID', name: '名称' }

      exportToExcel(data, 'test', headers)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该在没有数据时抛出错误', () => {
      expect(() => exportToExcel([], 'test')).toThrow('没有数据可导出')
    })

    it('应该生成 .xlsx 扩展名', () => {
      const data = [{ id: 1 }]

      exportToExcel(data, 'test')

      const setAttributeCalls = (createElementSpy.mock.results[0].value.setAttribute as any).mock.calls
      const downloadCall = setAttributeCalls.find((call: any) => call[0] === 'download')
      expect(downloadCall[1]).toContain('.xlsx')
    })
  })

  describe('exportToJSON', () => {
    it('应该导出数据为 JSON 格式', () => {
      const data = [
        { id: 1, name: 'Test1', value: 100 },
        { id: 2, name: 'Test2', value: 200 },
      ]

      exportToJSON(data, 'test')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该在没有数据时抛出错误', () => {
      expect(() => exportToJSON([], 'test')).toThrow('没有数据可导出')
    })

    it('应该生成 .json 扩展名', () => {
      const data = [{ id: 1 }]

      exportToJSON(data, 'test')

      const setAttributeCalls = (createElementSpy.mock.results[0].value.setAttribute as any).mock.calls
      const downloadCall = setAttributeCalls.find((call: any) => call[0] === 'download')
      expect(downloadCall[1]).toContain('.json')
    })

    it('应该格式化 JSON 输出', () => {
      const data = [{ id: 1, name: 'Test' }]

      exportToJSON(data, 'test')

      // Verify Blob was created with formatted JSON
      expect(global.Blob).toHaveBeenCalled()
    })
  })

  describe('exportData', () => {
    it('应该根据格式调用正确的导出函数 - CSV', () => {
      const data = [{ id: 1, name: 'Test' }]

      const result = exportData(data, 'test', 'csv')

      expect(result).toBe(true)
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该根据格式调用正确的导出函数 - Excel', () => {
      const data = [{ id: 1, name: 'Test' }]

      const result = exportData(data, 'test', 'excel')

      expect(result).toBe(true)
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该根据格式调用正确的导出函数 - JSON', () => {
      const data = [{ id: 1, name: 'Test' }]

      const result = exportData(data, 'test', 'json')

      expect(result).toBe(true)
      expect(clickSpy).toHaveBeenCalled()
    })

    it('应该默认使用 Excel 格式', () => {
      const data = [{ id: 1, name: 'Test' }]

      const result = exportData(data, 'test')

      expect(result).toBe(true)
      const setAttributeCalls = (createElementSpy.mock.results[0].value.setAttribute as any).mock.calls
      const downloadCall = setAttributeCalls.find((call: any) => call[0] === 'download')
      expect(downloadCall[1]).toContain('.xlsx')
    })

    it('应该传递自定义表头', () => {
      const data = [{ id: 1, name: 'Test' }]
      const headers = { id: 'ID', name: '名称' }

      const result = exportData(data, 'test', 'csv', headers)

      expect(result).toBe(true)
    })

    it('应该在不支持的格式时抛出错误', () => {
      const data = [{ id: 1, name: 'Test' }]

      expect(() => exportData(data, 'test', 'xml' as any)).toThrow('不支持的导出格式')
    })

    it('应该捕获并重新抛出导出错误', () => {
      const data: any[] = []

      expect(() => exportData(data, 'test', 'csv')).toThrow()
    })

    it('应该记录错误日志', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const data: any[] = []

      try {
        exportData(data, 'test', 'csv')
      } catch (e) {
        // Expected error
      }

      expect(consoleSpy).toHaveBeenCalledWith('导出失败:', expect.any(Error))
    })
  })
})

