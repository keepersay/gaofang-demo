// 模拟逻辑集群数据
const mockClusters = [
  {
    id: 'LC202401010001001',
    name: 'shanghai-telecom-premium',
    displayName: '上海-电信-高级版',
    region: 'SHANGHAI',
    provider: 'telecom',
    type: 'premium',
    status: 'active',
    remark: '上海地区电信高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010002001',
    name: 'shanghai-unicom-premium',
    displayName: '上海-联通-高级版',
    region: 'SHANGHAI',
    provider: 'unicom',
    type: 'premium',
    status: 'active',
    remark: '上海地区联通高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010003001',
    name: 'guangzhou-telecom-basic',
    displayName: '广州-电信-基础版',
    region: 'GUANGZHOU',
    provider: 'telecom',
    type: 'basic',
    status: 'active',
    remark: '广州地区电信基础版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010004001',
    name: 'guangzhou-unicom-basic',
    displayName: '广州-联通-基础版',
    region: 'GUANGZHOU',
    provider: 'unicom',
    type: 'basic',
    status: 'active',
    remark: '广州地区联通基础版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010005001',
    name: 'beijing-mobile-standard',
    displayName: '北京-移动-标准版',
    region: 'BEIJING',
    provider: 'mobile',
    type: 'standard',
    status: 'active',
    remark: '北京地区移动标准版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010006001',
    name: 'beijing-unicom-standard',
    displayName: '北京-联通-标准版',
    region: 'BEIJING',
    provider: 'unicom',
    type: 'standard',
    status: 'active',
    remark: '北京地区联通标准版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010007001',
    name: 'wuxi-telecom-basic',
    displayName: '无锡-电信-基础版',
    region: 'WUXI',
    provider: 'telecom',
    type: 'basic',
    status: 'active',
    remark: '无锡地区电信基础版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010008001',
    name: 'wuxi-unicom-basic',
    displayName: '无锡-联通-基础版',
    region: 'WUXI',
    provider: 'unicom',
    type: 'basic',
    status: 'active',
    remark: '无锡地区联通基础版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010009001',
    name: 'china-telecom-premium',
    displayName: '全国-电信-高级版',
    region: 'CHINA',
    provider: 'telecom',
    type: 'premium',
    status: 'active',
    remark: '全国电信高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LC202401010010001',
    name: 'global-unicom-premium',
    displayName: '全球-联通-高级版',
    region: 'GLOBAL',
    provider: 'unicom',
    type: 'premium',
    status: 'active',
    remark: '全球联通高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  }
]

class ClusterService {
  // 获取所有逻辑集群
  static async getClusters() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockClusters)
      }, 300)
    })
  }

  // 根据ID获取逻辑集群
  static async getClusterById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cluster = mockClusters.find(c => c.id === id)
        if (cluster) {
          resolve(cluster)
        } else {
          reject(new Error('逻辑集群不存在'))
        }
      }, 100)
    })
  }

  // 根据地域获取可用的逻辑集群
  static async getClustersByRegion(regionId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clusters = mockClusters.filter(c => 
          c.region === regionId && c.status === 'active'
        )
        resolve(clusters)
      }, 100)
    })
  }

  // 根据ID列表批量获取逻辑集群
  static async getClustersByIds(ids) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clusters = mockClusters.filter(c => ids.includes(c.id))
        resolve(clusters)
      }, 100)
    })
  }

  // 创建逻辑集群
  static async createCluster(cluster) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCluster = {
          ...cluster,
          id: `LC${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
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

  // 更新逻辑集群
  static async updateCluster(id, cluster) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(c => c.id === id)
        if (index > -1) {
          mockClusters[index] = {
            ...mockClusters[index],
            ...cluster,
            updateTime: new Date().toLocaleString(),
            updateAccount: 'current_user'
          }
          resolve(mockClusters[index])
        } else {
          resolve(null)
        }
      }, 300)
    })
  }

  // 删除逻辑集群
  static async deleteCluster(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(c => c.id === id)
        if (index > -1) {
          mockClusters.splice(index, 1)
        }
        resolve(true)
      }, 300)
    })
  }

  // 验证主备集群配置
  static validateClustersConfig(primaryClusters, standbyClusters, region, isDistributed) {
    // 验证主集群数量
    if (primaryClusters.length === 0) {
      return {
        valid: false,
        message: '主集群至少需要1个'
      }
    }

    // 验证备集群数量
    if (standbyClusters.length > 1) {
      return {
        valid: false,
        message: '备集群最多只能有1个'
      }
    }

    // 如果不是分布式，验证地域匹配
    if (!isDistributed) {
      const primaryClusterRegions = primaryClusters.map(id => {
        const cluster = mockClusters.find(c => c.id === id)
        return cluster ? cluster.region : null
      })

      if (!primaryClusterRegions.every(r => r === region)) {
        return {
          valid: false,
          message: '非分布式集群组的主集群必须与所选地域相同'
        }
      }
    }

    return {
      valid: true,
      message: ''
    }
  }
}

export default ClusterService 