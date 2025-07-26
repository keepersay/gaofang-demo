<template>
  <div class="cluster-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>集群管理</span>
          <el-button type="primary" @click="handleAdd">新建集群</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入集群名称"
              clearable
              style="width: 260px;"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="网元类型">
            <el-select
              v-model="searchForm.networkElementType"
              placeholder="请选择网元类型"
              clearable
              style="width: 180px;"
              @change="handleSearch"
            >
              <el-option
                v-for="(label, value) in networkElementTypes"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px;"
              @change="handleSearch"
            >
              <el-option label="启用" value="active" />
              <el-option label="停用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%; margin-top: 20px;"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        row-class-name="dense-row"
        :cell-style="{ padding: '8px 0' }"
      >
        <el-table-column prop="id" label="ID" width="200" show-overflow-tooltip />
        
        <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="networkElementType" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getNetworkElementTagType(row.networkElementType)" size="small">
              {{ networkElementTypes[row.networkElementType] }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="dataCenterId" label="机房" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getDataCenterName(row.dataCenterId) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <el-table-column prop="createAccount" label="创建人" width="100" />
        
        <el-table-column prop="updateTime" label="修改时间" width="160" />
        
        <el-table-column prop="updateAccount" label="修改人" width="100" />
        
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              link
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 集群弹窗 -->
    <ClusterModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @submit="handleModalSubmit"
    />

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除集群 <b>{{ deleteRow?.name }}</b> 吗？</div>
      <div class="text-sm text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleteLoading">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClusterModal from '@/components/ClusterModal.vue'
import ClusterManagementService, { networkElementTypes, buildDetailUrl } from '@/services/ClusterManagementService'
import DataCenterService from '@/services/DataCenterService'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const dataCenters = ref([])

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = ref({
  name: '',
  networkElementType: '',
  status: ''
})

// 弹窗相关
const modalVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)

// 删除相关
const deleteVisible = ref(false)
const deleteRow = ref(null)
const deleteLoading = ref(false)

// 获取机房名称
const getDataCenterName = (dataCenterId) => {
  const dataCenter = dataCenters.value.find(dc => dc.id === dataCenterId)
  return dataCenter ? dataCenter.name : dataCenterId
}

// 获取网元类型标签颜色
const getNetworkElementTagType = (type) => {
  const typeColors = {
    slb4: 'primary',
    wafcc: 'success',
    waf: 'warning',
    blackhole: 'danger',
    dns: 'info',
    ads: '',
    firewall: 'primary',
    flowanalysis: 'success'
  }
  return typeColors[type] || ''
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    const result = await ClusterManagementService.getClustersByPage(params)
    tableData.value = result.data
    pagination.value.total = result.total
  } catch (error) {
    ElMessage.error('加载数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 加载机房数据
const loadDataCenters = async () => {
  try {
    const result = await DataCenterService.getDataCenters()
    dataCenters.value = result
  } catch (error) {
    console.error('加载机房数据失败：', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    name: '',
    networkElementType: '',
    status: ''
  }
  pagination.value.page = 1
  loadData()
}

// 新建
const handleAdd = () => {
  isEdit.value = false
  editData.value = null
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  editData.value = { ...row }
  modalVisible.value = true
}

// 查看详情
const handleViewDetail = (row) => {
  const detailUrl = buildDetailUrl(row)
  if (detailUrl) {
    window.open(detailUrl, '_blank')
  } else {
    ElMessage.warning('无法跳转到该网元类型的管理页面')
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  const action = row.status === 'active' ? '停用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}集群 "${row.name}" 吗？`,
      `${action}集群`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const apiMethod = row.status === 'active' 
      ? ClusterManagementService.disableCluster 
      : ClusterManagementService.enableCluster
    
    await apiMethod(row.id)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败：` + error.message)
    }
  }
}

// 删除
const handleDelete = (row) => {
  deleteRow.value = row
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    await ClusterManagementService.removeCluster(deleteRow.value.id)
    ElMessage.success('删除成功')
    deleteVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  } finally {
    deleteLoading.value = false
  }
}

// 弹窗提交
const handleModalSubmit = () => {
  modalVisible.value = false
  loadData()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.page = page
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
  loadDataCenters()
})
</script>

<style scoped>
.cluster-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 16px;
}

.search-area .el-form-item {
  margin-bottom: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.dense-row) {
  height: 45px;
}

:deep(.el-table .cell) {
  padding: 0 12px;
}
</style> 