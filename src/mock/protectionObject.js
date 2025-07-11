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
    'ipv4GroupId': function() {
      // 偶数ID有IPv4组
      return this.id % 2 === 0 ? generateUUID() : '';
    },
    'ipv6GroupId': function() {
      // 3的倍数ID有IPv6组
      return this.id % 3 === 0 ? generateUUID() : '';
    },
    'protectionIpGroupInfo': function() {
      const ipCount = this.id % 5 + 2;
      return `${this.addressType}防护组 #${this.id % 10 + 1}（${this.instanceName}，${ipCount}个IP）`;
    },
    'addressType': function() {
      // 同时有IPv4和IPv6组的是双栈
      if (this.ipv4GroupId && this.ipv6GroupId) {
        return '双栈';
      } else if (this.ipv4GroupId) {
        return 'IPv4';
      } else if (this.ipv6GroupId) {
        return 'IPv6';
      }
      // 默认为IPv4
      return 'IPv4';
    },
    'domain': function() {
      return `example${this.id}.com`
    },
    'cname': function() {
      return `${this.domain}.vmdat.com`
    },
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
const businessInstanceOptions = {
  code: 200,
  message: 'success',
  data: Array.from({ length: 8 }, (_, i) => ({
    value: `BI${10001 + i}`,  // 添加BI前缀
    label: `业务实例-${i + 1}`
  }))
}

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
  
  if (params.protectionIpGroupInfo) {
    filteredData = filteredData.filter(item => 
      item.protectionIpGroupInfo && item.protectionIpGroupInfo.toLowerCase().includes(params.protectionIpGroupInfo.toLowerCase())
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
Mock.mock(new RegExp('/api/business-instance/\\w+/ip-groups'), 'get', (options) => {
  const instanceId = options.url.match(/\/api\/business-instance\/(\w+)\/ip-groups/)[1]
  
  // 确保instanceId格式正确
  const formattedInstanceId = instanceId.toString().startsWith('BI') 
    ? instanceId 
    : `BI${instanceId}`;
  
  // 获取业务实例
  const instance = businessInstanceData.getBusinessInstance(formattedInstanceId)
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

// 获取IP防护对象详情
Mock.mock(/\/api\/protection\/ip\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/ip\/detail\/(\d+)/)[1])
  console.log(`获取IP防护对象详情，ID: ${id}`);
  
  // 查找对象
  const item = ipProtectionData.find(item => item.id === id)
  if (!item) {
    console.error(`IP防护对象不存在，ID: ${id}`);
    return {
      code: 404,
      message: 'IP防护对象不存在'
    }
  }
  
  console.log(`找到IP防护对象，ID: ${id}，业务实例ID: ${item.instanceId}`);
  
  // 确保实例ID为BI10002（为了测试）
  const instanceId = 'BI10002';
  
  // 添加instanceId字段，用于获取防护IP组列表
  const detailData = {
    ...item,
    // 确保有instanceId字段
    instanceId: instanceId,
    // 将原来的publicIp字段改为protectionIpGroupId
    protectionIpGroupId: item.protectionIpGroupId || item.publicIp
  }
  
  console.log(`返回IP防护对象详情，业务实例ID: ${detailData.instanceId}`);
  
  return {
    code: 200,
    message: 'success',
    data: detailData
  }
})

// 获取域名防护对象详情
Mock.mock(/\/api\/protection\/domain\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/(\d+)/)[1])
  console.log(`获取域名防护对象详情，ID: ${id}`);
  
  // 查找对象
  const item = domainProtectionData.find(item => item.id === id)
  if (!item) {
    console.error(`域名防护对象不存在，ID: ${id}`);
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  console.log(`找到域名防护对象，ID: ${id}，业务实例ID: ${item.instanceId}`);
  
  // 确保有IPv4和IPv6组ID
  const ipv4GroupId = item.ipv4GroupId || (item.addressType === 'IPv4' || item.addressType === '双栈' ? generateUUID() : '');
  const ipv6GroupId = item.ipv6GroupId || (item.addressType === 'IPv6' || item.addressType === '双栈' ? generateUUID() : '');
  
  // 确定地址类型
  let addressType = item.addressType || 'IPv4';
  if (ipv4GroupId && ipv6GroupId) {
    addressType = '双栈';
  } else if (ipv4GroupId) {
    addressType = 'IPv4';
  } else if (ipv6GroupId) {
    addressType = 'IPv6';
  }
  
  // 添加实例信息和负载均衡配置
  const detailData = {
    ...item,
    ipv4GroupId,
    ipv6GroupId,
    addressType,
    instanceInfo: {
      customerName: item.customerName,
      businessQps: item.instanceBusinessQps,
      allocatedBusinessQps: item.instanceBusinessQps * 0.6, // 模拟已分配60%
      currentBusinessQps: item.businessQpsType === 'dedicated' ? item.dedicatedBusinessQps : 0
    },
    slbConfig: {
      scheduler: 'wrr',
      sessionTimeout: 300,
      healthCheck: 'TCP',
      members: [
        {
          ip: '192.168.1.100',
          port: 80,
          weight: 10
        },
        {
          ip: '192.168.1.101',
          port: 80,
          weight: 20
        }
      ]
    }
  }
  
  return {
    code: 200,
    message: 'success',
    data: detailData
  }
})

// 更新域名防护对象配置
Mock.mock('/api/protection/domain/config', 'put', (options) => {
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
  
  // 确定地址类型
  let addressType = '';
  if (body.ipv4GroupId && body.ipv6GroupId) {
    addressType = '双栈';
  } else if (body.ipv4GroupId) {
    addressType = 'IPv4';
  } else if (body.ipv6GroupId) {
    addressType = 'IPv6';
  }
  
  // 更新对象
  const oldItem = domainProtectionData[index]
  const updatedItem = {
    ...oldItem,
    ipv4GroupId: body.ipv4GroupId || '',
    ipv6GroupId: body.ipv6GroupId || '',
    addressType: addressType || oldItem.addressType,
    domain: body.domain || oldItem.domain,
    businessQpsType: body.businessQpsType || oldItem.businessQpsType,
    dedicatedBusinessQps: body.dedicatedBusinessQps || oldItem.dedicatedBusinessQps,
    protectionPackage: body.protectionPackage || oldItem.protectionPackage
  }
  
  // 替换对象
  domainProtectionData[index] = updatedItem
  
  return {
    code: 200,
    message: 'success',
    data: updatedItem
  }
})

// 添加IP防护对象
Mock.mock('/api/protection/ip/add', 'post', (options) => {
  const body = JSON.parse(options.body)
  
  // 创建新对象
  const newId = getNewIpProtectionId()
  
  // 确保instanceId格式正确
  const instanceId = body.instanceId.toString().startsWith('BI') 
    ? body.instanceId 
    : `BI${body.instanceId}`;
  
  // 获取业务实例名称
  const instanceName = getInstanceNameById(instanceId);
  
  // 获取客户名称
  let customerName = '';
  const instance = businessInstanceData.getBusinessInstance(instanceId);
  if (instance) {
    customerName = instance.customerName;
  } else {
    // 如果找不到实例，使用默认客户名称
    const customerNames = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司'];
    customerName = customerNames[parseInt(instanceId.replace('BI', '')) % customerNames.length];
  }
  
  // 生成防护IP组信息
  let protectionIpGroupInfo = '';
  if (body.protectionIpGroupId) {
    protectionIpGroupInfo = `防护IP组 #${body.protectionIpGroupId.slice(-5)}（${instanceName}）`;
  }
  
  const newItem = {
    id: newId,
    ...body,
    // 确保有业务实例ID和名称
    instanceId: instanceId,
    instanceName: instanceName,
    customerName: customerName,
    // 设置防护IP组信息
    protectionIpGroupInfo: protectionIpGroupInfo,
    // 设置默认状态
    status: 'active',
    createTime: new Date().toISOString()
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
  
  // 确保instanceId格式正确
  const instanceId = body.instanceId.toString().startsWith('BI') 
    ? body.instanceId 
    : `BI${body.instanceId}`;
  
  // 获取业务实例名称
  const instanceName = getInstanceNameById(instanceId);
  
  // 获取客户名称
  let customerName = '';
  const instance = businessInstanceData.getBusinessInstance(instanceId);
  if (instance) {
    customerName = instance.customerName;
  } else {
    // 如果找不到实例，使用默认客户名称
    const customerNames = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司'];
    customerName = customerNames[parseInt(instanceId.replace('BI', '')) % customerNames.length];
  }
  
  const newItem = {
    id: newId,
    ...body,
    // 确保有业务实例ID和名称
    instanceId: instanceId,
    instanceName: instanceName,
    customerName: customerName,
    // 确保有地址类型
    addressType: body.addressType || (body.ipv4GroupId && body.ipv6GroupId ? '双栈' : (body.ipv4GroupId ? 'IPv4' : 'IPv6')),
    // 生成CNAME
    cname: body.domain ? `${body.domain}.vmdat.com` : '',
    // 设置默认状态
    status: 'active',
    createTime: new Date().toISOString()
  }
  
  // 生成防护IP组信息
  let protectionIpGroupInfo = '';
  if (body.ipv4GroupId && body.ipv6GroupId) {
    protectionIpGroupInfo = `双栈防护组（${instanceName}，IPv4+IPv6）`;
  } else if (body.ipv4GroupId) {
    protectionIpGroupInfo = `IPv4防护组 #${body.ipv4GroupId.slice(-5)}（${instanceName}）`;
  } else if (body.ipv6GroupId) {
    protectionIpGroupInfo = `IPv6防护组 #${body.ipv6GroupId.slice(-5)}（${instanceName}）`;
  }
  newItem.protectionIpGroupInfo = protectionIpGroupInfo;
  
  // 添加到列表
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
  
  // 确定地址类型
  let addressType = '';
  if (body.ipv4GroupId && body.ipv6GroupId) {
    addressType = '双栈';
  } else if (body.ipv4GroupId) {
    addressType = 'IPv4';
  } else if (body.ipv6GroupId) {
    addressType = 'IPv6';
  } else {
    addressType = domainProtectionData[index].addressType || 'IPv4';
  }
  
  // 更新对象
  const oldItem = domainProtectionData[index]
  const updatedItem = {
    ...oldItem,
    instanceId: body.instanceId || oldItem.instanceId,
    accessType: body.accessType || oldItem.accessType,
    ipv4GroupId: body.ipv4GroupId !== undefined ? body.ipv4GroupId : oldItem.ipv4GroupId,
    ipv6GroupId: body.ipv6GroupId !== undefined ? body.ipv6GroupId : oldItem.ipv6GroupId,
    addressType: addressType,
    domain: body.domain || oldItem.domain,
    cname: body.domain ? `${body.domain}.vmdat.com` : oldItem.cname,
    businessQpsType: body.businessQpsType || oldItem.businessQpsType,
    dedicatedBusinessQps: body.dedicatedBusinessQps || oldItem.dedicatedBusinessQps,
    protectionPackage: body.protectionPackage || oldItem.protectionPackage
  }
  
  // 替换对象
  domainProtectionData[index] = updatedItem
  
  return {
    code: 200,
    message: 'success',
    data: updatedItem
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

// 获取业务实例已分配的防护IP组
Mock.mock(new RegExp('/api/business-instance/\\w+/allocated-ip-groups'), 'get', (options) => {
  const instanceId = options.url.match(/\/api\/business-instance\/(\w+)\/allocated-ip-groups/)[1]
  
  // 确保instanceId格式正确
  const formattedInstanceId = instanceId.toString().startsWith('BI') 
    ? instanceId 
    : `BI${instanceId}`;
  
  // 生成IP组数据
  const groups = generateIpGroupData(formattedInstanceId);
  
  // 确保每个IP组都有addressType属性
  const enhancedGroups = groups.map(group => ({
    ...group,
    addressType: group.addressType || (group.displayName.includes('IPv4') ? 'IPv4' : 'IPv6')
  }));
  
  return {
    code: 200,
    message: 'success',
    data: enhancedGroups
  }
})

// 模拟接口：获取IP组详情
if (mock) {
  Mock.mock(new RegExp('/api/ip-group/\\w+'), 'get', (options) => {
    const groupId = options.url.match(/\/api\/ip-group\/(\w+)/)[1]
    
    // 模拟IP组详情
    return {
      code: 200,
      message: 'success',
      data: {
        groupId,
        addressType: groupId.includes('ipv6') ? 'IPv6' : 'IPv4',
        ipCount: Math.floor(Math.random() * 5) + 1,
        ips: Array(Math.floor(Math.random() * 5) + 1).fill().map(() => {
          if (groupId.includes('ipv6')) {
            // 生成IPv6
            const segments = []
            for (let j = 0; j < 8; j++) {
              segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
            }
            return {
              ip: segments.join(':'),
              type: 'IPv6',
              status: 'active'
            }
          } else {
            // 生成IPv4
            return {
              ip: `203.0.113.${Math.floor(Math.random() * 254) + 1}`,
              type: 'IPv4',
              status: 'active'
            }
          }
        })
      }
    }
  })
}

// 获取域名防护对象安全配置
Mock.mock(new RegExp('/api/protection/domain/\\d+/security-config'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/protection\/domain\/(\d+)\/security-config/)[1])
  
  // 查找域名防护对象
  const domainProtection = domainProtectionData.find(item => item.id === id)
  if (!domainProtection) {
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  // 如果已有安全配置，返回现有配置
  if (domainProtection.securityConfig) {
    return {
      code: 200,
      message: 'success',
      data: {
        id: domainProtection.id,
        domainName: domainProtection.domain,
        securityConfig: domainProtection.securityConfig
      }
    }
  }
  
  // 否则生成默认安全配置
  const defaultSecurityConfig = {
    highDefense: {
      enabled: true,
      level: 'medium',
      mode: 'detect',
      rules: [
        { ruleId: '1070020113', enabled: true },
        { ruleId: '1010010020', enabled: true },
        { ruleId: '1060050015', enabled: true },
        { ruleId: '1040010673', enabled: true },
        { ruleId: '1040010336', enabled: true },
        { ruleId: '1050010011', enabled: true },
        { ruleId: '1080030112', enabled: true },
        { ruleId: '1050010042', enabled: true }
      ]
    },
    ccProtection: {
      enabled: id % 2 === 0, // 偶数ID默认启用
      mode: 'normal',
      qpsThreshold: 100,
      statisticsPeriod: 10,
      blockDuration: 300,
      action: 'block',
      urlRules: [
        {
          url: '/login',
          qpsThreshold: 20,
          action: 'captcha',
          enabled: true
        },
        {
          url: '/api/*',
          qpsThreshold: 50,
          action: 'block',
          enabled: true
        }
      ],
      whitelist: [
        {
          ip: '192.168.1.1',
          comment: '内部测试IP'
        },
        {
          ip: '10.0.0.0/8',
          comment: '内网IP段'
        }
      ]
    },
    botProtection: {
      enabled: false
    },
    scanProtection: {
      enabled: false
    },
    regionBlock: {
      enabled: false
    },
    requestCompliance: {
      enabled: false
    },
    cookieProtection: {
      enabled: false
    },
    customRules: {
      enabled: false
    },
    infoLeakage: {
      enabled: false
    }
  }
  
  // 保存默认配置到对象中
  domainProtection.securityConfig = defaultSecurityConfig
  
  return {
    code: 200,
    message: 'success',
    data: {
      id: domainProtection.id,
      domainName: domainProtection.domain,
      securityConfig: defaultSecurityConfig
    }
  }
})

// 更新域名防护对象安全配置
Mock.mock(new RegExp('/api/protection/domain/\\d+/security-config'), 'put', (options) => {
  const body = JSON.parse(options.body)
  const id = body.id
  
  // 查找域名防护对象
  const index = domainProtectionData.findIndex(item => item.id === id)
  if (index === -1) {
    return {
      code: 404,
      message: '域名防护对象不存在'
    }
  }
  
  // 更新安全配置
  domainProtectionData[index].securityConfig = body.securityConfig
  
  return {
    code: 200,
    message: 'success',
    data: {
      id: domainProtectionData[index].id,
      domainName: domainProtectionData[index].domain,
      securityConfig: domainProtectionData[index].securityConfig
    }
  }
})

export default {
  mock
} 