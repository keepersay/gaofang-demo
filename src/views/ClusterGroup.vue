<template>
  <div>
    <ClusterGroupTable 
      :data="pagedData"
      :total="filteredData.length"
      :current-page="currentPage"
      :page-size="pageSize"
      :filtered-location="filters.location"
      :filtered-link-type="filters.linkType"
      @create="onCreate" 
      @edit="onEdit" 
      @quota="onQuota" 
      @delete="onDelete" 
      @page-change="onPageChange"
      @filter-change="onFilterChange"
      @sort-change="onSortChange"
      @search="onSearch"
    />
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
      <div>确定要删除逻辑集群组 <b>{{ deleteRow?.name }}</b> 吗？</div>
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
import ClusterGroupTable from '../components/ClusterGroupTable.vue'
import ClusterGroupModal from '../components/ClusterGroupModal.vue'
import ClusterGroupQuotaDrawer from '../components/ClusterGroupQuotaDrawer.vue'

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

const filteredData = computed(() => {
  let data = tableData.value
  console.log('Initial data (inside filteredData):', JSON.parse(JSON.stringify(data)))

  // 应用搜索过滤
  if (search.value) {
    const query = search.value.toLowerCase().trim();
    data = data.filter(
      (item) =>
        String(item.name).toLowerCase().includes(query) ||
        String(item.id).toLowerCase().includes(query)
    );
    console.log('After search filter (inside filteredData):', JSON.parse(JSON.stringify(data)));
  }

  // 应用所在机房过滤
  if (filters.value.location && filters.value.location.length) {
    console.log('Applying location filter. Filters:', filters.value.location);
    data = data.filter(item => {
      const itemLocation = String(item.location).toLowerCase().trim();
      return filters.value.location.map(f => String(f).toLowerCase().trim()).includes(itemLocation);
    });
    console.log('After location filter (inside filteredData):', JSON.parse(JSON.stringify(data)));
  }

  // 应用链路类型过滤
  if (filters.value.linkType && filters.value.linkType.length) {
    console.log('Applying linkType filter. Filters:', filters.value.linkType)
    data = data.filter(item => {
      const itemLinkType = String(item.linkType).toLowerCase().trim();
      return filters.value.linkType.map(f => String(f).toLowerCase().trim()).includes(itemLinkType);
    });
    console.log('After linkType filter (inside filteredData):', JSON.parse(JSON.stringify(data)))
  }
  console.log('Final filtered data (inside filteredData):', JSON.parse(JSON.stringify(data)))
  return data
})
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const slicedData = filteredData.value.slice(start, start + pageSize.value)
  console.log('Paged data (to table):', JSON.parse(JSON.stringify(slicedData)))
  return slicedData
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
function onFilterChange(val) {
  console.log('onFilterChange triggered. New filters:', JSON.parse(JSON.stringify(val)))
  filters.value = val
  currentPage.value = 1
  console.log('Filters after update:', JSON.parse(JSON.stringify(filters.value)))
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
/**** 搜索框与表格间距 ****/
.el-row.mb-4 + .el-table {
  margin-top: 16px;
}
/**** 分页器右对齐 ****/
.mt-4.flex.justify-end {
  justify-content: flex-end;
}
</style> 