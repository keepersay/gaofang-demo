<template>
  <el-drawer :model-value="visible" :title="editData ? '编辑网池' : '新建网池'" size="50%" @close="$emit('close')">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="网池名称" prop="name">
        <el-input v-model="form.name" maxlength="32" />
      </el-form-item>
      <el-form-item label="协议族" prop="protocol">
        <el-radio-group v-model="form.protocol" @change="onProtocolChange">
          <el-radio label="IPV4">IPv4</el-radio>
          <el-radio label="IPV6">IPv6</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="区间列表" prop="ranges">
        <div class="ranges-container">
          <div v-for="(range, idx) in form.ranges" :key="idx" class="range-item">
            <el-input v-model="form.ranges[idx]" :placeholder="rangePlaceholder" />
            <el-button type="danger" size="small" circle @click="removeRange(idx)" class="remove-btn">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div v-if="form.ranges.length === 0" class="empty-ranges">
            <span class="text-gray-400">暂无区间，请添加</span>
          </div>
          <el-button type="primary" @click="addRange" size="small" class="add-btn">
            <el-icon><Plus /></el-icon> 添加区间
          </el-button>
          <div class="range-tips">支持单IP、IP区间、CIDR格式，例：192.168.1.1、192.168.1.1-192.168.1.100、192.168.1.0/24</div>
        </div>
      </el-form-item>
      <el-form-item label="Anycast">
        <el-switch v-model="form.isAnycast" @change="onAnycastChange" />
      </el-form-item>
      <el-form-item label="所属机房" prop="dataCenterId" v-if="!form.isAnycast">
        <el-select v-model="form.dataCenterId" placeholder="请选择机房">
          <el-option v-for="dc in dataCenters" :key="dc.id" :label="dc.name" :value="dc.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="ENABLED">启用</el-radio>
          <el-radio label="DISABLED">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" maxlength="128" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed, PropType } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';
import { isValidRange, isRangeOverlap } from '../utils/IpRangeUtils';
import { saveIpPool } from '../services/IpPoolService';

interface DataCenter {
  id: string;
  name: string;
}
interface IpPoolForm {
  name: string;
  protocol: 'IPV4' | 'IPV6';
  ranges: string[];
  dataCenterId: string | null;
  isAnycast: boolean;
  status: 'ENABLED' | 'DISABLED';
  remark: string;
  id?: string;
}

const props = defineProps({
  visible: Boolean,
  editData: Object as PropType<Partial<IpPoolForm> | null>,
  dataCenters: Array as PropType<DataCenter[]>
});
const emit = defineEmits(['close', 'refresh']);
const formRef = ref();
const form = ref<IpPoolForm>({
  name: '',
  protocol: 'IPV4',
  ranges: [],
  dataCenterId: null,
  isAnycast: false,
  status: 'ENABLED',
  remark: ''
});
const rules = {
  name: [{ required: true, message: '请输入网池名称', trigger: 'blur' }],
  protocol: [{ required: true, message: '请选择协议族', trigger: 'change' }],
  ranges: [{ required: true, validator: validateRanges, trigger: 'blur' }],
  dataCenterId: [{ required: true, message: '请选择机房', trigger: 'change', validator: validateDataCenter }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};
const rangePlaceholder = computed(() => form.value.protocol === 'IPV4' ? '如192.168.1.0/24' : '如2001:db8::/32');

watch(() => props.editData, (val) => {
  if (val) {
    form.value = { ...form.value, ...val };
  } else {
    form.value = {
      name: '',
      protocol: 'IPV4',
      ranges: [],
      dataCenterId: null,
      isAnycast: false,
      status: 'ENABLED',
      remark: ''
    };
  }
}, { immediate: true });

function addRange() {
  form.value.ranges.push('');
}
function removeRange(idx: number) {
  form.value.ranges.splice(idx, 1);
}
function onProtocolChange() {
  form.value.ranges = [];
}
function onAnycastChange(val: boolean) {
  if (val) form.value.dataCenterId = null;
}
function validateRanges(rule: unknown, value: string[], callback: (err?: Error) => void) {
  if (!value || value.length === 0) return callback(new Error('请至少添加一个区间'));
  
  // 过滤掉空字符串
  const nonEmptyRanges = value.filter(r => r && r.trim() !== '');
  if (nonEmptyRanges.length === 0) return callback(new Error('请至少添加一个有效区间'));
  
  const invalidRanges: string[] = [];
  
  for (const r of nonEmptyRanges) {
    if (!isValidRange(r, form.value.protocol)) {
      invalidRanges.push(r);
    }
  }
  
  if (invalidRanges.length > 0) {
    return callback(new Error(`以下区间格式有误: ${invalidRanges.join(', ')}`));
  }
  
  // 检查重叠（仅IPv4）
  if (form.value.protocol === 'IPV4') {
    try {
      for (let i = 0; i < nonEmptyRanges.length; i++) {
        for (let j = i + 1; j < nonEmptyRanges.length; j++) {
          if (isRangeOverlap(nonEmptyRanges[i], nonEmptyRanges[j], form.value.protocol)) {
            return callback(new Error(`区间 ${nonEmptyRanges[i]} 与 ${nonEmptyRanges[j]} 存在重叠`));
          }
        }
      }
    } catch (err) {
      console.error('检查重叠出错:', err);
      // 不阻止提交，只记录错误
    }
  }
  
  callback();
}
function validateDataCenter(rule: unknown, value: string, callback: (err?: Error) => void) {
  if (!form.value.isAnycast && !value) return callback(new Error('请选择机房'));
  callback();
}
function onSubmit() {
  (formRef.value as any).validate(async (valid: boolean) => {
    if (!valid) return;
    await saveIpPool(form.value);
    ElMessage.success('保存成功');
    emit('close');
    emit('refresh');
  });
}
</script>

<style scoped>
.ranges-container {
  width: 100%;
}
.range-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.range-item .el-input {
  flex: 1;
  margin-right: 8px;
}
.remove-btn {
  flex-shrink: 0;
}
.add-btn {
  margin-top: 8px;
}
.range-tips {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
.empty-ranges {
  padding: 8px 0;
  color: #909399;
}
.text-gray-400 {
  color: #909399;
}
</style> 