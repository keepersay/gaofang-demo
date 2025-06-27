<template>
  <div class="request-log-page">
    <el-card class="log-card">
      <div class="log-header">
        <h3>请求日志</h3>
        <div class="header-actions">
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </div>
      
      <div class="search-bar">
        <el-input
          v-model="search.keyword"
          placeholder="搜索接口/IP/用户ID"
          style="width: 250px;"
          clearable
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-left: 10px; width: 320px;"
        />
        <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <el-empty description="请求日志内容暂未设计" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

// 搜索条件
const search = ref({
  keyword: ''
})

// 日期范围
const dateRange = ref(null)

// 处理搜索
const handleSearch = () => {
  console.log('搜索请求日志', search.value.keyword, dateRange.value)
  // 这里将来会添加实际的搜索逻辑
}

// 清除搜索
const handleSearchClear = () => {
  search.value.keyword = ''
  // 重置搜索结果
}

// 重置搜索
const resetSearch = () => {
  search.value.keyword = ''
  dateRange.value = null
}

// 刷新数据
const handleRefresh = () => {
  console.log('刷新请求日志数据')
  // 刷新数据
}
</script>

<style scoped>
.request-log-page {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 120px);
}

.log-card {
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.log-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.search-bar {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 0;
}
</style> 