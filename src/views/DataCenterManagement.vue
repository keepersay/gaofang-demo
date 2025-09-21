<template>
  <div class="datacenter-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>机房</span>
          <el-button type="primary" @click="handleAdd">新建机房</el-button>
        </div>
      </template>
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入机房名称"
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
      <!-- 表格区域 -->
      <el-table
        :data="paginatedTableData"
        style="width: 100%; min-height: 500px; margin-top: 20px;"
        v-loading="loading"
        border
        stripe
        max-height="700"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="180" fixed="left" />
        <el-table-column prop="name" label="名称" width="150">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.name" placement="top">
              <span class="ellipsis-cell">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="regionId" label="地域" width="120">
          <template #default="scope">
            <el-tooltip effect="dark" :content="getRegionName(scope.row.regionId)" placement="top">
              <span class="ellipsis-cell">{{ getRegionName(scope.row.regionId) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #header>
            <span>状态</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="statusPopoverVisible"
            >
              <div>
                <el-checkbox-group v-model="statusFilterValue">
                  <el-checkbox label="active">启用</el-checkbox>
                  <el-checkbox label="disabled">禁用</el-checkbox>
                </el-checkbox-group>
                <div class="mt-2 flex justify-end">
                  <el-button size="small" @click="resetStatusFilter">重置</el-button>
                  <el-button size="small" type="primary" @click="confirmStatusFilter">确定</el-button>
                </div>
              </div>
              <template #reference>
                <el-icon :color="statusFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactPerson" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column prop="contactEmail" label="联系邮箱" width="180" />
        <el-table-column label="DNS线路" width="180">
          <template #default="scope">
            <el-popover
              placement="top"
              :width="300"
              trigger="hover"
              :disabled="!scope.row.dnsLines || scope.row.dnsLines.length === 0"
            >
              <template #default>
                <div>
                  <div v-if="scope.row.dnsLines && scope.row.dnsLines.length > 0">
                    <div v-for="line in scope.row.dnsLines" :key="line" class="mb-1">
                      {{ getLineName(line) }}
                    </div>
                  </div>
                  <div v-else>暂无绑定线路</div>
                </div>
              </template>
              <template #reference>
                <div>
                  <el-tag v-if="scope.row.dnsLines && scope.row.dnsLines.length > 0" type="success">
                    已绑定 {{ scope.row.dnsLines.length }} 条线路
                  </el-tag>
                  <span v-else class="text-gray-400">未绑定线路</span>
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="关联集群" width="100">
          <template #default="scope">
            <el-button 
              type="info" 
              link 
              size="small" 
              @click="handleViewRelatedClusters(scope.row)"
              v-loading.inline="relatedClustersLoading === scope.row.id"
            >
              查看关联
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column prop="createAccount" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="修改时间" width="160" sortable />
        <el-table-column prop="updateAccount" label="修改人" width="120" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="handleDnsLineBinding(scope.row)"
            >
              绑定线路
            </el-button>
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

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTableData.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑机房' : '新建机房'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入机房名称" />
        </el-form-item>
        <el-form-item label="地域" prop="regionId">
          <el-cascader
            v-model="form.regionId"
            :options="regionOptions"
            :props="{ 
              checkStrictly: true,
              value: 'id',
              label: 'name',
              emitPath: false,
              expandTrigger: 'hover'
            }"
            placeholder="请选择地域"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- DNS线路绑定对话框 -->
    <DataCenterDnsLineModal
      v-model:visible="dnsLineModalVisible"
      :dataCenterId="currentDataCenterId"
      @submit="handleDnsLineSubmit"
    />
    
    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteVisible" title="确认删除" width="400px">
      <div>确定要删除机房 <b>{{ deleteRow?.name }}</b> 吗？</div>
      <div class="text-xs text-gray-500 mt-2">ID: {{ deleteRow?.id }}</div>
      <template #footer>
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Filter } from '@element-plus/icons-vue'
import DataCenterDnsLineModal from '@/components/DataCenterDnsLineModal.vue'
import DataCenterService from '@/services/DataCenterService'
import RegionService from '@/services/RegionService'
import ClusterService from '@/services/ClusterService'
import DnsLineService from '@/services/DnsLineService'

// 搜索表单
const searchForm = reactive({
  name: '',
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const relatedClustersLoading = ref(null)
const isEdit = ref(false)
const regions = ref([])
const regionTree = ref([])

// 对话框
const dialogVisible = ref(false)
const formRef = ref()
const deleteVisible = ref(false)
const deleteRow = ref(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  regionId: '',
  status: 'active',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  remark: '',
  createTime: '',
  createAccount: '',
  updateTime: '',
  updateAccount: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入机房名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  regionId: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  contactPerson: [
    { required: false, message: '请输入联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: false, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { required: false, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 过滤相关
const statusPopoverVisible = ref(false)
const statusFilterValue = ref([])
const sortState = ref({ prop: '', order: '' })

function resetStatusFilter() { statusFilterValue.value = []; pagination.value.currentPage = 1; }
function confirmStatusFilter() { 
  statusPopoverVisible.value = false;
  pagination.value.currentPage = 1;
}
function handleSortChange({ prop, order }) { sortState.value = { prop, order } }

// 级联选择器的选项，用于选择地域
const regionOptions = computed(() => {
  return regionTree.value
})

// 获取地域数据
const fetchRegions = async () => {
  try {
    // 获取树形地域数据
    regionTree.value = await RegionService.getRegionTree()
    // 同时获取扁平化地域数据
    regions.value = await RegionService.getRegions()
  } catch (error) {
    console.error('获取地域数据失败:', error)
  }
}

// 获取地域名称
const getRegionName = (regionId) => {
  const region = regions.value.find(r => r.id === regionId)
  return region ? region.name : regionId
}

// 获取机房数据
const fetchData = async () => {
  loading.value = true
  try {
    const data = await DataCenterService.getDataCenters()
    
    // 处理数据
    for (const item of data) {
      // 获取地域名称
      if (item.regionId && regions.value.length > 0) {
        const region = regions.value.find(r => r.id === item.regionId)
        if (region) {
          item.regionName = region.name
        }
      }
      
      // 获取DNS线路数据
      try {
        const dnsLineData = await DnsLineService.getDataCenterDnsLines(item.id)
        item.dnsLines = dnsLineData.map(line => line.dnsLineCode)
      } catch (error) {
        console.error(`获取机房 ${item.id} 的DNS线路数据失败:`, error)
        item.dnsLines = []
      }
    }
    
    tableData.value = data
  } catch (error) {
    console.error('获取机房数据失败:', error)
    ElMessage.error('获取机房数据失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 分页数据
const PAGE_SIZE_KEY = 'datacenter-page-size';
const defaultPageSize = Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
const pagination = ref({
  currentPage: 1,
  pageSize: defaultPageSize,
  total: 0
})

// 过滤和排序后的表格数据
const filteredTableData = computed(() => {
  let data = tableData.value
  
  // 根据名称过滤
  if (searchForm.name) {
    const searchName = searchForm.name.toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(searchName))
  }
  
  // 根据状态过滤
  if (statusFilterValue.value.length) {
    data = data.filter(item => statusFilterValue.value.includes(item.status))
  }
  
  // 排序
  if (sortState.value.prop && sortState.value.order) {
    data = [...data].sort((a, b) => {
      let aVal = a[sortState.value.prop]
      let bVal = b[sortState.value.prop]
      // 时间字段特殊处理
      if (sortState.value.prop === 'createTime' || sortState.value.prop === 'updateTime') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      if (sortState.value.order === 'ascending') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }
  
  // 更新总数
  pagination.value.total = data.length
  
  return data
})

// 分页后的表格数据
const paginatedTableData = computed(() => {
  const startIndex = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredTableData.value.slice(startIndex, endIndex)
})

// 搜索
const handleSearch = () => {
  // 简单处理，筛选现有数据
  console.log('搜索:', searchForm)
  pagination.value.currentPage = 1 // 重置到第一页
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  statusFilterValue.value = []
  pagination.value.currentPage = 1 // 重置到第一页
  handleSearch()
}

// 新增
const handleAdd = async () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    name: '',
    regionId: '',
    status: 'active',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    remark: '',
    createTime: '',
    createAccount: '',
    updateTime: '',
    updateAccount: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { 
    id: row.id,
    name: row.name,
    regionId: row.regionId,
    status: row.status,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    remark: row.remark
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  // 检查是否有关联的集群
  try {
    const relatedClusters = await ClusterService.getClustersByDataCenterId(row.id)
    if (relatedClusters.length > 0) {
      ElMessageBox.alert(
        `该机房已被${relatedClusters.length}个集群关联使用，无法删除。请先移除关联集群再进行删除操作。`,
        '无法删除',
        { type: 'warning' }
      )
      return
    }
    
    deleteRow.value = row
    deleteVisible.value = true
  } catch (error) {
    console.error('检查关联集群失败:', error)
    ElMessage.error('操作失败')
  }
}

// 确认删除
const confirmDelete = async () => {
  try {
    await DataCenterService.deleteDataCenter(deleteRow.value.id)
    ElMessage.success('删除成功')
    fetchData() // 重新获取数据
  } catch (error) {
    console.error('删除机房失败:', error)
    ElMessage.error('删除机房失败')
  }
  deleteVisible.value = false
}

// 状态变更
const handleStatusChange = async (row) => {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  try {
    await DataCenterService.updateDataCenter(row.id, { status: newStatus })
    row.status = newStatus
    ElMessage.success(`机房已${newStatus === 'active' ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新机房状态失败:', error)
    ElMessage.error('更新机房状态失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          await DataCenterService.updateDataCenter(form.id, form)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await DataCenterService.addDataCenter(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData() // 重新获取数据
      } catch (error) {
        console.error('提交表单失败:', error)
        ElMessage.error('提交表单失败')
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 查看关联集群
const handleViewRelatedClusters = async (row) => {
  relatedClustersLoading.value = row.id
  try {
    const relatedClusters = await ClusterService.getClustersByDataCenterId(row.id)
    if (relatedClusters.length === 0) {
      ElMessage.info('当前机房暂无关联集群')
      return
    }
    
    // 构建集群信息展示内容
    const clusterListHtml = relatedClusters
      .map(cluster => `<li>${cluster.displayName} (${cluster.name})</li>`)
      .join('')
    
    ElMessageBox.alert(
      `<div>
        <p>机房 <b>${row.name}</b> 关联的集群列表:</p>
        <ul>${clusterListHtml}</ul>
      </div>`,
      '关联集群',
      { dangerouslyUseHTMLString: true }
    )
  } catch (error) {
    console.error('获取关联集群失败:', error)
    ElMessage.error('获取关联集群失败')
  } finally {
    relatedClustersLoading.value = null
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  localStorage.setItem(PAGE_SIZE_KEY, val)
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

// DNS线路绑定相关
const dnsLineModalVisible = ref(false)
const currentDataCenterId = ref('')

// 处理DNS线路绑定
const handleDnsLineBinding = (row) => {
  currentDataCenterId.value = row.id
  dnsLineModalVisible.value = true
}

// 处理DNS线路提交
const handleDnsLineSubmit = (data) => {
  ElMessage.success(`机房 ${data.dataCenterId} 成功绑定 ${data.dnsLineCodes.length} 条DNS线路`)
  fetchData()
}

// 获取DNS线路名称
const getLineName = (code) => {
  return DnsLineService.getLineName(code)
}

// 初始化
onMounted(async () => {
  await fetchRegions()
  await fetchData()
})
</script>

<style scoped>
.datacenter-management {
  padding: 0;
  margin: 0;
  background: #f5f6fa;
  min-height: calc(100vh - 48px);
}

.box-card {
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  height: calc(100vh - 48px);
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.text-xs {
  font-size: 12px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-400 {
  color: #9ca3af;
}

.mt-2 {
  margin-top: 8px;
}

.ml-1 {
  margin-left: 4px;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.cursor-pointer {
  cursor: pointer;
}

.ellipsis-cell {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.dense-row td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

.text-center {
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.el-card__body {
  flex: 1;
  overflow: auto;
  padding-bottom: 20px;
}
</style> 