import request from '@/utils/request'

// IP防护对象相关接口
export function getIpProtectionList(params) {
  return request({
    url: '/api/protection/ip/list',
    method: 'get',
    params
  })
}

export function addIpProtection(data) {
  return request({
    url: '/api/protection/ip/add',
    method: 'post',
    data
  })
}

export function updateIpProtection(data) {
  return request({
    url: '/api/protection/ip/update',
    method: 'put',
    data
  })
}

export function deleteIpProtection(id) {
  return request({
    url: `/api/protection/ip/delete/${id}`,
    method: 'delete'
  })
}

export function batchDeleteIpProtection(ids) {
  return request({
    url: '/api/protection/ip/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

// 启用IP防护对象
export function enableIpProtection(id) {
  return request({
    url: `/api/protection/ip/enable/${id}`,
    method: 'put'
  })
}

// 禁用IP防护对象
export function disableIpProtection(id) {
  return request({
    url: `/api/protection/ip/disable/${id}`,
    method: 'put'
  })
}

// 获取IP防护对象详情
export function getIpProtectionDetail(id) {
  return request({
    url: `/api/protection/ip/detail/${id}`,
    method: 'get'
  })
}

// 更新IP防护对象配置
export function updateIpProtectionConfig(data) {
  return request({
    url: '/api/protection/ip/config',
    method: 'put',
    data
  })
}

// 获取业务实例的IP组列表
export function getInstanceIpGroups(instanceId) {
  return request({
    url: `/api/business-instance/${instanceId}/ip-groups`,
    method: 'get'
  })
}

// 获取业务实例已分配的防护IP组
export function getInstanceAllocatedIpGroups(instanceId) {
  return request({
    url: `/api/business-instance/${instanceId}/allocated-ip-groups`,
    method: 'get'
  })
}

// 获取IP组详情
export function getIpGroupDetail(groupId) {
  return request({
    url: `/api/ip-group/${groupId}/detail`,
    method: 'get'
  })
}

// 域名防护对象相关接口
export function getDomainProtectionList(params) {
  // 支持的参数：customerName, instanceName, publicIp, domain, status, pageNum, pageSize
  return request({
    url: '/api/protection/domain/list',
    method: 'get',
    params
  })
}

export function addDomainProtection(data) {
  return request({
    url: '/api/protection/domain/add',
    method: 'post',
    data
  })
}

export function updateDomainProtection(data) {
  return request({
    url: '/api/protection/domain/update',
    method: 'put',
    data
  })
}

export function deleteDomainProtection(id) {
  return request({
    url: `/api/protection/domain/delete/${id}`,
    method: 'delete'
  })
}

export function batchDeleteDomainProtection(ids) {
  return request({
    url: '/api/protection/domain/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

export function enableDomainProtection(id) {
  return request({
    url: `/api/protection/domain/enable/${id}`,
    method: 'put'
  })
}

export function disableDomainProtection(id) {
  return request({
    url: `/api/protection/domain/disable/${id}`,
    method: 'put'
  })
}

// 获取业务实例下拉选项
export function getBusinessInstanceOptions() {
  return request({
    url: '/api/business-instance/options',
    method: 'get'
  })
}

// 获取域名防护对象详情
export function getDomainProtectionDetail(id) {
  return request({
    url: `/api/protection/domain/${id}`,
    method: 'get'
  })
}

// 更新域名防护对象配置
export function updateDomainProtectionConfig(data) {
  return request({
    url: `/api/protection/domain/config`,
    method: 'put',
    data
  })
}

/**
 * 获取域名防护对象安全配置
 * @param {number|string} id 域名防护对象ID
 * @returns {Promise<object>} 请求结果
 */
export function getDomainProtectionSecurityConfig(id) {
  return request({
    url: `/api/protection/domain/${id}/security-config`,
    method: 'get'
  })
}

/**
 * 更新域名防护对象安全配置
 * @param {object} data 安全配置数据
 * @returns {Promise<object>} 请求结果
 */
export function updateDomainProtectionSecurityConfig(data) {
  return request({
    url: `/api/protection/domain/${data.id}/security-config`,
    method: 'put',
    data
  })
} 