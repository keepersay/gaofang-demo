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
          
          records.push({
            id: `IPAL${String(index + 1).padStart(6, '0')}`,
            ipAddress: `192.168.${Math.floor(index / 255) + 1}.${index % 255 + 1}`,
            instanceId: `INST${String(Math.floor(index / 3) + 1).padStart(6, '0')}`,
            instanceName: `业务实例-${Math.floor(index / 3) + 1}`,
            customerId: `CUST${String(Math.floor(index / 10) + 1).padStart(4, '0')}`,
            customerName: `客户-${Math.floor(index / 10) + 1}`,
            operationType,
            operationTime: baseTime.toISOString(),
            operatorId: `USER${String(index % 5 + 1).padStart(4, '0')}`,
            operatorName: `操作员-${index % 5 + 1}`,
            ipPoolId: `POOL${String(index % 3 + 1).padStart(4, '0')}`,
            ipPoolName: `IP池-${index % 3 + 1}`,
            regionId: `region-${index % 6 + 1}`,
            regionName: `地域-${index % 6 + 1}`,
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
        
        if (params.regionId) {
          filteredRecords = filteredRecords.filter(
            record => record.regionId === params.regionId
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
        
        resolve({
          id,
          ipAddress: `192.168.${Math.floor(index / 255) + 1}.${index % 255 + 1}`,
          instanceId: `INST${String(Math.floor(index / 3) + 1).padStart(6, '0')}`,
          instanceName: `业务实例-${Math.floor(index / 3) + 1}`,
          customerId: `CUST${String(Math.floor(index / 10) + 1).padStart(4, '0')}`,
          customerName: `客户-${Math.floor(index / 10) + 1}`,
          operationType,
          operationTime: baseTime.toISOString(),
          operatorId: `USER${String(index % 5 + 1).padStart(4, '0')}`,
          operatorName: `操作员-${index % 5 + 1}`,
          ipPoolId: `POOL${String(index % 3 + 1).padStart(4, '0')}`,
          ipPoolName: `IP池-${index % 3 + 1}`,
          regionId: `region-${index % 6 + 1}`,
          regionName: `地域-${index % 6 + 1}`,
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
          { id: 'POOL0001', name: 'IP池-1' },
          { id: 'POOL0002', name: 'IP池-2' },
          { id: 'POOL0003', name: 'IP池-3' }
        ]);
      }, 200);
    });
  }
  
  /**
   * 获取地域列表（用于过滤）
   * @returns {Promise<Array>} 地域列表
   */
  async getRegions() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'region-1', name: '地域-1' },
          { id: 'region-2', name: '地域-2' },
          { id: 'region-3', name: '地域-3' },
          { id: 'region-4', name: '地域-4' },
          { id: 'region-5', name: '地域-5' },
          { id: 'region-6', name: '地域-6' }
        ]);
      }, 200);
    });
  }
}

export default new IpAllocationLogService(); 