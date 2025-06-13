<template>
  <div>
    <el-row align="middle" :gutter="16" class="mb-4">
      <el-col :span="8">
        <el-input
          :model-value="inputValue"
          placeholder="输入用户名, 姓名, 手机号 搜索..."
          clearable
          style="max-width: 380px;"
          @input="onInput"
          @keyup.enter="onSearch"
        >
          <template #append>
            <el-button @click="onSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="16" class="flex justify-end">
        <el-button type="primary" @click="$emit('create')">创建用户</el-button>
      </el-col>
    </el-row>
    <el-table
      :data="data"
      border
      stripe
      :loading="loading"
      @sort-change="$emit('sort-change', $event)"
      style="min-height: 320px; margin-top: 20px;"
      max-height="500"
    >
      <el-table-column prop="id" label="用户ID" min-width="100" />
      <el-table-column prop="username" label="用户" min-width="120" />
      <el-table-column prop="name" label="姓名" min-width="100" />
      <el-table-column prop="email" label="邮箱" min-width="150" />
      <el-table-column prop="phone" label="手机" min-width="120" />
      <el-table-column
        prop="role"
        min-width="120"
        column-key="role"
      >
        <template #header>
          <span>角色</span>
          <el-popover
            placement="bottom"
            width="160"
            trigger="click"
            v-model:visible="rolePopoverVisible"
          >
            <div>
              <el-checkbox-group v-model="roleFilterValue">
                <el-checkbox v-for="item in roleFilters" :key="item.value" :value="item.value">{{ item.text }}</el-checkbox>
              </el-checkbox-group>
              <div class="mt-2 flex justify-end">
                <el-button size="small" @click="resetRoleFilter">重置</el-button>
                <el-button size="small" type="primary" @click="confirmRoleFilter">确定</el-button>
              </div>
            </div>
            <template #reference>
              <el-icon :color="roleFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          {{ row.role === 'admin' ? '管理员' : '只读用户' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        min-width="100"
        column-key="status"
      >
        <template #header>
          <span>状态</span>
          <el-popover
            placement="bottom"
            width="160"
            trigger="click"
            v-model:visible="statusPopoverVisible"
          >
            <div>
              <el-checkbox-group v-model="statusFilterValue">
                <div v-for="item in statusFilters" :key="item.value" style="margin-bottom: 5px;">
                  <el-checkbox :value="item.value">{{ item.text }}</el-checkbox>
                </div>
              </el-checkbox-group>
              <div class="mt-2 flex justify-end">
                <el-button size="small" @click="resetStatusFilter">重置</el-button>
                <el-button size="small" type="primary" @click="confirmStatusFilter">确定</el-button>
              </div>
            </div>
            <template #reference>
              <el-icon :color="statusFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
            </template>
          </el-popover>
        </template>
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" min-width="100" />
      <el-table-column prop="createdAt" label="创建时间" min-width="160" sortable />
      <el-table-column prop="notes" label="备注" min-width="120" />
      <el-table-column label="操作" min-width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="$emit('edit', row)">编辑</el-button>
          <el-button 
            :type="row.status === 'active' ? 'danger' : 'success'" 
            link size="small" 
            @click="$emit('disable_enable', row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link size="small" @click="$emit('delete', row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="text-gray-400 py-10 text-center">暂无数据</div>
      </template>
    </el-table>
    <div class="mt-6 w-full" style="text-align: right;">
      <el-pagination
        background
        layout="sizes, prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="pageSizeOptions"
        @current-change="$emit('page-change', $event)"
        @size-change="$emit('size-change', $event)"
      />
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
  searchQuery: String,
  loading: Boolean,
  roleFilters: {
    type: Array,
    default: () => [
      { text: '管理员', value: 'admin' },
      { text: '只读用户', value: 'readonly' }
    ]
  },
  statusFilters: {
    type: Array,
    default: () => [
      { text: '正常', value: 'active' },
      { text: '禁用', value: 'disabled' }
    ]
  },
  filteredRole: {
    type: Array,
    default: () => []
  },
  filteredStatus: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits([
  'create',
  'edit',
  'disable_enable',
  'delete',
  'search',
  'page-change',
  'size-change',
  'filter-change',
  'sort-change'
])

// 搜索
const inputValue = ref(props.searchQuery)
watch(() => props.searchQuery, val => { inputValue.value = val })
function onInput(val) {
  inputValue.value = val
  console.log('UserTable - Input changed:', val);
}
function onSearch() {
  console.log('UserTable - Searching for:', inputValue.value);
  emits('search', inputValue.value)
}

// 角色过滤
const rolePopoverVisible = ref(false)
const roleFilterValue = ref([...props.filteredRole])
watch(() => props.filteredRole, val => { roleFilterValue.value = [...val] })
function resetRoleFilter() {
  roleFilterValue.value = []
}
function confirmRoleFilter() {
  rolePopoverVisible.value = false
  emits('filter-change', { role: [...roleFilterValue.value], status: [...statusFilterValue.value] })
}

// 状态过滤
const statusPopoverVisible = ref(false)
const statusFilterValue = ref([...props.filteredStatus])
watch(() => props.filteredStatus, val => { statusFilterValue.value = [...val] })
function resetStatusFilter() {
  statusFilterValue.value = []
}
function confirmStatusFilter() {
  statusPopoverVisible.value = false
  emits('filter-change', { role: [...roleFilterValue.value], status: [...statusFilterValue.value] })
}
</script>

<style scoped>
.text-gray-500 {
  color: #6b7280;
}
</style> 