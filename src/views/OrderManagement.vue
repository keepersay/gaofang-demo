<template>
  <div class="order-page">
    <el-card class="order-card">
      <div class="page-header">
        <h3>订单管理</h3>
        <div class="header-actions">
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </div>
      
      <div class="search-bar">
        <el-input
          v-model="search.keyword"
          placeholder="搜索订单ID/客户名"
          style="width: 250px;"
          clearable
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="search.status" placeholder="订单状态" clearable style="width: 120px; margin-left: 10px;">
          <el-option label="已下单" value="pending" />
          <el-option label="已完成" value="completed" />
          <el-option label="已作废" value="cancelled" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-left: 10px; width: 280px;"
        />
        <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <el-table
        :data="filteredOrders"
        style="width: 100%; margin-top: 10px;"
        border
        stripe
        size="small"
        v-loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="订单ID" width="120" sortable="custom" />
        <el-table-column prop="customerName" label="客户名" min-width="120" />
        <el-table-column prop="status" label="订单状态" width="90">
          <template #header>
            <div class="filter-header">
              订单状态
              <el-dropdown trigger="click" @command="handleStatusFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item command="pending">已下单</el-dropdown-item>
                    <el-dropdown-item command="completed">已完成</el-dropdown-item>
                    <el-dropdown-item command="cancelled">已作废</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isAnycast" label="是否Anycast" width="90">
          <template #header>
            <div class="filter-header">
              是否Anycast
              <el-dropdown trigger="click" @command="handleAnycastFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="true">是</el-dropdown-item>
                    <el-dropdown-item :command="false">否</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.isAnycast ? 'success' : 'info'" size="small">
              {{ scope.row.isAnycast ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="regionName" label="地域" width="80">
          <template #default="scope">
            <span v-if="!scope.row.isAnycast">{{ getRegionName(scope.row.regionId) }}</span>
            <el-tag v-else type="info" size="small">不适用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addressType" label="地址类型" width="80">
          <template #header>
            <div class="filter-header">
              地址类型
              <el-dropdown trigger="click" @command="handleAddressTypeFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item command="IPv4">IPv4</el-dropdown-item>
                    <el-dropdown-item command="IPv6">IPv6</el-dropdown-item>
                    <el-dropdown-item command="dual">双栈</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="getAddressTypeTagType(scope.row.addressType)" size="small">
              {{ getAddressTypeText(scope.row.addressType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasAdsProtection" label="ADS防护" width="80">
          <template #header>
            <div class="filter-header">
              ADS防护
              <el-dropdown trigger="click" @command="handleAdsFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="true">是</el-dropdown-item>
                    <el-dropdown-item :command="false">否</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.hasAdsProtection ? 'success' : 'info'" size="small">
              {{ scope.row.hasAdsProtection ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasCcProtection" label="CC防护" width="80">
          <template #header>
            <div class="filter-header">
              CC防护
              <el-dropdown trigger="click" @command="handleCcFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="true">是</el-dropdown-item>
                    <el-dropdown-item :command="false">否</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.hasCcProtection ? 'success' : 'info'" size="small">
              {{ scope.row.hasCcProtection ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasWafProtection" label="WAF防护" width="80">
          <template #header>
            <div class="filter-header">
              WAF防护
              <el-dropdown trigger="click" @command="handleWafFilterChange">
                <el-icon class="filter-icon"><Filter /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="null">全部</el-dropdown-item>
                    <el-dropdown-item :command="true">是</el-dropdown-item>
                    <el-dropdown-item :command="false">否</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.hasWafProtection ? 'success' : 'info'" size="small">
              {{ scope.row.hasWafProtection ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="protectionBandwidth" label="防护带宽(Mbps)" width="80" sortable="custom" align="center" />
        <el-table-column prop="businessBandwidth" label="业务带宽(Mbps)" width="80" sortable="custom" align="center" />
        <el-table-column prop="businessQps" label="业务QPS" width="80" sortable="custom" align="center" />
        <el-table-column label="操作" fixed="right" width="230">
          <template #default="scope">
            <el-button 
              link 
              type="primary" 
              @click="handleApprove(scope.row)"
              :disabled="scope.row.status !== 'pending'"
              size="small"
            >
              审批通过
            </el-button>
            <el-button 
              link 
              type="danger" 
              @click="handleCancel(scope.row)"
              :disabled="scope.row.status !== 'pending'"
              size="small"
            >
              审批作废
            </el-button>
            <el-button
              link
              type="info"
              @click="showOrderDetail(scope.row)"
              size="small"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalOrders"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          small
        />
      </div>
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="650px"
      destroy-on-close
    >
      <el-descriptions
        :column="2"
        border
        size="small"
        class="order-detail-descriptions"
      >
        <el-descriptions-item label="订单ID" label-align="right">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="客户名称" label-align="right">{{ currentOrder.customerName }}</el-descriptions-item>
        <el-descriptions-item label="订单状态" label-align="right">
          <el-tag :type="getStatusType(currentOrder.status)" size="small">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否Anycast" label-align="right">
          <el-tag :type="currentOrder.isAnycast ? 'success' : 'info'" size="small">
            {{ currentOrder.isAnycast ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="地域" label-align="right">
          <span v-if="!currentOrder.isAnycast">{{ getRegionName(currentOrder.regionId) }}</span>
          <el-tag v-else type="info" size="small">不适用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="地址类型" label-align="right">
          <el-tag :type="getAddressTypeTagType(currentOrder.addressType)" size="small">
            {{ getAddressTypeText(currentOrder.addressType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="ADS防护" label-align="right">
          <el-tag :type="currentOrder.hasAdsProtection ? 'success' : 'info'" size="small">
            {{ currentOrder.hasAdsProtection ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="CC防护" label-align="right">
          <el-tag :type="currentOrder.hasCcProtection ? 'success' : 'info'" size="small">
            {{ currentOrder.hasCcProtection ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="WAF防护" label-align="right">
          <el-tag :type="currentOrder.hasWafProtection ? 'success' : 'info'" size="small">
            {{ currentOrder.hasWafProtection ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="防护带宽(Mbps)" label-align="right">{{ currentOrder.protectionBandwidth }}</el-descriptions-item>
        <el-descriptions-item label="业务带宽(Mbps)" label-align="right">{{ currentOrder.businessBandwidth }}</el-descriptions-item>
        <el-descriptions-item label="业务QPS" label-align="right">{{ currentOrder.businessQps }}</el-descriptions-item>
        <el-descriptions-item label="防护IP个数" label-align="right">{{ currentOrder.protectionIpCount }}</el-descriptions-item>
        <el-descriptions-item label="防护域名数" label-align="right">{{ currentOrder.protectionDomainCount }}</el-descriptions-item>
        <el-descriptions-item label="端口数量" label-align="right">{{ currentOrder.portCount }}</el-descriptions-item>
        <el-descriptions-item label="下单时间" label-align="right">{{ formatDateTime(currentOrder.orderTime) }}</el-descriptions-item>
        <el-descriptions-item label="最后变更时间" label-align="right">{{ formatDateTime(currentOrder.lastUpdateTime) }}</el-descriptions-item>
        <el-descriptions-item label="最后修改账号" label-align="right">{{ currentOrder.lastUpdateUser }}</el-descriptions-item>
        <el-descriptions-item label="订单终态时间" label-align="right">
          {{ currentOrder.finalStatusTime ? formatDateTime(currentOrder.finalStatusTime) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 备注单独一行显示 -->
      <div class="remark-section">
        <div class="remark-label">备注：</div>
        <div class="remark-content" v-if="!isEditingRemark">
          <span>{{ currentOrder.remark || '-' }}</span>
          <el-button 
            link 
            type="primary" 
            size="small" 
            class="edit-remark-btn"
            @click="startEditRemark"
          >
            <el-icon><Edit /></el-icon>
          </el-button>
        </div>
        <div v-else class="remark-edit">
          <el-input
            v-model="editingRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
          />
          <div class="remark-edit-actions">
            <el-button type="primary" size="small" @click="saveRemark">保存</el-button>
            <el-button size="small" @click="cancelEditRemark">取消</el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Filter, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟订单数据
const mockOrders = [
  {
    id: 'ORD20240501001',
    customerId: 'CUST10001',
    customerName: '阿里云科技有限公司',
    status: 'pending',
    isAnycast: false,
    regionId: 'cn-beijing',
    addressType: 'IPv4',
    hasAdsProtection: true,
    hasCcProtection: true,
    hasWafProtection: false,
    protectionBandwidth: 100,
    businessBandwidth: 50,
    businessQps: 1000,
    protectionIpCount: 5,
    protectionDomainCount: 3,
    portCount: 10,
    remark: '重要客户，优先处理',
    orderTime: '2024-05-01T10:30:00',
    lastUpdateTime: '2024-05-01T10:30:00',
    lastUpdateUser: 'admin',
    finalStatusTime: null
  },
  {
    id: 'ORD20240502002',
    customerId: 'CUST10002',
    customerName: '腾讯科技(深圳)有限公司',
    status: 'completed',
    isAnycast: true,
    regionId: '',
    addressType: 'IPv6',
    hasAdsProtection: false,
    hasCcProtection: true,
    hasWafProtection: true,
    protectionBandwidth: 200,
    businessBandwidth: 100,
    businessQps: 2000,
    protectionIpCount: 10,
    protectionDomainCount: 5,
    portCount: 15,
    remark: '标准配置，Anycast部署',
    orderTime: '2024-05-02T09:15:00',
    lastUpdateTime: '2024-05-03T14:20:00',
    lastUpdateUser: 'operator1',
    finalStatusTime: '2024-05-03T14:20:00'
  },
  {
    id: 'ORD20240503003',
    customerId: 'CUST10003',
    customerName: '百度在线网络技术(北京)有限公司',
    status: 'cancelled',
    isAnycast: false,
    regionId: 'cn-hangzhou',
    addressType: 'IPv4',
    hasAdsProtection: true,
    hasCcProtection: false,
    hasWafProtection: true,
    protectionBandwidth: 150,
    businessBandwidth: 75,
    businessQps: 1500,
    protectionIpCount: 3,
    protectionDomainCount: 2,
    portCount: 8,
    remark: '客户取消订单',
    orderTime: '2024-05-03T11:45:00',
    lastUpdateTime: '2024-05-04T16:30:00',
    lastUpdateUser: 'operator2',
    finalStatusTime: '2024-05-04T16:30:00'
  },
  {
    id: 'ORD20240504004',
    customerId: 'CUST10001',
    customerName: '阿里云科技有限公司',
    status: 'pending',
    isAnycast: true,
    regionId: '',
    addressType: 'IPv4',
    hasAdsProtection: true,
    hasCcProtection: true,
    hasWafProtection: true,
    protectionBandwidth: 300,
    businessBandwidth: 150,
    businessQps: 3000,
    protectionIpCount: 8,
    protectionDomainCount: 6,
    portCount: 20,
    remark: '扩容订单，Anycast部署',
    orderTime: '2024-05-04T08:20:00',
    lastUpdateTime: '2024-05-04T08:20:00',
    lastUpdateUser: 'admin',
    finalStatusTime: null
  },
  {
    id: 'ORD20240505005',
    customerId: 'CUST10004',
    customerName: '京东科技控股股份有限公司',
    status: 'completed',
    isAnycast: false,
    regionId: 'cn-shenzhen',
    addressType: 'IPv6',
    hasAdsProtection: false,
    hasCcProtection: false,
    hasWafProtection: true,
    protectionBandwidth: 50,
    businessBandwidth: 25,
    businessQps: 500,
    protectionIpCount: 2,
    protectionDomainCount: 1,
    portCount: 5,
    remark: '小型客户',
    orderTime: '2024-05-05T13:10:00',
    lastUpdateTime: '2024-05-06T09:45:00',
    lastUpdateUser: 'operator1',
    finalStatusTime: '2024-05-06T09:45:00'
  },
  {
    id: 'ORD20240506006',
    customerId: 'CUST10005',
    customerName: '字节跳动有限公司',
    status: 'pending',
    isAnycast: true,
    regionId: '',
    addressType: 'dual',
    hasAdsProtection: true,
    hasCcProtection: true,
    hasWafProtection: true,
    protectionBandwidth: 500,
    businessBandwidth: 250,
    businessQps: 5000,
    protectionIpCount: 15,
    protectionDomainCount: 10,
    portCount: 25,
    remark: '国际业务，Anycast双栈部署',
    orderTime: '2024-05-06T11:20:00',
    lastUpdateTime: '2024-05-06T11:20:00',
    lastUpdateUser: 'admin',
    finalStatusTime: null
  }
];

// 状态
const loading = ref(false);
const orders = ref([...mockOrders]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalOrders = ref(mockOrders.length);
const dateRange = ref(null);

// 搜索和过滤条件
const search = ref({
  keyword: '',
  status: null
});

// 表格过滤条件
const filters = ref({
  status: null,
  addressType: null,
  isAnycast: null,
  hasAdsProtection: null,
  hasCcProtection: null,
  hasWafProtection: null
});

// 排序
const sortParams = ref({
  prop: '',
  order: ''
});

// 详情弹窗相关
const detailDialogVisible = ref(false);
const currentOrder = reactive({
  id: '',
  customerId: 0,
  customerName: '',
  status: '',
  isAnycast: false,
  regionId: '',
  regionName: '',
  addressType: '',
  hasAdsProtection: false,
  hasCcProtection: false,
  hasWafProtection: false,
  protectionBandwidth: 0,
  businessBandwidth: 0,
  businessQps: 0,
  protectionIpCount: 0,
  protectionDomainCount: 0,
  portCount: 0,
  orderTime: '',
  lastUpdateTime: '',
  lastUpdateUser: '',
  finalStatusTime: null,
  remark: ''
});

// 备注编辑相关
const isEditingRemark = ref(false);
const editingRemark = ref('');

// 开始编辑备注
const startEditRemark = () => {
  editingRemark.value = currentOrder.remark || '';
  isEditingRemark.value = true;
};

// 保存备注
const saveRemark = () => {
  const index = orders.value.findIndex(item => item.id === currentOrder.id);
  if (index !== -1) {
    orders.value[index].remark = editingRemark.value;
    currentOrder.remark = editingRemark.value;
    orders.value[index].lastUpdateTime = new Date().toISOString();
    currentOrder.lastUpdateTime = orders.value[index].lastUpdateTime;
    orders.value[index].lastUpdateUser = 'current_user';
    currentOrder.lastUpdateUser = 'current_user';
    ElMessage.success('备注已更新');
  }
  isEditingRemark.value = false;
};

// 取消编辑备注
const cancelEditRemark = () => {
  isEditingRemark.value = false;
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '已下单',
    'completed': '已完成',
    'cancelled': '已作废'
  };
  return statusMap[status] || status;
};

// 获取订单状态类型
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取地址类型文本
const getAddressTypeText = (addressType) => {
  const typeMap = {
    'IPv4': 'IPv4',
    'IPv6': 'IPv6',
    'dual': '双栈'
  };
  return typeMap[addressType] || addressType;
};

// 获取地址类型标签类型
const getAddressTypeTagType = (addressType) => {
  const typeMap = {
    'IPv4': 'info',
    'IPv6': 'info',
    'dual': 'success'
  };
  return typeMap[addressType] || 'info';
};

// 获取地域名称
const getRegionName = (regionId) => {
  const regionMap = {
    'cn-beijing': '北京',
    'cn-shanghai': '上海',
    'cn-hangzhou': '杭州',
    'cn-guangzhou': '广州',
    'cn-shenzhen': '深圳',
    'cn-hongkong': '香港'
  };
  return regionMap[regionId] || regionId;
};

// 过滤后的订单数据
const filteredOrders = computed(() => {
  let result = [...orders.value];
  
  // 关键字搜索
  if (search.value.keyword) {
    const keyword = search.value.keyword.toLowerCase();
    result = result.filter(order => 
      order.id.toLowerCase().includes(keyword) || 
      order.customerName.toLowerCase().includes(keyword)
    );
  }
  
  // 状态过滤
  if (search.value.status) {
    result = result.filter(order => order.status === search.value.status);
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
    
    result = result.filter(order => {
      const orderDate = new Date(order.orderTime);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  // 表头过滤
  if (filters.value.status) {
    result = result.filter(order => order.status === filters.value.status);
  }
  
  if (filters.value.addressType) {
    result = result.filter(order => order.addressType === filters.value.addressType);
  }
  
  if (filters.value.isAnycast !== null) {
    result = result.filter(order => order.isAnycast === filters.value.isAnycast);
  }
  
  if (filters.value.hasAdsProtection !== null) {
    result = result.filter(order => order.hasAdsProtection === filters.value.hasAdsProtection);
  }
  
  if (filters.value.hasCcProtection !== null) {
    result = result.filter(order => order.hasCcProtection === filters.value.hasCcProtection);
  }
  
  if (filters.value.hasWafProtection !== null) {
    result = result.filter(order => order.hasWafProtection === filters.value.hasWafProtection);
  }
  
  // 排序
  if (sortParams.value.prop && sortParams.value.order) {
    const prop = sortParams.value.prop;
    const isAsc = sortParams.value.order === 'ascending';
    
    result.sort((a, b) => {
      if (typeof a[prop] === 'string') {
        return isAsc 
          ? a[prop].localeCompare(b[prop]) 
          : b[prop].localeCompare(a[prop]);
      } else {
        return isAsc 
          ? a[prop] - b[prop] 
          : b[prop] - a[prop];
      }
    });
  }
  
  // 更新总数
  totalOrders.value = result.length;
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return result.slice(start, end);
});

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  // 搜索逻辑已在计算属性中处理
};

// 清除搜索
const handleSearchClear = () => {
  search.value.keyword = '';
  handleSearch();
};

// 重置搜索
const resetSearch = () => {
  search.value = {
    keyword: '',
    status: null
  };
  dateRange.value = null;
  filters.value = {
    status: null,
    addressType: null,
    isAnycast: null,
    hasAdsProtection: null,
    hasCcProtection: null,
    hasWafProtection: null
  };
  sortParams.value = {
    prop: '',
    order: ''
  };
  currentPage.value = 1;
};

// 刷新数据
const handleRefresh = () => {
  loading.value = true;
  // 模拟API调用
  setTimeout(() => {
    orders.value = [...mockOrders];
    loading.value = false;
    ElMessage.success('数据已刷新');
  }, 500);
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
};

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  sortParams.value = { prop, order };
};

// 处理状态过滤
const handleStatusFilterChange = (value) => {
  filters.value.status = value;
};

// 处理地址类型过滤
const handleAddressTypeFilterChange = (value) => {
  filters.value.addressType = value;
};

// 处理ADS防护过滤
const handleAdsFilterChange = (value) => {
  filters.value.hasAdsProtection = value;
};

// 处理CC防护过滤
const handleCcFilterChange = (value) => {
  filters.value.hasCcProtection = value;
};

// 处理WAF防护过滤
const handleWafFilterChange = (value) => {
  filters.value.hasWafProtection = value;
};

// 处理Anycast过滤
const handleAnycastFilterChange = (value) => {
  filters.value.isAnycast = value;
};

// 处理审批通过
const handleApprove = (order) => {
  // 验证业务规则
  if (!validateOrderRules(order)) {
    return;
  }

  ElMessageBox.confirm(
    `确认将订单 ${order.id} 审批通过吗？`,
    '审批确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    loading.value = true;
    setTimeout(() => {
      const index = orders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        const now = new Date().toISOString();
        orders.value[index] = {
          ...orders.value[index],
          status: 'completed',
          lastUpdateTime: now,
          lastUpdateUser: 'current_user',
          finalStatusTime: now
        };
      }
      loading.value = false;
      ElMessage.success(`订单 ${order.id} 已审批通过`);
    }, 500);
  }).catch(() => {
    // 取消操作
  });
};

// 处理审批作废
const handleCancel = (order) => {
  ElMessageBox.confirm(
    `确认将订单 ${order.id} 审批作废吗？`,
    '审批确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟API调用
    loading.value = true;
    setTimeout(() => {
      const index = orders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        const now = new Date().toISOString();
        orders.value[index] = {
          ...orders.value[index],
          status: 'cancelled',
          lastUpdateTime: now,
          lastUpdateUser: 'current_user',
          finalStatusTime: now
        };
      }
      loading.value = false;
      ElMessage.success(`订单 ${order.id} 已审批作废`);
    }, 500);
  }).catch(() => {
    // 取消操作
  });
};

// 验证订单业务规则
const validateOrderRules = (order) => {
  // 验证Anycast和地域的关系
  if (order.isAnycast && order.regionId) {
    ElMessage.error('Anycast订单不应指定地域');
    return false;
  }
  
  if (!order.isAnycast && !order.regionId) {
    ElMessage.error('非Anycast订单必须指定地域');
    return false;
  }
  
  return true;
};

// 处理行点击
const handleRowClick = (row, column, event) => {
  // 防止点击操作按钮时展开/折叠行
  if (column.label === '操作') {
    event.stopPropagation();
  }
};

// 显示订单详情
const showOrderDetail = (row) => {
  Object.assign(currentOrder, row);
  detailDialogVisible.value = true;
};

// 初始化
onMounted(() => {
  // 可以在这里加载初始数据
  handleRefresh();
});
</script>

<style scoped>
.order-page {
  padding: 10px;
  background: #f5f6fa;
  min-height: calc(100vh - 100px);
}

.order-card {
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.search-bar {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px 0;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.filter-icon {
  cursor: pointer;
  margin-left: 2px;
  font-size: 12px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.order-detail-descriptions {
  width: 100%;
}

.remark-section {
  margin-top: 15px;
  padding: 10px 0;
  border-top: 1px solid #EBEEF5;
}

.remark-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.remark-content {
  padding: 8px;
  background-color: #f9fafc;
  border-radius: 4px;
  min-height: 60px;
  white-space: pre-line;
  position: relative;
}

.edit-remark-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0.6;
}

.edit-remark-btn:hover {
  opacity: 1;
}

.remark-edit {
  margin-top: 5px;
}

.remark-edit-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style> 