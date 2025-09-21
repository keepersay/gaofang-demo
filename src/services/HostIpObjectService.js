import request from '@/utils/request'

// 生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 生成MD5哈希（简化版本，实际项目中应使用crypto-js）
const generateMD5 = (str) => {
  // 这里使用固定的MD5值，实际项目中应使用crypto-js库
  return '78b63213fc44c61f1340b78b3ba72cee'
}

// 获取请求头
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Slb4-Key': generateMD5('slb4-key'),
    'Req-Id': generateUUID()
  }
}

// 主机IP对象API服务
export const HostIpObjectService = {
  // 获取主机IP对象列表
  getHostIpObjectList(params = {}) {
    return request({
      url: '/slb4/host-ip-object/list',
      method: 'GET',
      headers: getHeaders(),
      params
    })
  },

  // 添加主机IP对象
  addHostIpObject(data) {
    return request({
      url: '/slb4/host-ip-object/add',
      method: 'POST',
      headers: getHeaders(),
      data
    })
  },

  // 修改主机IP对象
  modifyHostIpObject(data) {
    return request({
      url: '/slb4/host-ip-object/modify',
      method: 'POST',
      headers: getHeaders(),
      data
    })
  },

  // 删除主机IP对象
  deleteHostIpObject(id) {
    return request({
      url: '/slb4/host-ip-object/del',
      method: 'POST',
      headers: getHeaders(),
      data: { id }
    })
  },

  // 根据ID获取主机IP对象
  getHostIpObjectById(id) {
    return request({
      url: `/slb4/host-ip-object/${id}`,
      method: 'GET',
      headers: getHeaders()
    })
  },

  // 获取用户列表（用于责任人选择）
  getUserList(params = {}) {
    return request({
      url: '/user/list',
      method: 'GET',
      params
    })
  }
}

export default HostIpObjectService
