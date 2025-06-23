// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 模拟树形地域数据
const mockRegions = [
  {
    id: 'ASIA', // 亚洲
    pid: '0', // 根节点父ID为0
    code: 'AS',
    name: '亚洲',
    status: 'active',
    remark: '亚洲地区',
    createTime: '2024-01-01 09:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-10 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'CHN', // 中国
    pid: 'ASIA',
    code: 'CN',
    name: '中国',
    status: 'active',
    remark: '中国地区',
    createTime: '2024-01-02 10:00:00',
    createAccount: 'alice',
    updateTime: '2024-01-11 11:00:00',
    updateAccount: 'alice'
  },
  {
    id: 'PEK', // 北京首都国际机场代码
    pid: 'CHN',
    code: 'PEK',
    name: '北京',
    status: 'active',
    remark: '北京地区',
    createTime: '2024-01-03 11:00:00',
    createAccount: 'bob',
    updateTime: '2024-01-12 12:00:00',
    updateAccount: 'bob'
  },
  {
    id: 'SHA', // 上海虹桥机场代码
    pid: 'CHN',
    code: 'SHA',
    name: '上海',
    status: 'active',
    remark: '上海地区',
    createTime: '2024-01-04 12:00:00',
    createAccount: 'carol',
    updateTime: '2024-01-13 13:00:00',
    updateAccount: 'carol'
  },
  {
    id: 'CAN', // 广州白云机场代码
    pid: 'CHN',
    code: 'CAN',
    name: '广州',
    status: 'active',
    remark: '广州地区',
    createTime: '2024-01-05 13:00:00',
    createAccount: 'dave',
    updateTime: '2024-01-14 14:00:00',
    updateAccount: 'dave'
  },
  {
    id: 'WUX', // 无锡硕放机场代码
    pid: 'CHN',
    code: 'WUX',
    name: '无锡',
    status: 'active',
    remark: '无锡地区',
    createTime: '2024-01-06 14:00:00',
    createAccount: 'eve',
    updateTime: '2024-01-15 15:00:00',
    updateAccount: 'eve'
  },
  {
    id: 'TPE', // 台湾桃园国际机场代码
    pid: 'CHN',
    code: 'TPE',
    name: '台湾',
    status: 'active',
    remark: '台湾地区',
    createTime: '2024-01-07 15:00:00',
    createAccount: 'frank',
    updateTime: '2024-01-16 16:00:00',
    updateAccount: 'frank'
  },
  {
    id: 'JPN', // 日本
    pid: 'ASIA',
    code: 'JP',
    name: '日本',
    status: 'active',
    remark: '日本地区',
    createTime: '2024-01-07 15:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-16 16:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'NRT', // 东京成田国际机场代码
    pid: 'JPN',
    code: 'NRT',
    name: '东京',
    status: 'active',
    remark: '东京地区',
    createTime: '2024-01-08 16:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-17 17:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'KOR', // 韩国
    pid: 'ASIA',
    code: 'KR',
    name: '韩国',
    status: 'active',
    remark: '韩国地区',
    createTime: '2024-01-09 17:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-18 18:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'ICN', // 首尔仁川国际机场代码
    pid: 'KOR',
    code: 'ICN',
    name: '首尔',
    status: 'active',
    remark: '首尔地区',
    createTime: '2024-01-10 18:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-19 19:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'ME', // 中东
    pid: '0',
    code: 'ME',
    name: '中东',
    status: 'active',
    remark: '中东地区',
    createTime: '2024-01-11 09:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-20 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'ARE', // 阿联酋
    pid: 'ME',
    code: 'AE',
    name: '阿联酋',
    status: 'active',
    remark: '阿联酋地区',
    createTime: '2024-01-12 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-21 11:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DXB', // 迪拜国际机场代码
    pid: 'ARE',
    code: 'DXB',
    name: '迪拜',
    status: 'active',
    remark: '迪拜地区',
    createTime: '2024-01-13 11:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-22 12:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'EU', // 欧洲
    pid: '0',
    code: 'EU',
    name: '欧洲',
    status: 'active',
    remark: '欧洲地区',
    createTime: '2024-01-14 12:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-23 13:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DEU', // 德国
    pid: 'EU',
    code: 'DE',
    name: '德国',
    status: 'active',
    remark: '德国地区',
    createTime: '2024-01-15 13:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-24 14:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'FRA', // 法兰克福机场代码
    pid: 'DEU',
    code: 'FRA',
    name: '法兰克福',
    status: 'active',
    remark: '法兰克福地区',
    createTime: '2024-01-16 14:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-25 15:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'NA', // 北美洲
    pid: '0',
    code: 'NA',
    name: '北美洲',
    status: 'active',
    remark: '北美洲地区',
    createTime: '2024-01-17 15:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-26 16:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'USA', // 美国
    pid: 'NA',
    code: 'US',
    name: '美国',
    status: 'active',
    remark: '美国地区',
    createTime: '2024-01-18 16:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-27 17:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LAX', // 洛杉矶国际机场代码
    pid: 'USA',
    code: 'LAX',
    name: '洛杉矶',
    status: 'active',
    remark: '洛杉矶地区',
    createTime: '2024-01-19 17:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-28 18:00:00',
    updateAccount: 'admin'
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

  // 获取树形结构地域数据
  static async getRegionTree() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const regions = [...mockRegions]
        const tree = this.buildTree(regions, '0')
        resolve(tree)
      }, 300)
    })
  }

  // 构建树形结构
  static buildTree(regions, pid) {
    const tree = []
    for (const region of regions) {
      if (region.pid === pid) {
        const children = this.buildTree(regions, region.id)
        if (children.length) {
          region.children = children
        }
        tree.push(region)
      }
    }
    return tree
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

  // 添加地域
  static async addRegion(region) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRegion = {
          ...region,
          id: region.code || generateSnowflakeId(), // 如果提供了code，使用code作为ID
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
        // 检查是否有子节点
        const hasChildren = mockRegions.some(r => r.pid === id)
        if (hasChildren) {
          resolve({ success: false, message: '该地域下有子节点，不能删除' })
          return
        }

        const index = mockRegions.findIndex(r => r.id === id)
        if (index > -1) {
          mockRegions.splice(index, 1)
        }
        resolve({ success: true })
      }, 300)
    })
  }
}

export default RegionService 