// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `DC${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 模拟机房数据
const mockDataCenters = [
  {
    id: 'DC202401010001',
    name: '北京机房01',
    regionId: 'PEK',
    status: 'active',
    contactPerson: '张三',
    contactPhone: '13800138001',
    contactEmail: 'zhangsan@example.com',
    remark: '北京地区核心机房',
    createTime: '2024-01-01 09:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 09:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202401010002',
    name: '上海机房01',
    regionId: 'SHA',
    status: 'active',
    contactPerson: '李四',
    contactPhone: '13800138002',
    contactEmail: 'lisi@example.com',
    remark: '上海地区核心机房',
    createTime: '2024-01-02 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-02 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202401010003',
    name: '广州机房01',
    regionId: 'CAN',
    status: 'active',
    contactPerson: '王五',
    contactPhone: '13800138003',
    contactEmail: 'wangwu@example.com',
    remark: '广州地区核心机房',
    createTime: '2024-01-03 11:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-03 11:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202401010004',
    name: '无锡机房01',
    regionId: 'WUX',
    status: 'disabled',
    contactPerson: '赵六',
    contactPhone: '13800138004',
    contactEmail: 'zhaoliu@example.com',
    remark: '无锡地区备用机房',
    createTime: '2024-01-04 12:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-04 12:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202407200001',
    name: '首尔机房01',
    regionId: 'ICN',
    status: 'active',
    contactPerson: '金智恩',
    contactPhone: '+82-10-1234-5678',
    contactEmail: 'jieun.kim@example.kr',
    remark: '韩国首尔核心数据中心',
    createTime: '2024-05-10 09:00:00',
    createAccount: 'admin',
    updateTime: '2024-05-10 09:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202407200002',
    name: '法兰克福机房01',
    regionId: 'FRA',
    status: 'active',
    contactPerson: 'Hans Schmidt',
    contactPhone: '+49-89-12345678',
    contactEmail: 'hans.schmidt@example.de',
    remark: '德国法兰克福高性能数据中心',
    createTime: '2024-04-15 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-04-15 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202407200003',
    name: '迪拜机房01',
    regionId: 'DXB',
    status: 'active',
    contactPerson: 'Mohammad Al-Farsi',
    contactPhone: '+971-4-123-4567',
    contactEmail: 'mohammad.alfarsi@example.ae',
    remark: '阿联酋迪拜核心数据中心',
    createTime: '2024-03-20 11:00:00',
    createAccount: 'admin',
    updateTime: '2024-03-20 11:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'DC202407200004',
    name: '洛杉矶机房01',
    regionId: 'LAX',
    status: 'active',
    contactPerson: 'John Smith',
    contactPhone: '+1-213-555-1234',
    contactEmail: 'john.smith@example.com',
    remark: '美国洛杉矶高带宽数据中心',
    createTime: '2024-02-25 08:00:00',
    createAccount: 'admin',
    updateTime: '2024-02-25 08:00:00',
    updateAccount: 'admin'
  }
]

class DataCenterService {
  // 获取所有机房
  static async getDataCenters() {
    // 模拟异步请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDataCenters)
      }, 300)
    })
  }

  // 根据ID获取机房
  static async getDataCenterById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dataCenter = mockDataCenters.find(dc => dc.id === id)
        if (dataCenter) {
          resolve(dataCenter)
        } else {
          reject(new Error('机房不存在'))
        }
      }, 100)
    })
  }

  // 添加机房
  static async addDataCenter(dataCenter) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDataCenter = {
          ...dataCenter,
          id: generateSnowflakeId(),
          createTime: new Date().toLocaleString(),
          createAccount: 'current_user',
          updateTime: new Date().toLocaleString(),
          updateAccount: 'current_user'
        }
        mockDataCenters.push(newDataCenter)
        resolve(newDataCenter)
      }, 300)
    })
  }

  // 更新机房
  static async updateDataCenter(id, dataCenter) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockDataCenters.findIndex(dc => dc.id === id)
        if (index > -1) {
          mockDataCenters[index] = {
            ...mockDataCenters[index],
            ...dataCenter,
            updateTime: new Date().toLocaleString(),
            updateAccount: 'current_user'
          }
          resolve(mockDataCenters[index])
        } else {
          resolve(null)
        }
      }, 300)
    })
  }

  // 删除机房
  static async deleteDataCenter(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockDataCenters.findIndex(dc => dc.id === id)
        if (index > -1) {
          mockDataCenters.splice(index, 1)
        }
        resolve({ success: true })
      }, 300)
    })
  }
}

export default DataCenterService 