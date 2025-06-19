<template>
  <div class="login-log-container" style="padding: 20px;">
    <el-card class="search-card" style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span>登录日志查询</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="输入账号">
              <el-input v-model="searchForm.username" placeholder="请输入账号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="登录 IP">
              <el-input v-model="searchForm.ip" placeholder="请输入登录 IP"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日期范围">
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
          <span>登录日志列表</span>
        </div>
      </template>
      <el-table :data="tableData" stripe style="width: 100%" @filter-change="handleFilterChange" max-height="500">
        <el-table-column prop="username" label="操作账号"></el-table-column>
        <el-table-column prop="ip" label="登录 IP"></el-table-column>
        <el-table-column prop="device" label="登录设备"></el-table-column>
        <el-table-column
          prop="status"
          label="登录状态"
          :filters="[
            { text: '成功', value: 'success' },
            { text: '失败', value: 'fail' }
          ]"
          column-key="status"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="登录时间"></el-table-column>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const searchForm = reactive({
  username: '',
  ip: '',
  dateRange: []
})

const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 雪花算法ID生成（简单模拟）
function generateSnowflakeId() {
  const timestamp = Date.now() % 1e12
  const machineId = Math.floor(Math.random() * 1024)
  const sequence = Math.floor(Math.random() * 4096)
  return `LCG${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`
}

const mockData = Array.from({ length: 100 }).map((_, i) => ({
  id: generateSnowflakeId(),
  username: `user${i + 1}`,
  ip: `192.168.1.${i % 255}`,
  device: `设备-${i % 10}`,
  status: i % 2 === 0 ? 'success' : 'fail',
  time: dayjs().subtract(i, 'hour').format('YYYY-MM-DD HH:mm:ss')
}))

// 定义快捷选择选项
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

const currentFilters = reactive({});

const filterTableData = () => {
  let filtered = [...mockData]

  if (searchForm.username) {
    filtered = filtered.filter(item => item.username.includes(searchForm.username))
  }
  if (searchForm.ip) {
    filtered = filtered.filter(item => item.ip.includes(searchForm.ip))
  }
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange.map(d => dayjs(d))
    filtered = filtered.filter(item => {
      const itemTime = dayjs(item.time)
      return itemTime.isAfter(start) && itemTime.isBefore(end)
    })
  }

  for (const key in currentFilters) {
    if (currentFilters[key] && currentFilters[key].length > 0) {
      filtered = filtered.filter(row => {
        const rowValue = String(row[key]).toLowerCase().trim();
        const isIncluded = currentFilters[key].some(filterVal => String(filterVal).toLowerCase().trim() === rowValue);
        return isIncluded;
      });
    }
  }

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
  searchForm.username = '';
  searchForm.ip = '';
  searchForm.dateRange = [];
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
  for (const key in currentFilters) {
    delete currentFilters[key];
  }
  Object.assign(currentFilters, filters);
  filterTableData();
};

onMounted(() => {
  filterTableData()
})
</script>

<style scoped>
.login-log-container {
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
</style> 