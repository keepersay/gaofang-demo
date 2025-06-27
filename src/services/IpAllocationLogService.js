/**
 * IP分配历史服务
 * 用于查询和管理IP分配历史记录
 */
class IpAllocationLogService {
  /**
   * 查询IP分配历史记录
   * @param {Object} params 查询参数
   * @param {string} [params.ipAddress] IP地址
   * @param {string} [params.instanceId] 业务实例ID
   * @param {string} [params.customerId] 客户ID
   * @param {string} [params.operationType] 操作类型
   * @param {Array} [params.dateRange] 时间范围
   * @param {number} [params.pageNum=1] 页码
   * @param {number} [params.pageSize=10] 每页条数
   * @returns {Promise<Object>} 分页数据
   */
  async queryIpAllocationLogs(params) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        // 真实客户数据
        const customers = [
          { id: 'CUST0001', name: '阿里云科技有限公司' },
          { id: 'CUST0002', name: '腾讯科技(深圳)有限公司' },
          { id: 'CUST0003', name: '百度在线网络技术(北京)有限公司' },
          { id: 'CUST0004', name: '京东科技控股股份有限公司' },
          { id: 'CUST0005', name: '字节跳动有限公司' },
          { id: 'CUST0006', name: '网易(杭州)网络有限公司' },
          { id: 'CUST0007', name: '华为技术有限公司' },
          { id: 'CUST0008', name: '小米科技有限责任公司' }
        ];
        
        // 真实业务实例
        const instances = [
          { id: 'INST000001', name: '电商平台-主站' },
          { id: 'INST000002', name: '视频服务-CDN' },
          { id: 'INST000003', name: '支付系统-核心' },
          { id: 'INST000004', name: '游戏平台-国际版' },
          { id: 'INST000005', name: '企业邮箱-集群1' },
          { id: 'INST000006', name: '云存储-北区' },
          { id: 'INST000007', name: '数据库服务-主节点' },
          { id: 'INST000008', name: '人工智能-推理集群' },
          { id: 'INST000009', name: '直播平台-边缘节点' },
          { id: 'INST000010', name: '物联网-数据中心' }
        ];
        
        // 真实IP池
        const ipPools = [
          { id: 'POOL0001', name: '电信骨干网-BGP' },
          { id: 'POOL0002', name: '联通骨干网-BGP' },
          { id: 'POOL0003', name: '移动骨干网-BGP' },
          { id: 'POOL0004', name: '国际线路-香港' },
          { id: 'POOL0005', name: '国际线路-新加坡' },
          { id: 'POOL0006', name: 'Anycast全球加速' }
        ];
        
        // 真实IP段
        const ipRanges = [
          '103.24.178.0/24',
          '103.24.179.0/24',
          '103.215.32.0/22',
          '116.128.128.0/17',
          '118.26.96.0/21',
          '118.26.104.0/21',
          '118.26.112.0/21',
          '118.26.120.0/21',
          '118.26.128.0/21',
          '119.28.0.0/16',
          '119.29.0.0/16',
          '120.88.56.0/23',
          '121.51.0.0/16',
          '122.152.192.0/18',
          '123.206.0.0/16',
          '129.204.0.0/16',
          '129.211.0.0/16',
          '129.226.0.0/16',
          '2402:4e00::/32',
          '2407:c080::/32'
        ];
        
        // 生成模拟数据
        const total = 100;
        const { pageNum = 1, pageSize = 10 } = params;
        const records = [];
        
        for (let i = 0; i < pageSize; i++) {
          const index = (pageNum - 1) * pageSize + i;
          if (index >= total) break;
          
          const isAllocate = index % 3 !== 0; // 2/3是分配，1/3是回收
          const operationType = isAllocate ? 'allocate' : 'reclaim';
          const baseTime = new Date();
          baseTime.setDate(baseTime.getDate() - index);
          
          // 随机选择客户、实例和IP池
          const customer = customers[index % customers.length];
          const instance = instances[index % instances.length];
          const ipPool = ipPools[index % ipPools.length];
          
          // 从IP段中生成一个IP地址
          const ipRange = ipRanges[index % ipRanges.length];
          const ipBase = ipRange.split('/')[0];
          const ipParts = ipBase.split('.');
          const lastOctet = (parseInt(ipParts[3]) + index) % 255;
          const ipAddress = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${lastOctet}`;
          
          records.push({
            id: `IPAL${String(index + 1).padStart(6, '0')}`,
            ipAddress,
            instanceId: instance.id,
            instanceName: instance.name,
            customerId: customer.id,
            customerName: customer.name,
            operationType,
            operationTime: baseTime.toISOString(),
            operatorId: `USER${String(index % 5 + 1).padStart(4, '0')}`,
            operatorName: `操作员-${index % 5 + 1}`,
            ipPoolId: ipPool.id,
            ipPoolName: ipPool.name,
            remark: operationType === 'allocate' 
              ? `分配IP用于${['Web服务', 'API服务', '数据库服务', '缓存服务', '负载均衡'][index % 5]}`
              : `回收闲置IP资源`
          });
        }
        
        // 过滤逻辑
        let filteredRecords = [...records];
        
        if (params.ipAddress) {
          filteredRecords = filteredRecords.filter(
            record => record.ipAddress.includes(params.ipAddress)
          );
        }
        
        if (params.instanceId) {
          filteredRecords = filteredRecords.filter(
            record => record.instanceId.includes(params.instanceId) || 
                     record.instanceName.includes(params.instanceId)
          );
        }
        
        if (params.customerId) {
          filteredRecords = filteredRecords.filter(
            record => record.customerId.includes(params.customerId) || 
                     record.customerName.includes(params.customerId)
          );
        }
        
        if (params.operationType) {
          filteredRecords = filteredRecords.filter(
            record => record.operationType === params.operationType
          );
        }
        
        if (params.ipPoolId) {
          filteredRecords = filteredRecords.filter(
            record => record.ipPoolId === params.ipPoolId
          );
        }
        
        if (params.dateRange && params.dateRange.length === 2) {
          const startDate = new Date(params.dateRange[0]);
          const endDate = new Date(params.dateRange[1]);
          filteredRecords = filteredRecords.filter(record => {
            const recordDate = new Date(record.operationTime);
            return recordDate >= startDate && recordDate <= endDate;
          });
        }
        
        resolve({
          records: filteredRecords,
          total: Math.min(total, filteredRecords.length),
          pageNum,
          pageSize
        });
      }, 500);
    });
  }
  
  /**
   * 获取IP分配历史详情
   * @param {string} id 记录ID
   * @returns {Promise<Object>} 详细信息
   */
  async getIpAllocationLogDetail(id) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = parseInt(id.replace('IPAL', '')) - 1;
        const isAllocate = index % 3 !== 0;
        const operationType = isAllocate ? 'allocate' : 'reclaim';
        const baseTime = new Date();
        baseTime.setDate(baseTime.getDate() - index);
        
        // 真实客户数据
        const customers = [
          { id: 'CUST0001', name: '阿里云科技有限公司' },
          { id: 'CUST0002', name: '腾讯科技(深圳)有限公司' },
          { id: 'CUST0003', name: '百度在线网络技术(北京)有限公司' },
          { id: 'CUST0004', name: '京东科技控股股份有限公司' },
          { id: 'CUST0005', name: '字节跳动有限公司' },
          { id: 'CUST0006', name: '网易(杭州)网络有限公司' },
          { id: 'CUST0007', name: '华为技术有限公司' },
          { id: 'CUST0008', name: '小米科技有限责任公司' }
        ];
        
        // 真实业务实例
        const instances = [
          { id: 'INST000001', name: '电商平台-主站' },
          { id: 'INST000002', name: '视频服务-CDN' },
          { id: 'INST000003', name: '支付系统-核心' },
          { id: 'INST000004', name: '游戏平台-国际版' },
          { id: 'INST000005', name: '企业邮箱-集群1' },
          { id: 'INST000006', name: '云存储-北区' },
          { id: 'INST000007', name: '数据库服务-主节点' },
          { id: 'INST000008', name: '人工智能-推理集群' },
          { id: 'INST000009', name: '直播平台-边缘节点' },
          { id: 'INST000010', name: '物联网-数据中心' }
        ];
        
        // 真实IP池
        const ipPools = [
          { id: 'POOL0001', name: '电信骨干网-BGP' },
          { id: 'POOL0002', name: '联通骨干网-BGP' },
          { id: 'POOL0003', name: '移动骨干网-BGP' },
          { id: 'POOL0004', name: '国际线路-香港' },
          { id: 'POOL0005', name: '国际线路-新加坡' },
          { id: 'POOL0006', name: 'Anycast全球加速' }
        ];
        
        // 真实IP段
        const ipRanges = [
          '103.24.178.0/24',
          '103.24.179.0/24',
          '103.215.32.0/22',
          '116.128.128.0/17',
          '118.26.96.0/21',
          '118.26.104.0/21'
        ];
        
        // 随机选择客户、实例和IP池
        const customer = customers[index % customers.length];
        const instance = instances[index % instances.length];
        const ipPool = ipPools[index % ipPools.length];
        
        // 从IP段中生成一个IP地址
        const ipRange = ipRanges[index % ipRanges.length];
        const ipBase = ipRange.split('/')[0];
        const ipParts = ipBase.split('.');
        const lastOctet = (parseInt(ipParts[3]) + index) % 255;
        const ipAddress = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${lastOctet}`;
        
        resolve({
          id,
          ipAddress,
          instanceId: instance.id,
          instanceName: instance.name,
          customerId: customer.id,
          customerName: customer.name,
          operationType,
          operationTime: baseTime.toISOString(),
          operatorId: `USER${String(index % 5 + 1).padStart(4, '0')}`,
          operatorName: `操作员-${index % 5 + 1}`,
          ipPoolId: ipPool.id,
          ipPoolName: ipPool.name,
          remark: operationType === 'allocate' 
            ? `分配IP用于${['Web服务', 'API服务', '数据库服务', '缓存服务', '负载均衡'][index % 5]}`
            : `回收闲置IP资源`,
          // 额外的详情信息
          requestId: `REQ${String(index + 1000).padStart(8, '0')}`,
          approvalStatus: 'approved',
          approvalTime: new Date(baseTime.getTime() - 3600000).toISOString(),
          approvalBy: `审批员-${index % 3 + 1}`,
          networkType: ['公网', '内网', '混合'][index % 3],
          bandwidth: `${(index % 10 + 1) * 100}Mbps`,
          ipVersion: ['IPv4', 'IPv6', 'Dual Stack'][index % 3],
          ipSegment: ipRange,
          createTime: new Date(baseTime.getTime() - 7200000).toISOString(),
          updateTime: baseTime.toISOString()
        });
      }, 300);
    });
  }
  
  /**
   * 导出IP分配历史数据
   * @param {Object} params 查询参数，同queryIpAllocationLogs
   * @returns {Promise<string>} 文件下载链接
   */
  async exportIpAllocationLogs(params) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        // 实际应用中，这里应该返回文件下载链接或Blob
        resolve({
          success: true,
          message: '导出成功',
          url: '#'
        });
      }, 1000);
    });
  }
  
  /**
   * 获取IP池列表（用于过滤）
   * @returns {Promise<Array>} IP池列表
   */
  async getIpPools() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'POOL0001', name: '电信骨干网-BGP' },
          { id: 'POOL0002', name: '联通骨干网-BGP' },
          { id: 'POOL0003', name: '移动骨干网-BGP' },
          { id: 'POOL0004', name: '国际线路-香港' },
          { id: 'POOL0005', name: '国际线路-新加坡' },
          { id: 'POOL0006', name: 'Anycast全球加速' }
        ]);
      }, 200);
    });
  }
}

export default new IpAllocationLogService(); 