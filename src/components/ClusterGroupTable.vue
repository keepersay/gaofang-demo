<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">逻辑集群</h1>
    </div>

    <div class="bg-white rounded-lg shadow-md p-4">
      <div class="flex items-center justify-between mb-48">
        <el-input
          v-model="inputValue"
          placeholder="按逻辑集群名称或ID搜索..."
          clearable
          style="width: 260px;"
          @keyup.enter="onSearch"
        >
          <template #append>
            <el-button @click="onSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="$emit('create')">新建逻辑集群</el-button>
      </div>

      <el-card class="table-card mt-48">
        <template #header>
          <div class="card-header">
            <span>逻辑集群列表</span>
          </div>
        </template>
        <el-table
          :data="data"
          border
          stripe
          :loading="loading"
          @sort-change="$emit('sort-change', $event)"
          max-height="500"
        >
          <el-table-column label="集群名称 / ID" min-width="180">
            <template #default="{ row }">
              <div class="font-medium">{{ row.name }}</div>
              <div class="text-xs text-gray-500">{{ row.id }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="location"
            min-width="140"
            column-key="location"
          >
            <template #header>
              <span>所在机房</span>
              <el-popover
                placement="bottom"
                width="160"
                trigger="click"
                v-model:visible="locationPopoverVisible"
              >
                <div>
                  <el-checkbox-group v-model="locationFilterValue">
                    <div v-for="item in locationFilters" :key="item.value" style="margin-bottom: 5px;">
                      <el-checkbox :value="item.value">{{ item.text }}</el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <div class="mt-2 flex justify-end">
                    <el-button size="small" @click="resetLocationFilter">重置</el-button>
                    <el-button size="small" type="primary" @click="confirmLocationFilter">确定</el-button>
                  </div>
                </div>
                <template #reference>
                  <el-icon :color="locationFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
                </template>
              </el-popover>
            </template>
            <template #default="{ row }">
              {{ row.location }}
            </template>
          </el-table-column>
          <el-table-column
            prop="linkType"
            min-width="140"
            column-key="linkType"
          >
            <template #header>
              <span>链路类型</span>
              <el-popover
                placement="bottom"
                width="160"
                trigger="click"
                v-model:visible="linkTypePopoverVisible"
              >
                <div>
                  <el-checkbox-group v-model="linkTypeFilterValue">
                    <div v-for="item in linkTypeFilters" :key="item.value" style="margin-bottom: 5px;">
                      <el-checkbox :value="item.value">{{ item.text }}</el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <div class="mt-2 flex justify-end">
                    <el-button size="small" @click="resetLinkTypeFilter">重置</el-button>
                    <el-button size="small" type="primary" @click="confirmLinkTypeFilter">确定</el-button>
                  </div>
                </div>
                <template #reference>
                  <el-icon :color="linkTypeFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
                </template>
              </el-popover>
            </template>
            <template #default="{ row }">
              <el-tag :type="row.linkType === 'L7' ? 'info' : 'success'">
                {{ row.linkType === 'L7' ? '七层防护' : '四层防护' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="elementCount" label="网元数量" min-width="100" />
          <el-table-column
            prop="updatedAt"
            label="最后修改时间"
            min-width="140"
            sortable
          />
          <el-table-column label="操作" min-width="220">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="$emit('edit', row)">编辑</el-button>
              <el-button type="info" link size="small" @click="$emit('quota', row)">配额管理</el-button>
              <el-button type="danger" link size="small" @click="$emit('delete', row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div class="text-gray-400 py-10 text-center">暂无数据</div>
          </template>
        </el-table>
        <div class="mt-4 flex justify-end" style="margin-top: 20px; text-align: right;">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            :page-sizes="pageSizeOptions"
            @current-change="$emit('page-change', $event)"
            @size-change="$emit('page-size-change', $event)"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Filter, Search } from '@element-plus/icons-vue'

const props = defineProps({
  data: Array,
  total: Number,
  currentPage: Number,
  pageSize: Number,
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  search: String,
  loading: Boolean,
  locationFilters: {
    type: Array,
    default: () => [
      { text: '华东-上海', value: '华东-上海' },
      { text: '华南-广州', value: '华南-广州' }
    ]
  },
  linkTypeFilters: {
    type: Array,
    default: () => [
      { text: '七层防护', value: 'L7' },
      { text: '四层防护', value: 'L4' }
    ]
  },
  filteredLocation: {
    type: Array,
    default: () => []
  },
  filteredLinkType: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['filter-change', 'search', 'create', 'edit', 'quota', 'delete', 'page-change', 'page-size-change', 'sort-change'])

const inputValue = ref(props.search)
watch(() => props.search, val => { inputValue.value = val })
function onInput(val) {
  inputValue.value = val
}
function onSearch() {
  emits('search', inputValue.value)
}

// 机房过滤
const locationPopoverVisible = ref(false)
const locationFilterValue = ref([...props.filteredLocation])
watch(() => props.filteredLocation, val => { locationFilterValue.value = [...val] })
function resetLocationFilter() {
  locationFilterValue.value = []
}
function confirmLocationFilter() {
  locationPopoverVisible.value = false
  emits('filter-change', { location: [...locationFilterValue.value], linkType: [...linkTypeFilterValue.value] })
}

// 链路类型过滤
const linkTypePopoverVisible = ref(false)
const linkTypeFilterValue = ref([...props.filteredLinkType])
watch(() => props.filteredLinkType, val => { linkTypeFilterValue.value = [...val] })
function resetLinkTypeFilter() {
  linkTypeFilterValue.value = []
}
function confirmLinkTypeFilter() {
  linkTypePopoverVisible.value = false
  emits('filter-change', { location: [...locationFilterValue.value], linkType: [...linkTypeFilterValue.value] })
}

const mockRegions = [
  {
    id: 'GLOBAL',
    name: '全球',
    distributed: true,
    status: 'active'
  },
  {
    id: 'CHINA',
    name: '全国',
    distributed: true,
    status: 'active'
  },
  {
    id: 'REGION_001',
    name: '华东1（杭州）',
    distributed: false,
    status: 'active'
  },
  {
    id: 'REGION_002',
    name: '华东2（上海）',
    distributed: false,
    status: 'active'
  },
  {
    id: 'REGION_003',
    name: '华北1（北京）',
    distributed: false,
    status: 'active'
  },
  {
    id: 'REGION_004',
    name: '华北2（张家口）',
    distributed: false,
    status: 'active'
  },
  {
    id: 'REGION_005',
    name: '华南1（深圳）',
    distributed: false,
    status: 'active'
  },
  {
    id: 'REGION_006',
    name: '华南2（广州）',
    distributed: false,
    status: 'active'
  }
]

// 根据地域ID获取地域信息
const getRegionById = (regionId) => {
  return mockRegions.find(region => region.id === regionId) || null
}

// 获取地域名称
const getRegionName = (regionId) => {
  const region = getRegionById(regionId)
  return region ? region.name : '-'
}

// 获取是否分布式
const getDistributedStatus = (regionId) => {
  const region = getRegionById(regionId)
  return region ? region.distributed : false
}

const tableData = ref([
  {
    id: generateSnowflakeId(),
    name: '示例集群组1',
    region: 'GLOBAL',
    status: 'active',
    remark: '全球分布式集群组',
    createTime: '2024-01-01 10:00:00',
    createAccount: 'admin',
    updateTime: '2024-01-01 10:00:00',
    updateAccount: 'admin'
  },
  {
    id: generateSnowflakeId(),
    name: '示例集群组2',
    region: 'CHINA',
    status: 'active',
    remark: '全国分布式集群组',
    createTime: '2024-01-02 14:30:00',
    createAccount: 'admin',
    updateTime: '2024-01-02 14:30:00',
    updateAccount: 'admin'
  },
  {
    id: generateSnowflakeId(),
    name: '示例集群组3',
    region: 'REGION_001',
    status: 'disabled',
    remark: '杭州地区集群组',
    createTime: '2024-01-03 09:15:00',
    createAccount: 'admin',
    updateTime: '2024-01-03 09:15:00',
    updateAccount: 'admin'
  }
])
</script>

<style scoped>
.cluster-group-container {
  padding: 20px;
}

.search-card .card-header,
.table-card .card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 覆盖 Element Plus 默认样式，确保搜索框 append 按钮和图标在同一行 */
.el-input__append {
  padding: 0 10px;
}
</style> 