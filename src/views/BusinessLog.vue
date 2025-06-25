<template>
  <div class="business-log-page">
    <el-card class="log-card">
      <div class="log-header">
        <h3>业务日志</h3>
        <div class="header-actions">
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </div>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求日志" name="request">
          <div class="tab-content">
            <div class="search-bar">
              <el-input
                v-model="search.request"
                placeholder="搜索接口/IP/用户ID"
                style="width: 250px;"
                clearable
                @clear="handleSearchClear('request')"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-date-picker
                v-model="dateRange.request"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-left: 10px; width: 320px;"
              />
              <el-button type="primary" @click="handleSearch('request')" style="margin-left: 10px;">搜索</el-button>
            </div>
            
            <el-empty description="请求日志内容暂未设计" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="攻击日志" name="attack">
          <div class="tab-content">
            <div class="search-bar">
              <el-input
                v-model="search.attack"
                placeholder="搜索攻击类型/IP/目标"
                style="width: 250px;"
                clearable
                @clear="handleSearchClear('attack')"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-date-picker
                v-model="dateRange.attack"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-left: 10px; width: 320px;"
              />
              <el-button type="primary" @click="handleSearch('attack')" style="margin-left: 10px;">搜索</el-button>
            </div>
            
            <el-empty description="攻击日志内容暂未设计" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

// 当前活动标签页
const activeTab = ref('request')

// 搜索条件
const search = ref({
  request: '',
  attack: ''
})

// 日期范围
const dateRange = ref({
  request: null,
  attack: null
})

// 处理搜索
const handleSearch = (type) => {
  console.log(`搜索${type}日志`, search.value[type], dateRange.value[type])
  // 这里将来会添加实际的搜索逻辑
}

// 清除搜索
const handleSearchClear = (type) => {
  search.value[type] = ''
  // 重置搜索结果
}

// 刷新数据
const handleRefresh = () => {
  console.log('刷新日志数据')
  // 刷新当前标签页的数据
}
</script>

<style scoped>
.business-log-page {
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
}

.tab-content {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 