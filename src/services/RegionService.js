// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 模拟地域数据
const mockRegions = [
  {
    id: 'GLOBAL',
    name: '全球',
    distributed: true,
    status: 'active',
    remark: '全球范围',
    createTime: '2024-01-01 09:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-10 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'CHINA',
    name: '全国',
    distributed: true,
    status: 'active',
    remark: '全国范围',
    createTime: '2024-01-02 10:00:00',
    createAccount: 'alice',
    updateTime: '2024-01-11 11:00:00',
    updateAccount: 'alice'
  },
  {
    id: 'BEIJING',
    name: '北京',
    distributed: false,
    status: 'active',
    remark: '北京地区',
    createTime: '2024-01-03 11:00:00',
    createAccount: 'bob',
    updateTime: '2024-01-12 12:00:00',
    updateAccount: 'bob'
  },
  {
    id: 'SHANGHAI',
    name: '上海',
    distributed: false,
    status: 'active',
    remark: '上海地区',
    createTime: '2024-01-04 12:00:00',
    createAccount: 'carol',
    updateTime: '2024-01-13 13:00:00',
    updateAccount: 'carol'
  },
  {
    id: 'GUANGZHOU',
    name: '广州',
    distributed: false,
    status: 'active',
    remark: '广州地区',
    createTime: '2024-01-05 13:00:00',
    createAccount: 'dave',
    updateTime: '2024-01-14 14:00:00',
    updateAccount: 'dave'
  },
  {
    id: 'WUXI',
    name: '无锡',
    distributed: false,
    status: 'active',
    remark: '无锡地区',
    createTime: '2024-01-06 14:00:00',
    createAccount: 'eve',
    updateTime: '2024-01-15 15:00:00',
    updateAccount: 'eve'
  }
]

class RegionService {
  // 获取所有地域
  static async getRegions() {
    // 模拟异步请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockRegions)
      }, 300)
    })
  }

  // 根据ID获取地域
  static async getRegionById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const region = mockRegions.find(r => r.id === id)
        if (region) {
          resolve(region)
        } else {
          reject(new Error('地域不存在'))
        }
      }, 100)
    })
  }

  // 判断地域是否为分布式
  static isDistributed(regionId) {
    const region = mockRegions.find(r => r.id === regionId)
    return region ? region.distributed : false
  }

  // 添加地域
  static async addRegion(region) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRegion = {
          ...region,
          id: generateSnowflakeId(),
          createTime: new Date().toLocaleString(),
          createAccount: 'current_user',
          updateTime: new Date().toLocaleString(),
          updateAccount: 'current_user'
        }
        mockRegions.push(newRegion)
        resolve(newRegion)
      }, 300)
    })
  }

  // 更新地域
  static async updateRegion(id, region) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRegions.findIndex(r => r.id === id)
        if (index > -1) {
          mockRegions[index] = {
            ...mockRegions[index],
            ...region,
            updateTime: new Date().toLocaleString(),
            updateAccount: 'current_user'
          }
          resolve(mockRegions[index])
        } else {
          resolve(null)
        }
      }, 300)
    })
  }

  // 删除地域
  static async deleteRegion(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRegions.findIndex(r => r.id === id)
        if (index > -1) {
          mockRegions.splice(index, 1)
        }
        resolve(true)
      }, 300)
    })
  }
}

export default RegionService 