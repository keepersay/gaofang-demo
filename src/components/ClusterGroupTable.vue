<template>
  <div>
    <el-row justify="space-between" align="middle" class="mb-4">
      <el-col :span="12">
        <div>
          <h2 class="text-2xl font-bold">逻辑集群组管理</h2>
          <p class="text-gray-500 mt-1">通过编排底层网元集群，创建标准化的服务交付单元。</p>
        </div>
      </el-col>
      <el-col :span="12" class="flex justify-end items-center">
        <el-button type="primary" @click="$emit('create')">新建逻辑集群组</el-button>
      </el-col>
    </el-row>
    <el-row class="mb-4" align="middle" :gutter="16">
      <el-col :span="8">
        <el-input
          :model-value="search"
          placeholder="按逻辑集群组名称或ID搜索..."
          clearable
          style="max-width: 320px;"
          @input="onInput"
          @keyup.enter="onSearch"
        >
          <template #append>
            <el-button icon="el-icon-search" @click="onSearch">搜索</el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="16"></el-col>
    </el-row>
    <el-table
      :data="data"
      border
      stripe
      :loading="loading"
      @sort-change="$emit('sort-change', $event)"
      style="min-height: 320px;"
    >
      <el-table-column label="组名称 / ID" min-width="180">
        <template #default="{ row }">
          <div class="font-medium">{{ row.name }}</div>
          <div class="text-xs text-gray-500">{{ row.id }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="location"
        min-width="140"
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
                <el-checkbox v-for="item in locationFilters" :key="item.value" :value="item.value">{{ item.text }}</el-checkbox>
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
                <el-checkbox v-for="item in linkTypeFilters" :key="item.value" :value="item.value">{{ item.text }}</el-checkbox>
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
    <div class="mt-4 flex justify-end">
      <el-pagination
        background
        layout="sizes, prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="pageSizeOptions"
        @current-change="$emit('page-change', $event)"
        @size-change="$emit('page-size-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Filter } from '@element-plus/icons-vue'
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
</script>

<style scoped>
.text-gray-500 {
  color: #6b7280;
}
</style> 