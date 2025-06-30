<template>
  <div class="dns-line-selector">
    <div class="selector-header">
      <div class="title">{{ title }}</div>
      <div class="actions">
        <el-button type="primary" link @click="selectAll">全选</el-button>
        <el-button type="danger" link @click="clearSelection">清空</el-button>
      </div>
    </div>
    
    <el-input
      v-model="searchKeyword"
      placeholder="搜索线路"
      prefix-icon="Search"
      clearable
      class="search-input"
    />
    
    <div class="line-list">
      <el-checkbox-group v-model="selectedValues" @change="handleSelectionChange">
        <el-checkbox 
          v-for="line in filteredLines" 
          :key="line.code" 
          :label="line.code"
          class="line-item"
        >
          {{ line.name }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: 'DNS线路'
  },
  lines: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 搜索关键词
const searchKeyword = ref('')

// 选中的值
const selectedValues = ref([...props.modelValue])

// 过滤后的线路列表
const filteredLines = computed(() => {
  if (!searchKeyword.value) {
    return props.lines
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return props.lines.filter(line => 
    line.name.toLowerCase().includes(keyword) || 
    line.code.toLowerCase().includes(keyword)
  )
})

// 全选
const selectAll = () => {
  selectedValues.value = filteredLines.value.map(line => line.code)
  emit('update:modelValue', selectedValues.value)
  emit('change', selectedValues.value)
}

// 清空选择
const clearSelection = () => {
  selectedValues.value = []
  emit('update:modelValue', selectedValues.value)
  emit('change', selectedValues.value)
}

// 处理选择变化
const handleSelectionChange = (values) => {
  emit('update:modelValue', values)
  emit('change', values)
}

// 监听props.modelValue变化
watch(() => props.modelValue, (newVal) => {
  selectedValues.value = [...newVal]
}, { deep: true })
</script>

<style scoped>
.dns-line-selector {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-weight: bold;
  font-size: 14px;
}

.search-input {
  margin-bottom: 10px;
}

.line-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
  background-color: white;
  border-radius: 4px;
}

.line-item {
  margin: 5px 0;
  display: block;
}
</style> 