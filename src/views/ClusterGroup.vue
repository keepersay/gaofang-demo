<template>
  <div class="cluster-group">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>逻辑集群</span>
          <el-button type="primary" @click="onCreate">新建逻辑集群</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="集群名称">
            <el-input v-model="searchForm.name" placeholder="请输入集群名称" clearable />
          </el-form-item>
          <el-form-item label="所在机房">
            <el-select v-model="searchForm.location" placeholder="请选择机房" clearable>
              <el-option label="华东-上海" value="华东-上海" />
              <el-option label="华南-广州" value="华南-广州" />
            </el-select>
          </el-form-item>
          <el-form-item label="链路类型">
            <el-select v-model="searchForm.linkType" placeholder="请选择链路类型" clearable>
              <el-option label="L7" value="L7" />
              <el-option label="L4" value="L4" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="pagedData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column label="集群名称 / ID" min-width="180" fixed="left">
          <template #default="{ row }">
            <div class="font-medium">{{ row.name }}</div>
            <div class="text-xs text-gray-500">{{ row.id }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="所在机房" min-width="140" />
        <el-table-column prop="linkType" label="链路类型" min-width="140">
          <template #default="{ row }">
            <el-tag :type="row.linkType === 'L7' ? 'info' : 'success'">
              {{ row.linkType === 'L7' ? '七层防护' : '四层防护' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="elementCount" label="网元数量" min-width="100" />
        <el-table-column prop="updatedAt" label="最后修改时间" min-width="140" sortable />
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="onEdit(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="onQuota(row)">配额管理</el-button>
            <el-button type="danger" link size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <ClusterGroupModal
      :visible="modalVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @close="modalVisible=false"
      @submit="handleModalSubmit"
    />
    <ClusterGroupQuotaDrawer
      :visible="quotaVisible"
      :group-name="quotaGroupName"
      :quota-data="quotaData"
      @close="quotaVisible=false"
      @save="handleQuotaSave"
    />
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除逻辑集群 <b>{{ deleteRow?.name }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
      <template #footer>
        <el-button @click="deleteVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ClusterGroupModal from '../components/ClusterGroupModal.vue'
import ClusterGroupQuotaDrawer from '../components/ClusterGroupQuotaDrawer.vue'

// 搜索表单
const searchForm = ref({
  name: '',
  location: '',
  linkType: ''
})

// 响应式表格数据
const tableData = ref([
  {
    id: 'lcg-a1b2c3d4',
    name: 'huadong-telecom-premium',
    location: '华东-上海',
    linkType: 'L7',
    elementCount: 4,
    updatedAt: '2天前',
  },
  {
    id: 'lcg-e5f6g7h8',
    name: 'huanan-unicom-basic',
    location: '华南-广州',
    linkType: 'L4',
    elementCount: 2,
    updatedAt: '5天前',
  },
])

// 搜索、过滤、排序、分页相关
const search = ref('')
const filters = ref({ location: [], linkType: [] })
const sort = ref({ prop: '', order: '' })
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const filteredData = computed(() => {
  let data = tableData.value

  // 应用搜索过滤
  if (searchForm.value.name) {
    const query = searchForm.value.name.toLowerCase().trim();
    data = data.filter(
      (item) =>
        String(item.name).toLowerCase().includes(query) ||
        String(item.id).toLowerCase().includes(query)
    );
  }

  // 应用所在机房过滤
  if (searchForm.value.location) {
    data = data.filter(item => {
      return item.location === searchForm.value.location;
    });
  }

  // 应用链路类型过滤
  if (searchForm.value.linkType) {
    data = data.filter(item => {
      return item.linkType === searchForm.value.linkType;
    });
  }

  return data
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// 弹窗/抽屉/删除相关
const modalVisible = ref(false)
const isEdit = ref(false)
const editData = ref(null)
const quotaVisible = ref(false)
const quotaGroupName = ref('')
const quotaData = ref({})
const deleteVisible = ref(false)
const deleteRow = ref(null)

// 搜索和重置
function handleSearch() {
  currentPage.value = 1
}

function handleReset() {
  searchForm.value = {
    name: '',
    location: '',
    linkType: ''
  }
  currentPage.value = 1
}

function onCreate() {
  isEdit.value = false
  editData.value = null
  modalVisible.value = true
}

function onEdit(row) {
  isEdit.value = true
  editData.value = { ...row }
  modalVisible.value = true
}

function onQuota(row) {
  quotaGroupName.value = row.name
  quotaData.value = {} // 可传入row.quota等
  quotaVisible.value = true
}

function onDelete(row) {
  deleteRow.value = row
  deleteVisible.value = true
}

function confirmDelete() {
  const idx = tableData.value.findIndex(item => item.id === deleteRow.value.id)
  if (idx !== -1) {
    tableData.value.splice(idx, 1)
    ElMessage.success('删除成功')
  } else {
    ElMessage.error('删除失败')
  }
  deleteVisible.value = false
}

function handleModalSubmit(data) {
  if (isEdit.value && editData.value) {
    // 编辑
    const idx = tableData.value.findIndex(item => item.id === editData.value.id)
    if (idx !== -1) {
      tableData.value[idx] = { ...tableData.value[idx], ...data }
      ElMessage.success('编辑成功')
    } else {
      ElMessage.error('编辑失败')
    }
  } else {
    // 新建
    const newId = `lcg-${Math.random().toString(36).substr(2, 8)}`
    tableData.value.unshift({ ...data, id: newId, updatedAt: '刚刚', elementCount: data.linkType === 'L7' ? 4 : 2 })
    ElMessage.success('新建成功')
  }
  modalVisible.value = false
}

function handleQuotaSave(data) {
  ElMessage.success('配额保存成功')
  quotaVisible.value = false
}

function onPageChange(page) {
  currentPage.value = page
}

function onPageSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

function onFilterChange(val) {
  filters.value = val
  currentPage.value = 1
}

function onSortChange(val) {
  sort.value = val
}

function onSearch(val) {
  search.value = val
  currentPage.value = 1
}
</script>

<style scoped>
.cluster-group {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-xs {
  font-size: 12px;
}

.text-gray-500 {
  color: #6b7280;
}

.font-medium {
  font-weight: 500;
}
</style> 