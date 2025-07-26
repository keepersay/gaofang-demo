// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `CLU${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 网元类型枚举
export const networkElementTypes = {
  slb4: '四层负载',
  wafcc: '七层负载/CC', 
  waf: 'WAF',
  blackhole: '黑洞',
  dns: '域名解析',
  ads: 'ADS',
  firewall: '防火墙',
  flowanalysis: '流量分析'
}

// 网元路径映射
export const networkElementPaths = {
  slb4: '/slb',
  wafcc: '/waf-cc', 
  waf: '/waf',
  blackhole: '/blackhole',
  dns: '/dns',
  ads: '/ads',
  firewall: '/firewall',
  flowanalysis: '/traffic'
}

// 模拟集群数据
const mockClusters = [
  {
    id: 'CLU202412070001',
    name: '首尔机房WAF集群01',
    dataCenterId: 'DC202407200001',
    networkElementType: 'waf',
    status: 'active',
    createTime: '2024-05-16 14:20:00',
    createAccount: 'admin',
    updateTime: '2024-05-16 14:20:00',
    updateAccount: 'admin',
    remark: '首尔地区WAF防护集群'
  },
  {
    id: 'CLU202412070002',
    name: '北京机房SLB集群01',
    dataCenterId: 'DC202401010001',
    networkElementType: 'slb4',
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin',
    remark: '北京地区四层负载均衡集群'
  },
  {
    id: 'CLU202412070003',
    name: '上海机房WAF-CC集群01',
    dataCenterId: 'DC202401010002',
    networkElementType: 'wafcc',
    status: 'active',
    createTime: '2024-02-15 09:30:00',
    createAccount: 'admin',
    updateTime: '2024-02-15 09:30:00',
    updateAccount: 'admin',
    remark: '上海地区七层负载和CC防护集群'
  },
  {
    id: 'CLU202412070004',
    name: '广州机房ADS集群01',
    dataCenterId: 'DC202401010003',
    networkElementType: 'ads',
    status: 'disabled',
    createTime: '2024-03-05 11:15:00',
    createAccount: 'admin',
    updateTime: '2024-03-20 14:30:00',
    updateAccount: 'admin',
    remark: '广州地区ADS防护集群，当前停用维护中'
  },
  {
    id: 'CLU202412070005',
    name: '法兰克福机房黑洞集群01',
    dataCenterId: 'DC202407200002',
    networkElementType: 'blackhole',
    status: 'active',
    createTime: '2024-04-18 14:20:00',
    createAccount: 'admin',
    updateTime: '2024-04-18 14:20:00',
    updateAccount: 'admin',
    remark: '德国法兰克福黑洞引流集群'
  },
  {
    id: 'CLU202412070006',
    name: '迪拜机房DNS集群01',
    dataCenterId: 'DC202407200003',
    networkElementType: 'dns',
    status: 'active',
    createTime: '2024-03-22 12:30:00',
    createAccount: 'admin',
    updateTime: '2024-03-22 12:30:00',
    updateAccount: 'admin',
    remark: '迪拜地区域名解析集群'
  },
  {
    id: 'CLU202412070007',
    name: '洛杉矶机房防火墙集群01',
    dataCenterId: 'DC202407200004',
    networkElementType: 'firewall',
    status: 'active',
    createTime: '2024-02-28 15:45:00',
    createAccount: 'admin',
    updateTime: '2024-02-28 15:45:00',
    updateAccount: 'admin',
    remark: '美国洛杉矶防火墙防护集群'
  },
  {
    id: 'CLU202412070008',
    name: '无锡机房流量分析集群01',
    dataCenterId: 'DC202401010004',
    networkElementType: 'flowanalysis',
    status: 'disabled',
    createTime: '2024-05-12 08:45:00',
    createAccount: 'admin',
    updateTime: '2024-05-12 08:45:00',
    updateAccount: 'admin',
    remark: '无锡地区流量分析集群'
  }
]

class ClusterManagementService {
  // 分页查询集群列表
  static async getClustersByPage(params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredClusters = [...mockClusters]
        
        // 按名称过滤
        if (params.name) {
          filteredClusters = filteredClusters.filter(cluster => 
            cluster.name.toLowerCase().includes(params.name.toLowerCase())
          )
        }
        
        // 按网元类型过滤
        if (params.networkElementType) {
          filteredClusters = filteredClusters.filter(cluster => 
            cluster.networkElementType === params.networkElementType
          )
        }
        
        // 按状态过滤
        if (params.status) {
          filteredClusters = filteredClusters.filter(cluster => 
            cluster.status === params.status
          )
        }
        
        // 分页逻辑
        const page = parseInt(params.page) || 1
        const pageSize = parseInt(params.pageSize) || 10
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        
        const paginatedData = filteredClusters.slice(startIndex, endIndex)
        
        resolve({
          data: paginatedData,
          total: filteredClusters.length,
          page,
          pageSize
        })
      }, 300)
    })
  }
  
  // 查询所有集群
  static async getAllClusters(params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredClusters = [...mockClusters]
        
        // 按名称过滤
        if (params.name) {
          filteredClusters = filteredClusters.filter(cluster => 
            cluster.name.toLowerCase().includes(params.name.toLowerCase())
          )
        }
        
        resolve({
          data: filteredClusters,
          total: filteredClusters.length
        })
      }, 200)
    })
  }
  
  // 添加集群
  static async addCluster(clusterData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 检查名称唯一性
        const nameExists = mockClusters.some(cluster => 
          cluster.name === clusterData.name
        )
        
        if (nameExists) {
          reject(new Error('集群名称已存在'))
          return
        }
        
        const newCluster = {
          ...clusterData,
          id: generateSnowflakeId(),
          createTime: new Date().toLocaleString(),
          createAccount: 'current_user',
          updateTime: new Date().toLocaleString(),
          updateAccount: 'current_user'
        }
        
        mockClusters.push(newCluster)
        resolve(newCluster)
      }, 300)
    })
  }
  
  // 更新集群信息
  static async updateCluster(clusterData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(cluster => cluster.id === clusterData.id)
        
        if (index === -1) {
          reject(new Error('集群不存在'))
          return
        }
        
        // 检查名称唯一性（排除自己）
        const nameExists = mockClusters.some(cluster => 
          cluster.name === clusterData.name && cluster.id !== clusterData.id
        )
        
        if (nameExists) {
          reject(new Error('集群名称已存在'))
          return
        }
        
        mockClusters[index] = {
          ...mockClusters[index],
          ...clusterData,
          updateTime: new Date().toLocaleString(),
          updateAccount: 'current_user'
        }
        
        resolve(mockClusters[index])
      }, 300)
    })
  }
  
  // 删除集群
  static async removeCluster(clusterId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(cluster => cluster.id === clusterId)
        
        if (index === -1) {
          reject(new Error('集群不存在'))
          return
        }
        
        // 模拟检查集群中的实例和主机
        // 这里简单模拟，实际应该调用相关接口检查
        const hasInstances = Math.random() > 0.8 // 20%概率有实例
        const hasHosts = Math.random() > 0.8 // 20%概率有主机
        
        if (hasInstances) {
          reject(new Error('集群中还有实例，无法删除'))
          return
        }
        
        if (hasHosts) {
          reject(new Error('集群中还有主机，无法删除'))
          return
        }
        
        mockClusters.splice(index, 1)
        resolve({ success: true })
      }, 300)
    })
  }
  
  // 启用集群
  static async enableCluster(clusterId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(cluster => cluster.id === clusterId)
        
        if (index === -1) {
          reject(new Error('集群不存在'))
          return
        }
        
        mockClusters[index].status = 'active'
        mockClusters[index].updateTime = new Date().toLocaleString()
        mockClusters[index].updateAccount = 'current_user'
        
        resolve(mockClusters[index])
      }, 200)
    })
  }
  
  // 停用集群
  static async disableCluster(clusterId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(cluster => cluster.id === clusterId)
        
        if (index === -1) {
          reject(new Error('集群不存在'))
          return
        }
        
        mockClusters[index].status = 'disabled'
        mockClusters[index].updateTime = new Date().toLocaleString()
        mockClusters[index].updateAccount = 'current_user'
        
        resolve(mockClusters[index])
      }, 200)
    })
  }
  
  // 校验集群名称唯一性
  static async checkClusterNameUnique(name, excludeId = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nameExists = mockClusters.some(cluster => 
          cluster.name === name && cluster.id !== excludeId
        )
        
        resolve({
          unique: !nameExists
        })
      }, 100)
    })
  }
  
  // 根据ID获取集群
  static async getClusterById(clusterId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cluster = mockClusters.find(cluster => cluster.id === clusterId)
        
        if (cluster) {
          resolve(cluster)
        } else {
          reject(new Error('集群不存在'))
        }
      }, 100)
    })
  }
}

// 构建详情跳转URL
export const buildDetailUrl = (cluster) => {
  const baseUrl = networkElementPaths[cluster.networkElementType]
  if (!baseUrl) {
    console.error('未知的网元类型:', cluster.networkElementType)
    return ''
  }
  
  const params = new URLSearchParams({
    clusterId: cluster.id,
    clusterName: cluster.name,
    from: 'cluster-management'
  })
  
  return `${baseUrl}?${params.toString()}`
}

export default ClusterManagementService 