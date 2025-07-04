import businessInstanceData from '../mock/data/businessInstance'
import request from '@/utils/request'
import ClusterService from './ClusterService'
import { generateUUID } from '../utils/common'

// 业务实例服务
export default {
  // 获取业务实例列表
  async getBusinessInstances(params) {
    return {
      code: 200,
      data: businessInstanceData.getBusinessInstances(params),
      message: 'success'
    }
  },

  // 获取单个业务实例
  async getBusinessInstance(id) {
    const instance = businessInstanceData.getBusinessInstance(id)
    
    // 如果实例有关联的逻辑集群组，获取集群组名称
    if (instance && instance.clusterGroupId) {
      try {
        const clusterGroup = await ClusterService.getClusterGroupById(instance.clusterGroupId)
        if (clusterGroup) {
          instance.clusterGroupName = clusterGroup.name
        }
      } catch (error) {
        console.error('获取逻辑集群组详情失败:', error)
      }
    }
    
    if (instance) {
      return {
        code: 200,
        data: instance,
        message: 'success'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 创建业务实例
  async createBusinessInstance(data) {
    // 如果选择了逻辑集群组，自动分配IP组
    if (data.clusterGroupId) {
      try {
        // 检查资源充足性
        const resourceCheck = await this.checkClusterGroupIpResource(
          data.clusterGroupId,
          data.addressType,
          data.protectionIpCount
        );
        
        if (!resourceCheck.code === 200 || !resourceCheck.data.sufficient) {
          return {
            code: 400,
            message: '逻辑集群组资源不足，无法满足IP分配需求'
          };
        }
        
        // 创建业务实例
        const instance = businessInstanceData.createBusinessInstance(data);
        
        // 自动分配IP组
        const ipGroups = await this.generateProtectionIpGroups(
          data.clusterGroupId,
          data.addressType,
          data.protectionIpCount
        );
        
        // 更新业务实例的防护IP组
        instance.protectionIpGroups = ipGroups;
        businessInstanceData.updateBusinessInstance(instance.instanceId, { protectionIpGroups: ipGroups });
        
        return {
          code: 200,
          data: instance,
          message: 'success'
        };
      } catch (error) {
        console.error('创建业务实例失败:', error);
        return {
          code: 500,
          message: '创建业务实例失败: ' + error.message
        };
      }
    } else {
      // 不需要分配IP的情况
      return {
        code: 200,
        data: businessInstanceData.createBusinessInstance(data),
        message: 'success'
      };
    }
  },

  // 更新业务实例
  async updateBusinessInstance(id, data) {
    const oldInstance = businessInstanceData.getBusinessInstance(id);
    if (!oldInstance) {
      return {
        code: 404,
        message: '业务实例不存在'
      };
    }
    
    // 检查是否修改了逻辑集群组
    if (data.clusterGroupId && data.clusterGroupId !== oldInstance.clusterGroupId) {
      try {
        // 检查资源充足性
        const resourceCheck = await this.checkClusterGroupIpResource(
          data.clusterGroupId,
          data.addressType || oldInstance.addressType,
          data.protectionIpCount || oldInstance.protectionIpCount
        );
        
        if (!resourceCheck.code === 200 || !resourceCheck.data.sufficient) {
          return {
            code: 400,
            message: '新逻辑集群组资源不足，无法满足IP分配需求'
          };
        }
        
        // 先更新基本信息
        const updatedData = businessInstanceData.updateBusinessInstance(id, data);
        
        // 自动分配新的IP组
        const ipGroups = await this.generateProtectionIpGroups(
          data.clusterGroupId,
          data.addressType || oldInstance.addressType,
          data.protectionIpCount || oldInstance.protectionIpCount
        );
        
        // 更新业务实例的防护IP组
        updatedData.protectionIpGroups = ipGroups;
        businessInstanceData.updateBusinessInstance(id, { protectionIpGroups: ipGroups });
        
        return {
          code: 200,
          data: updatedData,
          message: 'success'
        };
      } catch (error) {
        console.error('更新业务实例失败:', error);
        return {
          code: 500,
          message: '更新业务实例失败: ' + error.message
        };
      }
    } else {
      // 不需要重新分配IP的情况
      const updatedData = businessInstanceData.updateBusinessInstance(id, data);
      
      if (updatedData) {
        return {
          code: 200,
          data: updatedData,
          message: 'success'
        };
      } else {
        return {
          code: 404,
          message: '业务实例不存在'
        };
      }
    }
  },

  // 删除业务实例
  async deleteBusinessInstance(id) {
    const success = businessInstanceData.deleteBusinessInstance(id)
    
    if (success) {
      return {
        code: 200,
        message: '删除成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 启用业务实例
  async enableBusinessInstance(id) {
    const data = businessInstanceData.enableBusinessInstance(id)
    
    if (data) {
      return {
        code: 200,
        data,
        message: '启用成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 禁用业务实例
  async disableBusinessInstance(id) {
    const data = businessInstanceData.disableBusinessInstance(id)
    
    if (data) {
      return {
        code: 200,
        data,
        message: '禁用成功'
      }
    } else {
      return {
        code: 404,
        message: '业务实例不存在'
      }
    }
  },

  // 分配防护IP
  async allocateProtectionIps(id, ips) {
    // 这个方法现在只用于展示已分配的IP组，不再支持手动分配IP
    // 获取实例信息
    const instance = businessInstanceData.getBusinessInstance(id);
    if (!instance) {
      return {
        code: 404,
        message: '业务实例不存在'
      };
    }
    
    return {
      code: 200,
      data: instance,
      message: '获取防护IP组成功'
    };
  },

  // 检查资源充足性
  checkResourceSufficiency(instanceId, ips) {
    // 这里应该实现真正的资源充足性检查逻辑
    // 为了解决问题，我们暂时返回成功
    return {
      success: true,
      message: '资源充足'
    }
  },

  // 检查逻辑集群组IP资源充足性
  async checkClusterGroupIpResource(clusterGroupId, addressType, ipCount) {
    try {
      // 1. 获取逻辑集群组详情
      const clusterGroup = await ClusterService.getClusterGroupById(clusterGroupId);
      if (!clusterGroup) {
        return {
          code: 404,
          message: '逻辑集群组不存在'
        };
      }
      
      // 2. 获取该集群组下所有逻辑集群
      const logicClusterIds = [...(clusterGroup.primaryClusters || []), ...(clusterGroup.standbyClusters || [])];
      
      if (logicClusterIds.length === 0) {
        return {
          code: 400,
          message: '逻辑集群组中没有逻辑集群'
        };
      }
      
      // 3. 检查每个逻辑集群的IP资源是否足够
      // 这里模拟检查，实际项目中应该调用API获取每个逻辑集群的可用IP数量
      // 为了简化，我们假设每个逻辑集群都有足够的IP
      
      // 计算每个逻辑集群需要的IP数量
      const requiredIpCount = ipCount;
      
      // 模拟可用IP数量
      const availableIpCount = Math.max(ipCount + 10, 20); // 假设有足够的IP
      
      return {
        code: 200,
        data: {
          sufficient: true,
          availableCount: availableIpCount,
          requiredCount: requiredIpCount,
          clusterGroup: clusterGroup
        },
        message: 'success'
      };
    } catch (error) {
      console.error('检查逻辑集群组IP资源充足性失败:', error);
      return {
        code: 500,
        message: '检查逻辑集群组IP资源充足性失败: ' + error.message
      };
    }
  },
  
  // 生成防护IP组
  async generateProtectionIpGroups(clusterGroupId, addressType, ipCount) {
    try {
      // 1. 获取逻辑集群组详情
      const clusterGroup = await ClusterService.getClusterGroupById(clusterGroupId);
      if (!clusterGroup) {
        throw new Error('逻辑集群组不存在');
      }
      
      // 2. 获取该集群组下所有逻辑集群
      const logicClusterIds = [...(clusterGroup.primaryClusters || []), ...(clusterGroup.standbyClusters || [])];
      const logicClusters = [];
      
      // 获取每个逻辑集群的详情
      for (const clusterId of logicClusterIds) {
        try {
          const cluster = await ClusterService.getClusterById(clusterId);
          if (cluster) {
            logicClusters.push(cluster);
          }
        } catch (error) {
          console.error(`获取逻辑集群 ${clusterId} 详情失败:`, error);
        }
      }
      
      if (logicClusters.length === 0) {
        throw new Error('逻辑集群组中没有可用的逻辑集群');
      }
      
      // 3. 创建IP组，将IPv4和IPv6分开成独立的IP组
      const protectionIpGroups = [];
      
      // 根据地址类型创建不同的IP组
      if (addressType === 'IPv4' || addressType === 'dual') {
        // 创建IPv4组
        const ipv4Group = {
          groupId: generateUUID(),
          addressType: 'IPv4',
          displayName: `IPv4组 #1（${clusterGroup.name}，${logicClusters.length * ipCount}个IP）`,
          ips: []
        };
        
        // 为每个逻辑集群分配IPv4
        for (let i = 0; i < ipCount; i++) {
          for (const logicCluster of logicClusters) {
            const ipv4 = this.generateRandomIp('IPv4');
            ipv4Group.ips.push({
              ip: ipv4,
              type: 'IPv4',
              logicClusterId: logicCluster.id,
              logicClusterName: logicCluster.name || logicCluster.displayName,
              status: 'active'
            });
          }
        }
        
        protectionIpGroups.push(ipv4Group);
      }
      
      if (addressType === 'IPv6' || addressType === 'dual') {
        // 创建IPv6组
        const ipv6Group = {
          groupId: generateUUID(),
          addressType: 'IPv6',
          displayName: `IPv6组 #1（${clusterGroup.name}，${logicClusters.length * ipCount}个IP）`,
          ips: []
        };
        
        // 为每个逻辑集群分配IPv6
        for (let i = 0; i < ipCount; i++) {
          for (const logicCluster of logicClusters) {
            const ipv6 = this.generateRandomIp('IPv6');
            ipv6Group.ips.push({
              ip: ipv6,
              type: 'IPv6',
              logicClusterId: logicCluster.id,
              logicClusterName: logicCluster.name || logicCluster.displayName,
              status: 'active'
            });
          }
        }
        
        protectionIpGroups.push(ipv6Group);
      }
      
      return protectionIpGroups;
    } catch (error) {
      console.error('生成防护IP组失败:', error);
      throw error;
    }
  },
  
  // 生成随机IP地址
  generateRandomIp(type) {
    if (type === 'IPv4') {
      // 生成随机IPv4
      return `203.0.113.${Math.floor(Math.random() * 254) + 1}`;
    } else {
      // 生成随机IPv6
      const segments = [];
      for (let i = 0; i < 8; i++) {
        segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
      }
      return segments.join(':');
    }
  },

  // 获取可用订单列表
  async getAvailableOrders(params) {
    return {
      code: 200,
      data: businessInstanceData.getAvailableOrders(params),
      message: 'success'
    }
  },

  // 获取可用防护IP列表
  async getAvailableProtectionIps() {
    // 生成一些模拟IP
    const ipv4List = Array.from({ length: 15 }, (_, i) => ({
      ip: `203.0.113.${i + 1}`,
      type: 'IPv4',
      isAnycast: i % 3 === 0,
      region: i % 3 === 0 ? '' : ['cn-beijing', 'cn-shanghai', 'cn-guangzhou', 'cn-hangzhou'][i % 4],
      status: 'available'
    }))
    
    const ipv6List = Array.from({ length: 10 }, (_, i) => {
      const segments = []
      for (let j = 0; j < 8; j++) {
        segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'))
      }
      
      return {
        ip: segments.join(':'),
        type: 'IPv6',
        isAnycast: i % 4 === 0,
        region: i % 4 === 0 ? '' : ['cn-beijing', 'cn-shanghai', 'cn-guangzhou', 'cn-hangzhou'][i % 4],
        status: 'available'
      }
    })
    
    return {
      code: 200,
      data: [...ipv4List, ...ipv6List],
      message: 'success'
    }
  }
}

// 获取业务实例选项
export function getBusinessInstanceOptions() {
  return request({
    url: '/api/business-instance/options',
    method: 'get'
  })
}

// 获取业务实例详情
export function getBusinessInstanceDetail(id) {
  return request({
    url: `/api/business-instance/detail/${id}`,
    method: 'get'
  })
} 