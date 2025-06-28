<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`分配防护IP - ${instanceData?.instanceName || ''}`"
    width="60%"
    destroy-on-close
  >
    <div v-if="instanceData">
      <div class="info-section">
        <div class="info-item">
          <span class="label">业务实例ID:</span>
          <span>{{ instanceData.instanceId }}</span>
        </div>
        <div class="info-item">
          <span class="label">客户名称:</span>
          <span>{{ instanceData.customerName }}</span>
        </div>
        <div class="info-item">
          <span class="label">地址类型:</span>
          <span>{{ getAddressTypeLabel(instanceData.addressType) }}</span>
        </div>
        <div class="info-item">
          <span class="label">IP数量配额:</span>
          <span>{{ instanceData.protectionIpCount }}</span>
        </div>
        <div class="info-item">
          <span class="label">已分配数量:</span>
          <span>{{ tempProtectionIps.length }}</span>
        </div>
      </div>

      <el-divider content-position="left">当前已分配IP</el-divider>
      
      <div v-if="tempProtectionIps.length > 0">
        <el-table :data="tempProtectionIps" style="width: 100%" border>
          <el-table-column label="IP地址" prop="ip" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="handleRemoveIp(scope.$index)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-empty v-else description="暂无已分配IP" />

      <el-divider content-position="left">分配新IP</el-divider>
      
      <div class="allocation-options">
        <el-radio-group v-model="allocationType">
          <el-radio label="auto">自动分配</el-radio>
          <el-radio label="pool">从IP池选择</el-radio>
          <el-radio label="manual">手动输入</el-radio>
        </el-radio-group>
      </div>

      <div v-if="allocationType === 'auto'" class="allocation-form">
        <el-form :model="autoForm" label-width="120px">
          <el-form-item label="分配数量">
            <el-input-number 
              v-model="autoForm.count" 
              :min="1" 
              :max="remainingQuota" 
              :disabled="remainingQuota <= 0"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleAutoAllocate" 
              :disabled="remainingQuota <= 0"
            >
              自动分配
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="allocationType === 'pool'" class="allocation-form">
        <el-form :model="poolForm" label-width="120px">
          <el-form-item label="IP类型">
            <el-select v-model="poolForm.ipType" placeholder="请选择IP类型">
              <el-option label="IPv4" value="IPv4" />
              <el-option label="IPv6" value="IPv6" />
            </el-select>
          </el-form-item>
          <el-form-item label="地域" v-if="!instanceData.isAnycast">
            <el-select v-model="poolForm.regionId" placeholder="请选择地域">
              <el-option
                v-for="item in regionOptions"
                :key="item.regionId"
                :label="item.regionName"
                :value="item.regionId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFetchAvailableIps">
              查询可用IP
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider content-position="left">可用IP列表</el-divider>
        
        <el-table 
          v-loading="loading" 
          :data="availableIps" 
          style="width: 100%" 
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="IP地址" prop="ip" />
          <el-table-column label="类型" prop="type" width="100" />
          <el-table-column label="Anycast" width="100">
            <template #default="scope">
              {{ scope.row.isAnycast ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column label="地域" prop="region" width="150" />
        </el-table>

        <div class="table-footer" v-if="availableIps.length > 0">
          <el-button 
            type="primary" 
            @click="handleAddSelectedIps" 
            :disabled="selectedIps.length === 0 || selectedIps.length > remainingQuota"
          >
            添加选中IP ({{ selectedIps.length }})
          </el-button>
          <div v-if="selectedIps.length > remainingQuota" class="error-tip">
            选择的IP数量超过剩余配额
          </div>
        </div>
      </div>

      <div v-if="allocationType === 'manual'" class="allocation-form">
        <el-form :model="manualForm" label-width="120px">
          <el-form-item label="IP地址">
            <el-input 
              v-model="manualForm.ip" 
              placeholder="请输入IP地址" 
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleAddManualIp" 
              :disabled="!manualForm.ip || remainingQuota <= 0"
            >
              添加
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import BusinessInstanceService from '../../services/BusinessInstanceService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  instanceData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 数据状态
const loading = ref(false)
const allocationType = ref('auto')
const selectedIps = ref([])
const availableIps = ref([])
const regionOptions = ref([])
const tempProtectionIps = ref([])

// 表单数据
const autoForm = ref({ count: 1 })
const poolForm = ref({ ipType: 'IPv4', regionId: '' })
const manualForm = ref({ ip: '' })

// 计算剩余配额
const remainingQuota = computed(() => {
  if (!props.instanceData) return 0
  const total = props.instanceData.protectionIpCount || 0
  const used = tempProtectionIps.value.length
  return Math.max(0, total - used)
})

// 初始化数据
const initData = () => {
  if (props.instanceData && props.instanceData.protectionIps) {
    // 转换IP列表格式
    tempProtectionIps.value = Array.isArray(props.instanceData.protectionIps) 
      ? props.instanceData.protectionIps.map(ip => typeof ip === 'object' && ip !== null ? ip : { ip: ip }) 
      : [];
  } else {
    tempProtectionIps.value = []
  }
  
  // 重置其他状态
  allocationType.value = 'auto'
  selectedIps.value = []
  availableIps.value = []
  autoForm.value = { count: 1 }
  poolForm.value = { ipType: 'IPv4', regionId: '' }
  manualForm.value = { ip: '' }
}

// 监听实例数据变化
watch(() => props.instanceData, (val) => {
  if (val) {
    nextTick(() => {
      initData()
    })
  }
}, { immediate: true })

// 监听对话框可见性
watch(() => dialogVisible.value, (val) => {
  if (val) {
    nextTick(() => {
      initData()
      fetchRegionOptions()
    })
  }
})

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  // 重置数据
  tempProtectionIps.value = []
}

// 获取地域选项
const fetchRegionOptions = async () => {
  try {
    // 模拟数据，实际项目中应该从API获取
    regionOptions.value = [
      { regionId: 'cn-beijing', regionName: '华北-北京' },
      { regionId: 'cn-shanghai', regionName: '华东-上海' },
      { regionId: 'cn-guangzhou', regionName: '华南-广州' },
      { regionId: 'cn-hangzhou', regionName: '华东-杭州' },
      { regionId: 'cn-shenzhen', regionName: '华南-深圳' }
    ]
  } catch (error) {
    console.error('获取地域列表失败:', error)
  }
}

// 获取可用IP列表
const handleFetchAvailableIps = async () => {
  if (!poolForm.value.ipType) {
    ElMessage.warning('请选择IP类型')
    return
  }

  if (!props.instanceData.isAnycast && !poolForm.value.regionId) {
    ElMessage.warning('请选择地域')
    return
  }

  loading.value = true
  try {
    const result = await BusinessInstanceService.getAvailableProtectionIps()
    
    if (result.code === 200) {
      // 根据条件过滤IP
      availableIps.value = result.data.filter(ip => {
        // 类型匹配
        if (ip.type !== poolForm.value.ipType) return false
        
        // Anycast匹配
        if (props.instanceData.isAnycast !== ip.isAnycast) return false
        
        // 地域匹配（非Anycast时）
        if (!props.instanceData.isAnycast && poolForm.value.regionId && ip.region !== poolForm.value.regionId) return false
        
        // 排除已经添加的IP
        if (tempProtectionIps.value.some(item => item.ip === ip.ip)) return false
        
        return true
      })
      
      selectedIps.value = []
    } else {
      ElMessage.error(result.message || '获取可用IP失败')
    }
  } catch (error) {
    console.error('获取可用IP列表失败:', error)
    ElMessage.error('获取可用IP列表失败')
  } finally {
    loading.value = false
  }
}

// 表格选择变更
const handleSelectionChange = (selection) => {
  selectedIps.value = selection
}

// 添加选中的IP
const handleAddSelectedIps = () => {
  if (selectedIps.value.length === 0) {
    ElMessage.warning('请选择要添加的IP')
    return
  }
  
  if (selectedIps.value.length > remainingQuota.value) {
    ElMessage.warning(`最多还可添加${remainingQuota.value}个IP`)
    return
  }
  
  // 添加选中的IP
  const newIps = selectedIps.value.map(item => ({ ip: item.ip }))
  tempProtectionIps.value = [...tempProtectionIps.value, ...newIps]
  
  // 清空选择
  selectedIps.value = []
  availableIps.value = []
}

// 自动分配IP
const handleAutoAllocate = async () => {
  if (autoForm.value.count <= 0) {
    ElMessage.warning('请输入有效的分配数量')
    return
  }
  
  if (autoForm.value.count > remainingQuota.value) {
    ElMessage.warning(`最多还可分配${remainingQuota.value}个IP`)
    return
  }
  
  loading.value = true
  try {
    const result = await BusinessInstanceService.getAvailableProtectionIps()
    
    if (result.code === 200) {
      // 根据条件过滤IP
      const filteredIps = result.data.filter(ip => {
        // 类型匹配
        if (props.instanceData.addressType === 'IPv4' && ip.type !== 'IPv4') return false
        if (props.instanceData.addressType === 'IPv6' && ip.type !== 'IPv6') return false
        
        // Anycast匹配
        if (props.instanceData.isAnycast !== ip.isAnycast) return false
        
        // 地域匹配（非Anycast时）
        if (!props.instanceData.isAnycast && props.instanceData.regionId && ip.region !== props.instanceData.regionId) return false
        
        // 排除已经添加的IP
        if (tempProtectionIps.value.some(item => item.ip === ip.ip)) return false
        
        return true
      })
      
      // 随机选择指定数量的IP
      const randomIps = filteredIps
        .sort(() => 0.5 - Math.random())
        .slice(0, autoForm.value.count)
        .map(item => ({ ip: item.ip }))
      
      if (randomIps.length > 0) {
        tempProtectionIps.value = [...tempProtectionIps.value, ...randomIps]
        ElMessage.success(`已自动分配${randomIps.length}个IP`)
      } else {
        ElMessage.warning('没有可用的IP可分配')
      }
    } else {
      ElMessage.error(result.message || '自动分配IP失败')
    }
  } catch (error) {
    console.error('自动分配IP失败:', error)
    ElMessage.error('自动分配IP失败')
  } finally {
    loading.value = false
  }
}

// 添加手动输入的IP
const handleAddManualIp = () => {
  if (!manualForm.value.ip) {
    ElMessage.warning('请输入IP地址')
    return
  }
  
  if (remainingQuota.value <= 0) {
    ElMessage.warning('IP配额已用完')
    return
  }
  
  // 检查IP是否已存在
  const exists = tempProtectionIps.value.some(item => item.ip === manualForm.value.ip)
  if (exists) {
    ElMessage.warning('该IP已添加')
    return
  }
  
  // 添加IP
  tempProtectionIps.value.push({ ip: manualForm.value.ip })
  manualForm.value.ip = ''
}

// 移除IP
const handleRemoveIp = (index) => {
  tempProtectionIps.value.splice(index, 1)
}

// 提交
const handleSubmit = async () => {
  if (!props.instanceData) return
  
  try {
    const ips = tempProtectionIps.value.map(item => item.ip)
    
    const result = await BusinessInstanceService.allocateProtectionIps(props.instanceData.instanceId, ips)
    
    if (result.code === 200) {
      ElMessage.success('分配成功')
      dialogVisible.value = false
      emit('success')
    } else {
      ElMessage.error(result.message || '分配失败')
    }
  } catch (error) {
    console.error('分配防护IP失败:', error)
    ElMessage.error('分配防护IP失败')
  }
}

// 工具函数
const getAddressTypeLabel = (type) => {
  const map = {
    'IPv4': 'IPv4',
    'IPv6': 'IPv6',
    'dual': '双栈'
  }
  return map[type] || type
}
</script>

<style scoped>
.info-section {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.info-item {
  width: 33.33%;
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  margin-right: 10px;
}

.allocation-options {
  margin-bottom: 20px;
}

.allocation-form {
  margin-top: 20px;
}

.table-footer {
  margin-top: 15px;
  display: flex;
  align-items: center;
}

.error-tip {
  color: #f56c6c;
  margin-left: 15px;
}
</style> 