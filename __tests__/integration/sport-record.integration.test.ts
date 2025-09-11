import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMockSportRecord } from '../../src/utils/test-data';
import { mockTaroRequest } from '../setup';

describe('运动记录API集成测试', () => {
  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
  });

  it('应该成功获取运动记录列表', async () => {
    const mockRecords = Array.from({ length: 5 }, (_, i) => 
      createMockSportRecord({ id: `record-${i}` })
    );

    mockTaroRequest.mockResolvedValue({
      data: {
        success: true,
        data: {
          records: mockRecords,
          total: 5,
          page: 1,
          pageSize: 10
        }
      }
    });

    // 这里应该是真实的API调用测试
    const result = await getSportRecords({ page: 1, pageSize: 10 });
    
    expect(result.success).toBe(true);
    expect(result.data.records).toHaveLength(5);
    expect(result.data.total).toBe(5);
  });

  it('应该处理API错误情况', async () => {
    mockTaroRequest.mockRejectedValue(new Error('网络错误'));

    await expect(getSportRecords({})).rejects.toThrow('网络错误');
  });
});
