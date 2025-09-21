<template>
  <div class="host-ip-object-management">
    <!-- 操作区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="name" label="名称" min-width="200" />
      <el-table-column prop="type" label="类型" width="120" align="center">
        <template #default="{ row }">
          {{ getTypeText(row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="networkZone" label="网络区域" width="120" align="center">
        <template #default="{ row }">
          {{ getNetworkZoneText(row.networkZone) }}
        </template>
      </el-table-column>
      <el-table-column prop="ipType" label="IP类型" width="100" align="center">
        <template #default="{ row }">
          {{ getIpTypeText(row.ipType) }}
        </template>
      </el-table-column>
      <el-table-column prop="roleType" label="角色类型" width="100" align="center">
        <template #default="{ row }">
          {{ getRoleTypeText(row.roleType) }}
        </template>
      </el-table-column>
      <el-table-column prop="defaultObject" label="默认对象" width="120" align="center">
        <template #default="{ row }">
          {{ getDefaultObjectText(row.defaultObject) }}
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" width="100" align="center">
        <template #default="{ row }">
          {{ getLocationText(row.location) }}
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="责任人" min-width="100" align="center" />
      <el-table-column prop="remark" label="备注" min-width="150">
        <template #default="{ row }">
          <span v-if="row.remark">{{ row.remark }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(row)"
            :disabled="row.defaultObject === 'system'"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新建/编辑弹窗 -->
    <SlbHostIpObjectModal
      v-model="modalVisible"
      :ip-object-data="currentObject"
      :is-edit="isEdit"
      @success="handleModalSuccess"
      @add-ip-object="handleAddIpObject"
      @modify-ip-object="handleModifyIpObject"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import HostIpObjectService from '@/services/HostIpObjectService'
import SlbHostIpObjectModal from './SlbHostIpObjectModal.vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const modalVisible = ref(false)
const currentObject = ref(null)
const isEdit = ref(false)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 获取主机IP对象列表
const fetchHostIpObjectList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 模拟API调用
    const response = await mockGetHostIpObjectList(params)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取主机IP对象列表失败')
    console.error('Error fetching host IP object list:', error)
  } finally {
    loading.value = false
  }
}

// 模拟数据存储
let mockData = [
  {
    id: 1,
    name: '自定义2',
    type: 'localip',
    networkZone: 'public',
    ipType: 'ipv4',
    roleType: 'primary',
    defaultObject: 'custom',
    location: 'local',
    owner: 'huangjj',
    remark: ''
  },
  {
    id: 2,
    name: '自定义1',
    type: 'localip',
    networkZone: 'public',
    ipType: 'ipv4',
    roleType: 'primary',
    defaultObject: 'custom',
    location: 'local',
    owner: 'huangjj',
    remark: ''
  },
  {
    id: 3,
    name: '本地公网IPv4',
    type: 'localip',
    networkZone: 'public',
    ipType: 'ipv4',
    roleType: 'primary',
    defaultObject: 'system',
    location: 'local',
    owner: 'yl',
    remark: ''
  },
  {
    id: 4,
    name: '健康检查IPv4',
    type: 'hcip',
    networkZone: 'public',
    ipType: 'ipv4',
    roleType: 'primary',
    defaultObject: 'system',
    location: 'local',
    owner: 'yl',
    remark: ''
  }
]

// 模拟获取主机IP对象列表API
const mockGetHostIpObjectList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredData = [...mockData]
      
      resolve({
        data: {
          list: filteredData,
          total: filteredData.length
        }
      })
    }, 500)
  })
}

// 显示文本转换
const getTypeText = (type) => {
  const typeMap = {
    'localip': '本地IP',
    'hcip': '健康检查IP'
  }
  return typeMap[type] || type
}

const getNetworkZoneText = (zone) => {
  const zoneMap = {
    'public': '公网',
    'private': '私网'
  }
  return zoneMap[zone] || zone
}

const getIpTypeText = (ipType) => {
  const ipTypeMap = {
    'ipv4': 'IPv4',
    'ipv6': 'IPv6'
  }
  return ipTypeMap[ipType] || ipType
}

const getRoleTypeText = (roleType) => {
  const roleTypeMap = {
    'primary': '主',
    'backup': '备'
  }
  return roleTypeMap[roleType] || roleType
}

const getDefaultObjectText = (defaultObject) => {
  const defaultObjectMap = {
    'custom': '自定义',
    'system': '系统默认'
  }
  return defaultObjectMap[defaultObject] || defaultObject
}

const getLocationText = (location) => {
  const locationMap = {
    'local': '本地',
    'remote': '远端'
  }
  return locationMap[location] || location
}

// 新建
const handleAdd = () => {
  currentObject.value = null
  isEdit.value = false
  modalVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentObject.value = { ...row }
  isEdit.value = true
  modalVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除主机IP对象"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除API调用
    await mockDeleteHostIpObject(row.id)
    ElMessage.success('删除成功')
    fetchHostIpObjectList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Error deleting host IP object:', error)
    }
  }
}

// 模拟删除主机IP对象API
const mockDeleteHostIpObject = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockData.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.splice(index, 1)
      }
      resolve({ success: true })
    }, 500)
  })
}

// 弹窗成功回调
const handleModalSuccess = () => {
  modalVisible.value = false
  fetchHostIpObjectList()
}

// 处理添加主机IP对象
const handleAddIpObject = async (data) => {
  try {
    await mockAddHostIpObject(data)
  } catch (error) {
    console.error('Error adding host IP object:', error)
  }
}

// 处理修改主机IP对象
const handleModifyIpObject = async (data) => {
  try {
    await mockModifyHostIpObject(data)
  } catch (error) {
    console.error('Error modifying host IP object:', error)
  }
}

// 模拟添加主机IP对象API
const mockAddHostIpObject = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockData.map(item => item.id)) + 1
      
      const newItem = {
        id: newId,
        ...data,
        defaultObject: 'custom'
      }
      
      mockData.push(newItem)
      resolve({ success: true })
    }, 500)
  })
}

// 模拟修改主机IP对象API
const mockModifyHostIpObject = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockData.findIndex(item => item.id === data.id)
      if (index !== -1) {
        mockData[index] = {
          ...mockData[index],
          ...data
        }
      }
      resolve({ success: true })
    }, 500)
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchHostIpObjectList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchHostIpObjectList()
}

// 组件挂载
onMounted(() => {
  fetchHostIpObjectList()
})
</script>

<style scoped>
.host-ip-object-management {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 108px);
}

.action-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  background: #fff;
}

:deep(.el-table th) {
  background: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 500;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}
</style>
