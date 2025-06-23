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
        :data="tableData"
        style="width: 100%; min-height: 320px; margin-top: 20px;"
        v-loading="loading"
        border
        stripe
        max-height="500"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
      >
        <el-table-column prop="id" label="ID" width="220" fixed="left" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="region" label="地域" width="150">
          <template #default="scope">
            {{ getRegionName(scope.row.region) }}
          </template>
        </el-table-column>
        <el-table-column label="是否分布式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.distributed ? 'success' : 'info'">
              {{ scope.row.distributed ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="主集群" min-width="200">
          <template #default="scope">
            <div class="cluster-list">
              <el-tooltip
                v-for="clusterId in scope.row.primaryClusters"
                :key="clusterId"
                effect="dark"
                :content="getClusterName(clusterId)"
                placement="top"
              >
                <el-tag
                  class="cluster-tag"
                  type="primary"
                  effect="plain"
                  disable-transitions
                  style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                >
                  {{ getClusterName(clusterId) }}
                </el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备集群" min-width="200">
          <template #default="scope">
            <div class="cluster-list" v-if="scope.row.standbyClusters?.length">
              <el-tooltip
                v-for="clusterId in scope.row.standbyClusters"
                :key="clusterId"
                effect="dark"
                :content="getClusterName(clusterId)"
                placement="top"
              >
                <el-tag
                  class="cluster-tag"
                  type="info"
                  effect="plain"
                  disable-transitions
                  style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                >
                  {{ getClusterName(clusterId) }}
                </el-tag>
              </el-tooltip>
            </div>
            <span v-else class="text-gray-400">无</span>
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
          :page-sizes="[10, 20, 50, 100]"
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

// 搜索表单
const searchForm = ref({
  name: ''
})

// 表格数据
const tableData = ref([
  {
    id: 'LCG7503281108201961885',
    name: '示例集群组1',
    region: 'CHN',
    distributed: false,
    primaryClusters: ['LC202401010010001', 'LC202401010009001'],
    standbyClusters: ['LC202401010001001'],
    status: 'active',
    remark: '示例集群组1',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-10 11:00:00',
    updateAccount: 'admin'
  },
  {
    id: 'LCG7503281108201961886',
    name: '示例集群组2',
    region: 'PEK',
    distributed: false,
    primaryClusters: ['LC202401010002001'],
    standbyClusters: [],
    status: 'active',
    remark: '示例集群组2',
    createTime: '2024-01-02 11:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-11 12:00:00',
    updateAccount: 'admin'
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

// 初始化数据
const fetchData = async () => {
  loading.value = true
  try {
    await Promise.all([fetchRegions(), fetchClusters()])
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    loading.value = false
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

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: tableData.value.length
})

// 搜索
const handleSearch = () => {
  // 实际项目中需要调用后端API
  pagination.value.currentPage = 1
  console.log('搜索:', searchForm.value)
}

// 重置
const handleReset = () => {
  searchForm.value.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  editData.value = {
    id: '',
    name: '',
    region: '',
    distributed: false,
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
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.cluster-group-management {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px 20px 0 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-xs {
  font-size: 12px;
}

.text-gray-400 {
  color: #9ca3af;
}

.mt-2 {
  margin-top: 8px;
}

.cluster-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cluster-tag {
  margin: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dense-row td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
</style> 