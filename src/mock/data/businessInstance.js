import { Random } from 'mockjs'
import { generateUUID } from '../../utils/common'

// 生成模拟业务实例数据
const businessInstances = []
const customerNames = ['北京科技有限公司', '上海网络科技有限公司', '广州信息技术有限公司', '深圳互联网有限公司', '杭州数字科技有限公司']
const regions = ['cn-beijing', 'cn-shanghai', 'cn-guangzhou', 'cn-hangzhou', 'cn-shenzhen']
const addressTypes = ['IPv4', 'IPv6', 'dual']
const statuses = ['active', 'inactive']
const orderIds = Array.from({ length: 20 }, () => 'ORD' + Random.natural(10000, 99999))

// 生成IP地址
function generateIPv4() {
  return `203.0.113.${Random.natural(1, 254)}`
}

function generateIPv6() {
  const segments = []
  for (let i = 0; i < 8; i++) {
    segments.push(Random.hex(4))
  }
  return segments.join(':')
}

// 定义逻辑集群组ID映射，确保集群类型匹配
const clusterGroupIdsByType = {
  // 主备类型的逻辑集群组
  standby: [
    'LCG7503281108201961885', // 上海电信集群组
    'LCG7503281108201961886', // 北京电信集群组
    'LCG7503281108201961888', // 广州联通集群组
    'LCG7503281108201961890', // 无锡备用集群组
    'LCG7503281108201961894'  // 韩国业务集群组
  ],
  // 分布式类型的逻辑集群组
  distributed: [
    'LCG7503281108201961887', // 国际分布式集群组
    'LCG7503281108201961889'  // 北美分布式集群组
  ],
  // Anycast类型的逻辑集群组
  anycast: [
    'LCG7503281108201961892'  // 欧洲多节点集群组
  ]
};

// 生成30条业务实例数据
for (let i = 0; i < 30; i++) {
  // 套餐名称及对应的集群类型
  const packageTypes = [
    { name: 'DDOS防护', clusterType: 'standby' },
    { name: 'WAF标准防护', clusterType: 'distributed' },
    { name: 'WAF增强防护', clusterType: 'anycast' }
  ]
  
  // 随机选择套餐和集群类型
  const packageInfo = Random.pick(packageTypes)
  const packageName = packageInfo.name
  const clusterType = packageInfo.clusterType
  
  // 根据集群类型选择匹配的逻辑集群组ID
  const matchingClusterGroupIds = clusterGroupIdsByType[clusterType];
  const clusterGroupId = Random.pick(matchingClusterGroupIds);
  
  const addressType = Random.pick(addressTypes)
  const regionId = clusterType === 'anycast' ? '' : Random.pick(regions)
  const protectionIpCount = Random.natural(1, 10)
  
  // 生成防护IP组
  const protectionIpGroups = []
  // 暂时不生成随机IP组，将在实现IP分配逻辑时处理
  
  // 生成业务实例
  businessInstances.push({
    instanceId: 'BI' + Random.natural(10000, 99999),
    instanceName: `业务实例-${i + 1}`,
    customerId: 'CUST' + Random.natural(1000, 9999),
    customerName: Random.pick(customerNames),
    orderId: Random.pick(orderIds),
    packageId: 'PKG' + Random.natural(100, 999),
    packageName,
    clusterType,
    addressType,
    regionId,
    // 资源配置
    bandwidth: Random.natural(100, 10000), // 防护带宽
    businessBandwidth: Random.natural(50, 5000), // 业务带宽
    qps: Random.natural(1000, 100000), // 业务QPS
    protectionIpCount,
    protectionIpGroups,
    domainCount: Random.natural(5, 50), // 防护域名数
    portCount: Random.natural(5, 50), // 端口数量
    status: Random.pick(statuses),
    createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    remark: Random.boolean() ? Random.sentence(3, 10) : '',
    // 添加关联逻辑集群组ID字段，确保所有实例都关联集群组
    clusterGroupId
  })
}

export default {
  businessInstances,
  
  // 获取业务实例列表
  getBusinessInstances(params) {
    const { keyword, status, dateRange, pageNum = 1, pageSize = 10 } = params || {}
    let results = [...businessInstances]
    
    // 关键词过滤
    if (keyword) {
      const loweredKeyword = keyword.toLowerCase()
      results = results.filter(item => 
        item.instanceName.toLowerCase().includes(loweredKeyword) ||
        item.instanceId.toLowerCase().includes(loweredKeyword) ||
        item.customerName.toLowerCase().includes(loweredKeyword) ||
        item.orderId.toLowerCase().includes(loweredKeyword)
      )
    }
    
    // 状态过滤
    if (status) {
      results = results.filter(item => item.status === status)
    }
    
    // 日期范围过滤
    if (dateRange && dateRange.length === 2) {
      const startTime = new Date(dateRange[0]).getTime()
      const endTime = new Date(dateRange[1]).getTime()
      results = results.filter(item => {
        const createTime = new Date(item.createTime).getTime()
        return createTime >= startTime && createTime <= endTime
      })
    }
    
    // 计算总数
    const total = results.length
    
    // 分页
    const startIndex = (pageNum - 1) * pageSize
    results = results.slice(startIndex, startIndex + pageSize)
    
    return {
      list: results,
      total,
      pageNum: Number(pageNum),
      pageSize: Number(pageSize)
    }
  },
  
  // 获取单个业务实例详情
  getBusinessInstance(id) {
    return businessInstances.find(item => item.instanceId === id) || null
  },
  
  // 创建业务实例
  createBusinessInstance(data) {
    const newInstance = {
      ...data,
      instanceId: 'BI' + Random.natural(10000, 99999),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      protectionIpGroups: []
    }
    
    businessInstances.unshift(newInstance)
    return newInstance
  },
  
  // 更新业务实例
  updateBusinessInstance(id, data) {
    const index = businessInstances.findIndex(item => item.instanceId === id)
    if (index !== -1) {
      const updatedInstance = {
        ...businessInstances[index],
        ...data,
        updateTime: new Date().toISOString()
      }
      businessInstances[index] = updatedInstance
      return updatedInstance
    }
    return null
  },
  
  // 删除业务实例
  deleteBusinessInstance(id) {
    const index = businessInstances.findIndex(item => item.instanceId === id)
    if (index !== -1) {
      businessInstances.splice(index, 1)
      return true
    }
    return false
  },
  
  // 启用业务实例
  enableBusinessInstance(id) {
    const instance = businessInstances.find(item => item.instanceId === id)
    if (instance) {
      instance.status = 'active'
      instance.updateTime = new Date().toISOString()
      return instance
    }
    return null
  },
  
  // 禁用业务实例
  disableBusinessInstance(id) {
    const instance = businessInstances.find(item => item.instanceId === id)
    if (instance) {
      instance.status = 'inactive'
      instance.updateTime = new Date().toISOString()
      return instance
    }
    return null
  },
  
  // 分配防护IP组
  allocateProtectionIpGroups(id, ipGroups) {
    const instance = businessInstances.find(item => item.instanceId === id)
    if (instance) {
      instance.protectionIpGroups = ipGroups
      instance.updateTime = new Date().toISOString()
      return instance
    }
    return null
  },
  
  // 获取可用订单列表
  getAvailableOrders(params) {
    const { keyword } = params || {}
    const packageTypes = [
      { name: 'DDOS防护', clusterType: 'standby' },
      { name: 'WAF标准防护', clusterType: 'distributed' },
      { name: 'WAF增强防护', clusterType: 'anycast' }
    ]
    
    let results = orderIds.map(orderId => {
      const packageInfo = Random.pick(packageTypes)
      return {
        orderId,
        customerName: Random.pick(customerNames),
        packageName: packageInfo.name,
        clusterType: packageInfo.clusterType,
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    })
    
    // 关键词过滤
    if (keyword) {
      const loweredKeyword = keyword.toLowerCase()
      results = results.filter(item => 
        item.orderId.toLowerCase().includes(loweredKeyword) ||
        item.customerName.toLowerCase().includes(loweredKeyword)
      )
    }
    
    return results
  }
}
