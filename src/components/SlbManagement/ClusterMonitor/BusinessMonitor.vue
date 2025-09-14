<template>
  <div class="business-monitor-content">
    <!-- 搜索区域 -->
    <div class="monitor-search-form">
      <el-form :inline="true" size="small" :model="searchForm">
        <el-form-item label="业务类型">
          <el-select 
            v-model="searchForm.businessType"
            placeholder="请选择" 
            style="width: 120px;"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option label="HTTP" value="http" />
            <el-option label="HTTPS" value="https" />
            <el-option label="TCP" value="tcp" />
            <el-option label="UDP" value="udp" />
          </el-select>
        </el-form-item>
        <el-form-item label="监听端口">
          <el-input 
            v-model="searchForm.port"
            placeholder="8080" 
            style="width: 120px;" 
            clearable
          />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 300px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            查询
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 业务监控图表 -->
    <div class="monitor-charts-grid">
      <!-- 业务请求量 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>业务请求量</h4>
          <div class="chart-actions">
            <el-button text size="small">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="chart-content">
          <el-empty description="监控图表功能开发中" />
        </div>
      </div>
      
      <!-- 业务响应时间 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>业务响应时间</h4>
          <div class="chart-actions">
            <el-button text size="small">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="chart-content">
          <el-empty description="监控图表功能开发中" />
        </div>
      </div>
      
      <!-- 业务错误率 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>业务错误率</h4>
          <div class="chart-actions">
            <el-button text size="small">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="chart-content">
          <el-empty description="监控图表功能开发中" />
        </div>
      </div>
      
      <!-- 业务吞吐量 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>业务吞吐量</h4>
          <div class="chart-actions">
            <el-button text size="small">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="chart-content">
          <el-empty description="监控图表功能开发中" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  businessType: '',
  port: '',
  timeRange: []
})

const loading = ref(false)

// 搜索处理
const handleSearch = () => {
  console.log('业务监控查询:', searchForm)
  loading.value = true
  
  setTimeout(() => {
    loading.value = false
    ElMessage.success('业务监控数据查询完成')
  }, 1000)
}

// 重置处理
const handleReset = () => {
  Object.assign(searchForm, {
    businessType: '',
    port: '',
    timeRange: []
  })
  ElMessage.info('搜索条件已重置')
}
</script>

<style scoped>
.business-monitor-content {
  height: 100%;
  padding: 0;
}

.monitor-search-form {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  
  .el-form-item {
    margin-bottom: 0;
    margin-right: 24px;
  }
  
  .el-form-item__label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
}

.monitor-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  height: calc(100% - 120px);
}

.chart-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .chart-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .chart-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .chart-content {
    padding: 20px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
