import Mock from 'mockjs'

// IP防护对象列表
const ipProtectionList = Mock.mock({
  'data|10-30': [{
    'id|+1': 1,
    'instanceId': function() {
      return `BI${10000 + this.id % 10 + 1}`
    },
    'instanceName': function() {
      return `业务实例-${this.instanceId.replace('BI', '') % 10 || 1}`
    },
    'customerName': function() {
      const names = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司'];
      return names[Math.floor(Math.random() * names.length)];
    },
    'publicIp': function() {
      if (this.id % 3 === 0) {
        // IPv6
        const segments = []
        for (let j = 0; j < 8; j++) {
          segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
        }
        return segments.join(':')
      } else {
        // IPv4
        return `203.0.113.${this.id % 255 + 1}`
      }
    },
    'addressType': function() {
      return this.publicIp.includes(':') ? 'IPv6' : 'IPv4'
    },
    'protectionBandwidthType': function() {
      return this.id % 2 === 0 ? 'shared' : 'dedicated'
    },
    'dedicatedProtectionBandwidth': function() {
      return this.protectionBandwidthType === 'dedicated' ? (this.id % 5 + 1) * 50 : 0
    },
    'instanceProtectionBandwidth': 500,
    'businessBandwidthType': function() {
      return this.id % 3 === 0 ? 'shared' : 'dedicated'
    },
    'dedicatedBusinessBandwidth': function() {
      return this.businessBandwidthType === 'dedicated' ? (this.id % 3 + 1) * 30 : 0
    },
    'instanceBusinessBandwidth': 200,
    'businessQpsType': function() {
      return this.id % 2 === 0 ? 'shared' : 'dedicated'
    },
    'dedicatedBusinessQps': function() {
      return this.businessQpsType === 'dedicated' ? (this.id % 5 + 1) * 500 : 0
    },
    'instanceBusinessQps': 5000,
    'nearSourceSuppression|1': [true, false],
    'layer7Protection|1': [true, false],
    'status|1': ['active', 'inactive'],
    'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 域名防护对象列表
const domainProtectionList = Mock.mock({
  'data|10-30': [{
    'id|+1': 1,
    'instanceId': function() {
      return `BI${10000 + this.id % 10 + 1}`
    },
    'instanceName': function() {
      return `业务实例-${this.instanceId.replace('BI', '') % 10 || 1}`
    },
    'customerName': function() {
      const names = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司'];
      return names[Math.floor(Math.random() * names.length)];
    },
    'publicIp': function() {
      if (this.id % 3 === 0) {
        // IPv6
        const segments = []
        for (let j = 0; j < 8; j++) {
          segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
        }
        return segments.join(':')
      } else {
        // IPv4
        return `203.0.113.${this.id % 255 + 1}`
      }
    },
    'addressType': function() {
      return this.publicIp.includes(':') ? 'IPv6' : 'IPv4'
    },
    'domain': function() {
      return `example${this.id}.com`
    },
    'cname': function() {
      return `${this.domain}.vmdat.com`
    },
    'protectionBandwidthType': function() {
      return this.id % 2 === 0 ? 'shared' : 'dedicated'
    },
    'dedicatedProtectionBandwidth': function() {
      return this.protectionBandwidthType === 'dedicated' ? (this.id % 5 + 1) * 50 : 0
    },
    'instanceProtectionBandwidth': 500,
    'businessBandwidthType': function() {
      return this.id % 3 === 0 ? 'shared' : 'dedicated'
    },
    'dedicatedBusinessBandwidth': function() {
      return this.businessBandwidthType === 'dedicated' ? (this.id % 3 + 1) * 30 : 0
    },
    'instanceBusinessBandwidth': 200,
    'businessQpsType': function() {
      return this.id % 2 === 0 ? 'shared' : 'dedicated'
    },
    'dedicatedBusinessQps': function() {
      return this.businessQpsType === 'dedicated' ? (this.id % 5 + 1) * 500 : 0
    },
    'instanceBusinessQps': 5000,
    'protectionPackage|1': ['standard', 'enhanced'],
    'accessType|1': ['domain', 'port'],
    'status|1': ['active', 'inactive'],
    'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

// 业务实例选项
const businessInstanceOptions = Mock.mock({
  'data|5-10': [{
    'value|+1': 10001,
    'label': '业务实例-@integer(1, 10)'
  }]
})

// 存储实际数据的数组（持久化数据）
let ipProtectionData = [...ipProtectionList.data]
let domainProtectionData = [...domainProtectionList.data]

// 获取新ID
const getNewIpProtectionId = () => {
  return ipProtectionData.length > 0 ? Math.max(...ipProtectionData.map(item => item.id)) + 1 : 1
}

// 根据业务实例ID获取业务实例名称
const getInstanceNameById = (instanceId) => {
  const instance = businessInstanceOptions.data.find(item => item.value.toString() === instanceId.toString())
  return instance ? instance.label : `业务实例-${instanceId}`
}

// IP防护对象列表接口
Mock.mock(/\/api\/protection\/ip\/list/, 'get', (options) => {
  const { url } = options
  const params = new URLSearchParams(url.split('?')[1])
  const pageNum = parseInt(params.get('pageNum')) || 1
  const pageSize = parseInt(params.get('pageSize')) || 10
  const publicIp = params.get('publicIp') || ''
  const instanceId = params.get('instanceId') || ''
  const status = params.get('status') || ''
  
  let filteredList = [...ipProtectionData]
  
  // 筛选
  if (publicIp) {
    filteredList = filteredList.filter(item => item.publicIp.includes(publicIp))
  }
  if (instanceId) {
    filteredList = filteredList.filter(item => item.instanceId.toString() === instanceId)
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status)
  }
  
  // 分页
  const total = filteredList.length
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total,
      pageNum,
      pageSize
    }
  }
})

// 获取新域名防护对象ID
const getNewDomainProtectionId = () => {
  return domainProtectionData.length > 0 ? Math.max(...domainProtectionData.map(item => item.id)) + 1 : 1
}

// 获取域名防护对象列表
Mock.mock(/\/api\/protection\/domain\/list/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const params = Object.fromEntries(url.searchParams.entries())
  
  // 解析分页参数
  const pageNum = parseInt(params.pageNum) || 1
  const pageSize = parseInt(params.pageSize) || 10
  
  // 过滤数据
  let filteredData = [...domainProtectionData]
  
  if (params.customerName) {
    filteredData = filteredData.filter(item => 
      item.customerName && item.customerName.toLowerCase().includes(params.customerName.toLowerCase())
    )
  }
  
  if (params.instanceName) {
    filteredData = filteredData.filter(item => 
      item.instanceName && item.instanceName.toLowerCase().includes(params.instanceName.toLowerCase())
    )
  }
  
  if (params.publicIp) {
    filteredData = filteredData.filter(item => 
      item.publicIp && item.publicIp.toLowerCase().includes(params.publicIp.toLowerCase())
    )
  }
  
  if (params.domain) {
    filteredData = filteredData.filter(item => 
      item.domain && item.domain.toLowerCase().includes(params.domain.toLowerCase())
    )
  }
  
  if (params.status) {
    filteredData = filteredData.filter(item => item.status === params.status)
  }
  
  // 计算分页
  const total = filteredData.length
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const pagedData = filteredData.slice(start, end)
  
  return {
    code: 200,
    message: 'success',
    data: {
      list: pagedData,
      total,
      pageNum,
      pageSize
    }
  }
})

// 业务实例选项接口
Mock.mock(/\/api\/business-instance\/options/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: businessInstanceOptions.data
  }
})

// 通用的成功响应
const successResponse = {
  code: 200,
  message: 'success',
  data: null
}

// 添加IP防护对象
Mock.mock(/\/api\/protection\/ip\/add/, 'post', (options) => {
  const body = JSON.parse(options.body)
  
  // 创建新记录
  const newItem = {
    id: getNewIpProtectionId(),
    instanceId: body.instanceId,
    instanceName: getInstanceNameById(body.instanceId),
    customerName: `客户${Math.floor(Math.random() * 100)}`,
    publicIp: body.publicIp,
    addressType: body.publicIp.includes(':') ? 'IPv6' : 'IPv4',
    protectionBandwidthType: body.protectionBandwidthType,
    dedicatedProtectionBandwidth: body.dedicatedProtectionBandwidth,
    instanceProtectionBandwidth: 500,
    businessBandwidthType: body.businessBandwidthType,
    dedicatedBusinessBandwidth: body.dedicatedBusinessBandwidth,
    instanceBusinessBandwidth: 200,
    businessQpsType: body.businessQpsType,
    dedicatedBusinessQps: body.dedicatedBusinessQps,
    instanceBusinessQps: 5000,
    nearSourceSuppression: body.nearSourceSuppression,
    layer7Protection: body.layer7Protection,
    status: 'active',
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  
  // 添加到数组
  ipProtectionData.unshift(newItem)
  
  return successResponse
})

// 更新IP防护对象
Mock.mock(/\/api\/protection\/ip\/update/, 'put', (options) => {
  const body = JSON.parse(options.body)
  const index = ipProtectionData.findIndex(item => item.id === body.id)
  
  if (index !== -1) {
    // 保留原有的一些字段
    const oldItem = ipProtectionData[index]
    
    // 更新字段
    ipProtectionData[index] = {
      ...oldItem,
      instanceId: body.instanceId,
      instanceName: getInstanceNameById(body.instanceId),
      publicIp: body.publicIp,
      addressType: body.publicIp.includes(':') ? 'IPv6' : 'IPv4',
      protectionBandwidthType: body.protectionBandwidthType,
      dedicatedProtectionBandwidth: body.dedicatedProtectionBandwidth,
      businessBandwidthType: body.businessBandwidthType,
      dedicatedBusinessBandwidth: body.dedicatedBusinessBandwidth,
      businessQpsType: body.businessQpsType,
      dedicatedBusinessQps: body.dedicatedBusinessQps,
      nearSourceSuppression: body.nearSourceSuppression,
      layer7Protection: body.layer7Protection,
    }
  }
  
  return successResponse
})

// 删除IP防护对象
Mock.mock(/\/api\/protection\/ip\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/delete\/(\d+)/)[1])
  ipProtectionData = ipProtectionData.filter(item => item.id !== id)
  
  return successResponse
})

// 批量删除IP防护对象
Mock.mock(/\/api\/protection\/ip\/batch-delete/, 'delete', (options) => {
  const body = JSON.parse(options.body)
  const ids = body.ids || []
  
  if (ids.length > 0) {
    ipProtectionData = ipProtectionData.filter(item => !ids.includes(item.id))
  }
  
  return successResponse
})

// 启用IP防护对象
Mock.mock(/\/api\/protection\/ip\/enable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/enable\/(\d+)/)[1])
  const index = ipProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    ipProtectionData[index].status = 'active'
  }
  
  return successResponse
})

// 禁用IP防护对象
Mock.mock(/\/api\/protection\/ip\/disable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/disable\/(\d+)/)[1])
  const index = ipProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    ipProtectionData[index].status = 'inactive'
  }
  
  return successResponse
})

// 添加域名防护对象
Mock.mock(/\/api\/protection\/domain\/add/, 'post', (options) => {
  const body = JSON.parse(options.body)
  
  // 创建新记录
  const newItem = {
    id: getNewDomainProtectionId(),
    instanceId: body.instanceId,
    instanceName: getInstanceNameById(body.instanceId),
    customerName: `客户${Math.floor(Math.random() * 100)}`,
    publicIp: body.publicIp,
    addressType: body.addressType,
    domain: body.domain,
    cname: body.cname,
    protectionBandwidthType: body.protectionBandwidthType,
    dedicatedProtectionBandwidth: body.dedicatedProtectionBandwidth,
    instanceProtectionBandwidth: 500,
    businessBandwidthType: body.businessBandwidthType,
    dedicatedBusinessBandwidth: body.dedicatedBusinessBandwidth,
    instanceBusinessBandwidth: 200,
    businessQpsType: body.businessQpsType,
    dedicatedBusinessQps: body.dedicatedBusinessQps,
    instanceBusinessQps: 5000,
    protectionPackage: body.protectionPackage,
    accessType: body.accessType,
    status: 'active',
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  
  // 添加到数组
  domainProtectionData.unshift(newItem)
  
  return successResponse
})

// 更新域名防护对象
Mock.mock(/\/api\/protection\/domain\/update/, 'put', (options) => {
  const body = JSON.parse(options.body)
  const id = parseInt(body.id)
  
  // 查找要更新的记录
  const index = domainProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    // 更新记录
    domainProtectionData[index] = {
      ...domainProtectionData[index],
      instanceId: body.instanceId,
      instanceName: getInstanceNameById(body.instanceId),
      publicIp: body.publicIp,
      addressType: body.addressType,
      domain: body.domain,
      cname: body.cname,
      protectionBandwidthType: body.protectionBandwidthType,
      dedicatedProtectionBandwidth: body.dedicatedProtectionBandwidth,
      businessBandwidthType: body.businessBandwidthType,
      dedicatedBusinessBandwidth: body.dedicatedBusinessBandwidth,
      businessQpsType: body.businessQpsType,
      dedicatedBusinessQps: body.dedicatedBusinessQps,
      protectionPackage: body.protectionPackage,
      accessType: body.accessType,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    return successResponse
  } else {
    return {
      code: 404,
      message: '记录不存在',
      data: null
    }
  }
})

// 删除域名防护对象
Mock.mock(/\/api\/protection\/domain\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/delete\/(\d+)/)[1])
  
  // 查找要删除的记录
  const index = domainProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    // 删除记录
    domainProtectionData.splice(index, 1)
    
    return successResponse
  } else {
    return {
      code: 404,
      message: '记录不存在',
      data: null
    }
  }
})

// 批量删除域名防护对象
Mock.mock(/\/api\/protection\/domain\/batch-delete/, 'delete', (options) => {
  const body = JSON.parse(options.body)
  const ids = body.ids || []
  
  if (ids.length === 0) {
    return {
      code: 400,
      message: '请选择要删除的记录',
      data: null
    }
  }
  
  // 批量删除记录
  domainProtectionData = domainProtectionData.filter(item => !ids.includes(item.id))
  
  return successResponse
})

// 启用域名防护对象
Mock.mock(/\/api\/protection\/domain\/enable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/enable\/(\d+)/)[1])
  
  // 查找要启用的记录
  const index = domainProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    // 启用记录
    domainProtectionData[index].status = 'active'
    
    return successResponse
  } else {
    return {
      code: 404,
      message: '记录不存在',
      data: null
    }
  }
})

// 禁用域名防护对象
Mock.mock(/\/api\/protection\/domain\/disable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/disable\/(\d+)/)[1])
  
  // 查找要禁用的记录
  const index = domainProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    // 禁用记录
    domainProtectionData[index].status = 'inactive'
    
    return successResponse
  } else {
    return {
      code: 404,
      message: '记录不存在',
      data: null
    }
  }
})

// 获取IP防护对象详情
Mock.mock(/\/api\/protection\/ip\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/detail\/(\d+)/)[1])
  const item = ipProtectionData.find(item => item.id === id)
  
  if (item) {
    // 添加负载均衡配置信息
    const slbConfig = item.slbConfig || {
      scheduler: 'wrr',
      sessionTimeout: 300,
      healthCheck: 'TCP',
      insertToa: false,
      sessionResetEnabled: false,
      syslogIp: '',
      syslogPort: 514,
      members: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
        ip: `192.168.1.${10 + i}`,
        port: 80 + i * 100,
        weight: 10 + i * 5
      }))
    }
    
    // 添加安全配置信息
    const securityConfig = item.securityConfig || {
      icmp: {
        enabled: id % 2 === 0 // 随机设置ICMP禁用状态
      },
      blacklist: Array.from({ length: id % 5 }, (_, i) => ({
        ip: `192.168.${id}.${i + 1}`,
        addTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      })),
      whitelist: Array.from({ length: id % 3 }, (_, i) => ({
        ip: `10.0.${id}.${i + 1}`,
        addTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      })),
      blacklistExpireTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      regionBlock: [],
      rateLimit: {},
      reflection: {},
      fingerprint: {}
    }
    
    // 添加业务实例信息
    const instanceId = parseInt(item.instanceId.toString().replace(/\D/g, ''))
    const instanceInfo = {
      id: item.instanceId,
      customerName: item.customerName,
      addressType: item.addressType,
      protectionBandwidth: 500,
      businessBandwidth: 200,
      businessQps: 5000,
      allocatedProtectionBandwidth: Math.floor(Math.random() * 300), // 模拟已分配的防护带宽
      allocatedBusinessBandwidth: Math.floor(Math.random() * 100),   // 模拟已分配的业务带宽
      allocatedBusinessQps: Math.floor(Math.random() * 3000),        // 模拟已分配的业务QPS
      publicIpList: Array.from({ length: 5 }, (_, i) => {
        if (i % 2 === 0) {
          // IPv4
          return `203.0.113.${(instanceId * 10 + i) % 255 + 1}`
        } else {
          // IPv6
          const segments = []
          for (let j = 0; j < 8; j++) {
            segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
          }
          return segments.join(':')
        }
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        ...item,
        slbConfig,
        securityConfig,
        instanceInfo
      }
    }
  } else {
    return {
      code: 404,
      message: 'IP防护对象不存在',
      data: null
    }
  }
})

// 更新IP防护对象配置
Mock.mock('/api/protection/ip/config', 'put', (options) => {
  const body = JSON.parse(options.body)
  const id = body.id
  const index = ipProtectionData.findIndex(item => item.id === id)
  
  if (index !== -1) {
    // 更新基本配置
    if (body.publicIp) ipProtectionData[index].publicIp = body.publicIp
    if (body.protectionBandwidthType) ipProtectionData[index].protectionBandwidthType = body.protectionBandwidthType
    if (body.dedicatedProtectionBandwidth !== undefined) ipProtectionData[index].dedicatedProtectionBandwidth = body.dedicatedProtectionBandwidth
    if (body.businessBandwidthType) ipProtectionData[index].businessBandwidthType = body.businessBandwidthType
    if (body.dedicatedBusinessBandwidth !== undefined) ipProtectionData[index].dedicatedBusinessBandwidth = body.dedicatedBusinessBandwidth
    if (body.businessQpsType) ipProtectionData[index].businessQpsType = body.businessQpsType
    if (body.dedicatedBusinessQps !== undefined) ipProtectionData[index].dedicatedBusinessQps = body.dedicatedBusinessQps
    if (body.nearSourceSuppression !== undefined) ipProtectionData[index].nearSourceSuppression = body.nearSourceSuppression
    if (body.layer7Protection !== undefined) ipProtectionData[index].layer7Protection = body.layer7Protection
    
    // 更新负载均衡配置
    if (body.slbConfig) {
      ipProtectionData[index].slbConfig = body.slbConfig
    }
    
    // 更新安全配置
    if (body.securityConfig) {
      ipProtectionData[index].securityConfig = {
        ...(ipProtectionData[index].securityConfig || {}),
        ...body.securityConfig
      }
    }
    
    return {
      code: 200,
      message: 'success',
      data: null
    }
  } else {
    return {
      code: 404,
      message: 'IP防护对象不存在',
      data: null
    }
  }
}) 