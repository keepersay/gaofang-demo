import Mock from 'mockjs'
import { generateUUID } from '../utils/common'
import businessInstanceData from '../mock/data/businessInstance'

// 定义mock变量，用于控制是否启用模拟接口
const mock = true;

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
    'createTime': '@datetime("yyyy-MM-dd HH:mm:ss")',
    // 新增字段：IP组ID
    'protectionIpGroupId': function() {
      return generateUUID();
    },
    'protectionIpGroupInfo': function() {
      const addressTypes = ['IPv4', 'IPv6', 'dual'];
      const ipCount = this.id % 5 + 2;
      return `IP组 #${this.id % 10 + 1}（${this.instanceName}，${addressTypes[this.id % 3]}，${ipCount}个IP）`;
    }
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

// 模拟IP组数据
const generateIpGroupData = (instanceId) => {
  // 根据实例ID生成固定数量的IP组
  const instanceNumber = parseInt(instanceId.replace('BI', ''));
  // 生成1-2个IPv4组和1-2个IPv6组
  const ipv4GroupCount = (instanceNumber % 2) + 1; // 1-2个IPv4组
  const ipv6GroupCount = (instanceNumber % 2) + 1; // 1-2个IPv6组
  
  const groups = [];
  
  // 生成IPv4组
  for (let i = 0; i < ipv4GroupCount; i++) {
    const groupId = generateUUID();
    const addressType = 'IPv4';
    const instanceName = `业务实例-${instanceNumber % 10 || 1}`;
    
    // 生成IP列表
    const ips = [];
    const logicClusters = [
      { id: 'LC202407250001', name: '华东-电信-高级版' },
      { id: 'LC202407250002', name: '华南-联通-基础版' },
      { id: 'LC202407250003', name: '北京-电信-标准版' }
    ];
    
    // 为每个逻辑集群生成IPv4
    logicClusters.forEach(cluster => {
      // 生成IPv4
      const ipv4 = `203.0.113.${Math.floor(Math.random() * 254) + 1}`;
      ips.push({
        ip: ipv4,
        type: 'IPv4',
        logicClusterId: cluster.id,
        logicClusterName: cluster.name,
        status: 'active'
      });
    });
    
    // 添加IPv4组
    const ipCount = ips.length;
    groups.push({
      groupId,
      instanceId,
      addressType,
      ipCount,
      ips,
      status: 'active',
      firstIp: ips[0]?.ip || '',
      displayName: `IPv4组 #${i + 1}（${instanceName}，${ipCount}个IP）`
    });
  }
  
  // 生成IPv6组
  for (let i = 0; i < ipv6GroupCount; i++) {
    const groupId = generateUUID();
    const addressType = 'IPv6';
    const instanceName = `业务实例-${instanceNumber % 10 || 1}`;
    
    // 生成IP列表
    const ips = [];
    const logicClusters = [
      { id: 'LC202407250001', name: '华东-电信-高级版' },
      { id: 'LC202407250002', name: '华南-联通-基础版' },
      { id: 'LC202407250003', name: '北京-电信-标准版' }
    ];
    
    // 为每个逻辑集群生成IPv6
    logicClusters.forEach(cluster => {
      // 生成IPv6
      const segments = [];
      for (let j = 0; j < 8; j++) {
        segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
      }
      const ipv6 = segments.join(':');
      ips.push({
        ip: ipv6,
        type: 'IPv6',
        logicClusterId: cluster.id,
        logicClusterName: cluster.name,
        status: 'active'
      });
    });
    
    // 添加IPv6组
    const ipCount = ips.length;
    groups.push({
      groupId,
      instanceId,
      addressType,
      ipCount,
      ips,
      status: 'active',
      firstIp: ips[0]?.ip || '',
      displayName: `IPv6组 #${i + 1}（${instanceName}，${ipCount}个IP）`
    });
  }
  
  return groups;
};

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
  const instanceName = params.get('instanceName') || ''
  const addressType = params.get('addressType') || ''
  const status = params.get('status') || ''
  
  let filteredList = [...ipProtectionData]
  
  // 筛选
  if (publicIp) {
    filteredList = filteredList.filter(item => item.publicIp.includes(publicIp))
  }
  if (instanceId) {
    filteredList = filteredList.filter(item => item.instanceId.toString() === instanceId)
  }
  if (instanceName) {
    filteredList = filteredList.filter(item => item.instanceName.includes(instanceName))
  }
  if (addressType) {
    filteredList = filteredList.filter(item => item.addressType === addressType)
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

// 获取业务实例的IP组列表
Mock.mock(/\/api\/business-instance\/.*\/ip-groups/, 'get', (options) => {
  const instanceId = options.url.match(/\/api\/business-instance\/(.+?)\/ip-groups/)[1];
  
  // 生成该业务实例的IP组数据
  const ipGroups = generateIpGroupData(instanceId);
  
  return {
    code: 200,
    message: 'success',
    data: ipGroups
  };
});

// 获取IP组详情
Mock.mock(/\/api\/ip-group\/.*\/detail/, 'get', (options) => {
  const groupId = options.url.match(/\/api\/ip-group\/(.+?)\/detail/)[1];
  
  // 从所有业务实例中查找该IP组
  // 为了简化，这里直接生成一个IP组
  const instanceId = `BI${10000 + Math.floor(Math.random() * 10) + 1}`;
  const groups = generateIpGroupData(instanceId);
  const group = groups[0];
  group.groupId = groupId;
  
  return {
    code: 200,
    message: 'success',
    data: group
  };
});

// 添加IP防护对象
Mock.mock('/api/protection/ip/add', 'post', (options) => {
  const body = JSON.parse(options.body)
  
  // 创建新对象
  const newId = getNewIpProtectionId()
  const newItem = {
    id: newId,
    ...body,
    createTime: new Date().toISOString()
  }
  
  // 如果没有设置客户名称，根据业务实例ID设置
  if (!newItem.customerName && newItem.instanceId) {
    // 模拟根据业务实例ID获取客户名称
    const customerNames = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司']
    newItem.customerName = customerNames[newItem.instanceId % customerNames.length]
  }
  
  // 如果没有设置业务实例名称，根据业务实例ID设置
  if (!newItem.instanceName && newItem.instanceId) {
    newItem.instanceName = getInstanceNameById(newItem.instanceId)
  }
  
  // 添加到数据列表
  ipProtectionData.unshift(newItem)
  
  return {
    code: 200,
    message: 'success',
    data: newItem
  }
})

// 更新IP防护对象
Mock.mock('/api/protection/ip/update', 'put', (options) => {
  const body = JSON.parse(options.body)
  const id = body.id
  
  // 查找对象
  const index = ipProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  // 更新对象
  ipProtectionData[index] = {
    ...ipProtectionData[index],
    ...body
  }
  
  return {
    code: 200,
    message: 'success',
    data: ipProtectionData[index]
  }
})

// 删除IP防护对象
Mock.mock(/\/api\/protection\/ip\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/delete\/(\d+)/)[1])
  
  // 查找对象
  const index = ipProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  // 删除对象
  ipProtectionData.splice(index, 1)
  
  return {
    code: 200,
    message: 'success'
  }
})

// 批量删除IP防护对象
Mock.mock('/api/protection/ip/batch-delete', 'delete', (options) => {
  const { ids } = JSON.parse(options.body)
  
  // 批量删除
  ipProtectionData = ipProtectionData.filter(item => !ids.includes(item.id))
  
  return {
    code: 200,
    message: 'success'
  }
})

// 启用IP防护对象
Mock.mock(/\/api\/protection\/ip\/enable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/enable\/(\d+)/)[1])
  
  // 查找对象
  const index = ipProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  // 更新状态
  ipProtectionData[index].status = 'active'
  
  return {
    code: 200,
    message: 'success',
    data: ipProtectionData[index]
  }
})

// 禁用IP防护对象
Mock.mock(/\/api\/protection\/ip\/disable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/disable\/(\d+)/)[1])
  
  // 查找对象
  const index = ipProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  // 更新状态
  ipProtectionData[index].status = 'inactive'
  
  return {
    code: 200,
    message: 'success',
    data: ipProtectionData[index]
  }
})

// 获取IP防护对象详情
Mock.mock(/\/api\/protection\/ip\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/detail\/(\d+)/)[1])
  
  // 查找对象
  const item = ipProtectionData.find(item => item.id === id)
  if (!item) {
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  // 添加instanceId字段，用于获取防护IP组列表
  const detailData = {
    ...item,
    // 将原来的publicIp字段改为protectionIpGroupId
    protectionIpGroupId: item.protectionIpGroupId || item.publicIp
  }
  
  return {
    code: 200,
    message: 'success',
    data: detailData
  }
})

// 更新IP防护对象配置
Mock.mock('/api/protection/ip/config', 'put', (options) => {
  const body = JSON.parse(options.body)
  const id = body.id
  
  // 查找对象
  const index = ipProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  // 处理protectionIpGroupId字段
  if (body.protectionIpGroupId) {
    // 如果传入了protectionIpGroupId，则更新对应的字段
    ipProtectionData[index].protectionIpGroupId = body.protectionIpGroupId
    
    // 同时更新protectionIpGroupInfo字段
    const ipGroup = body.protectionIpGroupId
    ipProtectionData[index].protectionIpGroupInfo = `防护IP组 #${ipGroup.slice(-5)}`
  }
  
  // 更新配置
  ipProtectionData[index] = {
    ...ipProtectionData[index],
    ...body
  }
  
  return {
    code: 200,
    message: 'success',
    data: ipProtectionData[index]
  }
})

// 添加域名防护对象
Mock.mock('/api/protection/domain/add', 'post', (options) => {
  const body = JSON.parse(options.body)
  
  // 创建新对象
  const newId = getNewDomainProtectionId()
  const newItem = {
    id: newId,
    ...body,
    createTime: new Date().toISOString()
  }
  
  // 如果没有设置客户名称，根据业务实例ID设置
  if (!newItem.customerName && newItem.instanceId) {
    // 模拟根据业务实例ID获取客户名称
    const customerNames = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司']
    newItem.customerName = customerNames[newItem.instanceId % customerNames.length]
  }
  
  // 如果没有设置业务实例名称，根据业务实例ID设置
  if (!newItem.instanceName && newItem.instanceId) {
    newItem.instanceName = getInstanceNameById(newItem.instanceId)
  }
  
  // 添加到数据列表
  domainProtectionData.unshift(newItem)
  
  return {
    code: 200,
    message: 'success',
    data: newItem
  }
})

// 更新域名防护对象
Mock.mock('/api/protection/domain/update', 'put', (options) => {
  const body = JSON.parse(options.body)
  const id = body.id
  
  // 查找对象
  const index = domainProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  // 更新对象
  domainProtectionData[index] = {
    ...domainProtectionData[index],
    ...body
  }
  
  return {
    code: 200,
    message: 'success',
    data: domainProtectionData[index]
  }
})

// 删除域名防护对象
Mock.mock(/\/api\/protection\/domain\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/delete\/(\d+)/)[1])
  
  // 查找对象
  const index = domainProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  // 删除对象
  domainProtectionData.splice(index, 1)
  
  return {
    code: 200,
    message: 'success'
  }
})

// 批量删除域名防护对象
Mock.mock('/api/protection/domain/batch-delete', 'delete', (options) => {
  const { ids } = JSON.parse(options.body)
  
  // 批量删除
  domainProtectionData = domainProtectionData.filter(item => !ids.includes(item.id))
  
  return {
    code: 200,
    message: 'success'
  }
})

// 启用域名防护对象
Mock.mock(/\/api\/protection\/domain\/enable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/enable\/(\d+)/)[1])
  
  // 查找对象
  const index = domainProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  // 更新状态
  domainProtectionData[index].status = 'active'
  
  return {
    code: 200,
    message: 'success',
    data: domainProtectionData[index]
  }
})

// 禁用域名防护对象
Mock.mock(/\/api\/protection\/domain\/disable\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/disable\/(\d+)/)[1])
  
  // 查找对象
  const index = domainProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  // 更新状态
  domainProtectionData[index].status = 'inactive'
  
  return {
    code: 200,
    message: 'success',
    data: domainProtectionData[index]
  }
})

// 获取业务实例选项
Mock.mock('/api/business-instance/options', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: businessInstanceOptions.data
  }
})

// 模拟接口：获取业务实例的IP组列表
if (mock) {
  Mock.mock(new RegExp('/api/business-instance/\\w+/ip-groups'), 'get', (options) => {
    const instanceId = options.url.match(/\/api\/business-instance\/(\w+)\/ip-groups/)[1]
    
    // 获取业务实例
    const instance = businessInstanceData.getBusinessInstance(instanceId)
    if (!instance) {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
    
    // 返回IP组数据
    return {
      code: 200,
      data: instance.protectionIpGroups || [],
      message: 'success'
    }
  })
}

// 模拟接口：获取业务实例已分配的防护IP组
if (mock) {
  Mock.mock(new RegExp('/api/business-instance/\\w+/allocated-ip-groups'), 'get', (options) => {
    const instanceId = options.url.match(/\/api\/business-instance\/(\w+)\/allocated-ip-groups/)[1]
    
    // 获取业务实例
    const instance = businessInstanceData.getBusinessInstance(instanceId)
    if (!instance) {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
    
    // 返回已分配的IP组数据
    return {
      code: 200,
      data: instance.protectionIpGroups || [],
      message: 'success'
    }
  })
}

// 模拟接口：获取IP组详情
if (mock) {
  // ... existing code ...
} 