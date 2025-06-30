<template>
  <el-dialog
    v-model="dialogVisible"
    title="DNS线路绑定"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-alert
        title="机房DNS线路绑定说明"
        type="info"
        description="中国内地机房绑定二级线路，中国境外机房绑定三级线路，一个机房可以绑定多个线路。"
        show-icon
        :closable="false"
        class="mb-4"
      />
      
      <div class="dns-line-container">
        <div class="line-section">
          <h3>中国内地线路</h3>
          <DnsLineSelector
            title="中国内地线路（二级线路）"
            :lines="chinaLines"
            v-model="selectedChinaLines"
            @change="handleChinaLinesChange"
          />
        </div>
        
        <div class="line-section">
          <h3>中国境外线路</h3>
          <DnsLineSelector
            title="中国境外线路（三级线路）"
            :lines="overseasLines"
            v-model="selectedOverseasLines"
            @change="handleOverseasLinesChange"
          />
        </div>
      </div>
      
      <div class="selected-summary">
        <h3>已选择线路 ({{ selectedChinaLines.length + selectedOverseasLines.length }})</h3>
        <div class="selected-tags">
          <el-tag
            v-for="line in selectedChinaLines"
            :key="line"
            closable
            @close="handleRemoveLine(line, 'china')"
            class="mr-2 mb-2"
            type="success"
          >
            {{ getLineName(line) }}
          </el-tag>
          
          <el-tag
            v-for="line in selectedOverseasLines"
            :key="line"
            closable
            @close="handleRemoveLine(line, 'overseas')"
            class="mr-2 mb-2"
            type="warning"
          >
            {{ getLineName(line) }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import DnsLineSelector from '@/components/DnsLineSelector.vue'
import DnsLineService from '@/services/DnsLineService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dataCenterId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(false)
const loading = ref(false)

// DNS线路数据
const chinaLines = ref([])
const overseasLines = ref([])

// 选中的线路
const selectedChinaLines = ref([])
const selectedOverseasLines = ref([])

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.dataCenterId) {
    fetchDnsLines()
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 获取DNS线路数据
const fetchDnsLines = async () => {
  loading.value = true
  try {
    // 获取中国内地线路
    chinaLines.value = DnsLineService.getChinaLines()
    
    // 获取中国境外线路
    overseasLines.value = DnsLineService.getOverseasLines()
    
    // 获取机房已绑定的线路
    if (props.dataCenterId) {
      const dataCenterDnsLines = await DnsLineService.getDataCenterDnsLines(props.dataCenterId)
      const dnsLineCodes = dataCenterDnsLines.map(item => item.dnsLineCode)
      
      // 分类已选择的线路
      selectedChinaLines.value = dnsLineCodes.filter(code => 
        chinaLines.value.some(line => line.code === code)
      )
      
      selectedOverseasLines.value = dnsLineCodes.filter(code => 
        overseasLines.value.some(line => line.code === code)
      )
    }
  } catch (error) {
    console.error('获取DNS线路数据失败', error)
    ElMessage.error('获取DNS线路数据失败')
  } finally {
    loading.value = false
  }
}

// 获取线路名称
const getLineName = (code) => {
  return DnsLineService.getLineName(code)
}

// 处理中国内地线路变化
const handleChinaLinesChange = (values) => {
  selectedChinaLines.value = values
}

// 处理中国境外线路变化
const handleOverseasLinesChange = (values) => {
  selectedOverseasLines.value = values
}

// 移除线路
const handleRemoveLine = (code, type) => {
  if (type === 'china') {
    selectedChinaLines.value = selectedChinaLines.value.filter(item => item !== code)
  } else {
    selectedOverseasLines.value = selectedOverseasLines.value.filter(item => item !== code)
  }
}

// 提交
const handleSubmit = async () => {
  if (!props.dataCenterId) {
    ElMessage.error('机房ID不能为空')
    return
  }
  
  loading.value = true
  try {
    // 合并所有选中的线路
    const dnsLineCodes = [...selectedChinaLines.value, ...selectedOverseasLines.value]
    
    // 保存机房DNS线路绑定
    await DnsLineService.saveDataCenterDnsLines(props.dataCenterId, dnsLineCodes)
    
    ElMessage.success('DNS线路绑定成功')
    emit('submit', {
      dataCenterId: props.dataCenterId,
      dnsLineCodes
    })
    dialogVisible.value = false
  } catch (error) {
    console.error('保存DNS线路绑定失败', error)
    ElMessage.error('保存DNS线路绑定失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  selectedChinaLines.value = []
  selectedOverseasLines.value = []
}

// 初始化
onMounted(() => {
  // 预加载DNS线路数据
  chinaLines.value = DnsLineService.getChinaLines()
  overseasLines.value = DnsLineService.getOverseasLines()
})
</script>

<style scoped>
.dns-line-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.line-section {
  flex: 1;
}

.line-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.selected-summary {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.selected-summary h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style> 