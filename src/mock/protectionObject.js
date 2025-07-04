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
    'protectionIpGroupId': function() {
      return generateUUID();
    },
    'protectionIpGroupInfo': function() {
      const addressTypes = ['IPv4', 'IPv6', 'dual'];
      const ipCount = this.id % 5 + 2;
      return `${this.addressType}防护组 #${this.id % 10 + 1}（${this.instanceName}，${ipCount}个IP）`;
    },
    'addressType': function() {
      return this.id % 3 === 0 ? 'IPv6' : 'IPv4';
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
  
  // 验证必填字段
  const requiredFields = ['instanceId', 'protectionIpGroupId', 'domain', 'businessQpsType', 'protectionPackage'];
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!body[field]) {
      errors[field] = [`${field}字段不能为空`];
    }
  });
  
  // 验证域名格式
  if (body.domain && !/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/.test(body.domain)) {
    errors.domain = errors.domain || [];
    errors.domain.push('域名格式不正确，请输入有效的域名格式，如example.com');
  }
  
  // 如果有错误，返回错误信息
  if (Object.keys(errors).length > 0) {
    return {
      code: 400,
      message: '表单验证失败',
      errors: errors
    };
  }
  
  // 创建新对象
  const newId = getNewDomainProtectionId()
  
  // 确保instanceId格式正确
  const instanceId = body.instanceId.toString().startsWith('BI') 
    ? body.instanceId 
    : `BI${body.instanceId}`;
  
  const newItem = {
    id: newId,
    ...body,
    instanceId: instanceId, // 使用格式化后的instanceId
    status: 'active', // 设置默认状态为启用
    createTime: new Date().toISOString()
  }
  
  // 如果没有设置客户名称，根据业务实例ID设置
  if (!newItem.customerName && newItem.instanceId) {
    // 模拟根据业务实例ID获取客户名称
    const customerNames = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司']
    newItem.customerName = customerNames[newItem.instanceId.replace('BI', '') % customerNames.length]
  }
  
  // 如果没有设置业务实例名称，根据业务实例ID设置
  if (!newItem.instanceName && newItem.instanceId) {
    newItem.instanceName = getInstanceNameById(newItem.instanceId)
  }
  
  // 添加防护IP组信息
  if (newItem.protectionIpGroupId) {
    // 检查是否是来自业务实例选项的ID
    const isFromOptions = businessInstanceOptions.data.some(option => option.value === instanceId);
    
    if (isFromOptions) {
      // 对于来自业务实例选项的ID，直接使用IP组ID的后5位作为显示名称
      newItem.protectionIpGroupInfo = `${newItem.addressType}防护组 #${newItem.protectionIpGroupId.slice(-5)}`;
    } else {
      // 从业务实例中获取IP组信息
      const instance = businessInstanceData.getBusinessInstance(newItem.instanceId)
      if (instance && instance.protectionIpGroups) {
        const ipGroup = instance.protectionIpGroups.find(group => group.groupId === newItem.protectionIpGroupId)
        if (ipGroup) {
          newItem.protectionIpGroupInfo = ipGroup.displayName
        } else {
          newItem.protectionIpGroupInfo = `${newItem.addressType}防护组 #${newItem.protectionIpGroupId.slice(-5)}`
        }
      } else {
        newItem.protectionIpGroupInfo = `${newItem.addressType}防护组 #${newItem.protectionIpGroupId.slice(-5)}`
      }
    }
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
  
  // 确保instanceId格式正确
  if (body.instanceId) {
    body.instanceId = body.instanceId.toString().startsWith('BI') 
      ? body.instanceId 
      : `BI${body.instanceId}`;
  }
  
  // 更新防护IP组信息
  if (body.protectionIpGroupId && body.protectionIpGroupId !== domainProtectionData[index].protectionIpGroupId) {
    const instanceId = body.instanceId || domainProtectionData[index].instanceId;
    
    // 检查是否是来自业务实例选项的ID
    const isFromOptions = businessInstanceOptions.data.some(option => option.value === instanceId);
    
    if (isFromOptions) {
      // 对于来自业务实例选项的ID，直接使用IP组ID的后5位作为显示名称
      const addressType = body.addressType || domainProtectionData[index].addressType || 'IP';
      body.protectionIpGroupInfo = `${addressType}防护组 #${body.protectionIpGroupId.slice(-5)}`;
    } else {
      // 从业务实例中获取IP组信息
      const instance = businessInstanceData.getBusinessInstance(instanceId)
      if (instance && instance.protectionIpGroups) {
        const ipGroup = instance.protectionIpGroups.find(group => group.groupId === body.protectionIpGroupId)
        if (ipGroup) {
          body.protectionIpGroupInfo = ipGroup.displayName
        } else {
          const addressType = body.addressType || domainProtectionData[index].addressType || 'IP';
          body.protectionIpGroupInfo = `${addressType}防护组 #${body.protectionIpGroupId.slice(-5)}`
        }
      } else {
        const addressType = body.addressType || domainProtectionData[index].addressType || 'IP';
        body.protectionIpGroupInfo = `${addressType}防护组 #${body.protectionIpGroupId.slice(-5)}`
      }
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

// 模拟接口：获取业务实例已分配的防护IP组
if (mock) {
  Mock.mock(new RegExp('/api/business-instance/\\w+/allocated-ip-groups'), 'get', (options) => {
    const instanceId = options.url.match(/\/api\/business-instance\/(\w+)\/allocated-ip-groups/)[1]
    console.log('获取业务实例已分配的防护IP组，业务实例ID:', instanceId);
    
    // 确保instanceId格式正确
    const formattedInstanceId = instanceId.toString().startsWith('BI') 
      ? instanceId 
      : `BI${instanceId}`;
    
    console.log('格式化后的业务实例ID:', formattedInstanceId);
    
    // 如果是BI10002，直接返回固定的IP组数据
    if (formattedInstanceId === 'BI10002') {
      console.log('返回BI10002的固定IP组数据');
      const fixedGroups = [
        {
          groupId: '8f7e6d5c-4b3a-2c1d-0e9f-8a7b6c5d4e3f',
          addressType: 'IPv4',
          displayName: 'IPv4防护组 #1（业务实例-特殊测试）',
          ips: [
            {
              ip: '203.0.113.10',
              type: 'IPv4',
              logicClusterId: 'LC202407250001',
              logicClusterName: '华东-电信-高级版',
              status: 'active'
            }
          ]
        },
        {
          groupId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          addressType: 'IPv6',
          displayName: 'IPv6防护组 #1（业务实例-特殊测试）',
          ips: [
            {
              ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
              type: 'IPv6',
              logicClusterId: 'LC202407250001',
              logicClusterName: '华东-电信-高级版',
              status: 'active'
            }
          ]
        }
      ];
      
      return {
        code: 200,
        data: fixedGroups,
        message: 'success'
      };
    }
    
    // 检查是否是来自业务实例选项的ID
    const isFromOptions = businessInstanceOptions.data.some(option => option.value === formattedInstanceId);
    
    if (isFromOptions) {
      console.log(`ID ${formattedInstanceId} 来自业务实例选项，生成模拟数据`);
      // 为业务实例选项生成模拟数据
      const mockGroups = [];
      const instanceNumber = parseInt(formattedInstanceId.replace('BI', ''));
      
      // 生成IPv4组
      mockGroups.push({
        groupId: generateUUID(),
        addressType: 'IPv4',
        displayName: `IPv4防护组 #1（业务实例-${instanceNumber % 10 || 1}）`,
        ips: [
          {
            ip: `203.0.113.${instanceNumber % 255 + 1}`,
            type: 'IPv4',
            logicClusterId: 'LC202407250001',
            logicClusterName: '华东-电信-高级版',
            status: 'active'
          }
        ]
      });
      
      // 生成IPv6组
      mockGroups.push({
        groupId: generateUUID(),
        addressType: 'IPv6',
        displayName: `IPv6防护组 #1（业务实例-${instanceNumber % 10 || 1}）`,
        ips: [
          {
            ip: (() => {
              const segments = [];
              for (let j = 0; j < 8; j++) {
                segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
              }
              return segments.join(':');
            })(),
            type: 'IPv6',
            logicClusterId: 'LC202407250001',
            logicClusterName: '华东-电信-高级版',
            status: 'active'
          }
        ]
      });
      
      return {
        code: 200,
        data: mockGroups,
        message: 'success'
      };
    }
    
    // 获取业务实例
    const instance = businessInstanceData.getBusinessInstance(formattedInstanceId)
    if (!instance) {
      console.error(`业务实例不存在: ${formattedInstanceId}`);
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
    
    // 确保有防护IP组数据
    if (!instance.protectionIpGroups || instance.protectionIpGroups.length === 0) {
      // 生成一些默认的IP组数据
      const defaultGroups = [];
      const addressTypes = ['IPv4', 'IPv6'];
      
      addressTypes.forEach((type, index) => {
        defaultGroups.push({
          groupId: generateUUID(),
          addressType: type,
          displayName: `${type}防护组 #${index + 1}（${instance.instanceName}）`,
          ips: []
        });
      });
      
      console.log(`为业务实例 ${formattedInstanceId} 生成了默认IP组数据`);
      return {
        code: 200,
        data: defaultGroups,
        message: 'success'
      }
    }
    
    // 返回已分配的IP组数据
    console.log(`成功获取业务实例 ${formattedInstanceId} 的IP组数据，共 ${instance.protectionIpGroups.length} 条`);
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