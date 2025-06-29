<template>
  <div class="cluster-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>逻辑集群</span>
          <el-button type="primary" @click="handleAdd">新建集群</el-button>
        </div>
      </template>

      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入集群名称"
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
        :data="filteredTableData"
        border
        stripe
        max-height="700"
        style="width: 100%;"
        :header-cell-style="{ background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
      >
        <el-table-column prop="id" label="ID" width="220" fixed="left" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #header>
            <span>状态</span>
            <el-popover placement="bottom" width="160" trigger="click" v-model:visible="statusPopoverVisible">
  <div>
                <el-checkbox-group v-model="statusFilterValue">
                  <el-checkbox v-for="item in statusFilters" :key="item.value" :value="item.value">{{ item.text }}</el-checkbox>
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
        <el-table-column label="集群类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enableL7 ? 'warning' : 'info'">
              {{ scope.row.enableL7 ? 'L7' : 'L4' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addressType" label="地址类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.addressType === 'ipv4'" type="info">IPv4</el-tag>
            <el-tag v-else-if="scope.row.addressType === 'ipv6'" type="success">IPv6</el-tag>
            <el-tag v-else type="warning">双栈</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bandwidth" label="承载带宽(Mbps)" width="120">
          <template #default="scope">
            <span>{{ scope.row.bandwidth }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="displayName" label="显示名称" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="所属机房" width="180">
          <template #header>
            <span>所属机房</span>
            <el-popover placement="bottom" width="240" trigger="click" v-model:visible="dataCenterPopoverVisible">
              <div>
                <el-select
                  v-model="dataCenterFilterValue"
                  placeholder="请选择机房"
                  style="width: 100%"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in dataCenters"
                    :key="item.id"
                    :label="`${item.name} (${getRegionName(item.regionId)})`"
                    :value="item.id"
                  />
                </el-select>
                <div class="mt-2 flex justify-end">
                  <el-button size="small" @click="resetDataCenterFilter">重置</el-button>
                  <el-button size="small" type="primary" @click="confirmDataCenterFilter">确定</el-button>
                </div>
              </div>
              <template #reference>
                <el-icon :color="dataCenterFilterValue ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <div v-if="scope.row.dataCenterId">
              <el-tag type="success" size="small">{{ getDataCenterName(scope.row.dataCenterId) }}</el-tag>
              <span class="text-gray-500 ml-1 text-xs">{{ getRegionName(dataCenters.find(dc => dc.id === scope.row.dataCenterId)?.regionId) }}</span>
            </div>
            <span v-else class="text-gray-400">未关联</span>
          </template>
        </el-table-column>
        <el-table-column label="网元链路" min-width="220">
          <template #default="scope">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="item in [
                { label: 'ADS', value: getClusterNameById(scope.row.slots?.ADS), color: '#409EFF' },
                { label: 'SLB', value: getClusterNameById(scope.row.slots?.SLB), color: '#67C23A' },
                { label: 'WAF-CC', value: getClusterNameById(scope.row.slots?.WAFCC), color: '#E6A23C', showWhen: scope.row.enableL7 },
                { label: 'WAF', value: getClusterNameById(scope.row.slots?.WAF), color: '#F56C6C', showWhen: scope.row.enableL7 }
              ].filter(i => i.value && (i.showWhen === undefined || i.showWhen))" :key="item.label" style="display: flex; align-items: center;">
                <span :style="`background:${item.color};color:#fff;border-radius:3px;padding:2px 8px;font-size:12px;margin-right:8px;`">
                  {{ item.label }}
                </span>
                <span style="color: #666;">{{ item.value }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="IP资源池" min-width="260">
          <template #default="scope">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div v-if="scope.row.ipPools?.vip?.length">
                <span style="font-weight: 600; color: #409EFF; margin-right: 6px;">VIP池</span>
                <el-tag
                  v-for="(ip, idx) in scope.row.ipPools.vip"
                  :key="'vip-' + idx"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 2px;"
                >{{ ip }}</el-tag>
              </div>
              <div v-if="scope.row.ipPools?.origin?.length">
                <span style="font-weight: 600; color: #67C23A; margin-right: 6px;">回源IP池</span>
                <el-tag
                  v-for="(ip, idx) in scope.row.ipPools.origin"
                  :key="'origin-' + idx"
                  size="small"
                  type="success"
                  style="margin-right: 4px; margin-bottom: 2px;"
                >{{ ip }}</el-tag>
              </div>
              <div v-if="scope.row.ipPools?.snat?.length">
                <span style="font-weight: 600; color: #E6A23C; margin-right: 6px;">SNAT地址池</span>
                <el-tag
                  v-for="(ip, idx) in scope.row.ipPools.snat"
                  :key="'snat-' + idx"
                  size="small"
                  type="warning"
                  style="margin-right: 4px; margin-bottom: 2px;"
                >{{ ip }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column prop="createAccount" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="修改时间" width="160" sortable />
        <el-table-column prop="updateAccount" label="修改人" width="120" />
        <el-table-column label="操作" width="140" fixed="right">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑集群' : '新建集群'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入集群名称，例如：huadong-telecom-premium" />
        </el-form-item>
        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="form.displayName" placeholder="请输入显示名称，例如：华东-电信-高级版" />
        </el-form-item>
        <el-form-item label="ADS" prop="slots.ADS">
          <el-select v-model="form.slots.ADS" placeholder="请选择ADS集群" style="width: 100%">
            <el-option v-for="item in slotOptions.ADS" :key="item.id" :label="item.displayName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="SLB" prop="slots.SLB">
          <el-select v-model="form.slots.SLB" placeholder="请选择SLB集群" style="width: 100%">
            <el-option v-for="item in slotOptions.SLB" :key="item.id" :label="item.displayName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开启七层" prop="enableL7">
          <el-switch v-model="form.enableL7" @change="handleL7SwitchChange" />
        </el-form-item>
        <template v-if="form.enableL7">
          <el-form-item label="WAF-CC" prop="slots.WAFCC">
            <el-select v-model="form.slots.WAFCC" placeholder="请选择WAF-CC集群" style="width: 100%">
              <el-option v-for="item in slotOptions.WAFCC" :key="item.id" :label="item.displayName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="WAF" prop="slots.WAF">
            <el-select v-model="form.slots.WAF" placeholder="请选择WAF集群" style="width: 100%">
              <el-option v-for="item in slotOptions.WAF" :key="item.id" :label="item.displayName" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="机房" prop="dataCenterId">
          <el-select v-model="form.dataCenterId" placeholder="请选择机房" style="width: 100%">
            <el-option
              v-for="item in dataCenters"
              :key="item.id"
              :label="`${item.name} (${getRegionName(item.regionId)})`"
              :value="item.id"
    />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP池">
          <el-tag
            v-for="(ip, idx) in form.ipPools.vip"
            :key="'vip-' + idx"
            closable
            @close="form.ipPools.vip.splice(idx, 1)"
            style="margin-right: 4px;"
          >{{ ip }}</el-tag>
          <el-input
            v-model="vipInput"
            size="small"
            placeholder="CIDR/IP范围/单IP，回车添加"
            @keyup.enter="addVipIp"
            style="width: 220px; margin-top: 4px;"
          />
        </el-form-item>
        <el-form-item label="回源IP池">
          <el-tag
            v-for="(ip, idx) in form.ipPools.origin"
            :key="'origin-' + idx"
            closable
            @close="form.ipPools.origin.splice(idx, 1)"
            style="margin-right: 4px;"
          >{{ ip }}</el-tag>
          <el-input
            v-model="originInput"
            size="small"
            placeholder="CIDR/IP范围/单IP，回车添加"
            @keyup.enter="addOriginIp"
            style="width: 220px; margin-top: 4px;"
          />
        </el-form-item>
        <el-form-item label="SNAT地址池">
          <el-tag
            v-for="(ip, idx) in form.ipPools.snat"
            :key="'snat-' + idx"
            closable
            @close="form.ipPools.snat.splice(idx, 1)"
            style="margin-right: 4px;"
          >{{ ip }}</el-tag>
          <el-input
            v-model="snatInput"
            size="small"
            placeholder="CIDR/IP范围/单IP，回车添加"
            @keyup.enter="addSnatIp"
            style="width: 220px; margin-top: 4px;"
          />
        </el-form-item>
        <el-form-item label="集群类型">
          <el-tag :type="form.enableL7 ? 'warning' : 'info'">{{ form.enableL7 ? 'L7' : 'L4' }}</el-tag>
        </el-form-item>
        <el-form-item label="地址类型" prop="addressType">
          <el-radio-group v-model="form.addressType">
            <el-radio label="ipv4">IPv4</el-radio>
            <el-radio label="ipv6">IPv6</el-radio>
            <el-radio label="dual">双栈</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="承载带宽(Mbps)" prop="bandwidth">
          <el-input-number v-model="form.bandwidth" :min="1" :max="100000" :step="1" style="width: 180px;" />
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
      <div>确定要删除集群 <b>{{ deleteRow?.displayName }}</b> 吗？</div>
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
import { Filter } from '@element-plus/icons-vue'
import RegionService from '@/services/RegionService'
import ClusterService from '@/services/ClusterService'
import DataCenterService from '@/services/DataCenterService'

// 生成雪花算法ID
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LC${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

const loading = ref({
  regions: false,
  table: false,
  dataCenters: false
})
const dialogVisible = ref(false)
const isEdit = ref(false)
const deleteVisible = ref(false)
const deleteRow = ref(null)
const regions = ref([])
const dataCenters = ref([])
const formRef = ref()

// 搜索表单
const searchForm = ref({
  name: ''
})

// 表单数据
const form = ref({
  name: '',
  displayName: '',
  slots: { ADS: '', SLB: '', WAFCC: '', WAF: '' },
  ipPools: { vip: [], origin: [], snat: [] },
  status: 'active',
  remark: '',
  enableL7: false,
  dataCenterId: '',
  addressType: 'ipv4',
  bandwidth: 100
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群名称', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  'slots.ADS': [
    { required: true, message: '请选择ADS集群', trigger: 'change' }
  ],
  'slots.SLB': [
    { required: true, message: '请选择SLB集群', trigger: 'change' }
  ],
  'slots.WAFCC': [
    { required: computed(() => form.value.enableL7), message: '请选择WAF-CC集群', trigger: 'change' }
  ],
  'slots.WAF': [
    { required: computed(() => form.value.enableL7), message: '请选择WAF集群', trigger: 'change' }
  ],
  dataCenterId: [
    { required: true, message: '请选择所属机房', trigger: 'change' }
  ],
  remark: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ],
  addressType: [
    { required: true, message: '请选择地址类型', trigger: 'change' }
  ],
  bandwidth: [
    { required: true, message: '请输入承载带宽', trigger: 'blur' },
    { type: 'number', min: 1, max: 100000, message: '带宽范围1-100000', trigger: 'blur' }
  ]
}

// 表格数据
const tableData = ref([
  {
    id: generateSnowflakeId(),
    name: 'huadong-telecom-premium',
    displayName: '华东-电信-高级版',
    enableL7: false,
    dataCenterId: 'DC202401010002',
    slots: { ADS: 'ads-1', SLB: 'slb-1', WAFCC: '', WAF: '' },
    ipPools: {
      vip: ['1.1.1.1/24', '2.2.2.2-2.2.2.10', '3.3.3.3'],
      origin: ['10.0.0.1/28'],
      snat: ['100.64.0.1-100.64.0.5', '100.64.0.10']
    },
    status: 'active',
    remark: '华东地区电信高级版集群',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin',
    addressType: 'ipv4',
    bandwidth: 100
  },
  {
    id: generateSnowflakeId(),
    name: 'huanan-unicom-basic',
    displayName: '华南-联通-基础版',
    enableL7: true,
    dataCenterId: 'DC202401010003',
    slots: { ADS: 'ads-2', SLB: 'slb-2', WAFCC: 'wafcc-1', WAF: 'waf-1' },
    ipPools: {
      vip: ['4.4.4.4'],
      origin: ['20.0.0.1-20.0.0.5', '20.0.0.10'],
      snat: []
    },
    status: 'active',
    remark: '华南地区联通基础版集群',
    createTime: '2024-01-02 14:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-02 14:30:00',
    updateAccount: 'admin',
    addressType: 'dual',
    bandwidth: 200
  }
])

// 分页
const PAGE_SIZE_KEY = 'cluster-group-page-size';
const defaultPageSize = Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
const pagination = ref({
  currentPage: 1,
  pageSize: defaultPageSize,
  total: 0
})

// 获取地域名称
const getRegionName = (regionId) => {
  const region = regions.value.find(r => r.id === regionId)
  return region ? region.name : '-'
}

// 获取地域和机房数据
const fetchRegions = async () => {
  loading.value.regions = true
  try {
    regions.value = await RegionService.getRegions()
  } catch (error) {
    console.error('获取地域数据失败:', error)
  } finally {
    loading.value.regions = false
  }
}

// 获取机房数据
const fetchDataCenters = async () => {
  loading.value.dataCenters = true
  try {
    dataCenters.value = await DataCenterService.getDataCenters()
  } catch (error) {
    console.error('获取机房数据失败:', error)
  } finally {
    loading.value.dataCenters = false
  }
}

// 获取集群数据
const fetchClusters = async () => {
  loading.value.table = true
  try {
    tableData.value = await ClusterService.getClusters()
    pagination.value.total = tableData.value.length
  } catch (error) {
    console.error('获取集群数据失败:', error)
    ElMessage.error('获取集群数据失败')
  } finally {
    loading.value.table = false
  }
}

// 获取机房名称
const getDataCenterName = (dataCenterId) => {
  const dataCenter = dataCenters.value.find(dc => dc.id === dataCenterId)
  return dataCenter ? dataCenter.name : '-'
}

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑
}

// 重置搜索
const handleReset = () => {
  searchForm.value.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    displayName: '',
    slots: { ADS: '', SLB: '', WAFCC: '', WAF: '' },
    ipPools: { vip: [], origin: [], snat: [] },
    status: 'active',
    remark: '',
    enableL7: false,
    dataCenterId: '',
    addressType: 'ipv4',
    bandwidth: 100
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = {
    id: row.id,
    name: row.name,
    displayName: row.displayName,
    slots: {
      ADS: row.slots?.ADS || '',
      SLB: row.slots?.SLB || '',
      WAFCC: row.slots?.WAFCC || '',
      WAF: row.slots?.WAF || ''
    },
    ipPools: {
      vip: [...(row.ipPools?.vip || [])],
      origin: [...(row.ipPools?.origin || [])],
      snat: [...(row.ipPools?.snat || [])]
    },
    status: row.status,
    remark: row.remark,
    enableL7: row.enableL7 || false,
    dataCenterId: row.dataCenterId || '',
    addressType: row.addressType || 'ipv4',
    bandwidth: row.bandwidth || 100
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  deleteRow.value = row
  deleteVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    await ClusterService.deleteCluster(deleteRow.value.id)
    await fetchClusters()
    ElMessage.success('删除成功')
    deleteVisible.value = false
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 状态变更
const handleStatusChange = async (row) => {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  try {
    await ClusterService.updateClusterStatus(row.id, newStatus)
    row.status = newStatus
    const action = newStatus === 'active' ? '启用' : '禁用'
    ElMessage.success(`集群已${action}`)
  } catch (error) {
    console.error('状态变更失败:', error)
    ElMessage.error('状态变更失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          await ClusterService.updateCluster(form.value.id, form.value)
      ElMessage.success('编辑成功')
    } else {
          // 新增
          await ClusterService.addCluster(form.value)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        await fetchClusters()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
    }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  localStorage.setItem(PAGE_SIZE_KEY, val)
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
}

// 状态过滤
const statusPopoverVisible = ref(false)
const statusFilterValue = ref([])
const statusFilters = [
  { text: '启用', value: 'active' },
  { text: '禁用', value: 'disabled' }
]
function resetStatusFilter() { statusFilterValue.value = [] }
function confirmStatusFilter() { statusPopoverVisible.value = false }

// 机房过滤
const dataCenterPopoverVisible = ref(false)
const dataCenterFilterValue = ref('')
function resetDataCenterFilter() { dataCenterFilterValue.value = '' }
function confirmDataCenterFilter() { dataCenterPopoverVisible.value = false }

// 过滤后的表格数据
const filteredTableData = computed(() => {
  return tableData.value.filter(row => {
    // 名称搜索
    const nameMatch = !searchForm.value.name || row.name.includes(searchForm.value.name)
    // 状态过滤
    const statusMatch = !statusFilterValue.value.length || statusFilterValue.value.includes(row.status)
    // 机房过滤
    const dataCenterMatch = !dataCenterFilterValue.value || row.dataCenterId === dataCenterFilterValue.value
    return nameMatch && statusMatch && dataCenterMatch
  })
})

// 动态槽位选项
const slotOptions = ref({
  ADS: [
    { id: 'ads-1', displayName: 'ADS-集群A' },
    { id: 'ads-2', displayName: 'ADS-集群B' }
  ],
  SLB: [
    { id: 'slb-1', displayName: 'SLB-集群A' },
    { id: 'slb-2', displayName: 'SLB-集群B' }
  ],
  WAFCC: [
    { id: 'wafcc-1', displayName: 'WAF-CC-集群A' },
    { id: 'wafcc-2', displayName: 'WAF-CC-集群B' }
  ],
  WAF: [
    { id: 'waf-1', displayName: 'WAF-集群A' },
    { id: 'waf-2', displayName: 'WAF-集群B' }
  ]
})

// 监听七层开关变化
function handleL7SwitchChange() {
  if (form.value.enableL7) {
    // 开启七层时不清除已有的ADS和SLB选择
    const { ADS, SLB } = form.value.slots;
    form.value.slots = { ADS, SLB, WAFCC: '', WAF: '' }
  } else {
    // 关闭七层时清除WAF-CC和WAF选择
    const { ADS, SLB } = form.value.slots;
    form.value.slots = { ADS, SLB, WAFCC: '', WAF: '' }
  }
  // 新增：编辑状态下同步表格数据，实时回显集群类型
  if (isEdit.value && form.value.id) {
    const idx = tableData.value.findIndex(item => item.id === form.value.id)
    if (idx !== -1) {
      tableData.value[idx].enableL7 = form.value.enableL7
    }
  }
}

// mock静态网元集群数据
const mockElementClusters = [
  { id: 'ads-1', displayName: 'ADS-集群A' },
  { id: 'slb-1', displayName: 'SLB-集群A' },
  { id: 'wafcc-1', displayName: 'WAF-CC-集群A' },
  { id: 'waf-1', displayName: 'WAF-集群A' },
  { id: 'ads-2', displayName: 'ADS-集群B' },
  { id: 'slb-2', displayName: 'SLB-集群B' },
  { id: 'wafcc-2', displayName: 'WAF-CC-集群B' },
  { id: 'waf-2', displayName: 'WAF-集群B' }
]
function getClusterNameById(id) {
  if (!id) return ''
  const found = mockElementClusters.find(c => c.id === id)
  return found ? found.displayName : id
}

// 新增/编辑弹窗表单增加IP池输入
const vipInput = ref('')
const originInput = ref('')
const snatInput = ref('')
function addVipIp() {
  if (vipInput.value && !form.value.ipPools.vip.includes(vipInput.value)) {
    form.value.ipPools.vip.push(vipInput.value)
    vipInput.value = ''
  }
}
function addOriginIp() {
  if (originInput.value && !form.value.ipPools.origin.includes(originInput.value)) {
    form.value.ipPools.origin.push(originInput.value)
    originInput.value = ''
  }
}
function addSnatIp() {
  if (snatInput.value && !form.value.ipPools.snat.includes(snatInput.value)) {
    form.value.ipPools.snat.push(snatInput.value)
    snatInput.value = ''
  }
}

onMounted(() => {
  fetchRegions()
  fetchDataCenters()
  fetchClusters()
})
</script>

<style scoped>
.cluster-management {
  padding: 8px 12px;
  min-height: calc(100vh - 100px);
}

.box-card {
  margin-bottom: 16px;
}

:deep(.el-card__body) {
  padding: 12px 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
}

.search-area {
  margin-bottom: 16px;
  padding: 12px 12px 0 12px;
}

.pagination-container {
  margin-top: 16px;
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

.text-gray-400 {
  color: #9ca3af;
}

.mt-2 {
  margin-top: 8px;
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
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  padding-left: 4px !important;
  padding-right: 4px !important;
  font-size: 13px;
}
</style> 