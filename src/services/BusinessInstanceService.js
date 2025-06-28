import businessInstanceData from '../mock/data/businessInstance'

// 业务实例服务
export default {
  // 获取业务实例列表
  async getBusinessInstances(params) {
    return {
      code: 200,
      data: businessInstanceData.getBusinessInstances(params),
      message: 'success'
    }
  },

  // 获取单个业务实例
  async getBusinessInstance(id) {
    const data = businessInstanceData.getBusinessInstance(id)
    
    if (data) {
      return {
        code: 200,
        data,
        message: 'success'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 创建业务实例
  async createBusinessInstance(data) {
    return {
      code: 200,
      data: businessInstanceData.createBusinessInstance(data),
      message: 'success'
    }
  },

  // 更新业务实例
  async updateBusinessInstance(id, data) {
    const updatedData = businessInstanceData.updateBusinessInstance(id, data)
    
    if (updatedData) {
      return {
        code: 200,
        data: updatedData,
        message: 'success'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 删除业务实例
  async deleteBusinessInstance(id) {
    const success = businessInstanceData.deleteBusinessInstance(id)
    
    if (success) {
      return {
        code: 200,
        message: '删除成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 启用业务实例
  async enableBusinessInstance(id) {
    const data = businessInstanceData.enableBusinessInstance(id)
    
    if (data) {
      return {
        code: 200,
        data,
        message: '启用成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 禁用业务实例
  async disableBusinessInstance(id) {
    const data = businessInstanceData.disableBusinessInstance(id)
    
    if (data) {
      return {
        code: 200,
        data,
        message: '禁用成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 分配防护IP
  async allocateProtectionIps(id, ips) {
    const data = businessInstanceData.allocateProtectionIps(id, ips)
    
    if (data) {
      return {
        code: 200,
        data,
        message: '分配成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 获取可用订单列表
  async getAvailableOrders(params) {
    return {
      code: 200,
      data: businessInstanceData.getAvailableOrders(params),
      message: 'success'
    }
  },

  // 获取可用防护IP列表
  async getAvailableProtectionIps() {
    // 生成一些模拟IP
    const ipv4List = Array.from({ length: 15 }, (_, i) => ({
      ip: `203.0.113.${i + 1}`,
      type: 'IPv4',
      isAnycast: i % 3 === 0,
      region: i % 3 === 0 ? '' : ['cn-beijing', 'cn-shanghai', 'cn-guangzhou', 'cn-hangzhou'][i % 4],
      status: 'available'
    }))
    
    const ipv6List = Array.from({ length: 10 }, (_, i) => {
      const segments = []
      for (let j = 0; j < 8; j++) {
        segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
      }
      
      return {
        ip: segments.join(':'),
        type: 'IPv6',
        isAnycast: i % 4 === 0,
        region: i % 4 === 0 ? '' : ['cn-beijing', 'cn-shanghai', 'cn-guangzhou', 'cn-hangzhou'][i % 4],
        status: 'available'
      }
    })
    
    return {
      code: 200,
      data: [...ipv4List, ...ipv6List],
      message: 'success'
    }
  }
} 