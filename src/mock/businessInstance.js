import Mock from 'mockjs'
import businessInstanceData from './data/businessInstance'

// 业务实例列表
Mock.mock(/\/api\/business-instances(\?.+)?$/, 'get', (options) => {
  // 处理带有/api前缀的URL
  const urlStr = options.url.replace('/api/', '/')
  const url = new URL(urlStr, 'http://localhost')
  const params = {}
  
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  
  return {
    code: 200,
    data: businessInstanceData.getBusinessInstances(params),
    message: 'success'
  }
})

// 获取单个业务实例
Mock.mock(/\/api\/business-instances\/[^/]+$/, 'get', (options) => {
  const url = options.url
  // 从URL中提取ID，跳过/api前缀
  const parts = url.split('/')
  const id = parts[parts.length - 1]
  
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
})

// 创建业务实例
Mock.mock('/api/business-instances', 'post', (options) => {
  const body = JSON.parse(options.body)
  const data = businessInstanceData.createBusinessInstance(body)
  
  return {
    code: 200,
    data,
    message: 'success'
  }
})

// 更新业务实例
Mock.mock(/\/api\/business-instances\/[^/]+$/, 'put', (options) => {
  const url = options.url
  // 从URL中提取ID，跳过/api前缀
  const parts = url.split('/')
  const id = parts[parts.length - 1]
  const body = JSON.parse(options.body)
  
  const data = businessInstanceData.updateBusinessInstance(id, body)
  
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
})

// 删除业务实例
Mock.mock(/\/api\/business-instances\/[^/]+$/, 'delete', (options) => {
  const url = options.url
  // 从URL中提取ID，跳过/api前缀
  const parts = url.split('/')
  const id = parts[parts.length - 1]
  
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
})

// 启用业务实例
Mock.mock(/\/api\/business-instances\/[^/]+\/enable$/, 'post', (options) => {
  const url = options.url
  // 从URL中提取ID，跳过/api前缀和enable
  const parts = url.split('/')
  const id = parts[parts.length - 2]
  
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
})

// 禁用业务实例
Mock.mock(/\/api\/business-instances\/[^/]+\/disable$/, 'post', (options) => {
  const url = options.url
  // 从URL中提取ID，跳过/api前缀和disable
  const parts = url.split('/')
  const id = parts[parts.length - 2]
  
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
})

// 分配防护IP
Mock.mock(/\/api\/business-instances\/[^/]+\/protection-ips$/, 'post', (options) => {
  const url = options.url
  // 从URL中提取ID，跳过/api前缀和protection-ips
  const parts = url.split('/')
  const id = parts[parts.length - 2]
  const body = JSON.parse(options.body)
  
  const data = businessInstanceData.allocateProtectionIps(id, body.ips)
  
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
})

// 获取可用订单列表
Mock.mock(/\/api\/orders\/available(\?.+)?$/, 'get', (options) => {
  // 处理带有/api前缀的URL
  const urlStr = options.url.replace('/api/', '/')
  const url = new URL(urlStr, 'http://localhost')
  const params = {}
  
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  
  return {
    code: 200,
    data: businessInstanceData.getAvailableOrders(params),
    message: 'success'
  }
})

// 获取可用防护IP列表
Mock.mock(/\/api\/protection-ips\/available(\?.+)?$/, 'get', () => {
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
      segments.push(Mock.Random.hex(4))
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
})
