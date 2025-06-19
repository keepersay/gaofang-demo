<template>
  <div class="cluster-group-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>逻辑集群组</span>
          <el-button type="primary" @click="handleAdd">新建集群组</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="名称">
            <el-input v-model="searchForm.name" placeholder="请输入集群组名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="filteredTableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="120" fixed="left" />
        <el-table-column prop="name" label="名称" width="180" fixed="left" />
        <el-table-column prop="region" label="地域" width="100">
          <template #header>
            <span>地域</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="regionPopoverVisible"
            >
              <div>
                <el-checkbox-group v-model="regionFilterValue">
                  <el-checkbox v-for="item in regionFilters" :key="item.value" :value="item.value">{{ item.text }}</el-checkbox>
                </el-checkbox-group>
                <div class="mt-2 flex justify-end">
                  <el-button size="small" @click="resetRegionFilter">重置</el-button>
                  <el-button size="small" type="primary" @click="confirmRegionFilter">确定</el-button>
                </div>
              </div>
              <template #reference>
                <el-icon :color="regionFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            {{ scope.row.region }}
          </template>
        </el-table-column>
        <el-table-column prop="isDistributed" label="是否分布式" width="120">
          <template #header>
            <span>是否分布式</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="distributedPopoverVisible"
            >
              <div>
                <el-checkbox-group v-model="distributedFilterValue">
                  <el-checkbox :label="true">是</el-checkbox>
                  <el-checkbox :label="false">否</el-checkbox>
                </el-checkbox-group>
                <div class="mt-2 flex justify-end">
                  <el-button size="small" @click="resetDistributedFilter">重置</el-button>
                  <el-button size="small" type="primary" @click="confirmDistributedFilter">确定</el-button>
                </div>
              </div>
              <template #reference>
                <el-icon :color="distributedFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.isDistributed ? 'success' : 'info'">
              {{ scope.row.isDistributed ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="primaryClusters" label="主集群" width="200">
          <template #default="scope">
            <div v-for="cluster in scope.row.primaryClusters" :key="cluster" class="cluster-item">
              {{ cluster }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="standbyClusters" label="备集群" width="200">
          <template #default="scope">
            <div v-if="scope.row.standbyClusters.length > 0">
              <div v-for="cluster in scope.row.standbyClusters" :key="cluster" class="cluster-item">
                {{ cluster }}
              </div>
            </div>
            <span v-else class="text-gray-400">无</span>
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
        <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="添加时间" width="160" />
        <el-table-column prop="createAccount" label="添加账号" width="120" />
        <el-table-column prop="updateTime" label="最后修改时间" width="160" />
        <el-table-column prop="updateAccount" label="最后修改账号" width="120" />
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
      </el-table>

      <!-- 分页 -->
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入集群组名称" />
        </el-form-item>
        <el-form-item label="地域" prop="region">
          <el-select v-model="form.region" placeholder="请选择地域" style="width: 100%">
            <el-option label="华北" value="华北" />
            <el-option label="华东" value="华东" />
            <el-option label="华南" value="华南" />
            <el-option label="西南" value="西南" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否分布式" prop="isDistributed">
          <el-radio-group v-model="form.isDistributed">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主集群" prop="primaryClusters">
          <el-select 
            v-model="form.primaryClusters" 
            :multiple="form.isDistributed"
            :max-tag-count="form.isDistributed ? undefined : 1"
            :collapse-tags="form.isDistributed"
            :collapse-tags-tooltip="form.isDistributed"
            :disabled="!form.isDistributed && form.primaryClusters.length >= 1"
            placeholder="请选择主集群" 
            style="width: 100%"
          >
            <el-option label="huadong-telecom-premium (华东-上海)" value="huadong-telecom-premium" />
            <el-option label="huanan-unicom-basic (华南-广州)" value="huanan-unicom-basic" />
            <el-option label="huabei-mobile-standard (华北-北京)" value="huabei-mobile-standard" />
          </el-select>
          <div class="form-tip">
            <template v-if="form.isDistributed">主集群≥1个，多个主集群时实现负载均衡</template>
            <template v-else>主集群仅能选择1个</template>
          </div>
        </el-form-item>
        <el-form-item label="备集群" prop="standbyClusters">
          <el-select 
            v-model="form.standbyClusters" 
            multiple 
            placeholder="请选择备集群（可选，最多1个）" 
            style="width: 100%"
          >
            <el-option label="huanan-unicom-basic (华南-广州)" value="huanan-unicom-basic" />
            <el-option label="huadong-telecom-premium (华东-上海)" value="huadong-telecom-premium" />
            <el-option label="huabei-mobile-standard (华北-北京)" value="huabei-mobile-standard" />
          </el-select>
          <div class="form-tip">备集群≤1个，用于故障切换</div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Filter } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  region: '',
  isDistributed: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const deleteVisible = ref(false)
const deleteRow = ref(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  region: '',
  isDistributed: false,
  primaryClusters: [],
  standbyClusters: [],
  status: 'active',
  remark: '',
  createTime: '',
  createAccount: '',
  updateTime: '',
  updateAccount: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群组名称', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地域', trigger: 'change' }
  ],
  primaryClusters: [
    { required: true, message: '请选择主集群', trigger: 'change' },
    { 
      validator: (rule, value, callback) => {
        if (form.isDistributed) {
          if (value.length < 1) {
            callback(new Error('分布式时主集群至少选择1个'))
          } else {
            callback()
          }
        } else {
          if (value.length !== 1) {
            callback(new Error('非分布式时主集群只能选择1个'))
          } else {
            callback()
          }
        }
      }, 
      trigger: 'change' 
    }
  ],
  standbyClusters: [
    { 
      validator: (rule, value, callback) => {
        if (value.length > 1) {
          callback(new Error('备集群最多选择1个'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  // 41位时间戳 + 10位机器ID + 12位自增序列
  const timestamp = Date.now() % 1e12 // 保证长度
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

// 模拟数据
const mockData = [
  {
    id: generateSnowflakeId(),
    name: '华东-华南高可用组',
    region: '华东',
    isDistributed: false,
    primaryClusters: ['huadong-telecom-premium'],
    standbyClusters: ['huanan-unicom-basic'],
    status: 'active',
    remark: '华东主集群，华南备集群',
    createTime: '2024-01-15 10:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-20 14:20:00',
    updateAccount: 'admin'
  },
  {
    id: generateSnowflakeId(),
    name: '分布式负载均衡组',
    region: '全国',
    isDistributed: true,
    primaryClusters: ['huadong-telecom-premium', 'huanan-unicom-basic'],
    standbyClusters: ['huabei-mobile-standard'],
    status: 'active',
    remark: '分布式部署，多主集群负载均衡',
    createTime: '2024-01-18 09:15:00',
    createAccount: 'operator1',
    updateTime: '2024-01-18 09:15:00',
    updateAccount: 'operator1'
  },
  {
    id: generateSnowflakeId(),
    name: '华北单集群组',
    region: '华北',
    isDistributed: false,
    primaryClusters: ['huabei-mobile-standard'],
    standbyClusters: [],
    status: 'disabled',
    remark: '无备用集群，仅用于测试',
    createTime: '2024-01-10 16:45:00',
    createAccount: 'admin',
    updateTime: '2024-01-25 11:30:00',
    updateAccount: 'operator2'
  }
]

// 获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = mockData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    region: '',
    isDistributed: '',
    status: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新建集群组'
  Object.assign(form, {
    id: '',
    name: '',
    region: '',
    isDistributed: false,
    primaryClusters: [],
    standbyClusters: [],
    status: 'active',
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
  dialogTitle.value = '编辑集群组'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  deleteRow.value = row
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  const index = tableData.value.findIndex(item => item.id === deleteRow.value.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
    pagination.total--
    ElMessage.success('删除成功')
  }
  deleteVisible.value = false
}

// 状态变更
const handleStatusChange = (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  row.status = row.status === 'active' ? 'disabled' : 'active'
  row.updateTime = new Date().toLocaleString()
  row.updateAccount = 'current_user'
  ElMessage.success(`集群组已${action}`)
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证分布式逻辑
      if (!form.isDistributed) {
        // 非分布式时，地域必须与主集群地域相同
        const primaryClusterRegions = getClusterRegions(form.primaryClusters)
        if (!primaryClusterRegions.includes(form.region)) {
          ElMessage.error('非分布式时，地域必须与主集群地域相同')
          return
        }
      }

      const currentTime = new Date().toLocaleString()
      const currentUser = 'current_user'
      
      if (form.id) {
        // 编辑
        const index = tableData.value.findIndex(item => item.id === form.id)
        if (index > -1) {
          Object.assign(tableData.value[index], {
            ...form,
            updateTime: currentTime,
            updateAccount: currentUser
          })
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增
        const newGroup = {
          ...form,
          id: generateId(),
          createTime: currentTime,
          createAccount: currentUser,
          updateTime: currentTime,
          updateAccount: currentUser
        }
        tableData.value.push(newGroup)
        pagination.total++
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 新增时也用雪花ID
function generateId() {
  return generateSnowflakeId()
}

// 获取集群地域（模拟函数）
function getClusterRegions(clusters) {
  const clusterRegionMap = {
    'huadong-telecom-premium': '华东',
    'huanan-unicom-basic': '华南',
    'huabei-mobile-standard': '华北'
  }
  return clusters.map(cluster => clusterRegionMap[cluster] || '未知')
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

// 过滤相关
const regionPopoverVisible = ref(false)
const distributedPopoverVisible = ref(false)
const statusPopoverVisible = ref(false)
const regionFilters = [
  { text: '华北', value: '华北' },
  { text: '华东', value: '华东' },
  { text: '华南', value: '华南' },
  { text: '西南', value: '西南' },
  { text: '全国', value: '全国' }
]
const regionFilterValue = ref([])
const distributedFilterValue = ref([])
const statusFilterValue = ref([])

function resetRegionFilter() { regionFilterValue.value = [] }
function confirmRegionFilter() { regionPopoverVisible.value = false }
function resetDistributedFilter() { distributedFilterValue.value = [] }
function confirmDistributedFilter() { distributedPopoverVisible.value = false }
function resetStatusFilter() { statusFilterValue.value = [] }
function confirmStatusFilter() { statusPopoverVisible.value = false }

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let data = tableData.value
  // 名称搜索
  if (searchForm.name) {
    const query = searchForm.name.trim().toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(query))
  }
  // 地域过滤
  if (regionFilterValue.value.length) {
    data = data.filter(item => regionFilterValue.value.includes(item.region))
  }
  // 分布式过滤
  if (distributedFilterValue.value.length) {
    data = data.filter(item => distributedFilterValue.value.includes(item.isDistributed))
  }
  // 状态过滤
  if (statusFilterValue.value.length) {
    data = data.filter(item => statusFilterValue.value.includes(item.status))
  }
  return data
})

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

.mt-2 {
  margin-top: 8px;
}

.cluster-item {
  margin-bottom: 4px;
  padding: 2px 6px;
  background: #f0f2f5;
  border-radius: 3px;
  font-size: 12px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 