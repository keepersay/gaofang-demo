<template>
  <div class="cluster-group-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>逻辑集群组</span>
          <el-button type="primary" @click="handleAdd">新建集群组</el-button>
        </div>
      </template>

      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入集群组名称"
              clearable
              style="max-width: 260px;"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        :data="paginatedData"
        style="width: 100%; min-height: 320px; margin-top: 20px;"
        v-loading="loading"
        border
        stripe
        max-height="500"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
        :cell-style="{ padding: '4px 0' }"
      >
        <el-table-column prop="id" label="ID" width="220" fixed="left" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column label="是否分布式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.distributed ? 'success' : 'info'">
              {{ scope.row.distributed ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="机房" width="150" v-if="true">
          <template #default="scope">
            <template v-if="!scope.row.distributed && scope.row.dataCenterId">
              <el-tooltip effect="dark" :content="getDataCenterName(scope.row.dataCenterId)" placement="top">
                <el-tag type="warning" effect="plain">
                  {{ getDataCenterName(scope.row.dataCenterId) }}
                </el-tag>
              </el-tooltip>
            </template>
            <span v-else-if="scope.row.distributed" class="text-gray-400">分布式</span>
            <span v-else class="text-gray-400">--</span>
          </template>
        </el-table-column>
        <el-table-column label="主集群" min-width="220">
          <template #default="scope">
            <div class="cluster-list">
              <el-tooltip
                v-for="clusterId in scope.row.primaryClusters"
                :key="clusterId"
                effect="dark"
                :content="getClusterName(clusterId)"
                placement="top"
              >
                <div class="custom-tag primary">
                  {{ getClusterName(clusterId) }}
                </div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备集群" min-width="220">
          <template #default="scope">
            <div class="cluster-list" v-if="scope.row.standbyClusters?.length">
              <el-tooltip
                v-for="clusterId in scope.row.standbyClusters"
                :key="clusterId"
                effect="dark"
                :content="getClusterName(clusterId)"
                placement="top"
              >
                <div class="custom-tag info">
                  {{ getClusterName(clusterId) }}
                </div>
              </el-tooltip>
            </div>
            <div class="cluster-list" v-else>
              <span class="text-gray-400">无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column prop="createAccount" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="修改时间" width="160" sortable />
        <el-table-column prop="updateAccount" label="修改人" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              link size="small"
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-gray-400 py-10 text-center">暂无数据</div>
        </template>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <ClusterGroupModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @submit="handleModalSubmit"
    />

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除集群组 <b>{{ deleteRow?.name }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ClusterGroupModal from '@/components/ClusterGroupModal.vue'
import RegionService from '@/services/RegionService'
import ClusterService from '@/services/ClusterService'
import DataCenterService from '@/services/DataCenterService'
import { Filter } from '@element-plus/icons-vue'

// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)
const deleteVisible = ref(false)
const deleteRow = ref(null)
const regionTree = ref([])
const regions = ref([]) // 保留扁平化的地域数据用于查询
const clusters = ref([])
const dataCenters = ref([]) // 添加机房数据

// 地址类型过滤器
const addressTypePopoverVisible = ref(false)
const addressTypeFilterValue = ref([])
const addressTypeFilters = [
  { text: 'IPv4', value: 'ipv4' },
  { text: 'IPv6', value: 'ipv6' },
  { text: '双栈', value: 'dual' }
]

// 重置地址类型过滤器
const resetAddressTypeFilter = () => {
  addressTypeFilterValue.value = []
  addressTypePopoverVisible.value = false
}

// 确认地址类型过滤
const confirmAddressTypeFilter = () => {
  addressTypePopoverVisible.value = false
}

// 搜索表单
const searchForm = ref({
  name: ''
})

// 分页
const PAGE_SIZE_KEY = 'cluster-group-page-size';
const defaultPageSize = Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
const pagination = ref({
  currentPage: 1,
  pageSize: defaultPageSize,
  total: 0
})

// 表格数据
const tableData = ref([
  {
    id: 'LCG7503281108201961885',
    name: '上海电信集群组',
    distributed: false,
    dataCenterId: 'DC202401010002', // 上海机房01
    primaryClusters: ['LC202407250001'], // 华东-电信-高级版
    standbyClusters: [],
    status: 'active',
    remark: '上海电信集群，主要承载华东区域业务',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-10 11:00:00',
    updateAccount: 'admin',
    addressType: 'ipv4'
  },
  {
    id: 'LCG7503281108201961886',
    name: '北京电信集群组',
    distributed: false,
    dataCenterId: 'DC202401010001', // 北京机房01
    primaryClusters: ['LC202407250003'], // 北京-电信-标准版
    standbyClusters: [],
    status: 'active',
    remark: '北京电信集群，主要承载华北区域业务',
    createTime: '2024-01-02 11:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-11 12:00:00',
    updateAccount: 'admin',
    addressType: 'ipv4'
  },
  {
    id: 'LCG7503281108201961887',
    name: '国际分布式集群组',
    distributed: true,
    dataCenterId: '',
    primaryClusters: ['LC202407250005', 'LC202407250006'], // 首尔高级版, 法兰克福标准版
    standbyClusters: ['LC202407250007'], // 迪拜高级版
    status: 'active',
    remark: '国际分布式集群组，覆盖亚洲、欧洲和中东地区',
    createTime: '2024-05-15 09:30:00',
    createAccount: 'admin',
    updateTime: '2024-05-15 09:30:00',
    updateAccount: 'admin',
    addressType: 'dual'
  },
  {
    id: 'LCG7503281108201961888',
    name: '广州联通集群组',
    distributed: false,
    dataCenterId: 'DC202401010003', // 广州机房01
    primaryClusters: ['LC202407250002'], // 华南-联通-基础版
    standbyClusters: [],
    status: 'active',
    remark: '广州联通集群，主要承载华南区域业务',
    createTime: '2024-03-05 14:20:00',
    createAccount: 'admin',
    updateTime: '2024-03-05 14:20:00',
    updateAccount: 'admin',
    addressType: 'dual'
  },
  {
    id: 'LCG7503281108201961889',
    name: '北美分布式集群组',
    distributed: true,
    dataCenterId: '',
    primaryClusters: ['LC202407250008'], // 洛杉矶标准版
    standbyClusters: [],
    status: 'active',
    remark: '北美地区分布式集群组，目前仅覆盖美国西海岸',
    createTime: '2024-02-28 16:30:00',
    createAccount: 'admin',
    updateTime: '2024-04-10 09:15:00',
    updateAccount: 'admin',
    addressType: 'ipv4'
  },
  {
    id: 'LCG7503281108201961890',
    name: '无锡备用集群组',
    distributed: false,
    dataCenterId: 'DC202401010004', // 无锡机房01
    primaryClusters: ['LC202407250004'], // 无锡-联通-高级版
    standbyClusters: [],
    status: 'disabled',
    remark: '无锡备用集群组，主要用于灾备',
    createTime: '2024-03-10 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-03-15 11:30:00',
    updateAccount: 'admin',
    addressType: 'ipv4'
  },
  {
    id: 'LCG7503281108201961891',
    name: '欧亚集群组',
    distributed: true,
    dataCenterId: '',
    primaryClusters: ['LC202407250005', 'LC202407250006', 'LC202407250007'], // 首尔、法兰克福、迪拜
    standbyClusters: [],
    status: 'active',
    remark: '覆盖欧亚主要区域的分布式集群组',
    createTime: '2024-06-01 09:00:00',
    createAccount: 'admin',
    updateTime: '2024-06-01 09:00:00',
    updateAccount: 'admin',
    addressType: 'dual'
  },
  {
    id: 'LCG7503281108201961892',
    name: '华东双机房集群组',
    distributed: true,
    dataCenterId: '',
    primaryClusters: ['LC202407250001'], // 华东-电信-高级版
    standbyClusters: ['LC202407250004'], // 无锡-联通-高级版
    status: 'active',
    remark: '华东地区跨机房集群组，上海主站，无锡备站',
    createTime: '2024-04-12 14:00:00',
    createAccount: 'admin',
    updateTime: '2024-04-12 14:00:00',
    updateAccount: 'admin',
    addressType: 'ipv4'
  },
  {
    id: 'LCG7503281108201961893',
    name: '中东数据集群组',
    distributed: false,
    dataCenterId: 'DC202407200003', // 迪拜机房01
    primaryClusters: ['LC202407250007'], // 迪拜高级版
    standbyClusters: [],
    status: 'active',
    remark: '中东地区数据处理集群组',
    createTime: '2024-03-25 08:45:00',
    createAccount: 'admin',
    updateTime: '2024-03-25 08:45:00',
    updateAccount: 'admin',
    addressType: 'ipv6'
  },
  {
    id: 'LCG7503281108201961894',
    name: '韩国业务集群组',
    distributed: false,
    dataCenterId: 'DC202407200001', // 首尔机房01
    primaryClusters: ['LC202407250005'], // 首尔高级版
    standbyClusters: [],
    status: 'active',
    remark: '韩国本地业务集群组，提供低延迟服务',
    createTime: '2024-05-20 10:30:00',
    createAccount: 'admin',
    updateTime: '2024-05-20 10:30:00',
    updateAccount: 'admin',
    addressType: 'ipv6'
  }
])

// 获取地域数据
const fetchRegions = async () => {
  try {
    const treeData = await RegionService.getRegionTree()
    regionTree.value = treeData
    
    // 同时获取扁平化的地域数据用于查询
    const allRegions = await RegionService.getRegions()
    regions.value = allRegions
  } catch (error) {
    console.error('获取地域数据失败:', error)
  }
}

// 获取集群数据
const fetchClusters = async () => {
  try {
    clusters.value = await ClusterService.getClusters()
  } catch (error) {
    console.error('获取集群数据失败:', error)
  }
}

// 获取机房数据
const fetchDataCenters = async () => {
  try {
    dataCenters.value = await DataCenterService.getDataCenters()
  } catch (error) {
    console.error('获取机房数据失败:', error)
  }
}

// 获取地域名称
const getRegionName = (regionId) => {
  const region = regions.value.find(r => r.id === regionId)
  return region ? region.name : regionId
}

// 获取集群名称
const getClusterName = (clusterId) => {
  const cluster = clusters.value.find(c => c.id === clusterId)
  return cluster ? cluster.name : clusterId
}

// 获取机房名称
const getDataCenterName = (dataCenterId) => {
  const dataCenter = dataCenters.value.find(dc => dc.id === dataCenterId)
  return dataCenter ? dataCenter.name : dataCenterId
}

// 计算处理后的分页数据
const paginatedData = computed(() => {
  // 先过滤
  let filteredData = tableData.value;
  
  // 名称过滤
  if (searchForm.value.name) {
    const searchText = searchForm.value.name.toLowerCase();
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(searchText)
    );
  }
  
  // 地址类型过滤
  if (addressTypeFilterValue.value.length > 0) {
    filteredData = filteredData.filter(item => 
      addressTypeFilterValue.value.includes(item.addressType || 'ipv4')
    );
  }
  
  // 更新总数
  pagination.value.total = filteredData.length;
  
  // 再分页
  const startIndex = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  const endIndex = startIndex + pagination.value.pageSize;
  return filteredData.slice(startIndex, endIndex);
});

// 搜索
const handleSearch = () => {
  // 实际项目中需要调用后端API
  pagination.value.currentPage = 1
  console.log('搜索:', searchForm.value)
}

// 重置
const handleReset = () => {
  searchForm.value.name = ''
  pagination.value.currentPage = 1
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  editData.value = {
    id: '',
    name: '',
    distributed: false,
    dataCenterId: '',
    primaryClusters: [],
    standbyClusters: [],
    status: 'active',
    remark: ''
  }
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  editData.value = { ...row }
  modalVisible.value = true
}

// 删除
const handleDelete = (row) => {
  deleteRow.value = row
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  // 实际项目中需要调用后端API
  const index = tableData.value.findIndex(item => item.id === deleteRow.value.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
    pagination.value.total--
    ElMessage.success('删除成功')
  }
  deleteVisible.value = false
}

// 状态变更
const handleStatusChange = (row) => {
  // 实际项目中需要调用后端API
  row.status = row.status === 'active' ? 'disabled' : 'active'
  const action = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`已${action}`)
}

// 提交表单
const handleModalSubmit = (formData) => {
  if (isEdit.value) {
    // 编辑
    const index = tableData.value.findIndex(item => item.id === formData.id)
    if (index > -1) {
      tableData.value[index] = { ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    // 新增
    formData.id = generateSnowflakeId()
    formData.createTime = new Date().toLocaleString()
    formData.createAccount = 'admin'
    formData.updateTime = formData.createTime
    formData.updateAccount = 'admin'
    tableData.value.push(formData)
    pagination.value.total++
    ElMessage.success('新增成功')
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  // 保存到本地存储
  localStorage.setItem(PAGE_SIZE_KEY, val)
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

onMounted(() => {
  fetchData()
})

// 初始化数据
const fetchData = async () => {
  loading.value = true
  try {
    await Promise.all([fetchRegions(), fetchClusters(), fetchDataCenters()])
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cluster-group-management {
  padding: 0;
  margin: 0;
  background: #f5f6fa;
  min-height: calc(100vh - 60px);
}

.box-card {
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 0 8px 0;
}

.search-area {
  margin-bottom: 8px;
  padding: 8px 8px 0 8px;
  background: transparent;
  border-radius: 0;
}

.pagination-container {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.text-xs {
  font-size: 12px;
}

.text-gray-400 {
  color: #9ca3af;
  display: inline-block;
  line-height: 22px;
  height: 22px;
}

.text-gray-500 {
  color: #6b7280;
}

.mt-2 {
  margin-top: 8px;
}

.cluster-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
  margin: 0;
  min-height: 22px;
}

.cluster-tag {
  margin: 0;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.el-table .dense-row td {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  vertical-align: middle;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.text-center {
  text-align: center;
}

.el-card__body {
  flex: 1;
  overflow: auto;
  padding-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style>
/* 全局样式，处理Element Plus标签组件 */
.custom-tag {
  display: inline-block;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
  border-radius: 2px;
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  margin: 1px;
}

.custom-tag.primary {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.custom-tag.info {
  color: #909399;
  background-color: #f4f4f5;
  border-color: #e9e9eb;
}
</style> 