<template>
  <el-drawer
    v-model="drawerVisible"
    :title="`${clusterGroup?.name || ''} - 配额管理`"
    size="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div v-if="clusterGroup" class="quota-drawer-content">
      <div class="cluster-info mb-4">
        <div class="text-gray-500">集群组ID：</div>
        <div class="font-mono">{{ clusterGroup.id }}</div>
      </div>

      <el-divider content-position="left">主集群配额</el-divider>
      
      <el-form 
        :model="quotaForm" 
        label-position="top" 
        ref="formRef"
        :rules="rules"
      >
        <div v-for="(clusterId, index) in clusterGroup.primaryClusters" :key="`p-${clusterId}`">
          <div class="cluster-name mb-2">
            {{ getClusterName(clusterId) }}
          </div>
          
          <div class="quota-form-group">
            <el-form-item :prop="`primaryQuotas.${index}.maxBandwidth`" label="带宽上限" required>
              <el-input-number 
                v-model="quotaForm.primaryQuotas[index].maxBandwidth"
                :min="1"
                :max="10000"
                controls-position="right"
              />
              <span class="ml-2">Mbps</span>
            </el-form-item>
          </div>
          
          <div class="quota-form-group">
            <el-form-item :prop="`primaryQuotas.${index}.maxConnections`" label="最大连接数" required>
              <el-input-number 
                v-model="quotaForm.primaryQuotas[index].maxConnections"
                :min="1000"
                :max="1000000"
                :step="1000"
                controls-position="right"
              />
              <span class="ml-2">个</span>
            </el-form-item>
          </div>
          
          <div class="quota-form-group">
            <el-form-item :prop="`primaryQuotas.${index}.maxRequests`" label="最大请求速率" required>
              <el-input-number 
                v-model="quotaForm.primaryQuotas[index].maxRequests"
                :min="100"
                :max="100000"
                :step="100"
                controls-position="right"
              />
              <span class="ml-2">请求/秒</span>
            </el-form-item>
          </div>
          
          <el-divider v-if="index < clusterGroup.primaryClusters.length - 1" />
        </div>
        
        <el-divider content-position="left" v-if="clusterGroup.standbyClusters && clusterGroup.standbyClusters.length > 0">备集群配额</el-divider>
        
        <div v-for="(clusterId, index) in clusterGroup.standbyClusters" :key="`s-${clusterId}`">
          <div class="cluster-name mb-2">
            {{ getClusterName(clusterId) }}
          </div>
          
          <div class="quota-form-group">
            <el-form-item :prop="`standbyQuotas.${index}.maxBandwidth`" label="带宽上限" required>
              <el-input-number 
                v-model="quotaForm.standbyQuotas[index].maxBandwidth"
                :min="1"
                :max="10000"
                controls-position="right"
              />
              <span class="ml-2">Mbps</span>
            </el-form-item>
          </div>
          
          <div class="quota-form-group">
            <el-form-item :prop="`standbyQuotas.${index}.maxConnections`" label="最大连接数" required>
              <el-input-number 
                v-model="quotaForm.standbyQuotas[index].maxConnections"
                :min="1000"
                :max="1000000"
                :step="1000"
                controls-position="right"
              />
              <span class="ml-2">个</span>
            </el-form-item>
          </div>
          
          <div class="quota-form-group">
            <el-form-item :prop="`standbyQuotas.${index}.maxRequests`" label="最大请求速率" required>
              <el-input-number 
                v-model="quotaForm.standbyQuotas[index].maxRequests"
                :min="100"
                :max="100000"
                :step="100"
                controls-position="right"
              />
              <span class="ml-2">请求/秒</span>
            </el-form-item>
          </div>
          
          <el-divider v-if="index < clusterGroup.standbyClusters.length - 1" />
        </div>
        
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ClusterService from '@/services/ClusterService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  clusterGroup: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const drawerVisible = ref(props.visible)
const formRef = ref(null)
const clusters = ref([])
const loading = ref(false)

// 获取集群数据
const fetchClusters = async () => {
  loading.value = true
  try {
    clusters.value = await ClusterService.getClusters()
  } catch (error) {
    console.error('获取集群数据失败:', error)
    ElMessage.error('获取集群数据失败')
  } finally {
    loading.value = false
  }
}

// 获取集群名称
const getClusterName = (clusterId) => {
  const cluster = clusters.value.find(c => c.id === clusterId)
  if (cluster) {
    return `${cluster.name}(${cluster.id})`
  }
  return clusterId
}

// 初始化配额表单数据
const initQuotaForm = () => {
  const primaryQuotas = props.clusterGroup?.primaryClusters?.map(clusterId => {
    // 模拟获取已有配额，实际应该从API获取
    return {
      clusterId,
      maxBandwidth: Math.floor(Math.random() * 1000) + 500, // 500-1500 Mbps
      maxConnections: Math.floor(Math.random() * 50000) + 10000, // 10000-60000 连接数
      maxRequests: Math.floor(Math.random() * 5000) + 1000 // 1000-6000 请求/秒
    }
  }) || []
  
  const standbyQuotas = props.clusterGroup?.standbyClusters?.map(clusterId => {
    // 模拟获取已有配额，实际应该从API获取
    return {
      clusterId,
      maxBandwidth: Math.floor(Math.random() * 500) + 200, // 200-700 Mbps
      maxConnections: Math.floor(Math.random() * 20000) + 5000, // 5000-25000 连接数
      maxRequests: Math.floor(Math.random() * 2000) + 500 // 500-2500 请求/秒
    }
  }) || []
  
  return {
    primaryQuotas,
    standbyQuotas
  }
}

const quotaForm = ref(initQuotaForm())

// 表单验证规则
const rules = {
  // 动态生成的规则将在提交时验证
}

// 监听抽屉可见性
watch(() => props.visible, (val) => {
  drawerVisible.value = val
  if (val) {
    // 当抽屉打开时获取数据
    fetchClusters()
    quotaForm.value = initQuotaForm()
  }
})

// 监听内部抽屉可见性状态
watch(() => drawerVisible.value, (val) => {
  emit('update:visible', val)
})

// 处理关闭
const handleClose = (done) => {
  done()
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  // 模拟提交
  try {
    ElMessage.success('配额设置保存成功')
    drawerVisible.value = false
    emit('submit', quotaForm.value)
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}
</script>

<style scoped>
.quota-drawer-content {
  padding: 20px;
}

.cluster-info {
  margin-bottom: 20px;
}

.cluster-name {
  font-weight: bold;
  margin-bottom: 10px;
  color: #409EFF;
}

.quota-form-group {
  margin-bottom: 15px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: white;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
  margin-top: 20px;
}
</style> 