// 网池管理 mock 服务
const mockDataCenters = [
  { id: 'dc1', name: '北京机房' },
  { id: 'dc2', name: '上海机房' },
  { id: 'dc3', name: '广州机房' }
];
let mockIpPools = [
  {
    id: 'LCG1000000001',
    name: '业务网池A',
    protocol: 'IPV4',
    ranges: ['192.168.1.0/24', '192.168.2.1-192.168.2.100'],
    dataCenterId: 'dc1',
    isAnycast: false,
    status: 'ENABLED',
    remark: '测试用',
    createdAt: '2024-06-01 10:00',
    createdBy: 'admin',
    updatedAt: '2024-06-01 10:00',
    updatedBy: 'admin',
    usedCount: 10,
    availableCount: 244
  },
  {
    id: 'LCG1000000002',
    name: 'Anycast池',
    protocol: 'IPV4',
    ranges: ['10.0.0.0/24'],
    dataCenterId: '',
    isAnycast: true,
    status: 'DISABLED',
    remark: '',
    createdAt: '2024-06-02 11:00',
    createdBy: 'user1',
    updatedAt: '2024-06-02 11:00',
    updatedBy: 'user1',
    usedCount: 0,
    availableCount: 256
  },
  {
    id: 'LCG1000000003',
    name: '防护网池',
    protocol: 'IPV4',
    ranges: ['172.16.0.0/16'],
    dataCenterId: 'dc1',
    isAnycast: false,
    status: 'ENABLED',
    remark: '用于DDoS防护',
    createdAt: '2024-06-03 09:30',
    createdBy: 'admin',
    updatedAt: '2024-06-03 09:30',
    updatedBy: 'admin',
    usedCount: 25,
    availableCount: 65511
  },
  {
    id: 'LCG1000000004',
    name: '上海业务网池',
    protocol: 'IPV4',
    ranges: ['192.170.0.0/24', '192.170.1.0/24'],
    dataCenterId: 'dc2',
    isAnycast: false,
    status: 'ENABLED',
    remark: '上海机房专用',
    createdAt: '2024-06-04 14:15',
    createdBy: 'operator1',
    updatedAt: '2024-06-04 14:15',
    updatedBy: 'operator1',
    usedCount: 120,
    availableCount: 392
  },
  {
    id: 'LCG1000000005',
    name: 'IPv6测试池',
    protocol: 'IPV6',
    ranges: ['2001:db8::/64'],
    dataCenterId: 'dc3',
    isAnycast: false,
    status: 'ENABLED',
    remark: 'IPv6测试用途',
    createdAt: '2024-06-05 11:20',
    createdBy: 'tester',
    updatedAt: '2024-06-05 11:20',
    updatedBy: 'tester',
    usedCount: 5,
    availableCount: 18446744073709551610
  },
  {
    id: 'LCG1000000006',
    name: '广州备用池',
    protocol: 'IPV4',
    ranges: ['10.10.0.0/16'],
    dataCenterId: 'dc3',
    isAnycast: false,
    status: 'DISABLED',
    remark: '备用资源',
    createdAt: '2024-06-06 16:40',
    createdBy: 'admin',
    updatedAt: '2024-06-06 16:40',
    updatedBy: 'admin',
    usedCount: 0,
    availableCount: 65536
  },
  {
    id: 'LCG1000000007',
    name: 'Anycast全球加速',
    protocol: 'IPV4',
    ranges: ['103.21.244.0/24'],
    dataCenterId: '',
    isAnycast: true,
    status: 'ENABLED',
    remark: '全球加速网络',
    createdAt: '2024-06-07 08:30',
    createdBy: 'network_admin',
    updatedAt: '2024-06-07 08:30',
    updatedBy: 'network_admin',
    usedCount: 200,
    availableCount: 56
  },
  {
    id: 'LCG1000000008',
    name: '内部测试网池',
    protocol: 'IPV4',
    ranges: ['192.168.100.0/24', '192.168.101.0/24', '192.168.102.0/24'],
    dataCenterId: 'dc1',
    isAnycast: false,
    status: 'ENABLED',
    remark: '仅供内部测试使用',
    createdAt: '2024-06-08 10:15',
    createdBy: 'test_admin',
    updatedAt: '2024-06-08 10:15',
    updatedBy: 'test_admin',
    usedCount: 45,
    availableCount: 723
  },
  {
    id: 'LCG1000000009',
    name: 'IPv6生产池',
    protocol: 'IPV6',
    ranges: ['2001:0db8:85a3::/64', '2001:0db8:85a4::/64'],
    dataCenterId: 'dc2',
    isAnycast: false,
    status: 'ENABLED',
    remark: 'IPv6生产环境',
    createdAt: '2024-06-09 13:45',
    createdBy: 'prod_admin',
    updatedAt: '2024-06-09 13:45',
    updatedBy: 'prod_admin',
    usedCount: 120,
    availableCount: 36893488147419103230
  },
  {
    id: 'LCG1000000010',
    name: '混合网池',
    protocol: 'IPV4',
    ranges: ['172.31.0.0/16', '172.32.0.0/16'],
    dataCenterId: 'dc3',
    isAnycast: false,
    status: 'ENABLED',
    remark: '混合业务使用',
    createdAt: '2024-06-10 09:00',
    createdBy: 'system',
    updatedAt: '2024-06-10 09:00',
    updatedBy: 'system',
    usedCount: 1024,
    availableCount: 130048
  },
  {
    id: 'LCG1000000011',
    name: 'Anycast备用池',
    protocol: 'IPV4',
    ranges: ['103.22.200.0/24', '103.22.201.0/24'],
    dataCenterId: '',
    isAnycast: true,
    status: 'DISABLED',
    remark: 'Anycast备用资源',
    createdAt: '2024-06-11 14:30',
    createdBy: 'network_admin',
    updatedAt: '2024-06-11 14:30',
    updatedBy: 'network_admin',
    usedCount: 0,
    availableCount: 512
  }
];
let mockAllocatedIPs = {
  'LCG1000000001': [
    { segmentId: '192.168.1.0/24', ip: '192.168.1.10', ipInt: 3232235786, clusterName: '集群A', instanceId: 'ins-1', customerId: 'cust-1', remark: '' },
    { segmentId: '192.168.2.1-192.168.2.100', ip: '192.168.2.50', ipInt: 3232236098, clusterName: '集群B', instanceId: 'ins-2', customerId: 'cust-2', remark: '' }
  ],
  'LCG1000000002': [],
  'LCG1000000003': [
    { segmentId: '172.16.0.0/16', ip: '172.16.1.1', ipInt: 2886729985, clusterName: '防护集群A', instanceId: 'ins-10', customerId: 'cust-5', remark: '防火墙实例' }
  ],
  'LCG1000000004': [
    { segmentId: '192.170.0.0/24', ip: '192.170.0.10', ipInt: 3232301066, clusterName: '上海集群A', instanceId: 'ins-sh-1', customerId: 'cust-3', remark: '' },
    { segmentId: '192.170.0.0/24', ip: '192.170.0.11', ipInt: 3232301067, clusterName: '上海集群A', instanceId: 'ins-sh-2', customerId: 'cust-3', remark: '' }
  ],
  'LCG1000000005': [
    { segmentId: '2001:db8::/64', ip: '2001:db8::1', ipInt: 0, clusterName: 'IPv6测试集群', instanceId: 'ins-ipv6-1', customerId: 'cust-4', remark: 'IPv6测试实例' }
  ],
  'LCG1000000007': [
    { segmentId: '103.21.244.0/24', ip: '103.21.244.10', ipInt: 1732327434, clusterName: '全球加速集群', instanceId: 'ins-cdn-1', customerId: 'cust-10', remark: 'CDN节点' }
  ],
  'LCG1000000008': [
    { segmentId: '192.168.100.0/24', ip: '192.168.100.5', ipInt: 3232261125, clusterName: '测试集群', instanceId: 'ins-test-1', customerId: 'internal', remark: '测试用例' }
  ]
};

export function fetchIpPools(filters, pagination) {
  let data = mockIpPools.filter(pool => {
    if (filters.protocol && pool.protocol !== filters.protocol) return false;
    if (filters.dataCenterId && pool.dataCenterId !== filters.dataCenterId) return false;
    if (filters.status && pool.status !== filters.status) return false;
    if (filters.name && !pool.name.includes(filters.name)) return false;
    if (filters.isAnycast !== undefined && filters.isAnycast !== '' && pool.isAnycast !== (filters.isAnycast === 'true')) return false;
    return true;
  });
  const total = data.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  data = data.slice(start, end);
  return Promise.resolve({ list: data, total });
}
export function fetchDataCenters() {
  return Promise.resolve(mockDataCenters);
}
export function deleteIpPool(id) {
  mockIpPools = mockIpPools.filter(pool => pool.id !== id);
  return Promise.resolve();
}
export function saveIpPool(data) {
  if (data.id) {
    // 编辑
    mockIpPools = mockIpPools.map(pool => pool.id === data.id ? { ...pool, ...data } : pool);
  } else {
    // 新增
    data.id = 'LCG' + (1000000000 + mockIpPools.length + 1);
    data.createdAt = data.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    data.createdBy = data.updatedBy = 'mockUser';
    data.usedCount = 0;
    data.availableCount = 256;
    mockIpPools.push(data);
  }
  return Promise.resolve();
}
export function fetchAllocatedIPs(poolId, filters, pagination) {
  // 先找到对应的网池数据，确保能获取到网段信息
  const pool = mockIpPools.find(p => p.id === poolId);
  if (!pool) {
    return Promise.resolve({ list: [], total: 0, pool: null });
  }
  
  let data = (mockAllocatedIPs[poolId] || []).filter(ip => {
    if (filters.ip && !ip.ip.includes(filters.ip)) return false;
    if (filters.instanceId && !ip.instanceId.includes(filters.instanceId)) return false;
    if (filters.customerId && !ip.customerId.includes(filters.customerId)) return false;
    return true;
  });
  const total = data.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  data = data.slice(start, end);
  return Promise.resolve({ list: data, total, pool });
} 