<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`分配防护IP - ${instanceData?.instanceName || ''}`"
    width="70%"
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
          <span class="label">已分配IP组数量:</span>
          <span>{{ ipGroups.length }}</span>
        </div>
      </div>

      <el-divider content-position="left">防护IP组列表</el-divider>
      
      <div v-if="ipGroups.length > 0">
        <div v-for="(group, groupIndex) in ipGroups" :key="group.groupId" class="ip-group">
          <el-card class="ip-group-card">
            <template #header>
              <div class="card-header">
                <span class="group-title">IP组 {{ groupIndex + 1 }}</span>
                <span class="group-id">ID: {{ group.groupId }}</span>
                <span class="ip-count">{{ group.ips.length }} 个IP</span>
              </div>
            </template>
            
            <el-table :data="group.ips" style="width: 100%" border>
              <el-table-column label="IP地址" prop="ip" />
              <el-table-column label="类型" prop="type" width="100" />
              <el-table-column label="所属逻辑集群" prop="logicClusterName" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                    {{ scope.row.status === 'active' ? '已启用' : '未启用' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
      <el-empty v-else description="暂无已分配IP组" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
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
const ipGroups = ref([])

// 初始化数据
const initData = async () => {
  if (!props.instanceData) return;
  
  loading.value = true;
  try {
    // 获取业务实例详情，包括IP组信息
    const result = await BusinessInstanceService.allocateProtectionIps(props.instanceData.instanceId);
    
    if (result.code === 200 && result.data) {
      // 设置IP组数据
      ipGroups.value = result.data.protectionIpGroups || [];
    } else {
      ipGroups.value = [];
      ElMessage.error(result.message || '获取防护IP组失败');
    }
  } catch (error) {
    console.error('获取防护IP组失败:', error);
    ElMessage.error('获取防护IP组失败');
    ipGroups.value = [];
  } finally {
    loading.value = false;
  }
}

// 监听实例数据变化
watch(() => props.instanceData, (val) => {
  if (val) {
    nextTick(() => {
      initData();
    });
  }
}, { immediate: true });

// 监听对话框可见性
watch(() => dialogVisible.value, (val) => {
  if (val && props.instanceData) {
    nextTick(() => {
      initData();
    });
  }
});

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
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

.ip-group {
  margin-bottom: 20px;
}

.ip-group-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
}

.group-title {
  font-weight: bold;
  font-size: 16px;
}

.group-id {
  margin-left: 15px;
  color: #909399;
  font-size: 14px;
}

.ip-count {
  margin-left: auto;
  color: #409EFF;
  font-weight: bold;
}
</style> 