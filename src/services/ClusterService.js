// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LC${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 模拟集群数据
const mockClusters = [
  {
    id: 'LC202407250001',
    name: 'huadong-telecom-premium',
    displayName: '华东-电信-高级版',
    enableL7: false,
    dataCenterId: 'DC202401010002', // 上海机房01
    slots: { ADS: 'ads-1', SLB: 'slb-1', WAFCC: '', WAF: '' },
    ipPools: {
      vip: ['1.1.1.1/24', '2.2.2.2-2.2.2.10', '3.3.3.3'],
      origin: ['10.0.0.1/28'],
      snat: ['100.64.0.1-100.64.0.5', '100.64.0.10']
    },
    status: 'active',
    remark: '华东地区电信高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin',
    bandwidth: 1000
  },
  {
    id: 'LC202407250002',
    name: 'huanan-unicom-basic',
    displayName: '华南-联通-基础版',
    enableL7: true,
    dataCenterId: 'DC202401010003', // 广州机房01
    slots: { ADS: 'ads-2', SLB: 'slb-2', WAFCC: 'wafcc-1', WAF: 'waf-1' },
    ipPools: {
      vip: ['4.4.4.4'],
      origin: ['20.0.0.1-20.0.0.5', '20.0.0.10'],
      snat: []
    },
    status: 'active',
    remark: '华南地区联通基础版集群',
    createTime: '2024-01-02 14:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-02 14:30:00',
    updateAccount: 'admin',
    bandwidth: 500
  },
  {
    id: 'LC202407250003',
    name: 'beijing-telecom-standard',
    displayName: '北京-电信-标准版',
    enableL7: true,
    dataCenterId: 'DC202401010001', // 北京机房01
    slots: { ADS: 'ads-3', SLB: 'slb-3', WAFCC: 'wafcc-3', WAF: 'waf-3' },
    ipPools: {
      vip: ['5.5.5.5/24'],
      origin: ['30.0.0.1/28'],
      snat: ['100.128.0.1-100.128.0.10']
    },
    status: 'active',
    remark: '北京地区电信标准版集群',
    createTime: '2024-02-15 09:30:00',
    createAccount: 'admin',
    updateTime: '2024-02-15 09:30:00',
    updateAccount: 'admin',
    bandwidth: 800
  },
  {
    id: 'LC202407250004',
    name: 'wuxi-unicom-premium',
    displayName: '无锡-联通-高级版',
    enableL7: false,
    dataCenterId: 'DC202401010004', // 无锡机房01
    slots: { ADS: 'ads-4', SLB: 'slb-4', WAFCC: '', WAF: '' },
    ipPools: {
      vip: ['6.6.6.6/24'],
      origin: ['40.0.0.1/28'],
      snat: []
    },
    status: 'disabled',
    remark: '无锡地区联通高级版集群',
    createTime: '2024-03-05 11:15:00',
    createAccount: 'admin',
    updateTime: '2024-03-05 11:15:00',
    updateAccount: 'admin',
    bandwidth: 1200
  },
  {
    id: 'LC202407250005',
    name: 'seoul-premium',
    displayName: '首尔-高级版',
    enableL7: true,
    dataCenterId: 'DC202407200001', // 首尔机房01
    slots: { ADS: 'ads-5', SLB: 'slb-5', WAFCC: 'wafcc-5', WAF: 'waf-5' },
    ipPools: {
      vip: ['7.7.7.7/24'],
      origin: ['50.0.0.1/28'],
      snat: ['100.192.0.1-100.192.0.10']
    },
    status: 'active',
    remark: '韩国首尔高级版集群',
    createTime: '2024-05-12 08:45:00',
    createAccount: 'admin',
    updateTime: '2024-05-12 08:45:00',
    updateAccount: 'admin',
    bandwidth: 2000
  },
  {
    id: 'LC202407250006',
    name: 'frankfurt-standard',
    displayName: '法兰克福-标准版',
    enableL7: true,
    dataCenterId: 'DC202407200002', // 法兰克福机房01
    slots: { ADS: 'ads-6', SLB: 'slb-6', WAFCC: 'wafcc-6', WAF: 'waf-6' },
    ipPools: {
      vip: ['8.8.8.8/24'],
      origin: ['60.0.0.1/28'],
      snat: ['100.224.0.1-100.224.0.10']
    },
    status: 'active',
    remark: '德国法兰克福标准版集群',
    createTime: '2024-04-18 14:20:00',
    createAccount: 'admin',
    updateTime: '2024-04-18 14:20:00',
    updateAccount: 'admin',
    bandwidth: 1500
  },
  {
    id: 'LC202407250007',
    name: 'dubai-premium',
    displayName: '迪拜-高级版',
    enableL7: false,
    dataCenterId: 'DC202407200003', // 迪拜机房01
    slots: { ADS: 'ads-7', SLB: 'slb-7', WAFCC: '', WAF: '' },
    ipPools: {
      vip: ['9.9.9.9/24'],
      origin: ['70.0.0.1/28'],
      snat: []
    },
    status: 'active',
    remark: '迪拜高级版集群',
    createTime: '2024-03-22 12:30:00',
    createAccount: 'admin',
    updateTime: '2024-03-22 12:30:00',
    updateAccount: 'admin',
    bandwidth: 3000
  },
  {
    id: 'LC202407250008',
    name: 'la-standard',
    displayName: '洛杉矶-标准版',
    enableL7: true,
    dataCenterId: 'DC202407200004', // 洛杉矶机房01
    slots: { ADS: 'ads-8', SLB: 'slb-8', WAFCC: 'wafcc-8', WAF: 'waf-8' },
    ipPools: {
      vip: ['10.10.10.10/24'],
      origin: ['80.0.0.1/28'],
      snat: ['100.240.0.1-100.240.0.10']
    },
    status: 'active',
    remark: '美国洛杉矶标准版集群',
    createTime: '2024-02-28 15:45:00',
    createAccount: 'admin',
    updateTime: '2024-02-28 15:45:00',
    updateAccount: 'admin',
    bandwidth: 2500
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

  // 更新逻辑集群
  static async updateCluster(id, cluster) {
    return new Promise((resolve, reject) => {
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
          reject(new Error('逻辑集群不存在'))
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

  // 根据机房ID获取集群列表
  static async getClustersByDataCenterId(dataCenterId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clusters = mockClusters.filter(c => c.dataCenterId === dataCenterId)
        resolve(clusters)
      }, 100)
    })
  }

  // 更新集群状态
  static async updateClusterStatus(id, status) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockClusters.findIndex(c => c.id === id)
        if (index > -1) {
          mockClusters[index].status = status
          mockClusters[index].updateTime = new Date().toLocaleString()
          mockClusters[index].updateAccount = 'current_user'
          resolve(mockClusters[index])
        } else {
          reject(new Error('集群不存在'))
        }
      }, 100)
    })
  }

  // 获取所有逻辑集群组
  static async getClusterGroups() {
    return new Promise((resolve) => {
      // 模拟从服务器获取数据
      // 这里使用 ClusterGroupManagement.vue 中的模拟数据
      setTimeout(() => {
        const clusterGroups = [
          {
            id: 'LCG7503281108201961885',
            name: '上海电信集群组',
            type: 'standby',
            distributed: false,
            dataCenterId: 'DC202401010002', // 上海机房01
            primaryClusters: ['LC202407250001'], // 华东-电信-高级版
            standbyClusters: [],
            status: 'active',
            remark: '上海电信集群，主要承载华东区域业务',
            createTime: '2024-01-01 10:00:00',
            createAccount: 'admin',
            updateTime: '2024-01-10 11:00:00',
            updateAccount: 'admin',
            addressType: 'ipv4'
          },
          {
            id: 'LCG7503281108201961886',
            name: '北京电信集群组',
            type: 'standby',
            distributed: false,
            dataCenterId: 'DC202401010001', // 北京机房01
            primaryClusters: ['LC202407250003'], // 北京-电信-标准版
            standbyClusters: [],
            status: 'active',
            remark: '北京电信集群，主要承载华北区域业务',
            createTime: '2024-01-02 11:00:00',
            createAccount: 'admin',
            updateTime: '2024-01-11 12:00:00',
            updateAccount: 'admin',
            addressType: 'ipv4'
          },
          {
            id: 'LCG7503281108201961887',
            name: '国际分布式集群组',
            type: 'distributed',
            distributed: true,
            dataCenterId: '',
            primaryClusters: ['LC202407250005', 'LC202407250006'], // 首尔高级版, 法兰克福标准版
            standbyClusters: ['LC202407250007'], // 迪拜高级版
            defaultClusterId: 'LC202407250005',
            status: 'active',
            remark: '国际分布式集群组，覆盖亚洲、欧洲和中东地区',
            createTime: '2024-05-15 09:30:00',
            createAccount: 'admin',
            updateTime: '2024-05-15 09:30:00',
            updateAccount: 'admin',
            addressType: 'dual'
          },
          {
            id: 'LCG7503281108201961888',
            name: '广州联通集群组',
            type: 'standby',
            distributed: false,
            dataCenterId: 'DC202401010003', // 广州机房01
            primaryClusters: ['LC202407250002'], // 华南-联通-基础版
            standbyClusters: [],
            status: 'active',
            remark: '广州联通集群，主要承载华南区域业务',
            createTime: '2024-03-05 14:20:00',
            createAccount: 'admin',
            updateTime: '2024-03-05 14:20:00',
            updateAccount: 'admin',
            addressType: 'dual'
          },
          {
            id: 'LCG7503281108201961889',
            name: '北美分布式集群组',
            type: 'distributed',
            distributed: true,
            dataCenterId: '',
            primaryClusters: ['LC202407250008'], // 洛杉矶标准版
            standbyClusters: [],
            defaultClusterId: 'LC202407250008',
            status: 'active',
            remark: '北美地区分布式集群组，目前仅覆盖美国西海岸',
            createTime: '2024-02-28 16:30:00',
            createAccount: 'admin',
            updateTime: '2024-04-10 09:15:00',
            updateAccount: 'admin',
            addressType: 'ipv4'
          },
          {
            id: 'LCG7503281108201961890',
            name: '无锡备用集群组',
            type: 'standby',
            distributed: false,
            dataCenterId: 'DC202401010004', // 无锡机房01
            primaryClusters: ['LC202407250004'], // 华东-移动-标准版
            standbyClusters: [],
            status: 'active',
            remark: '无锡备用集群组，作为华东地区容灾备份',
            createTime: '2024-04-15 10:00:00',
            createAccount: 'admin',
            updateTime: '2024-04-15 10:00:00',
            updateAccount: 'admin',
            addressType: 'ipv4'
          },
          {
            id: 'LCG7503281108201961892',
            name: '欧洲多节点集群组',
            type: 'anycast',
            distributed: false,
            dataCenterId: '',
            primaryClusters: ['LC202407250006', 'LC202407250009'], // 法兰克福标准版, 伦敦基础版
            standbyClusters: [],
            status: 'active',
            remark: '欧洲多节点Anycast集群组，覆盖西欧和北欧地区',
            createTime: '2024-06-10 14:20:00',
            createAccount: 'admin',
            updateTime: '2024-06-10 14:20:00',
            updateAccount: 'admin',
            addressType: 'dual'
          },
          {
            id: 'LCG7503281108201961894',
            name: '韩国业务集群组',
            type: 'standby',
            distributed: false,
            dataCenterId: 'DC202407200001', // 首尔机房01
            primaryClusters: ['LC202407250005'], // 首尔高级版
            standbyClusters: [],
            status: 'active',
            remark: '韩国本地业务集群组，提供低延迟服务',
            createTime: '2024-05-20 10:30:00',
            createAccount: 'admin',
            updateTime: '2024-05-20 10:30:00',
            updateAccount: 'admin',
            addressType: 'ipv6'
          }
        ];
        
        // 只返回活跃状态的集群组
        resolve(clusterGroups.filter(group => group.status === 'active'));
      }, 300);
    });
  }
  
  // 根据ID获取逻辑集群组
  static async getClusterGroupById(id) {
    return new Promise((resolve, reject) => {
      // 模拟从服务器获取数据
      setTimeout(() => {
        // 调用getClusterGroups获取所有集群组
        this.getClusterGroups().then(groups => {
          const group = groups.find(g => g.id === id);
          if (group) {
            resolve(group);
          } else {
            reject(new Error('逻辑集群组不存在'));
          }
        });
      }, 100);
    });
  }
}

export default ClusterService 