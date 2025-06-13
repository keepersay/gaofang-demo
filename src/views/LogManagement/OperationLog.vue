<template>
  <div class="operation-log-container" style="padding: 20px;">
    <el-card class="search-card" style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span>操作日志查询</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          
          <el-col :span="8">
            <el-form-item label="操作账号">
              <el-input v-model="searchForm.operatorAccount" placeholder="请输入操作账号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作对象/名称">
              <el-input v-model="searchForm.operationObject" placeholder="请输入操作对象或名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                :shortcuts="shortcuts"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="onSearch">查询</el-button>
              <el-button @click="onReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>操作日志列表</span>
        </div>
      </template>
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        max-height="500"
        @filter-change="handleFilterChange"
      >
        <el-table-column
          prop="module"
          label="模块"
          min-width="120"
          :filters="moduleFilters"
          column-key="module"
        ></el-table-column>
        <el-table-column prop="clusterName" label="集群名称" min-width="150"></el-table-column>
        <el-table-column prop="operatorAccount" label="操作账号" min-width="120"></el-table-column>
        <el-table-column prop="operatorIp" label="操作IP" min-width="120"></el-table-column>
        <el-table-column
          prop="operationType"
          label="操作类型"
          min-width="120"
          :filters="operationTypeFilters"
          column-key="operationType"
        ></el-table-column>
        <el-table-column
          prop="operationStatus"
          label="操作状态"
          min-width="120"
          :filters="statusFilters"
          column-key="operationStatus"
        >
          <template #default="scope">
            <el-tag :type="scope.row.operationStatus === 'success' ? 'success' : 'danger'">
              {{ scope.row.operationStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" min-width="180"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="showDetailDrawer(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right;"
      ></el-pagination>
    </el-card>

    <el-drawer
      v-model="detailDrawerVisible"
      title="操作日志详情"
      direction="rtl"
      size="600px"
    >
      <div v-if="currentLogDetail">
        <p><strong>操作模块:</strong> {{ currentLogDetail.module }}</p>
        <p><strong>操作账号/IP:</strong> {{ currentLogDetail.operatorAccount }} / {{ currentLogDetail.operatorIp }}</p>
        <p><strong>操作状态:</strong> 
          <el-tag :type="currentLogDetail.operationStatus === 'success' ? 'success' : 'danger'">
            {{ currentLogDetail.operationStatus === 'success' ? '成功' : '失败' }}
          </el-tag>
        </p>
        <p><strong>操作时间:</strong> {{ currentLogDetail.operationTime }}</p>
        <p><strong>请求地址:</strong> {{ currentLogDetail.requestUrl }}</p>
        <p><strong>请求参数:</strong></p>
        <pre style="background:#f5f5f5; padding:10px; border-radius:4px;">{{ JSON.stringify(currentLogDetail.requestParams, null, 2) }}</pre>
        <p><strong>响应结果:</strong></p>
        <pre style="background:#f5f5f5; padding:10px; border-radius:4px;">{{ JSON.stringify(currentLogDetail.responseResult, null, 2) }}</pre>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const searchForm = reactive({
  operatorAccount: '',
  operationObject: '',
  dateRange: []
})

const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const detailDrawerVisible = ref(false)
const currentLogDetail = ref(null)

// Mock 数据生成器
const generateMockData = (count) => {
  const data = []
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      module: ['日志管理', '集群组管理', '用户管理'][i % 3],
      clusterName: `集群-${i % 5}`,
      operatorAccount: `user${i + 1}`,
      operatorIp: `192.168.1.${i % 255}`,
      operationType: ['create', 'modify', 'delete', 'enable_disable'][i % 4],
      operationStatus: i % 2 === 0 ? 'success' : 'fail',
      operationTime: dayjs().subtract(i, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      requestUrl: `/api/v1/cluster/pool-${i}`,
      requestParams: { id: i + 1, name: `name-${i}`, value: Math.random() },
      responseResult: { code: 200, message: i % 2 === 0 ? '成功' : '失败', data: {} }
    })
  }
  return data
}

const mockData = generateMockData(100)

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

const moduleFilters = [
  { text: '日志管理', value: '日志管理' },
  { text: '集群组管理', value: '集群组管理' },
  { text: '用户管理', value: '用户管理' }
]

const operationTypeFilters = [
  { text: '创建', value: 'create' },
  { text: '修改', value: 'modify' },
  { text: '删除', value: 'delete' },
  { text: '启用/禁用', value: 'enable_disable' }
]

const statusFilters = [
  { text: '成功', value: 'success' },
  { text: '失败', value: 'fail' }
]

const currentFilters = reactive({});

const filterTableData = () => {
  console.log('filterTableData: Starting filter with currentFilters:', currentFilters, 'and searchForm:', searchForm);
  let filtered = [...mockData]

  if (searchForm.operatorAccount) {
    filtered = filtered.filter(item => item.operatorAccount.includes(searchForm.operatorAccount))
  }
  if (searchForm.operationObject) {
    filtered = filtered.filter(item => item.clusterName.includes(searchForm.operationObject) || item.requestUrl.includes(searchForm.operationObject))
  }
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange.map(d => dayjs(d))
    filtered = filtered.filter(item => {
      const itemTime = dayjs(item.operationTime)
      return itemTime.isAfter(start) && itemTime.isBefore(end)
    })
  }
  console.log('filterTableData: After searchForm filters, filtered count:', filtered.length);

  // Apply filters from table header
  for (const propName in currentFilters) {
    const filterValues = currentFilters[propName];
    if (filterValues && filterValues.length > 0) {
      console.log(`filterTableData: Applying filter for prop: ${propName} with values:`, filterValues, `Current filtered count before this filter: ${filtered.length}`);
      filtered = filtered.filter(row => {
        const rowValue = String(row[propName]).toLowerCase().trim(); // 标准化行数据值
        // 将过滤值也标准化，并使用 some 进行比较
        const isIncluded = filterValues.some(filterVal => String(filterVal).toLowerCase().trim() === rowValue);
        console.log(`filterTableData:   Checking row[${propName}] = '${rowValue}' against filterValues =`, filterValues.map(v => String(v).toLowerCase().trim()), `Result: ${isIncluded}`);
        return isIncluded;
      });
      console.log(`filterTableData: After filter for prop: ${propName}, filtered count: ${filtered.length}`);
    }
  }

  console.log('filterTableData: After table header filters, final filtered count:', filtered.length);

  total.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = filtered.slice(start, end)
}

const onSearch = () => {
  currentPage.value = 1
  filterTableData()
  ElMessage.success('查询成功')
}

const onReset = () => {
  searchForm.operatorAccount = '';
  searchForm.operationObject = '';
  searchForm.dateRange = [];
  // Reset table filters as well
  for (const key in currentFilters) {
    currentFilters[key] = [];
  }
  currentPage.value = 1
  filterTableData()
  ElMessage.info('已重置')
}

const handleSizeChange = (val) => {
  pageSize.value = val
  filterTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  filterTableData()
}

const handleFilterChange = (filters) => {
  console.log('handleFilterChange: Filters received:', filters);
  for (const key in currentFilters) {
    delete currentFilters[key];
  }
  Object.assign(currentFilters, filters);
  console.log('handleFilterChange: currentFilters after merge:', currentFilters);
  currentPage.value = 1;
  filterTableData();
};

const showDetailDrawer = (row) => {
  currentLogDetail.value = row
  detailDrawerVisible.value = true
}

onMounted(() => {
  filterTableData()
})
</script>

<style scoped>
.operation-log-container {
  padding: 20px;
}

.search-card .card-header,
.table-card .card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.search-form .el-form-item:last-child {
  margin-right: 0;
}

.search-form .el-col {
  margin-bottom: 18px; /* 调整表单项垂直间距 */
}

.search-form .el-row:last-child .el-col {
  margin-bottom: 0;
}

.el-pagination {
  justify-content: flex-end; /* 使分页组件右对齐 */
}

pre {
  white-space: pre-wrap; /* 允许长文本换行 */
  word-break: break-all; /* 允许在任意字符处断开单词 */
}
</style> 