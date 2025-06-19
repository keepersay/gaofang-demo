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
    status: 'active'
  },
  {
    id: 'CHINA',
    name: '全国',
    distributed: true,
    status: 'active'
  },
  {
    id: 'NORTH_CHINA',
    name: '华北',
    distributed: false,
    status: 'active'
  },
  {
    id: 'EAST_CHINA',
    name: '华东',
    distributed: false,
    status: 'active'
  },
  {
    id: 'SOUTH_CHINA',
    name: '华南',
    distributed: false,
    status: 'active'
  },
  {
    id: 'SOUTHWEST_CHINA',
    name: '西南',
    distributed: false,
    status: 'active'
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