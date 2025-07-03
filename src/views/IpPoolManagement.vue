<template>
  <div class="ip-pool-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>网池</span>
          <el-button type="primary" @click="openModal()">新建网池</el-button>
        </div>
      </template>
      <!-- 搜索区域，仅保留网池名称 -->
      <div class="search-area">
        <el-form :inline="true" :model="filters">
          <el-form-item label="网池名称">
            <el-input v-model="filters.name" placeholder="请输入网池名称" clearable style="max-width: 220px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchList">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 表格区域 -->
      <el-table
        :data="list"
        style="width: 100%; min-height: 500px; margin-top: 20px;"
        border
        stripe
        max-height="700"
        :header-cell-style="{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }"
        row-class-name="dense-row"
      >
        <el-table-column prop="id" label="ID" width="180" fixed="left" />
        <el-table-column prop="name" label="网池名称" width="150">
          <template #default="scope">
            <el-tooltip effect="dark" :content="scope.row.name" placement="top">
              <span class="ellipsis-cell">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- 协议族表头单选过滤器 -->
        <el-table-column prop="protocol" label="协议族" width="120">
          <template #header>
            <span>协议族</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="protocolPopoverVisible"
            >
              <el-radio-group v-model="protocolFilterValue" @change="onProtocolFilterChange">
                <el-radio label="">全部</el-radio>
                <el-radio label="IPV4">IPv4</el-radio>
                <el-radio label="IPV6">IPv6</el-radio>
              </el-radio-group>
              <template #reference>
                <el-icon :color="protocolFilterValue ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            {{ scope.row.protocol === 'IPV4' ? 'IPv4' : 'IPv6' }}
          </template>
        </el-table-column>
        <!-- 机房表头多选过滤器 -->
        <el-table-column prop="dataCenterId" label="机房" width="140">
          <template #header>
            <span>机房</span>
            <el-popover
              placement="bottom"
              width="200"
              trigger="click"
              v-model:visible="dataCenterPopoverVisible"
            >
              <el-checkbox-group v-model="dataCenterFilterValue" @change="onDataCenterFilterChange">
                <el-checkbox v-for="dc in dataCenters" :key="dc.id" :label="dc.id">{{ dc.name }}</el-checkbox>
              </el-checkbox-group>
              <div class="mt-2 flex justify-end">
                <el-button size="small" @click="resetDataCenterFilter">重置</el-button>
                <el-button size="small" type="primary" @click="confirmDataCenterFilter">确定</el-button>
              </div>
              <template #reference>
                <el-icon :color="dataCenterFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <span>{{ getDataCenterName(scope.row.dataCenterId) }}</span>
          </template>
        </el-table-column>
        <!-- 状态表头多选过滤器 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #header>
            <span>状态</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="statusPopoverVisible"
            >
              <el-checkbox-group v-model="statusFilterValue" @change="onStatusFilterChange">
                <el-checkbox label="ENABLED">启用</el-checkbox>
                <el-checkbox label="DISABLED">禁用</el-checkbox>
              </el-checkbox-group>
              <div class="mt-2 flex justify-end">
                <el-button size="small" @click="resetStatusFilter">重置</el-button>
                <el-button size="small" type="primary" @click="confirmStatusFilter">确定</el-button>
              </div>
              <template #reference>
                <el-icon :color="statusFilterValue.length ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'danger'">
              {{ scope.row.status === 'ENABLED' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="区间数量" width="100">
          <template #default="scope">{{ scope.row.ranges.length }}</template>
        </el-table-column>
        <el-table-column label="网段列表" min-width="200">
          <template #default="scope">
            <el-popover
              placement="right"
              trigger="hover"
              :width="400"
            >
              <template #default>
                <div v-for="(range, index) in scope.row.ranges" :key="index" class="mb-1">
                  {{ range }}
                </div>
              </template>
              <template #reference>
                <div class="network-ranges">
                  <div v-for="(range, index) in scope.row.ranges" :key="index" class="range-item-row">
                    {{ range }}
                  </div>
                  <div v-if="scope.row.ranges.length === 0" class="text-gray-400">
                    无网段
                  </div>
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="已用/剩余IP" width="120">
          <template #default="scope">{{ scope.row.usedCount }}/{{ scope.row.availableCount }}</template>
        </el-table-column>
        <el-table-column prop="isAnycast" label="Anycast" width="80">
          <template #header>
            <span>Anycast</span>
            <el-popover
              placement="bottom"
              width="160"
              trigger="click"
              v-model:visible="anycastPopoverVisible"
            >
              <el-radio-group v-model="anycastFilterValue" @change="onAnycastFilterChange">
                <el-radio label="">全部</el-radio>
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
              <template #reference>
                <el-icon :color="anycastFilterValue !== '' ? '#409EFF' : '#909399'" class="ml-1 cursor-pointer"><Filter /></el-icon>
              </template>
            </el-popover>
          </template>
          <template #default="scope">
            <el-tag :type="scope.row.isAnycast ? 'success' : 'info'">{{ scope.row.isAnycast ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="添加/修改信息" min-width="180">
          <template #default="scope">
            <div>添加: {{ scope.row.createdAt }} / {{ scope.row.createdBy }}</div>
            <div>修改: {{ scope.row.updatedAt }} / {{ scope.row.updatedBy }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="openModal(scope.row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deletePool(scope.row)">删除</el-button>
            <el-button type="info" link size="small" @click="openAllocatedDrawer(scope.row)">已分配IP</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="text-gray-400 py-10 text-center">暂无数据</div>
        </template>
      </el-table>
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          :page-sizes="[10, 20, 50, 100]"
          @current-change="fetchList"
          @size-change="fetchList"
        />
      </div>
    </el-card>
    <IpPoolModal
      v-if="modalVisible"
      :visible="modalVisible"
      :editData="editData"
      :dataCenters="dataCenters"
      @close="handleModalClose"
      @refresh="handleModalRefresh"
    />
    <IpPoolAllocatedDrawer
      v-if="allocatedDrawerVisible"
      :visible="allocatedDrawerVisible"
      :pool="selectedPool"
      @close="allocatedDrawerVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Filter } from '@element-plus/icons-vue';
import IpPoolModal from './IpPoolModal.vue';
import IpPoolAllocatedDrawer from './IpPoolAllocatedDrawer.vue';
import { fetchIpPools, fetchDataCenters, deleteIpPool as apiDeleteIpPool, saveIpPool } from '../services/IpPoolService';

interface DataCenter {
  id: string;
  name: string;
}
interface IpPool {
  id: string;
  name: string;
  protocol: 'IPV4' | 'IPV6';
  ranges: string[];
  dataCenterId: string | null;
  isAnycast: boolean;
  status: 'ENABLED' | 'DISABLED';
  remark: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  usedCount: number;
  availableCount: number;
}

const filters = reactive({
  protocol: '',
  dataCenterId: '',
  status: '',
  name: '',
  isAnycast: ''
});
const list = ref<IpPool[]>([]);
const dataCenters = ref<DataCenter[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});
const modalVisible = ref(false);
const editData = ref<IpPool | null>(null);
const allocatedDrawerVisible = ref(false);
const selectedPool = ref<IpPool | null>(null);

// 表头过滤相关
const protocolPopoverVisible = ref(false);
const protocolFilterValue = ref('');
const dataCenterPopoverVisible = ref(false);
const dataCenterFilterValue = ref<string[]>([]);
const statusPopoverVisible = ref(false);
const statusFilterValue = ref<string[]>([]);
const anycastPopoverVisible = ref(false);
const anycastFilterValue = ref('');

function getDataCenterName(id: string) {
  const dc = dataCenters.value.find(dc => dc.id === id);
  return dc ? dc.name : '';
}

function onProtocolFilterChange() {
  filters.protocol = protocolFilterValue.value;
  fetchList();
}
function onDataCenterFilterChange() {
  // 不自动刷新，等用户点确定
}
function confirmDataCenterFilter() {
  filters.dataCenterId = dataCenterFilterValue.value.join(',');
  fetchList();
  dataCenterPopoverVisible.value = false;
}
function resetDataCenterFilter() {
  dataCenterFilterValue.value = [];
  filters.dataCenterId = '';
  fetchList();
  dataCenterPopoverVisible.value = false;
}
function onStatusFilterChange() {
  // 不自动刷新，等用户点确定
}
function confirmStatusFilter() {
  filters.status = statusFilterValue.value.join(',');
  fetchList();
  statusPopoverVisible.value = false;
}
function resetStatusFilter() {
  statusFilterValue.value = [];
  filters.status = '';
  fetchList();
  statusPopoverVisible.value = false;
}
function onAnycastFilterChange() {
  filters.isAnycast = anycastFilterValue.value !== '' ? String(anycastFilterValue.value) : '';
  fetchList();
  anycastPopoverVisible.value = false;
}

async function fetchList() {
  // 多选过滤参数处理
  const queryFilters = {
    ...filters,
    dataCenterId: filters.dataCenterId,
    status: filters.status
  };
  const { list: l, total } = await fetchIpPools(queryFilters, pagination);
  list.value = l;
  pagination.total = total;
}
async function fetchDataCentersList() {
  dataCenters.value = await fetchDataCenters();
}
function resetFilters() {
  filters.name = '';
  protocolFilterValue.value = '';
  dataCenterFilterValue.value = [];
  statusFilterValue.value = [];
  anycastFilterValue.value = '';
  filters.protocol = '';
  filters.dataCenterId = '';
  filters.status = '';
  filters.isAnycast = '';
  fetchList();
}
function openModal(row: IpPool | null = null) {
  editData.value = row;
  modalVisible.value = true;
}
async function deletePool(row: IpPool) {
  await ElMessageBox.confirm('确定要删除该网池吗？', '提示', { type: 'warning' });
  await apiDeleteIpPool(row.id);
  ElMessage.success('删除成功');
  fetchList();
}
function openAllocatedDrawer(row: IpPool) {
  selectedPool.value = row;
  allocatedDrawerVisible.value = true;
}
function handleModalClose() {
  modalVisible.value = false;
}
function handleModalRefresh() {
  fetchList();
}
onMounted(() => {
  fetchDataCentersList();
  fetchList();
});
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
}
.box-card {
  /* 移除外边距，与逻辑集群页面保持一致 */
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 500;
}
.search-area {
  margin-bottom: 12px;
}
.ellipsis-cell {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.dense-row {
  height: 38px;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
}
.text-gray-400 {
  color: #bfbfbf;
}
.py-10 {
  padding-top: 40px;
  padding-bottom: 40px;
}
.mb-1 {
  margin-bottom: 4px;
}
.network-ranges {
  max-height: 80px;
  overflow-y: auto;
  padding: 2px 0;
}
.range-item-row {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  font-size: 13px;
}
</style> 