<template>
  <el-drawer :model-value="visible" title="已分配IP列表" size="60%" @close="$emit('close')">
    <div class="pool-info" v-if="pool">
      <h3>网池信息</h3>
      <div class="info-row">
        <span class="info-label">ID:</span> {{ pool.id }}
        <span class="info-label ml-4">名称:</span> {{ pool.name }}
        <span class="info-label ml-4">协议族:</span> {{ pool.protocol === 'IPV4' ? 'IPv4' : 'IPv6' }}
      </div>
      <div class="info-row">
        <span class="info-label">网段列表:</span>
      </div>
      <div class="ranges-list">
        <el-tag v-for="(range, index) in pool.ranges" :key="index" class="range-tag" size="small">{{ range }}</el-tag>
        <span v-if="pool.ranges.length === 0" class="text-gray-400">无网段</span>
      </div>
    </div>
    <el-divider />
    <el-form :inline="true" :model="filters" style="margin-bottom: 12px;">
      <el-form-item label="IP地址">
        <el-input v-model="filters.ip" placeholder="支持模糊查询" />
      </el-form-item>
      <el-form-item label="实例ID">
        <el-input v-model="filters.instanceId" placeholder="支持模糊查询" />
      </el-form-item>
      <el-form-item label="客户ID">
        <el-input v-model="filters.customerId" placeholder="支持模糊查询" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="list" style="width: 100%" row-key="ip">
      <el-table-column prop="segmentId" label="网段ID" min-width="120" />
      <el-table-column prop="ip" label="IP地址" min-width="120" />
      <el-table-column prop="ipInt" label="IP地址int" min-width="120" />
      <el-table-column prop="clusterName" label="所属逻辑集群" min-width="120" />
      <el-table-column prop="instanceId" label="业务实例ID" min-width="120" />
      <el-table-column prop="customerId" label="所属客户ID" min-width="120" />
      <el-table-column prop="remark" label="备注" min-width="120" />
    </el-table>
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, prev, pager, next, sizes"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="fetchList"
      @size-change="fetchList"
      style="margin-top: 16px; text-align: right;"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, PropType } from 'vue';
import { fetchAllocatedIPs } from '../services/IpPoolService';

interface AllocatedIP {
  segmentId: string;
  ip: string;
  ipInt: number;
  clusterName: string;
  instanceId: string;
  customerId: string;
  remark: string;
}
interface IpPool {
  id: string;
  name: string;
  protocol: string;
  ranges: string[];
}

const props = defineProps({
  visible: Boolean,
  pool: Object as PropType<IpPool | null>
});
const filters = ref<{ ip: string; instanceId: string; customerId: string }>({
  ip: '',
  instanceId: '',
  customerId: ''
});
const list = ref<AllocatedIP[]>([]);
const pagination = ref<{ page: number; pageSize: number; total: number }>({
  page: 1,
  pageSize: 20,
  total: 0
});

async function fetchList() {
  if (!props.pool) return;
  const { list: l, total, pool: poolData } = await fetchAllocatedIPs(props.pool.id, filters.value, pagination.value);
  list.value = l;
  pagination.value.total = total;
  if (poolData && poolData.ranges) {
    Object.assign(props.pool, poolData);
  }
}
function resetFilters() {
  filters.value = { ip: '', instanceId: '', customerId: '' };
  fetchList();
}
watch(() => props.pool, (val) => {
  if (val) fetchList();
});
</script>

<style scoped>
.pool-info {
  padding: 0 0 16px;
}
.info-row {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.info-label {
  font-weight: bold;
  margin-right: 4px;
}
.ml-1 {
  margin-left: 4px;
}
.ml-4 {
  margin-left: 16px;
}
.ranges-list {
  margin: 4px 0 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.range-tag {
  margin-bottom: 4px;
  display: inline-block;
}
.text-gray-400 {
  color: #909399;
}
</style> 